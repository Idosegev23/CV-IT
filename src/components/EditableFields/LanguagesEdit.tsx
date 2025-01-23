import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/theme/ui/dialog';
import { Input } from '@/components/theme/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Language } from '@/types/resume';
import { Languages, Trash2, Plus } from 'lucide-react';

interface LanguagesEditProps {
  isOpen: boolean;
  onClose: () => void;
  data: Language[];
  onSave: (newData: Language[]) => void;
  isRTL?: boolean;
  template?: string;
}

const languageLevels = {
  he: [
    'שפת אם',
    'רמה גבוהה מאוד',
    'רמה גבוהה',
    'רמה בינונית',
    'רמה בסיסית'
  ],
  en: [
    'Native',
    'Very High',
    'High',
    'Intermediate',
    'Basic'
  ]
};

export const LanguagesEdit: React.FC<LanguagesEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional'
}) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [newLanguage, setNewLanguage] = useState<Language>({
    language: '',
    level: ''
  });

  useEffect(() => {
    if (isOpen && data) {
      setLanguages(data);
    }
  }, [data, isOpen]);

  const handleAddLanguage = () => {
    if (!newLanguage.language.trim()) return;

    setLanguages(prev => [...prev, {
      language: newLanguage.language.trim(),
      level: newLanguage.level || languageLevels[isRTL ? 'he' : 'en'][2] // ברירת מחדל: רמה גבוהה
    }]);

    setNewLanguage({
      language: '',
      level: ''
    });
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLevelChange = (index: number, newLevel: string) => {
    setLanguages(prev => prev.map((lang, i) => 
      i === index ? { ...lang, level: newLevel } : lang
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(languages);
    onClose();
  };

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
                  {isRTL ? 'שפות' : 'Languages'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-5 h-5" />
                  <h3 className="text-lg font-medium">
                    {isRTL ? 'רשימת שפות' : 'Language List'}
                  </h3>
                </div>

                <div className="space-y-3">
                  {languages.map((lang, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        value={lang.language}
                        readOnly
                        className="flex-1"
                      />
                      <select
                        value={lang.level}
                        onChange={(e) => handleLevelChange(index, e.target.value)}
                        className={cn(
                          "px-3 py-2 rounded-lg",
                          "border border-gray-200",
                          "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                          "bg-white text-gray-900"
                        )}
                      >
                        {languageLevels[isRTL ? 'he' : 'en'].map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveLanguage(index)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Input
                    value={newLanguage.language}
                    onChange={(e) => setNewLanguage(prev => ({
                      ...prev,
                      language: e.target.value
                    }))}
                    placeholder={isRTL ? 'הוסף שפה חדשה' : 'Add new language'}
                    className="flex-1"
                  />
                  <select
                    value={newLanguage.level}
                    onChange={(e) => setNewLanguage(prev => ({
                      ...prev,
                      level: e.target.value
                    }))}
                    className={cn(
                      "px-3 py-2 rounded-lg",
                      "border border-gray-200",
                      "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                      "bg-white text-gray-900"
                    )}
                  >
                    <option value="">
                      {isRTL ? 'בחר רמה' : 'Select level'}
                    </option>
                    {languageLevels[isRTL ? 'he' : 'en'].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddLanguage}
                    className={cn(
                      "p-2 rounded-full",
                      "bg-[#4856CD] text-white",
                      "hover:bg-[#4856CD]/90 transition-colors"
                    )}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
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