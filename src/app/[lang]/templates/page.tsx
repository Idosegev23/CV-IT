'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/theme/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSessionStore } from '@/store/sessionStore';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import type { Package } from '@/lib/store';
import { PreviewModal } from '@/components/PreviewModal';
import { BackButton } from '@/components/BackButton';
import { HelpCircle } from 'lucide-react';
import { TemplateTutorial } from '@/components/TemplateTutorial';

const templates = {
  he: [
    {
      id: 'classic',
      title: 'תבנית קלאסית',
      description: 'כמו ג׳ינס וחולצה לבנה - אי אפשר לפספס.',
      suitable: ['משרות אדמיניסטרטיביות', 'סוכנים וסוכנות', 'תפקידי ניהול', 'משרות מסורתיות'],
      image: '/design/classic/clasics.png'
    },
    {
      id: 'creative',
      title: 'תבנית קריאטיבית',
      description: 'בשביל מי שרוצה לבלוט בים של קורות חיים.',
      suitable: ['עיצוב', 'שיווק', 'מדיה', 'אמנות'],
      image: '/design/creative/creatives.png'
    },
    {
      id: 'professional',
      title: 'תבנית מקצועית',
      description: 'עיצוב נקי ומדויק שאומר ״אני פה כדי לעבוד״.',
      suitable: ['הייטק', 'פיננסים', 'ניהול בכיר', 'תפקידים מקצועיים'],
      image: '/design/classic/pros.png'
    },
    {
      id: 'general',
      title: 'תבנית כללית',
      description: 'מושלמת למשרה ראשונה או לשינוי כיוון.',
      suitable: ['שירות לקוחות', 'מכירות', 'סטודנטים וסטודנטיות', 'משרות התחלתיות'],
      image: '/design/general/generals.png'
    }
  ],
  en: [
    {
      id: 'classic',
      title: 'Classic',
      description: 'Like jeans and a white shirt - you can\'t go wrong.',
      suitable: ['All Fields', 'Senior Positions', 'Academia', 'Administration'],
      image: '/design/classic/clasics.png'
    },
    {
      id: 'creative',
      title: 'Creative',
      description: 'For those who want to stand out from the crowd.',
      suitable: ['Design', 'Marketing', 'Digital', 'Media'],
      image: '/design/creative/creatives.png'
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Clean and precise design that says "I mean business".',
      suitable: ['High-Tech', 'Finance', 'Senior Management', 'Professional Roles'],
      image: '/design/classic/pros.png'
    },
    {
      id: 'general',
      title: 'Flexible',
      description: 'Perfect for your first job or changing directions.',
      suitable: ['First Job', 'Career Change', 'Students', 'Internship'],
      image: '/design/general/generals.png'
    }
  ]
};

export default function TemplatesPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  const isRTL = lang === 'he';
  const supabase = createClientComponentClient();
  const currentTemplates = templates[lang];
  const selectedPackage = useAppStore(state => state.selectedPackage);
  const setSelectedPackage = useAppStore(state => state.setSelectedPackage) as (pkg: Package | null) => void;
  const searchParams = useSearchParams();
  const fromHeader = searchParams?.get('from') === 'header';
  const fromHome = searchParams?.get('from') === 'home';
  const selectedTemplate = useAppStore(state => state.selectedTemplate);
  const setSelectedTemplate = useAppStore(state => state.setSelectedTemplate);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // אם הגיע מדף הבית ויש לו כבר חבילה נבחרת, נאפס אותה
    if (fromHome && selectedPackage) {
      setSelectedPackage(null);
    }
  }, [fromHome, selectedPackage, setSelectedPackage]);

  // בדיקה אם זו כניסה ראשונה
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTemplatesTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTemplatesTutorial', 'true');
    }
  }, []);

  const handleTemplateSelect = async (templateId: string) => {
    if (isAnimating) return; // מונע מעבר בזמן אנימציה

    try {
      setIsAnimating(true);

      // אם אין חבילה נבחרת, מומרים את התבנית ומעבירים לדף חבילות
      if (!selectedPackage) {
        setSelectedTemplate(templateId);
        router.push(`/${params?.lang ?? 'en'}/packages`);
        return;
      }

      // אם יש חבילה נבחרת, ממשיך לשאלון
      if (!supabase) {
        console.error('Supabase client not initialized');
        throw new Error('Supabase client not initialized');
      }

      // יצירת סשן חדש
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          template_id: templateId,
          language: lang,
          status: 'active',
          current_step: 'initial',
          metadata: {
            template: templateId,
            startedAt: new Date().toISOString(),
            isAnonymous: true
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // יצירת רשומה ב-cv_data
      const { data: cvData, error: cvError } = await supabase
        .from('cv_data')
        .insert({
          session_id: sessionData.id,
          language: lang,
          status: 'draft',
          content: {},
          package: selectedPackage,
          last_updated: new Date().toISOString(),
          format_cv: {},
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (cvError) throw cvError;

      useSessionStore.getState().setSessionId(sessionData.id);
      router.push(`/${lang}/create/template/${sessionData.id}/form`);

    } catch (error) {
      console.error('Detailed error:', error);
      toast.error(isRTL ? 'אירעה שגיאה ביצירת התבנית' : 'Error creating template');
    } finally {
      setIsAnimating(false);
    }
  };

  const handlePreviewClick = (templateId: string) => {
    if (isAnimating) return; // מונע פתיחת תצוגה מקדימה בזמן אנימציה
    setPreviewTemplate(templateId);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  return (
    <main className="min-h-screen bg-[#EAEAE7] relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <button
        onClick={() => setShowTutorial(true)}
        className="help-button fixed bottom-8 left-8 bg-gradient-to-r from-[#4856CD] to-[#4856CD]/90 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 z-50"
      >
        <HelpCircle className="w-5 h-5" />
        <span>{isRTL ? 'צריכים עזרה?' : 'Need help?'}</span>
      </button>

      <TemplateTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        language={lang}
      />

      <div 
        className="fixed bottom-0 right-0 w-full h-[75vh] pointer-events-none z-0"
        style={{
          backgroundImage: "url('/design/BGvector.svg')",
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain'
        }}
      />
      
      <div className="container mx-auto px-4 pt-12 pb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onAnimationComplete={handleAnimationComplete}
              className="text-center relative"
            >
              <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} -top-8`}>
                <BackButton isRTL={isRTL} />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 -top-20">
                <Image
                  src="/design/templates.svg"
                  alt=""
                  width={200}
                  height={166}
                  className="w-32 h-32"
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2 font-rubik text-[#1A1A1A] mt-16">
                {isRTL ? 'בואו נבנה קו״ח מנצחים' : 'Let\'s Build a Winning CV'}
              </h1>
              
              <p className="text-lg text-[#4B4553] font-rubik mb-8 whitespace-pre-line">
                {isRTL ? 
                  'מותאם למובייל, להורדה כ-PDF, כולל גרסה באנגלית.' : 
                  'Mobile friendly, PDF download, English version included.'}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
          {currentTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onAnimationComplete={handleAnimationComplete}
              className="group relative bg-[#EAEAE7] rounded-[32px] overflow-visible border border-white flex flex-col"
            >
              <div className="bg-white/38 pt-[10px] px-[10px]">
                <div className="bg-white border border-white rounded-[32px] overflow-hidden relative">
                  <div className="pb-[50%]">
                    <Image
                      src={template.image}
                      alt={template.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={index < 2}
                    />
                  </div>
                </div>
              </div>

              <div className="relative p-4 pb-10 flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold font-rubik text-[#4856CD]">
                    {template.title}
                  </h2>
                  <button
                    onClick={() => handlePreviewClick(template.id)}
                    className="px-3 py-0.5 bg-[#B78BE6] text-white rounded-full text-sm hover:bg-[#B78BE6]/90 transition-colors"
                    disabled={isAnimating}
                  >
                    {isRTL ? 'לצפייה' : 'Preview'}
                  </button>
                </div>

                <p className="text-[#4B4553] text-sm mb-4 whitespace-pre-line">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {template.suitable.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-block px-2 py-1 bg-[#4856CD]/5 text-[#4856CD] text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-1/2">
                <button
                  onClick={() => handleTemplateSelect(template.id)}
                  className="px-6 py-2 bg-[#4856CD] text-white rounded-full text-sm hover:bg-[#4856CD]/90 transition-colors shadow-lg"
                  disabled={isAnimating}
                >
                  {isRTL ? 'בחירה' : 'Select'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {previewTemplate && (
        <PreviewModal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          templateId={previewTemplate}
          isRTL={isRTL}
        />
      )}
    </main>
  );
}