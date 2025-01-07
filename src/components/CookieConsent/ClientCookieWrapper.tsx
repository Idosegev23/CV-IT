'use client';

import CookieConsent from './CookieConsent';

export default function ClientCookieWrapper({ lang }: { lang: string }) {
  return <CookieConsent lang={lang} />;
} 