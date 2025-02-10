import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/theme/ui/dialog';
import { Input } from '@/components/theme/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/theme/ui/accordion";
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Language } from '@/types/resume';
import { Languages as LanguagesIcon, Trash2, Plus, Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/theme/ui/button';

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
  const [expandedItem, setExpandedItem] = useState<string>("0");
  const [newLanguage, setNewLanguage] = useState<Language>({
    language: '',
    level: ''
  });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      console.log('Setting languages:', data);
      setLanguages(Array.isArray(data) ? data : []);
    }
  }, [data, isOpen]);

  const handleAddLanguage = () => {
    console.log('Attempting to add new language:', newLanguage);
    
    if (!newLanguage.language.trim()) {
      console.log('Language name is empty');
      return;
    }
    
    if (!newLanguage.level) {
      console.log('Language level is not selected');
      setShowError(true);
      return;
    }

    setShowError(false);
    const updatedLanguages = [...languages, {
      language: newLanguage.language.trim(),
      level: newLanguage.level
    }];

    console.log('Adding language:', updatedLanguages);
    setLanguages(updatedLanguages);

    setNewLanguage({
      language: '',
      level: ''
    });
  };

  const handleRemoveLanguage = (index: number) => {
    const updatedLanguages = languages.filter((_, i) => i !== index);
    console.log('Removing language:', updatedLanguages);
    setLanguages(updatedLanguages);
  };

  const handleLevelChange = (index: number, newLevel: string) => {
    const updatedLanguages = languages.map((lang, i) => 
      i === index ? { ...lang, level: newLevel } : lang
    );
    console.log('Changing level:', updatedLanguages);
    setLanguages(updatedLanguages);
  };

  const handleLanguageChange = (index: number, value: string) => {
    const updatedLanguages = languages.map((lang, i) => 
      i === index ? { ...lang, language: value } : lang
    );
    console.log('Changing language:', updatedLanguages);
    setLanguages(updatedLanguages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting languages:', languages);
    onSave(languages);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className={cn(
            "!fixed !top-[50%] !left-[50%] !transform !-translate-x-1/2 !-translate-y-1/2",
            "!w-[600px] !max-w-[92vw]",
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
          style={{ width: '600px', maxWidth: '92vw' }}>
            <div className="px-6 py-5 border-b border-[#4856CD]/5 bg-gradient-to-r from-[#4856CD]/[0.03] to-transparent">
              <DialogHeader>
                <DialogTitle className={cn(
                  "text-center text-[22px] font-bold",
                  "bg-gradient-to-r from-[#4856CD] to-[#4856CD]/90 text-transparent bg-clip-text"
                )}>
                  {isRTL ? 'שפות' : 'Languages'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <Accordion
                type="single"
                collapsible
                value={expandedItem}
                onValueChange={setExpandedItem}
                className="space-y-4"
              >
                <AccordionItem
                  value="0"
                  className={cn(
                    "border border-gray-200/80 rounded-xl overflow-hidden",
                    "hover:border-[#4856CD]/30 transition-colors duration-200",
                    expandedItem === "0" && "border-[#4856CD]/30"
                  )}
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg !bg-[#4856CD]/5 flex items-center justify-center">
                        <Globe className="w-4 h-4 !text-[#4856CD]" />
                      </div>
                      <div className="!text-right">
                        <h3 className="font-medium !text-[15px] !text-gray-900">
                          {isRTL ? 'רשימת שפות' : 'Language List'}
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* רשימת השפות הקיימות */}
                      {languages.map((lang, index) => (
                        <div key={index} className="group">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                              <Input
                                value={lang.language}
                                onChange={(e) => handleLanguageChange(index, e.target.value)}
                                className={cn(
                                  "w-full h-11 bg-white text-[14px] text-gray-900",
                                  "rounded-lg border border-gray-200/80",
                                  "shadow-sm shadow-gray-100/50",
                                  "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                  "focus:ring-2 focus:ring-[#4856CD]/10",
                                  "transition duration-200",
                                  isRTL ? "pr-11" : "pl-11"
                                )}
                                dir={isRTL ? 'rtl' : 'ltr'}
                                placeholder={isRTL ? 'הכנס שפה' : 'Enter language'}
                              />
                              <Globe className={cn(
                                "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                                "text-gray-400 group-hover:text-[#4856CD]/70",
                                "transition-colors duration-200",
                                isRTL ? "right-4" : "left-4"
                              )} />
                            </div>
                            <select
                              value={lang.level}
                              onChange={(e) => handleLevelChange(index, e.target.value)}
                              className={cn(
                                "h-11 px-4 bg-white text-[14px] text-gray-900",
                                "rounded-lg border border-gray-200/80",
                                "shadow-sm shadow-gray-100/50",
                                "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                "focus:ring-2 focus:ring-[#4856CD]/10",
                                "transition duration-200"
                              )}
                              dir={isRTL ? 'rtl' : 'ltr'}
                            >
                              {languageLevels[isRTL ? 'he' : 'en'].map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 rounded-lg hover:bg-red-50"
                              onClick={() => handleRemoveLanguage(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* הוספת שפה חדשה */}
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <Input
                              value={newLanguage.language}
                              onChange={(e) => setNewLanguage(prev => ({
                                ...prev,
                                language: e.target.value
                              }))}
                              placeholder={isRTL ? 'הוסף שפה חדשה' : 'Add new language'}
                              className={cn(
                                "w-full h-11 bg-white text-[14px] text-gray-900",
                                "rounded-lg border border-gray-200/80",
                                "shadow-sm shadow-gray-100/50",
                                "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                "focus:ring-2 focus:ring-[#4856CD]/10",
                                "transition duration-200",
                                isRTL ? "pr-11" : "pl-11"
                              )}
                              dir={isRTL ? 'rtl' : 'ltr'}
                            />
                            <Globe className={cn(
                              "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                              "text-gray-400 group-hover:text-[#4856CD]/70",
                              "transition-colors duration-200",
                              isRTL ? "right-4" : "left-4"
                            )} />
                          </div>
                          <div className="relative">
                            <select
                              value={newLanguage.level}
                              onChange={(e) => {
                                setNewLanguage(prev => ({
                                  ...prev,
                                  level: e.target.value
                                }));
                                setShowError(false);
                              }}
                              className={cn(
                                "h-11 px-4 bg-white text-[14px] text-gray-900",
                                "rounded-lg border",
                                "shadow-sm shadow-gray-100/50",
                                "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                "focus:ring-2 focus:ring-[#4856CD]/10",
                                "transition duration-200",
                                showError ? "border-red-500" : "border-gray-200/80"
                              )}
                              dir={isRTL ? 'rtl' : 'ltr'}
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
                            {showError && (
                              <div className="absolute mt-1 text-red-500 text-[12px]">
                                {isRTL ? 'חובה לבחור רמה' : 'Level is required'}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-11 rounded-lg hover:bg-[#4856CD]/5 flex items-center gap-2 px-4"
                            onClick={handleAddLanguage}
                          >
                            <Plus className="w-4 h-4 text-[#4856CD]" />
                            <span className="text-[#4856CD]">
                              {isRTL ? 'הוסף שפה חדשה' : 'Add new language'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
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
                  type="submit"
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
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 