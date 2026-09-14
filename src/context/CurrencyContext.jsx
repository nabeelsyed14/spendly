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
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'en-PK' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
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

  const setCurrency = useCallback((code) => {
    setCurrencyCode(code);
    localStorage.setItem('spendly-currency', code);
    localStorage.setItem('spendly-currency-chosen', 'true');
    setHasChosen(true);
  }, []);

  const formatAmount = useCallback((value, opts = {}) => {
    const { showSymbol = true, compact = false } = opts;
    if (typeof value !== 'number' || isNaN(value)) return showSymbol ? `${currency.symbol}0` : '0';

    try {
      const formatter = new Intl.NumberFormat(currency.locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: showSymbol ? currency.code : undefined,
        currencyDisplay: 'symbol',
        minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
        ...(compact ? { notation: 'compact', compactDisplay: 'short' } : {}),
      });
      return formatter.format(value);
    } catch {
      return `${currency.symbol}${value.toFixed(2)}`;
    }
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, currencies: CURRENCIES, setCurrency, formatAmount, hasChosenCurrency: hasChosen }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
