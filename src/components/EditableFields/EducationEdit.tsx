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
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GraduationCap, Calendar, Building2, GripVertical, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { Education, Degree } from '@/types/resume';
import { Button } from '@/components/theme/ui/button';

interface EducationEditProps {
  isOpen: boolean;
  onClose: () => void;
  data: Degree[];
  onSave: (newData: Degree[]) => void;
  isRTL?: boolean;
  template?: string;
}

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

export const EducationEdit: React.FC<EducationEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional'
}) => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);
  const [dateErrors, setDateErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (isOpen && data) {
      // Sort degrees chronologically by start date (most recent first)
      const sortedDegrees = [...(Array.isArray(data) ? data : [data])].sort((a, b) => {
        const yearA = parseInt(a.startDate) || 0;
        const yearB = parseInt(b.startDate) || 0;
        return yearB - yearA; // החדש ביותר למעלה
      });
      setDegrees(sortedDegrees);
    }
  }, [data, isOpen]);

  const validateAndUpdateDate = (index: number, field: 'startDate' | 'endDate', value: string) => {
    const errorKey = `${index}-${field}`;
    const otherField = field === 'startDate' ? 'endDate' : 'startDate';
    const otherValue = degrees[index][otherField];

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
    else if (field === 'endDate' && !isValidDateRange(degrees[index].startDate, value)) {
      newErrors[errorKey] = isRTL 
        ? 'תאריך סיום חייב להיות אחרי תאריך התחלה' 
        : 'End date must be after start date';
    }
    else if (field === 'startDate' && !isValidDateRange(value, degrees[index].endDate)) {
      newErrors[errorKey] = isRTL 
        ? 'תאריך התחלה חייב להיות לפני תאריך סיום' 
        : 'Start date must be before end date';
    }

    setDateErrors(newErrors);
    handleDegreeChange(index, field, value);
  };

  const handleDegreeChange = (index: number, field: keyof Degree, value: string) => {
    setDegrees(prev => {
      const updated = prev.map((deg, i) => 
        i === index ? { ...deg, [field]: value } : deg
      );
      return updated;
    });
  };

  const handleAddNewDegree = () => {
    const newDegree: Degree = {
      type: '',
      field: '',
      institution: '',
      startDate: '',
      endDate: '',
      specialization: ''
    };
    setDegrees(prev => [...prev, newDegree]);
    setExpandedItem(`item-${degrees.length}`);
  };

  const handleRemoveDegree = (index: number) => {
    setDegrees(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for date validation errors
    if (Object.keys(dateErrors).length > 0) {
      return; // Don't submit if there are validation errors
    }

    const updatedDegrees = degrees
      .map(deg => ({
        ...deg,
        type: deg.type.trim(),
        field: deg.field.trim(),
        institution: deg.institution.trim(),
        startDate: deg.startDate.trim(),
        endDate: deg.endDate.trim(),
        specialization: deg.specialization?.trim()
      }))
      // Sort by start date (most recent first)
      .sort((a, b) => {
        const yearA = parseInt(a.startDate) || 0;
        const yearB = parseInt(b.startDate) || 0;
        return yearB - yearA; // החדש ביותר למעלה
      });

    onSave(updatedDegrees);
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
                  {isRTL ? 'השכלה' : 'Education'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <Accordion
                type="single"
                collapsible
                value={expandedItem}
                onValueChange={setExpandedItem}
                className="space-y-2"
              >
                {degrees.map((deg, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-xl bg-white p-2"
                  >
                    <div className="flex items-center justify-between">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {deg.type || (isRTL ? 'תואר חדש' : 'New Degree')}
                            {deg.institution && ` - ${deg.institution}`}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleRemoveDegree(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <AccordionContent className="pt-4 space-y-4">
                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            value={deg.type}
                            onChange={(e) => handleDegreeChange(index, 'type', e.target.value)}
                            placeholder={isRTL ? 'סוג תואר' : 'Degree Type'}
                            className={cn(
                              "pl-10",
                              "bg-white text-gray-900",
                              "rounded-xl border-gray-200",
                              "focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                            )}
                          />
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="relative">
                          <Input
                            value={deg.field}
                            onChange={(e) => handleDegreeChange(index, 'field', e.target.value)}
                            placeholder={isRTL ? 'תחום לימודים' : 'Field of Study'}
                            className={cn(
                              "pl-10",
                              "bg-white text-gray-900",
                              "rounded-xl border-gray-200",
                              "focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                            )}
                          />
                          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="relative">
                          <Input
                            value={deg.institution}
                            onChange={(e) => handleDegreeChange(index, 'institution', e.target.value)}
                            placeholder={isRTL ? 'מוסד לימודים' : 'Institution'}
                            className={cn(
                              "pl-10",
                              "bg-white text-gray-900",
                              "rounded-xl border-gray-200",
                              "focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                            )}
                          />
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <Input
                              value={deg.startDate}
                              onChange={(e) => validateAndUpdateDate(index, 'startDate', e.target.value)}
                              placeholder={isRTL ? 'תאריך התחלה (YYYY או MM/YYYY)' : 'Start Date (YYYY or MM/YYYY)'}
                              className={cn(
                                "pl-10",
                                "bg-white text-gray-900",
                                "rounded-xl border-gray-200",
                                "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                                dateErrors[`${index}-startDate`] && "border-red-500"
                              )}
                            />
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {dateErrors[`${index}-startDate`] && (
                              <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {dateErrors[`${index}-startDate`]}
                              </div>
                            )}
                          </div>

                          <div className="relative">
                            <Input
                              value={deg.endDate}
                              onChange={(e) => validateAndUpdateDate(index, 'endDate', e.target.value)}
                              placeholder={isRTL ? 'תאריך סיום (YYYY או MM/YYYY או היום)' : 'End Date (YYYY or MM/YYYY or Present)'}
                              className={cn(
                                "pl-10",
                                "bg-white text-gray-900",
                                "rounded-xl border-gray-200",
                                "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                                dateErrors[`${index}-endDate`] && "border-red-500"
                              )}
                            />
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {dateErrors[`${index}-endDate`] && (
                              <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {dateErrors[`${index}-endDate`]}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="relative">
                          <Input
                            value={deg.specialization || ''}
                            onChange={(e) => handleDegreeChange(index, 'specialization', e.target.value)}
                            placeholder={isRTL ? 'התמחות (אופציונלי)' : 'Specialization (optional)'}
                            className={cn(
                              "pl-10",
                              "bg-white text-gray-900",
                              "rounded-xl border-gray-200",
                              "focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                            )}
                          />
                          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}

                <Button
                  type="button"
                  onClick={handleAddNewDegree}
                  className={cn(
                    "w-full p-4 mt-4",
                    "bg-gray-100 text-gray-700",
                    "rounded-xl",
                    "hover:bg-gray-200",
                    "transition-colors",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  {isRTL ? 'הוסף תואר' : 'Add Degree'}
                </Button>
              </Accordion>

              <button
                type="submit"
                disabled={Object.keys(dateErrors).length > 0}
                className={cn(
                  "w-full p-4",
                  "bg-[#4856CD] text-white",
                  "rounded-xl",
                  "transition-colors",
                  Object.keys(dateErrors).length > 0 
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#4856CD]/90"
                )}
              >
                {isRTL ? 'שמור' : 'Save'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 