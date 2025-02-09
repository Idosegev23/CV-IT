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
          'מכינים את חדר האימונים לראיון',
          'מסדרים את הכיסא הכי נוח',
          'מכינים טיפים מנצחים',
          'אוספים את כל הניסיון המקצועי',
          'מארגנים את חומרי ההכנה',
          'מתאימים את התכנית האישית',
          'מכינים תרגילי הדמיה לראיון',
          'מלטשים את התשובות המנצחות'
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
        'Preparing the interview training room',
        'Arranging the comfiest chair',
        'Crafting winning tips',
        'Gathering professional experience',
        'Organizing preparation materials',
        'Customizing your personal plan',
        'Setting up interview simulations',
        'Polishing winning answers'
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
          '🎯 בקשת ההכנה לראיון התקבלה בהצלחה',
          '📧 נשלח מייל עם תכנית הכנה אישית',
          '🌟 נציג מהצוות ייצור קשר בקרוב',
          '✨ במייל מחכה מדריך מקיף להכנה לראיון',
          '💪 כל הכלים להצלחה בראיון נמצאים במייל',
          '🎯 תכנית ההכנה האישית מחכה במייל'
        ];
      case 'translate-cv':
        return [
          '🌍 קורות החיים שלך מדברים עכשיו בשפה חדשה',
          '🎯 התרגום הושלם בהצלחה',
          '✨ קורות החיים שלך מוכנים לכבוש את העולם',
          '🚀 עכשיו אפשר להגיע רחוק יותר',
          '🌟 הכישרון שלך עכשיו נגיש ליותר אנשים'
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
          '🎯 Interview preparation request received successfully',
          '📧 Personal preparation plan sent to your email',
          '🌟 Our team member will contact you soon',
          '✨ A comprehensive interview guide awaits in your email',
          '💪 All tools for interview success are in your email',
          '🎯 Your personal preparation plan is ready in your email'
        ];
      case 'translate-cv':
        return [
          '🌍 Your CV now speaks a new language',
          '🎯 Translation completed successfully',
          '✨ Your CV is ready to conquer the world',
          '🚀 Now you can reach further',
          '🌟 Your talent is now accessible to more people'
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
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {loadingText.title}
                </h3>
                <p className="text-gray-600">
                  {funnyTexts[funnyIndex]}
                </p>
              </motion.div>
            </div>

            {/* Success Button */}
            {isSuccess && onSuccessClose && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6"
              >
                <button
                  onClick={onSuccessClose}
                  className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-full transition-all duration-200 transform hover:scale-105"
                >
                  {lang === 'he' ? 'הבנתי, תודה!' : 'Got it, thanks!'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 