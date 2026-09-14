import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import TransactionForm from './TransactionForm';
import { useTransactions, useCategories, addTransaction, updateTransaction, deleteTransaction } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';

export default function TransactionList() {
  const transactions = useTransactions();
  const categories = useCategories();
  const { formatAmount } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = transactions.filter(t => {
    const matchSearch = !search ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.notes?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  const grouped = {};
  filtered.forEach(t => {
    const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(t);
  });

  const getCategoryColor = (catName) => {
    const cat = categories.find(c => c.name === catName);
    return cat?.color || '#71717a';
  };

  const getCategoryEmoji = (catName) => {
    const cat = categories.find(c => c.name === catName);
    const map = {
      UtensilsCrossed: '🍔', Home: '🏠', Car: '🚗', ShoppingCart: '🛒', Film: '🎬',
      ShoppingBag: '👕', Heart: '💊', CreditCard: '📱', BookOpen: '📚', Gift: '🎁',
      Zap: '⚡', MoreHorizontal: '💰', Briefcase: '💼', TrendingUp: '📈', Laptop: '💻',
    };
    return map[cat?.icon] || '📌';
  };

  const handleSave = async (data) => {
    if (editing) {
      await updateTransaction(editing.id, data);
    } else {
      await addTransaction(data);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const inputStyle = {
    background: 'var(--bg)',
    color: 'var(--text)',
    borderColor: 'var(--border)',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary-500/30 text-sm transition-all"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'expense', 'income'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-3 rounded-2xl text-sm font-semibold capitalize transition-all border ${
                filterType === t ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25' : ''
              }`}
              style={filterType !== t ? inputStyle : {}}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold shadow-lg shadow-primary-600/25 hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">💸</span>
          <p className="font-semibold text-lg mb-1">No transactions yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tap "Add" to get started tracking</p>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(grouped).map(([dateKey, items]) => {
          const dayTotal = items.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0);
          return (
            <div key={dateKey}>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(dateKey), 'EEEE, MMM d')}
                </p>
                <p className={`text-xs font-bold tabular-nums ${dayTotal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {dayTotal >= 0 ? '+' : ''}{formatAmount(dayTotal)}
                </p>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((t, i) => (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative flex items-center gap-3 p-3.5 rounded-2xl card card-hover overflow-hidden"
                      style={{ background: 'var(--surface)' }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ background: getCategoryColor(t.category) }}
                      />
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ml-1"
                        style={{ background: getCategoryColor(t.category) + '15' }}
                      >
                        {getCategoryEmoji(t.category)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold truncate">{t.category}</p>
                          {t.type === 'expense' && t.source === 'savings' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
                              savings
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 mr-1">
                        <p className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                        </p>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditing(t); setShowForm(true); }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <TransactionForm
          editing={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
