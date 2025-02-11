import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/theme/ui/dialog';
import { Input } from '@/components/theme/ui/input';
import { Button } from '@/components/theme/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/theme/ui/accordion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { GraduationCap, BookOpen, Building2, Calendar, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Degree, DegreeType } from '@/types/resume';
import { AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/theme/ui/select";

interface EducationEditProps {
  isOpen: boolean;
  onClose: () => void;
  data: Degree[];
  onSave: (newData: Degree[]) => void;
  isRTL?: boolean;
  template?: string;
}

const EducationEdit: React.FC<EducationEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional',
}) => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string }>({});

  // פונקציה להמרת תאריך מ־MM/yyyy או YYYY לאובייקט Date
  const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const presentValues = ['present', 'היום', 'כיום', 'עד היום', 'current'];
    if (presentValues.includes(dateStr.toLowerCase())) {
      return new Date();
    }
    const mmYYYYRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (mmYYYYRegex.test(dateStr)) {
      const [month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1);
    }
    const yearRegex = /^\d{4}$/;
    if (yearRegex.test(dateStr)) {
      return new Date(parseInt(dateStr), 0);
    }
    return null;
  };

  useEffect(() => {
    if (isOpen && data) {
      const sortedDegrees = [...data].sort((a, b) => {
        const timeA = parseDateString(a.startDate)?.getTime() || 0;
        const timeB = parseDateString(b.startDate)?.getTime() || 0;
        return timeB - timeA; // חדש למעלה
      });
      setDegrees(sortedDegrees);
    }
  }, [data, isOpen]);

  // עדכון שדה בפרטי השכלה
  const handleDegreeChange = (index: number, field: keyof Degree, value: any) => {
    setDegrees(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // טיפול בבחירת תאריך
  const handleDateSelect = (index: number, field: 'startDate' | 'endDate', date: Date | null) => {
    if (!date) return;
    const formattedDate = format(date, 'MM/yyyy', { locale: isRTL ? he : enUS });
    handleDegreeChange(index, field, formattedDate);

    // בדיקת טווח תאריכים
    const currentDegree = degrees[index];
    const startDate = field === 'startDate' ? formattedDate : currentDegree.startDate;
    const endDate = field === 'endDate' ? formattedDate : currentDegree.endDate;
    const start = parseDateString(startDate);
    const end = parseDateString(endDate);

    if (start && end && start.getTime() > end.getTime()) {
      setDateErrors(prev => ({
        ...prev,
        [`${index}-date`]: isRTL
          ? 'תאריך התחלה חייב להיות לפני תאריך סיום'
          : 'Start date must be before end date',
      }));
    } else {
      setDateErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${index}-date`];
        return newErrors;
      });
    }
  };

  // הוספת השכלה חדשה
  const handleAddNewDegree = () => {
    const newDegree: Degree = {
      type: '',
      degreeType: 'academic',
      field: '',
      institution: '',
      startDate: '',
      endDate: '',
      specialization: '',
      grade: ''
    };
    setDegrees(prev => [newDegree, ...prev]);
    setExpandedItem('0');
  };

  // הסרת השכלה
  const handleRemoveDegree = (index: number) => {
    setDegrees(prev => prev.filter((_, i) => i !== index));
    setDateErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${index}-date`];
      return newErrors;
    });
  };

  // שמירה
  const handleSave = () => {
    if (Object.keys(dateErrors).length > 0) return;
    
    const validDegrees = degrees.map(degree => ({
      type: degree.type.trim(),
      degreeType: degree.degreeType || 'academic',
      field: degree.field.trim(),
      institution: degree.institution.trim(),
      startDate: degree.startDate.trim(),
      endDate: degree.endDate.trim(),
      specialization: degree.specialization ? degree.specialization.trim() : '',
      years: `${degree.startDate.trim()} - ${degree.endDate.trim()}`,
      grade: degree.grade || ''
    }));
    
    onSave(validDegrees);
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
                  {isRTL ? 'השכלה' : 'Education'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="px-8 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <Accordion
                type="single"
                collapsible
                value={expandedItem}
                onValueChange={setExpandedItem}
                className="space-y-4"
              >
                {degrees.map((degree, index) => (
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
                          <GraduationCap className="w-4 h-4 !text-[#4856CD]" />
                        </div>
                        <div className="!text-right">
                          <h3 className="font-medium !text-[15px] !text-gray-900">
                            {degree.type || (isRTL ? 'השכלה חדשה' : 'New Education')}
                          </h3>
                          <p className="!text-[13px] !text-gray-500">
                            {degree.institution || (isRTL ? 'שם המוסד' : 'Institution Name')}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {/* סוג התואר */}
                        <div className="group">
                          <label className={cn(
                            "block text-[13px] font-medium mb-2",
                            "text-gray-700 group-hover:text-[#4856CD]",
                            "transition-colors duration-200"
                          )}>
                            {isRTL ? 'סוג התואר' : 'Degree Type'}
                          </label>
                          <div className="relative">
                            <Select
                              value={degree.degreeType}
                              onValueChange={(value) => handleDegreeChange(index, 'degreeType', value as DegreeType)}
                            >
                              <SelectTrigger className={cn(
                                "w-full bg-white text-[#4856CD]",
                                "border-[#4856CD] border-2",
                                "hover:bg-[#4856CD] hover:text-white",
                                "transition-colors",
                                "text-right",
                                "h-11"
                              )}>
                                <SelectValue placeholder={isRTL ? "בחר סוג תואר" : "Select Degree Type"} />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-[#4856CD] border-2" dir={isRTL ? "rtl" : "ltr"}>
                                {[
                                  { value: 'academic', label: { he: 'תואר אקדמי', en: 'Academic Degree' } },
                                  { value: 'certification', label: { he: 'תעודת הסמכה', en: 'Certification' } },
                                  { value: 'course', label: { he: 'קורס', en: 'Course' } },
                                  { value: 'bootcamp', label: { he: 'מחנה הכשרה', en: 'Bootcamp' } },
                                  { value: 'training', label: { he: 'הכשרה מקצועית', en: 'Professional Training' } },
                                  { value: 'other', label: { he: 'אחר', en: 'Other' } },
                                ].map(option => (
                                  <SelectItem 
                                    key={option.value} 
                                    value={option.value}
                                    className={cn(
                                      "text-[#4856CD]",
                                      "hover:bg-[#4856CD] hover:text-white",
                                      "focus:bg-[#4856CD] focus:text-white",
                                      "cursor-pointer transition-colors",
                                      "text-right w-full flex justify-end"
                                    )}
                                  >
                                    {isRTL ? option.label.he : option.label.en}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <GraduationCap className={cn(
                              "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                              "text-gray-400 group-hover:text-[#4856CD]/70",
                              "transition-colors duration-200",
                              isRTL ? "right-4" : "left-4"
                            )} />
                          </div>
                        </div>

                        {/* שם התואר */}
                        <div className="group">
                          <label className={cn(
                            "block text-[13px] font-medium mb-2",
                            "text-gray-700 group-hover:text-[#4856CD]",
                            "transition-colors duration-200"
                          )}>
                            {isRTL ? 'שם התואר' : 'Degree Name'}
                          </label>
                          <div className="relative">
                            <Input
                              value={degree.type}
                              onChange={(e) => handleDegreeChange(index, 'type', e.target.value)}
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
                              placeholder={isRTL ? 'לדוגמה: תואר ראשון' : "e.g. Bachelor's Degree"}
                            />
                            <GraduationCap className={cn(
                              "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                              "text-gray-400 group-hover:text-[#4856CD]/70",
                              "transition-colors duration-200",
                              isRTL ? "right-4" : "left-4"
                            )} />
                          </div>
                        </div>

                        {/* תחום לימודים */}
                        <div className="group">
                          <label className={cn(
                            "block text-[13px] font-medium mb-2",
                            "text-gray-700 group-hover:text-[#4856CD]",
                            "transition-colors duration-200"
                          )}>
                            {isRTL ? 'תחום לימודים' : 'Field of Study'}
                          </label>
                          <div className="relative">
                            <Input
                              value={degree.field}
                              onChange={(e) => handleDegreeChange(index, 'field', e.target.value)}
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
                              placeholder={isRTL ? 'לדוגמה: מדעי המחשב' : 'e.g. Computer Science'}
                            />
                            <BookOpen className={cn(
                              "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                              "text-gray-400 group-hover:text-[#4856CD]/70",
                              "transition-colors duration-200",
                              isRTL ? "right-4" : "left-4"
                            )} />
                          </div>
                        </div>

                        {/* מוסד לימודים */}
                        <div className="group">
                          <label className={cn(
                            "block text-[13px] font-medium mb-2",
                            "text-gray-700 group-hover:text-[#4856CD]",
                            "transition-colors duration-200"
                          )}>
                            {isRTL ? 'מוסד לימודים' : 'Institution'}
                          </label>
                          <div className="relative">
                            <Input
                              value={degree.institution}
                              onChange={(e) => handleDegreeChange(index, 'institution', e.target.value)}
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
                              placeholder={isRTL ? 'לדוגמה: אוניברסיטת תל אביב' : 'e.g. Tel Aviv University'}
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
                                selected={degree.startDate ? parseDateString(degree.startDate) : null}
                                onChange={(date: Date | null) => date && handleDateSelect(index, 'startDate', date)}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                maxDate={degree.endDate ? parseDateString(degree.endDate) ?? undefined : undefined}
                                className={cn(
                                  "w-full h-11 bg-white text-[14px] text-gray-900",
                                  "rounded-lg border border-gray-200/80",
                                  "shadow-sm shadow-gray-100/50",
                                  "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                  "focus:ring-2 focus:ring-[#4856CD]/10",
                                  "transition duration-200",
                                  isRTL ? "pr-11 text-right" : "pl-11",
                                  !degree.startDate && "text-gray-400"
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
                                selected={degree.endDate ? parseDateString(degree.endDate) : null}
                                onChange={(date: Date | null) => date && handleDateSelect(index, 'endDate', date)}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                minDate={degree.startDate ? parseDateString(degree.startDate) ?? undefined : undefined}
                                className={cn(
                                  "w-full h-11 bg-white text-[14px] text-gray-900",
                                  "rounded-lg border border-gray-200/80",
                                  "shadow-sm shadow-gray-100/50",
                                  "hover:border-[#4856CD]/30 focus:border-[#4856CD]",
                                  "focus:ring-2 focus:ring-[#4856CD]/10",
                                  "transition duration-200",
                                  isRTL ? "pr-11 text-right" : "pl-11",
                                  !degree.endDate && "text-gray-400"
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

                        {/* התמחות */}
                        <div className="group">
                          <label className={cn(
                            "block text-[13px] font-medium mb-2",
                            "text-gray-700 group-hover:text-[#4856CD]",
                            "transition-colors duration-200"
                          )}>
                            {isRTL ? 'התמחות (אופציונלי)' : 'Specialization (Optional)'}
                          </label>
                          <div className="relative">
                            <Input
                              value={degree.specialization || ''}
                              onChange={(e) => handleDegreeChange(index, 'specialization', e.target.value)}
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
                              placeholder={isRTL ? 'לדוגמה: הנדסת חשמל' : 'e.g. Electrical Engineering'}
                            />
                            <BookOpen className={cn(
                              "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                              "text-gray-400 group-hover:text-[#4856CD]/70",
                              "transition-colors duration-200",
                              isRTL ? "right-4" : "left-4"
                            )} />
                          </div>
                        </div>

                        {/* ממוצע ציונים */}
                        <div className="group">
                          <label className={cn(
                            "block text-[13px] font-medium mb-2",
                            "text-gray-700 group-hover:text-[#4856CD]",
                            "transition-colors duration-200"
                          )}>
                            {isRTL ? 'ממוצע ציונים (אופציונלי)' : 'GPA (Optional)'}
                          </label>
                          <div className="relative">
                            <Input
                              value={degree.grade || ''}
                              onChange={(e) => handleDegreeChange(index, 'grade', e.target.value)}
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
                              placeholder={isRTL ? 'לדוגמה: 85' : 'e.g. 85'}
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <GraduationCap className={cn(
                              "absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px]",
                              "text-gray-400 group-hover:text-[#4856CD]/70",
                              "transition-colors duration-200",
                              isRTL ? "right-4" : "left-4"
                            )} />
                          </div>
                        </div>

                        {dateErrors[`${index}-date`] && (
                          <p className="text-sm text-red-500">{dateErrors[`${index}-date`]}</p>
                        )}

                        <Button
                          type="button"
                          onClick={() => handleRemoveDegree(index)}
                          variant="ghost"
                          className="h-11 px-4 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isRTL ? 'מחק השכלה' : 'Delete Education'}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Button
                type="button"
                onClick={handleAddNewDegree}
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
                {isRTL ? 'הוסף השכלה' : 'Add Education'}
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

export default EducationEdit;