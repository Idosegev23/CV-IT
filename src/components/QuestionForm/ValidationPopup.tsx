import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/theme/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ValidationIssue {
  field: string;
  message: string;
  missingData: string[];
}

interface ValidationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
  onUpdateAnswer: (field: string, value: string) => void;
  lang: 'he' | 'en';
  answers?: Record<string, string>;
}

export const ValidationPopup: React.FC<ValidationPopupProps> = ({
  isOpen,
  onClose,
  issues,
  onUpdateAnswer,
  lang,
  answers = {}
}) => {
  const [currentIssueIndex, setCurrentIssueIndex] = React.useState(0);
  const [answer, setAnswer] = React.useState('');

  if (!issues || issues.length === 0) {
    return null;
  }

  const currentIssue = issues[currentIssueIndex];
  const isRTL = lang === 'he';
  const existingContent = answers[currentIssue.field] || '';

  const handleNext = () => {
    if (answer.trim()) {
      onUpdateAnswer(currentIssue.field, answer);
      setAnswer('');
      
      if (currentIssueIndex < issues.length - 1) {
        setCurrentIssueIndex(prev => prev + 1);
      } else {
        onClose();
        setCurrentIssueIndex(0);
      }
    }
  };

  const getFieldName = (field: string): string => {
    const fieldNames: Record<string, { he: string; en: string }> = {
      personal_details: { he: 'פרטי קשר', en: 'Contact Details' },
      professional_summary: { he: 'על עצמך', en: 'About You' },
      experience: { he: 'ניסיון', en: 'Experience' },
      education: { he: 'לימודים', en: 'Education' },
      skills: { he: 'כישורים', en: 'Skills' },
      languages: { he: 'שפות', en: 'Languages' },
      military_service: { he: 'צבא', en: 'Military Service' }
    };

    return fieldNames[field]?.[lang] || field;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent 
        className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-hidden flex flex-col"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-[#4856CD]">
            <AlertCircle className="w-8 h-8" />
            {lang === 'he' 
              ? 'רגע, שכחנו משהו קטן...'
              : 'Wait, we missed something...'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIssueIndex}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-4 overflow-y-auto flex-1 px-4"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#4856CD]">
                {getFieldName(currentIssue.field)}
              </h3>
              <p className="text-lg text-gray-600">
                {currentIssue.message}
              </p>
              {currentIssue.missingData.length > 0 && (
                <div className="text-base text-gray-500">
                  {lang === 'he' ? 'חסר:' : 'Missing:'} 
                  <ul className="list-disc list-inside mt-2 space-y-2">
                    {currentIssue.missingData.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {existingContent && (
              <div className="bg-gray-50/50 p-3 rounded-lg text-sm">
                <p className="text-sm text-gray-400 mb-1">
                  {lang === 'he' ? 'תוכן קיים:' : 'Existing content:'}
                </p>
                <p className="text-gray-500 text-sm whitespace-pre-wrap">
                  {existingContent}
                </p>
              </div>
            )}

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full min-h-[120px] p-4 rounded-xl border border-[#4856CD]/20 focus:border-[#4856CD] focus:ring-1 focus:ring-[#4856CD] outline-none resize-none"
              placeholder={lang === 'he' 
                ? 'אפשר להשלים את זה כאן...'
                : 'You can complete this here...'}
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                disabled={!answer.trim()}
                className="px-8 py-3 bg-[#4856CD] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4856CD]/90 transition-colors text-base font-medium"
              >
                {currentIssueIndex === issues.length - 1
                  ? (lang === 'he' ? 'סיימנו!' : 'Done!')
                  : (lang === 'he' ? 'הבא' : 'Next')}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}; 