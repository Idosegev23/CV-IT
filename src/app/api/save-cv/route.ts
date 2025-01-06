import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  console.log('🟦 Save CV API called - Start');
  
  try {
    const data = await request.json();
    console.log('📥 Received raw data:', JSON.stringify(data, null, 2));

    if (!data.sessionId || !data.answers) {
      console.error('❌ Validation Error:', {
        hasSessionId: !!data.sessionId,
        hasAnswers: !!data.answers,
        receivedData: data
      });
      return NextResponse.json(
        { error: 'Missing sessionId or answers' },
        { status: 400 }
      );
    }

    const { sessionId, answers, language, shouldAnalyze } = data;
    console.log('🔍 Processing request:', {
      sessionId,
      language,
      answersKeys: Object.keys(answers),
      shouldAnalyze
    });

    let analysis = null;
    
    // ניתוח הקורות חיים אם נדרש
    if (shouldAnalyze) {
      console.log('🧠 Starting CV analysis with Claude...');
      const analysisCompletion = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          { 
            role: 'user', 
            content: `נתח את קורות החיים הבאים: ${JSON.stringify(answers)}`
          }
        ],
        system: CV_ANALYSIS_SYSTEM_PROMPT
      });

      analysis = analysisCompletion.content[0].type === 'text' 
        ? JSON.parse(analysisCompletion.content[0].text)
        : null;
      
      console.log('✅ CV analysis completed:', analysis);
    }

    // שמירה בסופהבייס
    console.log('💾 Attempting database upsert...');
    const updateData: any = {
      session_id: sessionId,
      content: answers,
      language,
      last_updated: new Date().toISOString()
    };

    // הוספת תוצאות הניתוח אם יש
    if (analysis) {
      updateData.level = analysis.level;
      updateData.market = analysis.market;
      updateData.cv_info = analysis.cv_info;
    }

    const { data: result, error } = await supabase
      .from('cv_data')
      .upsert(updateData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save CV data' },
        { status: 500 }
      );
    }

    console.log('✅ Successfully saved CV data:', result);
    return NextResponse.json({
      success: true,
      message: 'CV data saved successfully',
      data: result,
      analysis,
      redirectUrl: `/${language}/payment?sessionId=${sessionId}`
    });

  } catch (error) {
    console.error('🔴 Error in save-cv API:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    });
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save CV' },
      { status: 500 }
    );
  }
} 