import { useRef } from 'react';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useTransactions, useSavings } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { useProfile } from '../../context/ProfileContext';
import { getMonthlyTotals, getAllTimeTotals } from '../../lib/insights';
import { getSavingsBalance } from '../../lib/savings';
import Avatar from '../ui/Avatar';
import AnimatedNumber from '../ui/AnimatedNumber';

export default function BalanceCard() {
  const transactions = useTransactions();
  const savings = useSavings();
  const { formatAmount } = useCurrency();
  const { userName, getGreeting, avatarPhoto } = useProfile();
  const { income, expense, balance } = getMonthlyTotals(transactions);
  const { netSavings } = getAllTimeTotals(transactions);
  const savingsBalance = getSavingsBalance(savings, transactions);
  const cardRef = useRef(null);

  const greeting = userName ? `${getGreeting()}, ${userName}` : getGreeting();

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el || !window.matchMedia('(hover: hover)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`;
  };

  const resetTilt = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  return (
    <div className="perspective">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        className="tilt relative overflow-hidden rounded-3xl p-6 md:p-7 text-white animate-scale-in glow-pulse"
        style={{ background: 'linear-gradient(135deg, var(--brand-hero))' }}
      >
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/5 -translate-y-14 translate-x-14" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-12 -translate-x-10" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative z-10 depth">
          <div className="flex items-center gap-3 mb-5 animate-slide-up">
            <Avatar name={userName || 'User'} photo={avatarPhoto} size={40} />
            <span className="text-base font-semibold text-white/85">{greeting}</span>
          </div>

          <div className="flex items-center justify-between gap-2 mb-1.5 animate-slide-up stagger-1">
            <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Total Balance</p>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 tabular-nums"
              style={{ color: balance >= 0 ? '#a7f3d0' : '#fecaca' }}
            >
              {balance >= 0 ? '+' : ''}{formatAmount(balance)} this month
            </span>
          </div>

          <p className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight animate-slide-up stagger-2">
            <AnimatedNumber value={netSavings} formatAmount={formatAmount} />
          </p>

          <div className="flex flex-wrap gap-2.5 animate-slide-up stagger-3">
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
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <PiggyBank size={17} className="text-amber-300" />
              </div>
              <div>
                <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Savings</p>
                <p className="text-sm font-bold tabular-nums">{formatAmount(savingsBalance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
