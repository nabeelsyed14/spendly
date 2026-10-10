import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useHealthGoals, useTransactions, useCategories, deleteHealthGoal } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateGoalActual, calculateGoalRating, calculateHealthScore, getScoreColor } from '../../lib/insights';
import { tint } from '../../lib/color';
import TiltCard from '../ui/TiltCard';
import HealthGoalForm from '../goals/HealthGoalForm';

// Static — defined outside component so it doesn't recreate on every render.
const GOAL_TYPES = [
  { value: 'expense', label: 'Spending', icon: TrendingDown },
  { value: 'income', label: 'Earnings', icon: TrendingUp },
];

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

  return (
    <>
    <TiltCard className="glass-card h-full p-6 animate-slide-up stagger-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <ShieldCheck size={18} className="text-primary-500" />
          </div>
          <h3 className="text-xl font-extrabold">Budget Health</h3>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus size={13} strokeWidth={2.5} />
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
            <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl animate-scale-in glow-sm" style={{ background: 'var(--input-bg)' }}>
              <div className="text-4xl font-extrabold tabular-nums" style={{ color: getScoreColor(score) }}>
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
                  className={`flex items-center gap-2.5 p-3 rounded-2xl transition-all duration-200 hover:shadow-sm animate-slide-up stagger-${Math.min(i + 1, 6)}`}
                  style={{ background: 'var(--input-bg)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tint(color, 9) }}>
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
      </TiltCard>

      {showForm && (
        <HealthGoalForm
          editing={editing}
          categories={categories}
          goalTypes={GOAL_TYPES}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </>
  );
}
