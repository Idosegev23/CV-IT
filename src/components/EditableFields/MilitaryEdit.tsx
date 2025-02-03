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
import { Medal, Calendar, Building2, AlertCircle, Plus, Trash2, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { MilitaryService } from '@/types/resume';
import { Button } from '@/components/theme/ui/button';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

interface MilitaryEditProps {
  isOpen: boolean;
  onClose: () => void;
  data: MilitaryService | null;
  onSave: (newData: MilitaryService) => void;
  isRTL?: boolean;
  template?: string;
}

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

export const MilitaryEdit: React.FC<MilitaryEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional'
}) => {
  const [militaryData, setMilitaryData] = useState<MilitaryService>({
    role: '',
    unit: '',
    startDate: '',
    endDate: '',
    description: []
  });
  const [dateErrors, setDateErrors] = useState<{[key: string]: string}>({});
  const [expandedItem, setExpandedItem] = useState<string>("0");

  useEffect(() => {
    if (isOpen && data) {
      setMilitaryData(data);
    }
  }, [data, isOpen]);

  const validateAndUpdateDate = (field: 'startDate' | 'endDate', value: string) => {
    const errorKey = field;
    const otherField = field === 'startDate' ? 'endDate' : 'startDate';
    const otherValue = militaryData[otherField];

    // Clear previous error
    const newErrors = { ...dateErrors };
    delete newErrors[errorKey];

    // Auto-format: If user enters two digits that could be a month, add slash before year
    if (/^\d{2}$/.test(value) && !value.includes('/') && parseInt(value) >= 1 && parseInt(value) <= 12) {
      value = value + '/';
    }
    // If user enters 4 digits and it's a valid year, keep it as is
    else if (/^\d{4}$/.test(value)) {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year >= 1900 && year <= currentYear) {
        // Don't modify the value - keep it as a year
      }
    }

    // Validate date format
    if (value && !isValidDateFormat(value)) {
      if (/^\d{4}$/.test(value)) {
        newErrors[errorKey] = isRTL 
          ? 'שנה לא יכולה להיות עתידית' 
          : 'Year cannot be in the future';
      } else {
        newErrors[errorKey] = isRTL 
          ? 'פורמט לא תקין. השתמש ב-YYYY או MM/YYYY' 
          : 'Invalid format. Use YYYY or MM/YYYY';
      }
    }
    // Validate date range
    else if (field === 'endDate' && !isValidDateRange(militaryData.startDate, value)) {
      newErrors[errorKey] = isRTL 
        ? 'תאריך סיום חייב להיות אחרי תאריך התחלה' 
        : 'End date must be after start date';
    }
    else if (field === 'startDate' && !isValidDateRange(value, militaryData.endDate)) {
      newErrors[errorKey] = isRTL 
        ? 'תאריך התחלה חייב להיות לפני תאריך סיום' 
        : 'Start date must be before end date';
    }

    setDateErrors(newErrors);
    handleDataChange(field, value);
  };

  const handleDataChange = (field: keyof MilitaryService, value: string | string[]) => {
    setMilitaryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDescription = () => {
    setMilitaryData(prev => ({
      ...prev,
      description: [...prev.description, '']
    }));
  };

  const handleDescriptionChange = (index: number, value: string) => {
    setMilitaryData(prev => ({
      ...prev,
      description: prev.description.map((desc, i) => i === index ? value : desc)
    }));
  };

  const handleRemoveDescription = (index: number) => {
    setMilitaryData(prev => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for date validation errors
    if (Object.keys(dateErrors).length > 0) {
      return; // Don't submit if there are validation errors
    }

    const updatedData = {
      ...militaryData,
      role: militaryData.role.trim(),
      unit: militaryData.unit.trim(),
      startDate: militaryData.startDate.trim(),
      endDate: militaryData.endDate.trim(),
      description: militaryData.description.map(desc => desc.trim()).filter(Boolean)
    };

    onSave(updatedData);
    onClose();
  };

  const handleDateSelect = (field: 'startDate' | 'endDate', date?: Date) => {
    if (date) {
      try {
        const validDate = new Date(date);
        if (isNaN(validDate.getTime())) {
          console.error('Invalid date:', date);
          return;
        }
        const formattedDate = format(validDate, 'MM/yyyy', { locale: isRTL ? he : enUS });
        handleDataChange(field, formattedDate);
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    }
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
                  {isRTL ? 'שירות צבאי' : 'Military Service'}
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
                        <Medal className="w-4 h-4 !text-[#4856CD]" />
                      </div>
                      <div className="!text-right">
                        <h3 className="font-medium !text-[15px] !text-gray-900">
                          {militaryData.role || (isRTL ? 'תפקיד צבאי' : 'Military Role')}
                        </h3>
                        <p className="!text-[13px] !text-gray-500">
                          {militaryData.unit || (isRTL ? 'יחידה' : 'Unit')}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* תפקיד */}
                      <div className="group">
                        <label className={cn(
                          "block text-[13px] font-medium mb-2",
                          "text-gray-700 group-hover:text-[#4856CD]",
                          "transition-colors duration-200"
                        )}>
                          {isRTL ? 'תפקיד' : 'Role'}
                        </label>
                        <div className="relative">
                          <Input
                            value={militaryData.role}
                            onChange={(e) => handleDataChange('role', e.target.value)}
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
                            placeholder={isRTL ? 'הכנס תפקיד' : 'Enter role'}
                          />
                          <Medal className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                            "text-gray-400 group-hover:text-[#4856CD]/70",
                            "transition-colors duration-200",
                            isRTL ? "right-4" : "left-4"
                          )} />
                        </div>
                      </div>

                      {/* יחידה */}
                      <div className="group">
                        <label className={cn(
                          "block text-[13px] font-medium mb-2",
                          "text-gray-700 group-hover:text-[#4856CD]",
                          "transition-colors duration-200"
                        )}>
                          {isRTL ? 'יחידה' : 'Unit'}
                        </label>
                        <div className="relative">
                          <Input
                            value={militaryData.unit}
                            onChange={(e) => handleDataChange('unit', e.target.value)}
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
                            placeholder={isRTL ? 'הכנס יחידה' : 'Enter unit'}
                          />
                          <Building2 className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                            "text-gray-400 group-hover:text-[#4856CD]/70",
                            "transition-colors duration-200",
                            isRTL ? "right-4" : "left-4"
                          )} />
                        </div>
                      </div>

                      {/* תאריכים */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* תאריך התחלה */}
                        <div className="group">
                          <label className={cn(
                            "block text-[13px] font-medium mb-2",
                            "text-gray-700 group-hover:text-[#4856CD]",
                            "transition-colors duration-200"
                          )}>
                            {isRTL ? 'תאריך התחלה' : 'Start Date'}
                          </label>
                          <div className="relative">
                            <DatePicker
                              selected={militaryData.startDate ? parseDateString(militaryData.startDate) : null}
                              onChange={(date: Date | null) => date && handleDateSelect('startDate', date)}
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                              maxDate={militaryData.endDate ? parseDateString(militaryData.endDate) ?? undefined : undefined}
                              className={cn(
                                "w-full h-11 bg-white text-[14px] text-gray-900",
                                "rounded-lg border border-gray-200/80",
                                "shadow-sm shadow-gray-100/50",
                                "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                "focus:ring-2 focus:ring-[#4856CD]/10",
                                "transition duration-200",
                                isRTL ? "pr-11 text-right" : "pl-11",
                                !militaryData.startDate && "text-gray-400"
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

                        {/* תאריך סיום */}
                        <div className="group">
                          <label className={cn(
                            "block text-[13px] font-medium mb-2",
                            "text-gray-700 group-hover:text-[#4856CD]",
                            "transition-colors duration-200"
                          )}>
                            {isRTL ? 'תאריך סיום' : 'End Date'}
                          </label>
                          <div className="relative">
                            <DatePicker
                              selected={militaryData.endDate ? parseDateString(militaryData.endDate) : null}
                              onChange={(date: Date | null) => date && handleDateSelect('endDate', date)}
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                              minDate={militaryData.startDate ? parseDateString(militaryData.startDate) ?? undefined : undefined}
                              className={cn(
                                "w-full h-11 bg-white text-[14px] text-gray-900",
                                "rounded-lg border border-gray-200/80",
                                "shadow-sm shadow-gray-100/50",
                                "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                "focus:ring-2 focus:ring-[#4856CD]/10",
                                "transition duration-200",
                                isRTL ? "pr-11 text-right" : "pl-11",
                                !militaryData.endDate && "text-gray-400"
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

                      {/* תיאור השירות */}
                      <div className="group">
                        <label className={cn(
                          "block text-[13px] font-medium mb-2",
                          "text-gray-700 group-hover:text-[#4856CD]",
                          "transition-colors duration-200"
                        )}>
                          {isRTL ? 'תיאור השירות' : 'Service Description'}
                        </label>
                        <div className="space-y-2">
                          {militaryData.description.map((desc, index) => (
                            <div key={index} className="relative w-full flex items-center gap-2">
                              <Input
                                value={desc}
                                onChange={(e) => handleDescriptionChange(index, e.target.value)}
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
                                placeholder={isRTL ? 'הכנס תיאור' : 'Enter description'}
                              />
                              <FileText className={cn(
                                "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                                "text-gray-400 group-hover:text-[#4856CD]/70",
                                "transition-colors duration-200",
                                isRTL ? "right-4" : "left-4"
                              )} />
                              <div className="flex gap-1">
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 rounded-lg hover:bg-[#4856CD]/5"
                                    onClick={() => {
                                      const newDesc = [...militaryData.description];
                                      const temp = newDesc[index];
                                      newDesc[index] = newDesc[index - 1];
                                      newDesc[index - 1] = temp;
                                      handleDataChange('description', newDesc);
                                    }}
                                  >
                                    <ArrowUp className="w-4 h-4 text-gray-500" />
                                  </Button>
                                )}
                                {index < militaryData.description.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 rounded-lg hover:bg-[#4856CD]/5"
                                    onClick={() => {
                                      const newDesc = [...militaryData.description];
                                      const temp = newDesc[index];
                                      newDesc[index] = newDesc[index + 1];
                                      newDesc[index + 1] = temp;
                                      handleDataChange('description', newDesc);
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
                                  onClick={() => handleRemoveDescription(index)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
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
                            onClick={handleAddDescription}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {isRTL ? 'הוסף שורה' : 'Add Line'}
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