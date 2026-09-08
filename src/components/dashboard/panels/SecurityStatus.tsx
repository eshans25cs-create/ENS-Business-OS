import { motion } from 'framer-motion';
import { mockStats } from '../../../lib/mockData';

interface StatNodeProps {
  label: string;
  value: string | number;
  color: string;
  delay: number;
}

function StatNode({ label, value, color, delay }: StatNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring' }}
      className="text-center p-4 rounded-2xl border border-white/8 hover:border-white/15 transition-colors cursor-default"
      style={{ background: 'rgba(8,17,31,0.6)', backdropFilter: 'blur(20px)' }}
    >
      <div className="text-2xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] tracking-[0.15em] text-[#94A3B8] uppercase leading-tight">
        {label}
      </div>
    </motion.div>
  );
}

export default function SecurityStatus() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatNode label="Analyzed" value={mockStats.paymentsAnalyzed} color="#F8FAFC" delay={0.1} />
      <StatNode label="Safe" value={mockStats.safePayments} color="#00E676" delay={0.15} />
      <StatNode label="Verify" value={mockStats.verifyRequired} color="#FFD600" delay={0.2} />
      <StatNode label="Suspicious" value={mockStats.suspicious} color="#FF6D00" delay={0.25} />
      <StatNode label="AI Confidence" value={`${mockStats.aiConfidence}%`} color="#00F5D4" delay={0.3} />
    </div>
  );
}
