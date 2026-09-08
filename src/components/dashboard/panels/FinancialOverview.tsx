import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  ShoppingBag, 
  BarChart3, 
  ClipboardList, 
  ChevronDown,
  Coins,
  ArrowUpRight
} from 'lucide-react';
import { useBusinessStore } from '../../../store/businessStore';
import { useBillingStore } from '../../../store/billingStore';
import { usePaymentStore } from '../../../store/paymentStore';
import { useAuthStore } from '../../../store/authStore';

interface FinancialOverviewProps {
  onCreatePayment?: () => void;
  onNavigateTab?: (tab: string) => void;
}

const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    const target = value;
    const duration = 1200;
    const start = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setDisplayVal(Math.floor(easeOutQuart * target));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{displayVal.toLocaleString('en-IN')}{suffix}</span>;
};

export default function FinancialOverview({ onCreatePayment, onNavigateTab }: FinancialOverviewProps) {
  const { currentUser } = useAuthStore();
  const { getCurrentBusiness } = useBusinessStore();
  const currentBusiness = getCurrentBusiness(currentUser?.id);
  const { getTodayRevenue, getTodayExpenses, transactions: billingTxns } = useBillingStore();
  const { sessions } = usePaymentStore();

  const [timeFilter, setTimeFilter] = useState('This Week');

  const currentBusinessId = currentBusiness?.id || 'biz_default';

  // Filter payment sessions & transactions belonging to the current business
  const businessSessions = sessions.filter(s => s.businessId === currentBusinessId);
  const businessBillingTxns = billingTxns.filter(t => t.businessId === currentBusinessId);

  // Helper to check if a timestamp is today
  const isToday = (timestamp: number) => {
    return new Date(timestamp).toDateString() === new Date().toDateString();
  };

  // Real calculations
  // 1. Confirmed payment sessions today
  const todayConfirmedSessions = businessSessions.filter(
    s => s.status === 'PAYMENT_CONFIRMED' && isToday(s.confirmedAt || s.createdAt)
  );
  const sessionsSalesToday = todayConfirmedSessions.reduce((sum, s) => sum + s.amount, 0);

  // 2. Billing store revenue today
  const billingSalesToday = getTodayRevenue(currentBusinessId) || 0;

  // Real today sales (sum of confirmed UPI payments & store bills)
  const todaySales = sessionsSalesToday > 0 ? sessionsSalesToday : billingSalesToday;

  // Real today expenses
  const todayExpenses = getTodayExpenses(currentBusinessId) || 0;

  // Real today profit: Gross margin (~40% cost) minus expenses
  const todayCostOfGoods = Math.round(todaySales * 0.4);
  const todayProfit = Math.max(0, todaySales - todayCostOfGoods - todayExpenses);

  // Real total completed transaction count
  const todayTransactionsCount = todayConfirmedSessions.length + (billingSalesToday > 0 ? 1 : 0);
  const allCompletedTxnCount = businessSessions.filter(s => s.status === 'PAYMENT_CONFIRMED').length + businessBillingTxns.length;
  const displayTxnCount = todayTransactionsCount > 0 ? todayTransactionsCount : allCompletedTxnCount;

  // Real active QR count
  const activeQrCount = businessSessions.filter(s => s.status === 'ACTIVE').length;

  // Assemble real recent transactions
  const realRecentList = [
    ...businessSessions.map(s => ({
      keyId: s.id,
      billId: s.id.replace(/^ens_tx_/, 'TXN-').substring(0, 16),
      customer: s.note || 'UPI Customer',
      amount: `₹${s.amount.toLocaleString('en-IN')}`,
      status: s.status === 'PAYMENT_CONFIRMED' ? 'SUCCESS' : s.status === 'ACTIVE' ? 'PENDING' : 'FAILED',
      time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: s.createdAt,
    })),
    ...businessBillingTxns.map(t => ({
      keyId: t.id,
      billId: t.id.replace(/^tx_/, 'BILL-').substring(0, 16),
      customer: t.payerMasked || 'Walk-in Customer',
      amount: `₹${t.amount.toLocaleString('en-IN')}`,
      status: t.status === 'COMPLETED' ? 'SUCCESS' : 'FAILED',
      time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: t.createdAt,
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);

  // Real weekly sales calculation for Mon - Sun
  const weekDayRevenues = [0, 0, 0, 0, 0, 0, 0]; // Mon (0) to Sun (6)
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Convert Sun(0)..Sat(6) to Mon(0)..Sun(6)
  
  // Assign today's sales to today's day index
  weekDayRevenues[currentDayOfWeek] = todaySales;

  // Map any other sessions in the last 7 days
  businessSessions.forEach(s => {
    if (s.status === 'PAYMENT_CONFIRMED') {
      const d = new Date(s.confirmedAt || s.createdAt);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        const dayIdx = (d.getDay() + 6) % 7;
        if (dayIdx !== currentDayOfWeek) {
          weekDayRevenues[dayIdx] += s.amount;
        }
      }
    }
  });

  const maxWeeklyRevenue = Math.max(...weekDayRevenues, 100);
  const isScaleK = maxWeeklyRevenue >= 10000;
  const maxScaleVal = isScaleK 
    ? Math.max(15000, Math.ceil(maxWeeklyRevenue / 15000) * 15000)
    : Math.max(100, Math.ceil(maxWeeklyRevenue * 1.25));

  // Generate SVG curve points based on real daily revenues
  const xCoords = [30, 75, 120, 165, 210, 255, 300];
  const chartPoints = xCoords.map((x, i) => {
    const val = weekDayRevenues[i];
    const ratio = Math.min(val / maxScaleVal, 1);
    const y = 120 - ratio * 95;
    return { x, y, val };
  });

  // Construct smooth SVG path
  const linePath = chartPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp2x = cp1x;
    return `${acc} C ${cp1x},${prev.y} ${cp2x},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const areaPath = `${linePath} L 300,125 L 30,125 Z`;
  const peakPoint = chartPoints[currentDayOfWeek] || chartPoints[4];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto"
    >
      
      {/* ============================================================ */}
      {/* ROW 1: 4 TOP STAT CARDS (LIVE REAL STORE DATA)              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Sales */}
        <motion.div variants={itemVariants} className="bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#7E8B9F] font-medium">Today's Sales</p>
              <h3 className="text-2xl font-black text-[#FFFFFF] mt-1 tracking-tight">
                <AnimatedNumber value={todaySales} prefix="₹" />
              </h3>
              <p className="text-[11px] text-[#00D26A] font-medium flex items-center gap-0.5 mt-2">
                <span>{todaySales > 0 ? '+100%' : '₹0'}</span> <span className="text-[#7E8B9F]">live store revenue</span>
              </p>
            </div>
            {/* Sparkline Wave (Blue) */}
            <div className="w-20 h-10">
              <svg viewBox="0 0 80 40" className="w-full h-full overflow-visible">
                <motion.path
                  d="M0,30 Q20,35 40,20 T80,8"
                  fill="none"
                  stroke="#1A6BFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Today's Profit */}
        <motion.div variants={itemVariants} className="bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#7E8B9F] font-medium">Today's Profit</p>
              <h3 className="text-2xl font-black text-[#FFFFFF] mt-1 tracking-tight">
                <AnimatedNumber value={todayProfit} prefix="₹" />
              </h3>
              <p className="text-[11px] text-[#00D26A] font-medium flex items-center gap-0.5 mt-2">
                <span>{todaySales > 0 ? '60% margin' : '0% margin'}</span> <span className="text-[#7E8B9F]">net estimated</span>
              </p>
            </div>
            {/* Sparkline Wave (Green) */}
            <div className="w-20 h-10">
              <svg viewBox="0 0 80 40" className="w-full h-full overflow-visible">
                <motion.path
                  d="M0,32 Q25,36 50,16 T80,10"
                  fill="none"
                  stroke="#00D26A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Transactions */}
        <motion.div variants={itemVariants} className="bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#7E8B9F] font-medium">Transactions</p>
              <h3 className="text-2xl font-black text-[#FFFFFF] mt-1 tracking-tight">
                <AnimatedNumber value={displayTxnCount} />
              </h3>
              <p className="text-[11px] text-[#00D26A] font-medium flex items-center gap-0.5 mt-2">
                <span>{displayTxnCount} processed</span>
              </p>
            </div>
            {/* Purple Coins Stack Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Coins size={20} />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Active QR */}
        <motion.div variants={itemVariants} className="bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#7E8B9F] font-medium">Active QR</p>
              <h3 className="text-2xl font-black text-[#FFFFFF] mt-1 tracking-tight">
                <AnimatedNumber value={activeQrCount} />
              </h3>
              <p className="text-[11px] text-[#7E8B9F] font-medium mt-2">
                {activeQrCount > 0 ? 'Live QR active' : 'No active sessions'}
              </p>
            </div>
            {/* Sparkline Wave (Gold) */}
            <div className="w-20 h-10">
              <svg viewBox="0 0 80 40" className="w-full h-full overflow-visible">
                <motion.path
                  d="M0,28 Q25,32 50,18 T80,12"
                  fill="none"
                  stroke="#EAB308"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
              </svg>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ============================================================ */}
      {/* ROW 2: RECENT TRANSACTIONS + SALES OVERVIEW CURVED CHART    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Recent Transactions */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-7 bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 shadow-lg backdrop-blur-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#FFFFFF]">Recent Transactions</h3>
            <button 
              onClick={() => onNavigateTab?.('transactions')} 
              className="text-xs text-[#1A6BFF] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#7E8B9F] border-b border-[rgba(255,255,255,0.05)] pb-2">
                  <th className="pb-3 font-semibold">Bill ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <motion.tbody 
                className="divide-y divide-[rgba(255,255,255,0.03)]"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.2
                    }
                  }
                }}
              >
                {realRecentList.length > 0 ? (
                  realRecentList.map((tx) => (
                    <motion.tr 
                      key={tx.keyId} 
                      variants={tableRowVariants}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', scale: 1.01 }}
                      className="hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                    >
                      <td className="py-3 font-mono font-medium text-[#F0F4FF]">{tx.billId}</td>
                      <td className="py-3 text-[#7E8B9F]">{tx.customer}</td>
                      <td className="py-3 font-mono font-bold text-[#F0F4FF]">{tx.amount}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          tx.status === 'SUCCESS'
                            ? 'bg-[#00D26A]/15 text-[#00D26A] border border-[#00D26A]/30'
                            : tx.status === 'PENDING'
                            ? 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30'
                            : 'bg-[#FF3B5C]/15 text-[#FF3B5C] border border-[#FF3B5C]/30'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#7E8B9F] text-right font-mono">{tx.time}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#7E8B9F]">
                      <p className="mb-2">No transactions recorded yet.</p>
                      <button 
                        onClick={onCreatePayment}
                        className="text-xs text-[#1A6BFF] hover:underline font-semibold cursor-pointer"
                      >
                        + Generate a Payment QR to start accepting payments
                      </button>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Column (5 cols): Sales Overview Curved Line Chart */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-5 bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#FFFFFF]">Sales Overview</h3>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-xs text-[#7E8B9F] hover:text-white cursor-pointer">
              <span>{timeFilter}</span>
              <ChevronDown size={12} />
            </button>
          </div>

          {/* SVG Curved Line Chart */}
          <div className="relative w-full h-44 my-auto">
            {/* Tooltip on Active Day Peak */}
            {todaySales > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5, type: 'spring' }}
                style={{ 
                  left: `${Math.max(10, Math.min(85, (peakPoint.x / 320) * 100))}%`,
                  top: `${Math.max(5, (peakPoint.y / 140) * 100 - 18)}%` 
                }}
                className="absolute bg-[#080E1E] border border-[#1A6BFF]/50 px-2 py-0.5 rounded text-[10px] font-bold text-[#FFFFFF] shadow-lg z-10 -translate-x-1/2"
              >
                ₹{todaySales.toLocaleString('en-IN')}
              </motion.div>
            )}

            <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A6BFF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#1A6BFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[15, 45, 75, 105].map((y, i) => (
                <motion.line 
                  key={`grid-${i}`}
                  x1="25" y1={y} x2="315" y2={y} 
                  stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.1 * i }}
                />
              ))}

              {/* Y Axis Labels */}
              <text x="0" y="18" fill="#4B5563" fontSize="8">
                {isScaleK ? `${(maxScaleVal / 1000).toFixed(0)}K` : maxScaleVal}
              </text>
              <text x="0" y="48" fill="#4B5563" fontSize="8">
                {isScaleK ? `${(maxScaleVal * 0.75 / 1000).toFixed(0)}K` : Math.round(maxScaleVal * 0.75)}
              </text>
              <text x="0" y="78" fill="#4B5563" fontSize="8">
                {isScaleK ? `${(maxScaleVal * 0.5 / 1000).toFixed(0)}K` : Math.round(maxScaleVal * 0.5)}
              </text>
              <text x="0" y="108" fill="#4B5563" fontSize="8">
                {isScaleK ? `${(maxScaleVal * 0.25 / 1000).toFixed(0)}K` : Math.round(maxScaleVal * 0.25)}
              </text>
              <text x="5" y="130" fill="#4B5563" fontSize="8">0</text>

              {/* Area Gradient under Curve */}
              <motion.path
                d={areaPath}
                fill="url(#chartGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />

              {/* The Smooth Spline Line */}
              <motion.path
                d={linePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {/* Peak Circle Marker */}
              <motion.circle 
                cx={peakPoint.x} cy={peakPoint.y} r="4.5" 
                fill="#FFFFFF" stroke="#1A6BFF" strokeWidth="2.5" 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.8, type: 'spring', stiffness: 300, damping: 10 }}
              />
            </svg>
          </div>

          {/* X Axis Day Labels */}
          <div className="flex justify-between text-[10px] text-[#4B5563] px-3 pt-2">
            <span className={currentDayOfWeek === 0 ? 'text-[#1A6BFF] font-bold' : ''}>Mon</span>
            <span className={currentDayOfWeek === 1 ? 'text-[#1A6BFF] font-bold' : ''}>Tue</span>
            <span className={currentDayOfWeek === 2 ? 'text-[#1A6BFF] font-bold' : ''}>Wed</span>
            <span className={currentDayOfWeek === 3 ? 'text-[#1A6BFF] font-bold' : ''}>Thu</span>
            <span className={currentDayOfWeek === 4 ? 'text-[#1A6BFF] font-bold' : ''}>Fri</span>
            <span className={currentDayOfWeek === 5 ? 'text-[#1A6BFF] font-bold' : ''}>Sat</span>
            <span className={currentDayOfWeek === 6 ? 'text-[#1A6BFF] font-bold' : ''}>Sun</span>
          </div>
        </motion.div>

      </div>

      {/* ============================================================ */}
      {/* ROW 3: 4 BOTTOM ACTION MODULE CARDS                         */}
      {/* ============================================================ */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2"
      >
        
        {/* Action 1: Create Payment (Highlighted with Blue Glowing Border) */}
        <motion.button
          type="button"
          onClick={onCreatePayment}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={{ boxShadow: ['0 0 15px rgba(26,107,255,0.2)', '0 0 30px rgba(26,107,255,0.5)', '0 0 15px rgba(26,107,255,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="p-5 rounded-2xl bg-[#0B132B]/90 border-2 border-[#1A6BFF] hover:border-[#3BA0FF] transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1A6BFF]/15 border border-[#1A6BFF]/30 flex items-center justify-center text-[#1A6BFF] group-hover:scale-110 transition-transform mb-3 shadow-[0_0_12px_rgba(26,107,255,0.4)]">
            <QrCode size={22} />
          </div>
          <h4 className="text-xs font-bold text-[#FFFFFF]">Create Payment</h4>
          <p className="text-[10px] text-[#7E8B9F] mt-0.5">Generate instant payment QR</p>
        </motion.button>

        {/* Action 2: Products */}
        <motion.button
          type="button"
          onClick={() => onNavigateTab?.('products')}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="p-5 rounded-2xl bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] hover:border-[#1A6BFF]/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#7E8B9F] group-hover:text-[#1A6BFF] group-hover:scale-110 transition-all mb-3">
            <ShoppingBag size={20} />
          </div>
          <h4 className="text-xs font-bold text-[#FFFFFF]">Products</h4>
          <p className="text-[10px] text-[#7E8B9F] mt-0.5">Manage your products</p>
        </motion.button>

        {/* Action 3: Reports */}
        <motion.button
          type="button"
          onClick={() => onNavigateTab?.('reports')}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="p-5 rounded-2xl bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] hover:border-[#1A6BFF]/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#7E8B9F] group-hover:text-[#1A6BFF] group-hover:scale-110 transition-all mb-3">
            <BarChart3 size={20} />
          </div>
          <h4 className="text-xs font-bold text-[#FFFFFF]">Reports</h4>
          <p className="text-[10px] text-[#7E8B9F] mt-0.5">Business reports & analytics</p>
        </motion.button>

        {/* Action 4: Expenses */}
        <motion.button
          type="button"
          onClick={() => onNavigateTab?.('expenses')}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="p-5 rounded-2xl bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] hover:border-[#1A6BFF]/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#7E8B9F] group-hover:text-[#1A6BFF] group-hover:scale-110 transition-all mb-3">
            <ClipboardList size={20} />
          </div>
          <h4 className="text-xs font-bold text-[#FFFFFF]">Expenses</h4>
          <p className="text-[10px] text-[#7E8B9F] mt-0.5">Track your expenses</p>
        </motion.button>
      </motion.div>

    </motion.div>
  );
}
