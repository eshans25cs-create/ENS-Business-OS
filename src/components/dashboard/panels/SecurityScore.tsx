import { motion } from 'framer-motion';
import { mockStats } from '../../../lib/mockData';

export default function SecurityScore() {
  const score = mockStats.securityScore;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-white/10 p-6 flex flex-col items-center"
      style={{ background: 'rgba(8,17,31,0.7)', backdropFilter: 'blur(30px)' }}
    >
      <h3 className="text-[10px] tracking-[0.2em] text-[#94A3B8] uppercase mb-5">Security Score</h3>

      {/* Circular gauge */}
      <div className="relative w-28 h-28 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
          <motion.circle
            cx="50" cy="50" r="40"
            stroke="url(#scoreGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00C6FF" />
              <stop offset="100%" stopColor="#00F5D4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#F8FAFC]">{score}</span>
        </div>
      </div>

      <p className="text-xs font-semibold tracking-[0.1em] text-[#00F5D4]">SECURITY AWARE</p>
      <p className="text-[10px] text-[#94A3B8] text-center mt-2 leading-relaxed max-w-[140px]">
        Reflects payment verification habits. Not a financial score.
      </p>
    </motion.div>
  );
}
