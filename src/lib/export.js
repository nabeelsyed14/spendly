import { format } from 'date-fns';

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
      t.amount.toFixed(2),
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCSV(transactions, filename = 'spendly-export.csv') {
  const csv = transactionsToCSV(transactions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
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
    headers.forEach((h, i) => { row[h] = values[i] || ''; });

    return {
      type: row.type || 'expense',
      category: row.category || 'Other',
      amount: parseFloat(row.amount) || 0,
      date: row.date || new Date().toISOString(),
      description: row.description || '',
      notes: row.notes || '',
    };
  }).filter(t => t.amount > 0);
}
