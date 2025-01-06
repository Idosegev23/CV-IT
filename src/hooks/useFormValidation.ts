import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { ValidationSchemaKey, answerValidationSchema } from '@/lib/validations';
import { validationRules } from '@/lib/validationRules';
import { FormValidationStatus, SectionValidation, ValidationRule } from '@/types/form';

export const useFormValidation = (formData: Record<ValidationSchemaKey, string>) => {
  const [validation, setValidation] = useState<FormValidationStatus>(() => {
    return Object.keys(answerValidationSchema).reduce<FormValidationStatus>((acc, key) => {
      acc[key as ValidationSchemaKey] = {
        isValid: false,
        rules: {},
        message: ''
      };
      return acc;
    }, {} as FormValidationStatus);
  });

  const validateSection = async (section: ValidationSchemaKey, text: string) => {
    try {
      // בדיקת זוד בסיסית
      await answerValidationSchema[section as keyof typeof answerValidationSchema].parseAsync(text);
      
      // בדיקת חוקים מפורטים
      const rules = validationRules[section as keyof typeof validationRules] || [];
      const rulesValidation = rules.reduce<Record<string, boolean>>((acc, rule) => {
        acc[rule.id] = rule.validate(text);
        return acc;
      }, {});

      const isValid = Object.values(rulesValidation).every(Boolean);

      setValidation((prev) => ({
        ...prev,
        [section]: {
          isValid,
          rules: rulesValidation,
          message: isValid ? '' : 'יש להשלים את כל השדות הנדרשים'
        }
      }));

    } catch (error) {
      setValidation((prev) => ({
        ...prev,
        [section]: {
          isValid: false,
          rules: {},
          message: error instanceof Error ? error.message : 'שגיאת ולידציה'
        }
      }));
    }
  };

  // דיבאונס לולידציה
  const debouncedValidate = debounce(validateSection, 500);

  useEffect(() => {
    // הפעלת ולידציה על כל שינוי בנתו��ים
    Object.entries(formData).forEach(([section, text]) => {
      debouncedValidate(section as ValidationSchemaKey, text);
    });

    // ניקוי הדיבאונס בעת סיום
    return () => {
      debouncedValidate.cancel();
    };
  }, [formData]);

  return {
    validation,
    validateSection: debouncedValidate
  };
}; 