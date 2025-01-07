import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function POST(request: Request) {
  try {
    const { topic } = await request.json().catch(() => ({}));
    
    if (topic === undefined) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // בדיקת השפה של הנושא
    const isHebrew = topic ? /[\u0590-\u05FF]/.test(topic) : true;
    const language = isHebrew ? 'Hebrew' : 'English';
    
    const prompt = topic 
      ? `Create a captivating LinkedIn post about: ${topic}
         Language: ${language}

         Guidelines for an exceptional post:
         1. Opening:
            - Start with a powerful hook that grabs attention
            - Create immediate emotional connection
            - Use storytelling techniques or surprising statistics
            - Begin with a thought-provoking question or bold statement

         2. Content Structure:
            - Build a clear narrative arc
            - Include personal insights and unique perspectives
            - Share concrete, real-world examples and case studies
            - Break complex ideas into digestible points
            - Use short, impactful paragraphs
            - Create a smooth flow between ideas

         3. Professional Elements:
            - Demonstrate deep industry knowledge
            - Include relevant data points or statistics
            - Share actionable insights and practical tips
            - Maintain a professional yet conversational tone
            - Add credibility with specific examples
            - Reference current industry trends

         4. Engagement Techniques:
            - End with a thought-provoking question
            - Include a strong call-to-action
            - Encourage meaningful discussion
            - Ask for others' experiences or opinions
            - Make it shareable and memorable
            - Create opportunities for networking

         5. Format and Style:
            - Use clean, professional formatting
            - Include strategic line breaks for readability
            - No emojis, keep it sophisticated
            - Use bullet points or numbered lists when appropriate
            - Keep paragraphs concise (2-3 lines max)
            - Highlight key takeaways

         6. Cultural Sensitivity:
            - Adapt tone and examples to ${language} cultural context
            - Use local business references when relevant
            - Consider regional business practices
            - Maintain professional language standards`
      : `Create a captivating LinkedIn post about professional growth, innovation, or leadership.
         [Same guidelines as above...]`;

    try {
      // ניסיון ראשון עם OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a world-class LinkedIn content creator and thought leader. 
                     You excel at writing engaging, professional content that captivates readers and drives engagement.
                     Your posts are known for their powerful storytelling, deep insights, and ability to spark meaningful discussions.
                     Write in ${language} with a sophisticated, professional tone.
                     Focus on creating content that provides real value while maintaining high engagement.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const text = completion.choices[0]?.message?.content || '';

      // יצירת תמונה
      const imagePrompt = topic 
        ? `Create a powerful, cinematic photograph that captures the essence of: ${topic}
           Requirements:
           - Professional, high-impact photography
           - Dramatic lighting and composition
           - Rich, deep colors and contrasts
           - Strong emotional resonance
           - Subtle symbolism related to the topic
           - Absolutely no text or logos
           - Must look like it's shot by a professional photographer
           Style: High-end editorial photography, similar to Fortune, Forbes, or Harvard Business Review cover quality`
        : `Create a powerful, cinematic photograph representing professional excellence and innovation.
           [Same requirements as above...]`;

      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      });

      return NextResponse.json({
        text,
        imageUrl: imageResponse.data[0]?.url || null
      });

    } catch (openaiError) {
      console.error('OpenAI error, falling back to Claude:', openaiError);

      // גיבוי עם Claude
      const claudeCompletion = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        system: `You are a world-class LinkedIn content creator and thought leader. 
                You excel at writing engaging, professional content that captivates readers and drives engagement.
                Your posts are known for their powerful storytelling, deep insights, and ability to spark meaningful discussions.
                Write in ${language} with a sophisticated, professional tone.
                Focus on creating content that provides real value while maintaining high engagement.`
      });

      const text = claudeCompletion.content[0].type === 'text' 
        ? claudeCompletion.content[0].text 
        : '';

      // במקרה של Claude, נחזיר רק את הטקסט ללא תמונה
      return NextResponse.json({
        text,
        imageUrl: null,
        provider: 'claude' // אופציונלי - מציין שהתוכן נוצר על ידי Claude
      });
    }

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 