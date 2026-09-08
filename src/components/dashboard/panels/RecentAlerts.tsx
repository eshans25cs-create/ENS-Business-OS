import { motion } from 'framer-motion';
import { mockAlerts } from '../../../lib/mockData';

const RISK_STYLES = {
  VERIFY: { border: 'border-[#FFD600]/30', bg: 'bg-[#FFD600]/5', text: 'text-[#FFD600]', dot: 'bg-[#FFD600]', label: '⚠ VERIFY REQUIRED' },
  HIGH: { border: 'border-[#FF1744]/30', bg: 'bg-[#FF1744]/5', text: 'text-[#FF1744]', dot: 'bg-[#FF1744]', label: '🔴 HIGH RISK SIGNAL' },
  SUSPICIOUS: { border: 'border-[#FF6D00]/30', bg: 'bg-[#FF6D00]/5', text: 'text-[#FF6D00]', dot: 'bg-[#FF6D00]', label: '🟠 SUSPICIOUS' },
};

export default function RecentAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-white/10 p-6"
      style={{ background: 'rgba(8,17,31,0.7)', backdropFilter: 'blur(30px)' }}
    >
      <h3 className="text-xs font-bold tracking-[0.2em] text-[#F8FAFC] uppercase mb-4">⚠ Recent Security Alerts</h3>
      <div className="space-y-3">
        {mockAlerts.map((alert, i) => {
          const style = RISK_STYLES[alert.level];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className={`p-4 rounded-xl border ${style.border} ${style.bg} flex items-start justify-between gap-3`}
            >
              <div>
                <div className={`text-[10px] font-bold tracking-[0.15em] ${style.text} mb-1`}>
                  {style.label}
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{alert.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-[#94A3B8]">Risk Score:</span>
                  <span className={`text-[10px] font-bold ${style.text}`}>{alert.riskScore}</span>
                  <span className="text-[10px] text-[#94A3B8]">{alert.time}</span>
                </div>
              </div>
              <button className={`shrink-0 text-[10px] tracking-[0.1em] ${style.text} font-medium hover:underline`}>
                {alert.level === 'HIGH' ? '→ REVIEW' : '→ VIEW'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
