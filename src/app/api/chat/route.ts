import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { CV_CREATION_SYSTEM_PROMPT, INITIAL_QUESTION, generateNextPrompt } from '@/lib/prompts';

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

function detectLanguage(text: string): 'he' | 'en' {
  const hebrewPattern = /[\u0590-\u05FF]/;
  return hebrewPattern.test(text) ? 'he' : 'en';
}

export async function POST(request: Request) {
  console.log('=== New Request ===');
  
  try {
    const { message, currentStep, collectedData, language, isFirstMessage, sessionId } = await request.json();
    let currentLanguage: 'he' | 'en' = language || detectLanguage(message);

    console.log('Session ID:', sessionId);
    console.log('Message:', message);
    console.log('Current Step:', currentStep);
    console.log('Language:', currentLanguage);
    console.log('Is First Message:', isFirstMessage);

    // טיפול בהודעה ראשונה
    if (isFirstMessage) {
      console.log('Starting new conversation');
      const initialMessage = INITIAL_QUESTION[currentLanguage];
      
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: initialMessage,
          language: currentLanguage
        });

      if (insertError) throw insertError;

      return NextResponse.json({
        message: initialMessage,
        currentStep: 'personal_info',
        language: currentLanguage,
        collectedData: { personalInfo: {} }
      });
    }

    // שליפת היסטוריית השיחה
    const { data: chatHistory, error: chatError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (chatError) throw chatError;

    // שמירת הודעת המשתמש
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        language: currentLanguage
      });

    if (userMsgError) throw userMsgError;

    // יצירת הפרומפט המלא
    const fullPrompt = `${CV_CREATION_SYSTEM_PROMPT}\n\n${generateNextPrompt(collectedData, message, currentLanguage)}`;

    // שליחה לקלוד
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: fullPrompt,
      messages: chatHistory || []
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // שמירת תשובת המערכת
    const { error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantMessage,
        language: currentLanguage
      });

    if (assistantMsgError) throw assistantMsgError;

    // עדכון נתוני CV
    const { error: cvDataError } = await supabase
      .from('cv_data')
      .upsert({
        session_id: sessionId,
        content: collectedData,
        language: currentLanguage,
        last_updated: new Date().toISOString()
      });

    if (cvDataError) throw cvDataError;

    console.log('=== Request Completed Successfully ===');

    return NextResponse.json({
      message: assistantMessage,
      currentStep: currentStep || 'personal_info',
      collectedData: collectedData || {},
      language: currentLanguage
    });

  } catch (error) {
    console.error('=== Request Failed ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 