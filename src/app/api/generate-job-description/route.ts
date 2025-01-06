import { NextResponse } from 'next/server';

interface ClaudeResponse {
  content: Array<{
    type: string;
    text?: string;
    content?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

export async function POST(request: Request) {
  try {
    const { position, company, lang } = await request.json();

    const prompt = lang === 'he' 
      ? `אנא כתוב תיאור תפקיד מקצועי ומפורט עבור משרת ${position}${company ? ` ב-${company}` : ''}. התיאור צריך להיות בעברית ולכלול את המשימות והאחריות העיקריות של התפקיד. כתוב כל משימה בשורה נפרדת והתחל כל שורה עם מקף (-).`
      : `Please write a professional and detailed job description for the position of ${position}${company ? ` at ${company}` : ''}. The description should be in English and include the main responsibilities and tasks of the role. Write each task on a new line and start each line with a dash (-).`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate description');
    }

    const data = await response.json() as ClaudeResponse;
    const description = data.content[0]?.text || 
                       data.content[0]?.content?.[0]?.text || 
                       'Failed to generate description';

    return NextResponse.json({ description });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
} 