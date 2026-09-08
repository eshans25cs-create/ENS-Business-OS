import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, Mail, AtSign, ArrowRight, Building2 } from 'lucide-react';
import PasswordStrength from './PasswordStrength';
import OTPInput from './OTPInput';
import BusinessSetupForm from './BusinessSetupForm';

// Simulated auth store actions (will be replaced by actual store)
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

type RegStep = 'details' | 'otp' | 'password' | 'business' | 'done';

export default function RegisterForm() {
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const [step, setStep] = useState<RegStep>('details');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const inputBase = "w-full px-4 py-3 rounded-xl text-sm text-[#F0F4FF] placeholder-[#6B7FA3]/60 outline-none transition-all duration-200 bg-[rgba(10,20,48,0.8)] border border-[rgba(255,255,255,0.08)] focus:border-[#0A84FF] focus:shadow-[0_0_0_3px_rgba(10,132,255,0.12)]";

  const validateDetails = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = 'Enter your full name (min 2 characters)';
    if (!username.trim() || username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) errs.username = 'Only letters, numbers, and underscores allowed';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) errs.password = 'Password needs an uppercase letter';
    if (!/[0-9]/.test(password)) errs.password = 'Password needs a number';
    if (!/[^A-Za-z0-9]/.test(password)) errs.password = 'Password needs a special character';
    if (password !== confirmPassword) errs.confirm = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDetailsSubmit = async () => {
    if (!validateDetails()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await authStore.startRegistration({ fullName, username, email });
      if (!result.success) {
        setError(result.error || 'Failed to start registration');
      } else {
        setStep('otp');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authStore.verifyEmailOTP(email, otp);
      if (!result.success) {
        setError(result.error || 'Invalid OTP');
      } else {
        setStep('password');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPResend = async () => {
    await authStore.resendOTP(email);
  };

  const handlePasswordSubmit = async () => {
    if (!validatePassword()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await authStore.createAccount(email, password);
      if (!result.success) {
        setError(result.error || 'Account creation failed');
      } else {
        setStep('business');
      }
    } catch {
      setError('Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessComplete = async (businessData: {
    name: string; type: string; address: string; phone: string; upiId: string; merchantName: string;
  }) => {
    // Save business to businessStore (will be fully wired when store is ready)
    // For now navigate to dashboard
    setStep('done');
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const stepTitles: Record<RegStep, string> = {
    details: 'CREATE ACCOUNT',
    otp: 'VERIFY EMAIL',
    password: 'CREATE PASSWORD',
    business: 'SETUP BUSINESS',
    done: 'ALL SET!',
  };

  return (
    <div>
      {/* Step title */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-xl font-black tracking-tight text-[#F0F4FF] mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {stepTitles[step]}
        </motion.h2>
      </AnimatePresence>

      {/* Global error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-3 rounded-xl text-sm text-[#FF3B5C]"
            style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.25)' }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step content */}
      <div className="mt-5">
        <AnimatePresence mode="wait">

          {/* STEP 1: Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Full Name */}
              <div>
                <label className="text-xs tracking-[0.15em] text-[#6B7FA3] uppercase mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" />
                  <input
                    className={inputBase}
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Your full name"
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setFieldErrors(p => ({ ...p, fullName: '' })); }}
                  />
                </div>
                {fieldErrors.fullName && <p className="text-xs text-[#FF3B5C] mt-1">{fieldErrors.fullName}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="text-xs tracking-[0.15em] text-[#6B7FA3] uppercase mb-1.5 block">Username</label>
                <div className="relative">
                  <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" />
                  <input
                    className={inputBase}
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="your_username"
                    value={username}
                    onChange={e => { setUsername(e.target.value.toLowerCase()); setFieldErrors(p => ({ ...p, username: '' })); }}
                  />
                </div>
                {fieldErrors.username && <p className="text-xs text-[#FF3B5C] mt-1">{fieldErrors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs tracking-[0.15em] text-[#6B7FA3] uppercase mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" />
                  <input
                    className={inputBase}
                    style={{ paddingLeft: '2.5rem' }}
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs text-[#FF3B5C] mt-1">{fieldErrors.email}</p>}
              </div>

              <motion.button
                onClick={handleDetailsSubmit}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-[0.12em] uppercase mt-2 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #0A84FF, #3BA0FF)', color: '#030B1A' }}
              >
                {isLoading ? (
                  <motion.div className="w-4 h-4 border-2 border-[#030B1A]/30 border-t-[#030B1A] rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                ) : (<>CONTINUE <ArrowRight size={16} /></>)}
              </motion.button>

              <p className="text-center text-xs text-[#6B7FA3] mt-3">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-[#0A84FF] hover:text-[#3BA0FF] font-semibold transition-colors">
                  LOGIN
                </button>
              </p>
            </motion.div>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OTPInput
                email={email}
                onVerify={handleOTPVerify}
                onResend={handleOTPResend}
                onChangeEmail={() => { setStep('details'); setError(null); }}
                isLoading={isLoading}
                error={error || (authStore.lastEmailResult?.success === false ? (authStore.lastEmailResult?.error ?? null) : null)}
                devOTP={authStore.lastOTP}
                previewUrl={authStore.lastEmailResult?.previewUrl}
                isRealSmtp={authStore.lastEmailResult?.isRealSmtp}
              />
            </motion.div>
          )}

          {/* STEP 3: Password */}
          {step === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2"
                  style={{ background: 'rgba(10,132,255,0.12)', border: '1px solid rgba(10,132,255,0.25)' }}>
                  <Lock size={20} className="text-[#0A84FF]" />
                </div>
                <p className="text-sm text-[#6B7FA3]">Create a secure password for your account</p>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs tracking-[0.15em] text-[#6B7FA3] uppercase mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" />
                  <input
                    className={inputBase}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                  />
                  <button onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-[#FF3B5C] mt-1">{fieldErrors.password}</p>}
                <PasswordStrength password={password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs tracking-[0.15em] text-[#6B7FA3] uppercase mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" />
                  <input
                    className={inputBase}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirm: '' })); }}
                  />
                  <button onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <AnimatePresence>
                  {confirmPassword && password !== confirmPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs text-[#FF3B5C] mt-1">⚠ Passwords do not match</motion.p>
                  )}
                  {confirmPassword && password === confirmPassword && password.length >= 8 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs text-[#00C896] mt-1">✓ Passwords match</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={handlePasswordSubmit}
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-[0.12em] uppercase mt-2 flex items-center justify-center gap-2 transition-all"
                style={{
                  background: password && confirmPassword && password === confirmPassword && password.length >= 8
                    ? 'linear-gradient(135deg, #0A84FF, #3BA0FF)'
                    : 'rgba(255,255,255,0.05)',
                  color: password && confirmPassword && password === confirmPassword ? '#030B1A' : '#6B7FA3',
                  cursor: password && confirmPassword && password === confirmPassword ? 'pointer' : 'not-allowed',
                }}
              >
                {isLoading ? (
                  <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                ) : (<><Building2 size={16} />CREATE ACCOUNT</>)}
              </motion.button>
            </motion.div>
          )}

          {/* STEP 4: Business */}
          {step === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BusinessSetupForm
                onComplete={handleBusinessComplete}
                userName={authStore.currentUser?.fullName || fullName}
                userId={authStore.currentUser?.id}
                userEmail={authStore.currentUser?.email || email}
              />
            </motion.div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <motion.div
                className="text-5xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🏢
              </motion.div>
              <h3 className="text-xl font-black text-[#F0F4FF]">WELCOME TO ENS</h3>
              <p className="text-sm text-[#6B7FA3]">Loading your Business OS...</p>
              <motion.div
                className="w-8 h-8 border-2 border-[#0A84FF]/30 border-t-[#0A84FF] rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
