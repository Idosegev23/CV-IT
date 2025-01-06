'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/theme/ui/card';
import { Button } from '@/components/theme/ui/button';
import { Input } from '@/components/theme/ui/input';
import { 
  Calculator, 
  PiggyBank, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Target,
  Wallet,
  FileText,
  HelpCircle,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

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
    id: 'why',
    icon: Target,
    title: {
      he: 'למה בכלל צריך פנסיה?',
      en: 'Why do I need pension?'
    },
    shortDesc: {
      he: 'תכלס, למה לחשוב על זה עכשיו? 🤔',
      en: 'Why should we think about it now? 🤔'
    },
    content: {
      he: [
        'זה כמו נטפליקס של העתיד - משלמים קצת כל חודש, ובסוף מקבלים המון! 🎬',
        'המדינה נותנת לך הטבות מס מטורפות על זה 💰',
        'מקבלים ביטוחים שווים בחינם 🛡️',
        'הכסף עובד בשבילך - כמו להיות הבוס של הכסף שלך! 💪',
        'קצבת הזקנה מביטוח לאומי ממש נמוכה - אי אפשר לחיות מזה 😬'
      ],
      en: [
        'It\'s like Netflix for your future - pay a bit monthly, get a lot in return! 🎬',
        'The government gives you amazing tax benefits 💰',
        'You get valuable insurance coverage for free 🛡️',
        'Your money works for you - be the boss of your money! 💪',
        'Social security pension is very low - you can\'t live off it 😬'
      ]
    },
    examples: {
      he: [
        '💡 על משכורת של 10,000₪, רק 600₪ יוצאים מהכיס שלך!',
        '🎮 זה כמו לצבור XP למשחק של החיים',
        '🚀 בגיל 67 יכול להיות לך מיליונים בחשבון!',
        '💸 קצבת זקנה מביטוח לאומי היא רק כ-2,000₪ בחודש'
      ],
      en: [
        '💡 On a 10,000₪ salary, only 600₪ comes from your pocket!',
        '🎮 It\'s like gaining XP for the game of life',
        '🚀 By age 67, you could have millions in your account!',
        '💸 Social security pension is only about 2,000₪ monthly'
      ]
    }
  },
  {
    id: 'how',
    icon: Wallet,
    title: {
      he: 'איך זה עובד?',
      en: 'How does it work?'
    },
    shortDesc: {
      he: ' נפרק את זה לחתיכות קטנות 🧩',
      en: 'Let\'s break it down 🧩'
    },
    content: {
      he: [
        'כל חודש מפרישים חלק מהמשכורת לפנסיה:',
        '• 6% מופרשים מהמשכורת שלך',
        '• 6.5% המעסיק מוסיף מעבר למשכורת',
        '• 8.33% המעסיק מפריש לפיצויים',
        '',
        'הכסף מושקע בשוק ההון:',
        '• הקרן משקיעה את הכסף במניות ואגרות חוב',
        '• הרווחים מצטרפים לחיסכון שלך',
        '• אפשר לבחור מסלול השקעה שמתאים לך'
      ],
      en: [
        'Monthly pension contributions:',
        '• 6% from your salary',
        '• 6.5% extra from employer',
        '• 8.33% for severance pay',
        '',
        'The money is invested:',
        '• The fund invests in stocks and bonds',
        '• Profits are added to your savings',
        '• You can choose your investment track'
      ]
    },
    examples: {
      he: [
        '🎯 על משכורת של 10,000₪ נחסכים 2,083₪ בחודש',
        '💰 רוב הכסף (1,483₪) מגיע מהמעסיק!',
        '📈 בממוצע החיסכון גדל ב-4% בשנה'
      ],
      en: [
        '🎯 On 10,000₪ salary, 2,083₪ is saved monthly',
        '💰 Most money (1,483₪) comes from employer!',
        '📈 On average, savings grow 4% yearly'
      ]
    }
  },
  {
    id: 'types',
    icon: FileText,
    title: {
      he: 'סוגי קרנות פנסיה',
      en: 'Pension Fund Types'
    },
    shortDesc: {
      he: 'איזו קרן הכי מתאימה לך? 🤓',
      en: 'Which fund suits you best? 🤓'
    },
    content: {
      he: [
        '1. קרן פנסיה מקיפה:',
        '• הכי פופולרית בישראל',
        '• כוללת ביטוח חיים ונכות',
        '• דמי ניהול נמוכים יחסית',
        '• מתאימה לרוב האנשים',
        '',
        '2. ביטוח מנהלים:',
        '• יותר גמיש בכיסויים הביטוחיים',
        '• דמי ניהול גבוהים יותר',
        '• אפשרות לקצבה מובטחת',
        '',
        '3. קרן פנסיה כללית:',
        '• למי שמרוויח מעל התקרה',
        '• אין ביטוחים נלווים',
        '• דמי ניהול נמוכים'
      ],
      en: [
        '1. Comprehensive Pension Fund:',
        '• Most popular in Israel',
        '• Includes life and disability insurance',
        '• Relatively low management fees',
        '• Suitable for most people',
        '',
        '2. Managers Insurance:',
        '• More flexible insurance coverage',
        '• Higher management fees',
        '• Option for guaranteed pension',
        '',
        '3. General Pension Fund:',
        '• For high earners',
        '• No additional insurance',
        '• Low management fees'
      ]
    },
    examples: {
      he: [
        '💡 90% מהשכירים בישראל בקרן פנסיה מקיפה',
        '💰 דמי ניהול בקרן מקיפה: עד 0.5% מהצבירה',
        '📊 ביטוח מנהלים מתאים למי שמרוויח מעל 25,000₪'
      ],
      en: [
        '💡 90% of employees in Israel use comprehensive funds',
        '💰 Management fees: up to 0.5% of savings',
        '📊 Managers insurance suits 25,000₪+ earners'
      ]
    }
  },
  {
    id: 'investment',
    icon: TrendingUp,
    title: {
      he: 'מסלולי השקעה',
      en: 'Investment Tracks'
    },
    shortDesc: {
      he: 'איך הכסף שלך מושקע? 📈',
      en: 'How is your money invested? 📈'
    },
    content: {
      he: [
        'מסלול לפי גיל (ברירת מחדל):',
        '• עד גיל 50: מסלול אגרסיבי (60% מניות)',
        '• גיל 50-60: מסלול מאוזן (40% מניות)',
        '• מעל 60: מסלול סולידי (20% מניות)',
        '',
        'מסלולי מיוחדים:',
        '• מסלול מניות (75% מניות ומעלה)',
        '• מסלול אג"ח (בעיקר אגרות חוב)',
        '• מסלול הלכתי (לפי ההלכה היהודית)',
        '',
        'איך לבחור?',
        '• גיל צעיר = יותר סיכון = פוטנציאל לרווח גבוה יותר',
        '• גיל מבוגר = פחות סיכון = שמירה על הכסף'
      ],
      en: [
        'Age-based track (default):',
        '• Until 50: Aggressive (60% stocks)',
        '• 50-60: Balanced (40% stocks)',
        '• Over 60: Conservative (20% stocks)',
        '',
        'Special tracks:',
        '• Stock track (75%+ stocks)',
        '• Bond track (mostly bonds)',
        '• Religious track (follows Jewish law)',
        '',
        'How to choose?',
        '• Young age = more risk = higher potential returns',
        '• Older age = less risk = capital preservation'
      ]
    },
    examples: {
      he: [
        '🎯 בגיל 30 כדאי מסלול אגרסיבי - יש זמן להתאושש מירידות',
        '💰 מסלול מניות יכול להניב 8%-6% בשנה בממוצע',
        '📊 מסלול אג"ח מניב 3%-2% בשנה בממוצע'
      ],
      en: [
        '🎯 At 30, aggressive track is recommended - time to recover',
        '💰 Stock track can yield 6-8% annually on average',
        '📊 Bond track yields 2-3% annually on average'
      ]
    }
  },
  {
    id: 'rights',
    icon: HelpCircle,
    title: {
      he: 'זכויות חשובות',
      en: 'Important Rights'
    },
    shortDesc: {
      he: 'מה מגיע לך? 📋',
      en: 'What are you entitled to? 📋'
    },
    content: {
      he: [
        'זכויות בסיסיות:',
        '• חובת הפרשה מהיום הראשון לעבודה',
        '• אסור למעסיק להתנות על זה',
        '• זכות לבחור כל קרן שתרצה',
        '',
        'ביטוחים כלולים:',
        '• ביטוח חיים למקרה פטירה',
        '• ביטוח נכות למקרה של אובדן כושר עבודה',
        '• פנסיית שארים למשפחה',
        '',
        'בהחלפת עבודה:',
        '• הזכויות נשמרות',
        '• אפשר לנייד לקרן אחרת',
        '• כדאי לאחד קרנות ישנות'
      ],
      en: [
        'Basic rights:',
        '• Mandatory pension from day one',
        '• Employer cannot condition this',
        '• Right to choose any fund',
        '',
        'Included insurance:',
        '• Life insurance',
        '• Disability insurance',
        '• Family pension',
        '',
        'When changing jobs:',
        '• Rights are preserved',
        '• Can transfer to another fund',
        '• Consider consolidating old funds'
      ]
    },
    examples: {
      he: [
        '⚖️ מעסיק שלא מפריש עובר על החוק',
        '🛡️ הביטוחים שווים אלפי שקלים בחודש',
        '💼 איחוד קרנות חוסך בדמי ניהול'
      ],
      en: [
        '⚖️ Not contributing is illegal for employers',
        '🛡️ Insurance worth thousands monthly',
        '💼 Consolidating funds saves on fees'
      ]
    }
  }
];

export default function PensionGuide({ lang = 'he' }: { lang?: 'he' | 'en' }) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [salary, setSalary] = useState('');
  const [age, setAge] = useState('');
  const [activeTab, setActiveTab] = useState('why');
  const [showResults, setShowResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isRTL = lang === 'he';
  
  const handleKeyPress = (e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(sectionId);
    }
  };

  const calculatePension = () => {
    const monthlySalary = parseFloat(salary);
    const currentAge = parseFloat(age);
    
    if (!monthlySalary || !currentAge) return 0;
    
    const yearsUntilRetirement = 67 - currentAge;
    const monthlyDeposit = monthlySalary * 0.185;
    const estimatedReturn = 0.04;
    
    let totalSavings = 0;
    for (let i = 0; i < yearsUntilRetirement; i++) {
      totalSavings += monthlyDeposit * 12;
      totalSavings *= (1 + estimatedReturn);
    }
    
    return Math.round(totalSavings / 200);
  };

  const getAffordableItems = (monthlyPension: number) => {
    return [
      {
        title: isRTL ? 'דירה להשכרה' : 'Rental Apartment',
        description: isRTL 
          ? `דירת 3 חדרים באזור המרכז (${Math.floor(monthlyPension * 0.4).toLocaleString()}₪ לחודש)`
          : `3-room apartment in central area (${Math.floor(monthlyPension * 0.4).toLocaleString()}₪ monthly)`,
        icon: '🏠',
        percentage: 40
      },
      {
        title: isRTL ? 'הוצאות מיה' : 'Living Expenses',
        description: isRTL 
          ? `אוכל, חשבונות וקניות (${Math.floor(monthlyPension * 0.3).toLocaleString()}₪ לחודש)`
          : `Food, bills and shopping (${Math.floor(monthlyPension * 0.3).toLocaleString()}₪ monthly)`,
        icon: '🛒',
        percentage: 30
      },
      {
        title: isRTL ? 'בילויים ופנאי' : 'Entertainment',
        description: isRTL 
          ? `מסעדות, טיולים ותחביבים (${Math.floor(monthlyPension * 0.15).toLocaleString()}₪ לחודש)`
          : `Restaurants, trips and hobbies (${Math.floor(monthlyPension * 0.15).toLocaleString()}₪ monthly)`,
        icon: '🎭',
        percentage: 15
      },
      {
        title: isRTL ? 'בריאות' : 'Healthcare',
        description: isRTL 
          ? `ביטוח בריאות ותרופות (${Math.floor(monthlyPension * 0.1).toLocaleString()}₪ לחודש)`
          : `Health insurance and medicine (${Math.floor(monthlyPension * 0.1).toLocaleString()}₪ monthly)`,
        icon: '⚕️',
        percentage: 10
      },
      {
        title: isRTL ? 'חיסכון' : 'Savings',
        description: isRTL 
          ? `לחירום ולהנאות (${Math.floor(monthlyPension * 0.05).toLocaleString()}₪ לחודש)`
          : `For emergencies and pleasures (${Math.floor(monthlyPension * 0.05).toLocaleString()}₪ monthly)`,
        icon: '💰',
        percentage: 5
      }
    ];
  };

  const activeSection = sections.find(section => section.id === activeTab);

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
              {isRTL ? 'המדריך הכי פשוט לפנסיה 🚀' : 'The Simplest Pension Guide 🚀'}
            </h1>
            <p className="text-sm md:text-lg text-gray-600">
              {isRTL ? 'בלי מילים מסובכות, בלי בלבול - רק מה שצריך לדעת' : 'No complicated words, no confusion - just what you need to know'}
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

          <div className="grid md:grid-cols-[1fr_300px] gap-6 max-w-[1200px] mx-auto">
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
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
                >
                  <button
                    onClick={() => setShowCalculator(true)}
                    className="w-full flex flex-col items-center gap-4"
                    aria-label={isRTL ? "פתח מחשבון פנסיה" : "Open pension calculator"}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#4754D7]/5 flex items-center justify-center">
                      <Calculator className="w-8 h-8 md:w-10 md:h-10 text-[#4754D7]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isRTL ? 'מחשבון פנסיה' : 'Pension Calculator'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {isRTL ? ' מחשבים כמה כסף יהיה לך בפנסיה ' : 'Let\'s calculate your future pension'}
                      </p>
                    </div>
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCalculator && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCalculator(false);
                setShowResults(false);
                setSalary('');
                setAge('');
              }}
              className="fixed inset-0 bg-black/20 z-40"
              aria-hidden="true"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-[999] p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="calculator-title"
            >
              <div className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
                <div className="sticky top-0 bg-white px-4 md:px-6 py-4 border-b border-gray-100 text-center">
                  <div className="flex justify-between items-center">
                    <div className="w-6" />
                    <h3 id="calculator-title" className="text-xl md:text-2xl font-bold text-gray-900">
                      {isRTL ? 'מחשבון פנסיה' : 'Pension Calculator'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCalculator(false);
                        setShowResults(false);
                        setSalary('');
                        setAge('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label={isRTL ? "סגור מחשבון" : "Close calculator"}
                    >
                      <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  {!showResults ? (
                    <div className="max-w-[500px] mx-auto space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="salary" className="block mb-2 font-medium text-gray-700 text-center">
                            {isRTL ? 'מה המשכורת החודשית שלך? (ברוטו) 💰' : 'What\'s your monthly salary? (gross) 💰'}
                          </label>
                          <Input
                            id="salary"
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder={isRTL ? 'למשל: 8000' : 'Example: 8000'}
                            className="h-[50px] rounded-xl border border-gray-200 focus:border-[#4754D7] focus:ring-2 focus:ring-[#4754D7]/20 text-center"
                            aria-label={isRTL ? "משכורת חודשית" : "Monthly salary"}
                          />
                        </div>
                        <div>
                          <label htmlFor="age" className="block mb-2 font-medium text-gray-700 text-center">
                            {isRTL ? 'מה הגיל שלך? 🎂' : 'How old are you? 🎂'}
                          </label>
                          <Input
                            id="age"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder={isRTL ? 'למשל: 25' : 'Example: 25'}
                            className="h-[50px] rounded-xl border border-gray-200 focus:border-[#4754D7] focus:ring-2 focus:ring-[#4754D7]/20 text-center"
                            aria-label={isRTL ? "גיל" : "Age"}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          if (salary && age) {
                            setShowResults(true);
                          }
                        }}
                        disabled={!salary || !age}
                        className="w-full h-[50px] bg-[#4754D7] text-white hover:bg-[#3A45B0] rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={isRTL ? "חשב פנסיה" : "Calculate pension"}
                      >
                        {isRTL ? ' שנראה מה אפשר לעשות עם הכסף! 🚀' : 'Let\'s see what you can do with the money! 🚀'}
                      </Button>
                    </div>
                  ) : (
                    <div className="max-w-[600px] mx-auto space-y-8">
                      <div className="text-center">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {isRTL ? 'וואו! הנה מה שצפוי לך: 🎯' : 'Wow! Here\'s what you can expect: 🎯'}
                        </h4>
                        <p className="text-4xl font-bold text-[#4754D7]">
                          {calculatePension().toLocaleString()}₪ <span className="text-base font-normal text-gray-600">{isRTL ? 'בחודש' : 'monthly'}</span>
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                          {isRTL ? 'הנה מה שתוכל לעשות עם הכסף:' : 'Here\'s what you can do with the money:'}
                        </h4>
                        <div className="grid gap-4">
                          {getAffordableItems(calculatePension()).map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-gray-50 rounded-xl p-4"
                            >
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{item.icon}</div>
                                <div className="flex-grow">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-semibold text-gray-900">{item.title}</h5>
                                    <span className="text-sm font-medium text-[#4754D7]">{item.percentage}%</span>
                                  </div>
                                  <p className="text-gray-600 text-sm">{item.description}</p>
                                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.percentage}%` }}
                                      transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                      className="h-full bg-[#4754D7]"
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500">
                          {isRTL ? 
                            '* זו הערכה כללית בלבד. התוצאה והחלוקה המוצעת יכולות להשתנות בהתאם לגורמים רבים ולסגנון החיים שלך.' :
                            '* This is a general estimate only. Results and suggested allocation may vary based on many factors and your lifestyle.'}
                        </p>
                        <Button
                          onClick={() => setShowResults(false)}
                          className="mt-4 px-6 h-[40px] bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-medium"
                        >
                          {isRTL ? 'חישוב מחדש 🔄' : 'Recalculate 🔄'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 