"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/theme/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Sparkles, X, HelpCircle, AlertCircle } from 'lucide-react';
import { WritingTips } from '@/components/WritingTips';
import Image from 'next/image';
import { ProgressIndicator } from '@/components/QuestionForm/ProgressIndicator';
import { PaymentModal } from '@/components/PaymentModal/PaymentModal';
import { useSessionStore } from '@/store/sessionStore';
import { ValidationPopup } from './ValidationPopup';
import { validateContent, ValidationIssue } from '@/lib/validations';
import { QuestionFormTutorial } from './QuestionFormTutorial';
import { validationRules } from '@/lib/validationRules';
import { ValidationRule } from '@/types/form';
import styles from './QuestionForm.module.css';

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
}

// שינוי הגדרת הטיפוס כך שיתמוך בגישה דינמית
type AnswerKeys = 'personal_details' | 'professional_summary' | 'experience' | 'education' | 'skills' | 'languages' | 'military_service';

// שינוי הגדרת הטיפוס כך שיתמוך בגישה דינמית
interface Answers extends Record<string, string> {
  personal_details: string;
  professional_summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  military_service: string;
}

export interface QuestionFormProps {
  questions: Question[];
  onComplete: (answers: Answers) => Promise<void>;
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
}> = ({
  currentQuestion,
  currentAnswer,
  handleAnswerChange,
  handleFocus,
  textareaRef,
  lang,
  showGenie,
  setShowGenie,
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
      </div>
    </div>
  );
};

export const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  onComplete,
  lang = 'he',
  sessionId
}) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => {
    if (typeof window !== 'undefined') {
      const savedAnswers = localStorage.getItem('cvit_form_answers');
      const defaultAnswers: Answers = {
        personal_details: '',
        professional_summary: '',
        experience: '',
        education: '',
        skills: '',
        languages: '',
        military_service: ''
      };
      return savedAnswers ? { ...defaultAnswers, ...JSON.parse(savedAnswers) } : defaultAnswers;
    }
    return {
      personal_details: '',
      professional_summary: '',
      experience: '',
      education: '',
      skills: '',
      languages: '',
      military_service: ''
    };
  });
  const [currentAnswer, setCurrentAnswer] = useState(() => {
    // טעינת התשובה הנוכחית מהתשובות השמורות
    if (typeof window !== 'undefined') {
      const savedAnswers = localStorage.getItem('cvit_form_answers');
      if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers);
        return parsed[questions[currentQuestionIndex]?.type] || '';
      }
    }
    return '';
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenie, setShowGenie] = useState(false);
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
  
  const handleComplete = async (answers: Record<string, string>) => {
    try {
      setIsLoading(true);
      await onComplete(answers as Answers);
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        lang === 'he' 
          ? 'אירעה שגיאה בשמירת הנתונים. אנא נסה שוב.'
          : 'Error saving data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateCriticalFields = (question: Question, answer: string) => {
    if (question.type === 'personal_details') {
      const criticalRules = validationRules.personal_details?.filter(rule => rule.critical) || [];
      const errors: string[] = [];
      
      criticalRules.forEach(rule => {
        if (!rule.validate(answer)) {
          errors.push(rule[lang]);
        }
      });
      
      setValidationErrors(errors);
      return errors.length === 0;
    }
    return true;
  };

  // עזרה בטיפוסים - וידוא שהטיפוס של currentQuestion.type הוא תקין
  const getCurrentQuestionType = (index: number): AnswerKeys => {
    const type = questions[index]?.type;
    return (type as AnswerKeys) || 'personal_details';
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    const questionType = getCurrentQuestionType(currentQuestionIndex);

    // בדיקת ולידציה לפני המעבר לשאלה הבאה
    if (!validateCriticalFields(currentQuestion, currentAnswer)) {
      toast.error(lang === 'he' ? 'יש לתקן את השגיאות לפני המשך' : 'Please fix the errors before continuing');
      return;
    }

    // אם אין תשובה (חוץ משדה השכלה)
    if (!currentAnswer?.trim() && questionType !== 'education') {
      setError(lang === 'he' ? 'נא למלא תשובה' : 'Please fill in an answer');
      return;
    }

    const updatedAnswers = {
      ...answers,
      [questionType]: currentAnswer?.trim()
    } as Answers;

    localStorage.setItem('cvit_form_answers', JSON.stringify(updatedAnswers));
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextType = getCurrentQuestionType(currentQuestionIndex + 1);
      setCurrentAnswer(updatedAnswers[nextType] || '');
      setError(null);
      return;
    }

    // בדיקת ולידציה לפני המעבר לתשלום
    try {
      setIsLoading(true);
      const validationIssues = await validateContent(updatedAnswers, lang);
      
      if (validationIssues.length > 0) {
        setAnswers(updatedAnswers);
        setValidationIssues(validationIssues);
        setShowValidationPopup(true);
        return;
      }

      // בדיקה שיש sessionId
      if (!sessionId) {
        console.error('No sessionId in store');
        toast.error(
          lang === 'he' 
            ? 'שגיאה: מזהה סשן חסר' 
            : 'Error: Missing session ID'
        );
        return;
      }

      console.log('Current sessionId from store:', sessionId);
      console.log('Saving final answers:', updatedAnswers);

      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          content: updatedAnswers
        })
      });

      const data = await response.json();
      console.log('Full API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save content');
      }

      setAnswers(updatedAnswers);
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

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // שמירת התשובה הנוכחית לפני המעבר אחורה
      const updatedAnswers = {
        ...answers,
        [questions[currentQuestionIndex].type]: currentAnswer
      };
      localStorage.setItem('cvit_form_answers', JSON.stringify(updatedAnswers));
      setAnswers(updatedAnswers);
      
      setCurrentQuestionIndex(prev => prev - 1);
      const previousQuestionType = questions[currentQuestionIndex - 1].type;
      setCurrentAnswer(updatedAnswers[previousQuestionType] || '');
      setError(null);
    }
  };

  const handleAnswerChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setCurrentAnswer(newAnswer);
    
    const questionType = getCurrentQuestionType(currentQuestionIndex);
    
    setAnswers(prev => {
      const updated = {
        ...prev,
        [questionType]: newAnswer.trim()
      } as Answers;
      
      // אם זה שדה השכלה, נטפל במקרים מיוחדים
      if (questionType === 'education') {
        const educationContent = newAnswer.trim();
        if (educationContent === 'NO_EDUCATION\nNO_EDUCATION') {
          updated.education = 'NO_EDUCATION';
        } else if (educationContent && educationContent !== 'NO_EDUCATION') {
          // אם יש תוכן חדש שהוא לא NO_EDUCATION, נשתמש בו
          updated.education = educationContent;
        }
      }
      
      localStorage.setItem('cvit_form_answers', JSON.stringify(updated));
      return updated;
    });
    
    if (currentQuestion) {
      validateCriticalFields(currentQuestion, newAnswer);
    }
  }, [currentQuestionIndex, questions, currentQuestion, validateCriticalFields]);

  const handleFocus = useCallback(() => {
    if (textareaRef.current) {
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, []);

  const handleValidationUpdate = (field: string, newContent: string) => {
    const existingContent = answers[field] || '';
    const updatedContent = existingContent.trim() + '\n' + newContent.trim();
    
    setAnswers(prev => ({
      ...prev,
      [field]: updatedContent
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
    <div className="min-h-screen flex items-start">
      {/* קטור רקע */}
      <div 
        className="fixed bottom-0 right-0 w-full h-[75vh] pointer-events-none [mask-image:url('/design/BGvector.svg')] [mask-size:contain] [mask-position:bottom_right] [mask-repeat:no-repeat]"
        style={{
          backgroundColor: 'white',
          opacity: 0.5
        }}
      />

      <div className="w-full py-2 relative z-10">
        {/* מדריך השאלון */}
        <QuestionFormTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          language={lang}
        />

        {/* כפתור עזרה צף */}
        <button
          onClick={() => setShowTutorial(true)}
          className="help-button fixed bottom-8 left-8 bg-gradient-to-r from-[#4856CD] to-[#4856CD]/90 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 z-50"
        >
          <HelpCircle className="w-5 h-5" />
          <span>{lang === 'he' ? 'צריכים עזרה?' : 'Need help?'}</span>
        </button>

        {/* בר התקדמות */}
        <div className="w-full mb-6">
          <ProgressIndicator
            totalSteps={questions.length}
            currentStep={currentQuestionIndex + 1}
            isRTL={false}
          />
        </div>

        {/* קונטיינר ראשי */}
        <div className={cn(
          "max-w-[750px]",
          "mx-auto",
          "rounded-[44px]",
          "bg-white/40 border border-white",
          "p-6",
          "relative",
          "mt-4"
        )}>
          <div className="space-y-6">
            {/* כפתור CVIT בחלק העליון */}
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
                    "px-6 py-2.5",
                    "rounded-full",
                    "bg-transparent",
                    "border-2 border-[#4856CD]",
                    "text-[#4856CD] font-semibold",
                    "hover:bg-[#4856CD]/5",
                    "transition-all duration-200",
                    "flex items-center gap-2",
                    "text-sm",
                    isRTL ? "flex-row-reverse" : "flex-row",
                    "md:px-6 md:py-2.5",
                    "px-4 py-2",
                    "w-fit"
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="md:block">
                    <span className="hidden md:inline">{isRTL ? 'ה-CVIT הפרטי שלך כאן לעזור!' : 'Your CVIT is here to help!'}</span>
                    <span className="md:hidden">CVIT</span>
                  </span>
                </button>
                
                {/* כיתוב נוסף במוביל בלבד */}
                <span className={cn(
                  "md:hidden",
                  "text-[#4856CD]",
                  "text-xs",
                  "mt-1",
                  "whitespace-nowrap",
                  "font-medium",
                  "w-full text-center",
                  "relative",
                  "right-[50%]",
                  "translate-x-[50%]"
                )}>
                  {isRTL ? 'אני כאן לעזור' : 'I\'m here to help'}
                </span>
              </div>
            </div>
            <div className="mb-4">
          
          {currentQuestion.subtitle && (
            <p className="text-sm text-[#4856CD] mt-1">
              {currentQuestion.subtitle[lang]}
            </p>
          )}
        </div>
            {/* שאר התוכן */}
            <textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={handleAnswerChange}
              onFocus={handleFocus}
              className={cn(
                "w-full min-h-[200px]",
                "bg-white",
                "rounded-xl",
                "border border-[#4754D7]/10",
                "p-4",
                "text-lg leading-relaxed",
                "outline-none resize-none",
                "placeholder:text-[#4754D7]/40",
                "focus:border-[#4754D7]/30",
                "transition-colors"
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={currentQuestion.placeholder[lang]}
              style={{ 
                minHeight: '200px',
                lineHeight: '1.6'
              }}
            />

            {/* הודעה מתחת לשדה ההשכלה */}
            {currentQuestion.type === 'education' && (
              <div className="mt-2 text-sm text-gray-500">
                {lang === 'he'
                  ? 'אם אין לך השכלה פורמלית, תוכל לדלג על שדה זה בשלב מאוחר יותר.'
                  : 'If you have no formal education, you can skip this field later.'}
              </div>
            )}
            
            {/* כפתורי ניווט */}
            <div className="flex justify-center gap-4 mt-8">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={handleBack}
                  className={cn(
                    "h-[50px] w-[50px]",
                    "rounded-full",
                    "bg-[#B88AE6]",
                    "flex items-center justify-center",
                    "transition-all"
                  )}
                >
                  {/* חץ חרה */}
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.707 7.70711C15.098 7.31658 15.098 6.68342 14.707 6.29289L8.34315 -0.0710838C7.95262 -0.461615 7.31946 -0.461615 6.92893 -0.0710838C6.53841 0.319447 6.53841 0.952603 6.92893 1.34313L12.5858 7L6.92893 12.6569C6.53841 13.0474 6.53841 13.6805 6.92893 14.0711C7.31946 14.4616 7.95262 14.4616 8.34315 14.0711L14.707 7.70711ZM14 7L0 7L0 9L14 9L14 7Z" fill="white"/>
                  </svg>
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={isLoading}
                className={cn(
                  "h-[50px] w-[175px]",
                  "rounded-full",
                  "bg-[#4856CD]",
                  "text-white font-medium",
                  "flex items-center justify-center",
                  "transition-all",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>
                    {currentQuestionIndex === questions.length - 1
                      ? (lang === 'he' ? 'סיום' : 'Finish')
                      : (lang === 'he' ? 'המשך' : 'Continue')
                    }
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* תיבת WritingTips */}
        <AnimatePresence>
          {showGenie && (
            <motion.div
              initial={isMobile ? { y: "100%" } : { opacity: 0, x: 20 }}
              animate={isMobile ? { y: "10%" } : { opacity: 1, x: 0 }}
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

      {showValidationPopup && (
        <ValidationPopup
          isOpen={showValidationPopup}
          onClose={() => setShowValidationPopup(false)}
          issues={validationIssues}
          onUpdateAnswer={handleValidationUpdate}
          lang={lang}
          answers={answers}
        />
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        isRTL={lang === 'he'}
        lang={lang}
      />

      {/* הצגת שגיאות ולידציה */}
      {validationErrors.length > 0 && (
        <div className="mt-4 space-y-2">
          {validationErrors.map((error, index) => (
            <div key={index} className={styles.validationError}>
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};