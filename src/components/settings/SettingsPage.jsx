import { useEffect, useState } from 'react';
import { Download, Upload, Tag, Moon, Sun, Globe, User, Trash2, Palette, BellRing, Search, Check, ChevronDown } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useProfile } from '../../context/ProfileContext';
import { useTransactions, useCategories, addCategory, deleteCategory } from '../../hooks/useData';
import { downloadCSV } from '../../lib/export';
import {
  isTrackingEnabled, setTrackingEnabled,
  isNativeSmsSupported, smsPermissionGranted, requestSmsPermission, scanInbox,
  notificationAccessGranted, openNotificationAccessSettings, listDeviceSenders,
} from '../../lib/notifyCapture';
import { tint } from '../../lib/color';
import db from '../../lib/db';
import Modal from '../ui/Modal';
import { CURRENCY_FLAGS } from '../ui/CurrencyPicker';
import Avatar from '../ui/Avatar';
import AvatarPicker from '../ui/AvatarPicker';
import ImportModal from '../import/ImportModal';
import SmsPermissionDisclosure from '../ui/SmsPermissionDisclosure';

export default function SettingsPage() {
  const { theme, toggleTheme, palette, paletteId, setPaletteId, palettes } = useTheme();
  const { currency, setCurrency, formatAmount } = useCurrency();
  const { userName, setUserName, avatarPhoto, setAvatarPhoto } = useProfile();
  const transactions = useTransactions();
  const categories = useCategories();
  const [showCatManager, setShowCatManager] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);

  const handleExport = async () => {
    if (!transactions.length) {
      alert('No transactions to export.');
      return;
    }
    try {
      const where = await downloadCSV(transactions);
      if (where) alert(`Saved spendly-export.csv to ${where}`);
    } catch (e) {
      alert(`Export failed: ${e?.message || e}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-extrabold tracking-tight">Settings</h2>

      <div className="space-y-2.5">
        <SettingCard icon={User} label="Your Name" color="var(--color-primary-600)"
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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tint('var(--color-primary-600)') }}>
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
          color="var(--color-primary-600)"
          action={
            <button onClick={toggleTheme} className="px-3 py-1.5 btn-primary text-sm">
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          }
        />

        <SettingCard
          icon={Palette}
          label="Colour Palette"
          description={`Currently using ${palette.name}`}
          color="var(--color-primary-600)"
          action={
            <div className="flex gap-1.5 flex-wrap justify-end">
              {palettes.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPaletteId(p.id)}
                  title={p.name}
                  aria-label={p.name}
                  className={`w-7 h-7 rounded-full transition-all duration-200 active:scale-90 ${
                    paletteId === p.id ? 'ring-2 ring-offset-2 ring-primary-500 ring-offset-[var(--surface-solid)] scale-110' : 'hover:scale-110'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${p.btn.join(', ')})` }}
                />
              ))}
            </div>
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
          color="var(--color-primary-600)"
          action={
            <button
              onClick={() => setShowCurrency(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all duration-200 hover:bg-primary-500/5 active:scale-95"
              style={{ borderColor: 'var(--border-solid)' }}
            >
              <span className="leading-none">{CURRENCY_FLAGS[currency.code] || '💱'}</span>
              {currency.code}
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          }
        />

        <SettingCard icon={Download} label="Export Data" color="var(--color-primary-600)"
          action={
            <button onClick={handleExport} className="p-2 rounded-xl border transition-all duration-200 hover:bg-primary-500/5 hover:scale-105 active:scale-95" style={{ borderColor: 'var(--border-solid)' }}>
              <Download size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          }
        />

        <SettingCard icon={Upload} label="Import Data" description="Import a CSV export" color="var(--color-primary-600)"
          action={
            <button onClick={() => setShowImport(true)} className="p-2 rounded-xl border transition-all duration-200 hover:bg-primary-500/5 hover:scale-105 active:scale-95" style={{ borderColor: 'var(--border-solid)' }}>
              <Upload size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          }
        />

        <SmsTrackingCard />

        <SettingCard icon={Trash2} label="Clear History" color="#ef4444"
          action={
            <button
              onClick={async () => {
                if (confirm('Delete ALL transactions and savings entries? This cannot be undone.')) {
                  await Promise.all([db.transactions.clear(), db.savings.clear()]);
                }
              }}
              className="p-2 rounded-xl border transition-all duration-200 hover:bg-red-500/5 text-red-500 hover:scale-105 active:scale-95"
              style={{ borderColor: 'var(--border-solid)' }}
            >
              <Trash2 size={16} />
            </button>
          }
        />

        <SettingCard icon={Tag} label="Manage Categories" description={`${categories.length} categories`} color="var(--color-primary-600)"
          action={
            <button onClick={() => setShowCatManager(true)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border hover:bg-primary-500/5 transition-all duration-200 hover:scale-105 active:scale-95" style={{ borderColor: 'var(--border-solid)' }}>
              Edit
            </button>
          }
        />
      </div>

      {showImport && (
        <ImportModal isOpen={true} onClose={() => setShowImport(false)} categories={categories} />
      )}

      {showCurrency && (
        <CurrencySheet
          current={currency.code}
          onPick={(code) => { setCurrency(code); setShowCurrency(false); }}
          onClose={() => setShowCurrency(false)}
        />
      )}

      {showAvatarPicker && (
        <Modal isOpen={true} onClose={() => setShowAvatarPicker(false)} title="Choose Avatar">
          <AvatarPicker
            name={userName || 'Spendly'}
            currentPhoto={avatarPhoto}
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

function SmsTrackingCard() {
  const native = isNativeSmsSupported();
  const [tracking, setTracking] = useState(isTrackingEnabled);
  const [granted, setGranted] = useState(null);
  const [notifGranted, setNotifGranted] = useState(null);
  const [msg, setMsg] = useState('');
  const [scanning, setScanning] = useState(false);
  const [diag, setDiag] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [showSmsDisclosure, setShowSmsDisclosure] = useState(false);
  const pendingCount = useLiveQuery(() => db.pendingSpends.where('status').equals('pending').count(), []) || 0;

  useEffect(() => {
    if (native) {
      smsPermissionGranted().then(setGranted).catch(() => setGranted(false));
      notificationAccessGranted().then(setNotifGranted).catch(() => setNotifGranted(false));
    } else {
      setGranted(false);
      setNotifGranted(false);
    }
  }, [native]);

  const toggle = () => {
    const next = !tracking;
    if (next && native && !granted) {
      setShowSmsDisclosure(true);
      return;
    }
    setTracking(next);
    setTrackingEnabled(next);
  };

  const grant = async () => {
    setShowSmsDisclosure(false);
    try {
      const wasGranted = await requestSmsPermission();
      setGranted(wasGranted);
      if (wasGranted) {
        setTracking(true);
        setTrackingEnabled(true);
      }
    } catch {
      setGranted(false);
      setMsg('Permission request failed.');
    }
  };

  const enableNotifications = () => {
    openNotificationAccessSettings();
    setMsg('Turn on access for Spendly in system settings, then come back.');
  };

  const scanNow = async () => {
    setScanning(true);
    setMsg('');
    try {
      const { scanned, added, inboxTotal } = await scanInbox();
      const device = inboxTotal >= 0 ? ` (${inboxTotal} messages on device)` : '';
      setMsg(`Scanned ${scanned} matching${device}, ${added} new to review.`);
    } catch (e) {
      setMsg(e?.message || 'Scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const diagnose = async () => {
    setDiagLoading(true);
    try {
      setDiag(await listDeviceSenders());
    } catch (e) {
      setMsg(e?.message || 'Diagnostics failed.');
    } finally {
      setDiagLoading(false);
    }
  };

  return (
    <>
      <SettingCard
        icon={BellRing}
        label="SMS Tracking"
        description={tracking ? `${pendingCount} awaiting review` : 'Read bank SMS for review'}
        color="var(--color-primary-600)"
        action={
          <button
            onClick={toggle}
            className="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all duration-200 active:scale-95"
            style={tracking
              ? { background: 'var(--color-primary-600)', borderColor: 'transparent', color: '#fff' }
              : { borderColor: 'var(--border-solid)', color: 'var(--text-muted)' }}
          >
            {tracking ? 'On' : 'Off'}
          </button>
        }
      />
      {tracking && (
        <div className="card p-4 space-y-3">
          {!native && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              SMS reading needs the Android app — but you can still paste messages on the Review screen.
            </p>
          )}
          {native && (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm">
                  SMS access: <span className="font-bold">{granted ? 'granted' : 'not granted'}</span>
                </p>
                {!granted && (
                  <button
                    onClick={grant}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-200 hover:bg-primary-500/5 active:scale-95"
                    style={{ borderColor: 'var(--border-solid)' }}
                  >
                    Grant access
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm">
                  App notifications: <span className="font-bold">{notifGranted ? 'enabled' : 'off'}</span>
                </p>
                {!notifGranted && (
                  <button
                    onClick={enableNotifications}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-200 hover:bg-primary-500/5 active:scale-95"
                    style={{ borderColor: 'var(--border-solid)' }}
                  >
                    Enable
                  </button>
                )}
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Captures payment-app alerts the SMS inbox never sees. Android opens system settings —
                turn on access for Spendly there. Some phones also need autostart permission.
              </p>
              <button
                onClick={scanNow}
                disabled={scanning}
                className="w-full p-2.5 rounded-xl border text-sm font-bold transition-all duration-200 hover:bg-primary-500/5 active:scale-95 disabled:opacity-50"
                style={{ borderColor: 'var(--border-solid)' }}
              >
                {scanning ? 'Scanning…' : 'Scan now'}
              </button>
              {msg && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{msg}</p>
              )}
              <button
                onClick={diagnose}
                disabled={diagLoading}
                className="w-full text-xs font-bold transition-all duration-150 hover:opacity-70 active:scale-95 disabled:opacity-50"
                style={{ color: 'var(--color-primary-600)' }}
              >
                {diagLoading ? 'Checking…' : 'Diagnose: what is actually on this device?'}
              </button>
              {diag && (
                <div className="p-2.5 rounded-xl space-y-1.5" style={{ background: 'var(--input-bg)' }}>
                  {diag.inboxTotal === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      No SMS stored on this device — chat-style (RCS) messages never enter the SMS inbox.
                      Paste messages on the Review screen instead.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs font-bold">
                        {diag.inboxTotal} messages stored on this device
                      </p>
                      {diag.senders.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {diag.senders.slice(0, 10).map((s) => (
                            <span key={s.address} className="tag" style={{ background: 'var(--surface-solid)', color: 'var(--text-muted)' }}>
                              {s.address || '(no sender)'} · {s.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
      <SmsPermissionDisclosure
        isOpen={showSmsDisclosure}
        onClose={() => setShowSmsDisclosure(false)}
        onContinue={grant}
      />
    </>
  );
}

function CurrencySheet({ current, onPick, onClose }) {
  const { currencies } = useCurrency();
  const [query, setQuery] = useState('');
  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(query.toLowerCase()) ||
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal isOpen={true} onClose={onClose} title="Choose currency" maxWidth="max-w-xs">
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search currencies…"
          className="input w-full !pl-9 text-sm"
        />
      </div>
      <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-0.5">
        {filtered.map(c => (
          <button
            key={c.code}
            onClick={() => onPick(c.code)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:bg-primary-500/5 active:scale-95"
          >
            <span className="text-lg leading-none flex-shrink-0">{CURRENCY_FLAGS[c.code] || '💱'}</span>
            <span className="flex-1 min-w-0 text-left">
              <span className="block font-bold">{c.code}</span>
              <span className="block text-[11px] truncate font-medium" style={{ color: 'var(--text-muted)' }}>{c.name}</span>
            </span>
            {c.code === current && (
              <Check size={15} style={{ color: 'var(--color-primary-600)' }} className="flex-shrink-0" />
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            No currencies found
          </p>
        )}
      </div>
    </Modal>
  );
}

function SettingCard({ icon: Icon, label, description, color, action }) {
  return (
    <div className="card p-4 flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tint(color) }}>
        <Icon size={19} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold">{label}</p>
        {description && (
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {description}
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
  const [newColor, setNewColor] = useState('#6d28d9');

  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#6d28d9', '#ec4899', '#14b8a6', '#f97316'];

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
