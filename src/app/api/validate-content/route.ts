import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ValidationSchemaKey } from '@/lib/validations';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
  const yearRegex = /\b(19|20)\d{2}\b/;
  return yearRegex.test(text);
};

// בדיקה חכמה באמצעות GPT
const analyzeWithGPT = async (text: string, field: ValidationSchemaKey, lang: 'he' | 'en'): Promise<string[]> => {
  const prompts: Record<ValidationSchemaKey, string> = {
    personal_details: 'Check if the text includes all necessary contact details (name, phone, email, location)',
    experience: 'Check if the text includes job titles, companies, and dates/years of employment',
    education: 'Check if the text includes educational institutions, degrees, and years of study',
    military_service: 'Check if the text includes military service period, role, and unit',
    skills: 'Check if the text includes specific technical skills, tools, and technologies',
    languages: 'Check if the text includes languages and proficiency levels',
    professional_summary: 'Check if the text includes professional experience summary and expertise areas',
    recommendations: 'Check if the text includes recommender details and relationship',
    highlights: 'Check if the text includes notable achievements and recognition',
    desired_position: 'Check if the text includes desired role and industry'
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a CV validation assistant. Check if the given text contains all required information and return missing elements as a JSON array of strings."
        },
        {
          role: "user",
          content: `Analyze the following text for a ${field} section of a CV and list any missing critical information:\n\n${text}\n\nRequired elements: ${prompts[field]}`
        }
      ],
      response_format: { type: "json_object" }
    });

    if (!completion.choices[0].message.content) {
      return [];
    }

    const response = JSON.parse(completion.choices[0].message.content);
    return response.missing_elements || [];
  } catch (error) {
    console.error('Error analyzing with GPT:', error);
    return [];
  }
};

export async function POST(request: Request) {
  try {
    const { content, lang } = await request.json();
    const issues = [];

    // בדיקת פרטים אישיים
    if (content.personal_details) {
      const missingData: string[] = [];
      const missingBasics: string[] = [];
      
      if (!containsEmail(content.personal_details)) {
        missingBasics.push(lang === 'he' ? 'מייל ליצירת קשר' : 'Contact email');
      }
      if (!containsPhone(content.personal_details)) {
        missingBasics.push(lang === 'he' ? 'טלפון נייד' : 'Phone number');
      }

      const gptResults = await analyzeWithGPT(content.personal_details, 'personal_details', lang);
      missingData.push(...missingBasics, ...gptResults);
      
      if (missingData.length > 0) {
        issues.push({
          field: 'personal_details',
          message: lang === 'he' 
            ? 'היי, איך נוכל ליצור איתך קשר?'
            : 'Hey, how can we contact you?',
          missingData
        });
      }
    }

    // בדיקת ניסיון תעסוקתי
    if (content.experience) {
      const missingData: string[] = [];
      
      if (!containsYear(content.experience)) {
        missingData.push(lang === 'he' ? 'מתי עבדת בכל מקום?' : 'When did you work there?');
      }

      const gptResults = await analyzeWithGPT(content.experience, 'experience', lang);
      missingData.push(...gptResults);
      
      if (missingData.length > 0) {
        issues.push({
          field: 'experience',
          message: lang === 'he'
            ? 'בוא נוסיף קצת פרטים על הזמנים'
            : 'Let\'s add some timing details',
          missingData
        });
      }
    }

    // בדיקת השכלה
    if (content.education) {
      const missingData: string[] = [];
      
      if (!containsYear(content.education)) {
        missingData.push(lang === 'he' ? 'מתי למדת?' : 'When did you study?');
      }

      const gptResults = await analyzeWithGPT(content.education, 'education', lang);
      missingData.push(...gptResults);
      
      if (missingData.length > 0) {
        issues.push({
          field: 'education',
          message: lang === 'he'
            ? 'מתי סיימת ללמוד? זה יעזור למעסיקים להבין את הרקע שלך'
            : 'When did you finish studying? It helps employers understand your background',
          missingData
        });
      }
    }

    // בדיקת שירות צבאי
    if (content.military_service) {
      const missingData: string[] = [];
      
      if (!containsYear(content.military_service)) {
        missingData.push(lang === 'he' ? 'מתי שירתת?' : 'When did you serve?');
      }

      const gptResults = await analyzeWithGPT(content.military_service, 'military_service', lang);
      missingData.push(...gptResults);
      
      if (missingData.length > 0) {
        issues.push({
          field: 'military_service',
          message: lang === 'he'
            ? 'מתי היית בצבא? זה מידע חשוב למעסיקים'
            : 'When were you in the military? It\'s important info for employers',
          missingData
        });
      }
    }

    // בדיקת כישורים
    if (content.skills) {
      const gptResults = await analyzeWithGPT(content.skills, 'skills', lang);
      if (gptResults.length > 0) {
        issues.push({
          field: 'skills',
          message: lang === 'he'
            ? 'בוא נפרט קצת יותר על הכישורים שלך'
            : 'Let\'s add more details about your skills',
          missingData: gptResults
        });
      }
    }

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
} 