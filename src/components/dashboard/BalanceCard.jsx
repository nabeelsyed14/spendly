import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { useTransactions } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { useProfile } from '../../context/ProfileContext';
import { getMonthlyTotals } from '../../lib/insights';

function AnimatedNumber({ value, format }) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => format(v));

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 0.8, ease: 'easeOut' });
    return controls.stop;
  }, [value, motionVal, format]);

  return <motion.span>{display}</motion.span>;
}

export default function BalanceCard() {
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const { userName, getGreeting } = useProfile();
  const { income, expense, balance, incomeSpend, savingsSpend } = getMonthlyTotals(transactions);

  const greeting = userName ? `${getGreeting()}, ${userName}` : getGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-6 md:p-7 text-white"
      style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 40%, #115e59 100%)',
        boxShadow: '0 8px 32px rgba(13, 148, 136, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/[0.08] animate-pulse-soft" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/[0.05] animate-float" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/[0.04]" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Wallet size={16} />
          </div>
          <span className="text-sm font-medium text-white/80">{greeting}</span>
        </div>

        <p className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          <AnimatedNumber value={balance} format={formatAmount} />
        </p>

        <div className="flex gap-3">
          <div className="flex items-center gap-2.5 bg-white/[0.12] backdrop-blur-sm rounded-2xl px-3 py-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/25 flex items-center justify-center">
              <TrendingUp size={14} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Income</p>
              <p className="text-sm font-bold">{formatAmount(income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/[0.12] backdrop-blur-sm rounded-2xl px-3 py-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-400/25 flex items-center justify-center">
              <TrendingDown size={14} className="text-red-300" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Spent</p>
              <p className="text-sm font-bold">{formatAmount(expense)}</p>
            </div>
          </div>
          {savingsSpend > 0 && (
            <div className="flex items-center gap-2.5 bg-white/[0.12] backdrop-blur-sm rounded-2xl px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/25 flex items-center justify-center">
                <PiggyBank size={14} className="text-amber-300" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">From Savings</p>
                <p className="text-sm font-bold">{formatAmount(savingsSpend)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
