import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const StatCard = ({ icon: Icon, label, value, color = 'var(--text)' }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '15' }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p className="text-xl font-extrabold tabular-nums" style={{ color }}>{value}</p>
    </motion.div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">Reports</h2>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg)' }}>
          {[
            { key: 'monthly', label: 'This Month', icon: Calendar },
            { key: 'alltime', label: 'All Time', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === key ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md' : ''
              }`}
              style={view !== key ? { color: 'var(--text-muted)' } : {}}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'monthly' && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{monthlyReport.month}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={TrendingUp} label="Income" value={formatAmount(report.totalIncome)} color="#22c55e" />
        <StatCard icon={TrendingDown} label="Expenses" value={formatAmount(report.totalExpense)} color="#ef4444" />
        <StatCard icon={DollarSign} label={view === 'monthly' ? 'Balance' : 'Net Savings'} value={formatAmount(view === 'monthly' ? report.balance : report.netSavings)} color="#0d9488" />
        <StatCard icon={Percent} label="Savings Rate" value={`${report.savingsRate}%`} color={report.savingsRate >= 20 ? '#22c55e' : '#f59e0b'} />
      </div>

      {/* Source Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-5"
      >
        <h3 className="text-sm font-semibold mb-4">Spending Source</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>From Income</p>
            <p className="text-lg font-bold">{formatAmount(report.incomeSpend)}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>From Savings</p>
            <p className="text-lg font-bold text-amber-600">{formatAmount(report.savingsSpend)}</p>
          </div>
        </div>
      </motion.div>

      {/* Top Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 gradient-border"
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-primary-500/15 flex items-center justify-center">
            <ShoppingCart size={16} className="text-primary-500" />
          </div>
          <h3 className="text-sm font-semibold">Top Spending Categories</h3>
        </div>

        {report.topCategories.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>No expenses yet</p>
        ) : (
          <div className="space-y-3.5">
            {report.topCategories.map((cat, i) => {
              const catData = categories.find(c => c.name === cat.name);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums">{formatAmount(cat.amount)}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                        {cat.percent}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${catData?.color || '#0d9488'}, ${catData?.color || '#14b8a6'}cc)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percent}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* All-Time Monthly Breakdown Chart */}
      {view === 'alltime' && allTimeReport.monthlyBreakdown.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 gradient-border"
        >
          <h3 className="text-sm font-semibold mb-4">Monthly Trend</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <AreaChart data={allTimeReport.monthlyBreakdown}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => formatAmount(v, { compact: true })} />
                <Tooltip
                  formatter={(v, name) => [formatAmount(v), name === 'income' ? 'Income' : 'Expense']}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    fontSize: 12,
                    padding: '8px 12px',
                    boxShadow: 'var(--card-shadow)',
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Expense</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6 text-center"
      >
        <span className="text-3xl mb-3 block">📊</span>
        <p className="text-sm font-bold mb-1">{report.transactionCount} transactions {view === 'monthly' ? 'this month' : 'total'}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {report.savingsRate >= 20
            ? "Great job! You're saving more than 20% of your income."
            : report.savingsRate >= 10
            ? "Good progress. Try to push savings above 20%."
            : "Consider reducing expenses to save more."}
        </p>
      </motion.div>
    </div>
  );
}
