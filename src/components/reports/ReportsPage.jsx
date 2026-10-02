import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, ShoppingCart, Calendar, Clock, PiggyBank } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTransactions, useCategories, useSavings } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { generateMonthlyReport, generateAllTimeReport } from '../../lib/insights';
import { getSavingsBalance } from '../../lib/savings';
import { tint } from '../../lib/color';

export default function ReportsPage() {
  const transactions = useTransactions();
  const categories = useCategories();
  const savingsEntries = useSavings();
  const { formatAmount } = useCurrency();
  const { palette } = useTheme();
  const [view, setView] = useState('monthly');
  const [showAllMonths, setShowAllMonths] = useState(false);

  const monthlyReport = generateMonthlyReport(transactions, categories);
  const allTimeReport = generateAllTimeReport(transactions, savingsEntries);
  const report = view === 'monthly' ? monthlyReport : allTimeReport;
  const savingsBalance = getSavingsBalance(savingsEntries, transactions);
  const brand = palette.colors[600];

  // Half-width grid cells (~128px of content on a 360dp screen) can't fit
  // long letter-currency amounts at fixed sizes — tier down by string length.
  const statSize = (len) =>
    len > 14 ? 'text-sm'
    : len > 11 ? 'text-base'
    : len > 8 ? 'text-lg'
    : 'text-2xl';

  const cellSize = (len) =>
    len > 14 ? 'text-xs'
    : len > 11 ? 'text-sm'
    : len > 8 ? 'text-base'
    : 'text-xl';

  const StatCard = ({ icon: Icon, label, value, color = 'var(--text)', delay = 0 }) => (
    <div className={`glass-card p-4 overflow-hidden animate-slide-up stagger-${delay}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tint(color) }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p className={`${statSize(value.length)} font-black tabular-nums`} style={{ color }}>{value}</p>
    </div>
  );

  const monthsReversed = [...allTimeReport.monthlyBreakdown].reverse();
  const visibleMonths = showAllMonths ? monthsReversed : monthsReversed.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight">Reports</h2>
        <div className="flex flex-wrap gap-0.5 p-1 rounded-2xl glass">
          {[
            { key: 'monthly', label: 'Month', icon: Calendar },
            { key: 'alltime', label: 'All Time', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors duration-200 active:scale-[0.97] ${
                view === key ? 'text-white' : ''
              }`}
              style={view !== key ? { color: 'var(--text-muted)' } : {}}
            >
              {view === key && (
                <motion.span
                  layoutId="reports-view-pill"
                  className="absolute inset-0 rounded-xl shadow-md bg-primary-500"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon size={14} />
                {label}
              </span>
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
        <StatCard icon={DollarSign} label={view === 'monthly' ? 'Balance' : 'Net Savings'} value={formatAmount(view === 'monthly' ? report.balance : report.netSavings)} color="var(--color-primary-600)" delay={3} />
        <StatCard icon={Percent} label="Savings Rate" value={`${report.savingsRate}%`} color={report.savingsRate >= 20 ? '#22c55e' : '#f59e0b'} delay={4} />
      </div>

      <div className="glass-card p-5 animate-slide-up stagger-3">
        <h3 className="text-xl font-extrabold mb-4">Spending Source</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl overflow-hidden" style={{ background: 'var(--input-bg)' }}>
            <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>From Income</p>
            <p className={`${cellSize(formatAmount(report.incomeSpend).length)} font-extrabold tabular-nums`}>{formatAmount(report.incomeSpend)}</p>
          </div>
          <div className="p-3.5 rounded-2xl overflow-hidden" style={{ background: 'var(--input-bg)' }}>
            <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>From Savings</p>
            <p className={`${cellSize(formatAmount(report.savingsSpend).length)} font-extrabold tabular-nums text-amber-600`}>{formatAmount(report.savingsSpend)}</p>
          </div>
        </div>
      </div>

      {view === 'alltime' && (
        <div className="glass-card p-5 animate-slide-up stagger-4 relative overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: 'rgba(var(--brand-rgb), 0.12)', filter: 'blur(30px)' }}
          />
          <div className="relative flex items-center gap-2.5 mb-4">
            <PiggyBank size={17} style={{ color: 'var(--color-primary-600)' }} />
            <h3 className="text-xl font-extrabold">Savings</h3>
          </div>
          <div className="relative grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl" style={{ background: 'var(--input-bg)' }}>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Allocated</p>
              <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-primary-600)' }}>{formatAmount(allTimeReport.totalAllocated)}</p>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: 'var(--input-bg)' }}>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Spent</p>
              <p className="text-sm font-bold tabular-nums text-red-500">{formatAmount(allTimeReport.savingsSpend)}</p>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--color-primary-600) 10%, transparent)' }}>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Pot</p>
              <p className="text-sm font-black tabular-nums" style={{ color: 'var(--color-primary-600)' }}>{formatAmount(savingsBalance)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-5 animate-slide-up stagger-5">
        <div className="flex items-center gap-2.5 mb-4">
          <ShoppingCart size={17} className="text-primary-500" />
          <h3 className="text-xl font-extrabold">Top Spending Categories</h3>
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
                    <span className="text-sm font-semibold">{cat.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold tabular-nums">{formatAmount(cat.amount)}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                        {cat.percent}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                    <div
                      className="h-full rounded-full bar-animate"
                      style={{ background: catData?.color || 'var(--color-primary-600)', width: `${cat.percent}%`, animationDelay: `${i * 0.1}s` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {view === 'alltime' && monthsReversed.length > 0 && (
        <div className="glass-card p-5 animate-slide-up stagger-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Calendar size={17} className="text-primary-500" />
              <h3 className="text-xl font-extrabold">Monthly Summary</h3>
            </div>
            {monthsReversed.length > 6 && (
              <button
                onClick={() => setShowAllMonths(v => !v)}
                className="text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-200 active:scale-95"
                style={{ color: 'var(--color-primary-600)', background: 'color-mix(in srgb, var(--color-primary-600) 10%, transparent)' }}
              >
                {showAllMonths ? 'Show less' : `Show all (${monthsReversed.length})`}
              </button>
            )}
          </div>
          <div>
            {visibleMonths.map((m, i) => (
              <div
                key={m.month}
                className="flex items-center justify-between py-2.5"
                style={i === 0 ? {} : { borderTop: '1px solid var(--border)' }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{m.month}</p>
                  <p className="text-[11px] tabular-nums truncate" style={{ color: 'var(--text-muted)' }}>
                    In {formatAmount(m.income)} · Out {formatAmount(m.expense)} · Saved {m.saved >= 0 ? '+' : ''}{formatAmount(m.saved)}
                  </p>
                </div>
                <span className={`text-sm font-bold tabular-nums flex-shrink-0 ${m.net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {m.net >= 0 ? '+' : ''}{formatAmount(m.net)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'alltime' && allTimeReport.monthlyBreakdown.length > 1 && (
        <div className="glass-card p-5 animate-slide-up stagger-5">
          <h3 className="text-xl font-extrabold mb-4">Monthly Trend</h3>
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
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brand} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={brand} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => formatAmount(v, { compact: true })} />
                <Tooltip
                  formatter={(v, name) => [
                    formatAmount(v),
                    name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Saved',
                  ]}
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
                <Area type="monotone" dataKey="saved" stroke={brand} strokeWidth={2} fill="url(#sg)" animationDuration={1400} />
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
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: brand }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Saved</span>
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
