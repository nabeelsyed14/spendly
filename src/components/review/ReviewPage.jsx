import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { Inbox, ScanLine, ClipboardPaste } from 'lucide-react';
import db from '../../lib/db';
import CategoryPicker from '../ui/CategoryPicker';
import { useTransactions, useCategories, addTransaction } from '../../hooks/useData';
import { useCurrency } from '../../context/CurrencyContext';
import { parseBankSms, splitAmountHit } from '../../lib/notifyParse';
import {
  scanAll, smsPermissionGranted, isNativeSmsSupported,
  isTrackingEnabled, hashSource,
} from '../../lib/notifyCapture';

const DAY_MS = 24 * 3600 * 1000;

const TABS = [
  { key: 'pending', label: 'To review' },
  { key: 'approved', label: 'Approved' },
  { key: 'discarded', label: 'Discarded' },
];

export default function ReviewPage() {
  const transactions = useTransactions();
  const categories = useCategories() || [];
  const { formatAmount } = useCurrency();
  const all = useLiveQuery(() => db.pendingSpends.orderBy('detectedAt').reverse().toArray()) || [];

  const [tab, setTab] = useState('pending');
  const [cats, setCats] = useState({});
  const [merchants, setMerchants] = useState({});
  const [sources, setSources] = useState({});
  const [paste, setPaste] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [scanMsg, setScanMsg] = useState('');
  const [scanning, setScanning] = useState(false);
  const autoScanned = useRef(false);

  const counts = {
    pending: all.filter((r) => r.status === 'pending').length,
    approved: all.filter((r) => r.status === 'approved').length,
    discarded: all.filter((r) => r.status === 'discarded').length,
  };
  const rows = all.filter((r) => r.status === tab);

  const runScan = async (silent) => {
    if (!isNativeSmsSupported() || !isTrackingEnabled()) return;
    const smsOk = await smsPermissionGranted();
    if (!silent) setScanning(true);
    try {
      const { sms, notif } = await scanAll();
      if (!silent) {
        if (!smsOk) {
          setScanMsg('SMS access not granted — enable it in Settings. Showing notification results.');
        }
        const bits = [];
        if (!sms.error) bits.push(`${sms.scanned} SMS`);
        if (!notif.error) bits.push(`${notif.scanned} notifications`);
        const added = (sms.added || 0) + (notif.added || 0);
        setScanMsg(`${bits.length ? bits.join(' + ') : 'Nothing'} scanned, ${added} new to review.`);
      }
    } catch (e) {
      if (!silent) setScanMsg(e?.message || 'Scan failed.');
    } finally {
      if (!silent) setScanning(false);
    }
  };

  useEffect(() => {
    if (autoScanned.current) return;
    autoScanned.current = true;
    runScan(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDup = (row) => transactions.some((t) =>
    t.type === row.type &&
    Math.abs(Number(t.amount) - Number(row.amount)) < 0.005 &&
    Math.abs(new Date(t.date) - new Date(row.detectedAt)) < DAY_MS
  );

  const approve = async (row) => {
    const merchant = (merchants[row.id] ?? row.merchant).trim() || row.merchant;
    const transactionId = await addTransaction({
      date: new Date(row.detectedAt).toISOString(),
      type: row.type,
      category: cats[row.id] || row.category,
      amount: Number(row.amount),
      description: merchant,
      notes: row.raw,
      source: row.type === 'income' ? 'income' : (sources[row.id] || 'income'),
    });
    await db.pendingSpends.update(row.id, { status: 'approved', transactionId });
  };

  const discard = async (row) => {
    await db.pendingSpends.update(row.id, { status: 'discarded' });
  };

  const moveBack = async (row) => {
    if (row.transactionId != null) {
      try {
        await db.transactions.delete(row.transactionId);
      } catch {
        // already removed in Transactions — just re-pend the row
      }
    }
    await db.pendingSpends.update(row.id, { status: 'pending', transactionId: null });
    setTab('pending');
  };

  const restore = async (row) => {
    await db.pendingSpends.update(row.id, { status: 'pending' });
    setTab('pending');
  };

  const handlePaste = async () => {
    const text = paste.trim();
    if (!text) return;
    const parsed = parseBankSms(text);
    if (!parsed) {
      setPasteError('No transaction found in that message.');
      return;
    }
    setPasteError('');
    await db.pendingSpends.add({
      amount: parsed.amount,
      type: parsed.direction === 'credit' ? 'income' : 'expense',
      category: parsed.category,
      merchant: parsed.merchant,
      raw: text,
      sourceApp: 'Pasted SMS',
      sourceHash: hashSource('paste', text, Date.now()),
      reference: parsed.reference,
      confidence: parsed.confidence,
      status: 'pending',
      detectedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setPaste('');
  };

  const emptyCopy = {
    pending: ['All caught up', 'New bank SMS will appear here for approval.'],
    approved: ['Nothing approved yet', 'Approved spends move here.'],
    discarded: ['Nothing discarded', 'Dismissed spends land here.'],
  }[tab];

  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-extrabold tracking-tight">Review</h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        The original message beside what we understood — you have the last word.
      </p>

      <div className="p-3.5 rounded-2xl border space-y-2.5" style={{ borderColor: 'var(--border-solid)' }}>
        <button
          onClick={() => runScan(false)}
          disabled={scanning}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border font-bold text-sm transition-all duration-200 hover:bg-primary-500/5 active:scale-95 disabled:opacity-50"
          style={{ borderColor: 'var(--border-solid)' }}
        >
          <ScanLine size={17} style={{ color: 'var(--color-primary-600)' }} />
          {scanning ? 'Scanning inbox…' : 'Scan SMS inbox now'}
        </button>
        {scanMsg && (
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{scanMsg}</p>
        )}
        <div className="flex gap-2">
          <textarea
            value={paste}
            onChange={(e) => { setPaste(e.target.value); setPasteError(''); }}
            placeholder="…or paste a bank SMS here"
            rows={2}
            className="input flex-1 min-w-0 text-sm resize-none"
          />
          <button
            onClick={handlePaste}
            aria-label="Parse pasted SMS"
            className="p-3 rounded-2xl border transition-all duration-200 hover:bg-primary-500/5 active:scale-95 self-start"
            style={{ borderColor: 'var(--border-solid)' }}
          >
            <ClipboardPaste size={17} style={{ color: 'var(--color-primary-600)' }} />
          </button>
        </div>
        {pasteError && (
          <p className="text-xs" style={{ color: '#ef4444' }}>{pasteError}</p>
        )}
      </div>

      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--input-bg)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-2 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
              tab === t.key ? 'bg-primary-500 text-white' : ''
            }`}
            style={tab !== t.key ? { color: 'var(--text-muted)' } : {}}
          >
            {t.label} · {counts[t.key]}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Inbox size={28} style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-semibold">{emptyCopy[0]}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emptyCopy[1]}</p>
        </div>
      ) : tab === 'pending' ? (
        <div className="space-y-3">
          {rows.map((row, i) => (
            <SlipRow
              key={row.id}
              index={i}
              row={row}
              categories={categories}
              formatAmount={formatAmount}
              dup={isDup(row)}
              merchant={merchants[row.id] ?? row.merchant}
              onMerchant={(v) => setMerchants((m) => ({ ...m, [row.id]: v }))}
              catValue={cats[row.id] || row.category}
              onCategory={(v) => setCats((c) => ({ ...c, [row.id]: v }))}
              source={row.type === 'income' ? 'income' : (sources[row.id] || 'income')}
              onSource={(v) => setSources((s) => ({ ...s, [row.id]: v }))}
              onApprove={() => approve(row)}
              onDiscard={() => discard(row)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row) => {
            const isIncome = row.type === 'income';
            return (
              <div key={row.id} className="flex items-center gap-2.5 p-3 rounded-2xl" style={{ background: 'var(--input-bg)' }}>
                <span
                  className="text-sm font-extrabold tabular-nums flex-shrink-0"
                  style={{ color: isIncome ? '#22c55e' : '#ef4444' }}
                >
                  {isIncome ? '+' : '−'}{formatAmount(row.amount)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{row.merchant}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {row.category}
                    {row.type === 'expense' && ` · ${row.source === 'savings' ? 'Savings' : 'Wallet'}`} · {format(new Date(row.detectedAt), 'MMM d, HH:mm')}
                  </p>
                </div>
                <button
                  onClick={() => (tab === 'approved' ? moveBack(row) : restore(row))}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-150 hover:bg-primary-500/5 active:scale-95 flex-shrink-0"
                  style={{ borderColor: 'var(--border-solid)', color: 'var(--color-primary-600)' }}
                >
                  {tab === 'approved' ? 'Move back' : 'Restore'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SlipRow({ row, index, categories, formatAmount, dup, merchant, onMerchant, catValue, onCategory, source, onSource, onApprove, onDiscard }) {
  const isIncome = row.type === 'income';
  const pool = categories.filter((c) => c.type === row.type);

  return (
    <div
      className="glass-card overflow-hidden animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
    >
      {/* SMS slip */}
      <div className="p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Bank SMS · {row.sourceApp} · {format(new Date(row.detectedAt), 'MMM d, HH:mm')}
        </p>
        <p className="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words">
          {splitAmountHit(row.raw, row.amount).map((part, i) => (
            <span
              key={i}
              className={part.hit ? 'font-extrabold tabular-nums' : undefined}
              style={part.hit ? { color: '#f59e0b' } : { color: 'var(--text-muted)' }}
            >
              {part.text}
            </span>
          ))}
        </p>
      </div>

      {/* perforated divider */}
      <div className="mx-1">
        <div className="border-t-2 border-dashed" style={{ borderColor: 'var(--border-solid)' }} />
      </div>

      {/* ticket */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="text-xl font-extrabold tabular-nums flex-shrink-0"
            style={{ color: isIncome ? '#22c55e' : '#ef4444' }}
          >
            {isIncome ? '+' : '−'}{formatAmount(row.amount)}
          </span>
                  <input
                    value={merchant}
                    onChange={(e) => onMerchant(e.target.value)}
                    aria-label="Merchant name"
                    className="input flex-1 min-w-0 text-sm font-semibold"
                    style={{ borderColor: 'transparent', background: 'transparent' }}
                  />
          {dup && (
            <span className="tag flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              Possible duplicate
            </span>
          )}
        </div>

                <CategoryPicker
                  value={catValue}
                  categories={
                    pool.some((c) => c.name === catValue)
                      ? pool
                      : [...pool, { id: '__current__', name: catValue, color: '#737373' }]
                  }
                  onChange={onCategory}
                />

        {row.type === 'expense' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              Paid from
            </span>
            <div className="flex flex-1 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-solid)' }}>
              {[{ v: 'income', label: 'Wallet' }, { v: 'savings', label: 'Savings' }].map((o) => (
                <button
                  key={o.v}
                  onClick={() => o.v !== source && onSource(o.v)}
                  className={`flex-1 px-2.5 py-1.5 text-[11px] font-bold transition-all duration-150 active:scale-95 ${
                    source === o.v ? 'bg-primary-500 text-white' : 'hover:bg-primary-500/10'
                  }`}
                  style={source !== o.v ? { color: 'var(--text-muted)' } : {}}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onDiscard}
            className="flex-1 px-3 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 hover:bg-red-500/5 active:scale-95"
            style={{ borderColor: 'var(--border-solid)', color: 'var(--text-muted)' }}
          >
            Not a spend
          </button>
          <button
            onClick={onApprove}
            className="flex-1 px-3 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
            style={{ background: '#22c55e' }}
          >
            Looks right
          </button>
        </div>
      </div>
    </div>
  );
}
