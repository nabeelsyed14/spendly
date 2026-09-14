import { useState } from 'react';
import { format } from 'date-fns';
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

  const inputStyle = {
    background: 'var(--bg)',
    color: 'var(--text)',
    borderColor: 'var(--border)',
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={editing ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'var(--bg)' }}>
          {['expense', 'income'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategory(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                type === t
                  ? t === 'expense'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25'
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-sm'
              }`}
              style={type !== t ? { color: 'var(--text-muted)' } : {}}
            >
              {t === 'expense' ? '💸 Expense' : '💰 Income'}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: 'var(--text-muted)' }}>
              {currency.symbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl border text-xl font-bold outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
              style={inputStyle}
              required
            />
          </div>
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Spending Source</label>
            <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'var(--bg)' }}>
              {[
                { value: 'income', label: 'From Income', emoji: '💵' },
                { value: 'savings', label: 'From Savings', emoji: '🏦' },
              ].map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSource(s.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    source === s.value
                      ? s.value === 'income'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                      : 'text-sm'
                  }`}
                  style={source !== s.value ? { color: 'var(--text-muted)' } : {}}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filtered.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                className={`group flex flex-col items-center gap-1.5 p-2.5 rounded-2xl text-[10px] font-medium transition-all duration-200 border ${
                  category === c.name ? 'ring-2 ring-primary-500 scale-[1.03] shadow-md' : 'card-hover'
                }`}
                style={{ ...inputStyle, borderColor: category === c.name ? c.color + '60' : 'var(--border)' }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-transform group-hover:scale-110"
                  style={{ background: c.color + '18' }}
                >
                  {getCategoryEmoji(c.icon)}
                </span>
                <span className="truncate w-full text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What was this for?"
            className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional details..."
            rows={2}
            className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary-500/30 transition-all resize-none text-sm"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transition-all active:scale-[0.98]"
        >
          {editing ? 'Save Changes' : 'Add Transaction'}
        </button>
      </form>
    </Modal>
  );
}

function getCategoryEmoji(iconName) {
  const map = {
    UtensilsCrossed: '🍔', Home: '🏠', Car: '🚗', ShoppingCart: '🛒', Film: '🎬',
    ShoppingBag: '👕', Heart: '💊', CreditCard: '📱', BookOpen: '📚', Gift: '🎁',
    Zap: '⚡', MoreHorizontal: '💰', Briefcase: '💼', TrendingUp: '📈', Laptop: '💻',
  };
  return map[iconName] || '📌';
}
