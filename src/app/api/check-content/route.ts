import { OpenAI } from 'openai';
import { ValidationSchemaKey } from '@/lib/validations';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { type, content, lang } = await req.json();

  const prompt = lang === 'he' ? 
    `בתור עוזר.ת מקצועי.ת לכתיבת קורות חיים, נתח.י את התוכן הבא בשדה ${type}:
    
    "${content}"
    
    יש לתת טיפ אחד קצר וממוקד לשיפור התוכן. להתייחס רק לשינוי האחרון שבוצע בטקסט.
    אם התוכן טוב - לתת מחמאה קצרה וספציפית על מה שנכתב.
    חשוב: להתמקד רק בתוכן עצמו ולא להציע דברים לא קשורים (כמו לינקדאין או דברים חיצוניים).` :
    `You're a professional CV writing assistant. Analyze the following ${type} content:
    
    "${content}"
    
    Give one short, focused tip for improving the content. Only address the latest change in the text.
    If the content is good - give a short, specific compliment about what was written.
    Important: Focus only on the content itself and don't suggest unrelated things (like LinkedIn or external items).`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: lang === 'he' ? 
            "יש לתת תשובה של משפט אחד בלבד. לשמור על טון ידידותי אך תמציתי. להתמקד רק בתוכן הטקסט ובשיפורו." :
            "Give only one sentence. Be friendly but very concise. Focus only on the text content and its improvement."
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