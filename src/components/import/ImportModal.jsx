import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, Loader2, Table, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { parseCSV } from '../../lib/export';
import { bulkAddTransactions } from '../../hooks/useData';

const todayISO = () => format(new Date(), 'yyyy-MM-dd');

function normalizeDate(value) {
  const s = String(value || '').trim();
  if (!s) return todayISO();

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = `20${y}`;
    if (+mo > 12 && +d <= 12) [d, mo] = [mo, d];
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const parsed = new Date(s);
  if (!isNaN(parsed)) return format(parsed, 'yyyy-MM-dd');
  return todayISO();
}

function resolveCategory(categories, name, type) {
  const wanted = String(name || '').toLowerCase();
  const exact = categories.find((c) => c.name.toLowerCase() === wanted);
  if (exact) return exact.name;
  const other = categories.find((c) => c.type === type && c.name.toLowerCase() === 'other');
  if (other) return other.name;
  const sameType = categories.find((c) => c.type === type);
  return sameType ? sameType.name : String(name || 'Other');
}

let rowSeq = 0;

export default function ImportModal({ isOpen, onClose, categories }) {
  const [step, setStep] = useState('source');
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const csvRef = useRef(null);

  const reset = () => {
    setStep('source');
    setError('');
    setRows([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toRow = (r) => {
    const hint = r.category || r.categoryHint || 'Other';
    return {
      id: rowSeq++,
      include: true,
      date: normalizeDate(r.date),
      amount: Number(r.amount) || 0,
      type: r.type === 'income' ? 'income' : 'expense',
      category: resolveCategory(categories, hint, r.type === 'income' ? 'income' : 'expense'),
    };
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setRows([]);
    setStep('scanning');
    try {
      let parsed = parseCSV(await file.text());

      parsed = parsed.filter((r) => Number(r.amount) > 0);
      if (!parsed.length) {
        throw new Error('No transactions found. Check that the file has date and amount columns.');
      }
      setRows(parsed.map(toRow));
      setStep('confirm');
    } catch (e) {
      setError(e?.message || 'Could not read this file.');
      setStep('source');
    }
  };

  const updateRow = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id) => setRows((rs) => rs.filter((r) => r.id !== id));

  const toggleType = (row) => {
    const next = row.type === 'expense' ? 'income' : 'expense';
    const pool = categories.filter((c) => c.type === next);
    const valid = pool.some((c) => c.name === row.category);
    const category = valid
      ? row.category
      : (pool.find((c) => c.name.toLowerCase() === 'other') || pool[0] || {}).name || row.category;
    updateRow(row.id, { type: next, category });
  };

  const selected = rows.filter((r) => r.include && r.amount > 0);

  const doImport = async () => {
    if (!selected.length) return;
    setBusy(true);
    setError('');
    try {
      await bulkAddTransactions(
        selected.map((r) => ({
          date: new Date(r.date).toISOString(),
          type: r.type,
          category: r.category,
          amount: Number(r.amount),
          description: '',
          notes: '',
        })),
      );
      handleClose();
    } catch (e) {
      setError(`Import failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) handleFile(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Data" maxWidth="max-w-lg">
      <input ref={csvRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={pick} />

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 'source' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Import a CSV export — nothing is uploaded; everything is read on your device.
          </p>
          <button
            onClick={() => csvRef.current?.click()}
            className="w-full p-4 rounded-2xl border flex items-center gap-3 transition-all duration-200 hover:bg-primary-500/5 active:scale-95"
            style={{ borderColor: 'var(--border-solid)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--input-bg)' }}>
              <Table size={20} style={{ color: 'var(--color-primary-600)' }} />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block">CSV file</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Exported file — date, type, category, amount</span>
            </div>
          </button>
        </div>
      )}

      {step === 'scanning' && (
        <div className="py-6 flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary-600)' }} />
          <div className="text-center">
            <p className="text-sm font-semibold">Reading CSV</p>
          </div>
          <button
            onClick={() => { setStep('source'); }}
            className="text-xs font-semibold transition-all duration-150 hover:opacity-70 active:scale-95"
            style={{ color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Review the {rows.length} detected transaction{rows.length === 1 ? '' : 's'} — uncheck anything wrong, then import.
          </p>

          <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-0.5">
            {rows.map((row) => (
              <div key={row.id} className="p-2.5 rounded-xl space-y-2" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={row.include}
                    onChange={(e) => updateRow(row.id, { include: e.target.checked })}
                    className="w-4 h-4 accent-primary-500 flex-shrink-0"
                  />
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateRow(row.id, { date: normalizeDate(e.target.value) })}
                    className="input flex-1 min-w-0 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, { amount: parseFloat(e.target.value) || 0 })}
                    className="input w-24 text-xs text-right"
                  />
                  <button
                    onClick={() => removeRow(row.id)}
                    aria-label="Remove row"
                    className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-150 active:scale-90 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <div className="flex rounded-lg overflow-hidden border flex-shrink-0" style={{ borderColor: 'var(--border-solid)' }}>
                    {['expense', 'income'].map((t) => (
                      <button
                        key={t}
                        onClick={() => row.type !== t && toggleType(row)}
                        className={`px-2.5 py-1 text-[11px] font-bold transition-all duration-150 ${
                          row.type === t ? 'bg-primary-500 text-white' : 'hover:bg-primary-500/10'
                        }`}
                        style={row.type !== t ? { color: 'var(--text-muted)' } : {}}
                      >
                        {t === 'expense' ? 'Out' : 'In'}
                      </button>
                    ))}
                  </div>
                  <select
                    value={row.category}
                    onChange={(e) => updateRow(row.id, { category: e.target.value })}
                    className="input flex-1 min-w-0 text-xs cursor-pointer"
                  >
                    {categories
                      .filter((c) => c.type === row.type)
                      .map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    {!categories.some((c) => c.type === row.type && c.name === row.category) && (
                      <option value={row.category}>{row.category}</option>
                    )}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-solid)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              {selected.length} of {rows.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('source')}
                className="p-2 rounded-xl border transition-all duration-150 hover:bg-primary-500/5 active:scale-95"
                style={{ borderColor: 'var(--border-solid)', color: 'var(--text-muted)' }}
                aria-label="Back"
              >
                <ArrowLeft size={15} />
              </button>
              <button onClick={doImport} disabled={!selected.length || busy} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
                {busy ? 'Importing…' : `Import ${selected.length || ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
