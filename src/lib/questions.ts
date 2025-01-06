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
      he: 'בוא נתחיל - ספר לי קצת על עצמך',
      en: 'Let\'s start - tell me about yourself'
    },
    subtitle: {
      he: 'איך אפשר ליצור איתך קשר? שם, טלפון, מייל, איפה גר, לינקדאין',
      en: 'How can we contact you? Name, phone, email, where you live, LinkedIn'
    },
    placeholder: {
      he: 'היי! קוראים לי ישראל, גר בתל אביב. אפשר ליצור איתי קשר ב-052-1234567 או במייל israel@gmail.com. יש לי גם פרופיל בלינקדאין: linkedin.com/in/israel',
      en: 'Hey! I\'m John, living in Tel Aviv. You can reach me at +972-52-1234567 or email me at john@gmail.com. Here\'s my LinkedIn: linkedin.com/in/john'
    },
    validationId: 'personal_details_main'
  },
  {
    key: 'professional_summary',
    type: 'professional_summary',
    text: {
      he: 'במה אתה הכי טוב?',
      en: 'What are you best at?'
    },
    subtitle: {
      he: 'ספר לי על הניסיון שלך והדברים שאתה הכי טוב בהם (2-3 משפטים)',
      en: 'Tell me about your experience and what you excel at (2-3 sentences)'
    },
    placeholder: {
      he: 'אני מנהל פרויקטים כבר 7 שנים, אוהב לעבוד עם אנשים ולהוביל צוותים להצלחה. ממש טוב בניהול משימות ופתרון בעיות.',
      en: 'I\'ve been a project manager for 7 years, love working with people and leading teams to success. Really good at task management and problem solving.'
    },
    validationId: 'professional_summary_main'
  },
  {
    key: 'work_experience',
    type: 'experience',
    text: {
      he: 'איפה עבדת עד היום?',
      en: 'Where have you worked so far?'
    },
    subtitle: {
      he: 'ספר לי על העבודות הקודמות שלך ומה עשית בהן',
      en: 'Tell me about your previous jobs and what you did there'
    },
    placeholder: {
      he: 'עבדתי בחברת ABC בתור מנהל פרויקטים, ניהלתי צוות של 12 מפתחים והוצאנו 4 מוצרים חדשים. לפני זה הייתי ב-XYZ, שם הצלחתי להגדיל את התפוקה של הצוות ב-40%.',
      en: 'Worked at ABC as a project manager, led a team of 12 developers and launched 4 new products. Before that I was at XYZ, where I managed to increase team productivity by 40%.'
    },
    validationId: 'experience_main'
  },
  {
    key: 'education',
    type: 'education',
    text: {
      he: 'מה למדת?',
      en: 'What did you study?'
    },
    subtitle: {
      he: 'ספר לי על הלימודים וההכשרות שעברת',
      en: 'Tell me about your studies and training'
    },
    placeholder: {
      he: 'למדתי מדעי המחשב בתל אביב, סיימתי עם ממוצע 88. יש לי גם תעודות של PMP ו-Scrum Master.',
      en: 'Studied Computer Science in Tel Aviv, graduated with a GPA of 88. I also have PMP and Scrum Master certifications.'
    },
    validationId: 'education_main'
  },
  {
    key: 'skills',
    type: 'skills',
    text: {
      he: 'במה אתה יודע להשתמש?',
      en: 'What tools can you use?'
    },
    subtitle: {
      he: 'ספר לי על הכלים והטכנולוגיות שאתה מכיר',
      en: 'Tell me about the tools and technologies you know'
    },
    placeholder: {
      he: 'אני ממש טוב עם Jira, Confluence ו-Git. יש לי ניסיון בפייתון וג׳אווהסקריפט, ואני מצוין בניהול צוותים.',
      en: 'I\'m really good with Jira, Confluence and Git. I have experience with Python and JavaScript, and I\'m excellent at team management.'
    },
    validationId: 'skills_technical'
  },
  {
    key: 'languages',
    type: 'languages',
    text: {
      he: 'אילו שפות אתה מדבר?',
      en: 'What languages do you speak?'
    },
    subtitle: {
      he: 'ספר לי על השפות שאתה יודע ואיך אתה מדבר אותן',
      en: 'Tell me about the languages you know and how well you speak them'
    },
    placeholder: {
      he: 'עברית ברמה של שפת אם, אנגלית ברמה ממש טובה, וקצת ספרדית.',
      en: 'Hebrew at native level, English at a very good level, and some Spanish.'
    },
    validationId: 'languages_proficiency'
  },
  {
    key: 'military_service',
    type: 'military_service',
    text: {
      he: 'ספר לי על השירות הצבאי',
      en: 'Tell me about your military service'
    },
    subtitle: {
      he: 'מה עשית בצבא? באיזו יחידה שירתת?',
      en: 'What did you do in the army? Which unit did you serve in?'
    },
    placeholder: {
      he: 'הייתי קצין מחשוב ב-8200, ניהלתי צוות של 15 חיילים ופיתחנו מערכות מבצעיות. הובלתי פרויקט גדול שחסך המון משאבים ליחידה.',
      en: 'I was an IT Officer in Unit 8200, managed a team of 15 soldiers and developed operational systems. Led a major project that saved substantial unit resources.'
    },
    validationId: 'military_service_main'
  },
  {
    key: 'desired_position',
    type: 'desired_position',
    text: {
      he: 'איזו עבודה אתה מחפש?',
      en: 'What job are you looking for?'
    },
    subtitle: {
      he: 'ספר לי על התפקיד שאתה רוצה ובאיזה אזור אתה מחפש עבודה',
      en: 'Tell me about the position you want and in which area you are looking for work'
    },
    placeholder: {
      he: 'אני מחפש תפקיד של מנהל פרויקטים בהייטק, עם התמחות בפיתוח מוצר. מעוניין לעבוד באזור המרכז/תל אביב',
      en: 'I\'m looking for a Project Manager position in high-tech, specializing in product development. Interested in working in the Central/Tel Aviv area'
    },
    validationId: 'desired_position_main'
  }
];

export type QuestionType = typeof questions[number]['type'];