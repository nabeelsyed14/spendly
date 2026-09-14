import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, Pencil, Trash2, TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { useHealthGoals, useTransactions, useCategories, addHealthGoal, updateHealthGoal, deleteHealthGoal } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateGoalActual, calculateGoalRating, calculateHealthScore } from '../../lib/insights';
import Modal from '../ui/Modal';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card p-6 gradient-border"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary-500" />
          <h3 className="text-sm font-semibold">Budget Health</h3>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20 transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          Goal
        </button>
      </div>

      {healthGoals.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-3xl mb-3 block">🎯</span>
          <p className="text-sm font-semibold mb-1">Set your first health goal</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Create spending or earning targets to track your budget health</p>
        </div>
      ) : (
        <>
          {/* Overall Score */}
          {score !== null && (
            <div className="flex items-center gap-4 mb-5 p-3 rounded-2xl" style={{ background: 'var(--bg)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: getScoreColor(score) + '18' }}>
                <span className="text-2xl font-extrabold" style={{ color: getScoreColor(score) }}>{score}</span>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Average of {healthGoals.length} goal{healthGoals.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}

          {/* Individual Goals */}
          <div className="space-y-2.5">
            <AnimatePresence>
              {healthGoals.map((goal, i) => {
                const actual = calculateGoalActual(goal, transactions);
                const rating = calculateGoalRating(goal, actual);
                const ratio = goal.targetAmount > 0 ? Math.min((actual / goal.targetAmount) * 100, 100) : 0;
                const color = getScoreColor(rating);
                const TypeIcon = goal.type === 'income' ? TrendingUp : TrendingDown;

                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--bg)' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '18' }}>
                      <TypeIcon size={16} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold truncate">{goal.name}</p>
                        {goal.category && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                            {goal.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${ratio}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                          {formatAmount(actual, { compact: true })} / {formatAmount(goal.targetAmount, { compact: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-sm font-extrabold tabular-nums" style={{ color }}>{rating}</span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => { setEditing(goal); setShowForm(true); }}
                          className="p-0.5 rounded hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Pencil size={10} />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this goal?')) deleteHealthGoal(goal.id); }}
                          className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
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
    </motion.div>
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
