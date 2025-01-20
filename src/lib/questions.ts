import { ValidationSchemaKey } from './validations';

export interface Question {
  key: string;
  type: ValidationSchemaKey;
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

export const questions: Question[] = [
  {
    key: 'personal_details',
    type: 'personal_details',
    text: {
      he: 'נתחיל מהפרטים הבסיסיים',
      en: 'Let\'s start with the basics'
    },
    subtitle: {
      he: 'פרטי קשר - שם, טלפון, מייל, כתובת, לינקדאין',
      en: 'Contact info - Name, phone, email, address, LinkedIn'
    },
    placeholder: {
      he: 'שלום! שמי ישראל, מתגורר בתל אביב. ניתן ליצור קשר במספר 052-1234567 או במייל israel@gmail.com. פרופיל לינקדאין: linkedin.com/in/israel',
      en: 'Hi! I\'m John, living in Tel Aviv. You can reach me at +972-52-1234567 or email me at john@gmail.com. Here\'s my LinkedIn: linkedin.com/in/john'
    },
    validationId: 'personal_details_main'
  },
  {
    key: 'professional_summary',
    type: 'professional_summary',
    text: {
      he: 'מה הניסיון והחוזקות המקצועיות?',
      en: 'What are your professional strengths?'
    },
    subtitle: {
      he: 'תיאור קצר של הניסיון והיכולות המקצועיות (2-3 משפטים)',
      en: 'Brief description of your experience and capabilities (2-3 sentences)'
    },
    placeholder: {
      he: 'ניסיון של 7 שנים בניהול פרויקטים, עם יכולת מוכחת בהובלת צוותים להצלחה. מומחיות בניהול משימות ופתרון בעיות מורכבות.',
      en: 'Seven years of project management experience, with proven ability in leading teams to success. Expert in task management and complex problem solving.'
    },
    validationId: 'professional_summary_main'
  },
  {
    key: 'work_experience',
    type: 'experience',
    text: {
      he: 'ניסיון תעסוקתי',
      en: 'Work Experience'
    },
    subtitle: {
      he: 'פירוט הניסיון התעסוקתי והתפקידים הקודמים, כולל תאריכי התחלה וסיום בכל תפקיד',
      en: 'Details about your previous positions and roles, including start and end dates for each role'
    },
    placeholder: {
      he: 'תפקיד אחרון: ניהול פרויקטים בחברת ABC (2021-היום), הובלת צוות של 12 מפתחים והשקת 4 מוצרים חדשים. לפני כן: תפקיד ב-XYZ (2018-2021), שם הובלתי לשיפור של 40% בתפוקת הצוות.',
      en: 'Latest role: Project Manager at ABC (2021-present), led a team of 12 developers and launched 4 new products. Previously at XYZ (2018-2021), where I achieved 40% improvement in team productivity.'
    },
    validationId: 'experience_main'
  },
  {
    key: 'education',
    type: 'education',
    text: {
      he: 'השכלה והכשרה מקצועית',
      en: 'Education and Professional Training'
    },
    subtitle: {
      he: 'פירוט ההשכלה, תארים והכשרות מקצועיות, כולל שנות הלימוד וקבלת ההסמכות',
      en: 'Details about your education and professional certifications, including years of study and certification dates'
    },
    placeholder: {
      he: 'תואר במדעי המחשב מאוניברסיטת תל אביב (2015-2018), ממוצע 88. הסמכות נוספות: PMP (2020) ו-Scrum Master (2021).',
      en: 'Computer Science degree from Tel Aviv University (2015-2018), GPA 88. Additional certifications: PMP (2020) and Scrum Master (2021).'
    },
    validationId: 'education_main'
  },
  {
    key: 'skills',
    type: 'skills',
    text: {
      he: 'כלים ומיומנויות מקצועיות',
      en: 'Professional Tools and Skills'
    },
    subtitle: {
      he: 'פירוט הכלים והטכנולוגיות שיש לך ניסיון איתם',
      en: 'List the tools and technologies you\'re experienced with'
    },
    placeholder: {
      he: 'שליטה מלאה ב-Jira, Confluence ו-Git. ניסיון בפייתון וג׳אווהסקריפט, יכולות מוכחות בניהול צוותים.',
      en: 'Proficient in Jira, Confluence and Git. Experience with Python and JavaScript, proven team management abilities.'
    },
    validationId: 'skills_technical'
  },
  {
    key: 'languages',
    type: 'languages',
    text: {
      he: 'שפות',
      en: 'Languages'
    },
    subtitle: {
      he: 'פירוט השפות ורמת השליטה בהן',
      en: 'List your languages and proficiency levels'
    },
    placeholder: {
      he: 'עברית - שפת אם, אנגלית - רמה גבוהה מאוד, ספרדית - רמה בסיסית.',
      en: 'Hebrew - native level, English - very high proficiency, Spanish - basic level.'
    },
    validationId: 'languages_proficiency'
  },
  {
    key: 'military_service',
    type: 'military_service',
    text: {
      he: 'שירות צבאי או לאומי',
      en: 'Military or National Service'
    },
    subtitle: {
      he: 'פירוט השירות הצבאי או שירות לאומי, כולל תאריכי שירות',
      en: 'Details about your military or national service, including service dates'
    },
    placeholder: {
      he: 'דוגמה 1: קצין מחשוב ב-8200 (2019-2022), ניהול צוות של 15 חיילים ופיתוח מערכות מבצעיות.\nדוגמה 2: שירות לאומי בבית חולים איכילוב (2020-2021), סיוע לצוות הרפואי במחלקת ילדים.\nדוגמה 3: לא רלוונטי.',
      en: 'Example 1: IT Officer in Unit 8200 (2019-2022), managed a team of 15 soldiers and developed operational systems.\nExample 2: National Service at Ichilov Hospital (2020-2021), assisted medical staff in pediatrics.\nExample 3: Not relevant.'
    },
    validationId: 'military_service_main'
  },
  {
    key: 'desired_position',
    type: 'desired_position',
    text: {
      he: 'מה התפקיד המבוקש?',
      en: 'What position are you looking for?'
    },
    subtitle: {
      he: 'פירוט התפקיד הרצוי ואזור העבודה המועדף',
      en: 'Specify your desired role and preferred work location'
    },
    placeholder: {
      he: 'מחפש תפקיד ניהול פרויקטים בהייטק, עם התמחות בפיתוח מוצר. מעדיף לעבוד באזור המרכז או תל אביב.',
      en: 'Looking for a Project Manager position in high-tech, specializing in product development. Prefer working in the Central/Tel Aviv area.'
    },
    validationId: 'desired_position_main'
  }
];

export type QuestionType = typeof questions[number]['type'];