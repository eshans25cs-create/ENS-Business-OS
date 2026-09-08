import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateOTP, verifyOTP, isEmailVerified, invalidateOTP } from '../utils/otpSimulator';
import { sendOtpEmail, type SendEmailResult } from '../utils/emailService';
import { syncUserToPostgres } from '../utils/postgresService';
import { useBusinessStore } from './businessStore';

export type AuthStep = 'home' | 'login' | 'register' | 'verify-otp' | 'create-password' | 'forgot-password' | 'reset-password';
export type UserRole = 'ENS_ADMIN' | 'BUSINESS_ADMIN' | 'BRANCH_MANAGER' | 'CASHIER';
export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  passwordHash: string;
  role: UserRole;
  status: 'active' | 'suspended';
  businessId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
}

interface AuthStore {
  // State
  isAuthenticated: boolean;
  currentUser: User | null;
  authStep: AuthStep;
  authStatus: AuthStatus;
  authError: string | null;
  
  // Registration temp data
  registerData: RegisterData | null;
  pendingEmail: string | null;
  lastOTP: string | null; // For dev display
  lastEmailResult: SendEmailResult | null;
  
  // Users DB (localStorage simulation)
  users: User[];
  
  // Actions
  setAuthStep: (step: AuthStep) => void;
  setAuthStatus: (status: AuthStatus) => void;
  setAuthError: (error: string | null) => void;
  
  // Registration flow
  startRegistration: (data: RegisterData) => Promise<{ success: boolean; error?: string; otp?: string }>;
  verifyEmailOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resendOTP: (email: string) => Promise<{ success: boolean; otp?: string }>;
  createAccount: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  
  // Login
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Forgot password
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; otp?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Business link
  linkBusiness: (businessId: string) => void;
  
  // Check username/email availability
  isUsernameAvailable: (username: string) => boolean;
  isEmailAvailable: (email: string) => boolean;
}

export const DEFAULT_DEMO_USERS: User[] = [
  {
    id: 'user_demo_admin',
    fullName: 'Alex Vance (ENS Admin)',
    username: 'demo',
    email: 'demo@ens.com',
    emailVerified: true,
    passwordHash: btoa('Password@123_ens_hash'),
    role: 'BUSINESS_ADMIN',
    status: 'active',
    businessId: 'biz_demo_default',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'user_demo_cashier',
    fullName: 'Sam Miller (Cashier)',
    username: 'cashier',
    email: 'cashier@ens.com',
    emailVerified: true,
    passwordHash: btoa('Cashier@123_ens_hash'),
    role: 'CASHIER',
    status: 'active',
    businessId: 'biz_demo_default',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
];

export const useAuthStore = create<AuthStore>()(persist(
  (set, get) => ({
    isAuthenticated: false,
    currentUser: null,
    authStep: 'home',
    authStatus: 'idle',
    authError: null,
    registerData: null,
    pendingEmail: null,
    lastOTP: null,
    lastEmailResult: null,
    users: DEFAULT_DEMO_USERS,
    
    setAuthStep: (step) => set({ authStep: step }),
    setAuthStatus: (status) => set({ authStatus: status }),
    setAuthError: (error) => set({ authError: error }),
    
    isUsernameAvailable: (username) => {
      const { users } = get();
      return !users.some(u => u.username.toLowerCase() === username.toLowerCase());
    },
    
    isEmailAvailable: (email) => {
      const { users } = get();
      return !users.some(u => u.email.toLowerCase() === email.toLowerCase());
    },
    
    startRegistration: async (data) => {
      set({ authStatus: 'loading', authError: null });
      await new Promise(r => setTimeout(r, 600));
      
      // Check email availability
      if (!get().isEmailAvailable(data.email)) {
        set({ authStatus: 'error', authError: 'This email is already registered.' });
        return { success: false, error: 'This email is already registered.' };
      }
      
      if (!get().isUsernameAvailable(data.username)) {
        set({ authStatus: 'error', authError: 'Username already taken.' });
        return { success: false, error: 'Username already taken.' };
      }
      
      // Generate OTP
      const { otp } = generateOTP(data.email);
      
      // Dispatch real email to user's inbox
      const emailRes = await sendOtpEmail(data.email, otp, data.fullName);
      if (!emailRes.success) {
        set({ 
          authStatus: 'error', 
          authError: emailRes.error || 'Failed to dispatch verification code to your email. Please try again.',
          lastEmailResult: emailRes 
        });
        return { success: false, error: emailRes.error || 'Failed to send OTP to email' };
      }
      
      set({ 
        registerData: data, 
        pendingEmail: data.email, 
        lastOTP: otp,
        lastEmailResult: emailRes,
        authStatus: 'idle',
        authStep: 'verify-otp' 
      });
      
      return { success: true, otp };
    },
    
    verifyEmailOTP: async (email, otp) => {
      set({ authStatus: 'loading', authError: null });
      await new Promise(r => setTimeout(r, 800));
      
      const result = verifyOTP(email, otp);
      if (!result.success) {
        set({ authStatus: 'error', authError: result.error || 'Invalid OTP' });
        return { success: false, error: result.error };
      }
      
      set({ authStatus: 'success', authStep: 'create-password' });
      return { success: true };
    },
    
    resendOTP: async (email) => {
      set({ authStatus: 'loading' });
      await new Promise(r => setTimeout(r, 800));
      const { otp } = generateOTP(email);
      const fullName = get().registerData?.fullName;
      const emailRes = await sendOtpEmail(email, otp, fullName);
      set({ lastOTP: otp, lastEmailResult: emailRes, authStatus: 'idle' });
      return { success: true, otp };
    },
    
    createAccount: async (email, password) => {
      set({ authStatus: 'loading', authError: null });
      await new Promise(r => setTimeout(r, 1200));
      
      if (!isEmailVerified(email)) {
        set({ authStatus: 'error', authError: 'Email not verified.' });
        return { success: false, error: 'Email not verified.' };
      }
      
      const { registerData, users } = get();
      if (!registerData) {
        return { success: false, error: 'Registration data missing.' };
      }
      
      // Hash password (simulated with btoa for demo)
      const passwordHash = btoa(password + '_ens_hash');
      const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      
      const cleanName = registerData.fullName?.trim() || 'Merchant';
      const defaultShopName = `${cleanName.toUpperCase()} STORE`;
      const defaultMerchantName = cleanName;
      const slug = (registerData.username || 'merchant').toLowerCase().replace(/[^a-z0-9]/g, '') || 'merchant';
      const defaultUpi = `${slug}@upi`;

      // Create business automatically for newly registered user
      let newBusinessId = `biz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      try {
        const createdBiz = useBusinessStore.getState().createBusiness({
          ownerId: userId,
          name: defaultShopName,
          type: 'Smart Bazaar',
          address: 'Commercial Street, Main Market',
          phone: '+91 98000 00000',
          upiId: defaultUpi,
          merchantName: defaultMerchantName,
        });
        newBusinessId = createdBiz.id;
      } catch (e) {
        console.error('Failed to create initial business:', e);
      }

      const newUser: User = {
        id: userId,
        fullName: registerData.fullName,
        username: registerData.username,
        email: registerData.email,
        emailVerified: true,
        passwordHash,
        role: 'BUSINESS_ADMIN',
        status: 'active',
        businessId: newBusinessId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      invalidateOTP(email);
      
      // Sync user to PostgreSQL backend
      syncUserToPostgres(newUser);

      set({
        users: [...users, newUser],
        currentUser: newUser,
        isAuthenticated: true,
        authStatus: 'success',
        registerData: null,
        pendingEmail: null,
        lastOTP: null,
      });
      
      return { success: true };
    },
    
    login: async (identifier, password) => {
      set({ authStatus: 'loading', authError: null });
      await new Promise(r => setTimeout(r, 1000));
      
      const { users } = get();
      const allUsers = [...DEFAULT_DEMO_USERS, ...users.filter(u => !DEFAULT_DEMO_USERS.some(d => d.id === u.id))];
      const user = allUsers.find(u => 
        u.email.toLowerCase() === identifier.toLowerCase() || 
        u.username.toLowerCase() === identifier.toLowerCase()
      );
      
      if (!user) {
        set({ authStatus: 'error', authError: 'Invalid username or password.' });
        await new Promise(r => setTimeout(r, 2000));
        set({ authStatus: 'idle' });
        return { success: false, error: 'Invalid username or password.' };
      }
      
      const passwordHash = btoa(password + '_ens_hash');
      if (user.passwordHash !== passwordHash) {
        set({ authStatus: 'error', authError: 'Invalid username or password.' });
        await new Promise(r => setTimeout(r, 2000));
        set({ authStatus: 'idle' });
        return { success: false, error: 'Invalid username or password.' };
      }
      
      if (user.status === 'suspended') {
        set({ authStatus: 'error', authError: 'Account suspended. Contact support.' });
        return { success: false, error: 'Account suspended.' };
      }
      
      // Ensure the logged in user's dedicated business is activated in businessStore
      try {
        const bizStore = useBusinessStore.getState();
        const userBiz = bizStore.businesses.find(b => b.ownerId === user.id);
        if (userBiz) {
          bizStore.setCurrentBusiness(userBiz.id);
        } else if (user.businessId) {
          bizStore.setCurrentBusiness(user.businessId);
        }
      } catch (e) {
        console.error('Failed to sync business on login:', e);
      }

      set({ 
        currentUser: user, 
        isAuthenticated: true, 
        authStatus: 'success',
      });
      
      return { success: true };
    },
    
    logout: () => set({ 
      isAuthenticated: false, 
      currentUser: null, 
      authStep: 'home',
      authStatus: 'idle',
      authError: null,
    }),
    
    requestPasswordReset: async (email) => {
      set({ authStatus: 'loading', authError: null });
      await new Promise(r => setTimeout(r, 600));
      
      const { users } = get();
      const allUsers = [...DEFAULT_DEMO_USERS, ...users.filter(u => !DEFAULT_DEMO_USERS.some(d => d.id === u.id))];
      const normalizedEmail = email.trim().toLowerCase();
      const user = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      
      if (!user) {
        set({ 
          authStatus: 'error', 
          authError: 'No registered account found with this email. Please check your email or register.' 
        });
        return { 
          success: false, 
          error: 'No registered account found with this email. Please check your email or register.' 
        };
      }
      
      // Generate real 6-digit OTP
      const { otp } = generateOTP(normalizedEmail);
      
      // Dispatch real email to user's registered inbox
      const emailRes = await sendOtpEmail(normalizedEmail, otp, user.fullName, 'password_reset');
      if (!emailRes.success) {
        set({
          authStatus: 'error',
          authError: emailRes.error || 'Failed to dispatch password reset code. Please check your network and try again.',
          lastEmailResult: emailRes
        });
        return { success: false, error: emailRes.error || 'Failed to send reset code' };
      }
      
      set({ 
        pendingEmail: normalizedEmail, 
        lastOTP: otp, 
        lastEmailResult: emailRes,
        authStatus: 'idle', 
        authStep: 'verify-otp' 
      });
      return { success: true, otp };
    },
    
    resetPassword: async (email, otp, newPassword) => {
      set({ authStatus: 'loading', authError: null });
      await new Promise(r => setTimeout(r, 800));
      
      const normalizedEmail = email.trim().toLowerCase();
      
      // Verify OTP if not already verified
      if (!isEmailVerified(normalizedEmail)) {
        const result = verifyOTP(normalizedEmail, otp);
        if (!result.success) {
          set({ authStatus: 'error', authError: result.error || 'Invalid OTP' });
          return { success: false, error: result.error || 'Invalid OTP' };
        }
      }
      
      const passwordHash = btoa(newPassword + '_ens_hash');
      const { users } = get();
      const allUsers = [...DEFAULT_DEMO_USERS, ...users.filter(u => !DEFAULT_DEMO_USERS.some(d => d.id === u.id))];
      const updatedUsers = allUsers.map(u => 
        u.email.toLowerCase() === normalizedEmail 
          ? { ...u, passwordHash, updatedAt: Date.now() }
          : u
      );
      
      invalidateOTP(normalizedEmail);
      set({ users: updatedUsers, authStatus: 'success', pendingEmail: null, lastOTP: null });
      return { success: true };
    },
    
    linkBusiness: (businessId) => {
      const { currentUser, users } = get();
      if (!currentUser) return;
      const updated = { ...currentUser, businessId, updatedAt: Date.now() };
      set({
        currentUser: updated,
        users: users.map(u => u.id === currentUser.id ? updated : u),
      });
    },
  }),
  { name: 'ens-auth', version: 1 }
));
