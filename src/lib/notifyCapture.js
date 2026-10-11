import { Capacitor, registerPlugin } from '@capacitor/core';
import db from './db';
import { parseBankSms } from './notifyParse';

const SmsReader = registerPlugin('SmsReader');

const TOGGLE_KEY = 'spendly-sms-tracking';
const LAST_SCAN_KEY = 'spendly-sms-last-scan';
const FILTER_VERSION_KEY = 'spendly-sms-filter-version';
// Bump when the native pre-filter changes so the next scan starts over.
const FILTER_VERSION = 'keywords-v1';

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode — preference just won't persist
  }
}

export function isTrackingEnabled() {
  return readLS(TOGGLE_KEY, '0') === '1';
}

export function setTrackingEnabled(on) {
  writeLS(TOGGLE_KEY, on ? '1' : '0');
  try {
    window.dispatchEvent(new Event('spendly-tracking-changed'));
  } catch {
    // non-DOM environment (tests) — preference is still stored
  }
}

export function getLastScan() {
  return Number(readLS(LAST_SCAN_KEY, '0')) || 0;
}

export function setLastScan(ts) {
  writeLS(LAST_SCAN_KEY, String(ts));
}

// djb2 hex — dedup key for a source message.
export function hashSource(address, body, date) {
  const s = `${address}|${body}|${date}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

export function isNativeSmsSupported() {
  return Capacitor.isNativePlatform();
}

export async function smsPermissionGranted() {
  if (!isNativeSmsSupported()) return false;
  try {
    const r = await SmsReader.hasPermission();
    return !!r.granted;
  } catch {
    return false;
  }
}

export async function requestSmsPermission() {
  const r = await SmsReader.requestSmsPermission();
  return !!r.granted;
}

export async function notificationAccessGranted() {
  if (!isNativeSmsSupported()) return false;
  try {
    const r = await SmsReader.isNotificationAccessGranted();
    return !!r.granted;
  } catch {
    return false;
  }
}

export function openNotificationAccessSettings() {
  try {
    SmsReader.openNotificationAccessSettings();
  } catch {
    // settings screen unavailable — user enables it manually
  }
}

// Reads new inbox messages, parses them, and queues hits for review.
// Returns { scanned, added }. Throws with a readable message on failure.
export async function scanInbox() {
  if (!isNativeSmsSupported()) {
    throw new Error('SMS reading needs the Android app — paste messages below instead.');
  }
  // First scan under a new pre-filter starts over so messages skipped by an
  // older filter (e.g. your test transaction) are picked up.
  let since = getLastScan();
  if (readLS(FILTER_VERSION_KEY, '') !== FILTER_VERSION) {
    since = 0;
    writeLS(FILTER_VERSION_KEY, FILTER_VERSION);
  }
  const res = await SmsReader.readInbox({ since, limit: 1500 });
  const messages = res.messages || [];
  const inboxTotal = typeof res.inboxTotal === 'number' ? res.inboxTotal : -1;
  let added = 0;
  for (const m of messages) {
    const parsed = parseBankSms(m.body || '', m.address || '');
    if (!parsed) continue;
    if (await isDuplicateHit(parsed, hashSource(m.address, m.body, m.date))) continue;
    await db.pendingSpends.add({
      amount: parsed.amount,
      type: parsed.direction === 'credit' ? 'income' : 'expense',
      category: parsed.category,
      merchant: parsed.merchant,
      raw: m.body,
      sourceApp: m.address || 'SMS',
      reference: parsed.reference,
      confidence: parsed.confidence,
      status: 'pending',
      detectedAt: new Date(m.date).toISOString(),
      createdAt: new Date().toISOString(),
    });
    added++;
  }
  setLastScan(Date.now());
  return { scanned: messages.length, added, inboxTotal };
}

// Already queued (same source message) or same transaction via the other
// channel (matching UPI ref/RRN) — skip silently, never drop lookalikes.
async function isDuplicateHit(parsed, sourceHash) {
  const sameSource = await db.pendingSpends.where('sourceHash').equals(sourceHash).count();
  if (sameSource) return true;
  if (parsed.reference) {
    const sameRef = await db.pendingSpends
      .filter((p) => p.reference === parsed.reference)
      .count();
    if (sameRef) return true;
  }
  return false;
}

// Drains the native notification queue (push/RCS-style alerts the SMS inbox
// never sees) through the same parser + review inbox.
export async function scanNotifications() {
  if (!isNativeSmsSupported()) {
    throw new Error('SMS reading needs the Android app.');
  }
  const res = await SmsReader.drainNotifications();
  const items = res.notifications || [];
  let added = 0;
  for (const n of items) {
    const parsed = parseBankSms(n.text || '');
    if (!parsed) continue;
    if (await isDuplicateHit(parsed, hashSource(`notif:${n.pkg || ''}`, n.text, n.time))) continue;
    await db.pendingSpends.add({
      amount: parsed.amount,
      type: parsed.direction === 'credit' ? 'income' : 'expense',
      category: parsed.category,
      merchant: parsed.merchant,
      raw: n.text,
      sourceApp: n.app || n.pkg || 'Notification',
      reference: parsed.reference,
      confidence: parsed.confidence,
      status: 'pending',
      detectedAt: new Date(n.time || Date.now()).toISOString(),
      createdAt: new Date().toISOString(),
    });
    added++;
  }
  return { scanned: items.length, added };
}

// Both channels at once. Results merge; per-channel counts preserved.
export async function scanAll() {
  const [sms, notif] = await Promise.all([
    scanInbox().catch((e) => ({ error: e?.message || String(e) })),
    scanNotifications().catch((e) => ({ error: e?.message || String(e) })),
  ]);
  return { sms, notif };
}

// Top sender addresses actually on this device, for diagnostics and to show
// users what is there instead of guessing sender IDs.
export async function listDeviceSenders() {
  if (!isNativeSmsSupported()) {
    throw new Error('SMS reading needs the Android app.');
  }
  const res = await SmsReader.listSenders({ limit: 500 });
  return {
    senders: res.senders || [],
    inboxTotal: typeof res.inboxTotal === 'number' ? res.inboxTotal : -1,
  };
}

// Silent best-effort drain for app launch: never prompts, never throws.
export async function drainOnLaunch() {
  try {
    if (!isTrackingEnabled()) return { sms: { scanned: 0, added: 0 }, notif: { scanned: 0, added: 0 } };
    if (!(await smsPermissionGranted())) {
      // SMS off-limits, but the notification queue is still fair game.
      const notif = await scanNotifications().catch(() => ({ scanned: 0, added: 0 }));
      return { sms: { scanned: 0, added: 0 }, notif };
    }
    return await scanAll();
  } catch {
    return { sms: { scanned: 0, added: 0 }, notif: { scanned: 0, added: 0 } };
  }
}
