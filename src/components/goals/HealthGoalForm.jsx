/**
 * Shared HealthGoalForm — previously copy-pasted identically in GoalsPage and HealthScore.
 * Single source of truth for the health goal create/edit modal.
 */
import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { addHealthGoal, updateHealthGoal } from '../../hooks/useData';
import Modal from '../ui/Modal';

export const GOAL_TYPES = [
  { value: 'expense', label: 'Spending', icon: TrendingDown },
  { value: 'income', label: 'Earnings', icon: TrendingUp },
];

const EXPENSE_PRESETS = [
  { name: 'Food budget', category: 'Food & Dining', target: 500 },
  { name: 'Transport limit', category: 'Transport', target: 200 },
  { name: 'Shopping cap', category: 'Shopping', target: 300 },
  { name: 'Entertainment limit', category: 'Entertainment', target: 150 },
];

const INCOME_PRESETS = [
  { name: 'Monthly earnings', category: '', target: 3000 },
  { name: 'Side income', category: 'Freelance', target: 500 },
  { name: 'Investment returns', category: 'Investments', target: 200 },
];

export default function HealthGoalForm({ editing, categories, onClose }) {
  const { currency } = useCurrency();
  const [name, setName] = useState(editing?.name || '');
  const [type, setType] = useState(editing?.type || 'expense');
  const [category, setCategory] = useState(editing?.category || '');
  const [targetAmount, setTargetAmount] = useState(editing?.targetAmount?.toString() || '');

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const presets = type === 'expense' ? EXPENSE_PRESETS : INCOME_PRESETS;

  const handlePreset = (preset) => {
    setName(preset.name);
    setCategory(preset.category);
    setTargetAmount(preset.target.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    const data = {
      name,
      type,
      category: category || null,
      targetAmount: parseFloat(targetAmount),
      period: 'monthly',
    };
    if (editing) await updateHealthGoal(editing.id, data);
    else await addHealthGoal(data);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={editing ? 'Edit Health Goal' : 'New Health Goal'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Goal Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {GOAL_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setType(value); setCategory(''); setName(''); setTargetAmount(''); }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all duration-200 active:scale-[0.97] ${
                  type === value ? 'bg-primary-500/10' : 'hover:bg-primary-500/5'
                }`}
              >
                <Icon size={16} style={{ color: type === value ? 'var(--color-primary-600)' : 'var(--text-muted)' }} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Quick Presets</label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePreset(preset)}
                className="px-2 py-1 rounded-lg text-sm font-medium hover:bg-primary-500/5 transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ color: 'var(--text-muted)' }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Goal Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Monthly food budget"
            className="input w-full"
            required
          />
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Category (optional)</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input w-full"
            >
              <option value="">All expenses</option>
              {expenseCategories.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {type === 'expense' ? 'Max Spending Target' : 'Income Target'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              {currency.symbol}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              placeholder="0"
              className="input w-full !pl-11 pr-3 font-semibold"
              required
            />
          </div>
        </div>

        <button type="submit" className="w-full py-3 btn-primary font-semibold">
          {editing ? 'Save Changes' : 'Create Goal'}
        </button>
      </form>
    </Modal>
  );
}
