import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Info } from 'lucide-react';
import { useBillingStore } from '../../../store/billingStore';
import { useBusinessStore } from '../../../store/businessStore';
import { usePaymentStore } from '../../../store/paymentStore';
import { useAuthStore } from '../../../store/authStore';

const AnimatedCounter = ({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(value * ease);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('en-IN', { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      })}
      {suffix}
    </span>
  );
};

export default function ProfitCalculator() {
  const { currentUser } = useAuthStore();
  const { getCurrentBusiness } = useBusinessStore();
  const currentBusiness = getCurrentBusiness(currentUser?.id);
  const { getTodayRevenue, getTodayExpenses, bills, expenses } = useBillingStore();
  const { sessions } = usePaymentStore();

  const currentBusinessId = currentBusiness?.id || 'biz_default';
  const now = new Date();

  // 1. Business Data Isolation
  const businessBills = bills.filter(b => b.businessId === currentBusinessId && b.paymentStatus === 'COMPLETED');
  const businessExpenses = expenses.filter(e => e.businessId === currentBusinessId);
  const businessSessions = sessions.filter(s => s.businessId === currentBusinessId);
  const confirmedSessions = businessSessions.filter(s => s.status === 'PAYMENT_CONFIRMED' || (s.status as string) === 'COMPLETED');

  const isToday = (dateVal: number | string | Date) => {
    return new Date(dateVal).toDateString() === now.toDateString();
  };

  // Real today calculations
  const billingRevenueToday = getTodayRevenue(currentBusinessId) || 0;
  const sessionsRevenueToday = confirmedSessions
    .filter(s => isToday(s.confirmedAt || s.createdAt))
    .reduce((sum, s) => sum + s.amount, 0);

  const todayRevenue = billingRevenueToday > 0 ? billingRevenueToday : sessionsRevenueToday;
  const todayExpenses = getTodayExpenses(currentBusinessId) || 0;
  
  // Gross profit: approx 60% margin on retail revenue, minus operating expenses
  const grossProfit = Math.round(todayRevenue * 0.6);
  const netProfit = grossProfit - todayExpenses;
  const profitMargin = todayRevenue > 0 ? (netProfit / todayRevenue) * 100 : 0;

  const cards = [
    {
      title: "Today's Gross Profit",
      value: grossProfit,
      icon: DollarSign,
      color: "#00C896",
      prefix: "₹",
      subtitle: "Estimated 60% gross margin"
    },
    {
      title: "Today's Net Profit",
      value: netProfit,
      icon: TrendingUp,
      color: netProfit >= 0 ? "#0A84FF" : "#FF3B5C",
      prefix: "₹",
      subtitle: todayExpenses > 0 ? `After ₹${todayExpenses.toLocaleString('en-IN')} expenses` : 'No expenses recorded today'
    },
    {
      title: "Net Profit Margin",
      value: Math.max(0, profitMargin),
      icon: PieChart,
      color: "#FFD700",
      suffix: "%",
      decimals: 1,
      isProgress: true,
      subtitle: todayRevenue > 0 ? 'Based on settled volume' : 'Awaiting settled transactions'
    }
  ];

  // 2. Real Daily/Monthly Bar Chart Calculation (Last 7 Calendar Days)
  const dayMs = 24 * 3600 * 1000;
  const dailySlots = [];

  for (let i = 6; i >= 0; i--) {
    const slotDate = new Date(Date.now() - i * dayMs);
    const dateStr = slotDate.toDateString();
    
    // Label for the day
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : slotDate.toLocaleDateString('en-IN', { weekday: 'short' });
    const fullDate = slotDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

    // Filter transactions on this day
    const dayBills = businessBills.filter(b => new Date(b.createdAt).toDateString() === dateStr);
    const dayConfirmedSessions = confirmedSessions.filter(s => new Date(s.confirmedAt || s.createdAt).toDateString() === dateStr);
    const dayExp = businessExpenses
      .filter(e => new Date(e.date || e.createdAt).toDateString() === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);

    const dayRev = dayBills.reduce((sum, b) => sum + b.totalAmount, 0) + dayConfirmedSessions.reduce((sum, s) => sum + s.amount, 0);
    const dayGross = Math.round(dayRev * 0.6);
    const dayNet = dayGross - dayExp;

    dailySlots.push({
      label,
      fullDate,
      revenue: dayRev,
      expense: dayExp,
      profit: dayNet,
      hasActivity: dayRev > 0 || dayExp > 0
    });
  }

  const hasAnyOverallData = businessBills.length > 0 || businessExpenses.length > 0 || confirmedSessions.length > 0;
  
  // Calculate dynamic scale in exact Rupees
  const rawProfits = dailySlots.map(s => s.profit);
  const maxAbsProfit = Math.max(...rawProfits.map(Math.abs), 50);
  
  // Max scale target
  const maxScaleVal = Math.max(50, Math.ceil(maxAbsProfit * 1.25));
  const isKScale = maxScaleVal >= 10000;

  const formatAxisLabel = (v: number) => {
    if (isKScale) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v.toLocaleString('en-IN')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 rounded-2xl bg-[#0D152D]/95 border border-white/10 text-[#F0F4FF] flex flex-col gap-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 3 Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            variants={cardVariants}
            className="p-4 rounded-xl bg-[rgba(6,15,32,0.6)] border border-white/5 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md"
          >
            <div className="flex justify-between items-center text-[#7E8B9F] text-xs">
              <span className="font-semibold uppercase tracking-wider">{card.title}</span>
              <card.icon size={16} color={card.color} />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-white">
              <AnimatedCounter 
                value={card.value} 
                prefix={card.prefix} 
                suffix={card.suffix} 
                decimals={card.decimals} 
              />
            </div>
            {card.isProgress ? (
              <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: card.color }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(Math.max(card.value, 0), 100)}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            ) : null}
            <p className="text-[11px] text-[#7E8B9F] mt-1 truncate">
              {card.subtitle}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Monthly Profit Overview Bar Chart Section */}
      <motion.div variants={cardVariants} className="p-4 sm:p-6 rounded-2xl bg-[rgba(6,15,32,0.7)] border border-white/5 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Monthly Profit Overview</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20">
                Live Daily Margins
              </span>
            </div>
            <p className="text-xs text-[#7E8B9F] mt-0.5">
              Net revenue minus daily expenses for {currentBusiness?.name || 'your store'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#7E8B9F]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#00D26A]" /> Profit
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#FF3B5C]" /> Loss / Expense
            </span>
          </div>
        </div>

        {/* Empty State Banner if no transactions exist yet */}
        {!hasAnyOverallData && (
          <div className="mb-4 p-3 rounded-xl bg-[#070D1E]/80 border border-[#1A6BFF]/30 flex items-center gap-3 text-xs">
            <Info size={18} className="text-[#3BA0FF] shrink-0" />
            <span className="text-[#A2B4D6]">
              <strong>No transactions recorded yet.</strong> As soon as customers pay via UPI or you record bills, daily profit bars will calculate and rise automatically.
            </span>
          </div>
        )}

        {/* The Bar Chart Canvas */}
        <div className="relative h-64 sm:h-72 w-full pt-4 pb-8 pl-12 pr-2">
          
          {/* Horizontal Reference Lines & Y-Axis Labels */}
          {[maxScaleVal, Math.round(maxScaleVal * 0.5), 0].map((val) => {
            const bottomPercent = (val / maxScaleVal) * 80 + 10;
            return (
              <div 
                key={val} 
                className="absolute left-0 right-0 flex items-center pointer-events-none" 
                style={{ bottom: `${bottomPercent}%` }}
              >
                <span className="absolute left-0 text-[10px] sm:text-xs font-mono text-[#7E8B9F] w-10 text-right pr-2">
                  {formatAxisLabel(val)}
                </span>
                <div className={`w-full h-px ${val === 0 ? 'bg-white/20' : 'bg-white/5'}`} />
              </div>
            );
          })}

          {/* 7 Responsive Vertical Day Bars */}
          <div className="absolute left-12 right-2 inset-y-0 pb-8 pt-4 flex justify-between items-end gap-1.5 sm:gap-4">
            {dailySlots.map((slot, i) => {
              const val = slot.profit;
              const isPositive = val >= 0;
              const absVal = Math.abs(val);
              
              // Calculate responsive height percentage relative to scale
              const heightPercent = maxScaleVal > 0 ? (absVal / maxScaleVal) * 80 : 0;
              // Minimum bar height so small amounts like ₹20 are still clearly visible and interactive
              const displayHeight = slot.hasActivity ? Math.max(10, heightPercent) : (hasAnyOverallData ? 4 : 8);

              return (
                <div key={i} className="relative group flex-1 max-w-[48px] h-full flex flex-col justify-end items-center">
                  
                  {/* Floating Tooltip On Hover / Touch */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-[#070D1E] border border-white/20 text-[#F0F4FF] text-[11px] px-2.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-20 pointer-events-none text-center">
                    <p className="font-bold text-white">{slot.label} ({slot.fullDate})</p>
                    <p className={`font-mono font-bold ${isPositive ? 'text-[#00D26A]' : 'text-[#FF3B5C]'}`}>
                      Net: {val >= 0 ? '+' : '-'}₹{absVal.toLocaleString('en-IN')}
                    </p>
                    {slot.revenue > 0 && (
                      <p className="text-[9px] text-[#7E8B9F]">Sales: ₹{slot.revenue.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  
                  {/* Animated Bar */}
                  <motion.div
                    className={`w-full rounded-t-lg transition-all cursor-pointer ${
                      !hasAnyOverallData 
                        ? 'border border-dashed border-white/20 bg-white/5' 
                        : isPositive 
                          ? 'bg-gradient-to-t from-[#00D26A] to-[#00C896] shadow-[0_0_12px_rgba(0,210,106,0.3)] hover:brightness-110' 
                          : 'bg-gradient-to-t from-[#FF3B5C] to-[#FF6B88] shadow-[0_0_12px_rgba(255,59,92,0.3)] hover:brightness-110'
                    }`}
                    style={{
                      bottom: '10%'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${displayHeight}%` }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.2 + i * 0.08, 
                      type: "spring", 
                      bounce: 0.25 
                    }}
                  />
                  
                  {/* X-Axis Date / Day Label */}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-[#7E8B9F] whitespace-nowrap">
                    {slot.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
