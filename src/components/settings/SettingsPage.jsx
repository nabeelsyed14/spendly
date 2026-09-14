import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Tag, Moon, Sun, Globe, User, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useProfile } from '../../context/ProfileContext';
import { useTransactions, useCategories, addCategory, deleteCategory } from '../../hooks/useData';
import { downloadCSV, parseCSV } from '../../lib/export';
import db from '../../lib/db';
import Modal from '../ui/Modal';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { currency, currencies, setCurrency, formatAmount } = useCurrency();
  const { userName, setUserName } = useProfile();
  const transactions = useTransactions();
  const categories = useCategories();
  const [showCatManager, setShowCatManager] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = () => downloadCSV(transactions);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length > 0) {
      await db.transactions.bulkAdd(parsed.map(t => ({ ...t, createdAt: new Date().toISOString() })));
      alert(`Imported ${parsed.length} transactions`);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold">Settings</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <SettingCard
          icon={User}
          label="Your Name"
          description={userName || 'Not set'}
          color="#0d9488"
          action={
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Enter name"
              className="w-32 px-3 py-2 rounded-xl text-xs font-semibold border outline-none focus:ring-2 focus:ring-primary-500/30"
              style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
            />
          }
        />

        <SettingCard
          icon={theme === 'dark' ? Moon : Sun}
          label="Theme"
          description={`Currently using ${theme} mode`}
          color="#0d9488"
          action={
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20 active:scale-[0.97] transition-all"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          }
        />

        <SettingCard
          icon={Globe}
          label="Currency"
          description={
            <span className="flex items-center gap-2">
              <span>{currency.name} ({currency.code})</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 font-mono">
                {formatAmount(123456.78)}
              </span>
            </span>
          }
          color="#0d9488"
          action={
            <select
              value={currency.code}
              onChange={e => setCurrency(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer"
              style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
          }
        />

        <SettingCard
          icon={Download}
          label="Export Data"
          description="Download your transactions as CSV"
          color="#0d9488"
          action={
            <button
              onClick={handleExport}
              className="p-2.5 rounded-xl border transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20 active:scale-[0.95]"
              style={{ borderColor: 'var(--border)' }}
            >
              <Download size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          }
        />

        <SettingCard
          icon={Upload}
          label="Import Data"
          description="Import transactions from CSV"
          color="#0d9488"
          action={
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl border transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20 active:scale-[0.95]"
                style={{ borderColor: 'var(--border)' }}
              >
                <Upload size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </>
          }
        />

        <SettingCard
          icon={Trash2}
          label="Clear History"
          description="Delete all transactions and start fresh"
          color="#ef4444"
          action={
            <button
              onClick={async () => {
                if (confirm('Delete ALL transactions? This cannot be undone.')) {
                  await db.transactions.clear();
                }
              }}
              className="p-2.5 rounded-xl border transition-all hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.95] text-red-500"
              style={{ borderColor: 'var(--border)' }}
            >
              <Trash2 size={16} />
            </button>
          }
        />

        <SettingCard
          icon={Tag}
          label="Manage Categories"
          description={`${categories.length} categories configured`}
          color="#0d9488"
          action={
            <button
              onClick={() => setShowCatManager(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20 active:scale-[0.97]"
              style={{ borderColor: 'var(--border)' }}
            >
              Edit
            </button>
          }
        />
      </motion.div>

      {showCatManager && (
        <CategoryManager categories={categories} onClose={() => setShowCatManager(false)} />
      )}
    </div>
  );
}

function SettingCard({ icon: Icon, label, description, color, action }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '15' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {typeof description === 'string' ? description : description}
        </div>
      </div>
      {action}
    </div>
  );
}

function CategoryManager({ categories, onClose }) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('expense');
  const [newColor, setNewColor] = useState('#0d9488');

  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#0d9488'];

  const handleAdd = async () => {
    if (!newName) return;
    await addCategory({ name: newName, type: newType, color: newColor, icon: 'MoreHorizontal', budgetLimit: 0, isDefault: false });
    setNewName('');
  };

  const handleDelete = async (id, isDefault) => {
    if (isDefault) return;
    await deleteCategory(id);
  };

  const inputStyle = {
    background: 'var(--bg)',
    color: 'var(--text)',
    borderColor: 'var(--border)',
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Manage Categories" maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New category name"
            className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-primary-500/30"
            style={inputStyle}
          />
          <select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none font-medium"
            style={inputStyle}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="flex gap-2">
          {colors.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setNewColor(c)}
              className={`w-7 h-7 rounded-full transition-all duration-200 ${newColor === c ? 'scale-125 ring-2 ring-offset-2 ring-primary-500 shadow-lg' : 'hover:scale-110'}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold shadow-md shadow-primary-600/20 active:scale-[0.98]"
        >
          Add Category
        </button>

        <div className="max-h-60 overflow-y-auto space-y-1.5">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-2.5 p-2.5 rounded-xl"
              style={{ background: 'var(--bg)' }}
            >
              <span className="w-3.5 h-3.5 rounded-md" style={{ background: cat.color }} />
              <span className="flex-1 text-sm font-medium">{cat.name}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg capitalize" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                {cat.type}
              </span>
              {!cat.isDefault && (
                <button
                  onClick={() => handleDelete(cat.id, cat.isDefault)}
                  className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-xs transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
