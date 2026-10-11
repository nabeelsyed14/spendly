import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import Modal from './Modal';

// In-app category picker: native <select> hands off to an unthemeable OS
// dialog inside WebViews, so review flows use this instead.
export default function CategoryPicker({ value, categories, onChange }) {
  const [open, setOpen] = useState(false);
  const current = categories.find((c) => c.name === value);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="input w-full text-xs cursor-pointer flex items-center gap-2 text-left transition-all duration-150 active:scale-[0.99]"
        style={{ borderColor: 'transparent', background: 'transparent' }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: current?.color || '#737373' }}
        />
        <span className="flex-1 min-w-0 truncate font-semibold">{value}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Choose category" maxWidth="max-w-xs">
        <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-0.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { onChange(c.name); setOpen(false); }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:bg-primary-500/5 active:scale-95"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: c.color }}
              />
              <span className="flex-1 text-left truncate">{c.name}</span>
              {c.name === value && (
                <Check size={15} style={{ color: 'var(--color-primary-600)' }} className="flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
