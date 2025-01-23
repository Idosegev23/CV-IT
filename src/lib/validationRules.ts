import { ValidationSchemaKey } from '@/lib/validations';
import { ValidationRule } from '@/types/form';

export const validationRules: Record<ValidationSchemaKey, ValidationRule[]> = {
  personal_details: [
    {
      id: 'fullDetails',
      he: 'נדרשים פרטים אישיים מלאים (שם מלא, טלפון, אימייל)',
      en: 'Full personal details required (full name, phone, email)',
      validate: (text: string) => {
        const hasName = /[א-ת]{2,}\s+[א-ת]{2,}|[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(text);
        const hasPhone = /\b0\d{8,9}\b|\+\d{10,}/.test(text);
        const hasEmail = /\b[\w.-]+@[\w.-]+\.\w{2,}\b/.test(text);
        const hasAgeOrBirthDate = /בן\s*\d+|בת\s*\d+|age\s*\d+|\d+\s*years old|\d{1,2}\/\d{1,2}\/\d{2,4}/i.test(text);
        return hasName && hasPhone && hasEmail && hasAgeOrBirthDate;
      },
      questionId: 'personal_details_main'
    },
    {
      id: 'city',
      he: 'נדרשת עיר מגורים',
      en: 'City of residence required',
      validate: (text: string) => {
        return /[א-ת]{2,}|[a-zA-Z]{2,}/.test(text);
      },
      questionId: 'personal_details_address'
    },
    {
      id: 'email',
      he: 'כתובת אימייל לא תקינה',
      en: 'Invalid email address',
      validate: (text: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (!emails) return false;
        return emailRegex.test(emails[0]) && emails[0].length > 5;
      },
      questionId: 'personal_details_main',
      critical: true
    },
    {
      id: 'phone',
      he: 'מספר טלפון לא תקין',
      en: 'Invalid phone number',
      validate: (text: string) => {
        const phoneRegex = /^(?:0[23489]|05[0-9])[0-9]{7}$/;
        const phones = text.match(/0[23489][0-9]{7}|05[0-9][0-9]{7}/);
        if (!phones) return false;
        return phoneRegex.test(phones[0]);
      },
      questionId: 'personal_details_main',
      critical: true
    }
  ],
  
  experience: [
    {
      id: 'jobTitle',
      he: 'נדרש תפקיד לכל משרה',
      en: 'Job title required for each position',
      validate: (text: string) => {
        const companies = text.split(/(?:ב|ו)?(?:הראל|פסגות)/i).filter(Boolean);
        return companies.every(company => {
          return /(מנהל|אחמ"?ש|אחראי|עובד|מפתח|מהנדס|יועץ|מתכנת|ראש צוות|סוכן|נציג|מדריך|בתור|תפקיד)/i.test(company);
        });
      },
      questionId: 'experience_title'
    },
    {
      id: 'dates',
      he: 'נדרשים תאריכי עבודה (שנים בלבד: 2020-2023 או 20-23)',
      en: 'Employment dates required (years only: 2020-2023 or 20-23)',
      validate: (text: string) => {
        const companies = text.split(/(?:ב|ו)?(?:הראל|פסגות)/i).filter(Boolean);
        return companies.every(company => {
          const yearPattern = /(?:19|20)?\d{2}(?:\s*-\s*|\s*(?:ל|עד)\s*|\s+)(?:19|20)?\d{2}|(?:בין\s+)?(?:19|20)?\d{2}(?:\s+(?:ל|עד)\s+)(?:19|20)?\d{2}/;
          return yearPattern.test(company);
        });
      },
      questionId: 'experience_dates'
    },
    {
      id: 'responsibilities',
      he: 'נדרש תיאור קצר של התפקיד (לפחות 3 מילים)',
      en: 'Brief job description required (minimum 3 words)',
      validate: (text: string) => {
        const companies = text.split(/(?:ב|ו)?(?:הראל|פסגות)/i).filter(Boolean);
        return companies.every(company => {
          const words = company
            .replace(/(?:בין|עד|ל|ב|ו|את|של|עם)\s+/g, ' ')
            .split(/\s+/)
            .filter(word => word.length >= 2 && !/^\d+$/.test(word));
          return words.length >= 3;
        });
      },
      questionId: 'experience_description'
    }
  ],

  education: [
    {
      id: 'degree',
      he: 'נדרש תואר/תעודה ושם מוסד הלימודים',
      en: 'Degree/Certificate and institution name required',
      validate: (text: string) => {
        const hasEducation = /(תואר ראשון|תואר שני|תואר|תעודה|הנדסאי|טכנאי|בוגר|מוסמך|דוקטור|degree|certificate|diploma|bachelor|master|phd|bsc|ba|ma|msc)/i.test(text);
        const hasInstitution = /(אוניברסיט[הת]|מכלל[הת]|סמינר|בית ספר|university|college|institute|school|מכון|המרכז|הטכניון)/i.test(text);
        const hasField = text.split(/\s+/).length >= 3;
        
        return hasEducation && hasInstitution && hasField;
      },
      questionId: 'education_degree'
    },
    {
      id: 'years',
      he: 'נדרשות שנות לימוד (2020-2023 או 20-23)',
      en: 'Study period required (2020-2023 or 20-23)',
      validate: (text: string) => {
        const yearPattern = /\b(?:19|20)?\d{2}(?:\s*-\s*|\s*עד\s*|[-\s]+)(?:19|20)?\d{2}\b|\b(?:19|20)\d{2}\b|\b\d{2}\b/;
        return yearPattern.test(text);
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
      he: 'נדרשים פרטי שירות (או ציון שלא רלוונטי)',
      en: 'Service details required (or mark as not applicable)',
      validate: (text: string) => {
        if (/לא רלוונטי|לא שירתתי|פטור|not applicable|exempt/i.test(text)) {
          return true;
        }
        return /(צה"ל|חיל|יחידה|דרגה|תפקיד|idf|unit|rank|role)/i.test(text) && containsYear(text);
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

// פונקציית עזר לבדיקת שנים
function containsYear(text: string): boolean {
  const yearPattern = /\b(19|20)\d{2}\b|\b\d{2}\b/;
  return yearPattern.test(text);
} 