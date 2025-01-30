import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/theme/ui/dialog';
import { Textarea } from '@/components/theme/ui/textarea';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileText, Wand2, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { CV_CREATION_SYSTEM_PROMPT } from '@/lib/prompts';
import { ResumeData } from '@/types/resume';

interface ProfessionalSummaryEditProps {
  isOpen: boolean;
  onClose: () => void;
  data: string;
  onSave: (newData: string) => void;
  isRTL?: boolean;
  template?: string;
  cvData?: ResumeData;
}

export const ProfessionalSummaryEdit: React.FC<ProfessionalSummaryEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional',
  cvData
}) => {
  const [summary, setSummary] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const MAX_CHARS = 500;

  useEffect(() => {
    if (isOpen && data) {
      setSummary(data);
    }
  }, [data, isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, [summary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(summary.trim());
    onClose();
  };

  const generateSummary = async (action: 'longer' | 'regenerate' | 'shorter') => {
    if (!cvData) {
      console.error('CV data is missing');
      alert(isRTL ? 'מידע קורות החיים חסר' : 'CV data is missing');
      return;
    }

    setIsLoading(true);

    try {
      let prompt = '';
      
      if (action === 'longer') {
        prompt = isRTL ? 
        `אתה מומחה לכתיבת קורות חיים עם יכולת לנתח ולהרחיב תקצירים מקצועיים.
        
המידע הקיים:
שם: ${cvData.personalInfo.name}
תפקיד נוכחי: ${cvData.experience?.[0]?.position || ''}
חברה נוכחית: ${cvData.experience?.[0]?.company || ''}
כישורים טכניים: ${cvData.skills?.technical?.map(s => s.name).join(', ') || ''}
כישורים רכים: ${cvData.skills?.soft?.map(s => s.name).join(', ') || ''}

התקציר הנוכחי:
${summary}

משימה: הרחב את התקציר המקצועי תוך שימוש אך ורק במידע הקיים.

הנחיות:
1. אסור בשום אופן להמציא מידע חדש או הישגים שלא מוזכרים
2. הרחב את התיאור של המידע הקיים בצורה מקצועית יותר
3. שלב מילות מפתח מקצועיות מתוך הכישורים שצוינו
4. שמור על טון מקצועי ומדויק
5. התאם את האורך ל-6-8 שורות
6. שמור על שפת המקור (עברית)

חשוב מאוד: השתמש אך ורק במידע שסופק. אל תמציא או תוסיף מידע שלא קיים בתקציר המקורי.

אנא החזר את התקציר החדש בלבד, ללא הסברים נוספים.`
        :
        `You are a CV writing expert with the ability to analyze and expand professional summaries.
        
Existing information:
Name: ${cvData.personalInfo.name}
Current position: ${cvData.experience?.[0]?.position || ''}
Current company: ${cvData.experience?.[0]?.company || ''}
Technical skills: ${cvData.skills?.technical?.map(s => s.name).join(', ') || ''}
Soft skills: ${cvData.skills?.soft?.map(s => s.name).join(', ') || ''}

Current summary:
${summary}

Task: Expand the professional summary using ONLY the existing information.

Guidelines:
1. DO NOT invent new information or achievements that aren't mentioned
2. Expand the description of existing information more professionally
3. Incorporate professional keywords from the listed skills
4. Maintain a professional and precise tone
5. Adjust length to 6-8 lines
6. Keep the original language (English)

IMPORTANT: Use ONLY the provided information. Do not invent or add information that doesn't exist in the original summary.

Please return only the new summary, without additional explanations.`;

      } else if (action === 'shorter') {
        prompt = isRTL ?
        `אתה מומחה לכתיבת קורות חיים עם יכולת לנתח ולתמצת תקצירים מקצועיים.
        
המידע הקיים:
שם: ${cvData.personalInfo.name}
תפקיד נוכחי: ${cvData.experience?.[0]?.position || ''}
חברה נוכחית: ${cvData.experience?.[0]?.company || ''}
כישורים טכניים: ${cvData.skills?.technical?.map(s => s.name).join(', ') || ''}
כישורים רכים: ${cvData.skills?.soft?.map(s => s.name).join(', ') || ''}

התקציר הנוכחי:
${summary}

משימה: קצר את התקציר המקצועי תוך שימוש אך ורק במידע הקיים.

הנחיות:
1. אסור בשום אופן להמציא מידע חדש
2. התמקד בעובדות המרכזיות ביותר מתוך התקציר הקיים
3. שמור על מילות מפתח חיוניות מתוך הכישורים שצוינו
4. הימנע מחזרות ומידע לא הכרחי
5. התאם את האורך ל-3-4 שורות
6. שמור על שפת המקור (עברית)

חשוב מאוד: השתמש אך ורק במידע שסופק. אל תמציא או תוסיף מידע שלא קיים בתקציר המקורי.

אנא החזר את התקציר החדש בלבד, ללא הסברים נוספים.`
        :
        `You are a CV writing expert with the ability to analyze and condense professional summaries.
        
Existing information:
Name: ${cvData.personalInfo.name}
Current position: ${cvData.experience?.[0]?.position || ''}
Current company: ${cvData.experience?.[0]?.company || ''}
Technical skills: ${cvData.skills?.technical?.map(s => s.name).join(', ') || ''}
Soft skills: ${cvData.skills?.soft?.map(s => s.name).join(', ') || ''}

Current summary:
${summary}

Task: Shorten the professional summary using ONLY the existing information.

Guidelines:
1. DO NOT invent new information
2. Focus on the most crucial facts from the existing summary
3. Maintain essential keywords from the listed skills
4. Avoid repetition and non-essential information
5. Adjust length to 3-4 lines
6. Keep the original language (English)

IMPORTANT: Use ONLY the provided information. Do not invent or add information that doesn't exist in the original summary.

Please return only the new summary, without additional explanations.`;

      } else {
        prompt = isRTL ? 
        `אתה מומחה לכתיבת קורות חיים עם יכולת לנתח ולשכתב תקצירים מקצועיים באופן יצירתי.
        
המידע הקיים:
שם: ${cvData.personalInfo.name}
תפקיד נוכחי: ${cvData.experience?.[0]?.position || ''}
חברה נוכחית: ${cvData.experience?.[0]?.company || ''}
כישורים טכניים: ${cvData.skills?.technical?.map(s => s.name).join(', ') || ''}
כישורים רכים: ${cvData.skills?.soft?.map(s => s.name).join(', ') || ''}

התקציר הנוכחי:
${summary}

משימה: צור גרסה חדשה ורעננה של התקציר המקצועי תוך שימוש אך ורק במידע הקיים.

הנחיות:
1. אסור בשום אופן להמציא מידע חדש או הישגים שלא מוזכרים
2. הצג את המידע הקיים מזווית חדשה ומעניינת
3. השתמש בשפה מקצועית עדכנית לתיאור הכישורים והניסיון הקיימים
4. הדגש את היתרונות התחרותיים שעולים מהמידע הקיים
5. שמור על איזון בין פירוט לתמציתיות
6. התאם את האורך ל-4-6 שורות
7. שמור על שפת המקור (עברית)

חשוב מאוד: השתמש אך ורק במידע שסופק. אל תמציא או תוסיף מידע שלא קיים בתקציר המקורי.

אנא החזר את התקציר החדש בלבד, ללא הסברים נוספים.`
        :
        `You are a CV writing expert with the ability to analyze and creatively rewrite professional summaries.
        
Existing information:
Name: ${cvData.personalInfo.name}
Current position: ${cvData.experience?.[0]?.position || ''}
Current company: ${cvData.experience?.[0]?.company || ''}
Technical skills: ${cvData.skills?.technical?.map(s => s.name).join(', ') || ''}
Soft skills: ${cvData.skills?.soft?.map(s => s.name).join(', ') || ''}

Current summary:
${summary}

Task: Create a fresh version of the professional summary using ONLY the existing information.

Guidelines:
1. DO NOT invent new information or achievements that aren't mentioned
2. Present the existing information from a new and interesting angle
3. Use up-to-date professional language to describe existing skills and experience
4. Emphasize competitive advantages evident from the existing information
5. Maintain balance between detail and conciseness
6. Adjust length to 4-6 lines
7. Keep the original language (English)

IMPORTANT: Use ONLY the provided information. Do not invent or add information that doesn't exist in the original summary.

Please return only the new summary, without additional explanations.`;
      }

      try {
        const response = await fetch('/api/summaryeditor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            temperature: 0.7,
            max_tokens: 500
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.content) {
          throw new Error('No content in response');
        }

        setSummary(data.content.trim());
      } catch (error: any) {
        console.error('Summary generation error:', error);
        throw new Error('Failed to generate summary: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert(isRTL ? 'אירעה שגיאה ביצירת התקציר. אנא נסה שוב.' : 'Error generating summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                  {isRTL ? 'תקציר מקצועי' : 'Professional Summary'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-lg font-medium">
                    {isRTL ? 'ספר על עצמך ועל הניסיון המקצועי שלך' : 'Tell about yourself and your professional experience'}
                  </h3>
                </div>

                <Textarea
                  ref={textareaRef}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value.slice(0, MAX_CHARS))}
                  placeholder={isRTL ? 'הכנס תקציר מקצועי...' : 'Enter professional summary...'}
                  className={cn(
                    "p-4 overflow-hidden",
                    "bg-white text-gray-900",
                    "rounded-xl border-gray-200",
                    "focus:border-[#4856CD] focus:ring-[#4856CD]/10",
                    "resize-none",
                    "min-h-[100px]",
                    isLoading && "opacity-50"
                  )}
                  dir="auto"
                  style={{
                    height: 'auto',
                    minHeight: '100px'
                  }}
                  disabled={isLoading}
                  maxLength={MAX_CHARS}
                />

                <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                  <div>
                    {isRTL ? 'טיפ: כתוב תקציר קצר וממוקד שמתאר את הניסיון והכישורים העיקריים שלך' : 'Tip: Write a short and focused summary that describes your main experience and skills'}
                  </div>
                  <div className={cn(
                    "text-right",
                    summary.length >= MAX_CHARS && "text-red-500"
                  )}>
                    {summary.length}/{MAX_CHARS}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => generateSummary('longer')}
                    disabled={isLoading}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5",
                      "rounded-full bg-[#4856CD]/5 text-[#4856CD]",
                      "hover:bg-[#4856CD]/10 transition-colors text-sm",
                      "border border-[#4856CD]/10",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ArrowUpWideNarrow className="w-4 h-4" />
                    {isRTL ? 'הארך את התקציר' : 'Make it longer'}
                  </button>
                  
                  <button
                    onClick={() => generateSummary('regenerate')}
                    disabled={isLoading}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5",
                      "rounded-full bg-[#4856CD]/5 text-[#4856CD]",
                      "hover:bg-[#4856CD]/10 transition-colors text-sm",
                      "border border-[#4856CD]/10",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Wand2 className="w-4 h-4" />
                    {isRTL ? 'צור מחדש' : 'Regenerate'}
                  </button>

                  <button
                    onClick={() => generateSummary('shorter')}
                    disabled={isLoading}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5",
                      "rounded-full bg-[#4856CD]/5 text-[#4856CD]",
                      "hover:bg-[#4856CD]/10 transition-colors text-sm",
                      "border border-[#4856CD]/10",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ArrowDownWideNarrow className="w-4 h-4" />
                    {isRTL ? 'קצר את התקציר' : 'Make it shorter'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 px-4 py-2.5",
                    "rounded-full border-2 border-[#4856CD]",
                    "text-[#4856CD] hover:bg-[#4856CD]/5",
                    "transition-colors font-medium",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isRTL ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 px-4 py-2.5",
                    "rounded-full bg-[#4856CD]",
                    "text-white hover:bg-[#4856CD]/90",
                    "transition-colors font-medium",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading 
                    ? (isRTL ? 'מעבד...' : 'Processing...') 
                    : (isRTL ? 'שמירה' : 'Save')
                  }
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 