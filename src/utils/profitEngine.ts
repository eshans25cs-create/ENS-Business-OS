export interface ProfitReport {
  totalRevenue: number;
  totalProductCost: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  netProfitMargin: number; // percentage
  grossProfitMargin: number;
}

export const calculateProfit = (params: {
  revenue: number;
  productCost: number;
  expenses: number;
}): ProfitReport => {
  const { revenue, productCost, expenses } = params;
  
  const grossProfit = revenue - productCost;
  const netProfit = grossProfit - expenses;
  
  const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  return {
    totalRevenue: revenue,
    totalProductCost: productCost,
    grossProfit,
    totalExpenses: expenses,
    netProfit,
    netProfitMargin,
    grossProfitMargin
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const formatCurrencyShort = (amount: number): string => {
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
};

export const calculateGrowth = (current: number, previous: number): { percentage: number; direction: 'up' | 'down' | 'flat' } => {
  if (previous === 0) {
    return { percentage: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'flat' };
  }
  
  const percentage = ((current - previous) / Math.abs(previous)) * 100;
  let direction: 'up' | 'down' | 'flat' = 'flat';
  
  if (percentage > 0) direction = 'up';
  else if (percentage < 0) direction = 'down';
  
  return { percentage: Math.abs(percentage), direction };
};
