import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useHealthGoals, useTransactions, useCategories, addHealthGoal, updateHealthGoal, deleteHealthGoal } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateGoalActual, calculateGoalRating, calculateHealthScore } from '../../lib/insights';
import Modal from '../ui/Modal';

function AnimatedScore({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (score === null) return;
    const duration = 1000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(score * eased);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [score]);

  if (score === null) return null;
  return <span>{displayed.toFixed(1)}</span>;
}

export default function HealthScore() {
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
    <div className="glass-card p-5 animate-slide-up stagger-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary-500/10 flex items-center justify-center">
            <ShieldCheck size={16} className="text-primary-500" />
          </div>
          <h3 className="text-base font-semibold">Budget Health</h3>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm font-semibold bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus size={12} strokeWidth={2.5} />
          Goal
        </button>
      </div>

      {healthGoals.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-base font-medium mb-1.5">Set your first health goal</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create spending or earning targets to track your budget health</p>
        </div>
      ) : (
        <>
          {score !== null && (
            <div className="flex items-center gap-3 mb-4 p-4 rounded-xl animate-scale-in glow-sm" style={{ background: 'var(--input-bg)' }}>
              <div className="text-2xl font-extrabold tabular-nums" style={{ color: getScoreColor(score) }}>
                <AnimatedScore score={score} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: getScoreColor(score) }}>
                  {score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Fair' : 'Needs Work'}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Average of {healthGoals.length} goal{healthGoals.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {healthGoals.map((goal, i) => {
              const actual = calculateGoalActual(goal, transactions);
              const rating = calculateGoalRating(goal, actual);
              const ratio = goal.targetAmount > 0 ? Math.min((actual / goal.targetAmount) * 100, 100) : 0;
              const color = getScoreColor(rating);
              const TypeIcon = goal.type === 'income' ? TrendingUp : TrendingDown;

              return (
                <div
                  key={goal.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-200 hover:shadow-sm animate-slide-up stagger-${Math.min(i + 1, 6)}`}
                  style={{ background: 'var(--input-bg)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '15' }}>
                    <TypeIcon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{goal.name}</p>
                      {goal.category && (
                        <span className="tag" style={{ background: 'var(--surface-solid)', color: 'var(--text-muted)' }}>
                          {goal.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-solid)' }}>
                        <div className="h-full rounded-full bar-animate" style={{ background: color, width: `${ratio}%` }} />
                      </div>
                      <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {formatAmount(actual, { compact: true })} / {formatAmount(goal.targetAmount, { compact: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-sm font-bold tabular-nums" style={{ color }}>{rating}</span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => { setEditing(goal); setShowForm(true); }}
                        className="p-0.5 rounded hover:bg-primary-500/10 transition-all duration-150 active:scale-95"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this goal?')) deleteHealthGoal(goal.id); }}
                        className="p-0.5 rounded hover:bg-red-500/10 text-red-500 transition-all duration-150 active:scale-95"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
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
