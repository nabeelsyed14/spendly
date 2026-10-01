import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useTransactions } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { useProfile } from '../../context/ProfileContext';
import { getMonthlyTotals } from '../../lib/insights';
import Avatar from '../ui/Avatar';

function AnimatedNumber({ value, formatAmount }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = displayed;
    const diff = value - from;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + diff * eased);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return <span>{formatAmount(displayed)}</span>;
}

export default function BalanceCard() {
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const { userName, getGreeting, avatarPhoto } = useProfile();
  const { income, expense, balance, savingsSpend } = getMonthlyTotals(transactions);

  const greeting = userName ? `${getGreeting()}, ${userName}` : getGreeting();

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 md:p-7 text-white animate-scale-in glow-pulse" style={{ background: 'linear-gradient(135deg, #6d28d9, #5b21b6, #4c1d95)' }}>
      <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/5 -translate-y-14 translate-x-14" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-12 -translate-x-10" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5 animate-slide-up">
          <Avatar name={userName || 'User'} photo={avatarPhoto} size={40} />
          <span className="text-base font-semibold text-white/85">{greeting}</span>
        </div>

        <p className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight animate-slide-up stagger-1">
          <AnimatedNumber value={balance} formatAmount={formatAmount} />
        </p>

        <div className="flex gap-2.5 animate-slide-up stagger-2">
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={17} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Income</p>
              <p className="text-sm font-bold tabular-nums">{formatAmount(income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
              <TrendingDown size={17} className="text-red-300" />
            </div>
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Spent</p>
              <p className="text-sm font-bold tabular-nums">{formatAmount(expense)}</p>
            </div>
          </div>
          {savingsSpend > 0 && (
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 animate-scale-in stagger-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <PiggyBank size={17} className="text-amber-300" />
              </div>
              <div>
                <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Savings</p>
                <p className="text-sm font-bold tabular-nums">{formatAmount(savingsSpend)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
