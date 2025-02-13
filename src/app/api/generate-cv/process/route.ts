import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { CV_CREATION_SYSTEM_PROMPT, CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';
import { reportError } from '@/lib/services/errorReporting';

// יצירת חיבור ל-Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// יצירת חיבור ל-Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const maxDuration = 300; // 5 דקות מקסימום

export async function POST(request: Request) {
  let sessionId: string = '';
  let cvData: any = null;
  let body: any = null;  // הוספת משתנה לשמירת ה-body

  try {
    body = await request.json();  // שמירת ה-body במשתנה
    sessionId = body.sessionId;
    const { lang } = body;
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    // קבלת נתוני ה-CV
    const { data, error: fetchError } = await supabase
      .from('cv_data')
      .select('*, sessions!inner(*)')
      .eq('session_id', sessionId)
      .single();

    if (fetchError || !data) {
      throw new Error('Failed to fetch CV data');
    }

    cvData = data;

    const isPro = cvData.sessions?.package === 'pro';

    // 2. ניתוח הקורות חיים
    const analysisCompletion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        { 
          role: 'user', 
          content: `נתח את קורות החיים הבאים: ${JSON.stringify(cvData.content)}`
        }
      ],
      system: CV_ANALYSIS_SYSTEM_PROMPT
    });

    const analysis = analysisCompletion.content[0].type === 'text' 
      ? JSON.parse(analysisCompletion.content[0].text)
      : null;

    // 3. יצירת קורות חיים בשפה המבוקשת
    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [
        { 
          role: 'user', 
          content: `
            Based on the collected data, create a professional CV in ${lang}.
            The data is: ${JSON.stringify(cvData.content)}
          `
        }
      ],
      system: CV_CREATION_SYSTEM_PROMPT
    });

    const formattedCV = completion.content[0].type === 'text' 
      ? JSON.parse(completion.content[0].text)
      : null;

    // ולידציה של התוכן שהתקבל
    if (!formattedCV || Object.keys(formattedCV).length === 0) {
      throw new Error('Generated CV content is empty or invalid');
    }

    // בדיקה שאין שדות undefined או null
    const validateContent = (obj: any) => {
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          validateContent(obj[key]);
          // מחיקת אובייקטים ריקים
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      }
    };

    validateContent(formattedCV);

    // בדיקה דומה לגרסה האנגלית אם קיימת
    let englishCV = null;
    if (isPro && lang === 'he') {
      const englishCompletion = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        messages: [
          { 
            role: 'user', 
            content: `
              Based on the collected data, create a professional CV in English.
              The data is: ${JSON.stringify(cvData.content)}
            `
          }
        ],
        system: CV_CREATION_SYSTEM_PROMPT
      });

      englishCV = englishCompletion.content[0].type === 'text' 
        ? JSON.parse(englishCompletion.content[0].text)
        : null;

      if (englishCV) {
        validateContent(englishCV);
      }
    }

    // 5. עדכון כל הנתונים בדאטהבייס
    const updateData: any = {
      format_cv: formattedCV,
      level: analysis.level,
      market: analysis.market,
      cv_info: analysis.cv_info,
      status: 'completed',
      updated_at: new Date().toISOString()
    };

    if (englishCV) {
      updateData.en_format_cv = englishCV;
    }

    const { error: updateError } = await supabase
      .from('cv_data')
      .update(updateData)
      .eq('session_id', sessionId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (error) {
    await reportError({
      error,
      sessionId,
      context: {
        location: 'generate-cv/process',
        action: 'generateCV',
        timestamp: Date.now(),
        additionalData: {
          isPro: cvData?.sessions?.package === 'pro',
          lang: body?.lang || 'he'  // עכשיו יש לנו גישה ל-body
        }
      }
    });
    
    console.error('❌ [API] Error in CV generation process:', error);
    
    // עדכון בדאטהבייס רק אם יש sessionId תקין
    if (sessionId) {
      await supabase
        .from('cv_data')
        .update({ 
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }

    return NextResponse.json(
      { error: 'Failed to generate CV' },
      { status: 500 }
    );
  }
} 