import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/theme/ui/dialog';
import { Button } from '@/components/theme/ui/button';
import { Input } from '@/components/theme/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PersonalInfo as PersonalInfoType } from '@/types/resume';
import { User, Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import { Textarea } from '@/components/theme/ui/textarea';

interface ValidationErrors {
  [key: string]: string;
}

interface PersonalInfoEditProps {
  isOpen: boolean;
  onClose: () => void;
  data: Partial<PersonalInfoType>;
  onSave: (newData: PersonalInfoType) => void;
  isRTL?: boolean;
  template?: string;
}

export const PersonalInfoEdit: React.FC<PersonalInfoEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional'
}) => {
  const [formData, setFormData] = useState<PersonalInfoType>({
    name: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const lang = document.documentElement.lang as 'he' | 'en' || 'he';

  useEffect(() => {
    if (isOpen && data) {
      const initialData: PersonalInfoType = {
        name: data.name || '',
        title: data.title || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        linkedin: data.linkedin || '',
      };
      
      console.log('Loading initial data:', initialData);
      setFormData(initialData);
      setErrors({});
      setTouched({});
    }
  }, [data, isOpen]);

  useEffect(() => {
    console.log('Current form data:', formData);
  }, [formData]);

  const validateField = (field: keyof PersonalInfoType, value: string | undefined): string => {
    if (!value || value.trim() === '') {
      if (field === 'name') {
        return lang === 'he' ? 'שם הוא שדה חובה' : 'Name is required';
      }
      return '';
    }
    
    switch (field) {
      case 'name':
        const words = value.trim().split(/\s+/);
        if (words.length < 2) {
          return lang === 'he' ? 'יש להזין שם פרטי ושם משפחה' : 'Please enter both first and last name';
        }
        if (words.some(word => word.length < 2)) {
          return lang === 'he' ? 'כל חלק בשם חייב להכיל לפחות 2 תווים' : 'Each name part must contain at least 2 characters';
        }
        break;

      case 'email':
        if (value) {
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            return lang === 'he' ? 'כתובת אימייל לא תקינה' : 'Invalid email address';
          }
        }
        break;

      case 'phone':
        if (value) {
          const cleanPhone = value.replace(/\D/g, '');
          if (cleanPhone.length !== 10) {
            return lang === 'he' ? 'מספר טלפון חייב להכיל 10 ספרות' : 'Phone number must contain 10 digits';
          }
          if (!cleanPhone.startsWith('05')) {
            return lang === 'he' ? 'מספר טלפון חייב להתחיל ב-05' : 'Phone number must start with 05';
          }
        }
        break;

      case 'linkedin':
        if (value) {
          const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
          if (!linkedinRegex.test(value)) {
            return lang === 'he' 
              ? 'כתובת LinkedIn לא תקינה (לדוגמה: linkedin.com/in/username)' 
              : 'Invalid LinkedIn URL (example: linkedin.com/in/username)';
          }
        }
        break;

      case 'address':
        if (value && value.length < 2) {
          return lang === 'he' ? 'יש להזין שם עיר תקין' : 'Please enter a valid city name';
        }
        break;
    }
    return '';
  };

  const handleChange = (field: keyof PersonalInfoType, value: string) => {
    let processedValue = value;
    
    if (field === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length > 0) {
        processedValue = digits.match(/.{1,3}/g)?.join('-') || digits;
        processedValue = processedValue.slice(0, 12);
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue,
    }));
    
    const error = validateField(field, processedValue);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleBlur = (field: keyof PersonalInfoType) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
    
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: ValidationErrors = {};
    let hasErrors = false;
    
    Object.keys(formData).forEach((field) => {
      const error = validateField(field as keyof PersonalInfoType, formData[field as keyof PersonalInfoType]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {}));
      return;
    }

    const dataToSave: PersonalInfoType = {
      name: formData.name.trim(),
      title: formData.title.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      linkedin: formData.linkedin.trim(),
    };

    console.log('Saving data:', dataToSave);
    onSave(dataToSave);
    onClose();
  };

  const fields = [
    { 
      key: 'name' as const, 
      label: lang === 'he' ? 'שם מלא' : 'Full Name', 
      type: 'text', 
      dir: 'auto',
      required: true,
      placeholder: lang === 'he' ? 'הכנס שם מלא' : 'Enter full name',
      icon: 'user'
    },
    { 
      key: 'email' as const, 
      label: lang === 'he' ? 'אימייל' : 'Email', 
      type: 'email', 
      dir: 'ltr',
      placeholder: 'example@domain.com',
      icon: 'mail'
    },
    { 
      key: 'phone' as const, 
      label: lang === 'he' ? 'טלפון' : 'Phone', 
      type: 'tel', 
      dir: 'ltr',
      placeholder: '050-0000000',
      icon: 'phone'
    },
    { 
      key: 'address' as const, 
      label: lang === 'he' ? 'עיר מגורים' : 'City', 
      type: 'text', 
      dir: 'auto',
      placeholder: lang === 'he' ? 'הכנס עיר מגורים' : 'Enter city',
      icon: 'map-pin'
    },
    { 
      key: 'linkedin' as const, 
      label: 'LinkedIn', 
      type: 'url', 
      dir: 'ltr',
      placeholder: 'linkedin.com/in/username',
      icon: 'linkedin'
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className={cn(
            "!fixed !top-[50%] !left-[50%] !transform !-translate-x-1/2 !-translate-y-1/2",
            "!w-[460px] !max-w-[92vw]",
            "!p-0 !m-0 !gap-0 !overflow-hidden",
            "!bg-gradient-to-br !from-white !via-white !to-gray-50/80",
            "!rounded-2xl !shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] !border !border-gray-100",
            isRTL ? "!rtl" : "!ltr",
            template === 'professional' && "!font-rubik",
            template === 'creative' && "!font-heebo",
            template === 'general' && "!font-opensans",
            template === 'classic' && "!font-assistant",
            "!block"
          )}
          style={{
            width: '460px',
            maxWidth: '92vw'
          }}>
            <div className="px-6 py-5 border-b border-[#4856CD]/5 bg-gradient-to-r from-[#4856CD]/[0.03] to-transparent">
              <DialogHeader>
                <DialogTitle className={cn(
                  "text-center text-[22px] font-bold",
                  "bg-gradient-to-r from-[#4856CD] to-[#4856CD]/90 text-transparent bg-clip-text"
                )}>
                  {isRTL ? 'פרטים אישיים' : 'Personal Details'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div className="space-y-[22px] max-w-[400px] mx-auto">
                {fields.map((field) => (
                  <div key={field.key} className="group w-full">
                    <label className={cn(
                      "block text-[13px] font-medium mb-2",
                      "text-gray-700 group-hover:text-[#4856CD]",
                      "transition-colors duration-200"
                    )}>
                      {field.label}
                    </label>
                    <div className="relative w-full">
                      <Input
                        value={formData[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        onBlur={(e) => handleBlur(field.key)}
                        className={cn(
                          "w-full h-11 bg-white text-[14px] text-gray-900",
                          "rounded-lg border border-gray-200/80",
                          "shadow-sm shadow-gray-100/50",
                          "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                          "focus:ring-2 focus:ring-[#4856CD]/10",
                          "transition duration-200",
                          isRTL ? "pr-11" : "pl-11",
                          errors[field.key] && touched[field.key] 
                            ? "!border-red-500/50 focus:!border-red-500 !ring-red-500/10" 
                            : ""
                        )}
                        placeholder={field.placeholder}
                        dir={field.dir}
                      />
                      {field.icon === 'user' && (
                        <User className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                          "text-gray-400 group-hover:text-[#4856CD]/70",
                          "transition-colors duration-200",
                          isRTL ? "right-4" : "left-4"
                        )} />
                      )}
                      {field.icon === 'mail' && (
                        <Mail className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                          "text-gray-400 group-hover:text-[#4856CD]/70",
                          "transition-colors duration-200",
                          isRTL ? "right-4" : "left-4"
                        )} />
                      )}
                      {field.icon === 'phone' && (
                        <Phone className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                          "text-gray-400 group-hover:text-[#4856CD]/70",
                          "transition-colors duration-200",
                          isRTL ? "right-4" : "left-4"
                        )} />
                      )}
                      {field.icon === 'map-pin' && (
                        <MapPin className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                          "text-gray-400 group-hover:text-[#4856CD]/70",
                          "transition-colors duration-200",
                          isRTL ? "right-4" : "left-4"
                        )} />
                      )}
                      {field.icon === 'linkedin' && (
                        <Linkedin className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                          "text-gray-400 group-hover:text-[#4856CD]/70",
                          "transition-colors duration-200",
                          isRTL ? "right-4" : "left-4"
                        )} />
                      )}
                    </div>
                    {errors[field.key] && touched[field.key] && (
                      <p className="text-red-500/90 text-[12px] mt-2 flex items-center gap-1.5">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500/90" />
                        {errors[field.key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2 max-w-[400px] mx-auto">
                <button
                  onClick={onClose}
                  className={cn(
                    "flex-1 h-11",
                    "rounded-lg border-2 border-[#4856CD]",
                    "text-[#4856CD] text-[14px] hover:bg-[#4856CD]/[0.02]",
                    "active:scale-[0.98]",
                    "transition-all duration-200 font-medium"
                  )}
                >
                  {isRTL ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  className={cn(
                    "flex-1 h-11",
                    "rounded-lg bg-[#4856CD]",
                    "text-white text-[14px] hover:bg-[#4856CD]/95",
                    "active:scale-[0.98]",
                    "transition-all duration-200 font-medium",
                    "shadow-md shadow-[#4856CD]/10"
                  )}
                >
                  {isRTL ? 'שמירה' : 'Save'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 