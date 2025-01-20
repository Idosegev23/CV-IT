import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Eye, MousePointer, Tag, Star } from 'lucide-react';

interface TemplateTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

interface TutorialStep {
  title: string;
  content: string;
  icon: React.ReactNode;
  highlightElement?: string;
}

export function TemplateTutorial({ isOpen, onClose, language }: TemplateTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isRTL = language === 'he';

  const steps: TutorialStep[] = [
    {
      title: isRTL ? 'בחירת תבנית מושלמת' : 'Choose Perfect Template',
      content: isRTL 
        ? 'לפנייך ארבע תבניות מקצועיות. כל תבנית מותאמת לתחומים שונים - ניתן לראות למי התבנית מתאימה לפי התגיות שמתחת לתיאור.'
        : 'Here are four professional templates. Each template is tailored for different fields - you can see who each template is suitable for by the tags below the description.',
      icon: <Tag className="w-5 h-5" />,
      highlightElement: '.template-tags'
    },
    {
      title: isRTL ? 'תצוגה מקדימה' : 'Preview',
      content: isRTL
        ? 'לחיצה על כפתור "לצפייה" תציג איך התבנית נראית עם תוכן לדוגמה. זה יעזור בבחירת התבנית המתאימה ביותר.'
        : 'Click the "Preview" button to see how the template looks with sample content. This will help you decide which template suits you best.',
      icon: <Eye className="w-5 h-5" />,
      highlightElement: '.preview-button'
    },
    {
      title: isRTL ? 'התאמה מושלמת' : 'Perfect Match',
      content: isRTL
        ? 'התיאור והתגיות מתחת לכל תבנית יעזרו בבחירת התבנית המתאימה ביותר לתחום המקצועי.'
        : 'The description and tags under each template will help you choose the most suitable template for your field.',
      icon: <Star className="w-5 h-5" />,
      highlightElement: '.template-description'
    },
    {
      title: isRTL ? 'בחירה סופית' : 'Final Selection',
      content: isRTL
        ? 'לאחר בחירת התבנית המתאימה, לחיצה על כפתור "בחירה" תעביר לשלב הבא. אפשר לשנות את התבנית גם מאוחר יותר.'
        : 'After choosing the right template, click the "Select" button to proceed. You can change the template later.',
      icon: <MousePointer className="w-5 h-5" />,
      highlightElement: '.select-button'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}
                >
                  <span className="text-[#4856CD]">{steps[currentStep].icon}</span>
                  {steps[currentStep].title}
                </Dialog.Title>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {steps[currentStep].content}
                  </p>
                </div>

                {/* Progress Dots */}
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

                <div className={`mt-6 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
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
                      ? (isRTL ? 'מתחילים!' : 'Let\'s Start!')
                      : (isRTL ? 'הבא' : 'Next')}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}