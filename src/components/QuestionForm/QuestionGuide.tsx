import React from 'react';
import { motion } from 'framer-motion';

interface QuestionGuideProps {
  questionType: string;
  validationId: string;
  lang: 'he' | 'en';
}

export const QuestionGuide = ({ questionType, lang }: QuestionGuideProps) => {
  const guides: Record<string, { he: string, en: string }> = {
    personal_details: {
      he: 'טיפ: אל תשכח/י להוסיף מייל מקצועי ולינקדאין מעודכן - זה יכול לעזור!',
      en: 'Tip: Don\'t forget to add a professional email and updated LinkedIn - it can help!'
    },
    professional_summary: {
      he: 'טיפ: ספר/י על ההישגים הכי מרשימים שלך שקשורים לתפקיד שאת/ה רוצה',
      en: 'Tip: Share your most impressive achievements related to the position you want'
    },
    experience: {
      he: 'טיפ: כדאי להשתמש במספרים כשאת/ה מספר/ת על ההצלחות שלך. למשל: ״ניהלתי צוות של 5 אנשים״',
      en: 'Tip: Use numbers when talking about your successes. For example: "Managed a team of 5 people"'
    },
    education: {
      he: 'טיפ: כתוב/י רק על הקורסים שבאמת קשורים לתפקיד - זה עוזר למקד את קורות החיים',
      en: 'Tip: Write only about courses that are truly relevant to the position - it helps focus your CV'
    },
    skills: {
      he: 'טיפ: שים/י את הכישורים החשובים ביותר בהתחלה - זה מה שרואים ראשון',
      en: 'Tip: Put your most important skills first - that\'s what they see first'
    },
    languages: {
      he: 'טיפ: ציין/י כמה טוב את/ה מדבר/ת כל שפה. למשל: ״אנגלית - רמה גבוהה״',
      en: 'Tip: Note how well you speak each language. For example: "English - Advanced level"'
    },
    military_service: {
      he: 'טיפ: התמקד/י בדברים שלמדת בצבא שיכולים לעזור לך בעבודה החדשה',
      en: 'Tip: Focus on things you learned in service that can help in your new job'
    }
  };

  return (
    <div className="text-sm text-[#76D9B9]/70">
      {guides[questionType] && guides[questionType][lang]}
    </div>
  );
};