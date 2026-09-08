import { motion } from 'framer-motion';
import { mockPayments } from '../../../lib/mockData';

const RISK_CONFIG = {
  LOW: { color: 'text-[#00E676]', bg: 'bg-[#00E676]/10', border: 'border-[#00E676]/20', dot: '#00E676' },
  VERIFY: { color: 'text-[#FFD600]', bg: 'bg-[#FFD600]/10', border: 'border-[#FFD600]/20', dot: '#FFD600' },
  SUSPICIOUS: { color: 'text-[#FF6D00]', bg: 'bg-[#FF6D00]/10', border: 'border-[#FF6D00]/20', dot: '#FF6D00' },
  HIGH: { color: 'text-[#FF1744]', bg: 'bg-[#FF1744]/10', border: 'border-[#FF1744]/20', dot: '#FF1744' },
};

export default function PaymentHistory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(8,17,31,0.7)', backdropFilter: 'blur(30px)' }}
    >
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-xs font-bold tracking-[0.2em] text-[#F8FAFC] uppercase">Payment Analysis History</h3>
        <p className="text-[10px] text-[#94A3B8] mt-0.5">Demo data — connect a backend for real analysis</p>
      </div>

      <div className="divide-y divide-white/5">
        {mockPayments.map((payment, i) => {
          const risk = RISK_CONFIG[payment.riskLevel];
          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              {/* Risk indicator */}
              <div className={`w-2 h-2 rounded-full shrink-0`} style={{ backgroundColor: risk.dot }} />

              {/* Amount */}
              <div className="min-w-[80px]">
                <span className="text-sm font-semibold text-[#F8FAFC]">₹{payment.amount.toLocaleString()}</span>
              </div>

              {/* Recipient */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#F8FAFC] truncate">{payment.recipient}</p>
                <p className="text-[10px] text-[#94A3B8] truncate">{payment.upiId}</p>
              </div>

              {/* Risk score */}
              <div className="text-right">
                <p className="text-xs text-[#94A3B8]">Score: <span className="text-[#F8FAFC] font-medium">{payment.riskScore}</span></p>
              </div>

              {/* Risk badge */}
              <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold tracking-[0.1em] ${risk.color} ${risk.bg} ${risk.border}`}>
                {payment.riskLevel === 'LOW' ? 'LOW RISK' : payment.riskLevel}
              </div>

              {/* Time */}
              <div className="text-[10px] text-[#94A3B8] shrink-0 hidden lg:block">{payment.time}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
