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
    if (!value) {
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
            "sm:max-w-[600px] p-0 gap-0",
            "bg-gradient-to-b from-white to-gray-50",
            "rounded-2xl shadow-xl border-0",
            isRTL ? "rtl" : "ltr",
            template === 'professional' && "font-rubik",
            template === 'creative' && "font-heebo",
            template === 'general' && "font-opensans",
            template === 'classic' && "font-assistant",
          )}>
            <div className="p-6 border-b border-[#4856CD]/10">
              <DialogHeader>
                <DialogTitle className={cn(
                  "text-center text-2xl font-bold",
                  "bg-gradient-to-r from-[#4856CD] to-[#4856CD]/80 text-transparent bg-clip-text"
                )}>
                  {isRTL ? 'פרטים אישיים' : 'Personal Details'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    {isRTL ? 'שם מלא' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={(e) => handleBlur('name')}
                      className={cn(
                        "bg-white text-gray-900",
                        "rounded-xl border-gray-200",
                        "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                        "pl-10",
                        errors['name'] && touched['name'] ? "border-red-500 focus:border-red-500" : ""
                      )}
                      placeholder={isRTL ? 'הכנס שם מלא' : 'Enter full name'}
                      dir="auto"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors['name'] && touched['name'] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors['name']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    {isRTL ? 'אימייל' : 'Email'}
                  </label>
                  <div className="relative">
                    <Input
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={(e) => handleBlur('email')}
                      className={cn(
                        "bg-white text-gray-900",
                        "rounded-xl border-gray-200",
                        "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                        "pl-10",
                        errors['email'] && touched['email'] ? "border-red-500 focus:border-red-500" : ""
                      )}
                      placeholder={isRTL ? 'הכנס אימייל' : 'Enter email'}
                      dir="ltr"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors['email'] && touched['email'] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors['email']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    {isRTL ? 'טלפון' : 'Phone'}
                  </label>
                  <div className="relative">
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={(e) => handleBlur('phone')}
                      className={cn(
                        "bg-white text-gray-900",
                        "rounded-xl border-gray-200",
                        "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                        "pl-10",
                        errors['phone'] && touched['phone'] ? "border-red-500 focus:border-red-500" : ""
                      )}
                      placeholder={isRTL ? 'הכנס טלפון' : 'Enter phone'}
                      dir="ltr"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors['phone'] && touched['phone'] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors['phone']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    {isRTL ? 'עיר מגורים' : 'City'}
                  </label>
                  <div className="relative">
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      onBlur={(e) => handleBlur('address')}
                      className={cn(
                        "bg-white text-gray-900",
                        "rounded-xl border-gray-200",
                        "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                        "pl-10"
                      )}
                      placeholder={isRTL ? 'הכנס עיר מגורים' : 'Enter city'}
                      dir="auto"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    LinkedIn
                  </label>
                  <div className="relative">
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => handleChange('linkedin', e.target.value)}
                      onBlur={(e) => handleBlur('linkedin')}
                      className={cn(
                        "bg-white text-gray-900",
                        "rounded-xl border-gray-200",
                        "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                        "pl-10",
                        errors['linkedin'] && touched['linkedin'] ? "border-red-500 focus:border-red-500" : ""
                      )}
                      placeholder="linkedin.com/in/username"
                      dir="ltr"
                    />
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors['linkedin'] && touched['linkedin'] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors['linkedin']}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className={cn(
                    "flex-1 px-4 py-2.5",
                    "rounded-full border-2 border-[#4856CD]",
                    "text-[#4856CD] hover:bg-[#4856CD]/5",
                    "transition-colors font-medium"
                  )}
                >
                  {isRTL ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  className={cn(
                    "flex-1 px-4 py-2.5",
                    "rounded-full bg-[#4856CD]",
                    "text-white hover:bg-[#4856CD]/90",
                    "transition-colors font-medium"
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