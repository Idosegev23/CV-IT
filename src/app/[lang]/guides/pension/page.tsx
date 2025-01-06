import React from 'react';
import PensionGuide from '@/components/sections/PensionGuide';
import { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type Lang = 'he' | 'en';

type PageParams = {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return [
    { lang: 'he' },
    { lang: 'en' },
  ];
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const resolvedParams = await params;
  const title = resolvedParams.lang === 'he' 
    ? 'דברים שצריכים ללמד בביתפר ולא עשו את זה מעולם אז באנו להציל'
    : 'Things they should teach at school but never did, so we came to save the day';
  const description = resolvedParams.lang === 'he' 
    ? 'כל מה שצריך לדעת על פנסיה, בצורה פשוטה ומובנת'
    : 'Everything you need to know about pension, in simple terms';

  return {
    title,
    description,
  };
}

export default async function Page({ params }: PageParams) {
  const resolvedParams = await params;
  const isRTL = resolvedParams.lang === 'he';
  
  return (
    <div className="bg-[#EAEAE7]">
      <div className="container mx-auto py-4 px-4">
        <Link 
          href={`/${resolvedParams.lang}/guides`}
          className="inline-flex items-center gap-2 text-[#4754D7] hover:text-[#6C77E8] transition-colors duration-300 font-medium"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <ChevronRight className="w-5 h-5" />
          {isRTL ? 'חזרה למדריכים' : 'Back to Guides'}
        </Link>
      </div>
      <PensionGuide lang={resolvedParams.lang as Lang} />
    </div>
  );
} 