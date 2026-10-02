import { createContext, useContext, useState, useCallback } from 'react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', locale: 'en-PK' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', locale: 'en-SA' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
];

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem('spendly-currency') || 'USD';
  });

  const [hasChosen, setHasChosen] = useState(() => {
    return localStorage.getItem('spendly-currency-chosen') === 'true';
  });

  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  // Letter-based symbols (AED, SAR, Rs) get a space; glyph symbols ($, €, ₹) don't.
  const withSymbol = useCallback((formatted) =>
    /^[A-Za-z]/.test(currency.symbol) ? `${currency.symbol} ${formatted}` : `${currency.symbol}${formatted}`,
    [currency]);

  const setCurrency = useCallback((code) => {
    setCurrencyCode(code);
    localStorage.setItem('spendly-currency', code);
    localStorage.setItem('spendly-currency-chosen', 'true');
    setHasChosen(true);
  }, []);

  const formatAmount = useCallback((value, opts = {}) => {
    const { showSymbol = true, compact = false } = opts;
    if (typeof value !== 'number' || isNaN(value)) return showSymbol ? withSymbol('0') : '0';

    const isZeroDecimal = currency.code === 'JPY';
    const hasCents = !isZeroDecimal && Math.round(Math.abs(value) * 100) % 100 !== 0;
    const minFractionDigits = isZeroDecimal || !hasCents ? 0 : 2;

    try {
      const formatter = new Intl.NumberFormat(currency.locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: showSymbol ? currency.code : undefined,
        currencyDisplay: 'symbol',
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: isZeroDecimal ? 0 : 2,
        ...(compact ? { notation: 'compact', compactDisplay: 'short' } : {}),
      });
      // Intl inserts U+00A0 (non-breaking space) after letter symbols like "AED",
      // which makes long amounts unbreakable and overflows narrow containers.
      return formatter.format(value).replace(/\u00A0/g, ' ');
    } catch {
      const num = hasCents ? value.toFixed(2) : value.toFixed(0);
      return showSymbol ? withSymbol(num) : num;
    }
  }, [currency, withSymbol]);

  return (
    <CurrencyContext.Provider value={{ currency, currencies: CURRENCIES, setCurrency, formatAmount, hasChosenCurrency: hasChosen }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
