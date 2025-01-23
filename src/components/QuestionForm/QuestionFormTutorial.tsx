import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { UserCircle2, FileText, Briefcase, GraduationCap, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionFormTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

interface TutorialStep {
  title: string;
  content: string;
  icon: React.ReactNode;
}

export function QuestionFormTutorial({ isOpen, onClose, language }: QuestionFormTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [exitPosition, setExitPosition] = useState({ x: 0, y: 0 });
  const isRTL = language === 'he';

  const steps: TutorialStep[] = [
    {
      title: isRTL ? 'ברוכים הבאים לשאלון קורות החיים' : 'Welcome to the CV Questionnaire',
      content: isRTL 
        ? 'אנחנו כאן כדי לעזור לך ליצור קורות חיים מקצועיים ומרשימים. בואו נראה איך זה עובד.'
        : 'We\'re here to help you create professional and impressive CV. Let\'s see how it works.',
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: isRTL ? 'דברו בחופשיות' : 'Speak Freely',
      content: isRTL
        ? 'אין צורך להתנסח בצורה מקצועית או פורמלית מדי. פשוט כתבו בשפה טבעית וחופשית - אנחנו נדאג לנסח את הכל בצורה מקצועית.'
        : 'No need to be overly professional or formal. Just write naturally - we\'ll take care of making it professional.',
      icon: <UserCircle2 className="w-5 h-5" />
    },
    {
      title: isRTL ? 'ניסיון תעסוקתי' : 'Work Experience',
      content: isRTL
        ? 'מומלץ להתמקד ב-3 המשרות האחרונות והמשמעותיות ביותר. אין צורך לפרט יותר מדי - אנחנו ניקח את המידע שתספקו ונבנה ממנו תוכן מרשים.'
        : 'Focus on your 3 most recent and significant positions. No need for too much detail - we\'ll build impressive content from what you provide.',
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      title: isRTL ? 'השכלה וכישורים' : 'Education & Skills',
      content: isRTL
        ? 'ציינו את ההשכלה והכישורים העיקריים שלכם. אל תדאגו לגבי הניסוח - אנחנו נדע להבליט את החוזקות שלכם בצורה המיטבית.'
        : 'List your main education and skills. Don\'t worry about phrasing - we\'ll highlight your strengths in the best way.',
      icon: <GraduationCap className="w-5 h-5" />
    },
    {
      title: isRTL ? 'מערכת חכמה' : 'Smart System',
      content: isRTL
        ? 'המערכת שלנו יודעת לקחת את המידע שתספקו ולהפוך אותו לקורות חיים מקצועיים. סמכו עלינו - אנחנו נדאג שהתוצאה תהיה מרשימה!'
        : 'Our system knows how to turn your information into a professional CV. Trust us - we\'ll make sure the result is impressive!',
      icon: <Star className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    const helpButton = document.querySelector('.help-button');
    if (helpButton) {
      const rect = helpButton.getBoundingClientRect();
      setExitPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    const helpButton = document.querySelector('.help-button');
    if (helpButton) {
      const rect = helpButton.getBoundingClientRect();
      setExitPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog 
          as="div"
          className="relative z-50"
          open={isOpen}
          onClose={handleClose}
          static
        >
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              />

              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl relative z-10">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{
                    scale: 0.3,
                    opacity: 0,
                    x: exitPosition.x - window.innerWidth / 2,
                    y: exitPosition.y - window.innerHeight / 2
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                >
                  <button
                    onClick={handleClose}
                    className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-4 p-1 rounded-full hover:bg-gray-100 transition-colors`}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>

                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'} pr-8`}
                  >
                    <span className="text-[#4856CD]">{steps[currentStep].icon}</span>
                    {steps[currentStep].title}
                  </Dialog.Title>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {steps[currentStep].content}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center gap-2">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentStep ? 'bg-[#4856CD] w-4' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <div className={`mt-6 flex ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-[#4856CD]/10 px-4 py-2 text-sm font-medium text-[#4856CD] hover:bg-[#4856CD]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4856CD] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                    >
                      {isRTL ? 'חזרה' : 'Back'}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-[#4856CD] px-4 py-2 text-sm font-medium text-white hover:bg-[#4856CD]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4856CD] focus-visible:ring-offset-2"
                      onClick={handleNext}
                    >
                      {currentStep === steps.length - 1 
                        ? (isRTL ? 'סיום' : 'Finish')
                        : (isRTL ? 'הבא' : 'Next')}
                    </button>
                  </div>
                </motion.div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 