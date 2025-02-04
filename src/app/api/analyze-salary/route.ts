import { NextResponse } from 'next/server';
import { CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SALARY_ANALYSIS_PROMPT = `
אתה מומחה בכיר לניתוח שכר בשוק העבודה הישראלי, עם התמחות בהתאמה אישית של הערכות שכר.
כשאתה מנתח את קורות החיים, חשוב להדגיש שמדובר בהערכה המבוססת על נתוני שוק ולא בהבטחה.

בצע ניתוח מעמיק של קורות החיים תוך התייחסות אישית למועמד/ת ולנתוניו/ה הייחודיים. התבסס על:

1. פרופיל אישי:
   - שם המועמד/ת והרקע האישי
   - מסלול הקריירה הייחודי
   - הישגים בולטים וייחודיים
   - התמחויות ספציפיות

2. ניסיון וכישורים:
   - שנות ניסיון בתפקיד הנוכחי והקודם
   - התפתחות מקצועית לאורך השנים
   - השכלה, הכשרות והסמכות רלוונטיות
   - מיומנויות טכניות וכלליות ורמת המומחיות בהן

3. נתוני שוק עדכניים:
   - ביקוש נוכחי לתפקיד בשוק הישראלי
   - טווחי שכר מקובלים בתעשייה (עם דגש על עדכניות)
   - השפעת המיקום הגיאוגרפי על השכר
   - מגמות שכר בחברות בגדלים שונים

4. גורמים משפיעים ייחודיים:
   - מורכבות התפקיד והאחריות
   - ניסיון ניהולי והיקף האחריות
   - כישורים ייחודיים או נדירים
   - הישגים מדידים והשפעתם

5. מגמות שוק רלוונטיות:
   - שינויים צפויים בביקוש לתפקיד
   - השפעת טכנולוגיות חדשות
   - מגמות בתחום ההתמחות הספציפי

הנחיות חשובות:
- התבסס אך ורק על נתונים אמיתיים ומידע שסופק
- הדגש שמדובר בהערכה ולא בהבטחה
- התאם את הניתוח לפרופיל האישי של המועמד/ת
- שמור על עקביות: עבור אותם קורות חיים, החזר תמיד את אותם ערכים
- הסבר את הגורמים המשפיעים בצורה ברורה ואישית

אנא החזר את התשובה בפורמט JSON לפי המבנה הבא:
{
  "minSalary": number,
  "maxSalary": number,
  "factors": [
    {
      "title": string,
      "impact": "positive" | "negative" | "neutral",
      "description": string // תיאור אישי המתייחס לניסיון הספציפי של המועמד/ת
    }
  ],
  "marketDemand": "high" | "medium" | "low",
  "recommendations": string[], // המלצות אישיות המתייחסות לפרופיל הספציפי
  "personalNote": string, // הערה אישית המתייחסת לשם ולניסיון הספציפי
  "marketInsights": string[], // תובנות שוק רלוונטיות לתחום ההתמחות
  "skillGaps": string[], // פערי מיומנויות ספציפיים והמלצות לשיפור
  "confidenceLevel": "high" | "medium" | "low", // רמת הביטחון בהערכה
  "salaryRangeNote": string // הסבר על טווח השכר והגורמים המשפיעים עליו
}

חשוב: וודא שהתשובה היא JSON תקין בלבד, ללא טקסט נוסף לפני או אחרי.
`;

export async function POST(request: Request) {
  try {
    const { cvData } = await request.json();

    // ניתוח ראשוני של הקורות חיים
    const initialAnalysis = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      system: CV_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: JSON.stringify(cvData) }
      ]
    });

    let analysis;
    try {
      const messageContent = initialAnalysis.content[0];
      if ('text' in messageContent) {
        const content = messageContent.text || '{}';
        // ניקוי התוכן מ-markdown אם קיים
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        analysis = JSON.parse(cleanContent);
      } else {
        throw new Error('Unexpected message content format');
      }
    } catch (error) {
      console.error('Error parsing initial analysis:', error);
      analysis = {};
    }

    // ניתוח שכר מעמיק
    const salaryAnalysis = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      system: SALARY_ANALYSIS_PROMPT,
      messages: [
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
      const messageContent = salaryAnalysis.content[0];
      if ('text' in messageContent) {
        const content = messageContent.text || '{}';
        // ניקוי התוכן מ-markdown אם קיים
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        salaryData = JSON.parse(cleanContent);
      } else {
        throw new Error('Unexpected message content format');
      }
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
      skillGaps: combinedAnalysis.skillGaps || [],
      confidenceLevel: combinedAnalysis.confidenceLevel || 'medium',
      salaryRangeNote: combinedAnalysis.salaryRangeNote || 'הערכת השכר מבוססת על ניתוח נתוני השוק העדכניים ביותר'
    });
  } catch (error) {
    console.error('Error analyzing salary:', error);
    return NextResponse.json(
      { error: 'Failed to analyze salary' },
      { status: 500 }
    );
  }
} 