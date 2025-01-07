import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/theme/ui/dialog';
import { Card } from '@/components/theme/ui/card';
import { Button } from '@/components/theme/ui/button';
import { Input } from '@/components/theme/ui/input';
import { Sparkles, Copy, RefreshCw, Construction } from 'lucide-react';
import { generateLinkedInContent } from '@/lib/openai';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentCreatorDialogProps {
  lang: 'he' | 'en';
}

const funnyLoadingMessages = [
  "מחפש השראה בתיבת הספאם",
  "מתייעץ עם הקפה שהתקרר על השולחן",
  "מנסה להבין מה כולם רוצים מהחיים שלהם בלינקדאין",
  "מחפש את המילים המושלמות בגוגל",
  "מתלבט אם לשים נקודתיים או שלוש נקודות",
  "סופר כמה לייקים קיבלתי בפוסט הקודם",
  "מנסה להישמע חכם (לא עובד בינתיים)",
  "מחפש תירוץ למה לא עניתי להודעה מלפני חודש",
  "מתחיל מחדש בפעם המיליון",
  "בוהה במסך ומחכה להשראה",
  "מנסה להיזכר איך כותבים פוסט מעניין",
  "מחכה שהשראה תיפול מהשמיים"
];

const LoadingAnimation = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % funnyLoadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 mb-4"
      >
        <span className="text-4xl">✨</span>
      </motion.div>
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-gray-600 font-assistant text-center min-h-[24px] text-lg"
      >
        {funnyLoadingMessages[messageIndex]}
      </motion.p>
    </div>
  );
};

export default function ContentCreatorDialog({ lang }: ContentCreatorDialogProps) {
  const isHebrew = lang === 'he';

  return (
    <Card className="p-6 bg-white shadow-lg rounded-2xl border-2 border-[#4754D7]/10">
      <div className="relative">
        <div className="absolute -top-3 right-0 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <Construction className="w-4 h-4" />
          {isHebrew ? 'בבנייה' : 'Coming Soon'}
        </div>
        <h3 className="text-xl font-bold text-[#4754D7] mb-4 mt-4">
          {isHebrew ? 'יוצר תוכן חכם ללינקדאין' : 'LinkedIn Content Creator'}
        </h3>
        <p className="text-gray-600 mb-6">
          {isHebrew 
            ? 'יוצר תוכן מקצועי ומעניין בשבילך באופן אוטומטי' 
            : 'Automatically creates professional and engaging content for you'}
        </p>
        <Button 
          className="w-full bg-[#4754D7] hover:bg-[#3A45C0] text-white rounded-xl py-6 font-medium relative overflow-hidden disabled:opacity-50"
          disabled={true}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>
              {isHebrew ? 'ליצור תוכן חדש' : 'Create New Content'}
            </span>
          </div>
        </Button>
      </div>
    </Card>
  );
} 