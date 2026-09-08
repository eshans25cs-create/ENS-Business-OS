import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ExternalLink } from 'lucide-react';
import { openUserMailbox } from '../../utils/emailService';

interface OTPInputProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
  isLoading: boolean;
  error: string | null;
  devOTP?: string | null;
  previewUrl?: string | null;
  isRealSmtp?: boolean;
}

export default function OTPInput({
  email,
  onVerify,
  onResend,
  onChangeEmail,
  isLoading,
  error,
  devOTP,
  previewUrl,
  isRealSmtp,
}: OTPInputProps) {
  // Start with clean empty boxes waiting for the real email OTP
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const formatTime = (s: number) => 
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (digit && index === 5 && newDigits.every(d => d !== '')) {
      onVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      onVerify(pasted);
    }
  };

  const handleResendClick = async () => {
    setResendStatus('Resending OTP to your email...');
    await onResend();
    setCountdown(300);
    setCanResend(false);
    setResendStatus('New OTP code dispatched! Please check your inbox.');
    setTimeout(() => setResendStatus(null), 4000);
  };

  const handleAutoFillDev = () => {
    if (devOTP && devOTP.length === 6) {
      setDigits(devOTP.split(''));
    }
  };

  return (
    <div className="space-y-5 text-center max-w-sm mx-auto">
      {/* Header */}
      <div>
        <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] flex items-center justify-center mx-auto mb-3">
          <Mail size={22} />
        </div>
        <h3 className="text-xl font-bold text-[#FFFFFF] tracking-tight">Check Your Email</h3>
        <p className="text-xs text-[#7E8B9F] mt-1.5 leading-relaxed">
          We have sent a 6-digit verification code to <br />
          <span className="text-[#00D26A] font-mono font-bold text-xs">{email || 'your email'}</span>
        </p>
      </div>

      {/* Quick Mailbox Links */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => openUserMailbox(email)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(26,107,255,0.1)] hover:bg-[rgba(26,107,255,0.2)] border border-[#1A6BFF]/30 text-[#1A6BFF] text-xs font-semibold transition-all cursor-pointer"
        >
          <span>Open Email Inbox</span>
          <ExternalLink size={12} />
        </button>

        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D26A]/15 hover:bg-[#00D26A]/25 border border-[#00D26A]/35 text-[#00D26A] text-xs font-semibold transition-all"
          >
            <span>View Delivered Email ↗</span>
          </a>
        )}
      </div>

      {/* 6 Square Input Boxes */}
      <div className="flex items-center justify-center gap-2.5 my-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleInput(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            placeholder="-"
            className={`w-11 h-13 text-center text-xl font-black font-mono rounded-xl border outline-none transition-all ${
              digit
                ? 'border-[#00D26A] bg-[#00D26A]/10 text-white shadow-[0_0_12px_rgba(0,210,106,0.3)]'
                : 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] text-white focus:border-[#1A6BFF] focus:bg-[#1A6BFF]/10'
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#FF3B5C]">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Resend Status notification */}
      {resendStatus && (
        <div className="p-2 rounded-lg bg-[#00D26A]/10 border border-[#00D26A]/30 text-[11px] text-[#00D26A]">
          {resendStatus}
        </div>
      )}

      {/* Timer & Resend */}
      <div className="space-y-1">
        <p className="text-xs text-[#7E8B9F]">
          Code expires in <span className="font-mono text-[#FFFFFF] font-semibold">{formatTime(countdown)}</span>
        </p>
        <p className="text-xs text-[#7E8B9F]">
          Didn't receive the email?{' '}
          <button
            type="button"
            onClick={handleResendClick}
            disabled={!canResend && countdown > 240}
            className="text-[#1A6BFF] font-semibold hover:underline cursor-pointer disabled:opacity-50"
          >
            Resend OTP
          </button>
        </p>
      </div>

      {/* Dev / Testing Helper (Allows 1-click fill if offline) */}
      {devOTP && (
        <div className="py-2 px-3 rounded-xl bg-[rgba(234,179,8,0.08)] border border-[#EAB308]/25 text-[11px] text-[#EAB308] flex items-center justify-between">
          <span>Test OTP: <strong className="font-mono">{devOTP}</strong></span>
          <button
            type="button"
            onClick={handleAutoFillDev}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAB308]/20 hover:bg-[#EAB308]/30 cursor-pointer"
          >
            Fill Code
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={() => onVerify(digits.join(''))}
          disabled={isLoading || digits.some(d => !d)}
          className="w-full py-3 rounded-xl bg-[#1A6BFF] hover:bg-[#2563EB] text-white text-xs font-bold shadow-[0_0_20px_rgba(26,107,255,0.4)] transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Verifying OTP...' : 'Verify Email & Continue'}
        </button>

        <button
          type="button"
          onClick={onChangeEmail}
          className="w-full py-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[#7E8B9F] hover:text-[#FFFFFF] text-xs font-bold transition-all cursor-pointer"
        >
          Change Email Address
        </button>
      </div>
    </div>
  );
}
