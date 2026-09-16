import { useState, useRef } from 'react';
import { Download, Upload, Tag, Moon, Sun, Globe, User, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useProfile } from '../../context/ProfileContext';
import { useTransactions, useCategories, addCategory, deleteCategory } from '../../hooks/useData';
import { downloadCSV, parseCSV } from '../../lib/export';
import db from '../../lib/db';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import AvatarPicker from '../ui/AvatarPicker';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { currency, currencies, setCurrency, formatAmount } = useCurrency();
  const { userName, setUserName, avatarGradient, setAvatarGradient, avatarPhoto, setAvatarPhoto } = useProfile();
  const transactions = useTransactions();
  const categories = useCategories();
  const [showCatManager, setShowCatManager] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
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
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-bold">Settings</h2>

      <div className="space-y-2">
        <SettingCard icon={User} label="Your Name" color="#0d9488"
          action={
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Enter name"
              className="input w-32 text-sm"
            />
          }
        />

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#0d9488' + '12' }}>
            <Avatar name={userName || 'User'} photo={avatarPhoto} size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium">Avatar</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Choose your profile style</p>
          </div>
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold border hover:bg-primary-500/5 transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ borderColor: 'var(--border-solid)' }}
          >
            Change
          </button>
        </div>

        <SettingCard
          icon={theme === 'dark' ? Moon : Sun}
          label="Theme"
          description={`Currently using ${theme} mode`}
          color="#0d9488"
          action={
            <button onClick={toggleTheme} className="px-3 py-1.5 btn-primary text-sm">
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          }
        />

        <SettingCard
          icon={Globe}
          label="Currency"
          description={
            <span className="flex items-center gap-1.5">
              <span>{currency.name}</span>
              <span className="text-sm px-1.5 py-0.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                {formatAmount(1234.56)}
              </span>
            </span>
          }
          color="#0d9488"
          action={
            <select
              value={currency.code}
              onChange={e => setCurrency(e.target.value)}
              className="input text-sm cursor-pointer"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          }
        />

        <SettingCard icon={Download} label="Export Data" color="#0d9488"
          action={
            <button onClick={handleExport} className="p-2 rounded-xl border transition-all duration-200 hover:bg-primary-500/5 hover:scale-105 active:scale-95" style={{ borderColor: 'var(--border-solid)' }}>
              <Download size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          }
        />

        <SettingCard icon={Upload} label="Import Data" color="#0d9488"
          action={
            <>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl border transition-all duration-200 hover:bg-primary-500/5 hover:scale-105 active:scale-95" style={{ borderColor: 'var(--border-solid)' }}>
                <Upload size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </>
          }
        />

        <SettingCard icon={Trash2} label="Clear History" color="#ef4444"
          action={
            <button
              onClick={async () => {
                if (confirm('Delete ALL transactions? This cannot be undone.')) {
                  await db.transactions.clear();
                }
              }}
              className="p-2 rounded-xl border transition-all duration-200 hover:bg-red-500/5 text-red-500 hover:scale-105 active:scale-95"
              style={{ borderColor: 'var(--border-solid)' }}
            >
              <Trash2 size={16} />
            </button>
          }
        />

        <SettingCard icon={Tag} label="Manage Categories" description={`${categories.length} categories`} color="#0d9488"
          action={
            <button onClick={() => setShowCatManager(true)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border hover:bg-primary-500/5 transition-all duration-200 hover:scale-105 active:scale-95" style={{ borderColor: 'var(--border-solid)' }}>
              Edit
            </button>
          }
        />
      </div>

      {showAvatarPicker && (
        <Modal isOpen={true} onClose={() => setShowAvatarPicker(false)} title="Choose Avatar">
          <AvatarPicker
            name={userName || 'Spendly'}
            currentPhoto={avatarPhoto}
            currentGradient={avatarGradient}
            onSelectGradient={(g) => { setAvatarGradient(g); setShowAvatarPicker(false); }}
            onSelectPhoto={(p) => { setAvatarPhoto(p); setShowAvatarPicker(false); }}
            onRemovePhoto={() => { setAvatarPhoto(null); }}
          />
        </Modal>
      )}

      {showCatManager && (
        <CategoryManager categories={categories} onClose={() => setShowCatManager(false)} />
      )}
    </div>
  );
}

function SettingCard({ icon: Icon, label, description, color, action }) {
  return (
    <div className="card p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '12' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium">{label}</p>
        {description && (
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {typeof description === 'string' ? description : description}
          </div>
        )}
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

  return (
    <Modal isOpen={true} onClose={onClose} title="Manage Categories" maxWidth="max-w-md">
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New category name"
            className="input flex-1"
          />
          <select value={newType} onChange={e => setNewType(e.target.value)} className="input">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="flex gap-1.5">
          {colors.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setNewColor(c)}
              className={`w-8 h-8 rounded-full transition-all duration-200 active:scale-90 ${newColor === c ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <button onClick={handleAdd} className="w-full py-3 btn-primary text-sm">
          Add Category
        </button>

        <div className="max-h-48 overflow-y-auto space-y-1">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <span className="w-3 h-3 rounded" style={{ background: cat.color }} />
              <span className="flex-1 text-sm font-medium">{cat.name}</span>
              <span className="text-sm font-medium px-1.5 py-0.5 rounded-lg capitalize" style={{ background: 'var(--surface-solid)', color: 'var(--text-muted)' }}>
                {cat.type}
              </span>
              {!cat.isDefault && (
                <button onClick={() => handleDelete(cat.id, cat.isDefault)} className="p-0.5 rounded-lg hover:bg-red-500/10 text-red-500 text-sm transition-all duration-150 active:scale-95">
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
