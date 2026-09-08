import { useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
}

export default function MagneticButton({
  children,
  onClick,
  disabled,
  loading,
  type = 'button',
  variant = 'primary',
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.25);
    y.set((e.clientY - centerY) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative w-full py-3.5 px-6 rounded-xl font-semibold text-sm tracking-[0.12em] uppercase
        transition-all duration-300 overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === 'primary'
          ? 'bg-gradient-to-r from-[#00C6FF] to-[#00F5D4] text-[#030712]'
          : 'border border-white/10 text-[#94A3B8] bg-white/5'}
      `}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#00C6FF]/30 to-[#00F5D4]/30 rounded-xl"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Scanning line on hover */}
      {hovered && variant === 'primary' && (
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-xl"
          initial={false}
        >
          <motion.div
            className="absolute top-0 left-0 right-0 h-[1px] bg-white/60"
            initial={{ y: -2 }}
            animate={{ y: 58 }}
            transition={{ duration: 0.6, ease: 'linear', repeat: Infinity }}
          />
        </motion.div>
      )}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <motion.span
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            AUTHENTICATING...
          </>
        ) : children}
      </span>
    </motion.button>
  );
}
