const DATA_KEY_PREFIXES = ['budgetTracker_severance_', 'budgetTracker_generic_'];

const isFilled = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.values(value).some((n) => Number(n) > 0);
  return false;
};

// True when either mode holds any amounts. A mode that was cleared with "Start a new period" does not count.
export const hasSavedData = () => {
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!DATA_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) continue;
    try {
      if (isFilled(JSON.parse(localStorage.getItem(key)))) return true;
    } catch {
      // an unreadable value is treated as no data
    }
  }
  return false;
};
