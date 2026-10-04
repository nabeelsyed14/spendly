import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../ui/Modal';

const monthLabel = (year, i) => format(new Date(year, i, 1), 'MMM');

export default function MonthPicker({ selected, onChange, transactions }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => selected.getFullYear());

  const monthsWithData = new Set();
  for (const t of transactions) {
    const d = new Date(t.date);
    if (!isNaN(d)) monthsWithData.add(d.getFullYear() * 12 + d.getMonth());
  }

  const today = new Date();
  const selectedKey = selected.getFullYear() * 12 + selected.getMonth();
  const todayKey = today.getFullYear() * 12 + today.getMonth();

  const openPicker = () => {
    setViewYear(selected.getFullYear());
    setOpen(true);
  };

  const pick = (monthIndex) => {
    onChange(new Date(viewYear, monthIndex, 1));
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={openPicker}
        className="flex items-center gap-1.5 -mx-2 px-2 py-1 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-primary-500/10 active:scale-95"
        style={{ color: 'var(--text-muted)' }}
      >
        <Calendar size={14} />
        {format(selected, 'MMMM yyyy')}
        <ChevronDown size={14} />
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Select Month" maxWidth="max-w-xs">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewYear(y => y - 1)}
            aria-label="Previous year"
            className="p-2 rounded-xl transition-all duration-150 hover:bg-primary-500/10 active:scale-90"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-lg font-extrabold tabular-nums">{viewYear}</span>
          <button
            onClick={() => setViewYear(y => y + 1)}
            aria-label="Next year"
            className="p-2 rounded-xl transition-all duration-150 hover:bg-primary-500/10 active:scale-90"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, i) => {
            const key = viewYear * 12 + i;
            const isSelected = key === selectedKey;
            const isCurrent = key === todayKey;
            const hasData = monthsWithData.has(key);
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                className={`relative py-3 pb-4 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'hover:bg-primary-500/10'
                } ${isCurrent && !isSelected ? 'ring-2 ring-primary-500/50' : ''}`}
                style={!isSelected ? { background: 'var(--input-bg)', color: 'var(--text)' } : {}}
              >
                {monthLabel(viewYear, i)}
                {hasData && (
                  <span
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--color-primary-600)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {selectedKey !== todayKey && (
          <button
            onClick={() => { onChange(new Date(today.getFullYear(), today.getMonth(), 1)); setOpen(false); }}
            className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:bg-primary-500/10 active:scale-95"
            style={{ color: 'var(--color-primary-600)' }}
          >
            Jump to today
          </button>
        )}
      </Modal>
    </>
  );
}
