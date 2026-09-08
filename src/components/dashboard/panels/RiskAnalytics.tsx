import { motion } from 'framer-motion';
import { mockStats } from '../../../lib/mockData';

export default function RiskAnalytics() {
  const total = mockStats.paymentsAnalyzed;
  const data = [
    { label: 'LOW RISK', value: mockStats.safePayments, color: '#00E676', pct: Math.round((mockStats.safePayments / total) * 100) },
    { label: 'VERIFY', value: mockStats.verifyRequired, color: '#FFD600', pct: Math.round((mockStats.verifyRequired / total) * 100) },
    { label: 'SUSPICIOUS', value: mockStats.suspicious, color: '#FF6D00', pct: Math.round((mockStats.suspicious / total) * 100) },
    { label: 'HIGH RISK', value: mockStats.highRisk, color: '#FF1744', pct: Math.round((mockStats.highRisk / total) * 100) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl border border-white/10 p-6"
      style={{ background: 'rgba(8,17,31,0.7)', backdropFilter: 'blur(30px)' }}
    >
      <h3 className="text-xs font-bold tracking-[0.2em] text-[#F8FAFC] uppercase mb-5">Payment Risk Intelligence</h3>

      {/* Visual bar chart */}
      <div className="flex gap-1.5 h-20 items-end mb-5">
        {data.map((d, i) => (
          <motion.div
            key={d.label}
            className="flex-1 rounded-t-md"
            style={{ backgroundColor: d.color, opacity: 0.8 }}
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
            title={`${d.label}: ${d.pct}%`}
            aria-label={`${d.label}: ${d.value} payments (${d.pct}%)`}
          />
        ))}
      </div>

      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] tracking-[0.1em] text-[#94A3B8] flex-1">{d.label}</span>
            <span className="text-xs font-medium text-[#F8FAFC]">{d.pct}%</span>
            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${d.pct}%` }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
