import type { Locale } from './i18n-config';

const dictionaries = {
  he: () => import('./he.json').then((module) => module.default),
  en: () => import('./en.json').then((module) => module.default),
} as const;

export const getDictionary = async (locale: Locale) => {
  try {
    if (!Object.keys(dictionaries).includes(locale)) {
      console.error(`Locale ${locale} not found`);
      return {};
    }
    return await dictionaries[locale as keyof typeof dictionaries]();
  } catch (error) {
    console.error('Error loading dictionary:', error);
    return {};
  }
}; 