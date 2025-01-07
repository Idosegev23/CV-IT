'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/theme/ui/card';
import { Button } from '@/components/theme/ui/button';
import { Input } from '@/components/theme/ui/input';
import { 
  Calculator, 
  FileText,
  ChevronDown,
  Target,
  Wallet,
  HelpCircle,
  TrendingUp,
  Menu,
  X,
  DollarSign,
  PiggyBank,
  Receipt
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
    id: 'basics',
    icon: Target,
    title: {
      he: 'איך לפענח את המספרים',
      en: 'Understanding the Numbers'
    },
    shortDesc: {
      he: 'מה כל מספר אומר לנו בתלוש?',
      en: 'How to read your payslip correctly'
    },
    content: {
      he: [
        'מרכיבי השכר הבסיסיים:',
        '• שכר בסיס - השכר הקבוע שסוכם איתכם',
        '• שעות נוספות - תשלום עבור שעות מעבר למשרה מלאה',
        '• החזרי הוצאות - נסיעות, אשל, טלפון וכו׳',
        '• תוספות קבועות - ותק, מקצועיות, תואר',
        '',
        'ניכויי חובה:',
        '• מס הכנסה - לפי מדרגות המס',
        '• ביטוח לאומי - ביטוח חובה של המדינה',
        '• ביטוח בריאות - מס בריאות ממלכתי',
        '',
        'הפרשות סוציאליות:',
        '• קרן פנסיה - חיסכון לגיל פרישה',
        '• קרן השתלמות - חיסכון לטווח בינוני',
        '• ביטוח מנהלים - תוכנית פנסיונית נוספת'
      ],
      en: [
        'Basic Salary Components:',
        '• Base Salary - Your agreed fixed salary',
        '• Overtime - Payment for extra hours',
        '• Expense Returns - Travel, per diem, phone etc.',
        '• Fixed Additions - Seniority, expertise, degree',
        '',
        'Mandatory Deductions:',
        '• Income Tax - According to tax brackets',
        '• National Insurance - State mandatory insurance',
        '• Health Insurance - National health tax',
        '',
        'Social Benefits:',
        '• Pension Fund - Retirement savings',
        '• Study Fund - Medium-term savings',
        '• Managers Insurance - Additional pension plan'
      ]
    },
    examples: {
      he: [
        '💡 שכר ברוטו = כל התשלומים לפני ניכויים',
        '💰 שכר נטו = מה שנכנס לחשבון בפועל',
        '📊 ההפרש ביניהם = כל הניכויים וההפרשות'
      ],
      en: [
        '💡 Gross Salary = All payments before deductions',
        '💰 Net Salary = What actually enters your account',
        '📊 The difference = All deductions and allocations'
      ]
    }
  },
  {
    id: 'rights',
    icon: FileText,
    title: {
      he: 'הזכויות שחייבים להכיר',
      en: 'Must-Know Rights'
    },
    shortDesc: {
      he: 'מה מגיע לכם על פי חוק?',
      en: 'What are you entitled to by law?'
    },
    content: {
      he: [
        'זכויות בסיסיות:',
        '• שכר מינימום - 5,300₪ למשרה מלאה',
        '• דמי הבראה - תשלום שנתי לפי ותק',
        '• דמי חגים - תשלום מלא בחגים',
        '• נסיעות - החזר הוצאות נסיעה לעבודה',
        '',
        'ימי חופשה ומחלה:',
        '• מינימום 12 ימי חופשה בשנה',
        '• צבירת 1.5 ימי מחלה לחודש',
        '• תשלום על ימי מחלה מהיום הראשון',
        '',
        'זכויות נוספות:',
        '• שעות נוספות - תוספת של 125%-150%',
        '• עבודה בשבת/חג - תוספת של 150%',
        '• הודעה מוקדמת - לפחות חודש מראש'
      ],
      en: [
        'Basic Rights:',
        '• Minimum Wage - 5,300₪ for full-time',
        '• Recovery Pay - Annual payment by seniority',
        '• Holiday Pay - Full payment on holidays',
        '• Travel - Work travel expense returns',
        '',
        'Vacation and Sick Days:',
        '• Minimum 12 vacation days per year',
        '• 1.5 sick days accrual per month',
        '• Payment from first sick day',
        '',
        'Additional Rights:',
        '• Overtime - 125%-150% addition',
        '• Weekend/Holiday Work - 150% addition',
        '• Prior Notice - At least one month'
      ]
    },
    examples: {
      he: [
        '⚖️ המעסיק חייב לתת תלוש כל חודש',
        '📅 ימי החופשה עולים עם הוותק',
        '🏥 ימי מחלה לא פוקעים לעולם'
      ],
      en: [
        '⚖️ Employer must provide monthly payslip',
        '📅 Vacation days increase with seniority',
        '🏥 Sick days never expire'
      ]
    }
  },
  {
    id: 'tips',
    icon: TrendingUp,
    title: {
      he: 'טיפים לבדיקת התלוש',
      en: 'Payslip Check Tips'
    },
    shortDesc: {
      he: 'איך לוודא שהכל תקין?',
      en: 'How to verify everything is correct?'
    },
    content: {
      he: [
        'בדיקה חודשית:',
        '• השוואה לחודש קודם - האם יש שינויים?',
        '• בדיקת שעות העבודה - האם נספרו נכון?',
        '• חישוב שעות נוספות - האם התעריף נכון?',
        '',
        'בדיקה שנתית:',
        '• דמי הבראה - האם שולמו?',
        '• ימי חופשה - כמה נוצלו וכמה נשארו?',
        '• בונוסים - האם התקבלו כמובטח?',
        '',
        'נקודות חשובות:',
        '• לשמור את כל התלושים',
        '• לתעד שעות עבודה באופן עצמאי',
        '• לבקש הסבר על כל סעיף לא ברור'
      ],
      en: [
        'Monthly Check:',
        '• Compare to previous month - Any changes?',
        '• Check work hours - Counted correctly?',
        '• Overtime calculation - Correct rate?',
        '',
        'Annual Check:',
        '• Recovery pay - Was it paid?',
        '• Vacation days - Used and remaining?',
        '• Bonuses - Received as promised?',
        '',
        'Important Points:',
        '• Keep all payslips',
        '• Track work hours independently',
        '• Ask for clarification on unclear items'
      ]
    },
    examples: {
      he: [
        '🔍 לבדוק את התלוש ביום קבלתו',
        '📱 להשתמש באפליקציה לתיעוד שעות',
        '📝 לשמור תכתובות על הבטחות שכר'
      ],
      en: [
        '🔍 Check payslip on receipt day',
        '📱 Use an app to track hours',
        '📝 Keep records of salary promises'
      ]
    }
  },
  {
    id: 'tax',
    icon: DollarSign,
    title: {
      he: 'מיסים והטבות מס',
      en: 'Taxes and Tax Benefits'
    },
    shortDesc: {
      he: 'איך לשלם פחות מס באופן חוקי',
      en: 'How to legally pay less tax'
    },
    content: {
      he: [
        'נקודות זיכוי:',
        '• 2.25 נקודות לכל תושב ישראל',
        '• נקודה נוספת לאקדמאים',
        '• נקודות נוספות להורים',
        '',
        'הטבות מס נפוצות:',
        '• הפקדות לפנסיה',
        '• קרן השתלמות',
        '• תרומות למוסדות מוכרים',
        '',
        'מדרגות מס:',
        '• 10% על ההכנסה הראשונה',
        '• עולה בהדרגה עד 50%',
        '• יש לבדוק עדכונים שנתיים'
      ],
      en: [
        'Tax Credits:',
        '• 2.25 points for every Israeli resident',
        '• Additional point for academics',
        '• Extra points for parents',
        '',
        'Common Tax Benefits:',
        '• Pension deposits',
        '• Study fund',
        '• Donations to recognized institutions',
        '',
        'Tax Brackets:',
        '• 10% on first income level',
        '• Gradually increases to 50%',
        '• Check yearly updates'
      ]
    },
    examples: {
      he: [
        '💰 כל נקודת זיכוי = 235₪ בחודש',
        '📊 חשוב לתכנן את ההטבות מראש',
        '✅ אפשר לבקש החזרי מס רטרואקטיבית'
      ],
      en: [
        '💰 Each tax credit point = 235₪ monthly',
        '📊 Important to plan benefits in advance',
        '✅ Can request tax returns retroactively'
      ]
    }
  },
  {
    id: 'problems',
    icon: HelpCircle,
    title: {
      he: 'פתרון בעיות',
      en: 'Problem Solving'
    },
    shortDesc: {
      he: 'מה עושים כשמשהו לא בסדר?',
      en: 'What to do when something\'s wrong?'
    },
    content: {
      he: [
        'צעדים ראשונים:',
        '• לתעד את הבעיה בכתב',
        '• לאסוף הוכחות (תלושים, מיילים)',
        '• לבדוק את החוק והזכויות',
        '',
        'למי לפנות:',
        '1. מנהל ישיר',
        '2. משאבי אנוש',
        '3. ממונה על זכויות עובדים',
        '4. התייעצות עם עו"ד',
        '',
        'זכויות בסיסיות בסכסוך:',
        '• אסור לפטר בגלל תלונה',
        '• זכות לייצוג משפטי',
        '• אפשרות לפנות לבית הדין לעבודה'
      ],
      en: [
        'First Steps:',
        '• Document the problem in writing',
        '• Gather evidence (payslips, emails)',
        '• Check laws and rights',
        '',
        'Who to Contact:',
        '1. Direct manager',
        '2. HR department',
        '3. Employee rights commissioner',
        '4. Consult with lawyer',
        '',
        'Basic Rights in Dispute:',
        '• Can\'t be fired for complaining',
        '• Right to legal representation',
        '• Can appeal to labor court'
      ]
    },
    examples: {
      he: [
        '📝 לשמור תיעוד של כל השיחות',
        '⚖️ יש התיישנות של 7 שנים על תביעות',
        '💼 כדאי להתייעץ עם איגוד מקצועי'
      ],
      en: [
        '📝 Keep record of all conversations',
        '⚖️ 7-year statute of limitations',
        '💼 Consider consulting professional union'
      ]
    }
  }
];

export default function SalaryGuide({ lang = 'he' }: { lang?: 'he' | 'en' }) {
  const [activeTab, setActiveTab] = useState('basics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [salary, setSalary] = useState('');
  const [isGrossToNet, setIsGrossToNet] = useState(true);
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);
  
  const isRTL = lang === 'he';

  const handleKeyPress = (e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(sectionId);
    }
  };

  const calculateSalary = () => {
    const salaryNum = parseFloat(salary);
    if (!salaryNum) return;

    if (isGrossToNet) {
      // חישוב משוער של שכר נטו
      const estimatedNet = salaryNum * 0.75; // הערכה גסה של 25% ניכויים
      setCalculatedResult(Math.round(estimatedNet));
    } else {
      // חישוב משוער של שכר ברוטו
      const estimatedGross = salaryNum / 0.75; // הערכה גסה של 25% ניכויים
      setCalculatedResult(Math.round(estimatedGross));
    }
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
            <h1 className="text-2xl md:text-4xl font-bold text-[#4754D7]">
              {isRTL ? 'תלוש המשכורת - פשוט ולעניין' : 'The Complete Salary Slip Guide'}
            </h1>
            <p className="text-sm md:text-lg text-gray-600">
              {isRTL ? 'כל מה שצריך לדעת על התלוש שלך' : 'Let\'s understand every line in your payslip'}
            </p>
          </motion.div>

          <div className="md:hidden mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="font-medium">
                {activeSection?.title[lang]}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'transform rotate-180' : ''}`} />
            </button>
            
            {isMobileMenuOpen && (
              <div className="absolute z-[9999] mt-2 w-[calc(100%-2rem)] bg-white rounded-xl shadow-lg border border-gray-100">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveTab(section.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-4 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
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
                    >
                      <section.icon className="w-5 h-5" />
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
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row items-start gap-4">
                        <div className="p-2 rounded-xl bg-[#4754D7]/5 flex-shrink-0">
                          <activeSection.icon className="w-6 h-6 text-[#4754D7]" />
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
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <button
                    onClick={() => setShowCalculator(true)}
                    className="w-full flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#4754D7]/5 flex items-center justify-center">
                      <Calculator className="w-8 h-8 md:w-10 md:h-10 text-[#4754D7]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isRTL ? 'מחשבון ברוטו-נטו' : 'Gross/Net Calculator'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {isRTL ? 'רוצה לדעת כמה יישאר בארנק?' : 'Calculate your take-home pay'}
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
                setCalculatedResult(null);
                setSalary('');
              }}
              className="fixed inset-0 bg-black/20 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-[999] p-4"
            >
              <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      {isRTL ? 'מחשבון ברוטו-נטו' : 'Gross/Net Calculator'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCalculator(false);
                        setCalculatedResult(null);
                        setSalary('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">
                        {isRTL ? 'סוג חישוב' : 'Calculation Type'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsGrossToNet(true)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            isGrossToNet
                              ? 'border-[#4754D7] bg-[#4754D7]/5 text-[#4754D7]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {isRTL ? 'ברוטו ➜ נטו' : 'Gross ➜ Net'}
                        </button>
                        <button
                          onClick={() => setIsGrossToNet(false)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            !isGrossToNet
                              ? 'border-[#4754D7] bg-[#4754D7]/5 text-[#4754D7]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {isRTL ? 'נטו ➜ ברוטו' : 'Net ➜ Gross'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="salary" className="block mb-2 font-medium text-gray-700">
                        {isRTL ? 'הכנס משכורת' : 'Enter Salary'}
                      </label>
                      <div className="relative">
                        <Input
                          id="salary"
                          type="number"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                          className="h-[50px] pr-12 rounded-xl border-gray-200 focus:border-[#4754D7] focus:ring-2 focus:ring-[#4754D7]/20"
                          placeholder={isRTL ? 'למשל: 10000' : 'Example: 10000'}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₪</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={calculateSalary}
                    disabled={!salary}
                    className="w-full h-[50px] bg-[#4754D7] text-white hover:bg-[#3A45B0] rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRTL ? 'חשב' : 'Calculate'}
                  </Button>

                  {calculatedResult !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 rounded-xl text-center"
                    >
                      <p className="text-sm text-gray-600 mb-1">
                        {isGrossToNet
                          ? isRTL ? 'המשכורת נטו המשוערת שלך:' : 'Your estimated net salary:'
                          : isRTL ? 'המשכורת ברוטו המשוערת שלך:' : 'Your estimated gross salary:'}
                      </p>
                      <p className="text-2xl font-bold text-[#4754D7]">
                        {calculatedResult.toLocaleString()}₪
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {isRTL
                          ? '* זהו חישוב משוער בלבד, התוצאה הסופית תלויה בגורמים נוספים'
                          : '* This is an estimate only, final result depends on additional factors'}
                      </p>
                    </motion.div>
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