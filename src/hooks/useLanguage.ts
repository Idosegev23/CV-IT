import { create } from 'zustand';

type Language = 'he' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageStore>((set) => ({
  language: 'he',
  setLanguage: (lang) => set({ language: lang }),
})); 