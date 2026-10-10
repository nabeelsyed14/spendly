import { useState } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useHealthGoals, useTransactions, useCategories, deleteHealthGoal } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateGoalActual, calculateGoalRating, calculateHealthScore, getScoreColor } from '../../lib/insights';
import HealthGoalForm from './HealthGoalForm';

// Static — defined at module scope so it's not recreated on every render.
const GOAL_TYPES = [
  { value: 'expense', label: 'Spending', icon: TrendingDown },
  { value: 'income', label: 'Earnings', icon: TrendingUp },
];

export default function GoalsPage() {
  const healthGoals = useHealthGoals();
  const transactions = useTransactions();
  const categories = useCategories();
  const { formatAmount } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const score = calculateHealthScore(healthGoals, transactions);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Health Goals</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Set targets and track your budget health</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 btn-primary text-sm sm:py-2.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {score !== null && (
        <div className="gradient-border p-5 animate-scale-in glow-sm">
          <div className="flex items-center gap-3.5">
            <div className="text-4xl font-extrabold tabular-nums" style={{ color: getScoreColor(score) }}>{score}</div>
            <div>
              <p className="text-lg font-bold" style={{ color: getScoreColor(score) }}>
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
              <div key={goal.id} className={`glass-card p-5 animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + '12' }}>
                      <TypeIcon size={21} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-base font-bold">{goal.name}</p>
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
          goalTypes={GOAL_TYPES}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
