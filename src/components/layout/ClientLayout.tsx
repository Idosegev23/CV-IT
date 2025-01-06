'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Header } from './Header';

interface ClientLayoutProps {
  children: React.ReactNode;
  lang: string;
  className?: string;
}

export default function ClientLayout({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // או תצוגת טעינה
  }

  const isRTL = lang === 'he';
  
  return (
    <>
      <Header isRTL={isRTL} />
      <main>
        {children}
      </main>
    </>
  );
} 