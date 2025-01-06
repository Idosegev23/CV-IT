export type Locale = 'he' | 'en';

export const i18n = {
  defaultLocale: 'he' as const,
  locales: ['he', 'en'] as const,
} as const;

export type ValidLocale = typeof i18n.locales[number]; 