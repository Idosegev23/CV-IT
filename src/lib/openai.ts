import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface GenerateContentResponse {
  text: string;
  imageUrl: string | null;
}

export async function generateLinkedInContent(topic?: string): Promise<GenerateContentResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const response = await fetch(`${baseUrl}/api/linkedin/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
} 