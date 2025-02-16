import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// בדיקה שיש API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    console.log('Sending request to Anthropic with prompt:', prompt);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    console.log('Received response from Anthropic:', response);

    // בדיקה שיש תוכן בתגובה
    if (!response.content || response.content.length === 0) {
      console.error('Empty response content');
      throw new Error('Empty response from AI');
    }

    const firstContent = response.content[0];
    
    // בדיקה שהתוכן הוא מסוג טקסט
    if (firstContent.type !== 'text') {
      console.error('Unexpected content type:', firstContent.type);
      throw new Error('Unexpected response format');
    }

    // ניקוי הטקסט
    const cleanText = firstContent.text
      .replace(/^["']|["']$/g, '')  // מסיר גרשיים בהתחלה ובסוף
      .replace(/\\n/g, ' ')         // מחליף ירידות שורה ברווחים
      .trim();                      // מסיר רווחים מיותרים

    console.log('Cleaned text:', cleanText);

    return NextResponse.json({ text: cleanText });

  } catch (error: any) {
    // לוג מפורט של השגיאה
    const errorDetails = {
      name: error?.name || 'Unknown Error',
      message: error?.message || 'No error message available',
      stack: error?.stack || 'No stack trace available',
      details: error?.details || 'No additional details'
    };

    console.error('Detailed error in generate-description:', errorDetails);

    // החזרת הודעת שגיאה ספציפית יותר
    return NextResponse.json(
      { 
        error: 'Failed to generate description',
        details: errorDetails.message
      },
      { status: 500 }
    );
  }
} 