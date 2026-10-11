// On-device bank SMS parser (adapted from Kharcha's conservative rules).
// Pure functions, no dependencies. Requires a debit/credit signal AND an
// amount; OTP and promo messages are rejected outright. Anything uncertain
// returns null so it never reaches the review inbox as junk.

export function parseBankSms(body, address = '') {
  if (!isTransactionMessage(body)) return null;
  const direction = transactionDirection(body);
  if (!direction) return null;
  const amount = transactionAmount(body);
  if (!amount) return null;
  const textMerchant = transactionMerchant(body);
  const merchant = textMerchant || bankFromSender(address) || '';
  // UPI handles are case-insensitive identifiers — keep them raw, not title-cased.
  // Bank names from the sender map are already display-ready.
  const display = !merchant
    ? 'Unknown merchant'
    : !textMerchant
      ? merchant
      : merchant.includes('@')
        ? merchant.trim().toLowerCase()
        : titleCase(merchant);
  const reference = body.match(referencePattern)?.[1] ?? null;
  const accountLast4 = body.match(accountPattern)?.[1] ?? null;
  return {
    merchant: display,
    amount: amount.amount,
    direction,
    category: categoryFor(merchant, body, direction),
    accountLast4,
    reference,
    confidence: transactionConfidence(textMerchant, accountLast4, reference, amount.contextual),
  };
}

// Sender ID (AD-HDFCBK, CP-DCBANK-S, numeric shortcodes) -> bank display
// name. Matches the longest known key anywhere in the ID, so routing
// prefixes and suffixes on either end don't matter. Numeric senders -> null.
export function bankFromSender(address) {
  if (!address) return null;
  const clean = String(address).replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (!clean || /^\d+$/.test(clean)) return null;
  const banks = {
    HDFCBK: 'HDFC Bank', HDFC: 'HDFC Bank',
    ICICIB: 'ICICI Bank', ICICI: 'ICICI Bank',
    SBIINB: 'SBI', SBIBANK: 'SBI', SBI: 'SBI',
    AXISBK: 'Axis Bank', AXIS: 'Axis Bank',
    KOTAK: 'Kotak', KOTAKB: 'Kotak',
    YESBK: 'Yes Bank', PNB: 'PNB',
    BOB: 'Bank of Baroda', BOBANK: 'Bank of Baroda',
    IDFC: 'IDFC Bank', UNIONB: 'Union Bank', CANBNK: 'Canara Bank',
    IDBI: 'IDBI Bank', FEDERAL: 'Federal Bank',
    RBL: 'RBL Bank', INDUSIND: 'IndusInd Bank',
    DCB: 'DCB Bank', DCBANK: 'DCB Bank',
    PAYTM: 'Paytm', PHONEPE: 'PhonePe',
  };
  let best = null;
  for (const key of Object.keys(banks)) {
    if (clean.includes(key) && (!best || key.length > best.length)) best = key;
  }
  return best ? banks[best] : null;
}

// Amount code tokens: home (Rs/INR/₹) plus common foreign codes. Foreign
// amounts are stored as plain app-currency numbers (no conversion).
const amountPattern = /(?:Rs\.?|INR|₹|AED|USD|EUR|GBP|SAR|QAR|KWD|BHD|OMR|CAD|AUD)\s*([\d,]+(?:\.\d{1,2})?)/i;
const contextualAmountPatterns = [
  /\b(?:debited by|credited by|spent|paid|received)\s*(?:Rs\.?|INR|₹|AED|USD|EUR|GBP|SAR|QAR|KWD|BHD|OMR|CAD|AUD)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  /(?:Rs\.?|INR|₹|AED|USD|EUR|GBP|SAR|QAR|KWD|BHD|OMR|CAD|AUD)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has been|was|is)?\s*(?:debited|credited|spent|paid|received)\b/i,
];
const debitPattern = /\b(debit(?:ed)?|spent|paid|purchase|withdrawn)\b/i;
const creditPattern = /\b(credit(?:ed)?|received|refund|deposited|landed)\b/i;
const otpPattern = /\b(otp|one.time.password|verification code|login code|do not share|valid for \d+ min)\b/i;
const promoPattern = /\b(cashback offer|discount|coupon|apply now|limited time|shop now|sale ends|pre.approved loan)\b/i;
const referencePattern = /(?:UPI\s*Ref|Ref\s*(?:no|number)?|RRN|UTR)\s*[:#.-]?\s*([A-Z0-9]{8,})/i;
const accountPattern = /(?:A\/c|Acct|Account|Card)\s*(?:no\.?\s*)?(?:[Xx*·-]+)?\s*(\d{3,4})\b/i;
const merchantPatterns = [
  /\b(?:to\s+VPA|trf\s+to|paid\s+to)\s+([A-Z0-9._@ -]+?)(?=\s*\(|\s+Ref|\s+on\s+\d|[.;]|$)/i,
  /\btowards\s+(?:VPA\s+)?([A-Z0-9._@ -]+?)(?=\s*\(|\s+Ref|\s+on\s+\d|[.;]|$)/i,
  /\bVPA\s+([A-Z0-9._@-]+)/i,
  /\b(?:at|from)\s+([A-Z][A-Z0-9&._@ -]+?)(?=\s+via\s+(?:UPI|IMPS|NEFT|RTGS|card)\b|\s+on\s+\d|\s+landed\b|\s*\(|[.;]|$)/i,
  /\bNEFT\s+from\s+([A-Z0-9 &._-]+?)(?=[.;]|$)/i,
];

function titleCase(input) {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase())
    .replace(/([\p{L}])([\p{L}]+)/gu, (_, first, rest) => first + rest.toLowerCase());
}

// Maps to real Spendly category names. Fallback is type-aware so review rows
// always land in a valid category for their In/Out side.
export function categoryFor(merchant, body = '', direction = 'debit') {
  const text = `${merchant} ${body}`.toLowerCase();
  if (direction === 'credit') {
    if (/salary|payroll|wage/.test(text)) return 'Salary';
    if (/dividend|interest|stocks|mutual fund|investment/.test(text)) return 'Investments';
    if (/freelance|contract|project payment|consulting/.test(text)) return 'Freelance';
    return 'Other';
  }
  if (/swiggy|zomato|restaurant|cafe|coffee|domino|food|dining/.test(text)) return 'Food & Dining';
  if (/blinkit|zepto|bigbasket|grocer|supermarket|dmart/.test(text)) return 'Groceries';
  if (/uber|ola\b|metro|irctc|flight|bus|travel|petrol|fuel|cab/.test(text)) return 'Transport';
  if (/rent|landlord|housing|society maintenance/.test(text)) return 'Housing';
  if (/electric|airtel|jio|water bill|broadband|utility|recharge/.test(text)) return 'Utilities';
  if (/amazon|flipkart|myntra|shopping|store/.test(text)) return 'Shopping';
  if (/pharm|apollo|hospital|clinic|doctor|medicine|health/.test(text)) return 'Health';
  if (/netflix|spotify|movie|cinema|prime video|hotstar|entertainment/.test(text)) return 'Entertainment';
  if (/netflix|spotify|subscription|membership/.test(text)) return 'Subscriptions';
  return 'Other';
}

function transactionDirection(body) {
  const debit = debitPattern.test(body);
  const credit = creditPattern.test(body);
  if (debit === credit) return null;
  return debit ? 'debit' : 'credit';
}

function isTransactionMessage(body) {
  return Boolean(body) && body.length <= 4000 && !otpPattern.test(body) && !promoPattern.test(body);
}

function transactionAmount(body) {
  const contextualMatch = contextualAmountPatterns.map((pattern) => body.match(pattern)).find(Boolean);
  const numeric = (contextualMatch?.[1] ?? body.match(amountPattern)?.[1] ?? '').replaceAll(',', '');
  const amount = Number(numeric);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) return null;
  return { amount: Math.round(amount * 100) / 100, contextual: Boolean(contextualMatch) };
}

function transactionMerchant(body) {
  for (const pattern of merchantPatterns) {
    const merchant = body.match(pattern)?.[1]?.trim() ?? '';
    if (merchant) return merchant.replace(/(\s+(?:Ref|UPI|via))+$/i, '').trim();
  }
  return '';
}

function transactionConfidence(merchant, accountLast4, reference, contextual) {
  let base = 0.45;
  if (merchant && accountLast4 && reference) base = 0.95;
  else if (merchant && accountLast4) base = 0.84;
  else if (merchant) base = 0.68;
  return contextual ? base : Math.min(base, 0.68);
}

// Splits raw SMS text around the parsed amount for highlighting, longest
// variant first with digit-boundary guards so 50 never matches inside 5000.
export function splitAmountHit(raw, amount) {
  const n = Number(amount);
  if (!raw || !Number.isFinite(n)) return [{ text: String(raw ?? '') }];
  const variants = Array.from(
    new Set([
      n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      n.toLocaleString('en-US'),
      n.toFixed(2),
      String(n),
    ])
  ).sort((a, b) => b.length - a.length);
  for (const v of variants) {
    if (!v) continue;
    let from = 0;
    for (;;) {
      const i = raw.indexOf(v, from);
      if (i < 0) break;
      const prev = i > 0 ? raw[i - 1] : '';
      const next = raw[i + v.length] ?? '';
      if (!/[0-9]/.test(prev) && !/[0-9.]/.test(next)) {
        return [
          { text: raw.slice(0, i) },
          { text: v, hit: true },
          { text: raw.slice(i + v.length) },
        ];
      }
      from = i + 1;
    }
  }
  return [{ text: raw }];
}
