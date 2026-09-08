export const mockPayments = [
  {
    id: 'p1',
    amount: 500,
    recipient: 'Local Store',
    upiId: 'localstore****@upi',
    riskScore: 12,
    riskLevel: 'LOW' as const,
    time: '10:30 AM',
    date: 'Today',
    reason: 'Known merchant, consistent transaction pattern',
  },
  {
    id: 'p2',
    amount: 1200,
    recipient: 'Restaurant',
    upiId: 'restaurant****@upi',
    riskScore: 18,
    riskLevel: 'LOW' as const,
    time: '12:45 PM',
    date: 'Today',
    reason: 'Verified business, typical amount range',
  },
  {
    id: 'p3',
    amount: 5000,
    recipient: 'New Merchant',
    upiId: 'newmerchant****@upi',
    riskScore: 56,
    riskLevel: 'VERIFY' as const,
    time: '02:20 PM',
    date: 'Today',
    reason: 'First-time recipient, amount above usual threshold',
  },
  {
    id: 'p4',
    amount: 25000,
    recipient: 'Unknown Recipient',
    upiId: 'unknown****@upi',
    riskScore: 82,
    riskLevel: 'HIGH' as const,
    time: '05:40 PM',
    date: 'Today',
    reason: 'Unverified recipient, multiple risk signals detected',
  },
  {
    id: 'p5',
    amount: 800,
    recipient: 'Grocery Store',
    upiId: 'grocery****@upi',
    riskScore: 8,
    riskLevel: 'LOW' as const,
    time: '09:15 AM',
    date: 'Yesterday',
    reason: 'Regular merchant, low amount',
  },
];

export const mockStats = {
  paymentsAnalyzed: 24,
  safePayments: 20,
  verifyRequired: 3,
  suspicious: 1,
  highRisk: 0,
  aiConfidence: 92,
  securityScore: 86,
};

export const mockAlerts = [
  {
    id: 'a1',
    level: 'VERIFY' as const,
    title: 'Verification Required',
    description: 'New recipient detected with unknown transaction history',
    riskScore: 56,
    time: '2:20 PM',
  },
  {
    id: 'a2',
    level: 'HIGH' as const,
    title: 'High Risk Signal',
    description: 'Multiple verification signals triggered simultaneously',
    riskScore: 82,
    time: '5:40 PM',
  },
];

export const mockInsights = [
  {
    id: 'i1',
    icon: 'brain',
    title: 'AI Insight',
    text: 'Most of your analyzed payments fall within a low-risk amount range.',
  },
  {
    id: 'i2',
    icon: 'shield',
    title: 'Security Insight',
    text: 'You have verified 3 new recipients this month.',
  },
  {
    id: 'i3',
    icon: 'alert-triangle',
    title: 'Attention',
    text: 'One recent payment contained multiple risk signals.',
  },
];
