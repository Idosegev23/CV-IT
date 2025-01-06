import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { CV_CREATION_SYSTEM_PROMPT, CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';

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

  try {
    const body = await request.json();
    sessionId = body.sessionId;
    const { lang } = body;
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    // 1. קבלת הנתונים מ-cv_data
    const { data: cvDataResults, error: fetchError } = await supabase
      .from('cv_data')
      .select('*, sessions!inner(*)')  // מוסיף join עם טבלת sessions
      .eq('session_id', sessionId);

    if (fetchError || !cvDataResults?.length) {
      throw new Error('Failed to fetch CV data');
    }

    const cvData = cvDataResults[cvDataResults.length - 1];
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

    // 4. יצירת גרסה באנגלית אם המשתמש הוא Pro
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