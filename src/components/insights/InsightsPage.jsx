import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Clock, BarChart3 } from 'lucide-react';
import { useTransactions } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { spendingVelocity, getCategoryTrends, monthlyProjection, habitPatterns, anomalyDetection } from '../../lib/insights';

function InsightCard({ icon: Icon, title, children, delay = 0, color = 'var(--text)' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-6 gradient-border"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '15' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function VelocityInsight() {
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const { current, previous, changePercent, trend } = spendingVelocity(transactions);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const color = trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : 'var(--text-muted)';

  return (
    <InsightCard icon={TrendingUp} title="Spending Velocity" delay={0} color={color}>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-extrabold tabular-nums">{formatAmount(current)}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>/day avg</span>
      </div>
      <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'var(--bg)' }}>
        <TrendIcon size={14} style={{ color }} />
        <span className="text-sm font-semibold" style={{ color }}>
          {Math.abs(changePercent)}% {trend === 'up' ? 'faster' : trend === 'down' ? 'slower' : 'same'}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs last week</span>
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
    <InsightCard icon={Target} title="Monthly Projection" delay={0.1} color="#0d9488">
      <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
        Day {dayOfMonth} of {daysInMonth} — {Math.round(progress)}% through the month
      </p>
      <div className="w-full h-2.5 rounded-full mb-4" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
          <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Daily Rate</p>
          <p className="text-lg font-bold">{formatAmount(dailyRate)}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
          <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Projected Total</p>
          <p className="text-lg font-bold">{formatAmount(projected)}</p>
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
    <InsightCard icon={Clock} title="Habit Patterns" delay={0.2} color="#0d9488">
      <div className="flex items-end gap-1.5 h-20 mb-4">
        {byDay.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <motion.div
              className="w-full rounded-t-lg bg-gradient-to-t from-primary-700/60 to-primary-500/60"
              initial={{ height: 0 }}
              animate={{ height: `${(val / maxVal) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
              style={{ minHeight: val > 0 ? 4 : 0 }}
            />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{dayNames[i]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
          <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Peak Day</p>
          <p className="text-sm font-bold">{peakDay}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
          <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Heavier Spending</p>
          <p className="text-sm font-bold capitalize">{peakHalf}</p>
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
    <InsightCard icon={AlertTriangle} title="Anomaly Alerts" delay={0.3} color="#f59e0b">
      {anomalies.length === 0 ? (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
          <span className="text-lg">✅</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            No unusual spending detected. All looks normal!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {anomalies.slice(0, 3).map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--bg)' }}
            >
              <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={14} className="text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{a.category} — {formatAmount(a.amount)}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Avg: {formatAmount(a.average)} ({a.deviation}σ above)
                </p>
              </div>
            </motion.div>
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
    <InsightCard icon={BarChart3} title="Category Trends" delay={0.4} color="#ef4444">
      {entries.length === 0 ? (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
          <span className="text-lg">👏</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            No category trending upward. Great job keeping spending steady!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 3).map(([cat, data]) => (
            <div key={cat} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
              <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={14} className="text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1.5">{cat}</p>
                <div className="flex gap-1">
                  {data.weeks.map((w, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full bg-gradient-to-r from-danger/40 to-danger/80"
                      style={{ width: `${Math.max((w / Math.max(...data.weeks, 1)) * 24, 6)}px`, opacity: 0.3 + (i * 0.23) }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-danger/10 text-danger">Rising</span>
            </div>
          ))}
        </div>
      )}
    </InsightCard>
  );
}

export default function InsightsPage() {
  return (
    <div className="space-y-4">
      <VelocityInsight />
      <ProjectionInsight />
      <HabitInsight />
      <TrendInsight />
      <AnomalyInsight />
    </div>
  );
}
