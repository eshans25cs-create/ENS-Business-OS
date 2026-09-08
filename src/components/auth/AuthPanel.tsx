import { motion } from 'framer-motion';

interface AuthPanelProps {
  mouseX?: number;
  mouseY?: number;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Generic ENS glass auth panel with 3D tilt effect.
 * Wraps any auth form content.
 */
export default function AuthPanel({ mouseX = 0, mouseY = 0, children, title, subtitle }: AuthPanelProps) {
  const rotateX = -mouseY * 5;
  const rotateY = mouseX * 5;

  return (
    <motion.div
      className="relative z-10 w-full max-w-[400px] mx-auto lg:mx-0 lg:ml-auto"
      style={{ perspective: 1200 }}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 120, damping: 30 }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-px rounded-2xl opacity-60 blur-sm"
        style={{ background: 'linear-gradient(135deg, rgba(10,132,255,0.25), rgba(59,160,255,0.1))' }}
      />

      {/* Glass panel */}
      <div
        className="relative rounded-2xl overflow-hidden border p-8"
        style={{
          background: 'rgba(6,15,32,0.88)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(10,132,255,0.5), transparent)' }}
        />

        {/* ENS badge */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/ens-logo.jpg"
            alt="ENS"
            className="w-8 h-8 rounded-xl object-cover"
            style={{ filter: 'drop-shadow(0 0 6px rgba(10,132,255,0.6))', border: '1px solid rgba(10,132,255,0.3)' }}
          />
          <div>
            <p className="text-xs font-bold tracking-[0.15em] text-[#F0F4FF]">ENS BUSINESS OS</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#00C896]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-[9px] tracking-[0.2em] text-[#6B7FA3]">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>

        {/* Optional title */}
        {title && (
          <div className="mb-5">
            <h2 className="text-xl font-black tracking-tight text-[#F0F4FF]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
            {subtitle && <p className="text-xs text-[#6B7FA3] mt-1">{subtitle}</p>}
          </div>
        )}

        {/* Content */}
        {children}

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(59,160,255,0.3), transparent)' }}
        />
      </div>
    </motion.div>
  );
}
