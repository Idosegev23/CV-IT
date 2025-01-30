import { useState } from 'react';
import { useValidation } from './useValidation';
import { Degree } from '@/types/resume';

interface EducationValidationErrors {
  [key: string]: {
    [field: string]: string;
  };
}

interface UseEducationValidationReturn {
  errors: EducationValidationErrors;
  validateDegree: (index: number, field: keyof Degree, value: string, isRTL?: boolean) => boolean;
  validateDegrees: (degrees: Degree[], isRTL?: boolean) => boolean;
  clearError: (index: number, field: keyof Degree) => void;
  hasErrors: () => boolean;
}

export const useEducationValidation = (): UseEducationValidationReturn => {
  const [errors, setErrors] = useState<EducationValidationErrors>({});
  const { validateDate, validateDateRange } = useValidation();

  const validateDegree = (index: number, field: keyof Degree, value: string, isRTL = false): boolean => {
    clearError(index, field);

    switch (field) {
      case 'type':
        if (!value.trim()) {
          setErrors(prev => ({
            ...prev,
            [index]: {
              ...prev[index],
              [field]: isRTL ? 'סוג תואר הוא שדה חובה' : 'Degree type is required'
            }
          }));
          return false;
        }
        break;

      case 'field':
        if (!value.trim()) {
          setErrors(prev => ({
            ...prev,
            [index]: {
              ...prev[index],
              [field]: isRTL ? 'תחום לימודים הוא שדה חובה' : 'Field of study is required'
            }
          }));
          return false;
        }
        break;

      case 'institution':
        if (!value.trim()) {
          setErrors(prev => ({
            ...prev,
            [index]: {
              ...prev[index],
              [field]: isRTL ? 'מוסד לימודים הוא שדה חובה' : 'Institution is required'
            }
          }));
          return false;
        }
        break;

      case 'startDate':
        if (!validateDate(value)) {
          setErrors(prev => ({
            ...prev,
            [index]: {
              ...prev[index],
              [field]: isRTL 
                ? 'פורמט לא תקין. השתמש ב-YYYY או MM/YYYY' 
                : 'Invalid format. Use YYYY or MM/YYYY'
            }
          }));
          return false;
        }
        break;

      case 'endDate':
        if (!validateDate(value)) {
          setErrors(prev => ({
            ...prev,
            [index]: {
              ...prev[index],
              [field]: isRTL 
                ? 'פורמט לא תקין. השתמש ב-YYYY או MM/YYYY או היום' 
                : 'Invalid format. Use YYYY or MM/YYYY or Present'
            }
          }));
          return false;
        }
        break;
    }

    // Validate date range if both dates are present
    if ((field === 'startDate' || field === 'endDate') && 
        errors[index]?.startDate === undefined && 
        errors[index]?.endDate === undefined) {
      const degree = errors[index];
      if (degree && !validateDateRange(degree.startDate, degree.endDate)) {
        setErrors(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            [field]: isRTL 
              ? 'תאריך סיום חייב להיות אחרי תאריך התחלה' 
              : 'End date must be after start date'
          }
        }));
        return false;
      }
    }

    return true;
  };

  const validateDegrees = (degrees: Degree[], isRTL = false): boolean => {
    let isValid = true;
    const newErrors: EducationValidationErrors = {};

    degrees.forEach((degree, index) => {
      const degreeErrors: { [field: string]: string } = {};

      // Validate required fields
      if (!degree.type.trim()) {
        degreeErrors.type = isRTL ? 'סוג תואר הוא שדה חובה' : 'Degree type is required';
        isValid = false;
      }
      if (!degree.field.trim()) {
        degreeErrors.field = isRTL ? 'תחום לימודים הוא שדה חובה' : 'Field of study is required';
        isValid = false;
      }
      if (!degree.institution.trim()) {
        degreeErrors.institution = isRTL ? 'מוסד לימודים הוא שדה חובה' : 'Institution is required';
        isValid = false;
      }

      // Validate dates
      if (degree.startDate && !validateDate(degree.startDate)) {
        degreeErrors.startDate = isRTL 
          ? 'פורמט לא תקין. השתמש ב-YYYY או MM/YYYY' 
          : 'Invalid format. Use YYYY or MM/YYYY';
        isValid = false;
      }
      if (degree.endDate && !validateDate(degree.endDate)) {
        degreeErrors.endDate = isRTL 
          ? 'פורמט לא תקין. השתמש ב-YYYY או MM/YYYY או היום' 
          : 'Invalid format. Use YYYY or MM/YYYY or Present';
        isValid = false;
      }

      // Validate date range
      if (degree.startDate && degree.endDate && 
          !validateDateRange(degree.startDate, degree.endDate)) {
        degreeErrors.endDate = isRTL 
          ? 'תאריך סיום חייב להיות אחרי תאריך התחלה' 
          : 'End date must be after start date';
        isValid = false;
      }

      if (Object.keys(degreeErrors).length > 0) {
        newErrors[index] = degreeErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearError = (index: number, field: keyof Degree) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[index]) {
        delete newErrors[index][field];
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      return newErrors;
    });
  };

  const hasErrors = () => Object.keys(errors).length > 0;

  return {
    errors,
    validateDegree,
    validateDegrees,
    clearError,
    hasErrors
  };
}; 