import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { description, lang } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `
    You are a professional CV writing expert. Your task is to break down a job description into distinct, impactful bullet points.
    
    Guidelines:
    1. Each bullet point should start with an action verb
    2. Focus on achievements and responsibilities
    3. Use quantifiable metrics when possible
    4. Keep each point concise (max 100 characters)
    5. Aim for 3-5 bullet points
    6. Remove any redundant or overlapping points
    7. Maintain professional language
    8. Format in the job seeker's perspective ("Led", "Managed", not "Leading" or "Managing")
    
    Return ONLY an array of strings, each string being a bullet point.
    Do not include any other text or explanation.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please convert this job description into professional CV bullet points. Language: ${lang}\n\n${description}`
        }
      ]
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    let bulletPoints: string[];
    
    try {
      // נסה לפרסר את התשובה כ-JSON
      bulletPoints = JSON.parse(content);
    } catch (e) {
      // אם הפרסור נכשל, פצל לפי שורות ונקה
      bulletPoints = content
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line && !line.startsWith('[') && !line.endsWith(']'));
    }

    return NextResponse.json({ bulletPoints });
  } catch (error) {
    console.error('Error processing job description:', error);
    return NextResponse.json(
      { error: 'Failed to process job description' },
      { status: 500 }
    );
  }
} 