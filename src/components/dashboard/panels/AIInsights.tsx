import { motion } from 'framer-motion';
import { mockInsights } from '../../../lib/mockData';
import { Brain, Shield, AlertTriangle } from 'lucide-react';

const ICONS = {
  brain: Brain,
  shield: Shield,
  'alert-triangle': AlertTriangle,
};

export default function AIInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="rounded-2xl border border-white/10 p-6"
      style={{ background: 'rgba(8,17,31,0.7)', backdropFilter: 'blur(30px)' }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Brain size={14} className="text-[#00F5D4]" />
        <h3 className="text-xs font-bold tracking-[0.2em] text-[#F8FAFC] uppercase">What the AI Has Learned</h3>
      </div>

      <div className="space-y-3">
        {mockInsights.map((insight, i) => {
          const Icon = ICONS[insight.icon as keyof typeof ICONS] || Brain;
          const colors = ['text-[#00F5D4]', 'text-[#00C6FF]', 'text-[#FFD600]'];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <Icon size={14} className={`${colors[i]} mt-0.5 shrink-0`} />
              <div>
                <p className={`text-[10px] font-semibold tracking-[0.1em] ${colors[i]} mb-1`}>{insight.title.toUpperCase()}</p>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{insight.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
