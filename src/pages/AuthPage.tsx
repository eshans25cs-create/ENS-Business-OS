import { useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useMousePosition } from '../hooks/useMousePosition';
import { usePerformance } from '../hooks/usePerformance';
import { useAuthStore } from '../store/authStore';

const AuthScene = lazy(() => import('../components/auth/AuthScene'));

function FallbackBg() {
  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 40% 50%, #0A1628 0%, #030B1A 60%)' }} />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(10,132,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(10,132,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
}

const FLOATING_ITEMS = [
  { icon: '🏢', label: 'BUSINESS', delay: 0, orbit: { x: -180, y: -80 } },
  { icon: '💳', label: 'PAYMENT', delay: 0.5, orbit: { x: 180, y: -60 } },
  { icon: '📊', label: 'ANALYTICS', delay: 1.0, orbit: { x: -160, y: 100 } },
  { icon: '🛡️', label: 'SECURITY', delay: 1.5, orbit: { x: 160, y: 110 } },
  { icon: '🤖', label: 'AI', delay: 2.0, orbit: { x: 0, y: -160 } },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const mouse = useMousePosition();
  const perf = usePerformance();
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleQuickDemo = async () => {
    await login('demo@ens.com', 'Password@123');
    navigate('/dashboard', { replace: true });
  };

  const isMobile = Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.innerWidth < 768);

  return (
    <div className="fixed inset-0 bg-[#030B1A] overflow-hidden">
      {/* 3D Background - desktop only to prevent mobile WebGL stalls */}
      {!isMobile && perf !== 'low' ? (
        <div className="absolute inset-0">
          <Suspense fallback={<FallbackBg />}>
            <AuthScene mouseX={mouse.x} mouseY={mouse.y} performanceTier={perf} />
          </Suspense>
        </div>
      ) : <FallbackBg />}

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(3,11,26,0.2) 0%, rgba(3,11,26,0.0) 40%, rgba(3,11,26,0.7) 100%)' }}
      />

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center px-6 lg:px-16">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: 3D ENS Logo + floating items */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex flex-col items-center justify-center relative h-96"
            >
              {/* Central ENS Logo - real image with 3D effects */}
              <motion.div
                className="relative z-10 flex flex-col items-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 40px 15px rgba(10,132,255,0.25)',
                      '0 0 70px 25px rgba(10,132,255,0.45)',
                      '0 0 40px 15px rgba(10,132,255,0.25)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  style={{ width: '120%', height: '120%', top: '-10%', left: '-10%' }}
                />

                {/* Rotating gear hint */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute pointer-events-none"
                  style={{
                    width: '112%', height: '112%', top: '-6%', left: '-6%',
                    borderRadius: '50%',
                    border: '2px dashed rgba(10,132,255,0.25)',
                  }}
                />

                {/* Gold orbit ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute pointer-events-none"
                  style={{
                    width: '130%', height: '130%', top: '-15%', left: '-15%',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,215,0,0.35)',
                    transform: 'rotateX(60deg)',
                  }}
                />

                {/* Mouse parallax wrapper */}
                <motion.div
                  animate={{
                    rotateY: mouse.x * 10,
                    rotateX: -mouse.y * 6,
                  }}
                  transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
                >
                  <img
                    src="/ens-logo.jpg"
                    alt="ENS Business OS"
                    style={{
                      width: 'clamp(180px, 18vw, 240px)',
                      height: 'clamp(180px, 18vw, 240px)',
                      objectFit: 'contain',
                      borderRadius: '50%',
                      filter: 'drop-shadow(0 0 24px rgba(10,132,255,0.7)) brightness(1.05)',
                    }}
                  />
                </motion.div>

                {/* Tagline below logo */}
                <motion.p
                  className="mt-4 text-xs tracking-[0.4em] uppercase"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  style={{ color: '#6B7FA3' }}
                >
                  CONNECT · PAY · GROW
                </motion.p>
              </motion.div>

              {/* Floating business icons */}
              {FLOATING_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="absolute flex flex-col items-center gap-1 pointer-events-none"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: item.orbit.x + mouse.x * 15,
                    y: item.orbit.y + mouse.y * 10,
                  }}
                  transition={{
                    opacity: { delay: item.delay + 0.5, duration: 0.5 },
                    scale: { delay: item.delay + 0.5, duration: 0.5, type: 'spring' },
                    x: { type: 'spring', stiffness: 50, damping: 20 },
                    y: { type: 'spring', stiffness: 50, damping: 20 },
                  }}
                  style={{ left: '50%', top: '50%', translateX: '-50%', translateY: '-50%' }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{
                      background: 'rgba(10,20,48,0.85)',
                      border: '1px solid rgba(10,132,255,0.3)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(10px)',
                    }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-[8px] tracking-[0.15em] text-[#6B7FA3]/60">{item.label}</span>
                </motion.div>
              ))}

              {/* Particle lines connecting items */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
                {FLOATING_ITEMS.map((item, i) => (
                  <motion.line
                    key={i}
                    x1="50%" y1="50%"
                    x2={`calc(50% + ${item.orbit.x}px)`}
                    y2={`calc(50% + ${item.orbit.y}px)`}
                    stroke="#0A84FF"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: item.delay + 0.8, duration: 0.6 }}
                  />
                ))}
              </svg>
            </motion.div>

            {/* Right: Auth card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ perspective: 1200 }}
            >
              <motion.div
                animate={{
                  rotateX: -mouse.y * 4,
                  rotateY: mouse.x * 4,
                }}
                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                className="w-full max-w-[400px] mx-auto lg:mx-0 lg:ml-auto"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute -inset-px rounded-2xl opacity-60 blur-sm"
                  style={{ background: 'linear-gradient(135deg, rgba(10,132,255,0.3), rgba(59,160,255,0.1))' }} />

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
                  <div className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(10,132,255,0.5), transparent)' }} />

                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.h1
                      className="text-4xl font-black tracking-[-0.02em]"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #0A84FF 60%, #3BA0FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      ENS
                    </motion.h1>
                    <p className="text-xs tracking-[0.3em] text-[#6B7FA3] uppercase mt-1">Business OS</p>
                    <div className="w-12 h-[1px] mx-auto mt-3"
                      style={{ background: 'linear-gradient(90deg, transparent, #0A84FF, transparent)' }} />
                    <p className="text-sm text-[#F0F4FF]/70 mt-3">Welcome to the future of business</p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => navigate('/login')}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm tracking-[0.15em] uppercase transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #0A84FF, #3BA0FF)',
                        color: '#030B1A',
                        boxShadow: '0 8px 24px rgba(10,132,255,0.3)',
                      }}
                    >
                      LOGIN
                    </motion.button>

                    <motion.button
                      onClick={() => navigate('/register')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm tracking-[0.15em] uppercase transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#F0F4FF',
                      }}
                    >
                      REGISTER
                    </motion.button>

                    <motion.button
                      onClick={handleQuickDemo}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 rounded-xl font-semibold text-xs tracking-[0.1em] text-[#00D26A] bg-[rgba(0,210,106,0.1)] border border-[#00D26A]/30 hover:bg-[rgba(0,210,106,0.2)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      ⚡ Instant Demo Mode (Admin)
                    </motion.button>
                  </div>

                  {/* Tagline */}
                  <div className="text-center mt-6">
                    <p className="text-[10px] tracking-[0.2em] text-[#6B7FA3]/60 uppercase">
                      Secure · Fast · Intelligent
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(59,160,255,0.3), transparent)' }} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
