'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useSessionStore } from '@/store/sessionStore';
import { BackButton } from '@/components/BackButton';

// הוספת טיפוס Package
import type { Package } from '@/lib/store';

// הוספת טיפוס Feature
interface Feature {
  text: string;
  included: boolean;
  tag?: string;
}

const content = {
  he: {
    title: 'בחירת תוכנית',
    subtitle: 'שלוש תוכניות פשוטות, מהירות ומדוייקות.',
    description: 'ב-CVIT ניתן לבחור תכנית שתתאים לך במדוייק.\nזה הרגע שלך לבחור, ומשם…  אנחנו כבר נטפל בהכל, כולל מעטפת מלאה שתמקם אותך בחוד החנית של עולם משאבי האנוש.',
    packages: {
      basic: {
        title: 'Basic',
        price: '75',
        features: [
          { text: 'קורות חיים בעברית', included: true } as Feature,
          { text: 'עיצוב קורות חיים', included: true } as Feature,
          { text: 'עריכת קורות חיים', included: true } as Feature,
          { text: 'מציאת עבודה (הפצה לחברות השמה)', included: true } as Feature,
          { text: 'מחשבון שכר - כמה אני שווה', included: true } as Feature,
          { text: 'קובץ PDF להורדה', included: true } as Feature,
        ] as Feature[]
      },
      advanced: {
        title: 'Advanced',
        price: '85',
        recommended: true,
        features: [
          { text: 'כל מה שבחבילת Basic ובנוסף:', included: true } as Feature,
          { text: 'קורות חיים באנגלית', included: true } as Feature,
          { text: 'תבנית מותאמת לפרופיל לינקדאין', included: true } as Feature,
        ] as Feature[]
      },
      pro: {
        title: 'Pro',
        price: '95',
        features: [
          { text: 'כל מה שבחבילת Advanced ובנוסף:', included: true } as Feature,
          { text: 'הכנה לריאיון העבודה', included: true } as Feature,
          { text: 'ליווי אישי מול המעסיקים', included: true } as Feature,
        ] as Feature[]
      }
    },
    cta: 'אני רוצה את זה',
    recommended: 'הכי פופולרי',
    securePayment: 'ניתן לשלם באשראי, באמצעות תשלום מאובטח'
  },
  en: {
    title: 'Choose Your Package',
    subtitle: 'Three simple, fast, and precise bundles.',
    description: 'At CVIT you can choose a path that fits you perfectly.\nThis is your moment to choose, and from there... we\'ll handle everything, including full support that will position you at the forefront of the HR world.',
    packages: {
      basic: {
        title: 'Basic',
        price: '75',
        features: [
          { text: 'Hebrew CV', included: true } as Feature,
          { text: 'CV Design', included: true } as Feature,
          { text: 'CV Editing', included: true } as Feature,
          { text: 'Job Search (Distribution to Recruitment Companies)', included: true } as Feature,
          { text: 'Salary Calculator - Know Your Worth', included: true } as Feature,
          { text: 'PDF File Download', included: true } as Feature,
        ] as Feature[]
      },
      advanced: {
        title: 'Advanced',
        price: '85',
        recommended: true,
        features: [
          { text: 'Everything in Basic package plus:', included: true } as Feature,
          { text: 'English CV', included: true } as Feature,
          { text: 'LinkedIn Profile Template', included: true } as Feature,
        ] as Feature[]
      },
      pro: {
        title: 'Pro',
        price: '95',
        features: [
          { text: 'Everything in Advanced package plus:', included: true } as Feature,
          { text: 'Job Interview Preparation', included: true } as Feature,
          { text: 'Personal Guidance with Employers', included: true } as Feature,
        ] as Feature[]
      }
    },
    cta: 'I want this',
    recommended: 'Most Popular',
    securePayment: 'Secure credit card payment available'
  }
};

export default function PackagesPage() {
  const params = useParams();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  const isRTL = lang === 'he';
  const currentContent = content[lang as keyof typeof content];
  const router = useRouter();
  const supabase = createClientComponentClient();
  const setSelectedPackage = useAppStore(state => state.setSelectedPackage);
  const selectedTemplate = useAppStore(state => state.selectedTemplate);
  const setSelectedTemplate = useAppStore(state => state.setSelectedTemplate);
  const searchParams = useSearchParams();
  const fromTemplates = searchParams?.get('from') === 'templates';
  const sessionId = useSessionStore(state => state.sessionId);

  const handlePackageSelection = async (packageType: Package) => {
    try {
      // אם אנחנו מגיעים מדף ה-CV, נעדכן את החבילה הקיימת
      if (searchParams?.get('from') === 'cv' && sessionId) {
        const { error: updateError } = await supabase
          .from('cv_data')
          .update({ 
            package: packageType,
            is_editable: packageType === 'advanced' || packageType === 'pro'
          })
          .eq('session_id', sessionId);

        if (updateError) throw updateError;

        // עדכון ה-store והמצב המקומי
        setSelectedPackage(packageType);
        localStorage.setItem('isEditable', String(packageType === 'advanced' || packageType === 'pro'));

        // חזרה לדף ה-CV
        router.push(`/${lang}/cv/${selectedTemplate || 'classic'}?sessionId=${sessionId}`);
      } 
      // אחרת, ניצור session חדש
      else {
        // אם יש תבנית נבחרת, נשתמש בה. אחרת נשתמש ב-classic
        const templateToUse = selectedTemplate || 'classic';
        
        // יצירת session חדש
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            template_id: templateToUse,
            language: lang,
            status: 'active',
            current_step: 'initial',
            metadata: {
              template: templateToUse,
              startedAt: new Date().toISOString(),
              isAnonymous: true
            },
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // יצירת רשומת CV עם החבילה הנבחרת
        const { error: cvError } = await supabase
          .from('cv_data')
          .insert({
            session_id: sessionData.id,
            language: lang,
            status: 'draft',
            content: {},
            package: packageType,
            is_editable: packageType === 'advanced' || packageType === 'pro',
            last_updated: new Date().toISOString(),
            format_cv: {},
            updated_at: new Date().toISOString()
          });

        if (cvError) throw cvError;

        // עדכון ה-store
        useSessionStore.getState().setSessionId(sessionData.id);
        setSelectedPackage(packageType);
        setSelectedTemplate(undefined);

        // ניתוב לטופס היצירה
        router.push(`/${lang}/create/template/${sessionData.id}/form`);
      }

      toast.success(
        isRTL 
          ? 'החבילה נבחרה בהצלחה!'
          : 'Package selected successfully!'
      );

    } catch (error) {
      console.error('Error selecting package:', error);
      toast.error(
        isRTL 
          ? 'אירעה שגיאה בבחירת החבילה'
          : 'Error selecting package'
      );
    }
  };

  const handleTemplateCreation = async (templateId: string, packageType: Package) => {
    try {
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

      const { data: cvData, error: cvError } = await supabase
        .from('cv_data')
        .insert({
          session_id: sessionData.id,
          language: lang,
          status: 'draft',
          content: {},
          package: packageType,
          last_updated: new Date().toISOString(),
          format_cv: {},
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (cvError) throw cvError;

      useSessionStore.getState().setSessionId(sessionData.id);
      setSelectedTemplate(undefined);
      router.push(`/${lang}/create/template/${sessionData.id}/form`);

    } catch (error) {
      console.error('Detailed error:', error);
      toast.error(isRTL ? 'אירעה שגיאה ביצירת התבנית' : 'Error creating template');
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEAE7]">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Back Button */}
        <div className="mb-8">
          <BackButton isRTL={isRTL} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#4856CD] mb-4">
            {currentContent.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto whitespace-pre-line">
            {currentContent.subtitle}
          </p>
        </div>

        {/* קורטיינר החבילות עם סדר מותאם למובייל */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto mb-6">
          {/* Advanced Package - חבילה המומלצת */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/50 backdrop-blur-sm rounded-[44px] p-6 border-2 border-[#4754D6] flex flex-col relative transform md:-translate-y-4 md:scale-105 shadow-lg order-first md:order-2"
          >
            {/* תג "מומלץ" */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4754D6] text-white px-4 py-1 rounded-full text-sm font-medium z-10">
              {currentContent.recommended}
            </div>

            <div className="flex-grow">
              <div className="text-center">
                <h3 className="text-2xl font-light text-gray-600 mb-2 mt-3">
                  {currentContent.packages.advanced.title}
                </h3>
                <div className="w-80 h-[1px] bg-[#4754D6] mx-auto mb-4" />
              </div>
              
              {/* מחיר */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <span className="text-8xl font-extralight text-gray-600 font-['Rubik']">85</span>
                  <span className="absolute -right-4 bottom-1.5 text-base font-extralight text-gray-600 font-['Rubik']">₪</span>
                </div>
              </div>

              {/* רשימת תכונות */}
              <div className="space-y-2 mb-4">
                {currentContent.packages.advanced.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2 ${isRTL ? 'mr-auto pl-6' : 'ml-auto pr-6'} relative`}
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                  >
                    <Image
                      src={feature.included ? '/design/check.svg' : '/design/nocheck.svg'}
                      alt={feature.included ? 'included' : 'not included'}
                      width={20}
                      height={20}
                      className="flex-shrink-0"
                    />
                    <span className="text-base text-gray-600">{feature.text}</span>
                    {feature.tag && (
                      <span className="absolute -top-2 -right-2 bg-[#4754D6] text-white text-[10px] px-2 py-0.5 rounded-full transform rotate-12 whitespace-nowrap">
                        {feature.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => handlePackageSelection('advanced')}
              className="w-[180px] mx-auto bg-[#4754D6] hover:bg-[#4754D6]/90 text-white rounded-[50px] py-2 px-6 text-sm font-medium transition-colors"
            >
              {currentContent.cta}
            </button>
          </motion.div>

          {/* Basic Package */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/40 backdrop-blur-sm rounded-[44px] p-6 border border-white flex flex-col order-2 md:order-1"
          >
            <div className="flex-grow">
              <div className="text-center">
                <h3 className="text-2xl font-light text-gray-600 mb-2">
                  {currentContent.packages.basic.title}
                </h3>
                <div className="w-80 h-[1px] bg-[#4754D6] mx-auto mb-4" />
              </div>
              
              {/* מחיר */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <span className="text-8xl font-extralight text-gray-600 font-['Rubik']">75</span>
                  <span className="absolute -right-4 bottom-1.5 text-base font-extralight text-gray-600 font-['Rubik']">₪</span>
                </div>
              </div>

              {/* רשימת תכונות */}
              <div className="space-y-2 mb-4">
                {currentContent.packages.basic.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2 ${isRTL ? 'mr-auto pl-6' : 'ml-auto pr-6'} relative`}
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                  >
                    <Image
                      src={feature.included ? '/design/check.svg' : '/design/nocheck.svg'}
                      alt={feature.included ? 'included' : 'not included'}
                      width={20}
                      height={20}
                      className="flex-shrink-0"
                    />
                    <span className="text-base text-gray-600">{feature.text}</span>
                    {feature.tag && (
                      <span className="absolute -top-2 -right-2 bg-[#4754D6] text-white text-xs px-2 py-1 rounded-full transform rotate-12">
                        {feature.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => handlePackageSelection('basic')}
              className="w-[180px] mx-auto bg-[#4754D6] hover:bg-[#4754D6]/90 text-white rounded-[50px] py-2 px-6 text-sm font-medium transition-colors"
            >
              {currentContent.cta}
            </button>
          </motion.div>

          {/* Pro Package */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/40 backdrop-blur-sm rounded-[44px] p-6 border border-white flex flex-col order-3"
          >
            <div className="flex-grow">
              <div className="text-center">
                <h3 className="text-2xl font-light text-gray-600 mb-2">
                  {currentContent.packages.pro.title}
                </h3>
                <div className="w-80 h-[1px] bg-[#4754D6] mx-auto mb-4" />
              </div>
              
              {/* מחיר */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <span className="text-8xl font-extralight text-gray-600 font-['Rubik']">95</span>
                  <span className="absolute -right-4 bottom-1.5 text-base font-extralight text-gray-600 font-['Rubik']">₪</span>
                </div>
              </div>

              {/* רשימת תכונות */}
              <div className="space-y-2 mb-4">
                {currentContent.packages.pro.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2 ${isRTL ? 'mr-auto pl-6' : 'ml-auto pr-6'} relative`}
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                  >
                    <Image
                      src={feature.included ? '/design/check.svg' : '/design/nocheck.svg'}
                      alt={feature.included ? 'included' : 'not included'}
                      width={20}
                      height={20}
                      className="flex-shrink-0"
                    />
                    <span className="text-base text-gray-600">{feature.text}</span>
                    {feature.tag && (
                      <span className="absolute -top-2 -right-2 bg-[#4754D6] text-white text-[10px] px-2 py-0.5 rounded-full transform rotate-12 whitespace-nowrap">
                        {feature.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => handlePackageSelection('pro')}
              className="w-[180px] mx-auto bg-[#4754D6] hover:bg-[#4754D6]/90 text-white rounded-[50px] py-2 px-6 text-sm font-medium transition-colors"
            >
              {currentContent.cta}
            </button>
          </motion.div>
        </div>

        {/* שורת תשלום מאובטח */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center mt-6 mb-4 px-4"
        >
          {/* אייקון מאובטח */}
          <Image
            src="/design/safe.svg"
            alt="secure payment"
            width={20}
            height={20}
            className="flex-shrink-0"
          />
          
          {/* טקסט */}
          <span className="text-base text-gray-600 font-light mx-4">
            {currentContent.securePayment}
          </span>
          
          {/* אמצעי תשלום */}
          <div className="flex gap-2">
            <Image
              src="/design/Gpay.svg"
              alt="Google Pay"
              width={42}
              height={30}
              className="flex-shrink-0"
            />
            <Image
              src="/design/Apay.svg"
              alt="Apple Pay"
              width={42}
              height={30}
              className="flex-shrink-0"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 