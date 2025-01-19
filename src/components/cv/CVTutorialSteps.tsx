import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Edit2, Download, Eye } from 'lucide-react';

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

  const steps: TutorialStep[] = [
    {
      title: 'ברוכים הבאים לקורות החיים שלכם',
      content: 'כאן תוכלו לצפות בקורות החיים שלכם ולהוריד אותם. בואו נעבור על האפשרויות העומדות לרשותכם.',
      highlightedElement: null,
    },
    {
      title: 'צפייה בקורות החיים',
      content: 'במכשיר הנייד תוכלו לצפות בקורות החיים שלכם בצורה נוחה ומותאמת למסך.',
      highlightedElement: 'preview',
      icon: <Eye className="w-4 h-4" />,
      mobileOnly: true
    },
    {
      title: 'עריכת קורות החיים',
      content: canEdit 
        ? 'עריכת קורות החיים אפשרית רק במחשב. לאחר הורדת קורות החיים, תקבלו למייל קישור שיאפשר לכם לערוך אותם בזמנכם החופשי דרך המחשב.'
        : 'בחבילה הנוכחית אין אפשרות עריכה. כדי לערוך את קורות החיים, תוכלו לשדרג לחבילה הכוללת אפשרות זו.',
      highlightedElement: 'edit',
      icon: <Edit2 className="w-4 h-4" />,
      desktopOnly: true
    },
    {
      title: 'הורדת קורות החיים',
      content: 'לאחר הורדת קורות החיים כקובץ PDF, תקבלו למייל קישור שיאפשר לכם לערוך אותם בהמשך דרך המחשב. חשוב להוריד את הקובץ כדי להמשיך לשלב הבא.',
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

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onStepChange) onStepChange(null);
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
                  {filteredSteps[currentStep].icon && (
                    <span className="text-blue-500">{filteredSteps[currentStep].icon}</span>
                  )}
                  {filteredSteps[currentStep].title}
                </Dialog.Title>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {filteredSteps[currentStep].content}
                  </p>
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
                    {currentStep === filteredSteps.length - 1 ? 'סיום' : 'הבא'}
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