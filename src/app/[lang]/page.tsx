import { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import { redirect } from 'next/navigation';

// הגדרת הטיפוס כ-Promise
type PageParams = {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export async function generateMetadata({ 
  params 
}: PageParams): Promise<Metadata> {
  const resolvedParams = await params;
  const isHebrew = resolvedParams.lang === 'he';
  
  return {
    title: isHebrew 
      ? 'CVIT  - קורות חיים מקצועיים'
      : 'CVIT  - Professional CV',
    description: isHebrew
      ? 'צור קורות חיים מקצועיים בקלות ובמהירות'
      : 'Create professional CV easily and quickly',
  };
}

export default async function Page({ params }: PageParams) {
  const resolvedParams = await params;
  
  if (!resolvedParams.lang) {
    redirect('/he');
  }

  return (
    <main 
      className="min-h-screen bg-[#EAEAE7]"
      role="main"
      aria-label={resolvedParams.lang === 'he' ? 'דף הבית' : 'Home page'}
    >
      <HeroSection />
    </main>
  );
}