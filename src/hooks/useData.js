import { useLiveQuery } from 'dexie-react-hooks';
import db from '../lib/db';
import { ALL_DEFAULTS } from '../lib/categories';

async function seedCategories() {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd(ALL_DEFAULTS.map(c => ({ ...c })));
  }
}

seedCategories();

export function useTransactions() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray()) || [];
  return transactions;
}

export function useCategories() {
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  return categories;
}

export function useGoals() {
  const goals = useLiveQuery(() => db.goals.toArray()) || [];
  return goals;
}

export function useHealthGoals() {
  const goals = useLiveQuery(() => db.healthGoals.toArray()) || [];
  return goals;
}

export async function addTransaction(data) {
  return db.transactions.add({ ...data, createdAt: new Date().toISOString() });
}

export async function updateTransaction(id, data) {
  return db.transactions.update(id, data);
}

export async function deleteTransaction(id) {
  return db.transactions.delete(id);
}

export async function addGoal(data) {
  return db.goals.add({ ...data, createdAt: new Date().toISOString() });
}

export async function updateGoal(id, data) {
  return db.goals.update(id, data);
}

export async function deleteGoal(id) {
  return db.goals.delete(id);
}

export async function addHealthGoal(data) {
  return db.healthGoals.add(data);
}

export async function updateHealthGoal(id, data) {
  return db.healthGoals.update(id, data);
}

export async function deleteHealthGoal(id) {
  return db.healthGoals.delete(id);
}

export async function addCategory(data) {
  return db.categories.add({ ...data, isDefault: false });
}

export async function updateCategory(id, data) {
  return db.categories.update(id, data);
}

export async function deleteCategory(id) {
  return db.categories.delete(id);
}
