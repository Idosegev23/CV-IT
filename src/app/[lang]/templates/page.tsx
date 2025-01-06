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

const templates = {
  he: [
    {
      id: 'classic',
      title: 'תבנית קלאסית',
      description: 'תציג קובץ בעל ארומה נקיה.\nומדויקת.',
      suitable: ['משרות אדמיניסטרטיביות', 'סוכנים וסוכנות', 'תפקידי ניהול', 'משרות מסורתיות'],
      image: '/design/classic/clasics.png'
    },
    {
      id: 'professional',
      title: 'תבנית Pro',
      description: 'חריפה לתפקידים בכירים.',
      suitable: ['הייטק', 'פיננסים', 'ניהול בכיר', 'תפקידים מקצועיים'],
      image: '/design/classic/pros.png'
    },
    {
      id: 'general',
      title: 'תבנית כללית',
      description: 'אם קשה לך להחליט, זו התבנית עבורך.\nכמו פיצה מרגריטה היא תתאים לכולם.',
      suitable: ['שירות לקוחות', 'מכירות', 'סטודנטים וסטודנטיות', 'משרות התחלתיות'],
      image: '/design/general/generals.png'
    },
    {
      id: 'creative',
      title: 'תבנית קריאטיבית',
      description: 'להיות שונה.\nלבלוט.',
      suitable: ['עיצוב', 'שיווק', 'מדיה', 'אמנות'],
      image: '/design/creative/creatives.png'
    }
  ],
  en: [
    {
      id: 'professional',
      title: 'Professional',
      description: 'Perfect for managers, finance and high-tech professionals - emphasizes seriousness and expertise',
      suitable: ['High-Tech', 'Finance', 'Senior Management', 'Professional Roles'],
      image: '/design/classic/pros.png'
    },
    {
      id: 'classic',
      title: 'Classic',
      description: 'Simple and clean, suitable for a wide range of positions and fields',
      suitable: ['All Fields', 'Senior Positions', 'Academia', 'Administration'],
      image: '/design/classic/clasics.png'
    },
    {
      id: 'general',
      title: 'Flexible',
      description: 'A design that easily adapts to different needs, suitable for any role and person',
      suitable: ['First Job', 'Career Change', 'Students', 'Internship'],
      image: '/design/general/generals.png'
    },
    {
      id: 'creative',
      title: 'Creative',
      description: 'Perfect for designers and marketers, with a unique look that radiates creativity',
      suitable: ['Design', 'Marketing', 'Digital', 'Media'],
      image: '/design/creative/creatives.png'
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

  useEffect(() => {
    // אם הגיע מדף הבית ויש לו כבר חבילה נבחרת, נאפס אותה
    if (fromHome && selectedPackage) {
      setSelectedPackage(null);
    }
  }, [fromHome, selectedPackage, setSelectedPackage]);

  const handleTemplateSelect = async (templateId: string) => {
    try {
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
    }
  };

  const handlePreviewClick = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  return (
    <main className="min-h-screen bg-[#EAEAE7] relative">
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
              className="text-center relative"
            >
              <div className="absolute left-1/2 -translate-x-1/2 -top-20">
                <Image
                  src="/design/templates.svg"
                  alt=""
                  width={200}
                  height={166}
                  className="w-32 h-32"
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2 font-rubik text-[#1A1A1A]">
                {isRTL ? 'בחירת תבנית מושלמת' : 'Choose Your Perfect Template'}
              </h1>
              
              <p className="text-lg text-[#4B4553] font-rubik mb-4 block">
                {isRTL ? 
                  'תבניות זה לא רק עיצוב של עמוד – זו אומנות.\nכל תבנית שלנו בנויה כמו לוק בהתאמה אישית.' : 
                  'Templates are not just page design - it\'s art.\nEach of our templates is built like a personalized look.'}
              </p>
              
              <p className="text-lg text-[#4B4553] font-rubik mb-8 whitespace-pre-line">
                {isRTL ? 
                  'רק לבחור את זו שתתאים לך.\nואל דאגה – תמיד אפשר להחליף.' : 
                  'Just choose the one that suits you.\nAnd don\'t worry - you can always change it.'}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-[#EAEAE7] rounded-[32px] overflow-visible border border-white"
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

              <div className="relative p-4 pb-10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold font-rubik text-[#4856CD]">
                    {template.title}
                  </h2>
                  <button
                    onClick={() => handlePreviewClick(template.id)}
                    className="px-3 py-0.5 bg-[#B78BE6] text-white rounded-full text-sm hover:bg-[#B78BE6]/90 transition-colors"
                  >
                    {isRTL ? 'לצפייה' : 'Preview'}
                  </button>
                </div>

                <p className="text-sm text-[#4B4553] mb-3 font-rubik">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {template.suitable.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded-full border border-[#4754D6] text-xs text-[#4856CD] font-rubik"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleTemplateSelect(template.id)}
                    className="px-8 bg-[#4856CD] hover:bg-[#4856CD]/90 text-white font-rubik py-4 text-base rounded-full"
                    aria-label={isRTL ? `בחר תבנית ${template.title}` : `Select ${template.title} template`}
                  >
                    {isRTL ? 'בואו נתחיל' : 'Let\'s Start'}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <PreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        templateId={previewTemplate || ''}
        isRTL={isRTL}
      />
    </main>
  );
}