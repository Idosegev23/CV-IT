import { useState } from 'react';

interface ValidationErrors {
  [key: string]: string;
}

interface UseValidationReturn {
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  validateDate: (dateStr: string, isRTL?: boolean) => boolean;
  validateDateRange: (startDate: string, endDate: string, isRTL?: boolean) => boolean;
  validateEmail: (email: string, isRTL?: boolean) => boolean;
  validatePhone: (phone: string, isRTL?: boolean) => boolean;
  validateLinkedIn: (url: string, isRTL?: boolean) => boolean;
  validateRequired: (value: string, fieldName: string, isRTL?: boolean) => boolean;
  clearError: (field: string) => void;
  hasErrors: () => boolean;
}

export const useValidation = (): UseValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateDate = (dateStr: string, isRTL = false): boolean => {
    if (!dateStr) return true;

    const presentValues = ['present', 'היום', 'כיום', 'עד היום', 'current'];
    if (presentValues.includes(dateStr.toLowerCase())) {
      return true;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const mmYYYYRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (mmYYYYRegex.test(dateStr)) {
      const [month, year] = dateStr.split('/').map(Number);
      if (year > currentYear || (year === currentYear && month > currentMonth)) {
        return false;
      }
      return year >= 1900 && year <= currentYear;
    }

    const yearRegex = /^\d{4}$/;
    if (yearRegex.test(dateStr)) {
      const year = parseInt(dateStr);
      return year >= 1900 && year <= currentYear;
    }

    return false;
  };

  const validateDateRange = (startDate: string, endDate: string, isRTL = false): boolean => {
    if (!startDate || !endDate) return true;

    const presentValues = ['present', 'היום', 'כיום', 'עד היום', 'current'];
    if (presentValues.includes(endDate.toLowerCase())) {
      return true;
    }

    const startYear = parseInt(startDate.split('/')[1] || startDate);
    const endYear = parseInt(endDate.split('/')[1] || endDate);

    if (startYear && endYear) {
      if (startYear > endYear) return false;

      if (startYear === endYear) {
        const startMonth = parseInt(startDate.split('/')[0]) || 1;
        const endMonth = parseInt(endDate.split('/')[0]) || 12;
        return startMonth <= endMonth;
      }
    }

    return true;
  };

  const validateEmail = (email: string, isRTL = false): boolean => {
    if (!email) return true;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string, isRTL = false): boolean => {
    if (!phone) return true;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10 && cleanPhone.startsWith('05');
  };

  const validateLinkedIn = (url: string, isRTL = false): boolean => {
    if (!url) return true;
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    return linkedinRegex.test(url);
  };

  const validateRequired = (value: string, fieldName: string, isRTL = false): boolean => {
    if (!value || value.trim().length === 0) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: isRTL ? `${fieldName} הוא שדה חובה` : `${fieldName} is required`
      }));
      return false;
    }
    return true;
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const hasErrors = () => Object.keys(errors).length > 0;

  return {
    errors,
    setErrors,
    validateDate,
    validateDateRange,
    validateEmail,
    validatePhone,
    validateLinkedIn,
    validateRequired,
    clearError,
    hasErrors
  };
}; 