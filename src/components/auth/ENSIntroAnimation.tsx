import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface ENSIntroAnimationProps {
  onComplete: () => void;
}

export default function ENSIntroAnimation({ onComplete }: ENSIntroAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing secure environment...');
  const [isDone, setIsDone] = useState(false);
  const hasCompletedRef = useRef(false);

  const handleFinish = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsDone(true);
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  useEffect(() => {
    // Smooth progress counter from 0 to 100 over ~2.4 seconds
    const duration = 2400;
    const startTime = performance.now();

    const animateProgress = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      // Smooth deceleration curve
      const easedProgress = Math.floor(rawProgress * 100);
      setProgress(easedProgress);

      if (easedProgress < 25) {
        setStatusText('Initializing secure merchant environment...');
      } else if (easedProgress < 55) {
        setStatusText('Loading UPI QR & transaction engine...');
      } else if (easedProgress < 85) {
        setStatusText('Connecting to ENS cloud gateway...');
      } else if (easedProgress < 100) {
        setStatusText('Finalizing security checks...');
      } else {
        setStatusText('System ready • Welcome to ENS');
      }

      if (rawProgress < 1) {
        requestAnimationFrame(animateProgress);
      } else {
        setTimeout(() => {
          handleFinish();
        }, 300);
      }
    };

    const animId = requestAnimationFrame(animateProgress);

    // Absolute failsafe so it never hangs
    const failsafe = setTimeout(() => {
      handleFinish();
    }, 3200);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      onClick={handleFinish}
      className="fixed inset-0 z-[9999] flex flex-col justify-between items-center bg-[#030B1A] overflow-hidden select-none cursor-pointer px-6 py-8"
      initial={{ opacity: 1 }}
      animate={{ opacity: isDone ? 0 : 1, scale: isDone ? 1.04 : 1 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {/* Background subtle cyber grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(10,132,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(10,132,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glowing radial light spots */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#0A84FF]/15 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#00D26A]/10 blur-[90px] pointer-events-none" />

      {/* Top Header Bar with Skip Button */}
      <div className="w-full max-w-md flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D26A] animate-pulse" />
          <span className="text-[10px] tracking-[0.2em] font-bold text-[#6B7FA3] uppercase">
            ENS v1.1.2
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="px-3 py-1 rounded-full text-[11px] font-bold text-[#3BA0FF] hover:text-[#FFFFFF] bg-[rgba(10,132,255,0.1)] hover:bg-[rgba(10,132,255,0.2)] border border-[rgba(10,132,255,0.3)] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <span>Skip</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 font-mono">Tap</span>
        </button>
      </div>

      {/* Central 3D Glowing Brand & Logo Emblem */}
      <div className="flex flex-col items-center justify-center my-auto z-20 text-center">
        
        {/* Animated 3D Logo Container */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
          {/* Outer Pulsing Glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-[#0A84FF]/25 blur-2xl pointer-events-none"
          />

          {/* Concentric Rotating Tech Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute w-full h-full rounded-full border border-[#0A84FF]/30 border-t-[#00D26A]/60 pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[86%] h-[86%] rounded-full border-2 border-dashed border-[#0A84FF]/25 pointer-events-none"
          />

          {/* Center 3D Logo Card */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', damping: 14 }}
            className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-br from-[#0A84FF] via-[#3BA0FF] to-[#00D26A] shadow-[0_0_45px_rgba(10,132,255,0.6)]"
          >
            <img
              src="/ens-logo.jpg"
              alt="ENS Logo"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </motion.div>
        </div>

        {/* Brand Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-1.5"
        >
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-[#FFFFFF] leading-none">
              ENS
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#0A84FF]/20 border border-[#0A84FF]/40 text-[#3BA0FF] text-[10px] font-black uppercase tracking-wider">
              PRO
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#0A84FF] uppercase">
            SMART TRANSACTION
          </p>
          <p className="text-[10px] tracking-[0.35em] text-[#7E8B9F] uppercase font-medium">
            BUSINESS OPERATING SYSTEM
          </p>
        </motion.div>

        {/* Complete Loading Bar & Progress Indicators */}
        <div className="w-64 sm:w-72 mt-8 space-y-2.5">
          {/* Progress Percent & Status Ticker */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#A0AEC0] text-[11px] truncate max-w-[200px] text-left">
              {statusText}
            </span>
            <span className="text-[#00D26A] font-mono font-bold text-xs">
              {progress}%
            </span>
          </div>

          {/* Neon Track & Fill Bar */}
          <div className="relative w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-0.5 overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] via-[#3BA0FF] to-[#00D26A] shadow-[0_0_12px_rgba(0,210,106,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            />
          </div>

          {/* Three dynamic status dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${progress >= 30 ? 'bg-[#0A84FF]' : 'bg-white/15'}`} />
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${progress >= 65 ? 'bg-[#3BA0FF]' : 'bg-white/15'}`} />
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${progress >= 95 ? 'bg-[#00D26A]' : 'bg-white/15'}`} />
          </div>
        </div>

      </div>

      {/* Bottom Footer Security Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md text-center z-20 space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] text-[10px] text-[#7E8B9F]">
          <ShieldCheck size={13} className="text-[#00D26A]" />
          <span>256-Bit Encrypted • Direct Bank Settlements</span>
        </div>
        <p className="text-[9px] text-[#4A5568] tracking-wider uppercase">
          Open Source Enterprise UPI Terminal
        </p>
      </motion.div>
    </motion.div>
  );
}
