import { TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, BarChart3, LineChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTransactions } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { spendingVelocity, getCategoryTrends, habitPatterns, anomalyDetection, forecastSpend, dailySpendSeries } from '../../lib/insights';
import { tint } from '../../lib/color';

const chartTooltip = {
  background: 'var(--surface-solid)',
  border: '1px solid var(--border-solid)',
  borderRadius: 16,
  fontSize: 12,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

function InsightCard({ icon: Icon, title, children, color = 'var(--text)', className = '' }) {
  return (
    <div className={`glass-card p-5 animate-slide-up ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: tint(color) }}>
          <Icon size={17} style={{ color }} />
        </div>
        <h3 className="text-xl font-extrabold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function VelocityInsight({ transactions }) {
  const { formatAmount } = useCurrency();
  const { current, changePercent, trend } = spendingVelocity(transactions);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const color = trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : 'var(--text-muted)';

  return (
    <InsightCard icon={TrendingUp} title="Spending Velocity" color={color} className="stagger-1">
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`${formatAmount(current).length > 14 ? 'text-xl' : formatAmount(current).length > 11 ? 'text-2xl' : 'text-3xl'} font-extrabold tabular-nums`}>{formatAmount(current)}</span>
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

function HabitInsight({ transactions }) {
  const { formatAmount } = useCurrency();
  const { byDay, dayNames, peakDay } = habitPatterns(transactions);
  const maxVal = Math.max(...byDay, 1);
  const total = byDay.reduce((s, v) => s + v, 0);
  const peakIdx = byDay.indexOf(Math.max(...byDay));

  return (
    <InsightCard icon={Clock} title="Habit Patterns" color="var(--color-primary-600)" className="stagger-3">
      <div className="flex items-end gap-1 h-24 mb-3">
        {byDay.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
            <span
              className="text-[9px] font-bold tabular-nums"
              style={{ color: i === peakIdx && val > 0 ? 'var(--color-primary-600)' : 'var(--text-muted)' }}
            >
              {val > 0 ? formatAmount(val, { compact: true }) : ''}
            </span>
            <div
              className="w-full rounded-t bar-animate"
              style={{
                height: `${(val / maxVal) * 100}%`,
                minHeight: val > 0 ? 3 : 0,
                animationDelay: `${i * 0.05}s`,
                background: 'var(--color-primary-600)',
                opacity: i === peakIdx && val > 0 ? 1 : 0.55,
              }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{dayNames[i]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Total</p>
          <p className="text-sm font-bold tabular-nums">{formatAmount(total, { compact: true })}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Daily Avg</p>
          <p className="text-sm font-bold tabular-nums">{formatAmount(total / 7, { compact: true })}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Peak Day</p>
          <p className="text-sm font-semibold">{peakDay}</p>
        </div>
      </div>
    </InsightCard>
  );
}

function AnomalyInsight({ transactions }) {
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

function TrendInsight({ transactions }) {
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

function ForecastInsight({ transactions }) {
  const { formatAmount } = useCurrency();
  const { palette } = useTheme();
  const brand = palette.colors[600];
  const { projected, lower, upper, dayOfMonth, daysInMonth, dailyRate } = forecastSpend(transactions);
  const daily = dailySpendSeries(transactions);

  // Cumulative actuals + projected continuation that lands on the forecast
  // total at month end — reads as one trajectory, not noisy daily spikes.
  let cum = 0;
  const elapsed = [];
  for (let d = 1; d <= dayOfMonth; d++) {
    cum += daily[d - 1]?.amount ?? 0;
    elapsed.push(cum);
  }
  const remaining = Math.max(0, daysInMonth - dayOfMonth);
  const step = remaining > 0 ? Math.max(0, (projected - cum) / remaining) : 0;

  const data = [];
  let tail = cum;
  for (let d = 1; d <= daysInMonth; d++) {
    if (d < dayOfMonth) {
      data.push({ label: String(d), actual: elapsed[d - 1], forecast: null });
    } else if (d === dayOfMonth) {
      data.push({ label: String(d), actual: elapsed[d - 1], forecast: elapsed[d - 1] });
    } else {
      tail += step;
      data.push({ label: String(d), actual: null, forecast: Math.round(tail) });
    }
  }

  return (
    <InsightCard icon={LineChart} title="Month Forecast" color={brand} className="stagger-1">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-extrabold tabular-nums">{formatAmount(projected)}</span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>projected total</span>
      </div>
      <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
        Likely range {formatAmount(lower)} – {formatAmount(upper)}
      </p>
      <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
        Day {dayOfMonth} of {daysInMonth} — {Math.round((dayOfMonth / daysInMonth) * 100)}% through the month
      </p>
      <div className="w-full h-2 rounded-full mb-3" style={{ background: 'var(--input-bg)' }}>
        <div className="h-full rounded-full bar-animate bg-primary-500" style={{ width: `${(dayOfMonth / daysInMonth) * 100}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Daily Rate</p>
          <p className="text-lg font-extrabold tabular-nums">{formatAmount(dailyRate)}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Spent So Far</p>
          <p className="text-lg font-extrabold tabular-nums">{formatAmount(cum)}</p>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={brand} stopOpacity={0.2} />
                <stop offset="95%" stopColor={brand} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={Math.ceil(daysInMonth / 6)} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => formatAmount(v, { compact: true })} />
            <Tooltip
              formatter={(v, name) => [formatAmount(v), name === 'actual' ? 'Spent' : 'Projected']}
              contentStyle={chartTooltip}
            />
            <ReferenceLine
              x={String(dayOfMonth)}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{ value: 'Today', position: 'insideTopRight', fontSize: 9, fill: 'var(--text-muted)' }}
            />
            <Area type="monotone" dataKey="actual" stroke={brand} strokeWidth={2} fill="url(#forecastGrad)" connectNulls animationDuration={1200} />
            <Area type="monotone" dataKey="forecast" stroke={brand} strokeWidth={2} strokeDasharray="5 5" fill="none" connectNulls animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </InsightCard>
  );
}

export default function InsightsPage() {
  const transactions = useTransactions();

  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-extrabold tracking-tight">Insights</h2>

      <ForecastInsight transactions={transactions} />
      <VelocityInsight transactions={transactions} />
      <HabitInsight transactions={transactions} />
      <TrendInsight transactions={transactions} />
      <AnomalyInsight transactions={transactions} />
    </div>
  );
}
