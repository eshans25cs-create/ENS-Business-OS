import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBillingStore } from '../../../store/billingStore';
import { usePaymentStore } from '../../../store/paymentStore';
import { useBusinessStore } from '../../../store/businessStore';
import { useAuthStore } from '../../../store/authStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const headerVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const controlsVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.5 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS':
    case 'COMPLETED': return 'text-[#00D26A] bg-[#00D26A]/10 border-[#00D26A]/20';
    case 'PENDING':
    case 'ACTIVE':
    case 'PAYMENT_PENDING': return 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/20';
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED': return 'text-[#FF3B5C] bg-[#FF3B5C]/10 border-[#FF3B5C]/20';
    default: return 'text-[#7E8B9F] bg-[#7E8B9F]/10 border-[#7E8B9F]/20';
  }
};

function formatDateGroupTitle(dateStr: string): string {
  const target = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const formatted = target.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (isSameDay(target, today)) {
    return `Today — ${formatted}`;
  }
  if (isSameDay(target, yesterday)) {
    return `Yesterday — ${formatted}`;
  }
  return formatted;
}

interface DateGroup {
  dateKey: string;
  displayDate: string;
  totalAmount: number;
  count: number;
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    method: string;
    note: string;
  }>;
}

const TransactionHistory = () => {
  const { currentUser } = useAuthStore();
  const { getCurrentBusiness } = useBusinessStore();
  const currentBusiness = getCurrentBusiness(currentUser?.id);
  const currentBusinessId = currentBusiness?.id || 'biz_default';
  const { transactions: billingTxns } = useBillingStore();
  const { sessions } = usePaymentStore();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Assemble real transactions strictly for the current business (user data isolation)
  const businessSessions = sessions.filter(s => s.businessId === currentBusinessId);
  const businessBillingTxns = billingTxns.filter(t => t.businessId === currentBusinessId);

  const realTxns = [
    ...businessSessions.map(s => ({
      id: s.id.replace(/^ens_tx_/, 'TXN-'),
      date: new Date(s.createdAt).toISOString(),
      amount: s.amount,
      status: s.status === 'PAYMENT_CONFIRMED' ? 'SUCCESS' : s.status === 'ACTIVE' ? 'PENDING' : s.status,
      method: 'UPI',
      note: s.note || `UPI payment to ${s.merchantName}`,
    })),
    ...businessBillingTxns.map(t => ({
      id: t.id.replace(/^tx_/, 'BILL-'),
      date: new Date(t.createdAt).toISOString(),
      amount: t.amount,
      status: t.status === 'COMPLETED' ? 'SUCCESS' : t.status,
      method: t.method || 'UPI',
      note: t.payerMasked || 'Walk-in Customer',
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const now = Date.now();
  const filteredByTime = realTxns.filter(txn => {
    const txTime = new Date(txn.date).getTime();
    if (filter === 'Today') {
      return new Date(txTime).toDateString() === new Date(now).toDateString();
    }
    if (filter === 'Week') {
      return now - txTime <= 7 * 24 * 60 * 60 * 1000;
    }
    if (filter === 'Month') {
      return now - txTime <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  const filteredTxns = filteredByTime.filter(txn => {
    const q = search.toLowerCase();
    return txn.id.toLowerCase().includes(q) || 
           txn.method.toLowerCase().includes(q) || 
           txn.note.toLowerCase().includes(q);
  });

  // Divide and group transactions according to date
  const groupedTransactions: DateGroup[] = [];
  const groupsMap = new Map<string, typeof filteredTxns>();

  filteredTxns.forEach(txn => {
    const d = new Date(txn.date);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, []);
    }
    groupsMap.get(dateKey)!.push(txn);
  });

  // Sort dates in descending order (latest day first)
  Array.from(groupsMap.keys())
    .sort((a, b) => b.localeCompare(a))
    .forEach(dateKey => {
      const txns = groupsMap.get(dateKey)!;
      const total = txns.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);
      groupedTransactions.push({
        dateKey,
        displayDate: formatDateGroupTitle(txns[0].date),
        totalAmount: total,
        count: txns.length,
        transactions: txns,
      });
    });

  const totalFilteredVolume = filteredTxns.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);

  return (
    <motion.div 
      className="p-4 sm:p-6 bg-[#070D1E] min-h-full text-[#F0F4FF] rounded-xl border border-white/5 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Header */}
      <motion.div variants={headerVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Transaction History</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#3BA0FF] text-[10px] font-bold">
              Divided by Date
            </span>
          </div>
          <p className="text-[#7E8B9F] text-xs sm:text-sm mt-1">
            Real-time merchant ledger for <strong className="text-white">{currentBusiness?.name}</strong>
          </p>
        </div>

        {/* Total stats pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0D152D] border border-white/10 text-right">
            <p className="text-[10px] text-[#7E8B9F] uppercase font-semibold">Total Settled</p>
            <p className="text-sm font-bold text-[#00D26A] font-mono">
              ₹{totalFilteredVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Controls: Search & Time Filter */}
      <motion.div variants={controlsVariants} className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E8B9F]" />
          <input 
            type="text" 
            placeholder="Search by ID, Customer, or Method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0D152D] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#1A6BFF] focus:ring-1 focus:ring-[#1A6BFF] transition-all text-white placeholder:text-[#7E8B9F]"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-[#0D152D] rounded-xl border border-white/5 self-start sm:self-auto">
          {['All', 'Today', 'Week', 'Month'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === f ? 'bg-[#1A6BFF] text-white shadow-md' : 'text-[#7E8B9F] hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grouped Transactions List Divided by Date */}
      <div className="space-y-6">
        {groupedTransactions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0D152D]/40 border border-white/5 space-y-2">
            <Calendar className="w-8 h-8 text-[#6B7FA3] mx-auto opacity-50" />
            <p className="text-sm text-[#7E8B9F] font-medium">No transactions recorded for this period.</p>
            <p className="text-xs text-[#4A5568]">Incoming payments will automatically appear divided by date here.</p>
          </div>
        ) : (
          groupedTransactions.map((group) => (
            <div key={group.dateKey} className="space-y-3">
              {/* DATE SECTION DIVIDER HEADER */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0B132B]/95 border border-[rgba(10,132,255,0.25)] backdrop-blur-md shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0A84FF]/20 border border-[#0A84FF]/40 flex items-center justify-center text-[#3BA0FF]">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#FFFFFF] tracking-tight">
                      {group.displayDate}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[#A0AEC0] text-[11px] font-semibold">
                    {group.count} {group.count === 1 ? 'Txn' : 'Txns'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#00D26A]/15 border border-[#00D26A]/30 text-[#00D26A] font-mono font-bold text-[11px]">
                    ₹{group.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Transactions Table for this Date */}
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0D152D]/60">
                <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                  <thead className="bg-[#0D152D] text-[#7E8B9F] border-b border-white/10 text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 sm:px-6 py-3">Transaction ID</th>
                      <th className="px-4 sm:px-6 py-3">Time</th>
                      <th className="px-4 sm:px-6 py-3">Customer / Note</th>
                      <th className="px-4 sm:px-6 py-3">Method</th>
                      <th className="px-4 sm:px-6 py-3">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {group.transactions.map((txn, i) => (
                        <motion.tr 
                          key={txn.id}
                          custom={i}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-3.5 font-medium font-mono text-[#1A6BFF] text-xs">
                            {txn.id}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-[#7E8B9F] text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-[#0A84FF]" />
                              {new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-[#F0F4FF] text-xs max-w-[180px] truncate">
                            {txn.note}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-white/5 text-[#A0AEC0] text-[10px] font-bold">
                              {txn.method}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(txn.status)}`}>
                              {txn.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-right font-mono font-bold text-xs sm:text-sm">
                            <div className="flex justify-end items-center gap-1 text-[#F0F4FF]">
                              {txn.status === 'SUCCESS' ? (
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#00D26A]" />
                              ) : txn.status === 'FAILED' ? (
                                <ArrowDownLeft className="w-3.5 h-3.5 text-[#FF3B5C]" />
                              ) : null}
                              ₹{txn.amount.toFixed(2)}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default TransactionHistory;

