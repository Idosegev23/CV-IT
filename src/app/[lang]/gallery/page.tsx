'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/BackButton';

const templates = {
  pro: {
    he: {
      title: 'תבנית Pro',
      description: 'לבכירים שרוצים להוביל',
      image: '/design/gallery/pro.png'
    },
    en: {
      title: 'Pro Template',
      description: 'For leaders who make an impact',
      image: '/design/gallery/pro.png'
    }
  },
  classic: {
    he: {
      title: 'תבנית קלאסית',
      description: 'נקי, חד ומדויק',
      image: '/design/gallery/classic.png'
    },
    en: {
      title: 'Classic Template',
      description: 'Clean, sharp, precise',
      image: '/design/gallery/classic.png'
    }
  },
  general: {
    he: {
      title: 'תבנית כללית',
      description: 'גמיש ומתאים לכל תחום',
      image: '/design/gallery/general.png'
    },
    en: {
      title: 'General Template',
      description: 'Flexible for any field',
      image: '/design/gallery/general.png'
    }
  },
  creative: {
    he: {
      title: 'תבנית קריאטיבית',
      description: 'להיות שונה, להיות בולט',
      image: '/design/gallery/creative.png'
    },
    en: {
      title: 'Creative Template',
      description: 'Be different, stand out',
      image: '/design/gallery/creative.png'
    }
  }
};

export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  const isRTL = lang === 'he';
  const [currentTemplate, setCurrentTemplate] = useState('pro');
  
  const handleStart = () => {
    router.push(`/${lang}/packages`);
  };

  const handlePrevTemplate = () => {
    setCurrentTemplate(current => {
      const templates = ['pro', 'classic', 'general', 'creative'];
      const currentIndex = templates.indexOf(current);
      return templates[(currentIndex - 1 + templates.length) % templates.length];
    });
  };

  const handleNextTemplate = () => {
    setCurrentTemplate(current => {
      const templates = ['pro', 'classic', 'general', 'creative'];
      const currentIndex = templates.indexOf(current);
      return templates[(currentIndex + 1) % templates.length];
    });
  };

  return (
    <main 
      className={cn(
        "min-h-screen bg-gradient-to-br from-[#EAEAE7] via-white to-[#EAEAE7] py-8 sm:py-12 md:py-20 px-4",
        isRTL ? "rtl" : "ltr"
      )}
    >
      <div className="container mx-auto">
        <div className="mb-8">
          <BackButton isRTL={isRTL} />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 font-rubik text-[#4856CD]">
          {isRTL ? 'התבניות שלנו' : 'Our Templates'}
        </h1>

        <div className="relative max-w-[350px] sm:max-w-2xl md:max-w-4xl mx-auto">
          <button
            onClick={isRTL ? handleNextTemplate : handlePrevTemplate}
            className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 z-10
                     w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center
                     hover:bg-gray-50 transition-colors duration-300
                     focus:outline-none focus:ring-2 focus:ring-[#4856CD]"
            aria-label={isRTL ? 'תבנית הבאה' : 'Previous template'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTemplate}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-[210/297] rounded-2xl overflow-hidden shadow-2xl bg-white"
              role="img"
              aria-label={templates[currentTemplate as keyof typeof templates][lang].title}
            >
              <Image
                src={templates[currentTemplate as keyof typeof templates][lang].image}
                alt=""
                fill
                className="object-contain"
                priority
                aria-hidden="true"
              />
            </motion.div>
          </AnimatePresence>

          <button
            onClick={isRTL ? handlePrevTemplate : handleNextTemplate}
            className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 z-10
                     w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center
                     hover:bg-gray-50 transition-colors duration-300
                     focus:outline-none focus:ring-2 focus:ring-[#4856CD]"
            aria-label={isRTL ? 'תבנית קודמת' : 'Next template'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="text-center mt-8 sm:mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 font-rubik text-[#4856CD]">
              {templates[currentTemplate as keyof typeof templates][lang].title}
            </h2>
            <p className="text-gray-700 text-base sm:text-lg max-w-lg mx-auto">
              {templates[currentTemplate as keyof typeof templates][lang].description}
            </p>
          </div>

          <div className="mt-10 sm:mt-12 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-[#4856CD] text-white rounded-full 
                         font-rubik text-lg hover:bg-[#2E3880] transition-colors duration-300
                         focus:outline-none focus:ring-4 focus:ring-[#4856CD]/30"
                aria-label={isRTL ? 'התחל ליצור קורות חיים' : 'Start creating your CV'}
              >
                {isRTL ? 'יאללה מתחילים!' : 'Let\'s Go!'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
} 