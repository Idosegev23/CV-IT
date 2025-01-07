import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
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

    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Convert the following email template requirements to HTML format. 
        The template should support the following variables that will be replaced:
        - {{candidate_name}} - Full name of the candidate
        - {{candidate_phone}} - Phone number of the candidate
        - {{candidate_email}} - Email of the candidate
        - {{candidate_experience}} - Years of experience in role
        - {{agency_name}} - Name of the recruitment agency

        Requirements: ${text}
        
        Return only the HTML template without any explanations. Make sure to use the variables in appropriate places.`
      }],
    });

    const htmlTemplate = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ htmlTemplate });
  } catch (error) {
    console.error('Error converting template:', error);
    return NextResponse.json(
      { error: 'Failed to convert template' },
      { status: 500 }
    );
  }
} 