import React from 'react';
import { FormValidationStatus } from '@/types/form';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { validationRules } from '@/lib/validationRules';

interface FormProgressProps {
  validation: FormValidationStatus;
  currentSection: string;
  lang: 'he' | 'en';
}

export const FormProgress: React.FC<FormProgressProps> = ({ validation, currentSection, lang }) => {
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
    </div>
  );
}; 