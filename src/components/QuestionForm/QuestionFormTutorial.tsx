import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserCircle2, FileText, Briefcase, GraduationCap, Star } from 'lucide-react';

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

  const steps: TutorialStep[] = [
    {
      title: 'ברוכים הבאים לשאלון קורות החיים',
      content: 'אנחנו כאן כדי לעזור לך ליצור קורות חיים מקצועיים ומרשימים. בואו נראה איך זה עובד.',
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: 'דברו בחופשיות',
      content: 'אין צורך להתנסח בצורה מקצועית או פורמלית מדי. פשוט כתבו בשפה טבעית וחופשית - אנחנו נדאג לנסח את הכל בצורה מקצועית.',
      icon: <UserCircle2 className="w-5 h-5" />
    },
    {
      title: 'ניסיון תעסוקתי',
      content: 'מומלץ להתמקד ב-3 המשרות האחרונות והמשמעותיות ביותר. אין צורך לפרט יותר מדי - אנחנו ניקח את המידע שתספקו ונבנה ממנו תוכן מרשים.',
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      title: 'השכלה וכישורים',
      content: 'ציינו את ההשכלה והכישורים העיקריים שלכם. אל תדאגו לגבי הניסוח - אנחנו נדע להבליט את החוזקות שלכם בצורה המיטבית.',
      icon: <GraduationCap className="w-5 h-5" />
    },
    {
      title: 'מערכת חכמה',
      content: 'המערכת שלנו יודעת לקחת את המידע שתספקו ולהפוך אותו לקורות חיים מקצועיים. סמכו עלינו - אנחנו נדאג שהתוצאה תהיה מרשימה!',
      icon: <Star className="w-5 h-5" />
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
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                  className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2"
                >
                  <span className="text-blue-500">{steps[currentStep].icon}</span>
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
                        index === currentStep ? 'bg-blue-500 w-4' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    חזרה
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleNext}
                  >
                    {currentStep === steps.length - 1 ? 'בואו נתחיל!' : 'הבא'}
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