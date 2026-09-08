import { Suspense, lazy, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';
import { usePerformance } from '../hooks/usePerformance';
import LoginForm from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Coins, BarChart3, ShieldCheck, Database } from 'lucide-react';


export default function LoginPage() {
  const mouse = useMousePosition();
  const perf = usePerformance();
  const { authStatus, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="fixed inset-0 bg-[#070D1E] overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-8">
      
      {/* Background Subtle Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Container - Split Screen Replica */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN (7 cols): 3D PEDESTAL WITH FLOATING ICONS        */}
        {/* ============================================================ */}
        <div className="hidden lg:flex lg:col-span-7 flex-col items-center justify-center relative min-h-[480px]">
          
          {/* Top-Left Branding */}
          <div className="absolute top-0 left-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A84FF] to-[#3BA0FF] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(10,132,255,0.5)]">
              <img src="/ens-logo.jpg" alt="ENS" className="w-full h-full object-cover rounded-md" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-[#FFFFFF] leading-none">ENS</h1>
              <p className="text-[8px] font-bold tracking-widest text-[#0A84FF] uppercase mt-0.5">SMART TRANSACTION</p>
            </div>
          </div>

          {/* Central 3D Pedestal & Glowing Rings */}
          <div className="relative w-80 h-80 flex items-center justify-center mt-6">
            
            {/* Ambient Radial Glow */}
            <div className="absolute inset-0 rounded-full bg-[#1A6BFF]/10 blur-3xl pointer-events-none" />

            {/* Concentric Neon Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute w-72 h-72 rounded-full border border-[#1A6BFF]/20 pointer-events-none"
              style={{ transform: 'rotateX(60deg)' }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute w-56 h-56 rounded-full border-2 border-dashed border-[#00D26A]/30 pointer-events-none"
              style={{ transform: 'rotateX(60deg)' }}
            />
            <div 
              className="absolute w-44 h-44 rounded-full border-2 border-[#1A6BFF]/50 shadow-[0_0_30px_rgba(26,107,255,0.4)] pointer-events-none"
              style={{ transform: 'rotateX(60deg)' }}
            />

            {/* Glowing 3D Pedestal Base */}
            <div 
              className="absolute bottom-4 w-60 h-20 rounded-full bg-gradient-to-t from-[#0D1836] to-[rgba(26,107,255,0.3)] border border-[#1A6BFF]/40 shadow-[0_0_40px_rgba(26,107,255,0.35)] pointer-events-none"
              style={{ transform: 'rotateX(65deg)' }}
            />

            {/* Central Glowing 3D Logo / Cube */}
            <motion.div
              animate={{ 
                y: [0, -12, 0],
                rotateY: [0, 10, -10, 0]
              }}
              transition={{ 
                y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                rotateY: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
              }}
              className="relative z-10 flex items-center justify-center"
            >
              <div className="w-28 h-28 rounded-2xl p-1 bg-gradient-to-br from-[#0A84FF] via-[#3BA0FF] to-[#00D26A] shadow-[0_0_50px_rgba(10,132,255,0.6)]">
                <img 
                  src="/ens-logo.jpg" 
                  alt="ENS 3D" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </motion.div>

            {/* Orbiting 3D Floating Feature Icons */}
            {/* 1. Shopping Cart (Top Left) */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              className="absolute top-6 left-6 w-11 h-11 rounded-xl bg-[#0D152D] border border-[#1A6BFF]/40 shadow-[0_0_15px_rgba(26,107,255,0.3)] flex items-center justify-center text-[#3BA0FF]"
            >
              <ShoppingCart size={18} />
            </motion.div>

            {/* 2. Coin (Top Right) */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.4 }}
              className="absolute top-10 right-6 w-11 h-11 rounded-xl bg-[#0D152D] border border-[#EAB308]/40 shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center text-[#EAB308]"
            >
              <Coins size={18} />
            </motion.div>

            {/* 3. Bar Chart (Bottom Right) */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.8 }}
              className="absolute bottom-12 right-2 w-11 h-11 rounded-xl bg-[#0D152D] border border-[#00D26A]/40 shadow-[0_0_15px_rgba(0,210,106,0.3)] flex items-center justify-center text-[#00D26A]"
            >
              <BarChart3 size={18} />
            </motion.div>

            {/* 4. Shield (Bottom Left) */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.1, ease: 'easeInOut', delay: 1.2 }}
              className="absolute bottom-10 left-4 w-11 h-11 rounded-xl bg-[#0D152D] border border-[#A78BFA]/40 shadow-[0_0_15px_rgba(167,139,250,0.3)] flex items-center justify-center text-[#A78BFA]"
            >
              <ShieldCheck size={18} />
            </motion.div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN (5 cols): WELCOME BACK LOGIN CARD               */}
        {/* ============================================================ */}
        <div className="w-full max-w-md mx-auto lg:col-span-5">
          {/* Mobile Header Branding (visible on small/medium screens) */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#3BA0FF] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(10,132,255,0.6)]">
              <img src="/ens-logo.jpg" alt="ENS" className="w-full h-full object-cover rounded-[10px]" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-black tracking-wider text-[#FFFFFF] leading-none">ENS</h1>
              <p className="text-[9px] font-bold tracking-widest text-[#0A84FF] uppercase mt-0.5">SMART TRANSACTION</p>
            </div>
          </div>

          <div className="bg-[#0D152D]/95 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <LoginForm />
          </div>
        </div>

      </div>

    </div>
  );
}
