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
          content: `Translate the following text ${text.includes('•') ? 'from Hebrew to English' : 'from English to Hebrew'}.
                   Important rules:
                   1. Provide ONLY the direct translation
                   2. Keep all formatting (bullet points, numbers, dates) exactly as is
                   3. Do not add any notes, explanations or metadata
                   4. Preserve all special characters (•, -, etc.)
                   5. Keep all proper nouns, company names, and technical terms in their original form
                   
                   Text to translate:
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