import { useState } from 'react';
import { format } from 'date-fns';
import * as LucideIcons from 'lucide-react';
import Modal from '../ui/Modal';
import { useCategories } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';

export default function TransactionForm({ onSave, editing = null, onClose }) {
  const categories = useCategories();
  const { currency } = useCurrency();
  const [type, setType] = useState(editing?.type || 'expense');
  const [amount, setAmount] = useState(editing?.amount?.toString() || '');
  const [category, setCategory] = useState(editing?.category || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [date, setDate] = useState(
    editing?.date ? format(new Date(editing.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [notes, setNotes] = useState(editing?.notes || '');
  const [source, setSource] = useState(editing?.source || 'income');

  const filtered = categories.filter(c => c.type === type);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;
    onSave({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date).toISOString(),
      notes,
      source: type === 'income' ? 'income' : source,
    });
    if (!editing) {
      setAmount('');
      setCategory('');
      setDescription('');
      setNotes('');
      setSource('income');
    }
  };

  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName] || LucideIcons.MoreHorizontal;
    return <Icon size={18} />;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={editing ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="animate-slide-up stagger-1 flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          {['expense', 'income'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategory(''); }}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] capitalize ${
                type === t
                  ? t === 'expense'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-emerald-500 text-white shadow-md'
                  : ''
              }`}
              style={type !== t ? { color: 'var(--text-muted)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="animate-slide-up stagger-2">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              {currency.symbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="input w-full !pl-11 pr-3 py-3 text-lg font-bold"
              required
            />
          </div>
        </div>

        {type === 'expense' && (
          <div className="animate-slide-up stagger-3">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Spending Source</label>
            <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              {[
                { value: 'income', label: 'From Income' },
                { value: 'savings', label: 'From Savings' },
              ].map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSource(s.value)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                    source === s.value
                      ? s.value === 'income'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-amber-500 text-white shadow-md'
                      : ''
                  }`}
                  style={source !== s.value ? { color: 'var(--text-muted)' } : {}}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="animate-slide-up stagger-4">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {filtered.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                  category === c.name ? 'bg-primary-500/10 glow-sm' : 'hover:bg-primary-500/5'
                }`}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: c.color + '15', color: c.color }}
                >
                  {getIcon(c.icon)}
                </span>
                <span className="w-full text-center leading-tight text-xs">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="animate-slide-up stagger-5">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input w-full"
          />
        </div>

        <div className="animate-slide-up stagger-5">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What was this for?"
            className="input w-full"
          />
        </div>

        <div className="animate-slide-up stagger-6">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional details..."
            rows={2}
            className="input w-full resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 btn-primary font-semibold"
        >
          {editing ? 'Save Changes' : 'Add Transaction'}
        </button>
      </form>
    </Modal>
  );
}
