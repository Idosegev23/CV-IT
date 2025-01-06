import { z } from 'zod';

// טיפוסים בסיסיים
interface CustomErrorMessage {
  he: string;
  en: string;
}

export interface ValidationGuide {
  requirements: string[];
  example?: string;
}

export type ValidationSchemaKey = 
  | 'personal_details'
  | 'professional_summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'military_service'
  | 'recommendations'
  | 'highlights'
  | 'desired_position';

export interface ValidationIssue {
  field: ValidationSchemaKey;
  message: string;
  missingData: string[];
}

// פונקציית הולידציה הראשית
export const validateContent = async (content: Record<string, string>, lang: 'he' | 'en'): Promise<ValidationIssue[]> => {
  try {
    const response = await fetch('/api/validate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, lang }),
    });

    if (!response.ok) {
      throw new Error('Validation request failed');
    }

    const data = await response.json();
    return data.issues;
  } catch (error) {
    console.error('Error during validation:', error);
    return [];
  }
};

// סכמת ולידציה בסיסית - רק לוודא שיש תוכן
export const answerValidationSchema = {
  personal_details: z.string(),
  professional_summary: z.string(),
  experience: z.string(),
  languages: z.string(),
  education: z.string(),
  skills: z.string().optional(),
  military_service: z.string().optional(),
  recommendations: z.string().optional(),
  highlights: z.string().optional(),
  desired_position: z.string().optional()
} as const;

// מדריכי ולידציה מפורטים
export const getValidationGuide = (
  questionType: ValidationSchemaKey, 
  validationId: string, 
  lang: 'he' | 'en'
): ValidationGuide => {
  const guides: Record<ValidationSchemaKey, Record<string, ValidationGuide>> = {
    personal_details: {
      basic: {
        requirements: lang === 'he' ? [
          'הכנס את שמך המלא',
          'מספר טלפון ליצירת קשר',
          'כתובת אימייל מקצועית',
          'כתובת מגורים עדכנית'
        ] : [
          'Enter your full name',
          'Contact phone number',
          'Professional email address',
          'Current residential address'
        ]
      }
    },
    
    professional_summary: {
      main: {
        requirements: lang === 'he' ? [
          'סכם את ניסיו��ך המקצועי',
          'ציין את תחומי ההתמחות העיקריים שלך',
          'הדגש את ההישגים המשמעותיים ביותר'
        ] : [
          'Summarize your professional experience',
          'Mention your main areas of expertise',
          'Highlight your most significant achievements'
        ],
        example: lang === 'he' ? 
          'מפתח תוכנה בכיר עם 5 שנות ניסיון בפיתוח אפליקציות ווב. מומחה ב-React ו-Node.js.' :
          'Senior software developer with 5 years of experience in web application development. Expert in React and Node.js.'
      }
    },
    
    experience: {
      work: {
        requirements: lang === 'he' ? [
          'תאר את תפקידך והאחריות שהייתה לך',
          'ציין הישגים מדידים',
          'השתמש במילות פעולה חזקות',
          'ציין תאריכי התחלה וסיום'
        ] : [
          'Describe your role and responsibilities',
          'Mention measurable achievements',
          'Use strong action verbs',
          'Include start and end dates'
        ],
        example: lang === 'he' ? 
          'הובלתי צוות של 5 מפתחים בפרויקט שהגדיל את התפוקה ב-30% והפחית את זמ��י הטעינה ב-50%' :
          'Led a team of 5 developers in a project that increased productivity by 30% and reduced loading times by 50%'
      }
    },
    
    education: {
      academic: {
        requirements: lang === 'he' ? [
          'ציין את שם המוסד האקדמי',
          'התואר שהשגת',
          'שנת התחלה וסיום',
          'הישגים מיוחדים או התמחויות'
        ] : [
          'Specify the academic institution',
          'Degree obtained',
          'Start and end years',
          'Special achievements or specializations'
        ]
      }
    },
    
    skills: {
      technical: {
        requirements: lang === 'he' ? [
          'פרט מיומנויות טכניות ספציפיות',
          'ציין רמת מומחיות',
          'כלול טכנולוגיות עדכניות'
        ] : [
          'Detail specific technical skills',
          'Indicate expertise level',
          'Include current technologies'
        ]
      }
    },
    
    languages: {
      proficiency: {
        requirements: lang === 'he' ? [
          'ציין את השפות בהן אתה שולט',
          'הגדר את רמת השליטה (בסיסית/טובה/שוטפת)',
          'ציין תעודות שפה אם יש'
        ] : [
          'List languages you know',
          'Define proficiency level (Basic/Good/Fluent)',
          'Mention language certificates if any'
        ]
      }
    },
    
    military_service: {
      basic: {
        requirements: lang === 'he' ? [
          'ציין את תקופת השירות',
          'תפקיד ודרגה',
          'הישגים משמעותיים'
        ] : [
          'Specify service period',
          'Role and rank',
          'Significant achievements'
        ]
      }
    },
    
    recommendations: {
      basic: {
        requirements: lang === 'he' ? [
          'שם הממליץ ותפקידו',
          'פרטי קשר',
          'תיאור הקשר המקצועי'
        ] : [
          'Reference name and position',
          'Contact details',
          'Professional relationship description'
        ]
      }
    },
    
    highlights: {
      basic: {
        requirements: lang === 'he' ? [
          'ציין הישגים בולטים',
          'פרסים או הכרה מקצועית',
          'פרויקטים מיוחדים'
        ] : [
          'Mention notable achievements',
          'Awards or professional recognition',
          'Special projects'
        ]
      }
    },

    desired_position: {
      main: {
        requirements: lang === 'he' ? [
          'ציין את התפקיד המדויק שאתה מחפש',
          'תחום העיסוק או התעשייה',
          'דרישות מיוחדות או העדפות'
        ] : [
          'Specify the exact position you are looking for',
          'Field or industry',
          'Special requirements or preferences'
        ]
      }
    }
  };

  return guides[questionType]?.[validationId] || {
    requirements: lang === 'he' ? 
      ['נא למלא תשובה מפורטת ומקיפה'] : 
      ['Please provide a detailed and comprehensive answer']
  };
};