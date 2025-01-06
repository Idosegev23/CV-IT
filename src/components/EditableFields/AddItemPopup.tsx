import React, { useState } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AddItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newItem: any) => void;
  section: string;
  className?: string;
  isRTL?: boolean;
}

const sectionTitles = {
  he: {
    experience: 'ניסיון תעסוקתי',
    education: 'השכלה',
    technicalSkill: 'כישור טכני',
    softSkill: 'כישור רך',
    language: 'שפה'
  },
  en: {
    experience: 'Work Experience',
    education: 'Education',
    technicalSkill: 'Technical Skill',
    softSkill: 'Soft Skill',
    language: 'Language'
  }
};

export const AddItemPopup: React.FC<AddItemPopupProps> = ({
  isOpen,
  onClose,
  onAdd,
  section,
  className,
  isRTL = document.documentElement.lang === 'he',
}) => {
  const getInitialFormData = () => {
    switch (section) {
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
        return {
          name: '',
          level: 3
        };
      case 'softSkill':
        return {
          name: '',
          level: 3
        };
      case 'language':
        return {
          language: '',
          level: ''
        };
      default:
        return {};
    }
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const lang = document.documentElement.lang as 'he' | 'en' || 'he';

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  const renderFields = () => {
    switch (section) {
      case 'experience':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">תפקיד</label>
                <Input
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">חברה</label>
                <Input
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
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
      case 'education':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">תואר</label>
                <Input
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">תחום</label>
                <Input
                  value={formData.field}
                  onChange={(e) => handleChange('field', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">מוסד</label>
                <Input
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">שנים</label>
                <Input
                  value={formData.years}
                  onChange={(e) => handleChange('years', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">התמחות</label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
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
                <label className="block text-sm font-medium mb-1">שם הכישור</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              {section === 'technicalSkill' && (
                <div>
                  <label className="block text-sm font-medium mb-1">רמה (1-5)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.level}
                    onChange={(e) => handleChange('level', parseInt(e.target.value))}
                  />
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
                <label className="block text-sm font-medium mb-1">שפה</label>
                <Input
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">רמה</label>
                <Input
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
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
          className={className}
        >
          {/* רקע מטושטש */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

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
              "mx-4",
              "max-h-[90vh]",
              "overflow-y-auto"
            )}
          >
            {/* כותרת */}
            <div className="p-6 pb-0">
              <h2 className="text-2xl font-bold text-[#4754D7] mb-4">
                {isRTL ? 'הוספת פריט חדש' : 'Add New Item'}
              </h2>
            </div>

            {/* טופס */}
            <div className="p-6 space-y-4">
              {/* שדות הטופס */}
              {renderFields()}

              {/* כפתורים */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-full border-2 border-[#4754D7] text-[#4754D7] hover:bg-[#4754D7]/5 transition-colors"
                >
                  {isRTL ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 rounded-full bg-[#4754D7] text-white hover:bg-[#4754D7]/90 transition-colors"
                >
                  {isRTL ? 'הוספה' : 'Add'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 