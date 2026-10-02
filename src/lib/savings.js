import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const toDate = (d) => (typeof d === 'string' ? parseISO(d) : d);

const inMonth = (date, ref) =>
  isWithinInterval(toDate(date), { start: startOfMonth(ref), end: endOfMonth(ref) });

// Persistent savings pot: deposits in, withdrawals out, "From Savings"
// spending drawn down. Never resets on month rollover.
export function getSavingsBalance(savings, transactions) {
  const deposits = savings
    .filter(s => s.kind === 'deposit')
    .reduce((sum, s) => sum + s.amount, 0);
  const withdrawals = savings
    .filter(s => s.kind === 'withdraw')
    .reduce((sum, s) => sum + s.amount, 0);
  const spentFromSavings = transactions
    .filter(t => t.type === 'expense' && t.source === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);
  return deposits - withdrawals - spentFromSavings;
}

export function getSavingsMonthStats(savings, transactions, date = new Date()) {
  const allocated = savings
    .filter(s => s.kind === 'deposit' && inMonth(s.date, date))
    .reduce((sum, s) => sum + s.amount, 0);
  const withdrawn = savings
    .filter(s => s.kind === 'withdraw' && inMonth(s.date, date))
    .reduce((sum, s) => sum + s.amount, 0);
  const spent = transactions
    .filter(t => t.type === 'expense' && t.source === 'savings' && inMonth(t.date, date))
    .reduce((sum, t) => sum + t.amount, 0);
  return { allocated, withdrawn, spent };
}

export function getSavingsTotals(savings) {
  const allocated = savings.filter(s => s.kind === 'deposit').reduce((sum, s) => sum + s.amount, 0);
  const withdrawn = savings.filter(s => s.kind === 'withdraw').reduce((sum, s) => sum + s.amount, 0);
  return { allocated, withdrawn };
}
