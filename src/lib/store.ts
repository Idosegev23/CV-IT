import { create } from 'zustand'

export type Package = 'basic' | 'advanced' | 'pro';

interface AppState {
  language: string;
  setLanguage: (lang: string) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  selectedPackage: Package | null;
  setSelectedPackage: (pkg: Package) => void;
  selectedTemplate: string | undefined;
  setSelectedTemplate: (template: string | undefined) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'he',
  setLanguage: (lang) => set({ language: lang }),
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
  selectedPackage: null,
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
  selectedTemplate: undefined,
  setSelectedTemplate: (template) => set({ selectedTemplate: template })
})); 