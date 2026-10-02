import { Banknote, DollarSign, Euro, IndianRupee, PoundSterling, SwissFranc } from 'lucide-react';

// Display only: switching currency changes the symbol and number format, never the stored amounts.
// Currencies without their own icon in lucide fall back to a banknote.
export const CURRENCIES = [
  { code: 'EUR', name: 'Euro', icon: Euro },
  { code: 'USD', name: 'US dollar', icon: DollarSign },
  { code: 'GBP', name: 'Pound sterling', icon: PoundSterling },
  { code: 'CHF', name: 'Swiss franc', icon: SwissFranc },
  { code: 'SEK', name: 'Swedish krona', icon: Banknote },
  { code: 'NOK', name: 'Norwegian krone', icon: Banknote },
  { code: 'DKK', name: 'Danish krone', icon: Banknote },
  { code: 'PLN', name: 'Polish zloty', icon: Banknote },
  { code: 'CZK', name: 'Czech koruna', icon: Banknote },
  { code: 'CAD', name: 'Canadian dollar', icon: DollarSign },
  { code: 'AUD', name: 'Australian dollar', icon: DollarSign },
  { code: 'BRL', name: 'Brazilian real', icon: DollarSign },
  { code: 'INR', name: 'Indian rupee', icon: IndianRupee },
];

export const DEFAULT_CURRENCY = 'EUR';

export const findCurrency = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

export const currencySymbol = (code) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
    .formatToParts(0)
    .find((part) => part.type === 'currency').value;

export const currencyLabel = (code) => {
  const symbol = currencySymbol(code);
  return symbol === code ? code : `${symbol} ${code}`;
};
