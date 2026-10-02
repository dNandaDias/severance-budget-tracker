import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CURRENCIES, DEFAULT_CURRENCY, currencySymbol, findCurrency } from '../lib/currencies';
import { fmtMoney } from '../lib/format';

// A viewing preference shared by both modes, like dark mode: it is not tied to one period's data.
const STORAGE_KEY = 'budgetTracker_currency';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return CURRENCIES.some((c) => c.code === saved) ? saved : DEFAULT_CURRENCY;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      symbol: currencySymbol(currency),
      Icon: findCurrency(currency).icon,
      formatMoney: (amount, digits = 0) => fmtMoney(amount, digits, currency),
    }),
    [currency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyIcon = (props) => {
  const { Icon } = useCurrency();
  return <Icon {...props} />;
};
