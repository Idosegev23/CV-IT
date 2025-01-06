import { ValidationSchemaKey } from '@/lib/validations';
import { ValidationRule } from '@/types/form';

export const validationRules: Record<ValidationSchemaKey, ValidationRule[]> = {
  personal_details: [
    {
      id: 'fullDetails',
      he: 'פרטים אישיים מלאים (שם, טלפון, אימייל)',
      en: 'Full personal details (name, phone, email)',
      validate: (text: string) => {
        const hasName = /[א-ת]{2,}\s+[א-ת]{2,}|[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(text);
        const hasPhone = /\b0\d{8,9}\b/.test(text);
        const hasEmail = /\b[\w.-]+@[\w.-]+\.\w{2,}\b/.test(text);
        return hasName && hasPhone && hasEmail;
      },
      questionId: 'personal_details_main'
    },
    {
      id: 'city',
      he: 'עיר מגורים',
      en: 'City of residence',
      validate: (text: string) => {
        return /[א-ת]{2,}|[a-zA-Z]{2,}/.test(text);
      },
      questionId: 'personal_details_address'
    }
  ],
  
  experience: [
    {
      id: 'jobTitle',
      he: 'תפקיד/ים',
      en: 'Job title(s)',
      validate: (text: string) => {
        return /(מנל|מפתח|מהנדס|עובד|אחראי|רכז|מדריך|יועץ|מתכנת|ראש צוות|מנכ"ל|סמנכ"ל|דירקטור)/i.test(text) ||
               /(manager|developer|engineer|worker|coordinator|consultant|programmer|team leader|ceo|director)/i.test(text);
      },
      questionId: 'experience_title'
    },
    {
      id: 'dates',
      he: 'תאריכי עבודה',
      en: 'Employment dates',
      validate: (text: string) => {
        return /\b(19|20)\d{2}\s*-\s*(19|20)\d{2}\b|\b(19|20)\d{2}\b/.test(text);
      },
      questionId: 'experience_dates'
    },
    {
      id: 'responsibilities',
      he: 'תיאור אחריות ותפקידים',
      en: 'Job responsibilities description',
      validate: (text: string) => {
        const words = text.split(/\s+/).length;
        const hasActionVerbs = /(ניהול|פיתוח|אחריות|הובלה|תכנון|ביצוע|יישום|managed|developed|led|implemented|designed)/i.test(text);
        return words >= 15 && hasActionVerbs;
      },
      questionId: 'experience_description'
    }
  ],

  education: [
    {
      id: 'degree',
      he: 'תואר/תעודה ומוסד לימודים',
      en: 'Degree/Certificate and institution',
      validate: (text: string) => {
        const hasEducation = /(תואר|תעודה|הנסאי|טכנאי|בוגר|מוסמך|דוקטור|degree|certificate|diploma|bachelor|master|phd)/i.test(text);
        const hasInstitution = /(אוניברסיטת|מכללת|סמינר|בית ספר|university|college|institute|school)/i.test(text);
        return hasEducation && hasInstitution;
      },
      questionId: 'education_degree'
    },
    {
      id: 'years',
      he: 'שנות לימוד',
      en: 'Study period',
      validate: (text: string) => {
        return /\b(19|20)\d{2}\s*-\s*(19|20)\d{2}\b|\b(19|20)\d{2}\b/.test(text);
      },
      questionId: 'education_years'
    }
  ],

  languages: [
    {
      id: 'languageLevels',
      he: 'שפות ורמת שליטה',
      en: 'Languages and proficiency levels',
      validate: (text: string) => {
        const hasLanguage = /(עברית|אנגלית|ערבית|רוסית|צרפתית|hebrew|english|arabic|russian|french)/i.test(text);
        const hasLevel = /(שפת אם|רמה גבוהה|רמה טובה|רמה בינונית|בסיסית|native|fluent|good|intermediate|basic)/i.test(text);
        return hasLanguage && hasLevel;
      },
      questionId: 'languages_proficiency'
    }
  ],

  skills: [
    {
      id: 'technicalSkills',
      he: 'כישורים טכניים',
      en: 'Technical skills',
      validate: (text: string) => {
        const skills = text.split(/[,\n]/).filter(skill => skill.trim().length > 0);
        return skills.length >= 2;
      },
      questionId: 'skills_technical'
    }
  ],

  military_service: [
    {
      id: 'serviceDetails',
      he: 'פרטי שירות צבאי',
      en: 'Military service details',
      validate: (text: string) => {
        return /(צה"ל|חיל|יחידה|דרגה|תפקיד|idf|unit|rank|role)/i.test(text);
      },
      questionId: 'military_details'
    }
  ],

  recommendations: [
    {
      id: 'recommendationDetails',
      he: 'פרטי ממליצים',
      en: 'References details',
      validate: (text: string) => {
        const hasContact = /\b0\d{8,9}\b|\b[\w.-]+@[\w.-]+\.\w{2,}\b/.test(text);
        const hasName = /[א-ת]{2,}\s+[א-ת]{2,}|[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(text);
        return hasContact && hasName;
      },
      questionId: 'recommendations_contacts'
    }
  ],

  highlights: [
    {
      id: 'achievements',
      he: 'הישגים ונקודות בולטות',
      en: 'Achievements and highlights',
      validate: (text: string) => {
        const words = text.split(/\s+/).length;
        return words >= 10;
      },
      questionId: 'highlights_achievements'
    }
  ],

  professional_summary: [
    {
      id: 'summary',
      he: 'תקציר מקצועי',
      en: 'Professional Summary',
      validate: (text: string) => text.length >= 50,
      questionId: 'professional_summary_main'
    }
  ],

  desired_position: [
    {
      id: 'positionDetails',
      he: 'פרטי התפקיד המבוקש',
      en: 'Desired position details',
      validate: (text: string) => {
        const words = text.split(/\s+/).length;
        return words >= 3 && /(תפקיד|משרה|position|job|role)/i.test(text);
      },
      questionId: 'desired_position_main'
    }
  ]
} as const;

export type ValidationRules = typeof validationRules; 