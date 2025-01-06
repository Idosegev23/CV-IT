import { Anthropic } from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { CV_CREATION_SYSTEM_PROMPT } from '@/lib/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export const runtime = 'edge';

export async function POST(request: Request) {
  let sessionId: string = '';
  
  try {
    const { sessionId: reqSessionId, lang } = await request.json();
    sessionId = reqSessionId;
    
    // עדכון סטטוס התחלתי
    const { error: updateError } = await supabase
      .from('cv_data')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (updateError) throw updateError;

    // במקום לקרוא ל-API נפרד, נבצע את התהליך כאן
    const { data: cvDataResults, error: fetchError } = await supabase
      .from('cv_data')
      .select('*')
      .eq('session_id', sessionId);

    if (fetchError || !cvDataResults?.length) {
      throw new Error('Failed to fetch CV data');
    }

    const cvData = cvDataResults[cvDataResults.length - 1];

    // שליחה ל-Claude
    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [
        { 
          role: 'user', 
          content: `
            Based on the collected data, create a professional CV in ${lang}.
            The data is: ${JSON.stringify(cvData.content)}
            
            Important:
            1. Return ONLY a valid JSON object
            2. Follow the exact structure defined
            3. Enhance and expand the information professionally
            4. Add quantitative achievements where possible
            5. Language should be ${lang === 'he' ? 'Hebrew' : 'English'}
          `
        }
      ],
      system: CV_CREATION_SYSTEM_PROMPT
    });

    const formattedCV = completion.content[0].type === 'text' 
      ? JSON.parse(completion.content[0].text)
      : null;

    if (!formattedCV) {
      throw new Error('Invalid response from AI');
    }

    // עדכון התוצאה
    const { error: saveError } = await supabase
      .from('cv_data')
      .update({ 
        format_cv: formattedCV,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (saveError) throw saveError;

    return NextResponse.json({ 
      success: true,
      message: 'CV generated successfully',
      data: formattedCV
    });

  } catch (error) {
    console.error('❌ [API] Error in CV generation:', error);
    
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