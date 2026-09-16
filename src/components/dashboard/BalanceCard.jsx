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
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white animate-scale-in glow-pulse" style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e, #115e59)' }}>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-10 -translate-x-8" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-4 animate-slide-up">
          <Avatar name={userName || 'User'} photo={avatarPhoto} size={36} />
          <span className="text-sm font-medium text-white/80">{greeting}</span>
        </div>

        <p className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight animate-slide-up stagger-1">
          <AnimatedNumber value={balance} formatAmount={formatAmount} />
        </p>

        <div className="flex gap-2 animate-slide-up stagger-2">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-base text-white/50 uppercase tracking-wider font-medium">Income</p>
              <p className="text-sm font-bold tabular-nums">{formatAmount(income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <TrendingDown size={16} className="text-red-300" />
            </div>
            <div>
              <p className="text-base text-white/50 uppercase tracking-wider font-medium">Spent</p>
              <p className="text-sm font-bold tabular-nums">{formatAmount(expense)}</p>
            </div>
          </div>
          {savingsSpend > 0 && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 border border-white/10 animate-scale-in stagger-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <PiggyBank size={16} className="text-amber-300" />
              </div>
              <div>
                <p className="text-base text-white/50 uppercase tracking-wider font-medium">Savings</p>
                <p className="text-sm font-bold tabular-nums">{formatAmount(savingsSpend)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
