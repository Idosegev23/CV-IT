import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/theme/ui/dialog';
import { Card } from '@/components/theme/ui/card';
import { Button } from '@/components/theme/ui/button';
import { Input } from '@/components/theme/ui/input';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
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
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<{ text: string; imageUrl: string | null }>({ text: '', imageUrl: null });
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = lang === 'he';

  const generateContent = async (userTopic?: string) => {
    setIsLoading(true);
    setTopic('');
    try {
      const content = await generateLinkedInContent(userTopic);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent({ 
        text: isRTL ? 'מצטערים, אירעה שגיאה ביצירת התוכן. אנא נסו שוב.' : 'Sorry, an error occurred. Please try again.',
        imageUrl: null 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetContent = () => {
    setGeneratedContent({ text: '', imageUrl: null });
    setTopic('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // אפשר להוסיף כאן הודעת הצלחה
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-all bg-white border border-gray-100 rounded-2xl">
          <div className="w-full flex flex-col items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-50 flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-gray-600" aria-hidden="true" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-assistant font-semibold text-gray-900">
                {isRTL ? 'יוצרים תוכן ללינקדאין' : 'LinkedIn Content Creator'}
              </h3>
              <p className="text-sm font-assistant text-gray-500 mt-1">
                {isRTL ? 'יוצרים תוכן מקצועי בקליק' : 'Create professional content with one click'}
              </p>
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-[600px] bg-white rounded-2xl border-gray-100 shadow-xl max-h-[90vh] overflow-hidden flex flex-col mx-4 sm:mx-0" 
        dir={isRTL ? 'rtl' : 'ltr'}
        aria-describedby="dialog-description"
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-center text-2xl font-assistant font-semibold text-gray-900">
            {isRTL ? 'יוצרים תוכן מקצועי ללינקדאין' : 'Professional LinkedIn Content Creator'}
          </DialogTitle>
          <p id="dialog-description" className="text-center text-gray-600 mt-2">
            {isRTL ? 'צור תוכן מקצועי ללינקדאין בקלות ובמהירות' : 'Create professional LinkedIn content quickly and easily'}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder={isRTL ? 'על מה נכתוב היום?' : 'What should we write about?'}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-grow font-assistant rounded-xl border-gray-200 shadow-sm"
              />
              <Button
                onClick={() => generateContent(topic)}
                disabled={isLoading}
                className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-sm px-6 font-assistant min-w-[100px] transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? 'יוצרים...' : 'Creating...'}</span>
                  </div>
                ) : (
                  <span>{isRTL ? 'יאללה' : 'Let\'s Go'}</span>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => generateContent()}
                disabled={isLoading}
                className="rounded-xl bg-gray-50 hover:bg-gray-200 text-gray-900 hover:text-gray-900 font-assistant shadow-sm h-11 transition-colors"
              >
                {isRTL ? 'משהו אקראי' : 'Surprise Me'}
              </Button>

              <Button
                onClick={resetContent}
                disabled={isLoading}
                className="rounded-xl bg-gray-50 hover:bg-gray-200 text-gray-900 hover:text-gray-900 font-assistant shadow-sm h-11 transition-colors"
              >
                {isRTL ? 'מתחילים מחדש' : 'Start Over'}
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <LoadingAnimation />
              ) : generatedContent.text && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                    <p className="text-base text-gray-700 font-assistant whitespace-pre-wrap leading-relaxed">
                      {generatedContent.text}
                    </p>
                    {generatedContent.imageUrl && (
                      <div className="mt-6">
                        <img
                          src={generatedContent.imageUrl}
                          alt="Generated content"
                          className="rounded-xl w-full h-48 object-cover shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generatedContent.text)}
                    className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-assistant shadow-sm transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {isRTL ? 'מעתיקים את התוכן' : 'Copy Content'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 