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
    const { sessionId, targetLang = 'en' } = await req.json();
    console.log('Received sessionId:', sessionId, 'targetLang:', targetLang);
    
    if (!sessionId) {
      console.error('No sessionId provided');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!['he', 'en'].includes(targetLang)) {
      console.error('Invalid target language:', targetLang);
      return NextResponse.json(
        { error: 'Invalid target language. Must be "he" or "en"' },
        { status: 400 }
      );
    }

    //קבלת הנתונים הנוכחיים
    const { data: cvData, error: cvError } = await supabase
      .from('cv_data')
      .select('format_cv, en_format_cv, language')
      .eq('session_id', sessionId)
      .single();

    if (cvError) {
      console.error('Error fetching CV data:', cvError);
      return NextResponse.json(
        { error: 'Failed to fetch CV data', details: cvError.message },
        { status: 500 }
      );
    }

    if (!cvData?.format_cv) {
      console.error('No CV data found');
      return NextResponse.json(
        { error: 'No CV data found for this session' },
        { status: 404 }
      );
    }

    // בדיקה אם השפה הנוכחית היא השפה המבוקשת
    if (cvData.language === targetLang) {
      console.log('Already in target language:', targetLang);
      return NextResponse.json({ 
        success: true,
        cv: targetLang === 'en' ? cvData.en_format_cv : cvData.format_cv,
        currentLang: targetLang
      });
    }

    // בדיקה אם יש כבר תרגום לאנגלית
    if (targetLang === 'en' && cvData.en_format_cv) {
      console.log('Found existing English translation');
      // עדכון השפה הנוכחית
      const { error: updateError } = await supabase
        .from('cv_data')
        .update({ language: 'en' })
        .eq('session_id', sessionId);

      if (updateError) {
        console.error('Error updating language:', updateError);
      }

      return NextResponse.json({ 
        success: true,
        cv: cvData.en_format_cv,
        currentLang: 'en'
      });
    }

    console.log('Original CV data:', cvData.format_cv);

    // תרגום באמצעות Claude
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        messages: [
          { 
            role: 'user', 
            content: `
              Translate this CV from Hebrew to English and optimize it for A4 format. Follow these strict rules:
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

              Content length limits for A4 format:
              1. Professional Summary: Maximum 3-4 sentences
              2. Work Experience: 
                 - Maximum 4-5 positions
                 - Each position: 2-3 bullet points
                 - Each bullet point: 100-120 characters max
              3. Education: Maximum 3 degrees
              4. Skills:
                 - Technical: Maximum 8 skills
                 - Soft: Maximum 6 skills
              5. Languages: Maximum 4 languages
              6. Military/National Service: Maximum 2-3 bullet points

              The CV data is: ${JSON.stringify(cvData.format_cv)}
            `
          }
        ],
        system: `You are a professional CV translator and optimizer specializing in Hebrew to English translation.
                 Your primary rules:
                 1. NEVER leave any Hebrew text in the output
                 2. Always translate "היום" to "Present"
                 3. Keep the exact JSON structure
                 4. Don't modify: dates (except "היום"), numbers, emails, phone numbers
                 5. Use professional CV terminology in English
                 6. Ensure section titles match the provided mapping exactly
                 7. Return only valid JSON matching the input structure
                 8. Double-check that no Hebrew characters remain in the final output
                 9. If content exceeds the specified limits, prioritize:
                    - Most recent and relevant experience
                    - Highest education level
                    - Most relevant skills for the position
                    - Current or highest language proficiency`
      });

      const translatedCV = completion.content[0].type === 'text' 
        ? JSON.parse(completion.content[0].text)
        : null;

      if (!translatedCV) {
        console.error('Translation failed: No content returned from Claude');
        return NextResponse.json(
          { error: 'Failed to translate CV - No content returned' },
          { status: 500 }
        );
      }

      console.log('Translated CV:', translatedCV);

      // שמירת התרגום ועדכון השפה הנוכחית
      const { error: updateError } = await supabase
        .from('cv_data')
        .update({ 
          en_format_cv: translatedCV,
          language: targetLang,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (updateError) {
        console.error('Error saving translation:', updateError);
        return NextResponse.json(
          { error: 'Failed to save translation', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true,
        cv: translatedCV,
        currentLang: targetLang
      });

    } catch (translationError) {
      console.error('Translation service error:', translationError);
      return NextResponse.json(
        { 
          error: 'Translation service error',
          details: translationError instanceof Error ? translationError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

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