import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/theme/ui/dialog";
import { Dictionary } from "@/dictionaries/dictionary";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface LoadingModalProps {
  isOpen: boolean;
  lang: string;
  dictionary: Dictionary;
  action?: 'generate-pdf' | 'send-cv' | 'send-interview-request' | 'translate-cv' | 'download-pdf';
  isSuccess?: boolean;
  onSuccessClose?: () => void;
}

const getLoadingText = (action: string | undefined, lang: string) => {
  if (lang === 'he') {
    switch (action) {
      case 'generate-pdf':
        return {
          title: 'מכין את קורות החיים שלך',
          description: 'אנחנו מעצבים ומייצאים את קורות החיים שלך לפורמט PDF'
        };
      case 'download-pdf':
        return {
          title: 'מכין את קורות החיים שלך',
          description: 'אנחנו מעצבים את קורות החיים שלך',
          afterDownload: 'לא לדאוג, אחרי שהקובץ יהיה מוכן נראה לך את כל ההטבות שמגיעות לך'
        };
      case 'send-cv':
        return {
          title: 'שולח את קורות החיים להשמה',
          description: 'אנחנו מעבירים את קורות החיים שלך למחלקת ההשמה שלנו'
        };
      case 'send-interview-request':
        return {
          title: 'שולח בקשה להכנה לראיון',
          description: 'אנחנו מעבירים את הבקשה שלך למחלקת הכנה לראיונות'
        };
      case 'translate-cv':
        return {
          title: 'מתרגם את קורות החיים',
          description: 'אנחנו מתרגמים את כל התוכן לאנגלית'
        };
      default:
        return {
          title: 'מעבד את הבקשה שלך',
          description: 'אנחנו עובדים על זה...'
        };
    }
  } else {
    switch (action) {
      case 'generate-pdf':
        return {
          title: 'Preparing Your CV',
          description: 'We are designing and exporting your CV to PDF format'
        };
      case 'download-pdf':
        return {
          title: 'Preparing Your CV',
          description: 'We are designing your CV',
          afterDownload: 'Don\'t worry, after the file is ready we\'ll show you all the benefits you\'re entitled to'
        };
      case 'send-cv':
        return {
          title: 'Sending Your CV for Placement',
          description: 'We are forwarding your CV to our placement department'
        };
      case 'send-interview-request':
        return {
          title: 'Sending Interview Preparation Request',
          description: 'We are forwarding your request to our interview preparation team'
        };
      case 'translate-cv':
        return {
          title: 'Translating Your CV',
          description: 'We are translating all content to English'
        };
      default:
        return {
          title: 'Processing Your Request',
          description: 'We are working on it...'
        };
    }
  }
};

const getFunnyText = (action: string | undefined, lang: string): string[] => {
  if (lang === 'he') {
    switch (action) {
      case 'generate-pdf':
        return [
          'מנסה לשכנע את הפונטים להסתדר יפה',
          'מצייר בין השורות בזהירות',
          'מקפל את הדפים בקיפול אוריגמי',
          'מחפש את המקלדת המוזהבת',
          'מסדר את התמונה שלך בזווית מחמיאה'
        ];
      case 'send-cv':
        return [
          'מאמן את היונת דואר המהירה ביותר',
          'מנסה לשכנע את המייל לעוף מהר יותר',
          'שולח קסמי מזל טוב דרך האינטרנט',
          'מחפש את המעסיק המושלם בין הקבצים',
          'מוסיף קצת נצנצים דיגיטליים'
        ];
      case 'send-interview-request':
        return [
          'מאמן את המראיינים להיות נחמדים במיוחד',
          'מכין את השטיח האדום לראיון שלך',
          'מחמם את הכיסא הכי נוח בחדר הראיונות',
          'מלמד את המראיינים איך לחייך בלי להפחיד',
          'מכין קפה חם למראיינים העתידיים שלך',
          'מתאמן על שאלות קשות מול המראה',
          'מסדר את העניבות של המראיינים',
          'מוודא שיש עוגיות טעימות בחדר הראיונות'
        ];
      case 'translate-cv':
        return [
          'מתווכח עם גוגל על התרגום הנכון',
          'מנסה להסביר לשפות איך לסתדר ביניהן',
          'מתרגם את החיוך שלך לאנגלית',
          'מלמד את המילון מילים חדשות',
          'מתאמן על מבטא בריטי מושלם'
        ];
      case 'download-pdf':
        return [
          'מקפל את הדפים בעדינות',
          'מצחצח את הפונטים לכבוד ההורדה',
          'עוטף את הקובץ במתנה דיגיטלית',
          'מוסיף קצת קסם לפני ההורדה',
          'מכין לך PDF מושלם',
          'מתכונן להראות לך את התוצאה הסופית',
          'אורז את התיק לדף הסיום',
          'מדליק את המנועים לקראת הנחיתה'
        ];
      default:
        return [
          'מבקש מהשרת להזדרז, בבקשה',
          'מנסה לפצח את קוד המורס של המחשב',
          'רץ במסדרונות הדיגיטליים',
          'מחפש את הקסם בין הביטים והבייטים',
          'מנסה לשכנע את האינטרנט לעבוד מה יותר'
        ];
    }
  }
  // English funny texts
  switch (action) {
    case 'generate-pdf':
      return [
        'Convincing fonts to behave nicely',
        'Drawing between the lines carefully',
        'Folding pages in origami style',
        'Looking for the golden keyboard',
        'Adjusting your photo to the perfect angle'
      ];
    case 'send-cv':
      return [
        'Training the fastest carrier pigeon',
        'Persuading emails to fly faster',
        'Sending good luck charms through the internet',
        'Searching for the perfect employer',
        'Adding some digital sparkles'
      ];
    case 'send-interview-request':
      return [
        'Training our interviewers to be extra nice',
        'Rolling out the red carpet for your interview',
        'Warming up the comfiest chair in the interview room',
        'Teaching interviewers how to smile without being scary',
        'Preparing hot coffee for your future interviewers',
        'Practicing tough questions in front of the mirror',
        'Straightening the interviewers\' ties',
        'Making sure there are tasty cookies in the interview room'
      ];
    case 'translate-cv':
      return [
        'Arguing with Google about proper translation',
        'Teaching languages how to get along',
        'Translating your smile to English',
        'Teaching the dictionary new words',
        'Practicing perfect British accent'
      ];
    case 'download-pdf':
      return [
        'Folding pages gently',
        'Polishing fonts for the download',
        'Wrapping file in digital gift paper',
        'Adding some magic before download',
        'Preparing a perfect PDF for you',
        'Getting ready to show you the final result',
        'Packing bags for the finish page',
        'Starting engines for landing'
      ];
    default:
      return [
        'Asking the server to hurry, pretty please',
        'Trying to crack the computer\'s morse code',
        'Running through digital corridors',
        'Finding magic between bits and bytes',
        'Convincing the internet to work faster'
      ];
  }
};

const getSuccessText = (action: string | undefined, lang: string): string[] => {
  if (lang === 'he') {
    switch (action) {
      case 'send-cv':
        return [
          '🎯 קורות החיים שלך בדרך למעסיק המושלם',
          '🌟 עוד מעט הטלפון שלך יתחיל לצלצל',
          '🚀 המסע שלך לעבודה החדשה מתחיל עכשיו',
          '✨ הכישרון שלך עומד להתגלות',
          '🎪 הבמה שלך מוכנה, אנחנו רק מצחצחים את הזרקורים',
          '🎭 המראיינים כבר מתאמנים על חיוך נחמד בשבילך'
        ];
      case 'send-interview-request':
        return [
          '🎯 ההכנה לראיון שלך בדרך להצלחה',
          '🌟 אנחנו כבר מכינים לך את השטיח האדום',
          '🎪 שומרים לך את הכיסא הכי נוח באולם הראיונות',
          '✨ המדריך שלך לראיון כבר מחמם מנועים',
          '🎭 בקרוב תהיה מוכן/ה לכבוש כל ראיון'
        ];
      default:
        return [
          '🌟 הצלחנו! הכל מוכן בשבילך',
          '✨ המשימה הושלמה בהצלחה',
          '🎯 הכל מוכן ומחכה לך',
          '🚀 יצאנו לדרך בהצלחה'
        ];
    }
  } else {
    switch (action) {
      case 'send-cv':
        return [
          '🎯 Your CV is on its way to the perfect employer',
          '🌟 Get ready for your phone to start ringing',
          '🚀 Your journey to your new job starts now',
          '✨ Your talent is about to be discovered',
          '🎪 Your stage is ready, we\'re just polishing the spotlights',
          '🎭 The interviewers are practicing their nice smiles for you'
        ];
      case 'send-interview-request':
        return [
          '🎯 Your interview prep is on track for success',
          '🌟 We\'re rolling out the red carpet for you',
          '🎪 Saving you the comfiest chair in the interview room',
          '✨ Your interview guide is warming up',
          '🎭 Soon you\'ll be ready to ace any interview'
        ];
      default:
        return [
          '🌟 Success! Everything is ready for you',
          '✨ Mission accomplished successfully',
          '🎯 All set and waiting for you',
          '🚀 We\'re off to a great start'
        ];
    }
  }
};

export const LoadingModal: React.FC<LoadingModalProps> = ({ 
  isOpen, 
  lang, 
  dictionary, 
  action,
  isSuccess,
  onSuccessClose,
}) => {
  const loadingText = getLoadingText(action, lang);
  const funnyTexts = isSuccess ? getSuccessText(action, lang) : getFunnyText(action, lang);
  const [funnyIndex, setFunnyIndex] = useState(0);

  const successAnimation = {
    scale: [1, 1.2, 1],
    rotate: [0, 360, 0],
  };

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setFunnyIndex((prev) => (prev + 1) % funnyTexts.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [funnyTexts, isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-md text-center bg-white p-6 border-none shadow-xl rounded-2xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px]"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f7f7ff 100%)',
          boxShadow: '0 10px 30px rgba(71, 84, 214, 0.1)',
        }}
        dir={lang === 'he' ? 'rtl' : 'ltr'}
      >
        <VisuallyHidden asChild>
          <DialogTitle>
            {lang === 'he' ? 'תהליך טעינה' : 'Loading Process'}
          </DialogTitle>
        </VisuallyHidden>

        <VisuallyHidden asChild>
          <DialogDescription>
            {loadingText.description}
          </DialogDescription>
        </VisuallyHidden>

        <div className="relative overflow-hidden rounded-2xl">
          <div className="relative flex flex-col items-center justify-center space-y-6">
            {/* Logo */}
            <div className="relative w-32" aria-hidden="true">
              <motion.div
                animate={isSuccess ? successAnimation : { 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: isSuccess ? 0.5 : 3,
                  repeat: isSuccess ? 0 : Infinity,
                  ease: "easeInOut"
                }}
                className="flex items-center justify-center"
              >
                <Image
                  src={isSuccess ? "/design/success.svg" : "/Wlogo.svg"}
                  alt={isSuccess ? "Success" : "CVIT Logo"}
                  width={80}
                  height={80}
                  className="drop-shadow-lg"
                />
              </motion.div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 max-w-sm text-center">
              <h2 className="text-2xl font-bold text-primary">
                {isSuccess 
                  ? (lang === 'he' ? 'נשלח בהצלחה!' : 'Sent Successfully!')
                  : loadingText.title
                }
              </h2>
              
              <p className="text-sm text-gray-600">
                {isSuccess
                  ? (action === 'download-pdf' 
                      ? loadingText.afterDownload
                      : (lang === 'he' 
                          ? 'קורות החיים שלך נשלחו בהצלחה'
                          : 'Your CV has been sent successfully'
                        )
                    )
                  : loadingText.description
                }
              </p>

              <AnimatePresence mode="wait">
                <motion.p
                  key={funnyIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-base font-medium text-primary"
                  aria-live="polite"
                >
                  {funnyTexts[funnyIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Floating Points */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  x: [0, 15, 0],
                  rotate: [0, 45, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10"
              >
                <Image 
                  src="/design/piont.svg" 
                  alt="" 
                  width={24} 
                  height={24} 
                  className="opacity-60" 
                />
              </motion.div>
              <motion.div
                animate={{
                  y: [0, 20, 0],
                  x: [0, -15, 0],
                  rotate: [0, -45, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 left-10"
              >
                <Image 
                  src="/design/piont.svg" 
                  alt="" 
                  width={20} 
                  height={20} 
                  className="opacity-50" 
                />
              </motion.div>
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  x: [0, -10, 0],
                  rotate: [0, -30, 0],
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 left-10"
              >
                <Image 
                  src="/design/piont.svg" 
                  alt="" 
                  width={16} 
                  height={16} 
                  className="opacity-40" 
                />
              </motion.div>
            </div>
          </div>
        </div>

        {isSuccess && (
          <motion.button
            onClick={onSuccessClose}
            className="mt-6 px-6 py-3 bg-[#4856CD] text-white rounded-full font-medium hover:bg-[#3A45C0] transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {lang === 'he' ? 'הבנתי, תודה!' : 'Got it, thanks!'}
          </motion.button>
        )}
      </DialogContent>
    </Dialog>
  );
}; 