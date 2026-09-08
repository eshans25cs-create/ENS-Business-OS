import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MerchantProfile {
  name: string;
  upiId: string;
  description?: string;
}

interface MerchantStore {
  profile: MerchantProfile;
  isConfigured: boolean;
  setProfile: (profile: MerchantProfile) => void;
  clearProfile: () => void;
}

const DEFAULT_PROFILE: MerchantProfile = {
  name: '',
  upiId: '',
  description: '',
};

export const useMerchantStore = create<MerchantStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      isConfigured: false,
      setProfile: (profile) =>
        set({ profile, isConfigured: !!(profile.name && profile.upiId) }),
      clearProfile: () => set({ profile: DEFAULT_PROFILE, isConfigured: false }),
    }),
    { name: 'cyber-surety-merchant' }
  )
);
