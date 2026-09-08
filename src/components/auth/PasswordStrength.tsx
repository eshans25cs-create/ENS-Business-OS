import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface Requirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

function analyzeStrength(password: string): {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  percentage: number;
  requirements: Requirement[];
} {
  const requirements: Requirement[] = [
    { label: 'Minimum 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special character (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = requirements.filter(r => r.met).length;
  const bonus = password.length >= 12 ? 0.5 : 0;

  const levels = [
    { label: '', color: '#6B7FA3', bgColor: 'rgba(107,127,163,0.2)', percentage: 0 },
    { label: 'WEAK', color: '#FF3B5C', bgColor: 'rgba(255,59,92,0.2)', percentage: 20 },
    { label: 'FAIR', color: '#FF8C42', bgColor: 'rgba(255,140,66,0.2)', percentage: 40 },
    { label: 'MEDIUM', color: '#FFD700', bgColor: 'rgba(255,215,0,0.2)', percentage: 60 },
    { label: 'STRONG', color: '#00C896', bgColor: 'rgba(0,200,150,0.2)', percentage: 80 },
    { label: 'VERY STRONG', color: '#0A84FF', bgColor: 'rgba(10,132,255,0.2)', percentage: 100 },
  ];

  const idx = Math.min(Math.floor(score + bonus), 5);
  return { score, requirements, ...levels[password.length === 0 ? 0 : idx] };
}

export default function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color, bgColor, percentage, requirements } = analyzeStrength(password);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 mt-3"
    >
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] text-[#6B7FA3] uppercase">Password Strength</span>
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] tracking-[0.15em] font-bold uppercase"
              style={{ color }}
            >
              {label}
            </motion.span>
          )}
        </div>

        {/* Bar track */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              background: percentage === 100
                ? 'linear-gradient(90deg, #0A84FF, #00C896)'
                : percentage >= 80
                ? '#00C896'
                : percentage >= 60
                ? '#FFD700'
                : percentage >= 40
                ? '#FF8C42'
                : '#FF3B5C',
              boxShadow: `0 0 8px ${color}60`,
            }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="space-y-1.5 p-3 rounded-xl" style={{ background: bgColor, border: `1px solid ${color}25` }}>
          {requirements.map((req, i) => (
            <motion.div
              key={req.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{
                  scale: req.met ? [1, 1.3, 1] : 1,
                  backgroundColor: req.met ? '#00C896' : 'rgba(107,127,163,0.3)',
                }}
                transition={{ duration: 0.3 }}
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              >
                {req.met ? (
                  <Check size={10} className="text-[#030B1A]" strokeWidth={3} />
                ) : (
                  <X size={10} className="text-[#6B7FA3]" strokeWidth={2} />
                )}
              </motion.div>
              <span
                className="text-xs transition-colors duration-200"
                style={{ color: req.met ? '#F0F4FF' : '#6B7FA3' }}
              >
                {req.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Strong password badge */}
      {score === 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-xs font-semibold"
          style={{ color: '#00C896' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
          SECURE PASSWORD
        </motion.div>
      )}
    </motion.div>
  );
}
