import { OpenAI } from 'openai';
import { ValidationSchemaKey } from '@/lib/validations';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { type, content, lang } = await req.json();

  const prompt = lang === 'he' ? 
    `אתה עוזר יצר וממוקד לקורות חיים. בדוק את התוכן ב-${type}:
    
    "${content}"
    
    תן 1-2 טיפים קצרים בלבד. אם הכל טוב - תן מחמאה קצרה של משפט אחד.` :
    `You're a concise CV assistant. Check this ${type} content:
    
    "${content}"
    
    Give only 1-2 short tips. If it's good - give a one-sentence compliment.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: lang === 'he' ? 
            "תן תשובה של 1-2 משפטים בלבד. היה ידידותי אבל תמציתי מאוד." :
            "Give only 1-2 sentences. Be friendly but very concise."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    return Response.json({ 
      feedback: completion.choices[0].message.content,
      isValid: true
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ 
      feedback: lang === 'he' ? 
        'אופס, משהו השתבש. אבל אל דאגה, המשך לכתוב ואני אנסה שוב בקרוב!' :
        'Oops, something went wrong. But no worries, keep writing and I will try again soon!',
      isValid: false
    });
  }
} 