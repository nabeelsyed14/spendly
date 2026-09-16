import { useState } from 'react';
import { useTransactions, useCategories } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { getCategoryTotals } from '../../lib/insights';

export default function CategoryChart() {
  const transactions = useTransactions();
  const categories = useCategories();
  const { formatAmount } = useCurrency();
  const [hovered, setHovered] = useState(null);
  const data = getCategoryTotals(transactions, 'expense');

  const getColor = (name) => {
    const cat = categories.find(c => c.name === name);
    return cat?.color || '#737373';
  };

  const chartData = data.slice(0, 6).map(d => ({ ...d, color: getColor(d.name) }));

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-5 animate-fade-in">
        <h3 className="text-base font-semibold mb-3">Spending by Category</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No expenses yet this month</p>
        </div>
      </div>
    );
  }

  const total = chartData.reduce((s, d) => s + d.value, 0);
  const maxVal = chartData[0]?.value || 1;

  return (
    <div className="glass-card p-5 animate-slide-up stagger-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Spending by Category</h3>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{formatAmount(total, { compact: true })}</span>
      </div>

      <div className="space-y-3">
        {chartData.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          const barWidth = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
          const isHovered = hovered === d.name;
          return (
            <div
              key={d.name}
              className="group"
              onMouseEnter={() => setHovered(d.name)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                    style={{
                      background: d.color,
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                      boxShadow: isHovered ? `0 0 8px ${d.color}60` : 'none',
                    }}
                  />
                  <span className="text-sm font-medium">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">{formatAmount(d.value, { compact: true })}</span>
                  <span className="text-sm font-medium tabular-nums w-6 text-right" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                <div
                  className="h-full rounded-full bar-animate transition-shadow duration-200"
                  style={{
                    background: `linear-gradient(90deg, ${d.color}, ${d.color}cc)`,
                    width: `${barWidth}%`,
                    animationDelay: `${i * 0.1}s`,
                    boxShadow: isHovered ? `0 0 10px ${d.color}40` : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
