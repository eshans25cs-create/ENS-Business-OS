export interface AICheckResult {
  hasWarning: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  message: string;
  details?: string;
  level?: 'ok' | 'warning' | 'error';
  suggestion?: number;
}

export const checkAmountAnomaly = (amount: number, recentAmounts: number[]): AICheckResult => {
  if (!recentAmounts.length) return { hasWarning: false, severity: 'none', message: '' };
  
  const avg = recentAmounts.reduce((a, b) => a + b, 0) / recentAmounts.length;
  
  if (amount > avg * 10) {
    return {
      hasWarning: true,
      severity: 'high',
      message: 'Unusually high amount detected',
      details: `This amount (₹${amount}) is more than 10x your recent average (₹${avg.toFixed(0)}).`
    };
  }
  
  if (amount > avg * 5) {
    return {
      hasWarning: true,
      severity: 'medium',
      message: 'High amount detected',
      details: `This amount is significantly higher than your recent average.`
    };
  }
  
  return { hasWarning: false, severity: 'none', message: '' };
};

export const checkDuplicateRequest = (amount: number, recentPayments: { amount: number; createdAt: number }[]): AICheckResult => {
  const now = Date.now();
  const recentDuplicates = recentPayments.filter(p => p.amount === amount && (now - p.createdAt) < 30000);
  
  if (recentDuplicates.length > 0) {
    return {
      hasWarning: true,
      severity: 'medium',
      message: 'Possible duplicate request',
      details: `You just requested a payment for ₹${amount} within the last 30 seconds.`
    };
  }
  
  return { hasWarning: false, severity: 'none', message: '' };
};

export const checkExpenseAnomaly = (amount: number, category: string, historicalExpenses: { amount: number; category: string }[]): AICheckResult => {
  const categoryExpenses = historicalExpenses.filter(e => e.category === category).map(e => e.amount);
  
  if (!categoryExpenses.length) {
    return { hasWarning: false, severity: 'none', message: '' };
  }
  
  const avg = categoryExpenses.reduce((a, b) => a + b, 0) / categoryExpenses.length;
  
  if (amount > avg * 3) {
    return {
      hasWarning: true,
      severity: 'medium',
      message: `Unusual expense for ${category}`,
      details: `This expense is 3x higher than your average in this category.`
    };
  }
  
  return { hasWarning: false, severity: 'none', message: '' };
};

export const checkProfitMarginAlert = (currentMargin: number, previousMargin: number): AICheckResult => {
  if (previousMargin === 0) return { hasWarning: false, severity: 'none', message: '' };
  
  const drop = previousMargin - currentMargin;
  
  if (drop > 10) {
    return {
      hasWarning: true,
      severity: 'high',
      message: 'Significant profit margin drop',
      details: `Your profit margin dropped by ${drop.toFixed(1)}% compared to the previous period.`
    };
  }
  
  if (drop > 5) {
    return {
      hasWarning: true,
      severity: 'low',
      message: 'Profit margin is trending down',
      details: `Margin dropped by ${drop.toFixed(1)}%.`
    };
  }
  
  return { hasWarning: false, severity: 'none', message: '' };
};

export const generateBusinessInsights = (params: {
  todayRevenue: number;
  weekAgoRevenue: number;
  profitMargin: number;
  lastMonthMargin: number;
  topExpenseCategory: string;
  transactionCount: number;
}): string[] => {
  const insights: string[] = [];
  
  // Revenue insight
  if (params.todayRevenue > params.weekAgoRevenue * 1.2) {
    insights.push(`Great job! Today's revenue is up 20%+ compared to this day last week.`);
  } else if (params.todayRevenue < params.weekAgoRevenue * 0.8) {
    insights.push(`Revenue is slower today compared to last week. Consider a quick promo.`);
  }
  
  // Margin insight
  if (params.profitMargin > params.lastMonthMargin) {
    insights.push(`Your profit margins are improving! Up ${(params.profitMargin - params.lastMonthMargin).toFixed(1)}% from last month.`);
  } else if (params.profitMargin < params.lastMonthMargin - 5) {
    insights.push(`Profit margins dropped. You might want to review your expenses, especially ${params.topExpenseCategory}.`);
  }
  
  // Activity insight
  if (params.transactionCount > 50) {
    insights.push(`High volume day with ${params.transactionCount} transactions!`);
  }
  
  if (insights.length === 0) {
    insights.push('Business is running steadily. Keep up the good work!');
  }
  
  return insights;
};
