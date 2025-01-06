import { create } from 'zustand';

export interface SessionState {
  sessionId: string | null;
  selectedPackage: string | null;
  setSessionId: (id: string | null) => void;
  setSelectedPackage: (packageId: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  selectedPackage: null,
  setSessionId: (id) => set({ sessionId: id }),
  setSelectedPackage: (packageId) => set({ selectedPackage: packageId }),
})); 