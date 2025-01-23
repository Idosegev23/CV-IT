import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Edit2, Download, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CVTutorialStepsProps {
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  language: string;
  isPreviewMode?: boolean;
  onStepChange?: (highlightedElement: 'edit' | 'preview' | 'download' | null) => void;
  isMobile: boolean;
}

interface TutorialStep {
  title: string;
  content: string;
  highlightedElement: 'edit' | 'preview' | 'download' | null;
  icon?: React.ReactNode;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export function CVTutorialSteps({ 
  isOpen, 
  onClose, 
  canEdit, 
  language, 
  isPreviewMode = false,
  onStepChange,
  isMobile
}: CVTutorialStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [exitPosition, setExitPosition] = useState({ x: 0, y: 0 });
  const isRTL = language === 'he';

  const steps: TutorialStep[] = [
    {
      title: isRTL ? 'ברוכים הבאים לקורות החיים שלכם' : 'Welcome to Your CV',
      content: isRTL 
        ? 'כאן תוכלו לצפות בקורות החיים שלכם ולהוריד אותם. בואו נעבור על האפשרויות העומדות לרשותכם.'
        : 'Here you can view and download your CV. Let\'s go over the options available to you.',
      highlightedElement: null,
    },
    {
      title: isRTL ? 'צפייה בקורות החיים' : 'View Your CV',
      content: isRTL
        ? 'במכשיר הנייד תוכלו לצפות בקורות החיים שלכם בצורה נוחה ומותאמת למסך.'
        : 'On mobile, you can view your CV in a comfortable, screen-adapted format.',
      highlightedElement: 'preview',
      icon: <Eye className="w-4 h-4" />,
      mobileOnly: true
    },
    {
      title: isRTL ? 'עריכת קורות החיים' : 'Edit Your CV',
      content: canEdit 
        ? (isRTL 
          ? 'עריכת קורות החיים אפשרית רק במחשב. לאחר הורדת קורות החיים, תקבלו למייל קישור שיאפשר לכם לערוך אותם בזמנכם החופשי דרך המחשב.'
          : 'CV editing is only available on desktop. After downloading your CV, you\'ll receive an email link allowing you to edit it at your convenience through your computer.')
        : (isRTL
          ? 'בחבילה הנוכחית אין אפשרות עריכה. כדי לערוך את קורות החיים, תוכלו לשדרג לחבילה הכוללת אפשרות זו.'
          : 'Editing is not available in your current package. To edit your CV, you can upgrade to a package that includes this option.'),
      highlightedElement: 'edit',
      icon: <Edit2 className="w-4 h-4" />,
      desktopOnly: true
    },
    {
      title: isRTL ? 'הורדת קורות החיים' : 'Download Your CV',
      content: isRTL
        ? 'לאחר הורדת קורות החיים כקובץ PDF, תקבלו למייל קישור שיאפשר לכם לערוך אותם בהמשך דרך המחשב. חשוב להוריד את הקובץ כדי להמשיך לשלב הבא.'
        : 'After downloading your CV as a PDF file, you\'ll receive an email link allowing you to edit it later through your computer. Downloading is important to proceed to the next step.',
      highlightedElement: 'download',
      icon: <Download className="w-4 h-4" />
    }
  ];

  // סינון הצעדים לפי המכשיר
  const filteredSteps = steps.filter(step => {
    if (isMobile && step.desktopOnly) return false;
    if (!isMobile && step.mobileOnly) return false;
    return true;
  });

  useEffect(() => {
    if (onStepChange) {
      onStepChange(filteredSteps[currentStep].highlightedElement);
    }
  }, [currentStep, onStepChange]);

  useEffect(() => {
    // עדכון מיקום כפתור העזרה בעת טעינת הקומפוננטה
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
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onStepChange) onStepChange(null);
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // עדכון מיקום כפתור העזרה לפני הסגירה
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
          as={motion.div} 
          className="relative z-50" 
          onClose={() => {}} // מניעת סגירה בלחיצה מחוץ למודל
          static
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl"
              >
                {/* כפתור סגירה */}
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
                  {filteredSteps[currentStep].icon && (
                    <span className="text-[#4856CD]">{filteredSteps[currentStep].icon}</span>
                  )}
                  {filteredSteps[currentStep].title}
                </Dialog.Title>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {filteredSteps[currentStep].content}
                  </p>
                </div>

                {/* נקודות התקדמות */}
                <div className="mt-6 flex justify-center gap-2">
                  {filteredSteps.map((_, index) => (
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
                    {currentStep === filteredSteps.length - 1 
                      ? (isRTL ? 'סיום' : 'Finish')
                      : (isRTL ? 'הבא' : 'Next')}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 