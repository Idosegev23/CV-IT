import { create } from 'zustand';

interface AppState {
  selectedPackage: 'basic' | 'pro' | null;
  setSelectedPackage: (pkg: 'basic' | 'pro' | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedPackage: null,
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
})); 