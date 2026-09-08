import { useState, useEffect } from 'react';
import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useMousePosition } from '../hooks/useMousePosition';
import { usePerformance } from '../hooks/usePerformance';
import OTPInput from '../components/auth/OTPInput';
import PasswordStrength from '../components/auth/PasswordStrength';

const AuthScene = lazy(() => import('../components/auth/AuthScene'));

type FPStep = 'email' | 'otp' | 'reset' | 'done';

function FallbackBg() {
  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, #0A1628 0%, #030B1A 60%)' }} />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const mouse = useMousePosition();
  const perf = usePerformance();
  const { requestPasswordReset, resetPassword, lastOTP, authStatus } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<FPStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const inputBase = "w-full px-4 py-3 rounded-xl text-sm text-[#F0F4FF] placeholder-[#6B7FA3]/60 outline-none transition-all duration-200 bg-[rgba(10,20,48,0.8)] border border-[rgba(255,255,255,0.08)] focus:border-[#0A84FF] focus:shadow-[0_0_0_3px_rgba(10,132,255,0.12)]";

  const handleEmailSubmit = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await requestPasswordReset(email);
    setIsLoading(false);
    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error || 'Could not send verification OTP to this email');
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    const { verifyEmailOTP } = useAuthStore.getState();
    const result = await verifyEmailOTP(email, otp);
    setIsLoading(false);
    if (result.success) {
      setStep('reset');
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  const handleReset = async () => {
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    setError(null);
    const result = await resetPassword(email, '', password); // OTP already verified
    setIsLoading(false);
    if (result.success) {
      setStep('done');
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setError(result.error || 'Reset failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#030B1A] overflow-hidden">
      {perf !== 'low' ? (
        <div className="absolute inset-0">
          <Suspense fallback={<FallbackBg />}>
            <AuthScene mouseX={mouse.x} mouseY={mouse.y} performanceTier={perf} />
          </Suspense>
        </div>
      ) : <FallbackBg />}

      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[400px]"
        >
          {/* Back button */}
          <motion.button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors mb-6"
            whileHover={{ x: -3 }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </motion.button>

          <div className="relative">
            <div className="absolute -inset-px rounded-2xl opacity-60 blur-sm"
              style={{ background: 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(59,160,255,0.08))' }} />
            <div className="relative rounded-2xl border p-8"
              style={{
                background: 'rgba(6,15,32,0.9)',
                backdropFilter: 'blur(40px)',
                borderColor: 'rgba(255,255,255,0.08)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(10,132,255,0.5), transparent)' }} />

              {/* Progress */}
              <div className="flex items-center gap-2 mb-6">
                {['email', 'otp', 'reset', 'done'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        background: ['email', 'otp', 'reset', 'done'].indexOf(step) > i ? '#00C896' : s === step ? '#0A84FF' : 'rgba(255,255,255,0.1)',
                      }}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ color: ['email', 'otp', 'reset', 'done'].indexOf(step) >= i ? '#030B1A' : '#6B7FA3' }}
                    >
                      {['email', 'otp', 'reset', 'done'].indexOf(step) > i ? <Check size={10} strokeWidth={3} /> : i + 1}
                    </motion.div>
                    {i < 3 && <div className="flex-1 h-[1px] w-4" style={{ background: 'rgba(255,255,255,0.08)' }} />}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Email step */}
                {step === 'email' && (
                  <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div>
                      <h2 className="text-xl font-black text-[#F0F4FF]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>FORGOT PASSWORD</h2>
                      <p className="text-xs text-[#6B7FA3] mt-1">Enter your email to receive a reset code</p>
                    </div>

                    {error && <p className="text-sm text-[#FF3B5C] p-3 rounded-xl" style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)' }}>⚠ {error}</p>}

                    <div>
                      <label className="text-xs tracking-[0.15em] text-[#6B7FA3] uppercase mb-1.5 block">Email Address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" />
                        <input className={inputBase} style={{ paddingLeft: '2.5rem' }} type="email"
                          placeholder="your@email.com" value={email}
                          onChange={e => { setEmail(e.target.value); setError(null); }}
                          onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                        />
                      </div>
                    </div>

                    <motion.button onClick={handleEmailSubmit} disabled={isLoading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #0A84FF, #3BA0FF)', color: '#030B1A' }}>
                      {isLoading ? (
                        <motion.div className="w-4 h-4 border-2 border-[#030B1A]/30 border-t-[#030B1A] rounded-full"
                          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                      ) : (<>SEND RESET CODE <ArrowRight size={16} /></>)}
                    </motion.button>
                  </motion.div>
                )}

                {/* OTP step */}
                {step === 'otp' && (
                  <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <OTPInput
                      email={email}
                      onVerify={handleOTPVerify}
                      onResend={async () => { await requestPasswordReset(email); }}
                      onChangeEmail={() => setStep('email')}
                      isLoading={isLoading}
                      error={error}
                    />
                  </motion.div>
                )}

                {/* Reset step */}
                {step === 'reset' && (
                  <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div>
                      <h2 className="text-xl font-black text-[#F0F4FF]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NEW PASSWORD</h2>
                      <p className="text-xs text-[#6B7FA3] mt-1">Create a strong new password</p>
                    </div>

                    {error && <p className="text-sm text-[#FF3B5C] p-3 rounded-xl" style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)' }}>⚠ {error}</p>}

                    <div>
                      <label className="text-xs tracking-wider text-[#6B7FA3] uppercase mb-1.5 block">New Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" />
                        <input className={inputBase} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                          type={showPass ? 'text' : 'password'} placeholder="••••••••"
                          value={password} onChange={e => { setPassword(e.target.value); setError(null); }} />
                        <button onClick={() => setShowPass(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]">
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <PasswordStrength password={password} />
                    </div>

                    <div>
                      <label className="text-xs tracking-wider text-[#6B7FA3] uppercase mb-1.5 block">Confirm Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" />
                        <input className={inputBase} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                          type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                          value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button onClick={() => setShowConfirm(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]">
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {confirm && password !== confirm && <p className="text-xs text-[#FF3B5C] mt-1">⚠ Passwords do not match</p>}
                    </div>

                    <motion.button onClick={handleReset} disabled={isLoading || !password || password !== confirm}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2"
                      style={{
                        background: password && password === confirm ? 'linear-gradient(135deg, #0A84FF, #3BA0FF)' : 'rgba(255,255,255,0.05)',
                        color: password && password === confirm ? '#030B1A' : '#6B7FA3',
                      }}>
                      UPDATE PASSWORD
                    </motion.button>
                  </motion.div>
                )}

                {/* Done */}
                {step === 'done' && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto"
                      style={{ background: 'rgba(0,200,150,0.15)', border: '2px solid rgba(0,200,150,0.4)' }}>
                      <Check size={28} className="text-[#00C896]" />
                    </motion.div>
                    <h3 className="text-xl font-black text-[#F0F4FF]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>PASSWORD UPDATED</h3>
                    <p className="text-sm text-[#6B7FA3]">Redirecting to login...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
