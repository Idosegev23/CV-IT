import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { debounce } from 'lodash';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface WritingTipsProps {
  questionType: string;
  validationId: string;
  content: string;
  lang: 'he' | 'en';
  setShowGenie: (show: boolean) => void;
}

export const WritingTips = ({
  questionType,
  validationId,
  content,
  lang,
  setShowGenie
}: WritingTipsProps) => {
  const isRTL = lang === 'he';
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // אנימציית הג'יני
  const genieVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // אנימציית הניצוצות
  const sparkleVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: [0, 1.2, 1],
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // בדיקה בזמן אמת עם GPT-4
  const checkContent = useCallback(debounce(async (text: string) => {
    if (text.length < 3) {
      setFeedback(isRTL ? 
        'אני ה-CVIT האישי שלך! אשמח לעזור לך לכתוב תשובה מעולה 🤖' : 
        'I\'m your personal CVIT! I\'ll help you write a great answer 🤖'
      );
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/check-content', {
        method: 'POST',
        body: JSON.stringify({
          type: questionType,
          validationId,
          content: text,
          lang
        })
      });
      
      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.error('Error checking content:', error);
      setFeedback(isRTL ? 
        'אופס, נראה שיש לי קצת בעיות קסם... אבל אל דאגה, המשך לכתוב! 🪄' : 
        'Oops, having some magic issues... But keep writing! 🪄'
      );
    } finally {
      setIsLoading(false);
    }
  }, 800), [questionType, validationId, lang]);

  useEffect(() => {
    checkContent(content);
  }, [content, checkContent]);

  return (
    <motion.div
      variants={genieVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      {/* כוכן הטיפים - הסרנו את הכותרת */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "rounded-[40px]",
          "p-4",
          "bg-white/20",
          "border border-white/20",
          "shadow-lg shadow-purple-500/5"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {isRTL ? 'מפעיל את הקסם...' : 'Casting magic...'}
            </span>
          </div>
        ) : (
          <div className={cn(
            "text-sm leading-relaxed",
            "p-3",
            "bg-white/0",
            "text-white"
          )}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {feedback}
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}; 