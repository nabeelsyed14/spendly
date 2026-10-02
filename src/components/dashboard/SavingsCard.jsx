import { useState } from 'react';
import { PiggyBank, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useSavings, useTransactions, addSavingsEntry } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { getSavingsBalance, getSavingsMonthStats } from '../../lib/savings';
import AnimatedNumber from '../ui/AnimatedNumber';
import Modal from '../ui/Modal';
import TiltCard from '../ui/TiltCard';

export default function SavingsCard() {
  const savings = useSavings();
  const transactions = useTransactions();
  const { formatAmount } = useCurrency();
  const [formMode, setFormMode] = useState(null);

  const balance = getSavingsBalance(savings, transactions);
  const { allocated, spent } = getSavingsMonthStats(savings, transactions);
  const recent = savings.slice(0, 3);

  return (
    <>
      <TiltCard className="glass-card h-full p-5 animate-slide-up stagger-1 relative overflow-hidden">
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'rgba(var(--brand-rgb), 0.12)', filter: 'blur(30px)' }}
      />

      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-primary-600) 10%, transparent)' }}>
            <PiggyBank size={17} style={{ color: 'var(--color-primary-600)' }} />
          </div>
          <h3 className="text-xl font-extrabold">Savings</h3>
        </div>
        <button
          onClick={() => setFormMode('deposit')}
          className="flex items-center gap-1 px-3 py-1.5 btn-primary text-xs"
        >
          <Plus size={14} strokeWidth={3} />
          Add
        </button>
      </div>

      <div className="relative mb-4">
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
          Available pot
        </p>
        <p className="text-4xl font-extrabold tracking-tight tabular-nums">
          <AnimatedNumber value={balance} formatAmount={formatAmount} />
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 rounded-2xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>
            Allocated this month
          </p>
          <p className="text-base font-extrabold tabular-nums" style={{ color: 'var(--color-primary-600)' }}>
            +{formatAmount(allocated)}
          </p>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: 'var(--input-bg)' }}>
          <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>
            Spent from savings
          </p>
          <p className="text-base font-extrabold tabular-nums text-red-500">
            −{formatAmount(spent)}
          </p>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="relative space-y-1.5 mb-4">
          {recent.map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: entry.kind === 'deposit'
                      ? 'color-mix(in srgb, var(--color-primary-600) 10%, transparent)'
                      : 'color-mix(in srgb, #ef4444 10%, transparent)',
                    color: entry.kind === 'deposit' ? 'var(--color-primary-600)' : '#ef4444',
                  }}
                >
                  {entry.kind === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{entry.note || (entry.kind === 'deposit' ? 'Allocation' : 'Withdrawal')}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold tabular-nums flex-shrink-0">
                {entry.kind === 'deposit' ? '+' : '−'}{formatAmount(entry.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex gap-2">
        <button onClick={() => setFormMode('deposit')} className="flex-1 py-2.5 btn-primary text-sm">
          Allocate
        </button>
        <button
          onClick={() => setFormMode('withdraw')}
          className="flex-1 py-2.5 rounded-full text-sm font-bold border transition-all duration-200 active:scale-95"
          style={{ borderColor: 'var(--border-solid)', color: 'var(--text)' }}
        >
          Withdraw
        </button>
      </div>
      </TiltCard>

      {formMode && <SavingsForm mode={formMode} onClose={() => setFormMode(null)} />}
    </>
  );
}

function SavingsForm({ mode, onClose }) {
  const [kind, setKind] = useState(mode);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const { currency } = useCurrency();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    await addSavingsEntry({
      kind,
      amount: value,
      note: note.trim(),
      date: new Date(date).toISOString(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={kind === 'deposit' ? 'Allocate to Savings' : 'Withdraw from Savings'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-1.5 p-1 rounded-xl animate-slide-up stagger-1" style={{ background: 'var(--input-bg)' }}>
            {[
              { value: 'deposit', label: 'Allocate', icon: ArrowDownLeft },
              { value: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setKind(opt.value)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-bold transition-colors duration-200 active:scale-[0.97] ${
                  kind === opt.value ? 'text-white' : ''
                }`}
                style={kind !== opt.value ? { color: 'var(--text-muted)' } : {}}
              >
                {kind === opt.value && (
                  <motion.span
                    layoutId="savings-kind-pill"
                    className="absolute inset-0 rounded-lg shadow-md bg-primary-500"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <opt.icon size={15} />
                  {opt.label}
                </span>
              </button>
            ))}
        </div>

        <div className="animate-slide-up stagger-2">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              {currency.symbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="input w-full !pl-11 pr-3 py-3 text-lg font-bold"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="animate-slide-up stagger-3">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={kind === 'deposit' ? 'e.g. Salary set aside' : 'e.g. Emergency use'}
            className="input w-full"
          />
        </div>

        <div className="animate-slide-up stagger-4">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input w-full"
          />
        </div>

        <button type="submit" className="w-full py-3 btn-primary font-semibold animate-slide-up stagger-5">
          {kind === 'deposit' ? 'Add to Savings' : 'Withdraw'}
        </button>
      </form>
    </Modal>
  );
}
