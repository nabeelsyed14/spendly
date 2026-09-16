import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
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
    return cat?.color || '#737373';
  };

  const getCategoryIcon = (catName) => {
    const cat = categories.find(c => c.name === catName);
    const Icon = LucideIcons[cat?.icon] || LucideIcons.MoreHorizontal;
    return <Icon size={18} />;
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

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="input w-full !pl-9 pr-3 py-2.5"
          />
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          {['all', 'expense', 'income'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 active:scale-[0.97] ${
                filterType === t ? 'bg-primary-500 text-white shadow-md' : ''
              }`}
              style={filterType !== t ? { color: 'var(--text-muted)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center justify-center gap-1.5 px-4 py-3 btn-primary text-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--input-bg)' }}>
            <Plus size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-semibold mb-1.5">No transactions yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tap "Add" to get started</p>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([dateKey, items], groupIdx) => {
          const dayTotal = items.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0);
          return (
            <div key={dateKey} className={`animate-slide-up stagger-${Math.min(groupIdx + 1, 6)}`}>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(dateKey), 'EEEE, MMM d')}
                </p>
                <p className={`text-sm font-semibold tabular-nums ${dayTotal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {dayTotal >= 0 ? '+' : ''}{formatAmount(dayTotal)}
                </p>
              </div>
              <div className="space-y-1">
                {items.map(t => (
                  <div
                    key={t.id}
                    className="group card p-4 flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ background: getCategoryColor(t.category) + '12', color: getCategoryColor(t.category) }}
                    >
                      {getCategoryIcon(t.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-base font-medium truncate">{t.category}</p>
                        {t.type === 'expense' && t.source === 'savings' && (
                          <span className="tag bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            savings
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold tabular-nums ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                      </p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => { setEditing(t); setShowForm(true); }}
                        className="p-1.5 rounded-lg transition-all duration-150 hover:bg-primary-500/10 active:scale-95"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg transition-all duration-150 hover:bg-red-500/10 text-red-500 active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
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
