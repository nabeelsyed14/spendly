import Dexie from 'dexie';

const db = new Dexie('Spendly');

db.version(1).stores({
  transactions: '++id, type, category, date, createdAt, source',
  categories: '++id, name, type, isDefault',
  goals: '++id, name, createdAt',
  healthGoals: '++id, name, type, category, targetAmount, period',
});

// Only declare the new store — Dexie carries forward all unchanged stores automatically.
db.version(2).stores({
  savings: '++id, kind, date, createdAt',
});

export default db;
