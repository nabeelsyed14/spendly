import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const CURRENCY_FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', INR: '🇮🇳', JPY: '🇯🇵',
  CAD: '🇨🇦', AUD: '🇦🇺', BRL: '🇧🇷', PKR: '🇵🇰', AED: '🇦🇪',
  SAR: '🇸🇦', CNY: '🇨🇳', KRW: '🇰🇷', SGD: '🇸🇬', CHF: '🇨🇭',
  SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', PLN: '🇵🇱', TRY: '🇹🇷',
  ZAR: '🇿🇦', NGN: '🇳🇬', KES: '🇰🇪', EGP: '🇪🇬', THB: '🇹🇭',
  MYR: '🇲🇾', IDR: '🇮🇩', PHP: '🇵🇭', VND: '🇻🇳', NZD: '🇳🇿',
  HKD: '🇭🇰', MXN: '🇲🇽', RUB: '🇷🇺', UAH: '🇺🇦', ILS: '🇮🇱',
  CLP: '🇨🇱', COP: '🇨🇴', ARS: '🇦🇷', PEN: '🇵🇪', CZK: '🇨🇿',
  HUF: '🇭🇺', RON: '🇷🇴', BGN: '🇧🇬', HRK: '🇭🇷', ISK: '🇮🇸',
};

function formatPreview(locale, code) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: code === 'JPY' || code === 'KRW' || code === 'VND' || code === 'CLP' || code === 'IDR' ? 0 : 2,
      maximumFractionDigits: code === 'JPY' || code === 'KRW' || code === 'VND' || code === 'CLP' || code === 'IDR' ? 0 : 2,
    }).format(['JPY', 'KRW', 'VND', 'CLP'].includes(code) ? 12345 : 1234.56);
  } catch {
    return code;
  }
}

export default function CurrencyPicker() {
  const { currencies, setCurrency, hasChosenCurrency } = useCurrency();
  const [selected, setSelected] = useState('USD');
  const [query, setQuery] = useState('');

  if (hasChosenCurrency) return null;

  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(query.toLowerCase()) ||
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl p-6 animate-scale-in glass-strong overflow-hidden"
        style={{ border: '1px solid var(--border-solid)' }}
      >
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg glow">
            <img src="/favicon.svg" alt="Spendly" className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold mb-1.5">Welcome to Spendly</h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Pick your currency to get started
          </p>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search currencies..."
            className="input w-full !pl-9 !rounded-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto mb-4 pr-1 rounded-2xl">
          {filtered.map(c => (
            <button
              key={c.code}
              onClick={() => setSelected(c.code)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all duration-200 active:scale-[0.97] ${
                selected === c.code
                  ? 'border-primary-500 bg-primary-500/10 glow-sm'
                  : 'hover:bg-primary-500/5'
              }`}
              style={{ borderColor: selected === c.code ? undefined : 'var(--border-solid)' }}
            >
              <span className="text-lg leading-none">{CURRENCY_FLAGS[c.code] || '💱'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold">{c.code}</p>
                <p className="text-[10px] truncate font-medium" style={{ color: 'var(--text-muted)' }}>{c.name}</p>
              </div>
              {selected === c.code && (
                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-2 text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              No currencies found
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl mb-4 text-center" style={{ background: 'var(--input-bg)' }}>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Preview
          </p>
          <p className="text-2xl font-bold tracking-tight">
            {formatPreview(
              currencies.find(c => c.code === selected)?.locale || 'en-US',
              selected
            )}
          </p>
        </div>

        <button
          onClick={() => setCurrency(selected)}
          className="w-full py-3.5 rounded-full btn-primary font-bold text-base"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
