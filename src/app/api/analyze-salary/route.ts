import { NextResponse } from 'next/server';
import { CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SALARY_ANALYSIS_PROMPT = `
אתה מומחה לניתוח שכר בשוק העבודה הישראלי. נתח את קורות החיים המצורפים ותן הערכת שכר מדויקת בהתבסס על:

1. ניסיון וכישורים:
   - שנות ניסיון בתפקיד
   - ניסיון רלוונטי קודם
   - השכלה והכשרות
   - מיומנויות טכניות וכלליות

2. נתוני שוק:
   - ביקוש לתפקיד בשוק הישראלי
   - רמות שכר מקובלות בתעשייה
   - מיקום גיאוגרפי (תל אביב/מרכז/פריפריה)
   - גודל החברות הפוטנציאליות

3. גורמים משפיעים:
   - תחום התעשייה
   - מורכבות התפקיד
   - אחריות ניהולית
   - דרישות ייחודיות

4. מגמות שוק:
   - מגמות שכר עדכניות בתחום
   - שינויים בביקוש לתפקיד
   - השפעת טכנולוגיות חדשות

חשוב: התבסס אך ורק על נתונים אמיתיים ומידע שסופק. אל תמציא או תשער מידע חסר.

אנא החזר את התשובה בפורמט JSON בדיוק לפי המבנה הבא:
{
  "minSalary": number,
  "maxSalary": number,
  "factors": [
    {
      "title": string,
      "impact": "positive" | "negative" | "neutral",
      "description": string
    }
  ],
  "marketDemand": "high" | "medium" | "low",
  "recommendations": string[],
  "personalNote": string,
  "marketInsights": string[],
  "skillGaps": string[]
}

אנא וודא שהתשובה היא JSON תקין בלבד, ללא טקסט נוסף לפני או אחרי.
`;

export async function POST(request: Request) {
  try {
    const { cvData } = await request.json();

    // ניתוח ראשוני של הקורות חיים
    const initialAnalysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: CV_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(cvData) }
      ]
    });

    let analysis;
    try {
      const content = initialAnalysis.choices[0].message.content || '{}';
      // ניקוי התוכן מ-markdown אם קיים
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (error) {
      console.error('Error parsing initial analysis:', error);
      analysis = {};
    }

    // ניתוח שכר מעמיק
    const salaryAnalysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SALARY_ANALYSIS_PROMPT },
        { 
          role: "user", 
          content: JSON.stringify({
            analysis,
            cvData,
            marketData: {
              location: cvData.city || 'unknown',
              industry: analysis.market,
              experienceLevel: analysis.level,
              relevantPositions: analysis.cv_info?.relevant_positions || []
            }
          })
        }
      ]
    });

    let salaryData;
    try {
      const content = salaryAnalysis.choices[0].message.content || '{}';
      // ניקוי התוכן מ-markdown אם קיים
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      salaryData = JSON.parse(cleanContent);
    } catch (error) {
      console.error('Error parsing salary analysis:', error);
      throw new Error('Failed to parse salary analysis response');
    }

    // שילוב הנתונים והתאמות אחרונות
    const combinedAnalysis = {
      ...salaryData,
      level: analysis.level,
      market: analysis.market,
      factors: (salaryData.factors || []).map((factor: any) => ({
        ...factor,
        impact: factor.impact || 'neutral'
      })),
      recommendations: (salaryData.recommendations || []).filter(Boolean),
      personalNote: salaryData.personalNote || 
        `${cvData.first_name}, בהתבסס על הניסיון שלך ב${analysis.cv_info?.last_position || 'תפקידך הנוכחי'}, ` +
        'ועל מגמות השוק הנוכחיות, אלו הערכות השכר הריאליות עבורך.'
    };

    // וידוא שכל השדות הנדרשים קיימים
    return NextResponse.json({
      minSalary: combinedAnalysis.minSalary || 0,
      maxSalary: combinedAnalysis.maxSalary || 0,
      averageSalary: Math.round(((combinedAnalysis.minSalary || 0) + (combinedAnalysis.maxSalary || 0)) / 2),
      factors: combinedAnalysis.factors || [],
      marketDemand: combinedAnalysis.marketDemand || 'medium',
      recommendations: combinedAnalysis.recommendations || [],
      personalNote: combinedAnalysis.personalNote,
      marketInsights: combinedAnalysis.marketInsights || [],
      skillGaps: combinedAnalysis.skillGaps || []
    });
  } catch (error) {
    console.error('Error analyzing salary:', error);
    return NextResponse.json(
      { error: 'Failed to analyze salary' },
      { status: 500 }
    );
  }
} 