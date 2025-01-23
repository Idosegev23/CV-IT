import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { prompt, model = 'claude-3-5-haiku-20241022', temperature = 0.7, max_tokens = 500 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const completion = await anthropic.messages.create({
      model,
      max_tokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = completion.content[0].type === 'text' 
      ? completion.content[0].text
      : null;

    if (!content) {
      return NextResponse.json(
        { error: 'Generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Summary generation failed' },
      { status: 500 }
    );
  }
} 