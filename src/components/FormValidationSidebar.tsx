import React from 'react';
import { FormValidationStatus, ValidationRule, ValidationSchemaKey } from '@/types/form';
import { CheckCircle, XCircle } from 'lucide-react';
import { validationRules } from '@/lib/validationRules';
import { cn } from '@/lib/utils';

interface FormValidationSidebarProps {
  validation: FormValidationStatus;
  currentSection: ValidationSchemaKey;
  lang: 'he' | 'en';
}

const sectionTitles: Record<ValidationSchemaKey, { he: string; en: string }> = {
  personal_details: {
    he: 'פרטים אישיים',
    en: 'Personal Details'
  },
  professional_summary: {
    he: 'תקציר מקצועי',
    en: 'Professional Summary'
  },
  experience: {
    he: 'ניסיון תעסוקתי',
    en: 'Work Experience'
  },
  education: {
    he: 'השכלה',
    en: 'Education'
  },
  skills: {
    he: 'כישורים',
    en: 'Skills'
  },
  languages: {
    he: 'שפות',
    en: 'Languages'
  },
  military_service: {
    he: 'שירות צבאי',
    en: 'Military Service'
  },
  recommendations: {
    he: 'המלצות',
    en: 'Recommendations'
  },
  highlights: {
    he: 'נקוד��ת בולטות',
    en: 'Highlights'
  },
  desired_position: {
    he: 'תפקיד מבוקש',
    en: 'Desired Position'
  }
} as const;

export const FormValidationSidebar = ({
  validation,
  currentSection,
  lang
}: FormValidationSidebarProps) => {
  const isRTL = lang === 'he';
  
  return (
    <div className="h-full p-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isRTL ? 'בדיקת תקינות' : 'Validation'}
          </h3>
          <span className="text-sm text-muted-foreground">
            {Object.values(validation).filter(Boolean).length}/{Object.keys(validation).length}
          </span>
        </div>
        
        <div className="space-y-3">
          {Object.entries(validation).map(([section, isValid]) => (
            <div
              key={section}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                "transition-all duration-200",
                section === currentSection && "bg-white/5",
                isValid ? "text-green-500" : "text-muted-foreground"
              )}
            >
              {isValid ? (
                <CheckCircle className="h-5 w-5 shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-muted-foreground shrink-0" />
              )}
              <span className="text-base">
                {sectionTitles[section as ValidationSchemaKey][lang]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 