import { Inter } from 'next/font/google';
import ClientLayout from '@/components/layout/ClientLayout';
import { Rubik } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });
const rubik = Rubik({ 
  subsets: ['latin', 'hebrew'],
  variable: '--font-rubik',
});

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = params.lang;
  const isRTL = lang === 'he';
  
  return (
    <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'}>
      <body className={`${rubik.variable} font-rubik`}>
        <ClientLayout lang={lang}>
          {children}
        </ClientLayout>
        <Analytics />
        <div id="cookie-consent-root" />
      </body>
    </html>
  );
} 