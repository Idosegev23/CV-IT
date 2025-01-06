'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/theme/ui/card';
import { Button } from '@/components/theme/ui/button';
import { Input } from '@/components/theme/ui/input';
import { 
  Target, 
  User,
  FileText,
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
  Share2,
  MessageCircle,
  Users,
  Sparkles,
  Copy,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { generateLinkedInContent } from '@/lib/openai';
import ContentCreatorDialog from '@/components/ContentCreatorDialog';

interface Section {
  id: string;
  icon: React.ElementType;
  title: {
    he: string;
    en: string;
  };
  shortDesc: {
    he: string;
    en: string;
  };
  content: {
    he: string[];
    en: string[];
  };
  examples: {
    he: string[];
    en: string[];
  };
}

const sections: Section[] = [
  {
    id: 'basics',
    icon: Target,
    title: {
      he: 'למה לינקדאין זה כזה חשוב?',
      en: 'Why is LinkedIn so important?'
    },
    shortDesc: {
      he: 'בואו נבין למה כולם מדברים על זה',
      en: 'Let\'s understand the hype'
    },
    content: {
      he: [
        'זה כמו קורות חיים שעובדים בשבילנו 24/7',
        'מגייסים מחפשים פה מועמדים באופן אקטיבי',
        'אפשר ליצור קשרים מקצועיים בקלות',
        'זו הדרך הכי טובה להישאר מעודכנים בתעשייה',
        'אפשר למצוא פה המון הזדמנויות קריירה'
      ],
      en: [
        'It\'s like a CV that works for you 24/7',
        'Recruiters actively search for candidates here',
        'Easy professional networking',
        'Best way to stay updated in the industry',
        'Find tons of career opportunities'
      ]
    },
    examples: {
      he: [
        'פרופיל טוב יכול להביא הצעות עבודה גם כשאנחנו ישנים',
        'קל לבלוט מול מגייסים ומנהלים',
        'אפשר להתחבר לאנשים מעניינים בתחום שלנו'
      ],
      en: [
        'A good profile can bring job offers while you sleep',
        'Stand out to recruiters and managers',
        'Connect with interesting people in your field'
      ]
    }
  },
  {
    id: 'profile',
    icon: User,
    title: {
      he: 'איך בונים פרופיל מנצח?',
      en: 'How to build a winning profile?'
    },
    shortDesc: {
      he: 'הטיפים שיהפכו את הפרופיל למגנט',
      en: 'Tips to make your profile magnetic'
    },
    content: {
      he: [
        'תמונת פרופיל מקצועית:',
        '• רקע נקי ותאורה טובה',
        '• חיוך נעים ולבוש מתאים',
        '• תמונת כותרת שמשדרת מקצועיות',
        '',
        'כותרת שמושכת תשומת לב:',
        '• לכתוב את התפקיד הנוכחי או המבוקש',
        '• להוסיף מילות מפתח רלוונטיות',
        '• לשלב את תחומי המומחיות שלנו'
      ],
      en: [
        'Professional profile picture:',
        '• Clean background and good lighting',
        '• Nice smile and appropriate attire',
        '• Professional banner image',
        '',
        'Attention-grabbing headline:',
        '• Write current or desired role',
        '• Add relevant keywords',
        '• Include areas of expertise'
      ]
    },
    examples: {
      he: [
        'במקום "מחפשים עבודה" - "מפתחי Full Stack עם התמחות ב-React"',
        'במקום רק תפקיד - להוסיף את התשוקה והערך המוסף שלנו',
        'לשלב מילות מפתח שמגייסים מחפשים'
      ],
      en: [
        'Instead of "Looking for a job" - "Full Stack Developer specializing in React"',
        'Add your passion and value proposition',
        'Include keywords that recruiters search for'
      ]
    }
  },
  {
    id: 'content',
    icon: FileText,
    title: {
      he: 'איך יוצרים תוכן שעובד?',
      en: 'How to create engaging content?'
    },
    shortDesc: {
      he: 'תוכן טוב = הזדמנויות טובות',
      en: 'Good content = Good opportunities'
    },
    content: {
      he: [
        'פוסטים מעניינים:',
        '• לשתף טיפים מקצועיים',
        '• לספר על פרויקטים מעניינים',
        '• להראות את הצד האנושי שלנו',
        '',
        'תגובות חכמות:',
        '• להוסיף ערך לדיונים',
        '• לשתף מהניסיון שלנו',
        '• לעזור לאחרים בתחום'
      ],
      en: [
        'Interesting posts:',
        '• Share professional tips',
        '• Talk about interesting projects',
        '• Show your human side',
        '',
        'Smart comments:',
        '• Add value to discussions',
        '• Share from experience',
        '• Help others in the field'
      ]
    },
    examples: {
      he: [
        'לשתף תובנות מפרויקט שעבדנו עליו',
        'לכתוב על אתגר מקצועי שהתגברנו עליו',
        'להציע עזרה למתחילים בתחום'
      ],
      en: [
        'Share insights from a project you worked on',
        'Write about a professional challenge you overcame',
        'Offer help to beginners in the field'
      ]
    }
  },
  {
    id: 'networking',
    icon: Users,
    title: {
      he: 'איך עושים נטוורקינג נכון?',
      en: 'How to network effectively?'
    },
    shortDesc: {
      he: 'קשרים מקצועיים זה המפתח להצלחה',
      en: 'Professional connections are key to success'
    },
    content: {
      he: [
        'איך ליצור קשרים חדשים:',
        '• להתחבר לאנשים מהתחום שלנו',
        '• לעקוב אחרי חברות שמעניינות אותנו',
        '• להשתתף בקבוצות מקצועיות',
        '',
        'איך לשמור על קשר:',
        '• להגיב על פוסטים של אחרים',
        '• לשלוח הודעות אישיות קצרות',
        '• לברך על הישגים מקצועיים'
      ],
      en: [
        'How to create new connections:',
        '• Connect with people in your field',
        '• Follow companies of interest',
        '• Participate in professional groups',
        '',
        'How to maintain connections:',
        '• Engage with others\' posts',
        '• Send short personal messages',
        '• Congratulate on professional achievements'
      ]
    },
    examples: {
      he: [
        'להצטרף לקבוצות דיון בתחום שלנו',
        'לשתף ידע ולעזור לאחרים',
        'ליצור שיחות מקצועיות מעניינות'
      ],
      en: [
        'Join discussion groups in your field',
        'Share knowledge and help others',
        'Create interesting professional conversations'
      ]
    }
  }
];

export default function LinkedInGuide({ lang = 'he' }: { lang?: 'he' | 'en' }) {
  const [activeTab, setActiveTab] = useState('basics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<{ text: string; imageUrl: string | null }>({ text: '', imageUrl: null });
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = lang === 'he';
  
  const handleKeyPress = (e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(sectionId);
    }
  };

  const activeSection = sections.find(section => section.id === activeTab);

  const generateContent = async (userTopic?: string) => {
    setIsLoading(true);
    try {
      const content = await generateLinkedInContent(userTopic);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      // הצגת הודעת שגיאה למשתמש
      setGeneratedContent({ 
        text: 'מצטערים, אירעה שגיאה ביצירת התוכן. אנא נסו שוב.',
        imageUrl: null 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // אפשר להוסיף כאן הודעת הצלחה
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`min-h-screen bg-[#EAEAE7] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full py-4 px-4 md:py-8 md:px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-8"
          >
            <h1 className="text-2xl md:text-4xl font-bold text-[#4754D7]" role="heading" aria-level={1}>
              {isRTL ? 'המדריך המלא ללינקדאין' : 'The Complete LinkedIn Guide'}
            </h1>
            <p className="text-sm md:text-lg text-gray-600">
              {isRTL ? 'איך להפוך את הפרופיל למגנט של הצעות עבודה' : 'How to turn your profile into a job offer magnet'}
            </p>
          </motion.div>

          <div className="md:hidden mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="font-medium">
                {activeSection?.title[lang]}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'transform rotate-180' : ''}`} />
            </button>
            
            {isMobileMenuOpen && (
              <div
                id="mobile-menu"
                className="absolute z-[9999] mt-2 w-[calc(100%-2rem)] bg-white rounded-xl shadow-lg border border-gray-100"
              >
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveTab(section.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-4 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                    role="menuitem"
                    aria-current={activeTab === section.id}
                  >
                    <section.icon className="w-5 h-5" />
                    <span>{section.title[lang]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-[1fr_300px] gap-6">
            <div className="order-1 md:order-none">
              <div className="hidden md:block mb-6 overflow-x-auto">
                <div className="flex gap-2 min-w-max p-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      onKeyPress={(e) => handleKeyPress(e, section.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        activeTab === section.id
                          ? 'bg-[#4754D7] text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                      role="tab"
                      aria-selected={activeTab === section.id}
                      aria-controls={`panel-${section.id}`}
                      tabIndex={0}
                    >
                      <section.icon className="w-5 h-5" aria-hidden="true" />
                      <span className="font-medium whitespace-nowrap">{section.title[lang]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeSection && (
                  <motion.div
                    key={activeSection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    role="tabpanel"
                    id={`panel-${activeSection.id}`}
                    aria-labelledby={`tab-${activeSection.id}`}
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row items-start gap-4">
                        <div className="p-2 rounded-xl bg-[#4754D7]/5 flex-shrink-0">
                          <activeSection.icon className="w-6 h-6 text-[#4754D7]" aria-hidden="true" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {activeSection.title[lang]}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {activeSection.shortDesc[lang]}
                          </p>
                          <div className="space-y-3 text-gray-700">
                            {activeSection.content[lang].map((text, i) => (
                              <p key={i} className="leading-relaxed text-sm md:text-base">
                                {text}
                              </p>
                            ))}
                          </div>
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
                            {activeSection.examples[lang].map((example, i) => (
                              <p key={i} className="text-gray-600 text-sm md:text-base">
                                {example}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="order-none md:order-1">
              <div className="sticky top-4 space-y-4">
                <ContentCreatorDialog lang={lang} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 