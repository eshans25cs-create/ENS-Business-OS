import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';
import { usePerformance } from '../hooks/usePerformance';
import RegisterForm from '../components/auth/RegisterForm';
import { Check, Mail, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AuthScene = lazy(() => import('../components/auth/AuthScene'));

export default function RegisterPage() {
  const mouse = useMousePosition();
  const perf = usePerformance();
  const { authStep } = useAuthStore();

  // Determine current step index for the stepper
  const currentStepNum = authStep === 'verify-otp' ? 2 : authStep === 'create-password' ? 3 : 1;

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

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN (5 cols): STEPPER & 3D ENVELOPE GRAPHIC         */}
        {/* ============================================================ */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-[#0D152D]/70 border border-[rgba(255,255,255,0.06)] rounded-3xl p-8 backdrop-blur-xl min-h-[480px]">
          
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight">Create Account</h2>
            <p className="text-xs text-[#7E8B9F] mt-1">Step {currentStepNum} of 4</p>

            {/* Stepper List */}
            <div className="space-y-4 mt-6">
              {[
                { step: 1, title: 'Account Details' },
                { step: 2, title: 'Verify Email' },
                { step: 3, title: 'Create Password' },
                { step: 4, title: 'Complete' },
              ].map((item) => {
                const isCompleted = item.step < currentStepNum;
                const isCurrent = item.step === currentStepNum;

                return (
                  <div key={item.step} className="flex items-center gap-3">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-[#00D26A] text-[#030B1A]'
                          : isCurrent
                            ? 'bg-[#1A6BFF] text-white shadow-[0_0_12px_rgba(26,107,255,0.6)]'
                            : 'bg-[rgba(255,255,255,0.06)] text-[#7E8B9F]'
                      }`}
                    >
                      {isCompleted ? <Check size={12} strokeWidth={3} /> : item.step}
                    </div>
                    <span 
                      className={`text-xs font-semibold ${
                        isCurrent ? 'text-[#FFFFFF]' : isCompleted ? 'text-[#00D26A]' : 'text-[#7E8B9F]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3D Glowing Neon Envelope & Shield Graphic */}
          <div className="relative flex flex-col items-center justify-center my-auto pt-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Radial glow */}
              <div className="absolute inset-0 rounded-full bg-[#1A6BFF]/20 blur-2xl pointer-events-none" />

              {/* Envelope card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="relative z-10 w-24 h-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] p-0.5 shadow-[0_0_25px_rgba(139,92,246,0.4)] flex items-center justify-center"
              >
                <div className="w-full h-full bg-[#0D152D]/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Mail size={32} className="text-[#A78BFA]" />
                </div>
              </motion.div>

              {/* Glowing Shield badge */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute -bottom-2 -right-2 z-20 w-10 h-10 rounded-xl bg-[#00D26A] flex items-center justify-center text-[#030B1A] shadow-[0_0_15px_rgba(0,210,106,0.6)]"
              >
                <ShieldCheck size={20} strokeWidth={2.5} />
              </motion.div>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN (7 cols): VERIFY EMAIL / FORM CARD             */}
        {/* ============================================================ */}
        <div className="lg:col-span-7">
          <div className="bg-[#0D152D]/95 border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
            <RegisterForm />
          </div>
        </div>

      </div>

    </div>
  );
}
