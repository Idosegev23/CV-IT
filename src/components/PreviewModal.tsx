'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  isRTL: boolean;
}

const templateImages = {
  'professional': '/design/gallery/pro.png',
  'classic': '/design/gallery/classic.png',
  'general': '/design/gallery/general.png',
  'creative': '/design/gallery/creative.png'
};

const templateContent = {
  'professional': {
    title: 'תבנית מקצועית',
    description: 'תבנית זו תעזור לך להציג את הניסיון והכישורים שלך בצורה מסודרת ומרשימה. מתאימה במיוחד למי שרוצה להדגיש את המקצועיות והרצינות שלו/ה.'
  },
  'classic': {
    title: 'תבנית קלאסית',
    description: 'עיצוב נקי ומסודר שישים את הדגש על הניסיון התעסוקתי שלך. מתאימה למי שמחפש/ת להציג את עצמו/ה בצורה מסורתית ומכובדת.'
  },
  'general': {
    title: 'תבנית כללית',
    description: 'תבנית גמישה שתתאים את עצמה לכל סוג של ניסיון ורקע. אידיאלית למי שנמצא/ת בתחילת הדרך או במעבר קריירה.'
  },
  'creative': {
    title: 'תבנית קריאטיבית',
    description: 'עיצוב ייחודי שיעזור לך לבלוט מעל כולם. מושלמת למי שרוצה להביע את הצד היצירתי והחדשני שלו/ה.'
  }
};

export function PreviewModal({ isOpen, onClose, templateId, isRTL }: PreviewModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  if (!isOpen) return null;

  const imageSrc = templateImages[templateId as keyof typeof templateImages] || '';
  const content = templateContent[templateId as keyof typeof templateContent];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Backdrop with blur */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onAnimationComplete={handleAnimationComplete}
          className="relative w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10 p-2 rounded-full bg-[#B78BE6] text-white hover:bg-[#B78BE6]/90 transition-colors`}
            aria-label={isRTL ? 'סגור' : 'Close'}
          >
            <X size={20} />
          </button>

          {/* Header Content */}
          <div className="p-8 pt-16 pb-0">
            <h2 className="text-2xl font-bold text-[#4856CD] mb-2">
              {content.title}
            </h2>
            <p className="text-[#4B4553] mb-6">
              {content.description}
            </p>
          </div>

          {/* Preview Content */}
          <div className="h-[80vh] overflow-y-auto px-8 pb-8">
            <Image
              src={imageSrc}
              alt={isRTL ? 'תצוגה מקדימה של התבנית' : 'Template preview'}
              width={1000}
              height={1414}
              className="w-full h-auto rounded-2xl"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 