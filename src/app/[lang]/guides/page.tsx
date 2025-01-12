import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/theme/ui/card';
import { PiggyBank, ChevronLeft, Linkedin, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';
import { BackButton } from '@/components/BackButton';

const content = {
  he: {
    title: "דברים שכדאי לדעת על החיים האמיתיים",
    description: "מדריכים קצרים וברורים שיעזרו לכם להבין את כל מה שלא לימדו בבית ספר",
    guides: [
      {
        title: "פנסיה? זה לא כזה מסובך",
        description: "מדריך פשוט שיעשה לכם סדר בראש. בלי מילים מפוצצות, בלי בלבול מוח",
        icon: PiggyBank,
        href: '/guides/pension'
      },
      {
        title: "איך להפוך את הלינקדאין למגנט",
        description: "טיפים פרקטיים שיגרמו למגייסים לרצות אתכם. בלי קשקושים, רק מה שעובד",
        icon: Linkedin,
        href: '/guides/linkedin'
      },
      {
        title: "תלוש משכורת? יאללה נפצח את זה",
        description: "סוף סוף תבינו מה המספרים אומרים. פשוט, ברור, ובלי להתבלבל",
        icon: Receipt,
        href: '/guides/salary'
      }
    ]
  },
  en: {
    title: "Real Life Skills They Forgot to Teach You",
    description: "Simple guides that make adulting a bit easier",
    guides: [
      {
        title: "Pension Made Simple",
        description: "A no-nonsense guide to understanding pension. Just the stuff you actually need to know",
        icon: PiggyBank,
        href: '/guides/pension'
      },
      {
        title: "LinkedIn That Actually Works",
        description: "Practical tips to make recruiters want you. No fluff, just what works",
        icon: Linkedin,
        href: '/guides/linkedin'
      },
      {
        title: "Payslip Decoded",
        description: "Finally understand what all those numbers mean. Simple, clear, and no confusion",
        icon: Receipt,
        href: '/guides/salary'
      }
    ]
  }
} as const;

type Lang = keyof typeof content;

type PageProps = {
  params: { lang: Lang };
};

export function generateStaticParams() {
  return [
    { lang: 'he' },
    { lang: 'en' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const currentContent = content[params.lang];
  return {
    title: currentContent.title,
    description: currentContent.description,
  };
}

export default async function Page({ params }: PageProps) {
  const currentContent = content[params.lang];
  const isRTL = params.lang === 'he';

  return (
    <div className="bg-[#EAEAE7] min-h-screen">
      <div className="container mx-auto py-6 md:py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div className="mb-8">
            <BackButton isRTL={isRTL} />
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              <span className="text-gray-800">דברים שכדאי לדעת</span>
              <br />
              <span className="text-[#4754D7]">על החיים</span>
              <br />
              <span className="text-gray-800">האמיתיים</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              {currentContent.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentContent.guides.map((guide, index) => (
              <Link 
                key={index} 
                href={`/${params.lang}${guide.href}`}
              >
                <Card className="group relative transition-all duration-500 hover:shadow-2xl border-0 overflow-hidden h-full bg-white">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4754D7]/0 via-[#4754D7]/10 to-[#4754D7]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
                  </div>

                  <div className="relative p-6">
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-3 py-1 text-xs font-medium text-[#4754D7] bg-[#4754D7]/10 rounded-full">
                        {isRTL ? 'מדריך חדש' : 'New Guide'}
                      </div>
                    </div>

                    <div className="relative w-full aspect-[16/9] mb-6 group-hover:translate-y-[-4px] transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 group-hover:opacity-0 transition-opacity duration-300" />
                      <Image
                        src={guide.href.includes('linkedin') ? '/linkedin.jpeg' : 
                            guide.href.includes('salary') ? '/payslip1.jpg' : 
                            '/pension.jpg'}
                        alt={guide.title}
                        fill
                        className="object-contain transform transition-transform duration-500 rounded-xl"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={100}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#4754D7] to-[#6C77E8] text-white shadow-lg shadow-[#4754D7]/20 transform -rotate-3 group-hover:rotate-0 transition-all duration-300">
                          <guide.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#4754D7] transition-colors duration-300">
                            {guide.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {guide.description}
                          </p>
                        </div>
                      </div>

                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-[#4754D7] to-[#6C77E8] transition-all duration-1000" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-[#4754D7] font-medium">
                          <span className="relative">
                            {isRTL ? 'בואו נתחיל' : 'Let\'s start'}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4754D7] group-hover:w-full transition-all duration-300" />
                          </span>
                          <ChevronLeft className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 