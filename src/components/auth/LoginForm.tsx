import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, authStatus, authError } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');

  const inputClass = "w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] focus:border-[#1A6BFF] rounded-xl px-4 py-3 text-xs text-[#F0F4FF] placeholder-[#7E8B9F] outline-none transition-all";

  const handleSubmit = async () => {
    if (!identifier.trim() || !password.trim()) {
      setLocalError('Please enter your username/email and password.');
      return;
    }
    setLocalError('');
    const result = await login(identifier, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const isLoading = authStatus === 'loading';
  const displayError = localError || authError;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-[#FFFFFF] tracking-tight">Welcome Back!</h2>
        <p className="text-xs text-[#7E8B9F] mt-1">Login to your ENS account</p>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl text-xs text-[#FF3B5C] bg-[rgba(255,59,92,0.1)] border border-[#FF3B5C]/30"
          >
            {displayError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 text-left">
        {/* Username or Email */}
        <div>
          <label className="text-xs font-semibold text-[#A0AEC0] block mb-1.5">
            Username or Email
          </label>
          <input
            className={inputClass}
            placeholder="Enter your registered username or email"
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); setLocalError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-[#A0AEC0] block mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              className={`${inputClass} pr-10`}
              type={showPass ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLocalError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E8B9F] hover:text-[#FFFFFF] cursor-pointer"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#7E8B9F] hover:text-[#F0F4FF] transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#1A6BFF] rounded"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-xs text-[#1A6BFF] hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login CTA Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-[#1A6BFF] hover:bg-[#2563EB] text-white font-bold text-xs shadow-[0_0_20px_rgba(26,107,255,0.4)] transition-all cursor-pointer mt-2 disabled:opacity-50"
        >
          {isLoading ? 'Authenticating...' : 'Login'}
        </button>

        {/* Register Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-[#7E8B9F]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-[#1A6BFF] font-semibold hover:underline cursor-pointer"
            >
              Register now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
