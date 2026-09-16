import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, ShoppingCart, Calendar, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions, useCategories } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { generateMonthlyReport, generateAllTimeReport } from '../../lib/insights';

export default function ReportsPage() {
  const transactions = useTransactions();
  const categories = useCategories();
  const { formatAmount } = useCurrency();
  const [view, setView] = useState('monthly');

  const monthlyReport = generateMonthlyReport(transactions, categories);
  const allTimeReport = generateAllTimeReport(transactions);
  const report = view === 'monthly' ? monthlyReport : allTimeReport;

  const StatCard = ({ icon: Icon, label, value, color = 'var(--text)', delay = 0 }) => (
    <div className={`glass-card p-3.5 animate-slide-up stagger-${delay}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: color + '12' }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-sm uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p className="text-lg font-extrabold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Reports</h2>
        <div className="flex gap-0.5 p-0.5 rounded-xl glass">
          {[
            { key: 'monthly', label: 'Month', icon: Calendar },
            { key: 'alltime', label: 'All Time', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                view === key ? 'bg-primary-500 text-white shadow-md' : ''
              }`}
              style={view !== key ? { color: 'var(--text-muted)' } : {}}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'monthly' && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{monthlyReport.month}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={TrendingUp} label="Income" value={formatAmount(report.totalIncome)} color="#22c55e" delay={1} />
        <StatCard icon={TrendingDown} label="Expenses" value={formatAmount(report.totalExpense)} color="#ef4444" delay={2} />
        <StatCard icon={DollarSign} label={view === 'monthly' ? 'Balance' : 'Net Savings'} value={formatAmount(view === 'monthly' ? report.balance : report.netSavings)} color="#0d9488" delay={3} />
        <StatCard icon={Percent} label="Savings Rate" value={`${report.savingsRate}%`} color={report.savingsRate >= 20 ? '#22c55e' : '#f59e0b'} delay={4} />
      </div>

      <div className="glass-card p-4 animate-slide-up stagger-3">
        <h3 className="text-base font-semibold mb-3">Spending Source</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
            <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>From Income</p>
            <p className="text-base font-bold">{formatAmount(report.incomeSpend)}</p>
          </div>
          <div className="p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
            <p className="text-sm uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>From Savings</p>
            <p className="text-base font-bold text-amber-600">{formatAmount(report.savingsSpend)}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 animate-slide-up stagger-4">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart size={16} className="text-primary-500" />
          <h3 className="text-base font-semibold">Top Spending Categories</h3>
        </div>

        {report.topCategories.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No expenses yet</p>
        ) : (
          <div className="space-y-2.5">
            {report.topCategories.map((cat, i) => {
              const catData = categories.find(c => c.name === cat.name);
              return (
                <div key={cat.name} className={`animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold tabular-nums">{formatAmount(cat.amount)}</span>
                      <span className="text-sm font-medium px-1.5 py-0.5 rounded-lg" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                        {cat.percent}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                    <div
                      className="h-full rounded-full bar-animate"
                      style={{ background: catData?.color || '#0d9488', width: `${cat.percent}%`, animationDelay: `${i * 0.1}s` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {view === 'alltime' && allTimeReport.monthlyBreakdown.length > 1 && (
        <div className="glass-card p-4 animate-slide-up stagger-5">
          <h3 className="text-base font-semibold mb-3">Monthly Trend</h3>
          <div className="h-44">
            <ResponsiveContainer>
              <AreaChart data={allTimeReport.monthlyBreakdown}>
                <defs>
                  <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => formatAmount(v, { compact: true })} />
                <Tooltip
                  formatter={(v, name) => [formatAmount(v), name === 'income' ? 'Income' : 'Expense']}
                  contentStyle={{
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border-solid)',
                    borderRadius: 12,
                    fontSize: 12,
                    padding: '6px 10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={1.5} fill="url(#ig)" animationDuration={1200} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={1.5} fill="url(#eg)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Expense</span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-4 text-center animate-slide-up stagger-6">
        <p className="text-sm font-semibold mb-0.5">{report.transactionCount} transactions {view === 'monthly' ? 'this month' : 'total'}</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {report.savingsRate >= 20
            ? "Great job! You're saving more than 20% of your income."
            : report.savingsRate >= 10
            ? "Good progress. Try to push savings above 20%."
            : "Consider reducing expenses to save more."}
        </p>
      </div>
    </div>
  );
}
