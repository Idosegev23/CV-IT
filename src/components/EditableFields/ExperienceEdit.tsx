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
import { Building2, Calendar, Briefcase, GripVertical, Plus, Trash2, MapPin, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Experience } from '@/types/resume';
import { Button } from '@/components/theme/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/theme/ui/popover';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { FileText } from 'lucide-react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/theme/ui/calendar';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface ExperienceData {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string | string[];
  location?: string;
  achievements?: string[];
}

export interface ExperienceEditProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExperienceData[];
  onSave: (newData: ExperienceData[]) => void;
  isRTL?: boolean;
  displayLang: 'he' | 'en';
}

const MAX_DESCRIPTION_LENGTH = 200;
const MAX_EXPERIENCES = 3;
const MAX_DESCRIPTIONS_PER_ROLE = 3;
const MAX_WORDS_PER_DESCRIPTION = 10;

// Helper function to convert date string to timestamp for sorting
const getDateTimestamp = (dateStr: string): number => {
  if (!dateStr) return 0;
  
  // Handle special cases for "present" or "today"
  const presentValues = ['present', 'היום', 'כיום', 'עד היום', 'current'];
  if (presentValues.includes(dateStr.toLowerCase())) {
    return new Date().getTime();
  }

  // Check if the date is in MM/YYYY format
  const mmYYYYRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  if (mmYYYYRegex.test(dateStr)) {
    const [month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1).getTime();
  }

  // Check if the date is just a year
  const yearRegex = /^\d{4}$/;
  if (yearRegex.test(dateStr)) {
    return new Date(parseInt(dateStr), 0).getTime();
  }

  return 0;
};

// Helper function to validate date format (YYYY or MM/YYYY)
const isValidDateFormat = (dateStr: string): boolean => {
  if (!dateStr) return true; // Allow empty dates
  
  // Handle special cases for "present" or "today"
  const presentValues = ['present', 'היום', 'כיום', 'עד היום', 'current'];
  if (presentValues.includes(dateStr.toLowerCase())) {
    return true;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Check if the date is in MM/YYYY format
  const mmYYYYRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  if (mmYYYYRegex.test(dateStr)) {
    const [month, year] = dateStr.split('/').map(Number);
    
    // Check if date is in the future
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return false;
    }
    
    return year >= 1900 && year <= currentYear;
  }

  // Check if the date is just a year
  const yearRegex = /^\d{4}$/;
  if (yearRegex.test(dateStr)) {
    const year = parseInt(dateStr);
    return year >= 1900 && year <= currentYear;
  }

  return false;
};

// Helper function to check if end date is after start date
const isValidDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return true; // Allow empty dates
  
  // Handle special cases for "present" or "today"
  const presentValues = ['present', 'היום', 'כיום', 'עד היום', 'current'];
  if (presentValues.includes(endDate.toLowerCase())) {
    return true;
  }

  const startTimestamp = getDateTimestamp(startDate);
  const endTimestamp = getDateTimestamp(endDate);
  return startTimestamp <= endTimestamp;
};

// Helper function to safely parse date string to Date object
const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Handle special cases
  const presentValues = ['present', 'היום', 'כיום', 'עד היום', 'current'];
  if (presentValues.includes(dateStr.toLowerCase())) {
    return new Date();
  }

  // Try parsing MM/YYYY format
  const mmYYYYRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  if (mmYYYYRegex.test(dateStr)) {
    const [month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1);
  }

  // Try parsing YYYY format
  const yearRegex = /^\d{4}$/;
  if (yearRegex.test(dateStr)) {
    return new Date(parseInt(dateStr), 0);
  }

  return null;
};

interface AIPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string) => void;
  isRTL?: boolean;
  displayLang: 'he' | 'en';
  originalText: string;
}

const AIPopup: React.FC<AIPopupProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  isRTL = false,
  displayLang,
  originalText 
}) => {
  const [text, setText] = useState(originalText);
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  useEffect(() => {
    setText(originalText);
    setGeneratedText('');
    setWordCount(originalText.trim().split(/\s+/).length);
    setStatus('idle');
  }, [originalText]);

  const handleTextChange = (value: string) => {
    setText(value);
    setWordCount(value.trim().split(/\s+/).length);
  };

  const handleSave = () => {
    onGenerate(generatedText);
    onClose();
    setGeneratedText('');
    setStatus('idle');
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setStatus('generating');
    try {
      const prompt = displayLang === 'he' ? `
        אתה עוזר מקצועי לכתיבת קורות חיים. המטרה שלך היא לעזור למשתמשים לכתוב תיאורי תפקיד קצרים, ממוקדים ואפקטיביים.

        הנה כמה כללים חשובים:
        1. התיאור חייב להיות עד 10 מילים
        2. התיאור צריך להיות ממוקד ולהדגיש הישגים והשפעה
        3. יש להשתמש בפעלים חזקים ומדידים (כמו: הובלתי, פיתחתי, שיפרתי, הגדלתי)
        4. יש להימנע ממילות קישור מיותרות
        5. יש להתמקד בתוצאות ולא בתהליכים
        6. יש לשמור על שפה מקצועית ומדויקת
        7. יש להוסיף מספרים ונתונים כמותיים אם יש (%, מספר אנשים, תקציב וכו')
        8. יש לשמור על הקשר לתחום העיסוק
        9. יש להשתמש בזמן עבר (אלא אם זה תפקיד נוכחי)
        10. יש להימנע מחזרות ומילים מיותרות

        הטקסט המקורי: ${text}

        אנא צור תיאור חדש ואפקטיבי שעומד בכל הכללים שצוינו.
        התשובה צריכה להיות בעברית.
        התשובה צריכה להכיל רק את התיאור החדש, ללא הסברים או הערות נוספות.
      ` : `
        You are a professional CV writer. Your goal is to help users write short, focused, and effective job descriptions.

        Important rules:
        1. Description must be up to 10 words
        2. Description should focus on achievements and impact
        3. Use strong and measurable action verbs (like: led, developed, improved, increased)
        4. Avoid unnecessary connecting words
        5. Focus on results, not processes
        6. Maintain professional and precise language
        7. Add numbers and quantitative data if available (%, number of people, budget etc.)
        8. Keep relevance to the field
        9. Use past tense (unless it's a current position)
        10. Avoid repetitions and unnecessary words

        Original text: ${text}

        Please create a new and effective description that follows all the rules mentioned.
        The response should be in English.
        The response should contain only the new description, without any explanations or additional notes.
      `;

      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'claude-3-haiku-20241022'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      setGeneratedText(data.text);
      setStatus('success');

    } catch (error) {
      console.error('Error generating AI description:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "!w-[90vw] md:!w-[500px]",
        "!p-6",
        "!bg-white",
        "!rounded-2xl",
        "!shadow-xl",
        "!border !border-gray-100",
        isRTL ? "!rtl" : "!ltr"
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            "text-center text-[20px] font-bold",
            "bg-gradient-to-r from-[#4856CD] to-[#4856CD]/90 text-transparent bg-clip-text"
          )}>
            {isRTL ? 'תן ל-AI לעזור לך לנסח' : 'Let AI help you phrase it'}
          </DialogTitle>
          <p className="text-center text-gray-500 text-sm mt-2">
            {isRTL 
              ? 'תאר את התפקיד שלך בחופשיות, ואני אעזור לך לנסח אותו בצורה מקצועית וממוקדת' 
              : 'Describe your role freely, and I\'ll help you phrase it professionally and concisely'}
          </p>
        </DialogHeader>
        
        <div className="mt-6">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className={cn(
                "w-full min-h-[120px] p-4",
                "rounded-xl border border-gray-200",
                "text-[14px] text-gray-900",
                "focus:border-[#4856CD] focus:ring-2 focus:ring-[#4856CD]/10",
                "transition-all duration-200",
                "resize-none"
              )}
              placeholder={isRTL ? 'תאר את התפקיד שלך בחופשיות...' : 'Describe your role freely...'}
              dir={displayLang === 'he' ? 'rtl' : 'ltr'}
            />
            <div className={cn(
              "absolute bottom-2 right-2",
              "text-[12px] text-gray-400",
              wordCount > MAX_WORDS_PER_DESCRIPTION && "text-red-500"
            )}>
              {wordCount}/{MAX_WORDS_PER_DESCRIPTION} {displayLang === 'he' ? 'מילים' : 'words'}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !text}
            className={cn(
              "w-full h-11 mt-4",
              "rounded-xl",
              "text-white text-[14px]",
              "transition-all duration-200",
              "font-medium",
              "shadow-md shadow-[#4856CD]/10",
              "flex items-center justify-center gap-2",
              status === 'generating' ? "bg-[#4856CD]/70" : "bg-[#4856CD] hover:bg-[#4856CD]/95",
              (isLoading || !text) && "opacity-50 cursor-not-allowed"
            )}
          >
            {status === 'generating' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                {displayLang === 'he' ? 'מנסח...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {displayLang === 'he' ? 'צור תיאור חדש' : 'Generate New Description'}
              </>
            )}
          </button>

          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {displayLang === 'he' 
                ? 'אופס! משהו השתבש. נסה שוב' 
                : 'Oops! Something went wrong. Please try again'}
            </div>
          )}

          {generatedText && (
            <div className="mt-6">
              <div className="text-[13px] font-medium text-gray-700 mb-2 flex items-center gap-2">
                {displayLang === 'he' ? 'תיאור חדש:' : 'New Description:'}
                {status === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="relative">
                <textarea
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className={cn(
                    "w-full min-h-[80px] p-4",
                    "rounded-xl border border-gray-200",
                    "text-[14px] text-gray-900",
                    "focus:border-[#4856CD] focus:ring-2 focus:ring-[#4856CD]/10",
                    "transition-all duration-200",
                    "resize-none",
                    "bg-[#4856CD]/[0.02]"
                  )}
                  dir={displayLang === 'he' ? 'rtl' : 'ltr'}
                />
                <div className="text-[12px] text-gray-400 mt-1">
                  {generatedText.trim().split(/\s+/).length}/{MAX_WORDS_PER_DESCRIPTION} {displayLang === 'he' ? 'מילים' : 'words'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "flex-1 h-11",
              "rounded-xl border-2 border-[#4856CD]",
              "text-[#4856CD] text-[14px]",
              "hover:bg-[#4856CD]/[0.02]",
              "transition-all duration-200",
              "font-medium"
            )}
          >
            {isRTL ? 'ביטול' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!generatedText && status !== 'success'}
            className={cn(
              "flex-1 h-11",
              "rounded-xl bg-[#4856CD]",
              "text-white text-[14px]",
              "hover:bg-[#4856CD]/95",
              "transition-all duration-200",
              "font-medium",
              "shadow-md shadow-[#4856CD]/10",
              (!generatedText || status !== 'success') && "opacity-50 cursor-not-allowed"
            )}
          >
            {isRTL ? 'השתמש בתיאור' : 'Use Description'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ExperienceEdit: React.FC<ExperienceEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  displayLang = 'en'
}) => {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);
  const [dateErrors, setDateErrors] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMaxExperiencesWarning, setShowMaxExperiencesWarning] = useState(false);
  const [aiPopupConfig, setAiPopupConfig] = useState<{
    isOpen: boolean;
    experienceIndex: number;
    descriptionIndex: number;
  }>({
    isOpen: false,
    experienceIndex: 0,
    descriptionIndex: 0
  });

  useEffect(() => {
    if (isOpen && data) {
      const sortedExperiences = [...(Array.isArray(data) ? data : [data])].sort((a, b) => {
        const timestampA = getDateTimestamp(a.startDate);
        const timestampB = getDateTimestamp(b.startDate);
        return timestampB - timestampA;
      });
      setExperiences(sortedExperiences);
    }
  }, [data, isOpen]);

  const handleExperienceChange = (index: number, field: keyof ExperienceData, value: any) => {
    if (field === 'description' && Array.isArray(value)) {
      // וידוא שאין יותר מ-3 תיאורים
      if (value.length > MAX_DESCRIPTIONS_PER_ROLE) {
        value = value.slice(0, MAX_DESCRIPTIONS_PER_ROLE);
      }
      
      // בדיקת מספר מילים בכל תיאור
      value = value.map((desc: string) => {
        const words = desc.split(/\s+/);
        if (words.length > MAX_WORDS_PER_DESCRIPTION) {
          return words.slice(0, MAX_WORDS_PER_DESCRIPTION).join(' ');
        }
        return desc;
      });
    }

    setExperiences(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleAddNewExperience = () => {
    if (experiences.length >= MAX_EXPERIENCES) {
      setShowMaxExperiencesWarning(true);
      return;
    }

    const newExperience: ExperienceData = {
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      description: [],
      location: '',
      achievements: []
    };
    setExperiences(prev => [...prev, newExperience]);
    setExpandedItem(String(experiences.length));
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
    setExpandedItem(undefined);
  };

  const handleDateSelect = (index: number, field: 'startDate' | 'endDate', date?: Date) => {
    if (date) {
      const formattedDate = format(date, 'MM/yyyy', { locale: isRTL ? he : enUS });
      handleExperienceChange(index, field, formattedDate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(dateErrors).length > 0) {
      return;
    }

    const updatedExperiences = experiences
      .map(exp => ({
        ...exp,
        position: exp.position.trim(),
        company: exp.company.trim(),
        startDate: exp.startDate.trim(),
        endDate: exp.endDate.trim(),
        location: exp.location?.trim(),
        description: Array.isArray(exp.description) 
          ? exp.description.map(line => line.trim()).filter(line => line !== '')
          : exp.description.trim(),
        achievements: exp.achievements?.filter((a: string) => a.trim() !== '') || []
      }))
      .sort((a, b) => {
        const yearA = parseInt(a.startDate) || 0;
        const yearB = parseInt(b.startDate) || 0;
        return yearB - yearA;
      });

    onSave(updatedExperiences);
    onClose();
  };

  // פונקציה חדשה לבדיקת מספר המילים
  const validateWordCount = (text: string) => {
    return text.trim().split(/\s+/).length <= MAX_WORDS_PER_DESCRIPTION;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
              "!fixed !top-[50%] !left-[50%] !transform !-translate-x-1/2 !-translate-y-1/2",
              "!w-[90vw] md:!w-[600px]",
              "!h-[85vh]",
              "!p-0 !m-0",
              "!bg-white",
              "!rounded-2xl !shadow-xl",
              isRTL ? "!rtl" : "!ltr",
              "!font-assistant",
              "!flex !flex-col !overflow-hidden"
            )}>
              <div className="shrink-0 px-6 py-5 border-b bg-gradient-to-r from-[#4856CD]/[0.03] to-transparent">
                <DialogHeader>
                  <DialogTitle className={cn(
                    "text-center text-[22px] font-bold",
                    "bg-gradient-to-r from-[#4856CD] to-[#4856CD]/90 text-transparent bg-clip-text"
                  )}>
                    {isRTL ? 'ניסיון תעסוקתי' : 'Work Experience'}
                  </DialogTitle>
                </DialogHeader>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                  <Accordion
                    type="single"
                    collapsible
                    value={expandedItem}
                    onValueChange={setExpandedItem}
                    className="space-y-4"
                  >
                    {experiences.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={index.toString()}
                        className={cn(
                          "border border-gray-200/80 rounded-xl overflow-hidden",
                          "hover:border-[#4856CD]/30 transition-colors duration-200",
                          expandedItem === index.toString() && "border-[#4856CD]/30"
                        )}
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg !bg-[#4856CD]/5 flex items-center justify-center">
                              <Briefcase className="w-4 h-4 !text-[#4856CD]" />
                            </div>
                            <div className="!text-right">
                              <h3 className="font-medium !text-[15px] !text-gray-900">
                                {item.position || (isRTL ? 'תפקיד חדש' : 'New Position')}
                              </h3>
                              <p className="!text-[13px] !text-gray-500">
                                {item.company || (isRTL ? 'שם החברה' : 'Company Name')}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            <div className="group">
                              <label className={cn(
                                "block text-[13px] font-medium mb-2",
                                "text-gray-700 group-hover:text-[#4856CD]",
                                "transition-colors duration-200"
                              )}>
                                {isRTL ? 'תפקיד' : 'Position'}
                              </label>
                              <div className="relative w-full">
                                <Input
                                  value={item.position}
                                  onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                  className={cn(
                                    "w-full h-11 bg-white text-[14px] text-gray-900",
                                    "rounded-lg border border-gray-200/80",
                                    "shadow-sm shadow-gray-100/50",
                                    "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                    "focus:ring-2 focus:ring-[#4856CD]/10",
                                    "transition duration-200",
                                    isRTL ? "pr-11" : "pl-11"
                                  )}
                                  placeholder={isRTL ? 'הכנס תפקיד' : 'Enter position'}
                                  dir="auto"
                                />
                                <Briefcase className={cn(
                                  "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                                  "text-gray-400 group-hover:text-[#4856CD]/70",
                                  "transition-colors duration-200",
                                  isRTL ? "right-4" : "left-4"
                                )} />
                              </div>
                            </div>

                            <div className="group">
                              <label className={cn(
                                "block text-[13px] font-medium mb-2",
                                "text-gray-700 group-hover:text-[#4856CD]",
                                "transition-colors duration-200"
                              )}>
                                {isRTL ? 'חברה' : 'Company'}
                              </label>
                              <div className="relative w-full">
                                <Input
                                  value={item.company}
                                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                  className={cn(
                                    "w-full h-11 bg-white text-[14px] text-gray-900",
                                    "rounded-lg border border-gray-200/80",
                                    "shadow-sm shadow-gray-100/50",
                                    "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                    "focus:ring-2 focus:ring-[#4856CD]/10",
                                    "transition duration-200",
                                    isRTL ? "pr-11" : "pl-11"
                                  )}
                                  placeholder={isRTL ? 'הכנס שם חברה' : 'Enter company name'}
                                  dir="auto"
                                />
                                <Building2 className={cn(
                                  "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                                  "text-gray-400 group-hover:text-[#4856CD]/70",
                                  "transition-colors duration-200",
                                  isRTL ? "right-4" : "left-4"
                                )} />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="group">
                                <label className={cn(
                                  "block text-[13px] font-medium mb-2",
                                  "text-gray-700 group-hover:text-[#4856CD]",
                                  "transition-colors duration-200"
                                )}>
                                  {isRTL ? 'תאריך התחלה' : 'Start Date'}
                                </label>
                                <div className="relative w-full">
                                  <DatePicker
                                    selected={item.startDate ? parseDateString(item.startDate) : null}
                                    onChange={(date: Date | null) => date && handleDateSelect(index, 'startDate', date)}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    maxDate={item.endDate ? parseDateString(item.endDate) ?? undefined : undefined}
                                    className={cn(
                                      "w-full h-11 bg-white text-[14px] text-gray-900",
                                      "rounded-lg border border-gray-200/80",
                                      "shadow-sm shadow-gray-100/50",
                                      "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                      "focus:ring-2 focus:ring-[#4856CD]/10",
                                      "transition duration-200",
                                      isRTL ? "pr-11 text-right" : "pl-11",
                                      !item.startDate && "text-gray-400"
                                    )}
                                    placeholderText={isRTL ? 'בחר תאריך' : 'Select date'}
                                    locale={isRTL ? he : enUS}
                                  />
                                  <Calendar className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                                    "text-gray-400 group-hover:text-[#4856CD]/70",
                                    "transition-colors duration-200",
                                    isRTL ? "right-4" : "left-4"
                                  )} />
                                </div>
                              </div>

                              <div className="group">
                                <label className={cn(
                                  "block text-[13px] font-medium mb-2",
                                  "text-gray-700 group-hover:text-[#4856CD]",
                                  "transition-colors duration-200"
                                )}>
                                  {isRTL ? 'תאריך סיום' : 'End Date'}
                                </label>
                                <div className="relative w-full">
                                  <DatePicker
                                    selected={item.endDate ? parseDateString(item.endDate) : null}
                                    onChange={(date: Date | null) => date && handleDateSelect(index, 'endDate', date)}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    minDate={item.startDate ? parseDateString(item.startDate) ?? undefined : undefined}
                                    className={cn(
                                      "w-full h-11 bg-white text-[14px] text-gray-900",
                                      "rounded-lg border border-gray-200/80",
                                      "shadow-sm shadow-gray-100/50",
                                      "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                      "focus:ring-2 focus:ring-[#4856CD]/10",
                                      "transition duration-200",
                                      isRTL ? "pr-11 text-right" : "pl-11",
                                      !item.endDate && "text-gray-400"
                                    )}
                                    placeholderText={isRTL ? 'בחר תאריך' : 'Select date'}
                                    locale={isRTL ? he : enUS}
                                  />
                                  <Calendar className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                                    "text-gray-400 group-hover:text-[#4856CD]/70",
                                    "transition-colors duration-200",
                                    isRTL ? "right-4" : "left-4"
                                  )} />
                                </div>
                              </div>
                            </div>

                            <div className="group">
                              <label className={cn(
                                "block text-[13px] font-medium mb-2",
                                "text-gray-700 group-hover:text-[#4856CD]",
                                "transition-colors duration-200"
                              )}>
                                {isRTL ? 'תיאור התפקיד' : 'Job Description'}
                              </label>
                              <div className="space-y-2">
                                {Array.isArray(item.description) ? item.description.map((line: string, lineIndex: number) => (
                                  <div key={lineIndex} className="space-y-1">
                                    <div className="relative w-full flex items-start gap-2">
                                      <div className="relative flex-1">
                                        <Input
                                          value={line}
                                          onChange={(e) => {
                                            const newValue = e.target.value;
                                            if (validateWordCount(newValue)) {
                                              const newLines = [...item.description];
                                              newLines[lineIndex] = newValue;
                                              handleExperienceChange(index, 'description', newLines);
                                            }
                                          }}
                                          className={cn(
                                            "w-full h-11 bg-white text-[14px] text-gray-900",
                                            "rounded-lg border border-gray-200/80",
                                            "shadow-sm shadow-gray-100/50",
                                            "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                            "focus:ring-2 focus:ring-[#4856CD]/10",
                                            "transition duration-200",
                                            isRTL ? "pr-11" : "pl-11"
                                          )}
                                          placeholder={isRTL ? 'הכנס תיאור (עד 10 מילים)' : 'Enter description (up to 10 words)'}
                                          dir={displayLang === 'he' ? 'rtl' : 'ltr'}
                                        />
                                        <FileText className={cn(
                                          "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                                          "text-gray-400 group-hover:text-[#4856CD]/70",
                                          "transition-colors duration-200",
                                          isRTL ? "right-4" : "left-4"
                                        )} />
                                      </div>
                                      <div className="flex gap-1 mt-0.5">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className={cn(
                                            "h-11 w-11 rounded-lg",
                                            "hover:bg-[#4856CD]/5",
                                            "transition-colors duration-200"
                                          )}
                                          onClick={() => setAiPopupConfig({
                                            isOpen: true,
                                            experienceIndex: index,
                                            descriptionIndex: lineIndex
                                          })}
                                        >
                                          <Sparkles className="w-4 h-4 text-[#4856CD]" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className={cn(
                                            "h-11 w-11 rounded-lg",
                                            "hover:bg-red-50",
                                            "transition-colors duration-200"
                                          )}
                                          onClick={() => {
                                            const newLines = [...item.description];
                                            newLines.splice(lineIndex, 1);
                                            handleExperienceChange(index, 'description', newLines);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                      <div className="flex gap-2">
                                        {lineIndex > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newLines = [...item.description];
                                              const temp = newLines[lineIndex];
                                              newLines[lineIndex] = newLines[lineIndex - 1];
                                              newLines[lineIndex - 1] = temp;
                                              handleExperienceChange(index, 'description', newLines);
                                            }}
                                            className={cn(
                                              "text-[12px] text-gray-500",
                                              "hover:text-[#4856CD]",
                                              "transition-colors duration-200",
                                              "flex items-center gap-1"
                                            )}
                                          >
                                            <ArrowUp className="w-3 h-3" />
                                            {isRTL ? 'העבר למעלה' : 'Move up'}
                                          </button>
                                        )}
                                        {lineIndex < item.description.length - 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newLines = [...item.description];
                                              const temp = newLines[lineIndex];
                                              newLines[lineIndex] = newLines[lineIndex + 1];
                                              newLines[lineIndex + 1] = temp;
                                              handleExperienceChange(index, 'description', newLines);
                                            }}
                                            className={cn(
                                              "text-[12px] text-gray-500",
                                              "hover:text-[#4856CD]",
                                              "transition-colors duration-200",
                                              "flex items-center gap-1"
                                            )}
                                          >
                                            <ArrowDown className="w-3 h-3" />
                                            {isRTL ? 'העבר למטה' : 'Move down'}
                                          </button>
                                        )}
                                      </div>
                                      <div className={cn(
                                        "text-[12px]",
                                        "text-gray-400",
                                        line.trim().split(/\s+/).length > MAX_WORDS_PER_DESCRIPTION && "text-red-500"
                                      )}>
                                        {line.trim().split(/\s+/).length}/{MAX_WORDS_PER_DESCRIPTION} {displayLang === 'he' ? 'מילים' : 'words'}
                                      </div>
                                    </div>
                                  </div>
                                )) : null}
                                {item.description.length < MAX_DESCRIPTIONS_PER_ROLE && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                      "w-full h-11",
                                      "rounded-lg border border-dashed border-gray-200",
                                      "text-[14px] text-gray-500",
                                      "hover:border-[#4856CD]/30 hover:text-[#4856CD]",
                                      "transition-colors duration-200"
                                    )}
                                    onClick={() => {
                                      const currentDescription = Array.isArray(item.description) ? item.description : [];
                                      if (currentDescription.length < MAX_DESCRIPTIONS_PER_ROLE) {
                                        handleExperienceChange(
                                          index,
                                          'description',
                                          [...currentDescription, '']
                                        );
                                      }
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {isRTL ? 'הוסף שורה' : 'Add Line'}
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-11 px-4 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleRemoveExperience(index)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isRTL ? 'מחק משרה' : 'Delete Position'}
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <Button
                    type="button"
                    onClick={handleAddNewExperience}
                    className={cn(
                      "!w-full !p-4 !mt-4",
                      "!bg-white !text-[#4856CD]",
                      "!rounded-xl !border !border-[#4856CD]/30",
                      "hover:!bg-[#4856CD] hover:!text-white",
                      "!transition-all",
                      "!flex !items-center !justify-center !gap-2"
                    )}
                  >
                    <Plus className="!w-4 !h-4" />
                    {isRTL ? 'הוסף עיסוק' : 'Add Position'}
                  </Button>

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
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* פופאפ אזהרה על מקסימום מקומות עבודה */}
          <Dialog open={showMaxExperiencesWarning} onOpenChange={setShowMaxExperiencesWarning}>
            <DialogContent className={cn(
              "!w-[90vw] md:!w-[400px]",
              "!p-6",
              "!bg-white",
              "!rounded-2xl",
              isRTL ? "!rtl" : "!ltr"
            )}>
              <DialogHeader>
                <DialogTitle className="text-center text-[20px] font-bold text-[#4856CD]">
                  {isRTL ? 'אופס! יותר מדי ניסיון זה טוב?' : 'Oops! Too much experience is good?'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4 text-center text-gray-600 text-[14px]">
                {isRTL ? 
                  'מגייסים מעדיפים לראות את שלושת התפקידים האחרונים והרלוונטיים ביותר שלך. בוא נתמקד בהם!' :
                  'Recruiters prefer to see your three most recent and relevant positions. Let\'s focus on those!'}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowMaxExperiencesWarning(false)}
                  className={cn(
                    "w-full h-11",
                    "rounded-lg bg-[#4856CD]",
                    "text-white text-[14px]",
                    "transition-all duration-200"
                  )}
                >
                  {isRTL ? 'הבנתי!' : 'Got it!'}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* פופאפ AI */}
          <AIPopup
            isOpen={aiPopupConfig.isOpen}
            onClose={() => setAiPopupConfig(prev => ({ ...prev, isOpen: false }))}
            onGenerate={(text) => {
              const newLines = [...experiences[aiPopupConfig.experienceIndex].description];
              newLines[aiPopupConfig.descriptionIndex] = text;
              handleExperienceChange(aiPopupConfig.experienceIndex, 'description', newLines);
            }}
            isRTL={isRTL}
            displayLang={displayLang}
            originalText={experiences[aiPopupConfig.experienceIndex]?.description[aiPopupConfig.descriptionIndex] || ''}
          />
        </>
      )}
    </AnimatePresence>
  );
}; 