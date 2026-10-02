export const fmtMoney = (value, digits = 0, currency = 'EUR') => {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
};
