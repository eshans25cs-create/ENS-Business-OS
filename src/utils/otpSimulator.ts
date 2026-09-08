export interface OTPSession {
  email: string;
  otpHash: string;
  otp: string; // kept for display in dev mode
  expiresAt: number;
  attemptCount: number;
  verified: boolean;
  createdAt: number;
}

// In-memory store
const otpSessions = new Map<string, OTPSession>();

export const hashOTP = (otp: string): string => btoa(otp + '_ens_secret');

export const generateOTP = (email: string): { otp: string; session: OTPSession } => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const session: OTPSession = {
    email,
    otpHash: hashOTP(otp),
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attemptCount: 0,
    verified: false,
    createdAt: Date.now(),
  };
  otpSessions.set(email, session);
  return { otp, session };
};

export const verifyOTP = (email: string, otp: string): { success: boolean; error?: string } => {
  const session = otpSessions.get(email);
  if (!session) return { success: false, error: 'No OTP session found for this email' };
  
  if (Date.now() > session.expiresAt) return { success: false, error: 'OTP has expired' };
  if (session.attemptCount >= 5) return { success: false, error: 'Too many failed attempts' };
  if (session.verified) return { success: true };

  session.attemptCount += 1;
  
  if (hashOTP(otp) === session.otpHash) {
    session.verified = true;
    return { success: true };
  }
  
  return { success: false, error: 'Invalid OTP' };
};

export const isEmailVerified = (email: string): boolean => {
  const session = otpSessions.get(email);
  return !!session && session.verified && Date.now() <= session.expiresAt;
};

export const invalidateOTP = (email: string): void => {
  otpSessions.delete(email);
};
