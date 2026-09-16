import { useState } from 'react';
import { Check } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const CURRENCY_FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', INR: '🇮🇳', JPY: '🇯🇵',
  CAD: '🇨🇦', AUD: '🇦🇺', BRL: '🇧🇷', PKR: '🇵🇰', AED: '🇦🇪',
  SAR: '🇸🇦', CNY: '🇨🇳',
};

function formatPreview(locale, code) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: code === 'JPY' ? 0 : 2,
      maximumFractionDigits: code === 'JPY' ? 0 : 2,
    }).format(code === 'JPY' ? 12345 : 1234.56);
  } catch {
    return code;
  }
}

export default function CurrencyPicker() {
  const { currencies, setCurrency, hasChosenCurrency } = useCurrency();
  const [selected, setSelected] = useState('USD');
  const [show, setShow] = useState(true);

  if (hasChosenCurrency || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scale-in"
        style={{ background: 'var(--surface-solid)', border: '1px solid var(--border-solid)' }}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg glow">
            <img src="/favicon.svg" alt="Spendly" className="w-14 h-14" />
          </div>
          <h1 className="text-xl font-bold mb-1">Welcome to Spendly</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pick your currency to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4 pr-1">
          {currencies.map(c => (
            <button
              key={c.code}
              onClick={() => setSelected(c.code)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 active:scale-[0.97] ${
                selected === c.code
                  ? 'border-primary-500 bg-primary-500/10 glow-sm'
                  : 'hover:bg-primary-500/5'
              }`}
              style={{ borderColor: selected === c.code ? undefined : 'var(--border-solid)' }}
            >
              <span className="text-xl leading-none">{CURRENCY_FLAGS[c.code]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{c.code}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{c.name}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text)' }}>
                  {formatPreview(c.locale, c.code)}
                </p>
              </div>
              {selected === c.code && (
                <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-3 rounded-xl mb-4" style={{ background: 'var(--input-bg)' }}>
          <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Preview</p>
          <p className="text-lg font-bold">{formatPreview(
            currencies.find(c => c.code === selected)?.locale || 'en-US',
            selected
          )}</p>
        </div>

        <button
          onClick={() => setCurrency(selected)}
          className="w-full py-3 rounded-xl btn-primary font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
