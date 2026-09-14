import {
  startOfMonth, endOfMonth, subDays, differenceInCalendarDays,
  format, parseISO, startOfWeek, endOfWeek,
  isWithinInterval, getDay, getDate,
} from 'date-fns';

export function getMonthlyTransactions(transactions, date = new Date()) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return transactions.filter(t => {
    const d = typeof t.date === 'string' ? parseISO(t.date) : t.date;
    return isWithinInterval(d, { start, end });
  });
}

export function getMonthlyTotals(transactions, date = new Date()) {
  const monthly = getMonthlyTransactions(transactions, date);
  const income = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const incomeSpend = monthly.filter(t => t.type === 'expense' && t.source !== 'savings').reduce((s, t) => s + t.amount, 0);
  const savingsSpend = monthly.filter(t => t.type === 'expense' && t.source === 'savings').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense, incomeSpend, savingsSpend };
}

export function getAllTimeTotals(transactions) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const incomeSpend = transactions.filter(t => t.type === 'expense' && t.source !== 'savings').reduce((s, t) => s + t.amount, 0);
  const savingsSpend = transactions.filter(t => t.type === 'expense' && t.source === 'savings').reduce((s, t) => s + t.amount, 0);
  return { income, expense, netSavings: income - expense, incomeSpend, savingsSpend };
}

export function getCategoryTotals(transactions, type = 'expense', date = new Date()) {
  const monthly = getMonthlyTransactions(transactions, date).filter(t => t.type === type);
  const totals = {};
  monthly.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getCategoryTotalsAllTime(transactions, type = 'expense') {
  const filtered = transactions.filter(t => t.type === type);
  const totals = {};
  filtered.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function spendingVelocity(transactions) {
  const now = new Date();
  const last7Start = subDays(now, 6);
  const prev7Start = subDays(now, 13);
  const prev7End = subDays(now, 7);

  const isInRange = (date, start, end) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isWithinInterval(d, { start, end });
  };

  const expenses = transactions.filter(t => t.type === 'expense');
  const last7 = expenses.filter(t => isInRange(t.date, last7Start, now));
  const prev7 = expenses.filter(t => isInRange(t.date, prev7Start, prev7End));

  const last7Total = last7.reduce((s, t) => s + t.amount, 0);
  const prev7Total = prev7.reduce((s, t) => s + t.amount, 0);

  const last7Avg = last7Total / 7;
  const prev7Avg = prev7Total / 7;

  const changePercent = prev7Avg === 0 ? (last7Avg > 0 ? 100 : 0) : ((last7Avg - prev7Avg) / prev7Avg) * 100;

  return {
    current: last7Avg,
    previous: prev7Avg,
    changePercent: Math.round(changePercent * 10) / 10,
    trend: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable',
  };
}

export function getCategoryTrends(transactions) {
  const now = new Date();
  const categories = {};

  for (let i = 0; i < 4; i++) {
    const weekStart = startOfWeek(subDays(now, i * 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subDays(now, i * 7), { weekStartsOn: 1 });
    const label = `Week ${4 - i}`;

    transactions
      .filter(t => t.type === 'expense' && isWithinInterval(
        typeof t.date === 'string' ? parseISO(t.date) : t.date,
        { start: weekStart, end: weekEnd }
      ))
      .forEach(t => {
        if (!categories[t.category]) categories[t.category] = [];
        categories[t.category].push({ week: label, amount: t.amount });
      });
  }

  const result = {};
  for (const [cat, entries] of Object.entries(categories)) {
    const weekTotals = {};
    entries.forEach(e => {
      weekTotals[e.week] = (weekTotals[e.week] || 0) + e.amount;
    });
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w => weekTotals[w] || 0);
    const increasing = weeks[3] > weeks[2] && weeks[2] > weeks[1];
    result[cat] = { weeks, increasing, latest: weeks[3] };
  }

  return result;
}

export function monthlyProjection(transactions, date = new Date()) {
  const now = new Date();
  const dayOfMonth = getDate(now);
  const daysInMonth = differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1;
  const monthly = getMonthlyTransactions(transactions, now);
  const expenses = monthly.filter(t => t.type === 'expense');
  const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);

  const dailyRate = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
  const projected = dailyRate * daysInMonth;

  return { dailyRate, projected, dayOfMonth, daysInMonth };
}

export function habitPatterns(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const byDay = [0, 0, 0, 0, 0, 0, 0];
  const byHalf = [0, 0];

  expenses.forEach(t => {
    const d = typeof t.date === 'string' ? parseISO(t.date) : t.date;
    byDay[getDay(d)] += t.amount;
    const day = getDate(d);
    if (day <= 15) byHalf[0] += t.amount;
    else byHalf[1] += t.amount;
  });

  const peakDay = dayNames[byDay.indexOf(Math.max(...byDay))];
  const peakHalf = byHalf[0] > byHalf[1] ? 'first half' : 'second half';

  return { byDay, dayNames, peakDay, peakHalf, byHalf };
}

export function anomalyDetection(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryAmounts = {};

  expenses.forEach(t => {
    if (!categoryAmounts[t.category]) categoryAmounts[t.category] = [];
    categoryAmounts[t.category].push(t.amount);
  });

  const anomalies = [];
  for (const [cat, amounts] of Object.entries(categoryAmounts)) {
    if (amounts.length < 3) continue;
    const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const variance = amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length;
    const std = Math.sqrt(variance);

    expenses
      .filter(t => t.category === cat)
      .forEach(t => {
        if (std > 0 && (t.amount - mean) / std > 2) {
          anomalies.push({
            transaction: t,
            category: cat,
            amount: t.amount,
            average: Math.round(mean),
            deviation: Math.round(((t.amount - mean) / std) * 10) / 10,
          });
        }
      });
  }

  return anomalies.sort((a, b) => b.deviation - a.deviation);
}

export function calculateGoalActual(goal, transactions) {
  const monthly = getMonthlyTransactions(transactions);
  const relevant = goal.category
    ? monthly.filter(t => t.type === goal.type && t.category === goal.category)
    : monthly.filter(t => t.type === goal.type);
  return relevant.reduce((s, t) => s + t.amount, 0);
}

export function calculateGoalRating(goal, actual) {
  if (!goal.targetAmount || goal.targetAmount <= 0) return 5;
  const ratio = actual / goal.targetAmount;

  if (goal.type === 'expense') {
    // For spending goals: lower is better (spending under target is good)
    if (ratio <= 0.5) return 10;
    if (ratio <= 0.6) return 9;
    if (ratio <= 0.7) return 8;
    if (ratio <= 0.8) return 7;
    if (ratio <= 0.9) return 6;
    if (ratio <= 1.0) return 5;
    if (ratio <= 1.1) return 4;
    if (ratio <= 1.2) return 3;
    if (ratio <= 1.5) return 2;
    return 1;
  } else {
    // For income/savings goals: higher is better (hitting target is good)
    if (ratio >= 1.2) return 10;
    if (ratio >= 1.1) return 9;
    if (ratio >= 1.0) return 8;
    if (ratio >= 0.9) return 7;
    if (ratio >= 0.8) return 6;
    if (ratio >= 0.7) return 5;
    if (ratio >= 0.6) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.3) return 2;
    return 1;
  }
}

export function calculateHealthScore(healthGoals, transactions) {
  if (healthGoals.length === 0) return null;

  const ratings = healthGoals.map(goal => {
    const actual = calculateGoalActual(goal, transactions);
    return calculateGoalRating(goal, actual);
  });

  const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
  return Math.round(avg * 10) / 10;
}

export function generateMonthlyReport(transactions, categories, date = new Date()) {
  const monthly = getMonthlyTransactions(transactions, date);
  const expenses = monthly.filter(t => t.type === 'expense');
  const income = monthly.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const incomeSpend = expenses.filter(t => t.source !== 'savings').reduce((s, t) => s + t.amount, 0);
  const savingsSpend = expenses.filter(t => t.source === 'savings').reduce((s, t) => s + t.amount, 0);

  const catTotals = {};
  expenses.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const topCategories = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount, percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0 }));

  return {
    month: format(date, 'MMMM yyyy'),
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    incomeSpend,
    savingsSpend,
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - incomeSpend) / totalIncome) * 100) : 0,
    transactionCount: monthly.length,
    topCategories,
  };
}

export function generateAllTimeReport(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const incomeSpend = expenses.filter(t => t.source !== 'savings').reduce((s, t) => s + t.amount, 0);
  const savingsSpend = expenses.filter(t => t.source === 'savings').reduce((s, t) => s + t.amount, 0);

  const catTotals = {};
  expenses.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const topCategories = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, amount]) => ({ name, amount, percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0 }));

  // Monthly breakdown
  const monthlyMap = {};
  transactions.forEach(t => {
    const d = typeof t.date === 'string' ? parseISO(t.date) : t.date;
    const key = format(d, 'yyyy-MM');
    if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
    if (t.type === 'income') monthlyMap[key].income += t.amount;
    else monthlyMap[key].expense += t.amount;
  });

  const monthlyBreakdown = Object.entries(monthlyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month: format(parseISO(month + '-01'), 'MMM yyyy'),
      ...data,
      net: data.income - data.expense,
    }));

  return {
    totalIncome,
    totalExpense,
    netSavings: totalIncome - totalExpense,
    incomeSpend,
    savingsSpend,
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - incomeSpend) / totalIncome) * 100) : 0,
    transactionCount: transactions.length,
    topCategories,
    monthlyBreakdown,
  };
}
