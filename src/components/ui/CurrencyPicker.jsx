import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function CurrencyPicker() {
  const { currencies, setCurrency, formatAmount, hasChosenCurrency } = useCurrency();
  const [selected, setSelected] = useState('USD');
  const [show, setShow] = useState(true);

  if (hasChosenCurrency || !show) return null;

  const handleConfirm = () => {
    setCurrency(selected);
    setShow(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md rounded-3xl shadow-2xl p-6"
          style={{ background: 'var(--surface)' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="text-center mb-6">
            <img src="/favicon.svg" alt="Spendly" className="w-14 h-14 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold mb-1">Welcome to Spendly</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pick your currency to get started</p>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto mb-6 pr-1">
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => setSelected(c.code)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  selected === c.code
                    ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500/30'
                    : 'hover:border-primary-300 dark:hover:border-primary-700'
                }`}
                style={{ borderColor: selected === c.code ? undefined : 'var(--border)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{c.code}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{c.name}</p>
                  <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                    {new Intl.NumberFormat(c.locale, {
                      style: 'currency', currency: c.code, currencyDisplay: 'symbol',
                      minimumFractionDigits: c.code === 'JPY' ? 0 : 2,
                      maximumFractionDigits: c.code === 'JPY' ? 0 : 2,
                    }).format(123456.78)}
                  </p>
                </div>
                {selected === c.code && (
                  <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg shadow-primary-600/30 active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
