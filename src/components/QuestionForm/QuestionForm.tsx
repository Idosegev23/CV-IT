"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/theme/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Sparkles, X, HelpCircle } from 'lucide-react';
import { WritingTips } from '@/components/WritingTips';
import Image from 'next/image';
import { ProgressIndicator } from '@/components/QuestionForm/ProgressIndicator';
import { PaymentModal } from '@/components/PaymentModal/PaymentModal';
import { useSessionStore } from '@/store/sessionStore';
import { ValidationPopup } from './ValidationPopup';
import { validateContent, ValidationIssue, validateField, criticalFieldSchemas } from '@/lib/validations';
import { QuestionFormTutorial } from './QuestionFormTutorial';

// Types remain the same as in the original code
export interface Question {
  type: string;
  text: {
    he: string;
    en: string;
  };
  subtitle?: {
    he: string;
    en: string;
  };
  placeholder: {
    he: string;
    en: string;
  };
  required?: boolean;
  ariaLabel?: {
    he: string;
    en: string;
  };
  validationId: string;
  field?: 'email' | 'phone' | 'id';
}

export interface QuestionFormProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => Promise<void>;
  lang: 'he' | 'en';
  sessionId: string;
}

interface HeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  lang: 'he' | 'en';
  showGenie: boolean;
  setShowGenie: (show: boolean) => void;
}

// BackgroundVectors and Header components remain the same
const BackgroundVectors: React.FC = () => (
  <>
    <div className="absolute top-0 right-0 -z-10 w-[72px] md:w-[144px] opacity-30">
      <Image
        src="https://res.cloudinary.com/dsoh3yteb/image/upload/v1732464729/1_i9skom.svg"
        alt=""
        width={144}
        height={272}
        priority
      />
    </div>
    <div className="absolute top-1/4 left-0 -z-10 w-[36px] md:w-[72px] opacity-30">
      <Image
        src="https://res.cloudinary.com/dsoh3yteb/image/upload/v1732464730/2_feaq7j.svg"
        alt=""
        width={72}
        height={205}
        priority
      />
    </div>
    <div className="absolute bottom-0 right-0 -z-10 w-[48px] md:w-[96px] opacity-30">
      <Image
        src="https://res.cloudinary.com/dsoh3yteb/image/upload/v1732464730/3_dr3mew.svg"
        alt=""
        width={96}
        height={252}
        priority
      />
    </div>
    <div className="absolute bottom-0 left-0 -z-10 w-[199px] md:w-[398px] opacity-30">
      <Image
        src="https://res.cloudinary.com/dsoh3yteb/image/upload/v1732464730/Vector_hcx29f.svg"
        alt=""
        width={398}
        height={720}
        priority
      />
    </div>
  </>
);

const Header: React.FC<HeaderProps> = ({
  currentQuestionIndex,
  totalQuestions,
  lang,
  showGenie,
  setShowGenie
}) => (
  <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-primary/10 px-4 py-3 z-50">
    <div className="flex items-center justify-between max-w-7xl mx-auto">
      <div className="bg-[#B78BE6] px-6 py-3 rounded-full">
        <span className="text-white">לוגו</span>
      </div>

      <div className="flex-1 mx-8 bg-[#EAEAE7] px-6 py-3 rounded-full">
        <span className="text-[#4754D6]">
          {lang === 'he' ? 'שאלה' : 'Question'} {currentQuestionIndex + 1}/{totalQuestions}
        </span>
      </div>

      <div className="bg-[#4856CD] px-6 py-3 rounded-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowGenie(!showGenie)}
          className="text-white"
        >
          <Sparkles className={cn(
            "h-5 w-5",
            showGenie ? "text-white" : "text-white"
          )} />
        </Button>
      </div>
    </div>
  </header>
);

// Move QuestionContent outside of QuestionForm
const QuestionContent: React.FC<{
  currentQuestion: Question;
  currentAnswer: string;
  handleAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFocus: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  lang: 'he' | 'en';
  showGenie: boolean;
  setShowGenie: (show: boolean) => void;
  wordCount: number;
}> = ({
  currentQuestion,
  currentAnswer,
  handleAnswerChange,
  handleFocus,
  textareaRef,
  lang,
  showGenie,
  setShowGenie,
  wordCount
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const isRTL = lang === 'he';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4754D7]">
            {currentQuestion.text[lang]}
          </h2>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setShowGenie(!showGenie)}
            className={cn(
              "flex items-center gap-2",
              "px-6 py-3 rounded-full",
              "bg-[#4856CD] text-white",
              "hover:bg-[#4856CD]/90",
              "transition-all duration-200",
              "whitespace-nowrap",
              "shadow-sm hover:shadow-md",
              "relative group",
              isRTL ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className="absolute -top-12 right-0 bg-white text-[#4856CD] px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm whitespace-normal w-48">
              {lang === 'he' 
                ? 'אני אעזור לך לכתוב תשובה מעולה!' 
                : 'I\'ll help you write a great answer!'}
            </div>
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">
              {lang === 'he' ? 'רוצה עזרה בכתיבה?' : 'Need help writing?'}
            </span>
          </button>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={currentAnswer}
          onChange={handleAnswerChange}
          onFocus={handleFocus}
          className={cn(
            "w-full min-h-[200px] p-6",
            "rounded-[44px] bg-white",
            "border border-[#4754D7]/10",
            "text-lg leading-relaxed",
            "focus:border-[#4754D7]/30 focus:ring-2 focus:ring-[#4754D7]/20",
            "transition-all duration-200 outline-none",
            "placeholder:text-[#4754D7]/40",
          )}
          dir={isRTL ? 'rtl' : 'ltr'}
          placeholder={currentQuestion.placeholder[lang]}
          style={{ 
            minHeight: '200px',
            lineHeight: '1.6'
          }}
        />

        <div className={cn(
          "mt-2 text-sm text-[#4754D7]/70",
          isRTL ? "text-right" : "text-left"
        )}>
          {isRTL ? `מילים: ${wordCount}` : `Words: ${wordCount}`}
        </div>
      </div>

      <AnimatePresence>
  {showGenie && (
    <motion.div
      initial={isMobile ? { y: "100%" } : { opacity: 0, x: 20 }}
      animate={isMobile ? { y: "40%" } : { opacity: 1, x: 0 }}
      exit={isMobile ? { y: "100%" } : { opacity: 0, x: 20 }}
      className={cn(
        "bg-[#4856CD]",
        "rounded-[40px]",
        "shadow-lg",
        "border border-white/10",
        "overflow-hidden",
        "text-white",
        
        // מובייל
        "fixed bottom-0 left-0 right-0",
        "w-full",
        "max-w-full",
        "rounded-b-none",
        "max-h-[60vh]",
        
        // דסקטופ
        "md:absolute",
        "md:right-[-40px]",
        "md:top-[115px]",
        "md:w-[300px]",
        "md:min-w-[280px]",
        "md:max-w-[400px]",
        "md:h-auto",
        "md:mt-0",
        "md:rounded-[40px]",
        "md:bottom-auto",
        "md:left-auto",
        "md:max-h-none"
      )}
    >
      {/* אינדיקטור משיכה - רק במובייל */}
      {isMobile && (
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3" />
      )}
      
      {/* כותרת עם כפתור סגירה */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-base font-medium">
            {isRTL ? 'ה-CVIT הפרטי שלך' : 'Your Personal CVIT'}
          </span>
          <Sparkles className="h-5 w-5 text-white" />
        </div>

        <button
          onClick={() => setShowGenie(false)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Image
            src="/design/exitmobilemenu.svg"
            alt="Close"
            width={36}
            height={36}
            className="opacity-90"
          />
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        <WritingTips
          questionType={currentQuestion.type}
          validationId={currentQuestion.validationId}
          content={currentAnswer}
          lang={lang}
          setShowGenie={setShowGenie}
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

// הוספת טיפוס לשגיאות ולידציה
interface ValidationErrors {
  [key: string]: string | undefined;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  onComplete,
  lang = 'he',
  sessionId
}) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenie, setShowGenie] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const isRTL = lang === 'he';
  const supabase = createClientComponentClient();
  const [isMobile, setIsMobile] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showTutorial, setShowTutorial] = useState(() => {
    // בדיקה אם זו הפעם הראשונה שהמשתמש רואה את השאלון
    const hasSeenTutorial = localStorage.getItem('hasSeenQuestionFormTutorial');
    return !hasSeenTutorial;
  });

  const currentQuestion = questions[currentQuestionIndex];

  // Save draft functionality remains the same
  useEffect(() => {
    const saveDraft = () => {
      if (currentAnswer.trim()) {
        localStorage.setItem(`draft_${currentQuestion.type}`, currentAnswer);
      }
    };

    const draftInterval = setInterval(saveDraft, 10000);
    return () => clearInterval(draftInterval);
  }, [currentAnswer, currentQuestion.type]);

  // Restore draft functionality remains the same
  useEffect(() => {
    const savedAnswer = localStorage.getItem(`draft_${currentQuestion.type}`);
    if (savedAnswer && !currentAnswer) {
      setCurrentAnswer(savedAnswer);
    }
  }, [currentQuestionIndex]);

  // Focus the textarea when question changes
  useEffect(() => {
    const focusTextarea = () => {
      if (textareaRef.current) {
        // Use setTimeout to ensure focus works after render
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            
            // Optionally, move cursor to end of text
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }, 100);
      }
    };
  
    focusTextarea();
  }, [currentQuestionIndex]);
  
  const handleComplete = async (finalAnswers: Record<string, string>) => {
    try {
      setIsLoading(true);
      const validationIssues = await validateContent(finalAnswers, lang);
      
      if (validationIssues.length > 0) {
        setValidationIssues(validationIssues);
        setShowValidationPopup(true);
        return;
      }

      if (!sessionId) {
        console.error('No sessionId in store');
        toast.error(
          lang === 'he' 
            ? 'שגיאה: מזהה סשן חסר' 
            : 'Error: Missing session ID'
        );
        return;
      }

      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          content: finalAnswers
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save content');
      }

      setShowPaymentModal(true);

    } catch (error) {
      console.error('Error:', error);
      toast.error(
        lang === 'he' 
          ? 'אירעה שגיאה בשמירת התשובות. אנא נסה שוב.' 
          : 'Error saving answers. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const focusTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    const currentQuestion = questions[currentQuestionIndex];
    
    // בדיקת ולידציה מיידית לשדות קריטיים
    if (currentQuestion.validationId === 'basic' && 
        currentQuestion.type === 'personal_details' && 
        currentQuestion.field) {
      if (['email', 'phone', 'id'].includes(currentQuestion.field)) {
        const validation = validateField(
          currentQuestion.field,
          value,
          lang
        );
        if (!validation.isValid) {
          setValidationErrors(prev => ({
            ...prev,
            [currentQuestion.field!]: validation.message
          }));
        } else {
          setValidationErrors(prev => ({
            ...prev,
            [currentQuestion.field!]: undefined
          }));
        }
      }
    }

    setCurrentAnswer(value);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.validationId]: value
    }));
    
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // בדיקה אם יש שגיאות ולידציה לשדה הנוכחי
    if (currentQuestion.validationId === 'basic' && 
        currentQuestion.type === 'personal_details' && 
        currentQuestion.field) {
      if (['email', 'phone', 'id'].includes(currentQuestion.field)) {
        const validation = validateField(
          currentQuestion.field,
          answers[currentQuestion.validationId] || '',
          lang
        );
        if (!validation.isValid) {
          setValidationErrors(prev => ({
            ...prev,
            [currentQuestion.field!]: validation.message
          }));
          return; // מניעת המשך אם יש שגיאת ולידציה
        }
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer(answers[questions[currentQuestionIndex + 1].type] || '');
      setWordCount(0);
      focusTextarea();
    } else {
      await handleComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // שמירת התשובה הנוכחית לפני המעבר אחורה
      const updatedAnswers = {
        ...answers,
        [currentQuestion.type]: currentAnswer
      };
      localStorage.setItem('cvit_form_answers', JSON.stringify(updatedAnswers));
      setAnswers(updatedAnswers);
      
      setCurrentQuestionIndex(prev => prev - 1);
      const previousQuestionType = questions[currentQuestionIndex - 1].type;
      setCurrentAnswer(updatedAnswers[previousQuestionType] || '');
      setError(null);
    }
  };

  const handleFocus = useCallback(() => {
    if (textareaRef.current) {
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, []);

  const handleValidationUpdate = (field: string, newContent: string) => {
    setAnswers(prev => ({
      ...prev,
      [field]: newContent
    }));
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // שמירת מצב הצפייה במדריך
  useEffect(() => {
    if (!showTutorial) {
      localStorage.setItem('hasSeenQuestionFormTutorial', 'true');
    }
  }, [showTutorial]);

  // שמירת התשובות ב-localStorage בכל פעם שהן מתעדכנות
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('cvit_form_answers', JSON.stringify(answers));
    }
  }, [answers]);

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundVectors />
      <Header
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        lang={lang}
        showGenie={showGenie}
        setShowGenie={setShowGenie}
      />

      <div className="pt-32 pb-24">
        <div className="space-y-6 max-w-7xl mx-auto px-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-[#4754D7]">
                {questions[currentQuestionIndex].text[lang]}
                </h2>
              {questions[currentQuestionIndex].subtitle && (
                <p className="text-[#4754D7]/70">
                  {questions[currentQuestionIndex].subtitle[lang]}
            </p>
          )}
        </div>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={handleAnswerChange}
              onFocus={handleFocus}
              className={cn(
                "w-full min-h-[200px] p-6",
                "rounded-[44px] bg-white",
                "border border-[#4754D7]/10",
                "text-lg leading-relaxed",
                "focus:border-[#4754D7]/30 focus:ring-2 focus:ring-[#4754D7]/20",
                "transition-all duration-200 outline-none",
                "placeholder:text-[#4754D7]/40",
                validationErrors[questions[currentQuestionIndex].field!] ? "border-red-500" : ""
              )}
              dir={lang === 'he' ? 'rtl' : 'ltr'}
              placeholder={questions[currentQuestionIndex].placeholder[lang]}
              aria-label={questions[currentQuestionIndex].ariaLabel?.[lang]}
            />
            {validationErrors[questions[currentQuestionIndex].field!] && (
              <div className="mt-2 text-red-500 text-sm" dir={lang === 'he' ? 'rtl' : 'ltr'}>
                {validationErrors[questions[currentQuestionIndex].field!]}
            </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-primary/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0 || isLoading}
          >
            {lang === 'he' ? 'חזור' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!currentAnswer?.trim() || isLoading}
            className="bg-[#4856CD] text-white hover:bg-[#4856CD]/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentQuestionIndex === questions.length - 1 ? (
              lang === 'he' ? 'סיום' : 'Finish'
            ) : (
              lang === 'he' ? 'הבא' : 'Next'
            )}
          </Button>
              </div>
      </div>

      {showValidationPopup && (
        <ValidationPopup
          issues={validationIssues}
          onClose={() => setShowValidationPopup(false)}
          lang={lang}
          isOpen={showValidationPopup}
          onUpdateAnswer={handleValidationUpdate}
          answers={answers}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          lang={lang}
          isOpen={showPaymentModal}
          isRTL={lang === 'he'}
        />
      )}
    </div>
  );
};