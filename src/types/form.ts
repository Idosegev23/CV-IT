import { ValidationSchemaKey } from '@/lib/validations';

export type { ValidationSchemaKey };

export interface SectionValidation {
  isValid: boolean;
  rules: Record<string, boolean>;
  message?: string;
}

export interface ValidationRule {
  id: string;
  he: string;
  en: string;
  validate: (text: string) => boolean;
  questionId: string;
}

export type FormValidationStatus = Record<ValidationSchemaKey, SectionValidation>;
export type ValidationRules = Partial<Record<ValidationSchemaKey, ValidationRule[]>>;

export interface Question {
  type: ValidationSchemaKey;
  text: {
    he: string;
    en: string;
  };
  subtitle?: {
    he: string;
    en: string;
  };
  placeholder: {
    he: string;
    en: string;
  };
  required?: boolean;
  ariaLabel?: {
    he: string;
    en: string;
  };
  validationId: string;
} 