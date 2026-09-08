import { motion } from 'framer-motion';
import { mockPayments } from '../../../lib/mockData';

const RISK_DOT = {
  LOW: '#00E676',
  VERIFY: '#FFD600',
  SUSPICIOUS: '#FF6D00',
  HIGH: '#FF1744',
};

export default function SecurityTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="rounded-2xl border border-white/10 p-6"
      style={{ background: 'rgba(8,17,31,0.7)', backdropFilter: 'blur(30px)' }}
    >
      <h3 className="text-xs font-bold tracking-[0.2em] text-[#F8FAFC] uppercase mb-5">Security Timeline</h3>

      <div className="relative pl-6 space-y-5">
        {/* Vertical line */}
        <div className="absolute left-2 top-1 bottom-1 w-[1px] bg-gradient-to-b from-[#00C6FF]/40 to-transparent" />

        {mockPayments.slice(0, 4).map((payment, i) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 + i * 0.1 }}
            className="relative flex items-start gap-3"
          >
            {/* Timeline dot */}
            <div
              className="absolute -left-[18px] w-3 h-3 rounded-full border-2 border-[#030712] mt-0.5"
              style={{ backgroundColor: RISK_DOT[payment.riskLevel] }}
            />

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#94A3B8]">{payment.time} · {payment.date}</span>
                <span
                  className="text-[10px] font-bold tracking-[0.1em]"
                  style={{ color: RISK_DOT[payment.riskLevel] }}
                >
                  {payment.riskLevel === 'LOW' ? '🟢 SAFE' : payment.riskLevel === 'VERIFY' ? '🟡 VERIFY' : '🔴 HIGH RISK'}
                </span>
              </div>
              <p className="text-xs text-[#F8FAFC] mt-0.5">{payment.recipient} · <span className="text-[#94A3B8]">₹{payment.amount.toLocaleString()}</span></p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
