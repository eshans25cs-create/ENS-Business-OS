import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncBusinessToPostgres } from '../utils/postgresService';

export type BusinessType = 
  | 'Smart Bazaar' 
  | 'Supermarket' 
  | 'Shopping Mall' 
  | 'Restaurant' 
  | 'Retail Shop' 
  | 'Hotel' 
  | 'Petrol Station' 
  | 'Grocery' 
  | 'Pharmacy' 
  | 'Electronics' 
  | 'Other';

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  type: BusinessType;
  address: string;
  phone: string;
  upiId: string;
  merchantName: string;
  qrData?: string;
  qrImageUrl?: string;
  status: 'active' | 'suspended';
  createdAt: number;
}

export const DEFAULT_BUSINESSES: Business[] = [
  {
    id: 'biz_abc_smart_bazaar',
    ownerId: 'user_demo_admin',
    name: 'ABC SMART BAZAAR',
    type: 'Smart Bazaar',
    address: 'Central Avenue, Commercial Complex, Sector 12',
    phone: '+91 88675 41037',
    upiId: 'abcsmart@upi',
    merchantName: 'ABC Smart Bazaar',
    status: 'active',
    createdAt: 1700000000000,
  },
  {
    id: 'biz_city_mall',
    ownerId: 'user_demo_admin',
    name: 'CITY MALL',
    type: 'Shopping Mall',
    address: 'Grand Promenade, Block B, Metro Road',
    phone: '+91 98234 56789',
    upiId: 'citymall@upi',
    merchantName: 'City Mall Payments',
    status: 'active',
    createdAt: 1700001000000,
  },
  {
    id: 'biz_xyz_restaurant',
    ownerId: 'user_demo_admin',
    name: 'XYZ RESTAURANT',
    type: 'Restaurant',
    address: '42 Gourmet Lane, Indiranagar',
    phone: '+91 98345 67890',
    upiId: 'xyzrestaurant@upi',
    merchantName: 'XYZ Restaurant Foods',
    status: 'active',
    createdAt: 1700002000000,
  },
  {
    id: 'biz_super_mart',
    ownerId: 'user_demo_admin',
    name: 'SUPER MART',
    type: 'Supermarket',
    address: 'Plot 77, Express Highway Road',
    phone: '+91 98456 78901',
    upiId: 'supermart@upi',
    merchantName: 'Super Mart Retail',
    status: 'active',
    createdAt: 1700003000000,
  },
];

interface BusinessStore {
  businesses: Business[];
  currentBusinessId: string;
  
  // Actions
  createBusiness: (data: Omit<Business, 'id' | 'createdAt' | 'status'>) => Business;
  updateBusiness: (id: string, data: Partial<Omit<Business, 'id' | 'ownerId' | 'createdAt'>>) => void;
  getBusiness: (id: string) => Business | undefined;
  setCurrentBusiness: (id: string) => void;
  getCurrentBusiness: (userId?: string) => Business;
  getUserBusinesses: (userId: string) => Business[];
}

export const useBusinessStore = create<BusinessStore>()(
  persist(
    (set, get) => ({
      businesses: DEFAULT_BUSINESSES,
      currentBusinessId: 'biz_abc_smart_bazaar',
      
      createBusiness: (data) => {
        const newBusiness: Business = {
          ...data,
          id: `biz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          status: 'active',
          createdAt: Date.now(),
        };
        
        set((state) => ({
          businesses: [newBusiness, ...state.businesses],
          currentBusinessId: newBusiness.id,
        }));

        // Async PostgreSQL persistence
        syncBusinessToPostgres(newBusiness);
        
        return newBusiness;
      },
      
      updateBusiness: (id, data) => {
        set((state) => {
          const updated = state.businesses.map((biz) =>
            biz.id === id ? { ...biz, ...data } : biz
          );
          const changed = updated.find(b => b.id === id);
          if (changed) {
            syncBusinessToPostgres(changed);
          }
          return { businesses: updated };
        });
      },
      
      getBusiness: (id) => {
        const { businesses } = get();
        return businesses.find((b) => b.id === id);
      },
      
      setCurrentBusiness: (id) => set({ currentBusinessId: id }),

      getUserBusinesses: (userId: string) => {
        if (!userId) return [];
        return get().businesses.filter((b) => b.ownerId === userId);
      },
      
      getCurrentBusiness: (userId?: string) => {
        const { currentBusinessId, businesses } = get();

        // 1. If a specific userId is provided, look for that user's owned businesses first
        if (userId) {
          const userOwned = businesses.filter(b => b.ownerId === userId);
          if (userOwned.length > 0) {
            const matchSelected = userOwned.find(b => b.id === currentBusinessId);
            return matchSelected || userOwned[0];
          }
        }

        // 2. Otherwise look up by currentBusinessId
        const found = businesses.find((b) => b.id === currentBusinessId);
        if (found) return found;

        // 3. Fallback
        return businesses[0] || DEFAULT_BUSINESSES[0];
      },
    }),
    {
      name: 'ens-smart-businesses',
      version: 2,
    }
  )
);
