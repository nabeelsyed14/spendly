import Dexie from 'dexie';

const db = new Dexie('Spendly');

db.version(1).stores({
  transactions: '++id, type, category, date, createdAt, source',
  categories: '++id, name, type, isDefault',
  goals: '++id, name, createdAt',
  healthGoals: '++id, name, type, category, targetAmount, period',
});

db.version(2).stores({
  transactions: '++id, type, category, date, createdAt, source',
  categories: '++id, name, type, isDefault',
  goals: '++id, name, createdAt',
  healthGoals: '++id, name, type, category, targetAmount, period',
  savings: '++id, kind, date, createdAt',
});

export default db;
