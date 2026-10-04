import { format } from 'date-fns';
import { Capacitor, registerPlugin } from '@capacitor/core';

const DownloadsExport = registerPlugin('DownloadsExport');

export function transactionsToCSV(transactions) {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Notes'];
  const rows = transactions.map(t => {
    let dateStr;
    try {
      const d = typeof t.date === 'string' ? new Date(t.date) : t.date;
      dateStr = (d instanceof Date && !isNaN(d)) ? format(d, 'yyyy-MM-dd') : String(t.date || '');
    } catch {
      dateStr = String(t.date || '');
    }
    return [
      dateStr,
      t.type,
      t.category,
      Number(t.amount || 0).toFixed(2),
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Returns where the file was saved (e.g. 'Downloads') on native platforms,
// or null on web where the browser handles the download itself.
export async function downloadCSV(transactions, filename = 'spendly-export.csv') {
  const csv = transactionsToCSV(transactions);

  if (Capacitor.isNativePlatform()) {
    // Android WebView has no download listener, so blob anchors are a no-op —
    // a small native plugin writes into MediaStore.Downloads instead.
    await DownloadsExport.saveCsv({ filename, data: csv });
    return 'Downloads';
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return null;
}

const normalizeHeader = (h) => h.replace(/\(.*?\)/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

const findValue = (row, key) => {
  if (row[key]) return row[key];
  const hit = Object.entries(row).find(([k]) => k.startsWith(key));
  return hit ? hit[1] : '';
};

export function parseCSV(text) {
  const lines = text.trim().replace(/^\uFEFF/, '').split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(normalizeHeader);
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { values.push(current); current = ''; continue; }
      current += char;
    }
    values.push(current);

    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });

    const type = findValue(row, 'type').toLowerCase();
    return {
      type: type === 'income' ? 'income' : 'expense',
      category: findValue(row, 'category') || 'Other',
      amount: Math.abs(parseFloat(findValue(row, 'amount').replace(/[^\d.-]/g, ''))) || 0,
      date: findValue(row, 'date') || new Date().toISOString(),
      description: findValue(row, 'description'),
      notes: findValue(row, 'notes'),
    };
  }).filter(t => t.amount > 0);
}
