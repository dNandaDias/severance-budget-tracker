export const DEFAULT_CATEGORIES = [
  'Groceries', 'Dining Out', 'Transportation', 'Entertainment', 'Shopping & Clothing',
  'Household', 'Health & Wellness', 'Subscriptions', 'Travel', 'Education', 'Miscellaneous',
];

// Expense arrays saved before categories existed won't have one — default them
// to Miscellaneous rather than leaving the field undefined everywhere it's read.
export const withCategoryFallback = (arr) =>
  arr.map((item) => ({ ...item, category: item.category || 'Miscellaneous' }));
