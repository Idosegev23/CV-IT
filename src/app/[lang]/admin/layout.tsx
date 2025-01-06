'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const lang = (typeof params?.lang === 'string' ? params.lang : 'he') as string;
  const pathname = usePathname() || '';
  const router = useRouter();

  // אם זה דף לוגין או רישום, לא נציג את הסיידבר
  if (pathname.includes('/login') || pathname.includes('/register')) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar lang={lang} />
      <main className="flex-1 overflow-y-auto bg-gray-100">
        {children}
      </main>
    </div>
  );
} 