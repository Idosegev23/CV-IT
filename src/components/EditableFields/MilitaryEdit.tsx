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
import { Medal, Calendar, Building2, AlertCircle, Plus, Trash2, FileText } from 'lucide-react';
import { MilitaryService } from '@/types/resume';
import { Button } from '@/components/theme/ui/button';

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
                  {isRTL ? 'שירות צבאי' : 'Military Service'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    value={militaryData.role}
                    onChange={(e) => handleDataChange('role', e.target.value)}
                    placeholder={isRTL ? 'תפקיד' : 'Role'}
                    className={cn(
                      "pl-10",
                      "bg-white text-gray-900",
                      "rounded-xl border-gray-200",
                      "focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                    )}
                  />
                  <Medal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <div className="relative">
                  <Input
                    value={militaryData.unit}
                    onChange={(e) => handleDataChange('unit', e.target.value)}
                    placeholder={isRTL ? 'יחידה' : 'Unit'}
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
                      value={militaryData.startDate}
                      onChange={(e) => validateAndUpdateDate('startDate', e.target.value)}
                      placeholder={isRTL ? 'תאריך התחלה (YYYY או MM/YYYY)' : 'Start Date (YYYY or MM/YYYY)'}
                      className={cn(
                        "pl-10",
                        "bg-white text-gray-900",
                        "rounded-xl border-gray-200",
                        "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                        dateErrors['startDate'] && "border-red-500"
                      )}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    {dateErrors['startDate'] && (
                      <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {dateErrors['startDate']}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      value={militaryData.endDate}
                      onChange={(e) => validateAndUpdateDate('endDate', e.target.value)}
                      placeholder={isRTL ? 'תאריך סיום (YYYY או MM/YYYY או היום)' : 'End Date (YYYY or MM/YYYY or Present)'}
                      className={cn(
                        "pl-10",
                        "bg-white text-gray-900",
                        "rounded-xl border-gray-200",
                        "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                        dateErrors['endDate'] && "border-red-500"
                      )}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    {dateErrors['endDate'] && (
                      <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {dateErrors['endDate']}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {isRTL ? 'תיאור השירות' : 'Service Description'}
                    </label>
                    <Button
                      type="button"
                      onClick={handleAddDescription}
                      variant="ghost"
                      size="sm"
                      className="text-[#4856CD]"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {isRTL ? 'הוסף שורה' : 'Add Line'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {militaryData.description.map((desc, index) => (
                      <div key={index} className="relative">
                        <Input
                          value={desc}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                          placeholder={isRTL ? 'תיאור השירות' : 'Service Description'}
                          className={cn(
                            "pl-10 pr-10",
                            "bg-white text-gray-900",
                            "rounded-xl border-gray-200",
                            "focus:border-[#4856CD] focus:ring-[#4856CD]/10"
                          )}
                        />
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 p-1"
                          onClick={() => handleRemoveDescription(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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