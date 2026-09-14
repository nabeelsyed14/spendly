export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#ef4444', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Housing', icon: 'Home', color: '#8b5cf6', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Transport', icon: 'Car', color: '#3b82f6', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Groceries', icon: 'ShoppingCart', color: '#22c55e', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Entertainment', icon: 'Film', color: '#f59e0b', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Health', icon: 'Heart', color: '#14b8a6', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Subscriptions', icon: 'CreditCard', color: '#8b5cf6', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Education', icon: 'BookOpen', color: '#0ea5e9', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Gifts', icon: 'Gift', color: '#d946ef', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Utilities', icon: 'Zap', color: '#f97316', type: 'expense', budgetLimit: 0, isDefault: true },
  { name: 'Other', icon: 'MoreHorizontal', color: '#71717a', type: 'expense', budgetLimit: 0, isDefault: true },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'Briefcase', color: '#22c55e', type: 'income', budgetLimit: 0, isDefault: true },
  { name: 'Investments', icon: 'TrendingUp', color: '#3b82f6', type: 'income', budgetLimit: 0, isDefault: true },
  { name: 'Freelance', icon: 'Laptop', color: '#8b5cf6', type: 'income', budgetLimit: 0, isDefault: true },
  { name: 'Gifts', icon: 'Gift', color: '#d946ef', type: 'income', budgetLimit: 0, isDefault: true },
  { name: 'Other', icon: 'MoreHorizontal', color: '#71717a', type: 'income', budgetLimit: 0, isDefault: true },
];

export const ALL_DEFAULTS = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
