import { useState } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useHealthGoals, useTransactions, useCategories, addHealthGoal, updateHealthGoal, deleteHealthGoal } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateGoalActual, calculateGoalRating, calculateHealthScore } from '../../lib/insights';
import Modal from '../ui/Modal';

export default function GoalsPage() {
  const healthGoals = useHealthGoals();
  const transactions = useTransactions();
  const categories = useCategories();
  const { formatAmount } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const score = calculateHealthScore(healthGoals, transactions);

  const getScoreColor = (rating) => {
    if (rating >= 8) return '#22c55e';
    if (rating >= 6) return '#f59e0b';
    if (rating >= 4) return '#f97316';
    return '#ef4444';
  };

  const goalTypes = [
    { value: 'expense', label: 'Spending', icon: TrendingDown },
    { value: 'income', label: 'Earnings', icon: TrendingUp },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Health Goals</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Set targets and track your budget health</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 btn-primary text-sm sm:py-2.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {score !== null && (
        <div className="gradient-border p-4 animate-scale-in glow-sm">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold tabular-nums" style={{ color: getScoreColor(score) }}>{score}</div>
            <div>
              <p className="text-base font-semibold" style={{ color: getScoreColor(score) }}>
                {score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Fair' : 'Needs Work'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Average of {healthGoals.length} goal{healthGoals.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {healthGoals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--input-bg)' }}>
            <Target size={22} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-semibold mb-1.5">No health goals yet</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Create spending or earning targets</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2.5 btn-primary text-sm"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {healthGoals.map((goal, i) => {
            const actual = calculateGoalActual(goal, transactions);
            const rating = calculateGoalRating(goal, actual);
            const ratio = goal.targetAmount > 0 ? Math.min((actual / goal.targetAmount) * 100, 100) : 0;
            const color = getScoreColor(rating);
            const TypeIcon = goal.type === 'income' ? TrendingUp : TrendingDown;
            const isComplete = goal.type === 'expense' ? actual <= goal.targetAmount : actual >= goal.targetAmount;

            return (
              <div key={goal.id} className={`glass-card p-4 animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '12' }}>
                      <TypeIcon size={20} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-base font-semibold">{goal.name}</p>
                      {goal.category && (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{goal.category}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-extrabold tabular-nums" style={{ color }}>{rating}</span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => { setEditing(goal); setShowForm(true); }}
                        className="p-1 rounded-lg hover:bg-primary-500/10 transition-all duration-150 active:scale-95"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this goal?')) deleteHealthGoal(goal.id); }}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition-all duration-150 active:scale-95"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                    <div
                      className="h-full rounded-full bar-animate"
                      style={{ background: isComplete ? '#22c55e' : color, width: `${ratio}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {formatAmount(actual)} / {formatAmount(goal.targetAmount)}
                  </span>
                  <span className="text-sm font-bold" style={{ color: isComplete ? '#22c55e' : 'var(--text)' }}>
                    {Math.round(ratio)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <HealthGoalForm
          editing={editing}
          categories={categories}
          goalTypes={goalTypes}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function HealthGoalForm({ editing, categories, goalTypes, onClose }) {
  const { currency } = useCurrency();
  const [name, setName] = useState(editing?.name || '');
  const [type, setType] = useState(editing?.type || 'expense');
  const [category, setCategory] = useState(editing?.category || '');
  const [targetAmount, setTargetAmount] = useState(editing?.targetAmount?.toString() || '');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const presets = type === 'expense'
    ? [
        { name: 'Food budget', category: 'Food & Dining', target: 500 },
        { name: 'Transport limit', category: 'Transport', target: 200 },
        { name: 'Shopping cap', category: 'Shopping', target: 300 },
        { name: 'Entertainment limit', category: 'Entertainment', target: 150 },
      ]
    : [
        { name: 'Monthly earnings', category: '', target: 3000 },
        { name: 'Side income', category: 'Freelance', target: 500 },
        { name: 'Investment returns', category: 'Investments', target: 200 },
      ];

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
            {goalTypes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setType(value); setCategory(''); setName(''); setTargetAmount(''); }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all duration-200 active:scale-[0.97] ${
                  type === value ? 'bg-primary-500/10' : 'hover:bg-primary-500/5'
                }`}
              >
                <Icon size={16} style={{ color: type === value ? '#0d9488' : 'var(--text-muted)' }} />
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{currency.symbol}</span>
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
