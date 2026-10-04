import { useMemo, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../ui/Modal';
import { useCurrency } from '../../context/CurrencyContext';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const EXPENSE = '#ef4444';
const INCOME = '#22c55e';

export default function DayCalendar({ transactions, selectedMonth, categories }) {
  const { formatAmount } = useCurrency();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const dayTotals = useMemo(() => {
    const map = new Map();
    for (const t of transactions) {
      const d = new Date(t.date);
      if (isNaN(d) || d.getFullYear() !== year || d.getMonth() !== month) continue;
      const key = d.getDate();
      let entry = map.get(key);
      if (!entry) {
        entry = { expense: 0, income: 0, count: 0 };
        map.set(key, entry);
      }
      entry.count += 1;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
    }
    return map;
  }, [transactions, year, month]);

  const dayTransactions = useMemo(() => {
    if (!selectedDay) return [];
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return !isNaN(d) && isSameDay(d, selectedDay);
    });
  }, [transactions, selectedDay]);

  const dayStats = useMemo(() => {
    let expense = 0;
    let income = 0;
    for (const t of dayTransactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return { expense, income };
  }, [dayTransactions]);

  const openPicker = () => {
    const base = selectedMonth instanceof Date && !isNaN(selectedMonth) ? selectedMonth : new Date();
    setViewDate(new Date(base.getFullYear(), base.getMonth(), 1));
    setSelectedDay(null);
    setOpen(true);
  };

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  return (
    <>
      <button
        onClick={openPicker}
        className="flex items-center gap-1.5 -mx-2 px-2 py-1 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-primary-500/10 active:scale-95"
        style={{ color: 'var(--text-muted)' }}
      >
        <CalendarDays size={14} />
        Days
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={selectedDay ? 'Day' : 'Calendar'} maxWidth="max-w-xs">
        {!selectedDay && (
          <>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                aria-label="Previous month"
                className="p-2 rounded-xl transition-all duration-150 hover:bg-primary-500/10 active:scale-90"
                style={{ color: 'var(--text-muted)' }}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-base font-extrabold tabular-nums">{format(viewDate, 'MMMM yyyy')}</span>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                aria-label="Next month"
                className="p-2 rounded-xl transition-all duration-150 hover:bg-primary-500/10 active:scale-90"
                style={{ color: 'var(--text-muted)' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d, i) => (
                <span key={i} className="text-center text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstWeekday }, (_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const total = dayTotals.get(day);
                const isToday =
                  day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = selectedDay && isSameDay(selectedDay, new Date(year, month, day));
                const shown = total ? (total.expense > 0 ? total.expense : total.income) : 0;
                const color = total ? (total.expense > 0 ? EXPENSE : INCOME) : null;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(new Date(year, month, day))}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-150 active:scale-90 ${
                      isSelected ? 'bg-primary-500 text-white shadow-md' : 'hover:bg-primary-500/10'
                    } ${isToday && !isSelected ? 'ring-2 ring-primary-500/50' : ''}`}
                    style={!isSelected ? { background: total ? 'var(--input-bg)' : undefined } : {}}
                  >
                    <span className="text-xs font-bold tabular-nums leading-tight">{day}</span>
                    {total && (
                      <span
                        className="max-w-full truncate text-[9px] font-bold tabular-nums leading-tight"
                        style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : color }}
                      >
                        {formatAmount(shown, { compact: true, showSymbol: false })}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {dayTotals.size === 0 && (
              <p className="text-xs text-center pt-3" style={{ color: 'var(--text-muted)' }}>
                No transactions this month
              </p>
            )}
          </>
        )}

        {selectedDay && (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedDay(null)}
              className="flex items-center gap-1.5 text-xs font-bold transition-all duration-150 hover:opacity-70 active:scale-95"
              style={{ color: 'var(--color-primary-600)' }}
            >
              <ArrowLeft size={14} />
              Back to calendar
            </button>

            <p className="text-sm font-extrabold">{format(selectedDay, 'EEE, d MMM yyyy')}</p>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl" style={{ background: 'var(--input-bg)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Spent</p>
                <p className="text-xs font-bold tabular-nums" style={{ color: EXPENSE }}>
                  {formatAmount(dayStats.expense)}
                </p>
              </div>
              <div className="p-2 rounded-xl" style={{ background: 'var(--input-bg)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Received</p>
                <p className="text-xs font-bold tabular-nums" style={{ color: INCOME }}>
                  {formatAmount(dayStats.income)}
                </p>
              </div>
              <div className="p-2 rounded-xl" style={{ background: 'var(--input-bg)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Entries</p>
                <p className="text-xs font-bold tabular-nums">{dayTransactions.length}</p>
              </div>
            </div>

            <div className="max-h-[40vh] overflow-y-auto space-y-1.5 pr-0.5">
              {dayTransactions.length === 0 ? (
                <p className="text-sm py-3 text-center" style={{ color: 'var(--text-muted)' }}>No transactions</p>
              ) : (
                dayTransactions.map((t, i) => {
                  const cat = categories.find((c) => c.name === t.category);
                  const isIncome = t.type === 'income';
                  return (
                    <div key={t.id ?? `${t.date}-${i}`} className="flex items-center gap-2.5 p-2 rounded-xl" style={{ background: 'var(--input-bg)' }}>
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: cat?.color || 'var(--color-primary-600)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{t.category || 'Transaction'}</p>
                        {t.description && t.description !== t.category && (
                          <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: isIncome ? INCOME : EXPENSE }}>
                        {isIncome ? '+' : '-'}{formatAmount(t.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
