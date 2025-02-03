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
import { Building2, Calendar, Briefcase, GripVertical, Plus, Trash2, MapPin, AlertCircle } from 'lucide-react';
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
  template?: string;
}

const MAX_DESCRIPTION_LENGTH = 200;

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

export const ExperienceEdit: React.FC<ExperienceEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional'
}) => {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);
  const [dateErrors, setDateErrors] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);

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
    setExperiences(prev => {
      const updated = [...prev];
      if (field === 'description' && typeof value === 'string') {
        updated[index] = {
          ...updated[index],
          [field]: value.split('\n')
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return updated;
    });
  };

  const handleAddNewExperience = () => {
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
          style={{
            width: '600px',
            maxWidth: '92vw'
          }}>
            <div className="px-6 py-5 border-b border-[#4856CD]/5 bg-gradient-to-r from-[#4856CD]/[0.03] to-transparent">
              <DialogHeader>
                <DialogTitle className={cn(
                  "text-center text-[22px] font-bold",
                  "bg-gradient-to-r from-[#4856CD] to-[#4856CD]/90 text-transparent bg-clip-text"
                )}>
                  {isRTL ? 'ניסיון תעסוקתי' : 'Work Experience'}
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
                              <div key={lineIndex} className="relative w-full flex items-center gap-2">
                                <Input
                                  value={line}
                                  onChange={(e) => {
                                    const newLines = [...item.description];
                                    newLines[lineIndex] = e.target.value;
                                    handleExperienceChange(index, 'description', newLines);
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
                                  placeholder={isRTL ? 'הכנס תיאור' : 'Enter description'}
                                  dir="auto"
                                />
                                <FileText className={cn(
                                  "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                                  "text-gray-400 group-hover:text-[#4856CD]/70",
                                  "transition-colors duration-200",
                                  isRTL ? "right-4" : "left-4"
                                )} />
                                <div className="flex gap-1">
                                  {lineIndex > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-11 w-11 rounded-lg hover:bg-[#4856CD]/5"
                                      onClick={() => {
                                        const newLines = [...item.description];
                                        const temp = newLines[lineIndex];
                                        newLines[lineIndex] = newLines[lineIndex - 1];
                                        newLines[lineIndex - 1] = temp;
                                        handleExperienceChange(index, 'description', newLines);
                                      }}
                                    >
                                      <ArrowUp className="w-4 h-4 text-gray-500" />
                                    </Button>
                                  )}
                                  {lineIndex < item.description.length - 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-11 w-11 rounded-lg hover:bg-[#4856CD]/5"
                                      onClick={() => {
                                        const newLines = [...item.description];
                                        const temp = newLines[lineIndex];
                                        newLines[lineIndex] = newLines[lineIndex + 1];
                                        newLines[lineIndex + 1] = temp;
                                        handleExperienceChange(index, 'description', newLines);
                                      }}
                                    >
                                      <ArrowDown className="w-4 h-4 text-gray-500" />
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 rounded-lg hover:bg-red-50"
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
                            )) : null}
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
                                handleExperienceChange(
                                  index,
                                  'description',
                                  [...currentDescription, '']
                                );
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {isRTL ? 'הוסף שורה' : 'Add Line'}
                            </Button>
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
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 