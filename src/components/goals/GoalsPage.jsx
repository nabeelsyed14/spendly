import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, ShieldCheck, Target, Wallet } from 'lucide-react';
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

  const getScoreLabel = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 7) return 'Great';
    if (rating >= 5) return 'Good';
    if (rating >= 3) return 'Fair';
    return 'Needs Work';
  };

  const goalTypes = [
    { value: 'expense', label: 'Spending', icon: TrendingDown, description: 'Track spending under a limit' },
    { value: 'income', label: 'Earnings', icon: TrendingUp, description: 'Track income targets' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold">Health Goals</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Set targets and track your budget health</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold shadow-lg shadow-primary-600/25 active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Goal
        </button>
      </div>

      {/* Overall Health Score */}
      {score !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 gradient-border"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="7" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={getScoreColor(score)}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 10) }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ filter: `drop-shadow(0 0 6px ${getScoreColor(score)}40)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold tabular-nums" style={{ color: getScoreColor(score) }}>{score}</span>
                <span className="text-[9px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>/10</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Based on {healthGoals.length} goal{healthGoals.length !== 1 ? 's' : ''} — average rating across all targets
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals List */}
      {healthGoals.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🎯</span>
          <p className="font-semibold text-lg mb-1">No health goals yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Create spending or earning targets to track your budget health</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg active:scale-[0.98]"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {healthGoals.map((goal, i) => {
              const actual = calculateGoalActual(goal, transactions);
              const rating = calculateGoalRating(goal, actual);
              const ratio = goal.targetAmount > 0 ? Math.min((actual / goal.targetAmount) * 100, 100) : 0;
              const color = getScoreColor(rating);
              const TypeIcon = goal.type === 'income' ? TrendingUp : TrendingDown;
              const isComplete = goal.type === 'expense' ? actual <= goal.targetAmount : actual >= goal.targetAmount;

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5 gradient-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: color + '18' }}
                      >
                        <TypeIcon size={20} style={{ color }} />
                      </span>
                      <div>
                        <p className="text-sm font-bold">{goal.name}</p>
                        {goal.category && (
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {goal.category}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-extrabold tabular-nums" style={{ color }}>{rating}</span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => { setEditing(goal); setShowForm(true); }}
                          className="p-1 rounded-lg transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this goal?')) deleteHealthGoal(goal.id); }}
                          className="p-1 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: isComplete ? '#22c55e' : color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${ratio}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatAmount(actual)} / {formatAmount(goal.targetAmount)}
                    </span>
                    <span className="text-sm font-extrabold" style={{ color: isComplete ? '#22c55e' : 'var(--text)' }}>
                      {Math.round(ratio)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
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

  const inputStyle = {
    background: 'var(--bg)',
    color: 'var(--text)',
    borderColor: 'var(--border)',
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={editing ? 'Edit Health Goal' : 'New Health Goal'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Goal Type</label>
          <div className="grid grid-cols-2 gap-2">
            {goalTypes.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setType(value); setCategory(''); setName(''); setTargetAmount(''); }}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  type === value
                    ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500/30'
                    : ''
                }`}
                style={{ borderColor: type === value ? undefined : 'var(--border)' }}
              >
                <Icon size={16} style={{ color: type === value ? '#0d9488' : 'var(--text-muted)' }} />
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Quick Presets</label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePreset(preset)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Goal Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Monthly food budget"
            className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
            style={inputStyle}
            required
          />
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Category (optional)</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border outline-none text-sm"
              style={inputStyle}
            >
              <option value="">All expenses</option>
              {expenseCategories.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            {type === 'expense' ? 'Max Spending Target' : 'Income Target'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{currency.symbol}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-8 pr-3 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary-500/30 text-sm font-semibold"
              style={inputStyle}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg shadow-primary-600/30 active:scale-[0.98] transition-all"
        >
          {editing ? 'Save Changes' : 'Create Goal'}
        </button>
      </form>
    </Modal>
  );
}
