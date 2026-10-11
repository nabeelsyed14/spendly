import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { subDays, format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import TiltCard from '../ui/TiltCard';

export default function TrendChart() {
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const { palette } = useTheme();
  const brand = palette.colors[600];

  const now = new Date();
  const days = 14;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    // Fix: cache subDays result (was called twice) and use startOfDay/endOfDay
    // instead of date.setHours() which mutates the date object in-place, causing
    // start and end to both end up as end-of-day (data was silently wrong).
    const day = subDays(now, i);
    const start = startOfDay(day);
    const end = endOfDay(day);

    const dayExpenses = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(
        typeof t.date === 'string' ? parseISO(t.date) : t.date,
        { start, end }
      ))
      .reduce((s, t) => s + t.amount, 0);

    data.push({ date: format(day, 'MMM d'), amount: dayExpenses });
  }

  return (
    <TiltCard className="glass-card h-full p-6 animate-slide-up stagger-3">
      <h3 className="text-xl font-extrabold mb-4">Daily Spending (14 days)</h3>
      <div className="h-44">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={brand} stopOpacity={0.2} />
                <stop offset="95%" stopColor={brand} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => formatAmount(v, { compact: true })} />
            <Tooltip
              formatter={(v) => [formatAmount(v), 'Spent']}
              contentStyle={{
                background: 'var(--surface-solid)',
                border: '1px solid var(--border-solid)',
                borderRadius: 16,
                fontSize: 12,
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Area type="monotone" dataKey="amount" stroke={brand} strokeWidth={2} fill="url(#trendGrad)" animationDuration={600} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </TiltCard>
  );
}
