import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildUpiUri } from '../utils/upiUri';
import { checkAmountAnomaly, checkDuplicateRequest } from '../utils/aiChecks';
import { syncPaymentSessionToPostgres } from '../utils/postgresService';

export type PaymentSessionStatus = 
  | 'ACTIVE' 
  | 'PAYMENT_PENDING' 
  | 'PAYMENT_CONFIRMED' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'FAILED';

export interface PaymentSession {
  id: string;
  businessId: string;
  cashierId: string;
  amount: number;
  upiId: string;
  merchantName: string;
  upiUri: string;
  currency: 'INR';
  status: PaymentSessionStatus;
  createdAt: number;
  expiresAt: number;
  confirmedAt?: number;
  transactionRef?: string;
  aiWarning?: string;
  note?: string;
}

interface PaymentStore {
  sessions: PaymentSession[];
  currentSession: PaymentSession | null;
  
  createSession: (params: {
    businessId: string;
    cashierId: string;
    amount: number;
    upiId: string;
    merchantName: string;
    note?: string;
    billId?: string;
  }) => { session: PaymentSession; aiWarning?: string };
  
  cancelSession: (id: string) => void;
  expireSession: (id: string) => void;
  confirmPayment: (id: string, transactionRef?: string) => void;
  markPending: (id: string) => void;
  setCurrentSession: (session: PaymentSession | null) => void;
  clearHistory: () => void;
  getRecentSessions: (businessId: string, limit?: number) => PaymentSession[];
}

const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const usePaymentStore = create<PaymentStore>()(persist(
  (set, get) => ({
    sessions: [],
    currentSession: null,
    
    createSession: ({ businessId, cashierId, amount, upiId, merchantName, note }) => {
      const { sessions } = get();
      const recentSessions = sessions.filter(s => s.businessId === businessId);
      const recentAmounts = recentSessions.slice(0, 20).map(s => s.amount);
      const recentPayments = recentSessions.slice(0, 5).map(s => ({ amount: s.amount, createdAt: s.createdAt }));
      
      const anomalyCheck = checkAmountAnomaly(amount, recentAmounts);
      const duplicateCheck = checkDuplicateRequest(amount, recentPayments);
      
      const aiWarning = anomalyCheck.hasWarning ? anomalyCheck.message 
        : duplicateCheck.hasWarning ? duplicateCheck.message 
        : undefined;
      
      const id = `ens_tx_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const now = Date.now();
      
      // Clean formatted UPI URI with amount, name, currency, and transaction ref
      const upiUri = buildUpiUri({
        upiId,
        name: merchantName,
        amount,
        currency: 'INR',
        note: note || `Payment to ${merchantName}`,
        transactionId: id,
      });
      
      const session: PaymentSession = {
        id,
        businessId,
        cashierId,
        amount,
        upiId,
        merchantName,
        upiUri,
        currency: 'INR',
        status: 'ACTIVE',
        createdAt: now,
        expiresAt: now + SESSION_DURATION_MS,
        aiWarning,
        note,
      };
      
      set(s => ({ 
        sessions: [session, ...s.sessions].slice(0, 100),
        currentSession: session,
      }));

      // Non-blocking sync to PostgreSQL
      syncPaymentSessionToPostgres(session);
      
      return { session, aiWarning };
    },
    
    cancelSession: (id) => set(s => ({
      sessions: s.sessions.map(sess => sess.id === id ? { ...sess, status: 'CANCELLED' as const } : sess),
      currentSession: s.currentSession?.id === id ? { ...s.currentSession, status: 'CANCELLED' as const } : s.currentSession,
    })),
    
    expireSession: (id) => set(s => ({
      sessions: s.sessions.map(sess => sess.id === id ? { ...sess, status: 'EXPIRED' as const } : sess),
      currentSession: s.currentSession?.id === id ? { ...s.currentSession, status: 'EXPIRED' as const } : s.currentSession,
    })),

    confirmPayment: (id, transactionRef) => {
      const now = Date.now();
      const ref = transactionRef || `UPI-REF-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      set(s => {
        const updatedSessions = s.sessions.map(sess => sess.id === id ? { 
          ...sess, 
          status: 'PAYMENT_CONFIRMED' as const, 
          confirmedAt: now,
          transactionRef: ref 
        } : sess);
        const updatedCurrent = s.currentSession?.id === id ? { 
          ...s.currentSession, 
          status: 'PAYMENT_CONFIRMED' as const, 
          confirmedAt: now,
          transactionRef: ref 
        } : s.currentSession;

        if (updatedCurrent) {
          syncPaymentSessionToPostgres(updatedCurrent);
        }

        return {
          sessions: updatedSessions,
          currentSession: updatedCurrent,
        };
      });
    },

    markPending: (id) => set(s => ({
      sessions: s.sessions.map(sess => sess.id === id ? { ...sess, status: 'PAYMENT_PENDING' as const } : sess),
      currentSession: s.currentSession?.id === id ? { ...s.currentSession, status: 'PAYMENT_PENDING' as const } : s.currentSession,
    })),
    
    setCurrentSession: (session) => set({ currentSession: session }),
    
    clearHistory: () => set({ sessions: [], currentSession: null }),
    
    getRecentSessions: (businessId, limit = 20) => {
      return get().sessions.filter(s => s.businessId === businessId).slice(0, limit);
    },
  }),
  { name: 'ens-payment-sessions', version: 2 }
));
