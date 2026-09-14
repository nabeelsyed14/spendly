import { motion } from 'framer-motion';
import { useTransactions, useCategories } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { getCategoryTotals } from '../../lib/insights';

export default function CategoryChart() {
  const transactions = useTransactions();
  const categories = useCategories();
  const { formatAmount } = useCurrency();
  const data = getCategoryTotals(transactions, 'expense');

  const getColor = (name) => {
    const cat = categories.find(c => c.name === name);
    return cat?.color || '#71717a';
  };

  const chartData = data.slice(0, 6).map(d => ({ ...d, color: getColor(d.name) }));

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h3 className="text-sm font-semibold mb-4">Spending by Category</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <span className="text-3xl mb-2">📊</span>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No expenses yet this month</p>
        </div>
      </motion.div>
    );
  }

  const total = chartData.reduce((s, d) => s + d.value, 0);
  const maxVal = chartData[0]?.value || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold">Spending by Category</h3>
        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{formatAmount(total, { compact: true })}</span>
      </div>

      <div className="space-y-3">
        {chartData.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          const barWidth = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
          return (
            <div key={d.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-md flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs font-semibold">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tabular-nums">{formatAmount(d.value, { compact: true })}</span>
                  <span className="text-[10px] font-semibold tabular-nums w-7 text-right" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${d.color}, ${d.color}cc)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
