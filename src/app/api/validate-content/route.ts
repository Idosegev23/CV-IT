import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ValidationSchemaKey } from '@/lib/validations';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// פונקציות בדיקה ספציפיות
const containsEmail = (text: string): boolean => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  return emailRegex.test(text);
};

const containsPhone = (text: string): boolean => {
  const phoneRegex = /(?:[\d-+()]{7,})/;
  return phoneRegex.test(text);
};

const containsYear = (text: string): boolean => {
  // תומך בפורמטים: YYYY-YYYY, YY-YY, YYYY עד YYYY, YY עד YY
  const yearPattern = /\b(?:19|20)?\d{2}(?:\s*-\s*|\s*עד\s*|[-\s]+)(?:19|20)?\d{2}\b|\b(?:19|20)\d{2}\b|\b\d{2}\b/;
  return yearPattern.test(text);
};

// בדיקה חכמה באמצעות GPT
const analyzeWithGPT = async (text: string, field: ValidationSchemaKey, lang: 'he' | 'en'): Promise<string[]> => {
  const prompts: Record<ValidationSchemaKey, string> = {
    personal_details: lang === 'he' ? 
      `בדוק אם הטקסט כולל את כל פרטי הקשר הנדרשים:
      1. שם מלא
      2. מספר טלפון (פורמט ישראלי או בינלאומי)
      3. כתובת אימייל
      4. עיר מגורים בלבד (לא נדרשת כתובת מלאה)
      5. גיל או תאריך לידה (מספיק אחד מהם)
      
      אם חסר מידע, ציין בדיוק מה חסר.
      הערות:
      - עבור מיקום, נדרשת רק עיר, לא כתובת מלאה
      - אם מצוין גיל, לא נדרש תאריך לידה` :
      `Check if the text includes all necessary contact details:
      1. Full name
      2. Phone number (Israeli or international format)
      3. Email address
      4. City name only (no full address needed)
      5. Age or birth date (either one is sufficient)
      
      If any of these are missing, specify exactly what's missing.
      Notes:
      - For location, only a city name is required, not a full address
      - If age is specified, birth date is not required`,
    
    experience: lang === 'he' ?
      `נתח את הטקסט הבא ובדוק אם כל חברה כוללת את המינימום הנדרש:

      עבור כל חברה בדוק:
      1. תפקיד (למשל: מנהל, אחמ"ש, מנהל מכירות)
      2. תקופת העסקה (שנים בפורמט: YYYY או YY)
      3. תיאור קצר של מה עשית (מספיק משפט אחד)

      הערות חשובות:
      - תפקידים מקובלים כוללים:
        * "מנהל מכירות"
        * "אחמ"ש"
        * "מנהל"
      - כל אחד מהמשפטים הבאים נחשב תיאור תקין:
        * "ניהלתי X אנשים"
        * "ניהלתי משמרות של צוות"
        * "אחראי על Y"
        * "ניהלתי משמרות של צוות מכירות טלפוני"
      - אין צורך בתיאור מפורט
      - אם יש תיאור של ניהול או אחריות, זה מספיק

      דוגמאות לתיאורים תקינים:
      ✓ "ניהלתי 40 איש"
      ✓ "ניהלתי משמרות של צוות מכירות טלפוני"
      ✓ "אחראי על מכירות"

      אם חסר מידע:
      - ציין רק אם חסר לגמרי אחד מ-3 הפרטים הנדרשים
      - ציין בדיוק באיזו חברה חסר המידע
      
      שים לב:
      - "אחמ"ש" הוא תפקיד תקין
      - "ניהלתי משמרות של צוות מכירות טלפוני" הוא תיאור תקין
      
      החזר רק פריטים שבאמת חסרים.` :
      `Analyze the text and check if each company includes all required details.

      For each company check:
      1. Role/position
      2. Employment period (years)
      3. Activity description (what you actually did)

      Important notes:
      - Descriptions like "managed team shifts" are valid
      - Descriptions like "managed X people" are valid
      - If there's a description of activity or management, it's sufficient
      - No need for detailed description, one sentence describing the activity is enough

      Examples of valid descriptions:
      ✓ "managed a team of 40 people"
      ✓ "managed sales team shifts"
      ✓ "responsible for sales and service"

      If information is missing:
      - Specify exactly which company is missing information
      - Specify exactly what's missing (role/dates/description)
      
      Important: Check each company separately and return a list of missing items only.`,
    
    education: lang === 'he' ?
      `בדוק אם כל רשומת השכלה כוללת:
      1. שם המוסד
      2. תואר/תעודה
      3. שנות לימוד (פורמט YYYY או YY)
      4. תחום לימודים
      זהה אילו רשומות חסרות מידע מהנ"ל.` :
      `Check if each education entry includes:
      1. Institution name
      2. Degree/certification
      3. Years of study (YYYY or YY format)
      4. Field of study
      Identify which entries are missing any of these elements.`,
    
    military_service: lang === 'he' ?
      `בדוק אם הטקסט כולל:
      1. משך השירות (שנות)
      2. תפקיד/מיקום
      3. יחידה (אם רלוונטי)

      הערות חשובות:
      - אם הטקסט מציין "לא עשיתי" או "לא רלוונטי" או "פטור" - זה תקין לחלוטין
      - אם יש ציון מפורש שאין שירות צבאי - אין צורך בפרטים נוספים
      - רק אם יש שירות צבאי - נדרשים הפרטים הנ"ל

      החזר רשימת פריטים חסרים רק אם:
      1. אין ציון מפורש של חוסר שירות צבאי
      2. וגם חסרים פרטי השירות הנדרשים` :
      `Check if the text includes:
      1. Service period (years)
      2. Role/position
      3. Unit (if applicable)

      Important notes:
      - If the text indicates "did not serve" or "not applicable" or "exempt" - it's perfectly valid
      - If there's an explicit mention of no military service - no additional details needed
      - Only if there was military service - the above details are required

      Return missing items only if:
      1. There's no explicit mention of no military service
      2. And service details are missing`,
    
    skills: lang === 'he' ?
      'בדוק אם הטקסט כולל כישורים טכניים ספציפיים, כלים וטכנולוגיות' :
      'Check if the text includes specific technical skills, tools, and technologies',
    languages: lang === 'he' ?
      'בדוק אם הטקסט כולל שפות ורמות מומחרות' :
      'Check if the text includes languages and proficiency levels',
    professional_summary: lang === 'he' ?
      'בדוק אם הטקסט כולל סיכום ניסיון מקצועי ואזרחיות עיקריים' :
      'Check if the text includes professional experience summary and expertise areas',
    recommendations: lang === 'he' ?
      'בדוק אם הטקסט כולל פרטים על המלצר ויחס הקשר' :
      'Check if the text includes recommender details and relationship',
    highlights: lang === 'he' ?
      'בדוק אם הטקסט כולל תוצאות מצערות והזדמנות' :
      'Check if the text includes notable achievements and recognition',
    desired_position: lang === 'he' ?
      'בדוק אם הטקסט כולל תפקיד מוכו ותעשייה' :
      'Check if the text includes desired role and industry'
  };

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are a CV validation assistant for a Hebrew/English CV builder. Your task is to analyze the given text and provide specific, actionable feedback.

          Language context: ${lang === 'he' ? 'The CV is in Hebrew. Please provide feedback in Hebrew.' : 'The CV is in English'}

          Please analyze the following text for the ${field} section and return:
          ${lang === 'he' ? 
            `1. רשימה של מידע חסר (באופן מדויק ומעשי)
             2. אם מוזכרים תאריכים, וודא שהם בפורמט: YYYY-YYYY, YY-YY, או שנה בודדת
             3. בדוק שלמות ומקצועיות של התוכן` :
            `1. A list of specific missing information (be precise and actionable)
             2. If dates are mentioned, verify they follow the format: YYYY-YYYY, YY-YY, or single year
             3. Check for completeness and professionalism of the content`}

          Text to analyze:
          ${text}

          Required elements and guidelines:
          ${prompts[field]}

          Return your analysis as a JSON object with:
          {
            "missing_elements": ${lang === 'he' ? 
              '["פריט חסר 1", "פריט חסר 2", ...]' :
              '["specific item 1", "specific item 2", ...]'},
            "feedback": ${lang === 'he' ? 
              '"הודעת משוב מפורטת"' :
              '"detailed feedback message"'}
          }

          Note: ${lang === 'he' ? 
            'אם הטקסט מציין שמשהו לא רלוונטי (כמו שירות צבאי), סמן אותו כתקין.' :
            'If the text indicates something is not applicable (like military service), mark it as valid.'}`
        }
      ],
      temperature: 0,
      system: lang === 'he' ?
        "אתה עוזר לבדיקת קורות חיים מקצועי. ספק משוב ספציפי ובונה בפורמט JSON. היה מדויק אך בונה במשוב שלך." :
        "You are a professional CV validation assistant. Provide specific, actionable feedback in JSON format. Be precise but constructive in your feedback."
    });

    if (!completion.content || completion.content.length === 0) {
      return [];
    }

    const content = completion.content[0].type === 'text' ? completion.content[0].text : '';
    if (!content) {
      return [];
    }

    const response = JSON.parse(content);
    return response.missing_elements || [];
  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    return [];
  }
};

export async function POST(request: Request) {
  try {
    const { content, lang } = await request.json();
    const issues = [];

    // בדיקת פרטים אישיים - רק בדיקות בסיסיות
    if (content.personal_details) {
      const missingData: string[] = [];
      
      if (!containsEmail(content.personal_details)) {
        missingData.push(lang === 'he' ? 'כתובת אימייל תקינה' : 'Valid email address');
      }
      if (!containsPhone(content.personal_details)) {
        missingData.push(lang === 'he' ? 'מספר טלפון (לדוגמה: 0501234567)' : 'Phone number (e.g., 0501234567)');
      }
      
      if (missingData.length > 0) {
        issues.push({
          field: 'personal_details',
          message: lang === 'he' 
            ? 'חסרים פרטי קשר בסיסיים'
            : 'Basic contact details are missing',
          missingData
        });
      }
    }

    // בדיקת ניסיון תעסוקתי - רק תאריכים
    if (content.experience && !containsYear(content.experience)) {
      issues.push({
        field: 'experience',
        message: lang === 'he'
          ? 'חסרים תאריכי עבודה'
          : 'Employment dates are missing',
        missingData: [
          lang === 'he' 
            ? 'תאריכי עבודה (לדוגמה: 2020-2023, 20-23, או 2020)'
            : 'Employment dates (e.g., 2020-2023, 20-23, or 2020)'
        ]
      });
    }

    // בדיקת השכלה - רק תאריכים
    if (content.education && !containsYear(content.education)) {
      issues.push({
        field: 'education',
        message: lang === 'he'
          ? 'חסרים תאריכי לימודים'
          : 'Education dates are missing',
        missingData: [
          lang === 'he'
            ? 'תאריכי לימודים (לדוגמה: 2020-2023, 20-23, או 2020)'
            : 'Education dates (e.g., 2020-2023, 20-23, or 2020)'
        ]
      });
    }

    // בדיקת שירות צבאי - רק אם יש שירות, נדרש תאריך
    if (content.military_service) {
      const noServiceIndicators = ['לא עשיתי', 'לא רלוונטי', 'פטור', 'לא שירתתי'];
      const hasNoServiceIndicator = noServiceIndicators.some(indicator => 
        content.military_service.includes(indicator)
      );

      if (!hasNoServiceIndicator && !containsYear(content.military_service)) {
        issues.push({
          field: 'military_service',
          message: lang === 'he'
            ? 'חסרים תאריכי שירות'
            : 'Service dates are missing',
          missingData: [
            lang === 'he'
              ? 'תאריכי שירות (לדוגמה: 2020-2023, 20-23, או 2020)'
              : 'Service dates (e.g., 2020-2023, 20-23, or 2020)'
          ]
        });
      }
    }

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
} 