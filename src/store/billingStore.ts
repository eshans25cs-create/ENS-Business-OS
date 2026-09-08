import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncTransactionToPostgres, syncExpenseToPostgres } from '../utils/postgresService';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  total: number;
}

export type PaymentMethod = 'UPI' | 'CASH' | 'CARD' | 'SPLIT';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type ExpenseCategory = 'Rent' | 'Utilities' | 'Salaries' | 'Inventory' | 'Maintenance' | 'Marketing' | 'Taxes' | 'Insurance' | 'Logistics' | 'Equipment' | 'Other';

export interface Bill {
  id: string;
  businessId: string;
  cashierId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: number;
}

export interface Expense {
  id: string;
  businessId: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  date: number;
  createdAt: number;
}

export interface Transaction {
  id: string;
  businessId: string;
  billId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  payerMasked?: string;
  createdAt: number;
}

interface BillingStore {
  cart: CartItem[];
  bills: Bill[];
  expenses: Expense[];
  transactions: Transaction[];
  
  // Cart operations
  addToCart: (item: Omit<CartItem, 'total'>) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Billing operations
  createBill: (data: Omit<Bill, 'id' | 'createdAt'>) => Bill;
  updateBillStatus: (id: string, status: PaymentStatus, method?: PaymentMethod) => void;
  
  // Expense & Transaction ops
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  
  // Computed views
  getTodayRevenue: (businessId?: string) => number;
  getTodayExpenses: (businessId?: string) => number;
  getTodayProfit: (businessId?: string) => number;
  getMonthRevenue: (businessId?: string) => number;
  getMonthExpenses: (businessId?: string) => number;
}

const isSameDay = (d1: number, d2: number) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isSameMonth = (d1: number, d2: number) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth();
};

export const useBillingStore = create<BillingStore>()(
  persist(
    (set, get) => ({
      cart: [],
      bills: [],
      expenses: [],
      transactions: [],
      
      addToCart: (item) => set((state) => {
        const existing = state.cart.find((c) => c.productId === item.productId);
        if (existing) {
          return {
            cart: state.cart.map((c) => 
              c.productId === item.productId 
                ? { ...c, quantity: c.quantity + item.quantity, total: (c.quantity + item.quantity) * c.sellingPrice } 
                : c
            )
          };
        }
        return { cart: [...state.cart, { ...item, total: item.quantity * item.sellingPrice }] };
      }),
      
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((c) => c.productId !== productId)
      })),
      
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map((c) => 
          c.productId === productId 
            ? { ...c, quantity, total: quantity * c.sellingPrice } 
            : c
        )
      })),
      
      clearCart: () => set({ cart: [] }),
      
      createBill: (data) => {
        const newBill: Bill = {
          ...data,
          id: `bill_${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => ({ bills: [...state.bills, newBill] }));
        return newBill;
      },
      
      updateBillStatus: (id, status, method) => set((state) => ({
        bills: state.bills.map((b) => 
          b.id === id 
            ? { ...b, paymentStatus: status, ...(method ? { paymentMethod: method } : {}) } 
            : b
        )
      })),
      
      addExpense: (data) => {
        const newExpense: Expense = {
          ...data,
          id: `exp_${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
        syncExpenseToPostgres(newExpense);
        return newExpense;
      },
      
      addTransaction: (data) => {
        const newTx: Transaction = {
          ...data,
          id: `tx_${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => ({ transactions: [...state.transactions, newTx] }));
        syncTransactionToPostgres(newTx);
        return newTx;
      },
      
      getTodayRevenue: (businessId?: string) => {
        const today = Date.now();
        return get().bills
          .filter(b => (!businessId || b.businessId === businessId) && b.paymentStatus === 'COMPLETED' && isSameDay(b.createdAt, today))
          .reduce((sum, b) => sum + b.totalAmount, 0);
      },
      
      getTodayExpenses: (businessId?: string) => {
        const today = Date.now();
        return get().expenses
          .filter(e => (!businessId || e.businessId === businessId) && isSameDay(e.date, today))
          .reduce((sum, e) => sum + e.amount, 0);
      },
      
      getTodayProfit: (businessId?: string) => {
        return get().getTodayRevenue(businessId) - get().getTodayExpenses(businessId);
      },
      
      getMonthRevenue: (businessId?: string) => {
        const today = Date.now();
        return get().bills
          .filter(b => (!businessId || b.businessId === businessId) && b.paymentStatus === 'COMPLETED' && isSameMonth(b.createdAt, today))
          .reduce((sum, b) => sum + b.totalAmount, 0);
      },
      
      getMonthExpenses: (businessId?: string) => {
        const today = Date.now();
        return get().expenses
          .filter(e => (!businessId || e.businessId === businessId) && isSameMonth(e.date, today))
          .reduce((sum, e) => sum + e.amount, 0);
      },
    }),
    {
      name: 'ens-billing',
      version: 1,
    }
  )
);
