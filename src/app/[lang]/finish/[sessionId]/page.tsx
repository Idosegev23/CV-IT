'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/theme/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Package } from '@/lib/store';
import { UpgradePaymentModal } from '@/components/PaymentModal/UpgradePaymentModal';
import { LoadingModal } from '@/components/LoadingModal';
import { Globe, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PACKAGE_PRICES = {
  basic: 75,
  advanced: 85,
  pro: 95
} as const;

export interface FeatureConfig {
  icon: string;
  title: string;
  description: string;
  requiredPackage: Package;
  route: string;
  isLocked?: boolean;
  tag?: string;
}

interface FeatureWithUpgrade extends FeatureConfig {
  key: string;
  upgradePrice: number;
}

interface Experience {
  title: string;
  duration: string;
  // הוסף שדות נוסם אם יש צורך
}

interface PersonalDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface FormatCV {
  personal_details: PersonalDetails;
  experience: Experience[];
}

interface CVData {
  id: string;
  session_id: string;
  format_cv: FormatCV;
  pdf_filename: string;
  cv_analyses?: {
    level?: string;
    market?: string;
  };
}

export default function FinishPage() {
  const params = useParams();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  const sessionId = params?.sessionId as string;
  
  const isRTL = lang === 'he';
  const [dictionary, setDictionary] = useState<any>(null);
  const [currentPackage, setCurrentPackage] = useState<Package>('basic');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSendCVModal, setShowSendCVModal] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<{
    feature: string;
    requiredPackage: Package;
    upgradedFeatures: FeatureWithUpgrade[];
    upgradePrice: number;
  } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        const dict = await getDictionary(lang);
        setDictionary(dict);

        const { data: cvData, error } = await supabase
          .from('cv_data')
          .select('package')
          .eq('session_id', sessionId)
          .single();

        if (error) throw error;
        if (cvData?.package) {
          setCurrentPackage(cvData.package as Package);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [lang, sessionId, supabase]);

  const calculateUpgradePrice = (currentPkg: Package, targetPkg: Package): number => {
    if (!currentPkg || !targetPkg) return 0;
    return PACKAGE_PRICES[targetPkg] - PACKAGE_PRICES[currentPkg];
  };

  const features: Record<string, FeatureConfig> = {
    download: {
      icon: 'downloadPDF',
      title: isRTL ? 'PDF הורדת' : 'Download PDF',
      description: isRTL ? 'הורד את קורות החיים שלך בפורמט PDF' : 'Download your CV in PDF format',
      requiredPackage: 'basic',
      route: `/${lang}/create/template/${sessionId}/preview`
    },
    sendCV: {
      icon: 'look',
      title: isRTL ? 'חיפוש עבודה' : 'Job Search',
      description: isRTL ? 'שלח את קורות החיים שלך למעסיקים פוטנציאליים' : 'Send your CV to potential employers',
      requiredPackage: 'basic',
      route: '#'
    },
    translate: {
      icon: 'translate',
      title: isRTL ? 'תרגום לאנגלית' : 'English Translation',
      description: isRTL ? 'תרגם את קורות החיים שלך לאנגלית' : 'Translate your CV to English',
      requiredPackage: 'advanced',
      route: `/${lang}/cv/professional?sessionId=${sessionId}`
    },
    linkedin: {
      icon: '/design/linkedin-logo.svg',
      title: isRTL ? 'פרופיל לינקדאין מקצועי' : 'Professional LinkedIn Profile',
      description: isRTL 
        ? 'בנה פרופיל לינקדאין מקצועי המותאם לקורות החיים שלך' 
        : 'Build a professional LinkedIn profile matching your CV',
      requiredPackage: 'advanced',
      route: `/${lang}/linkedin-profile/${sessionId}`,
      isLocked: false
    },
    salary: {
      icon: 'money',
      title: isRTL ? 'כמה אני שווה?' : 'What\'s My Worth?',
      description: isRTL 
        ? 'בדוק את השווי שלך בשוק העבודה' 
        : 'Check your market value',
      requiredPackage: 'basic',
      route: `/${lang}/salary-analysis/${sessionId}`,
      isLocked: false
    },
    interview: {
      icon: 'downmid',
      title: isRTL ? 'הכנה לראיון' : 'Interview Prep',
      description: isRTL ? 'קבל הכנה מקצועית לראיון העבודה' : 'Get professional interview preparation',
      requiredPackage: 'pro',
      route: '#'
    },
    taxi: {
      icon: 'taxi',
      title: isRTL ? 'מונית לראיון' : 'Interview Taxi',
      description: isRTL ? 'הזמן מונית בחינם לראיון העבודה' : 'Get a free taxi ride to your interview',
      requiredPackage: 'pro',
      route: '#',
      isLocked: true,
      tag: isRTL ? 'בבנייה' : 'Coming Soon'
    }
  };

  const isFeatureAvailable = (requiredPackage: Package): boolean => {
    if (!currentPackage) return false;
    
    const packageLevels = {
      basic: 1,
      advanced: 2,
      pro: 3
    } as const;
    
    return packageLevels[currentPackage as keyof typeof packageLevels] >= 
           packageLevels[requiredPackage as keyof typeof packageLevels];
  };

  const getUpgradeFeatures = (targetPackage: Package): FeatureWithUpgrade[] => {
    return Object.entries(features)
      .filter(([_, feature]) => feature.requiredPackage === targetPackage)
      .map(([key, feature]) => ({
        ...feature,
        key,
        upgradePrice: calculateUpgradePrice(currentPackage, targetPackage)
      }));
  };

  const handleFeatureClick = async (featureKey: string) => {
    setCurrentAction(featureKey);
    const feature = features[featureKey];
    
    if (featureKey === 'translate') {
      setShowLoadingModal(true);
      try {
        console.log('Starting translation for session:', sessionId);
        
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('template_id')
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          console.error('Error fetching template:', sessionError);
          throw new Error('Failed to fetch template');
        }

        const response = await fetch('/api/translate-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            sourceLang: lang,
            targetLang: 'en'
          }),
        });

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const data = await response.json();
        console.log('Translation response:', data);
        
        if (data.success) {
          router.push(`/${lang}/cv/professional?sessionId=${sessionId}&contentLang=en`);
        } else {
          throw new Error(data.error || 'Translation process failed');
        }
      } catch (error) {
        console.error('Translation error:', error);
        toast.error(isRTL ? 'שגיאה בתרגום קורות החיים' : 'Error translating CV');
      } finally {
        setShowLoadingModal(false);
      }
      return;
    }
    
    if (featureKey === 'sendCV') {
      setShowLoadingModal(true);
      try {
        const response = await fetch('/api/send-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send CV');
        }

        // נציג את אנימציית ההצלחה למשך שנייה וחצי
        setIsSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        console.error('Error sending CV:', error);
        toast.error(
          isRTL 
            ? 'אופס! היונה התעייפה באמצע הדרך 🕊️' 
            : 'Oops! Our pigeon got tired midway 🕊️'
        );
      } finally {
        setShowLoadingModal(false);
        setIsSuccess(false);
      }
      return;
    }
    
    if (featureKey === 'interview') {
      setShowLoadingModal(true);
      try {
        const { data: cvData, error: cvError } = await supabase
          .from('cv_data')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (cvError) throw cvError;

        const response = await fetch('/api/send-interview-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cvData,
            sessionId,
            lang
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send interview request');
        }

        // נציג את אנימציית ההצלחה למשך שנייה וחצי
        setIsSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const successMessages = isRTL ? [
          '🎭 המראיינים כבר מתאמנים על חיוך נחמד בשבילך!',
          '🎪 הבמה שלך מוכנה, אנחנו רק מצחצחים את הזרקורים',
          '🎯 המדריך שלך לראיון כבר מחמם את המנועים',
          '🎪 שומרים לך את הכיסא הכי נוח באולם הראיונות'
        ] : [
          '🎭 Our interviewers are practicing their nice smiles for you!',
          '🎪 Your stage is ready, we\'re just polishing the spotlights',
          '🎯 Your interview guide is warming up the engines',
          '🎪 We\'re saving you the comfiest chair in the interview room'
        ];

        toast.success(
          successMessages[Math.floor(Math.random() * successMessages.length)],
          {
            description: isRTL 
              ? 'ניצור איתך קשר ממש בקרוב! 📞' 
              : 'We\'ll contact you very soon! 📞',
            duration: 6000
          }
        );

      } catch (error) {
        console.error('Error sending interview request:', error);
        toast.error(
          isRTL 
            ? '🎪 אופס! נראה שהבמה צריכה עוד קצת תיקונים...' 
            : '🎪 Oops! Looks like our stage needs some more adjustments...'
        );
      } finally {
        setShowLoadingModal(false);
        setIsSuccess(false);
      }
      return;
    }
    
    if (featureKey === 'linkedin') {
      if (!isFeatureAvailable('advanced')) {
        const upgradePrice = calculateUpgradePrice(currentPackage, 'advanced');
        const upgradedFeatures = getUpgradeFeatures('advanced');
        
        setSelectedFeature({
          feature: featureKey,
          requiredPackage: 'advanced',
          upgradedFeatures,
          upgradePrice
        });
        setShowUpgradeModal(true);
        return;
      }
      
      router.push(`/${lang}/linkedin-profile/${sessionId}`);
      return;
    }
    
    if (feature.isLocked) {
      toast.info(
        isRTL 
          ? 'תכונה זו עדיין בפיתוח ותהיה זמינה בקרוב' 
          : 'This feature is under development and will be available soon'
      );
      return;
    }

    if (isFeatureAvailable(feature.requiredPackage)) {
      router.push(feature.route);
    } else {
      const upgradePrice = calculateUpgradePrice(currentPackage, feature.requiredPackage);
      const upgradedFeatures = getUpgradeFeatures(feature.requiredPackage);
      
      setSelectedFeature({
        feature: featureKey,
        requiredPackage: feature.requiredPackage,
        upgradedFeatures,
        upgradePrice
      });
      setShowUpgradeModal(true);
    }
  };

  const renderFeatureButton = (featureKey: string, feature: FeatureConfig) => (
    <motion.div
      key={featureKey}
      className={cn(
        "relative bg-white rounded-[32px] p-6 transition-all",
        feature.isLocked 
          ? "opacity-70 pointer-events-none"
          : "hover:shadow-lg cursor-pointer"
      )}
      whileHover={feature.isLocked ? {} : { scale: 1.02 }}
      onClick={() => !feature.isLocked && handleFeatureClick(featureKey)}
    >
      {feature.tag && (
        <div className="absolute top-4 right-4 bg-[#4856CD] text-white px-3 py-1 rounded-full text-sm">
          {feature.tag}
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        {featureKey === 'linkedin' ? (
          <Linkedin size={48} className="text-[#0A66C2]" />
        ) : (
          <Image
            src={`/design/${feature.icon}.svg`}
            alt={feature.title}
            width={48}
            height={48}
            className={feature.isLocked ? "opacity-50" : ""}
          />
        )}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );

  if (!dictionary) return null;

  return (
    <div className="min-h-screen bg-[#EAEAE7]">
      {showSendCVModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-4xl w-full relative flex">
            {/* צד שמאל - תמונה */}
            <div className="w-1/2 bg-[#F3F4F1] p-8 flex items-center justify-center">
              <div className="relative w-full aspect-square">
                <Image
                  src="/sendcv.png"
                  alt="Send CV"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* צד ימין - תוכן */}
            <div className="w-1/2 p-8 flex flex-col justify-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                  {isRTL ? 'נמצא לך עבודה!' : "Let's Find You a Job!"}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {isRTL 
                    ? 'בלחיצה אחת אנחנו משגרים את קורות החיים שלך לחברות ההשמה המובילות בארץ ויתחילו לעבוד על הקורות חיים שלך'
                    : 'With one click, we will send your CV to the leading recruitment companies in Israel and they will start working on your CV'}
                </p>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={async () => {
                      try {
                        setShowLoadingModal(true);
                        
                        // קודם כל מוודאים שיש PDF
                        const pdfResponse = await fetch(`/api/generate-pdf?sessionId=${sessionId}`);
                        if (!pdfResponse.ok) {
                          throw new Error('Failed to generate PDF');
                        }
                        
                        // אחרי שיש PDF, שולחים את קורות החיים
                        const response = await fetch('/api/send-cv', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            sessionId,
                          }),
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to send CV');
                        }
                        
                        toast.success(isRTL ? 'קורות החיים נשלחו בהצלחה!' : 'CV sent successfully!');
                      } catch (error) {
                        console.error('Error:', error);
                        toast.error(isRTL ? 'אירעה שגיאה בשליחת קורות החיים' : 'Error sending CV');
                      } finally {
                        setShowLoadingModal(false);
                        setShowSendCVModal(false);
                      }
                    }}
                    className="flex-1 px-6 py-4 bg-[#4754D6] text-white rounded-full font-medium hover:bg-[#3A45C0] transition-colors text-lg"
                  >
                    {isRTL ? 'יאללה' : "Let's Go"}
                  </button>
                  <button
                    onClick={() => setShowSendCVModal(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors text-lg"
                  >
                    {isRTL ? 'לא עכשיו' : 'Not Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <motion.div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Image
              src="/design/finish.svg"
              alt="Success"
              width={200}
              height={200}
              className="mx-auto"
              priority
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-[800px] mx-auto mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-600 mb-3">
              {isRTL ? 'סיימנו!' : 'We\'re Done!'}
            </h1>
            <h2 className="text-lg md:text-xl text-[#4754D6] font-medium mb-2">
              {isRTL ? 'קורות החיים שלך מוכנים' : 'Your CV is Ready'}
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              {isRTL 
                ? 'בחר מה תרצה לעשות עם קורות החיים שלך' 
                : 'Choose what you\'d like to do with your CV'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(features).map(([key, feature]) => (
              renderFeatureButton(key, feature)
            ))}
          </div>
        </motion.div>
      </div>

      {selectedFeature && (
        <UpgradePaymentModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          isRTL={isRTL}
          lang={lang}
          fromPackage={currentPackage}
          toPackage={selectedFeature.requiredPackage}
          feature={selectedFeature.feature}
          upgradedFeatures={selectedFeature.upgradedFeatures}
          upgradePrice={selectedFeature.upgradePrice}
        />
      )}

      <LoadingModal
        isOpen={showLoadingModal}
        lang={lang}
        dictionary={dictionary}
        action={isSuccess ? undefined : (
          currentAction === 'sendCV' ? 'send-cv' : 
          currentAction === 'interview' ? 'send-interview-request' : 
          currentAction === 'translate' ? 'translate-cv' : 
          'download-pdf'
        )}
        isSuccess={isSuccess}
      />
    </div>
  );
}