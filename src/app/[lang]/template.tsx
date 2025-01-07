'use client';

import CookieConsent from '@/components/CookieConsent/CookieConsent';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
} 