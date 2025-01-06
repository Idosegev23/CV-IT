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
import { Textarea } from '@/components/theme/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/theme/ui/select";
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSave: (newData: any) => void;
  section: string;
  className?: string;
  isRTL?: boolean;
}

const sectionTitles = {
  he: {
    personalInfo: 'פרטים אישיים',
    experience: 'ניסיון תעסוקתי',
    education: 'השכלה',
    technicalSkill: 'כישור טכני',
    softSkill: 'כישור רך',
    language: 'שפה',
    military: 'שירות צבאי'
  },
  en: {
    personalInfo: 'Personal Info',
    experience: 'Work Experience',
    education: 'Education',
    technicalSkill: 'Technical Skill',
    softSkill: 'Soft Skill',
    language: 'Language',
    military: 'Military Service'
  }
};

const skillLevels = {
  he: [
    { value: "1", label: "מתחיל" },
    { value: "2", label: "בסיסי" },
    { value: "3", label: "בינוני" },
    { value: "4", label: "מתקדם" },
    { value: "5", label: "מומחה" }
  ],
  en: [
    { value: "1", label: "Beginner" },
    { value: "2", label: "Basic" },
    { value: "3", label: "Intermediate" },
    { value: "4", label: "Advanced" },
    { value: "5", label: "Expert" }
  ]
};

const languageLevels = {
  he: [
    { value: "שפת אם", label: "שפת אם" },
    { value: "רמה גבוהה מאוד", label: "רמה גבוהה מאוד" },
    { value: "רמה גבוהה", label: "רמה גבוהה" },
    { value: "רמה בינונית", label: "רמה בינונית" },
    { value: "רמה בסיסית", label: "רמה בסיסית" }
  ],
  en: [
    { value: "Native", label: "Native" },
    { value: "Very High", label: "Very High" },
    { value: "High", label: "High" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Basic", label: "Basic" }
  ]
};

export const EditPopup: React.FC<EditPopupProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  section,
  className,
  isRTL = document.documentElement.lang === 'he',
}) => {
  const lang = document.documentElement.lang as 'he' | 'en' || 'he';
  const [formData, setFormData] = useState<any>(data || getDefaultFormData(section));

  // עדכון הנתונים כשהפופאפ נפתח מחדש או כשהנתונים משתנים
  useEffect(() => {
    if (data) {
      console.log('Updating form data:', data);
      setFormData(data);
    }
  }, [data, isOpen]);

  // פונקציה לקבלת ערכי ברירת מחדל לפי סוג השדה
  function getDefaultFormData(section: string) {
    switch (section) {
      case 'personalInfo':
        return {
          name: '',
          email: '',
          phone: '',
          address: ''
        };
      case 'experience':
        return {
          position: '',
          company: '',
          startDate: '',
          endDate: '',
          description: []
        };
      case 'education':
        return {
          type: '',
          field: '',
          institution: '',
          years: '',
          specialization: ''
        };
      case 'technicalSkill':
      case 'softSkill':
        return {
          name: '',
          level: section === 'technicalSkill' ? 3 : ''
        };
      case 'language':
        return {
          language: '',
          level: ''
        };
      case 'military':
        return {
          role: '',
          unit: '',
          startDate: '',
          endDate: '',
          description: []
        };
      default:
        return {};
    }
  }

  const handleChange = (field: string, value: string | string[] | number) => {
    console.log('Field changed:', field, value);
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // בדיקה שהנתונים קיימים לפני הרינדור
  if (!formData) {
    return null;
  }

  const renderFields = () => {
    switch (section) {
      case 'personalInfo':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">שם מלא</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">אימייל</label>
                <Input
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">טלפון</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">כתובת</label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
            </div>
          </>
        );
      case 'experience':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">תפקיד</label>
                <Input
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">חברה</label>
                <Input
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">תאריך התחלה</label>
                <Input
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">תאריך סיום</label>
                <Input
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">תיאור</label>
                <Textarea
                  value={formData.description?.join('\n')}
                  onChange={(e) => handleChange('description', e.target.value.split('\n'))}
                  rows={4}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
            </div>
          </>
        );
      case 'education':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">תואר</label>
                <Input
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">תחום</label>
                <Input
                  value={formData.field}
                  onChange={(e) => handleChange('field', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">מוסד</label>
                <Input
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">שנים</label>
                <Input
                  value={formData.years}
                  onChange={(e) => handleChange('years', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">התמחות</label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
            </div>
          </>
        );
      case 'technicalSkill':
      case 'softSkill':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  {isRTL ? 'שם הכישור' : 'Skill Name'}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              {section === 'technicalSkill' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">
                    {isRTL ? 'רמה' : 'Level'}
                  </label>
                  <Select
                    value={formData.level?.toString()}
                    onValueChange={(value) => handleChange('level', parseInt(value))}
                  >
                    <SelectTrigger className="bg-white text-gray-900 w-full rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10">
                      <SelectValue placeholder={isRTL ? "בחר רמה" : "Select level"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900 rounded-xl border-gray-200">
                      {skillLevels[lang].map((level) => (
                        <SelectItem 
                          key={level.value} 
                          value={level.value}
                          className="focus:bg-[#4856CD]/5 focus:text-[#4856CD] text-gray-900"
                        >
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </>
        );
      case 'language':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  {isRTL ? 'שפה' : 'Language'}
                </label>
                <Input
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="bg-white text-gray-900 rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">
                  {isRTL ? 'רמה' : 'Level'}
                </label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleChange('level', value)}
                >
                  <SelectTrigger className="bg-white text-gray-900 w-full rounded-xl border-gray-200 focus:border-[#4856CD] focus:ring-[#4856CD]/10">
                    <SelectValue placeholder={isRTL ? "בחר רמה" : "Select level"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 rounded-xl border-gray-200">
                    {languageLevels[lang].map((level) => (
                      <SelectItem 
                        key={level.value} 
                        value={level.value}
                        className="focus:bg-[#4856CD]/5 focus:text-[#4856CD] text-gray-900"
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );
      case 'military':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">תפקיד</label>
                <Input
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">יחידה</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">תאריך התחלה</label>
                <Input
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">תאריך סיום</label>
                <Input
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">תיאור</label>
                <Textarea
                  value={formData.description?.join('\n')}
                  onChange={(e) => handleChange('description', e.target.value.split('\n'))}
                  rows={4}
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center p-4",
            isRTL ? "rtl" : "ltr",
            className
          )}
        >
          {/* רקע מטושטש */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          {/* תוכן הפופאפ */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "relative",
              "w-full max-w-[500px]",
              "bg-white",
              "rounded-3xl",
              "shadow-xl",
              "overflow-hidden",
              "max-h-[90vh]",
              "overflow-y-auto"
            )}
          >
            {/* כותרת */}
            <div className="p-6 pb-0">
              <h2 className="text-2xl font-bold text-[#4856CD] mb-4">
                {isRTL ? 'עריכת פרטים' : 'Edit Details'}
              </h2>
            </div>

            {/* טופס */}
            <div className="p-6 space-y-4">
              {/* שדות הטופס */}
              <div className="space-y-4">
                {renderFields()}
              </div>

              {/* כפתורים */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#4856CD] text-[#4856CD] hover:bg-[#4856CD]/5 transition-colors font-medium"
                >
                  {isRTL ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#4856CD] text-white hover:bg-[#4856CD]/90 transition-colors font-medium"
                >
                  {isRTL ? 'שמירה' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 