export const fmtEUR = (value, digits = 0) => {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
};
