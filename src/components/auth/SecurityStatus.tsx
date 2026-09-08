import { motion } from 'framer-motion';
import { CheckCircle2, Wifi, ShieldCheck } from 'lucide-react';

const items = [
  { icon: Wifi, label: 'Encrypted Connection' },
  { icon: ShieldCheck, label: 'Secure Authentication' },
  { icon: CheckCircle2, label: 'Privacy Protection' },
];

export default function SecurityStatus() {
  return (
    <motion.div
      className="mt-6 space-y-2"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.2, delayChildren: 0.5 } } }}
    >
      <p className="text-[10px] tracking-[0.2em] text-[#94A3B8] uppercase mb-3">AI Security Status</p>
      {items.map(({ icon: Icon, label }, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, x: -10 },
            visible: { opacity: 1, x: 0 },
          }}
          className="flex items-center gap-2 text-xs text-[#94A3B8]"
        >
          <Icon size={12} className="text-[#00F5D4]" />
          <span>{label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
