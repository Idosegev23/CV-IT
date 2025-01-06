import type { Metadata } from 'next';
import { Language } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SalaryGuide from '@/components/sections/SalaryGuide';

type Props = {
  params: Promise<{ lang: Language }>;
};

export function generateStaticParams() {
  return [
    { lang: 'he' },
    { lang: 'en' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const title = resolvedParams.lang === 'he' ? 'המדריך המלא לתלוש משכורת' : 'The Complete Salary Slip Guide';
  const description = resolvedParams.lang === 'he' 
    ? 'כל מה שצריך לדעת על תלוש המשכורת שלך, בשפה פשוטה ומובנת' 
    : 'Everything you need to know about your salary slip, in simple terms';

  return {
    title,
    description,
  };
}

export default async function SalaryGuidePage({ params }: Props) {
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
      <SalaryGuide lang={resolvedParams.lang} />
    </div>
  );
} 