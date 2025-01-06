import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const sectionTitles = {
  personal_info: "Personal Information",
  experience: "Professional Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  military_service: "Military Service",
  summary: "Professional Summary"
};

export async function POST(req: Request) {
  try {
    console.log('Translation endpoint hit');
    const { sessionId } = await req.json();
    console.log('Received sessionId:', sessionId);
    
    if (!sessionId) {
      console.error('No sessionId provided');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    //קבלת הנתונים הנוכחיים
    const { data: cvData, error: cvError } = await supabase
      .from('cv_data')
      .select('format_cv, en_format_cv')  // נוסיף גם את הגרסה באנגלית
      .eq('session_id', sessionId)
      .single();

    if (cvError || !cvData?.format_cv) {
      console.error('Error fetching CV data:', cvError);
      return NextResponse.json(
        { error: 'Failed to fetch CV data' },
        { status: 500 }
      );
    }

    // בדיקה אם כבר יש תרגום
    if (cvData.en_format_cv) {
      return NextResponse.json({ 
        success: true,
        cv: cvData.en_format_cv
      });
    }

    console.log('Original CV skills:', cvData.format_cv.skills);

    // תרגום באמצעות Claude
    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [
        { 
          role: 'user', 
          content: `
            Translate this CV from Hebrew to English. Follow these strict rules:
            1. Translate EVERYTHING - no Hebrew characters should remain
            2. For dates: if "היום" appears, always translate to "Present"
            3. Keep the exact same structure and format
            4. Maintain professional CV terminology
            5. Keep all numbers and email addresses as they are
            6. For skills section, ensure this exact structure is maintained:
            {
              "skills": {
                "technical": [{ "name": string, "level": number }],
                "soft": [{ "name": string, "level": number }],
                "languages": [{ "language": string, "level": string }]
              }
            }

            The CV data is: ${JSON.stringify(cvData.format_cv)}
          `
        }
      ],
      system: `You are a professional CV translator specializing in Hebrew to English translation.
               Your primary rules:
               1. NEVER leave any Hebrew text in the output
               2. Always translate "היום" to "Present"
               3. Keep the exact JSON structure
               4. Don't modify: dates (except "היום"), numbers, emails, phone numbers
               5. Use professional CV terminology in English
               6. Ensure section titles match the provided mapping exactly
               7. Return only valid JSON matching the input structure
               8. Double-check that no Hebrew characters remain in the final output`
    });

    const translatedCV = completion.content[0].type === 'text' 
      ? JSON.parse(completion.content[0].text)
      : null;

    if (!translatedCV) {
      return NextResponse.json(
        { error: 'Failed to translate CV' },
        { status: 500 }
      );
    }

    console.log('Translated CV skills:', translatedCV.skills);

    // שמירת התרגום
    const { error: updateError } = await supabase
      .from('cv_data')
      .update({ 
        en_format_cv: translatedCV,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (updateError) {
      console.error('Error saving translation:', updateError);
      return NextResponse.json(
        { error: 'Failed to save translation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      cv: translatedCV
    });

  } catch (error) {
    console.error('Translation endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to translate CV',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 