import { getMonthlyTransactions, anomalyDetection, spendingVelocity, monthlyProjection, getCategoryTotals } from './insights';

const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = IS_DEV ? 'https://api.groq.com/openai/v1/chat/completions' : '/api/groq';
const DEV_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

function getRequestCount() {
  const data = JSON.parse(localStorage.getItem('spendly-ai-requests') || '{"date":"","count":0}');
  const today = new Date().toISOString().slice(0, 10);
  if (data.date !== today) return { date: today, count: 0 };
  return data;
}

export function canMakeRequest() {
  const { count } = getRequestCount();
  return count < 10;
}

export function getRequestsRemaining() {
  const { count } = getRequestCount();
  return Math.max(0, 10 - count);
}

function incrementRequestCount() {
  const today = new Date().toISOString().slice(0, 10);
  const data = getRequestCount();
  const newCount = data.date === today ? data.count + 1 : 1;
  localStorage.setItem('spendly-ai-requests', JSON.stringify({ date: today, count: newCount }));
}

function buildTransactionsContext(transactions) {
  const monthly = getMonthlyTransactions(transactions);
  const velocity = spendingVelocity(transactions);
  const projection = monthlyProjection(transactions);
  const cats = getCategoryTotals(transactions, 'expense');
  const anomalies = anomalyDetection(transactions);

  const monthlyExpenses = monthly.filter(t => t.type === 'expense');
  const monthlyIncome = monthly.filter(t => t.type === 'income');
  const totalExpenses = monthlyExpenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = monthlyIncome.reduce((s, t) => s + t.amount, 0);

  const recentTransactions = monthly.slice(0, 30).map(t =>
    `${t.type === 'income' ? '+' : '-'}${t.amount} ${t.category}${t.description ? ` (${t.description})` : ''}`
  ).join('\n');

  const categoryBreakdown = cats.slice(0, 8).map(c =>
    `${c.name}: ${c.value}`
  ).join('\n');

  return `
USER'S FINANCIAL DATA (current month):
- Total Income: ${totalIncome}
- Total Expenses: ${totalExpenses}
- Balance: ${totalIncome - totalExpenses}
- Daily Spending Average: ${velocity.current.toFixed(2)}
- Spending Trend: ${velocity.trend} (${velocity.changePercent}% change)
- Projected Month-End Spending: ${projection.projected.toFixed(2)}
- Day ${projection.dayOfMonth} of ${projection.daysInMonth}

CATEGORY BREAKDOWN:
${categoryBreakdown || 'No expenses recorded'}

ANOMALIES: ${anomalies.length > 0 ? anomalies.map(a => `${a.category}: ${a.amount} (${a.deviation}σ above avg)`).join(', ') : 'None detected'}

RECENT TRANSACTIONS:
${recentTransactions || 'No transactions yet'}
`.trim();
}

export async function chatWithAI(messages, transactions) {
  if (!canMakeRequest()) throw new Error('Daily limit reached (10 requests/day). Try again tomorrow.');

  const context = buildTransactionsContext(transactions);

  const systemPrompt = `You are Spendly AI, a helpful financial assistant for a budget tracking app. Be concise, friendly, and actionable. Use the user's actual financial data below to answer questions. Always reference specific numbers from their data. Keep responses under 150 words unless asked for detail.

${context}`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(IS_DEV ? { 'Authorization': `Bearer ${DEV_API_KEY}` } : {}),
    },
    body: JSON.stringify({ model: 'openai/gpt-oss-20b', messages: apiMessages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error('Rate limited. Wait a moment and try again.');
    if (res.status === 401) throw new Error('Invalid API key. Please check your Groq API key in Settings.');
    if (err.error?.message?.includes('does not exist') || err.error?.message?.includes('not have access')) {
      throw new Error('Model not available. Your API key may not have access to this model. Try a different model in Settings.');
    }
    throw new Error(err.error?.message || `AI error: ${res.status}`);
  }

  incrementRequestCount();

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

export async function generateWeeklySummary(transactions) {
  const messages = [
    { role: 'user', content: 'Generate a brief weekly spending summary. Highlight the top 2-3 categories, any unusual spending, and one actionable tip. Use emojis sparingly. Keep it under 100 words.' },
  ];
  return chatWithAI(messages, transactions);
}

export async function getSavingsTips(transactions) {
  const messages = [
    { role: 'user', content: 'Based on my spending patterns, give me 3 specific, actionable tips to save more money this month. Be concrete with numbers from my data.' },
  ];
  return chatWithAI(messages, transactions);
}

export async function analyzeCategory(transactions, category) {
  const messages = [
    { role: 'user', content: `Analyze my spending on "${category}" in detail. Compare to my overall budget, suggest limits, and flag any unusual transactions.` },
  ];
  return chatWithAI(messages, transactions);
}
