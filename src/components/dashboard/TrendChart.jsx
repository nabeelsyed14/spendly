import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { subDays } from 'date-fns';
import { useTransactions } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';

export default function TrendChart() {
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();

  const days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayStr = format(date, 'yyyy-MM-dd');
    const dayExpenses = transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        const d = typeof t.date === 'string' ? parseISO(t.date) : t.date;
        return format(d, 'yyyy-MM-dd') === dayStr;
      })
      .reduce((s, t) => s + t.amount, 0);

    return { date: format(date, 'MMM d'), amount: dayExpenses };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card p-6"
    >
      <h3 className="text-sm font-semibold mb-4">Daily Spending (14 days)</h3>
      <div className="h-48">
        <ResponsiveContainer>
          <AreaChart data={days}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={45}
              tickFormatter={(v) => formatAmount(v, { compact: true })}
            />
            <Tooltip
              formatter={(v) => [formatAmount(v), 'Spent']}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                fontSize: 12,
                padding: '8px 12px',
                boxShadow: 'var(--card-shadow)',
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0d9488"
              strokeWidth={2.5}
              fill="url(#areaGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
