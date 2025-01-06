import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Translate all of this text from Hebrew to English, including labels and titles. 
                   Translate everything exactly as is, keeping the same structure and format.
                   DONT ADD ANY NOTES OR EXPLANATIONS!
                   IF THE CONTENT IS A LIST, KEEP THE LIST FORMAT!
                   IF THE CONTENT IS A TABLE, KEEP THE TABLE FORMAT!
                   IF THE CONTENT IS A BULLET POINT, KEEP THE BULLET POINT FORMAT!
                   IF THE CONTENT IS A NUMBER, KEEP THE NUMBER FORMAT!
                   IF THE CONTENT IS A DATE, KEEP THE DATE FORMAT!
                   IF THE CONTENT IS A TIME, KEEP THE TIME FORMAT!
                   IF THE CONTENT IS A PERCENTAGE, KEEP THE PERCENTAGE FORMAT!
                   IF THE CONTENT IS A CURRENCY, KEEP THE CURRENCY FORMAT!
                   IF THE CONTENT IS A LINK, KEEP THE LINK FORMAT!
                   IF THE CONTENT IS A PHONE NUMBER, KEEP THE PHONE NUMBER FORMAT!
                   IF THE CONTENT IS A EMAIL, KEEP THE EMAIL FORMAT!
                   IF THE CONTENT IS A ADDRESS, KEEP THE ADDRESS FORMAT!
                   IF THE CONTENT IS A COMPANY NAME, KEEP THE COMPANY NAME FORMAT!
                   IF THE CONTENT IS A JOB TITLE, KEEP THE JOB TITLE FORMAT!
                   IF THE CONTENT IS A SKILL, KEEP THE SKILL FORMAT!
                   IF THE CONTENT IS A LANGUAGE, KEEP THE LANGUAGE FORMAT!
                   NUMBER AND DATES SHOULD BE KEPT AS IS!
                   Here's the text to translate:
                   ${text}`
        }
      ]
    });

    const translatedText = completion.content[0].type === 'text' 
      ? completion.content[0].text
      : null;

    if (!translatedText) {
      return NextResponse.json(
        { error: 'Translation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
} 