import React from 'react';
import { FormValidationStatus } from '@/types/form';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { validationRules } from '@/lib/validationRules';
import { cn } from '@/lib/utils';
import { UserCircle2, FileText, Briefcase, GraduationCap, Star } from 'lucide-react';

interface FormProgressProps {
  validation: FormValidationStatus;
  currentSection: string;
  lang: 'he' | 'en';
  currentStep: number;
  totalSteps: number;
}

interface StepInfo {
  title: string;
  icon: React.ReactNode;
}

export const FormProgress: React.FC<FormProgressProps> = ({ validation, currentSection, lang, currentStep, totalSteps }) => {
  const steps: StepInfo[] = [
    { title: lang === 'he' ? 'פרטים אישיים' : 'Personal Details', icon: <UserCircle2 className="w-4 h-4" /> },
    { title: lang === 'he' ? 'תקציר מקצועי' : 'Professional Summary', icon: <FileText className="w-4 h-4" /> },
    { title: lang === 'he' ? 'ניסיון תעסוקתי' : 'Work Experience', icon: <Briefcase className="w-4 h-4" /> },
    { title: lang === 'he' ? 'השכלה' : 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { title: lang === 'he' ? 'כישורים ושפות' : 'Skills & Languages', icon: <Star className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed left-4 top-1/4 w-64 bg-white rounded-lg shadow-lg p-4" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <h3 className="text-lg font-semibold mb-4">
        {lang === 'he' ? 'התקדמות השאלון' : 'Form Progress'}
      </h3>
      
      <div className="space-y-3">
        {Object.entries(validation).map(([section, status]) => {
          const rules = validationRules[section as keyof typeof validationRules] || [];
          
          return (
            <div key={section} className={`p-2 rounded ${
              currentSection === section ? 'bg-blue-50' : ''
            }`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {status.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  {rules[0]?.[lang]}
                </span>
              </div>
              
              {/* הצגת תת-חוקים */}
              {!status.isValid && status.rules && (
                <div className="mt-2 text-sm">
                  {rules.map(rule => (
                    <div key={rule.id} className="flex items-center gap-1 text-gray-600">
                      {status.rules[rule.id] ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {rule[lang]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span>{lang === 'he' ? 'התקדמות כללית' : 'Overall Progress'}</span>
          <span className="text-sm font-medium">
            {Object.values(validation).filter(v => v.isValid).length} / {Object.keys(validation).length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-green-500 h-2.5 rounded-full"
            style={{ 
              width: `${(Object.values(validation).filter(v => v.isValid).length / Object.keys(validation).length) * 100}%`
            }}
          ></div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span>{lang === 'he' ? 'התקדמות מבנה השאלון' : 'Form Progress'}</span>
          <span className="text-sm font-medium">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="absolute top-0 left-0 h-full bg-[#4856CD] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center"
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  index <= currentStep
                    ? "bg-[#4856CD] text-white"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {step.icon}
              </div>
              
              {/* Step Title */}
              <span 
                className={cn(
                  "mt-2 text-xs text-center transition-all duration-300 whitespace-nowrap",
                  index <= currentStep ? "text-[#4856CD]" : "text-gray-400"
                )}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 