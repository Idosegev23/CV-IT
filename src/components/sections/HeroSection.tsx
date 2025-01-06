'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/theme/ui/button';
import { useWindowSize } from '@/hooks/useWindowSize';
import ReservistButton from '@/components/ReservistButton';

const content = {
  he: {
    title: "בוא נעשה את זה פשוט: עבודה חדשה בדרך",
    subtitle: "8 שאלות קצרות, קצת קסם של AI, והופה - יש לך קורות חיים מושלמים. אה, ואנחנו גם דואגים שהם יגיעו למגייסים הנכונים. כי למה להתאמץ כשאפשר גם אחרת?",
    primaryCta: "יאללה, מתחילים",
    secondaryCta: "רוצה לדעת עוד?",
    comingSoon: "בבנייה",
    imageAlt: "תצוגה מקדימה של קורות חיים"
  },
  en: {
    title: "Let's Keep It Simple: Your Next Job Awaits",
    subtitle: "8 quick questions, a bit of AI magic, and voilà - you've got perfect CVs. Oh, and we'll make sure they reach the right recruiters. Because why work hard when you can work smart?",
    primaryCta: "Let's Go",
    secondaryCta: "Tell Me More",
    comingSoon: "Coming Soon",
    imageAlt: "CV preview"
  }
};

export default function HeroSection() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  const isRTL = lang === 'he';
  const currentContent = content[lang as keyof typeof content];
  const { width } = useWindowSize();

  // פונקציה שמחזירה גדלים דינמיים בהתאם לרוחב המסך
  const getDynamicSizes = () => {
    // גדלי פונט לכותרת
    const titleSize = width < 360 ? 'text-3xl' : 
                     width < 480 ? 'text-4xl' :
                     width < 768 ? 'text-5xl' : 'text-6xl';

    // גדלי פונט לטקסט
    const textSize = width < 360 ? 'text-sm' :
                    width < 480 ? 'text-base' :
                    width < 768 ? 'text-lg' : 'text-xl';

    // גודל תמונה ראשית
    const heroImageSize = width < 360 ? 200 :
                         width < 480 ? 250 :
                         width < 768 ? 300 :
                         width < 1024 ? 350 : '45vw';

    // גדכון גודל העטורים
    const decorationSize = {
      left: width < 360 ? 30 :
            width < 480 ? 40 :
            width < 768 ? 60 : 80,
      right: width < 360 ? 15 :
             width < 480 ? 20 :
             width < 768 ? 30 :
             width < 1024 ? 40 : 50
    };

    // מרווחים
    const spacing = width < 360 ? 'gap-3' :
                   width < 480 ? 'gap-4' :
                   width < 768 ? 'gap-6' : 'gap-8';

    // padding
    const sectionPadding = width < 360 ? 'px-3 py-4' :
                          width < 480 ? 'px-4 py-6' :
                          width < 768 ? 'px-6 py-8' : 'px-8 py-10';

    // גודל כפתורים
    const buttonSize = width < 360 ? 'text-base px-6 py-4' :
                      width < 480 ? 'text-lg px-7 py-5' : 'text-lg px-8 py-6';

    return { 
      titleSize, 
      textSize, 
      heroImageSize, 
      decorationSize, 
      spacing, 
      sectionPadding,
      buttonSize 
    };
  };

  const { 
    titleSize, 
    textSize, 
    heroImageSize, 
    decorationSize, 
    spacing, 
    sectionPadding,
    buttonSize 
  } = getDynamicSizes();

  const handleStart = () => {
    router.push(`/${lang}/templates?from=home`);
  };

  return (
    <section 
      className={`relative w-full min-h-[calc(100vh-4rem)] flex items-center ${sectionPadding} overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Vector */}
      <div 
        className="fixed bottom-0 right-0 w-full h-[75vh] pointer-events-none"
        style={{
          backgroundImage: "url('/design/BGvector.svg')",
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          zIndex: 0
        }}
      />

      <div className={`container mx-auto flex flex-col-reverse md:flex-row items-center justify-between ${spacing} relative z-10`}>
        {/* Text Content */}
        <div className="flex-1 text-center md:text-start w-full md:w-[45%]">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${titleSize} text-primary font-bold mb-4`}
          >
            {currentContent.title}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${textSize} text-gray-600 mb-8 whitespace-pre-line`}
          >
            {currentContent.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-start items-stretch w-full"
          >
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleStart}
                  className={`
                    flex-1 min-w-[200px] 
                    bg-[#4754D6] hover:bg-[#4754D6]/90 
                    rounded-full text-white 
                    ${buttonSize}
                  `}
                  aria-label={isRTL ? 'עבור לדף המסלולים' : 'Go to Packages page'}
                >
                  {currentContent.primaryCta}
                </Button>
                
                <Button
                  onClick={() => router.push(`/${lang}/about`)}
                  className={`
                    flex-1 min-w-[200px]
                    rounded-full 
                    border-2 border-[#3F55D2] 
                    text-[#3F55D2] 
                    hover:bg-[#3F55D2]/5
                    bg-transparent
                    ${buttonSize}
                  `}
                  variant="outline"
                  aria-label={isRTL ? 'עבור לעמוד אודות' : 'Go to About page'}
                >
                  {currentContent.secondaryCta}
                </Button>
              </div>

              <div className="flex justify-center mt-2">
                <ReservistButton lang={lang} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image and Decorations */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-1/2 relative flex justify-center items-center"
        >
          <div 
            className="relative aspect-square"
            style={{ 
              width: typeof heroImageSize === 'string' ? heroImageSize : `${heroImageSize}px`,
              maxWidth: '100%'
            }}
          >
            {/* Left Decoration */}
            <div 
              className="absolute z-10"
              style={{ 
                width: `${decorationSize.left}px`,
                top: '10%',
                left: '-7%',
              }}
              aria-hidden="true"
            >
              <Image 
                src="/design/halfUp.svg"
                alt=""
                width={144}
                height={272}
                className="w-full h-auto"
              />
            </div>

            <Image
              src="/heropic.png"
              alt={currentContent.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              quality={100}
              className="object-contain rounded-3xl"
              style={{
                objectFit: 'contain',
                borderRadius: '24px',
              }}
            />
          </div>

          {/* Right Decoration */}
          <div 
            className="absolute"
            style={{ 
              width: `${decorationSize.right}px`,
              bottom: width < 360 ? '15px' :
                      width < 480 ? '20px' :
                      width < 768 ? '25px' :
                      width < 1024 ? '20px' : '25px',
              right: width < 360 ? '15px' :
                     width < 480 ? '20px' :
                     width < 768 ? '25px' :
                     width < 1024 ? '15px' : '20px'
            }}
            aria-hidden="true"
          >
            <Image 
              src="https://res.cloudinary.com/dsoh3yteb/image/upload/v1732740916/%D7%A0%D7%A7%D7%95%D7%93%D7%94%D7%A4%D7%A1%D7%99%D7%A7_gyy21b.svg"
              alt=""
              width={144}
              height={272}
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
