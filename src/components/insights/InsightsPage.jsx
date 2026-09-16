import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Clock, BarChart3, Sparkles } from 'lucide-react';
import { useTransactions } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { spendingVelocity, getCategoryTrends, monthlyProjection, habitPatterns, anomalyDetection } from '../../lib/insights';

function InsightCard({ icon: Icon, title, children, color = 'var(--text)', className = '' }) {
  return (
    <div className={`glass-card p-5 animate-slide-up ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '12' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function VelocityInsight() {
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const { current, changePercent, trend } = spendingVelocity(transactions);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const color = trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : 'var(--text-muted)';

  return (
    <InsightCard icon={TrendingUp} title="Spending Velocity" color={color} className="stagger-1">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-extrabold tabular-nums">{formatAmount(current)}</span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/day avg</span>
      </div>
      <div className="flex items-center gap-1.5 p-2 rounded-xl" style={{ background: 'var(--input-bg)' }}>
        <TrendIcon size={14} style={{ color }} />
        <span className="text-sm font-medium" style={{ color }}>
          {Math.abs(changePercent)}% {trend === 'up' ? 'faster' : trend === 'down' ? 'slower' : 'same'}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>vs last week</span>
      </div>
    </InsightCard>
  );
}

function ProjectionInsight() {
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const { projected, dayOfMonth, daysInMonth, dailyRate } = monthlyProjection(transactions);
  const progress = (dayOfMonth / daysInMonth) * 100;

  return (
    <InsightCard icon={Target} title="Monthly Projection" color="#0d9488" className="stagger-2">
      <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
        Day {dayOfMonth} of {daysInMonth} — {Math.round(progress)}% through the month
      </p>
      <div className="w-full h-2 rounded-full mb-3" style={{ background: 'var(--input-bg)' }}>
        <div className="h-full rounded-full bar-animate bg-primary-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Daily Rate</p>
          <p className="text-base font-bold">{formatAmount(dailyRate)}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Projected</p>
          <p className="text-base font-bold">{formatAmount(projected)}</p>
        </div>
      </div>
    </InsightCard>
  );
}

function HabitInsight() {
  const transactions = useTransactions();
  const { byDay, dayNames, peakDay, peakHalf } = habitPatterns(transactions);
  const maxVal = Math.max(...byDay, 1);

  return (
    <InsightCard icon={Clock} title="Habit Patterns" color="#0d9488" className="stagger-3">
      <div className="flex items-end gap-1 h-16 mb-3">
        {byDay.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t bar-animate bg-primary-500/60"
              style={{ height: `${(val / maxVal) * 100}%`, minHeight: val > 0 ? 3 : 0, animationDelay: `${i * 0.05}s` }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{dayNames[i]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Peak Day</p>
          <p className="text-sm font-semibold">{peakDay}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Heavier Spending</p>
          <p className="text-sm font-semibold capitalize">{peakHalf}</p>
        </div>
      </div>
    </InsightCard>
  );
}

function AnomalyInsight() {
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const anomalies = anomalyDetection(transactions);

  return (
    <InsightCard icon={AlertTriangle} title="Anomaly Alerts" color="#f59e0b" className="stagger-4">
      {anomalies.length === 0 ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No unusual spending detected. All looks normal.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {anomalies.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <div className="w-8 h-8 rounded-lg bg-warning/12 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={14} className="text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.category} — {formatAmount(a.amount)}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Avg: {formatAmount(a.average)} ({a.deviation}σ above)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </InsightCard>
  );
}

function TrendInsight() {
  const transactions = useTransactions();
  const trends = getCategoryTrends(transactions);
  const entries = Object.entries(trends).filter(([, v]) => v.increasing);

  return (
    <InsightCard icon={BarChart3} title="Category Trends" color="#ef4444" className="stagger-5">
      {entries.length === 0 ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No category trending upward. Spending is steady.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.slice(0, 3).map(([cat, data]) => (
            <div key={cat} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <div className="w-8 h-8 rounded-lg bg-danger/12 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={14} className="text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1.5">{cat}</p>
                <div className="flex gap-0.5">
                  {data.weeks.map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full bar-animate bg-danger/50"
                      style={{ width: `${Math.max((w / Math.max(...data.weeks, 1)) * 20, 4)}px`, opacity: 0.3 + (i * 0.23), animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
              <span className="tag bg-danger/10 text-danger">Rising</span>
            </div>
          ))}
        </div>
      )}
    </InsightCard>
  );
}

export default function InsightsPage({ onOpenChat }) {
  return (
    <div className="space-y-3">
      {onOpenChat && (
        <button
          onClick={onOpenChat}
          className="w-full glass-card p-4 flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:shadow-lg hover:glow-sm animate-slide-up active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-base font-semibold">Ask AI about your finances</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Get personalized insights powered by AI</p>
          </div>
        </button>
      )}

      <VelocityInsight />
      <ProjectionInsight />
      <HabitInsight />
      <TrendInsight />
      <AnomalyInsight />
    </div>
  );
}
