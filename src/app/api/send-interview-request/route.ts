import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { headers } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const ZOHO_MAIL = process.env.ZOHO_MAIL_USER;
const ZOHO_PASSWORD = process.env.ZOHO_MAIL_PASS;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!ZOHO_MAIL || !ZOHO_PASSWORD || !ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: ZOHO_MAIL,
    pass: ZOHO_PASSWORD
  }
});

const formatAnalysis = (analysis: string) => {
  // מחלק את הטקסט לסעיפים
  const sections = analysis.split(/\d+\.\s+/).filter(Boolean);
  
  return sections.map((section) => {
    const [title, ...content] = section.split('\n').filter(Boolean);
    return `
      <div class="analysis-section">
        <h3 class="analysis-title">${title.trim()}</h3>
        <div class="analysis-content">
          ${content.map(line => `<p>${line.trim()}</p>`).join('')}
        </div>
      </div>
    `;
  }).join('');
};

const analyzeCV = async (cvData: any, content: any) => {
  try {
    const systemPrompt = `אתה מומחה לניתוח קורות חיים והכנה לראיות עבודה. 
    תפקידך לנתח את קורות החיים ולהכין דוח מפורט שיעזור למכין הראיון להבין את המועמד ולהכין אותו בצורה הטובה ביותר.
    חשוב מאוד להתייחס לתפקיד הספציפי שהמועמד מעוניין בו ולהתאים את ההכנה לראיון בהתאם.
    יש להתייחס גם למיומנויות הטכניות וגם לכישורים הרכים של המועמד.
    אנא הצג את התשובה בפורמט נקי ומסודר, עם כותרות ברורות וסעיפי משנה.`;

    const userPrompt = `
    אנא נתח את קורות החיים הבאים והכן דוח מפורט להכנה לראיון:

    קורות חיים מפורמטים:
    ${JSON.stringify(cvData.format_cv, null, 2)}

    תוכן גולמי:
    ${JSON.stringify(content, null, 2)}

    אנא התייחס לנקודות הבאות:
    1. ניתוח התפקיד המבוקש והתאמת המועמד
    2. חוזקות מרכזיות של המועמד
    3. נקודות שדורשות חיזוק או הכנה מיוחדת
    4. המלצות לשאלות ספציפיות שכדאי להתכונן אליהן
    5. טיפים להצגת הניסיון בצורה אפקטיבית
    6. מיומנויות טכניות ורכות שכדאי להדגיש
    7. תחומי ידע שכדאי לרענן לפני הראיון
    8. המלצות להכנה מקצועית ממוקדת

    אנא הצג את הניתוח בפורמט מובנה ומסודר.
    `;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    if (!message.content[0] || !('text' in message.content[0])) {
      throw new Error('Invalid response format from Claude');
    }

    return formatAnalysis(message.content[0].text);
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return 'לא ניתן היה לנתח את קורות החיים';
  }
};

const createEmailTemplate = async (cvData: any, content: any, lang: string) => {
  const isHebrew = lang === 'he';
  const personalDetails = cvData.format_cv.personal_details;
  const analysis = await analyzeCV(cvData, content);

  return `
    <!DOCTYPE html>
    <html dir="${isHebrew ? 'rtl' : 'ltr'}" lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>בקשה להכנה לראיון עבודה</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f1;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background-color: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
          }
          .header {
            color: #4754D6;
            font-size: 24px;
            margin-bottom: 24px;
            text-align: ${isHebrew ? 'right' : 'left'};
            border-bottom: 2px solid #4754D6;
            padding-bottom: 12px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-weight: bold;
            color: #4754D6;
            margin-bottom: 10px;
          }
          .highlight {
            background-color: #f0f2ff;
            padding: 12px;
            border-radius: 8px;
            margin: 8px 0;
          }
          .analysis-section {
            margin-bottom: 24px;
            padding: 16px;
            background-color: #f8f9ff;
            border-radius: 8px;
          }
          .analysis-title {
            color: #4754D6;
            font-size: 18px;
            margin-bottom: 12px;
            border-bottom: 1px solid #e0e4ff;
            padding-bottom: 8px;
          }
          .analysis-content p {
            margin: 8px 0;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1 class="header">בקשה חדשה להכנה לראיון עבודה</h1>
            
            <div class="section">
              <div class="section-title">פרטי המועמד</div>
              <div class="highlight">
                <p><strong>שם מלא:</strong> ${personalDetails.name}</p>
                <p><strong>טלפון:</strong> ${personalDetails.phone}</p>
                <p><strong>אימייל:</strong> ${personalDetails.email}</p>
                ${personalDetails.address ? `<p><strong>כתובת:</strong> ${personalDetails.address}</p>` : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">ניתוח מקצועי והמלצות להכנה לראיון</div>
              ${analysis}
            </div>

            <div class="section">
              <div class="section-title">הערות נוספות</div>
              <p>* מומלץ ליצור קשר עם המועמד בהקדם לתיאום מועד להכנה לראיון</p>
              <p>* קורות החיים המלאים מצורפים למייל זה</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const createCandidateEmailTemplate = async (cvData: any, content: any, lang: string, analysis: string) => {
  const isHebrew = lang === 'he';
  const firstName = cvData.format_cv.personal_details.name.split(' ')[0];
  const experience = cvData.format_cv.experience || [];
  const education = cvData.format_cv.education || [];
  const skills = cvData.format_cv.skills || [];

  // מציאת התפקיד האחרון
  const lastJob = experience[0];
  const lastRole = lastJob ? (isHebrew ? lastJob.role : lastJob.role_english) : '';

  // הכנת דוגמה אישית למודל STAR
  const starExample = isHebrew 
    ? `בתפקיד ${lastRole || 'המקצועי'}, חשוב להדגיש הישגים משמעותיים. למשל:
       • מצב (Situation): "בתפקיד הקודם, הצוות התמודד עם אתגר X"
       • משימה (Task): "קיבלתי אחריות על פתרון הבעיה"
       • פעולה (Action): "הובלתי תהליך חדש/ניהלתי צוות/פיתחתי פתרון"
       • תוצאה (Result): "כתוצאה מכך, השגנו שיפור של X% / חסכון של Y / שביעות רצון גבוהה"` 
    : `In the ${lastRole || 'professional'} role, it's important to emphasize significant achievements. For example:
       • Situation: "In the previous role, the team faced challenge X"
       • Task: "I was given responsibility for solving the problem"
       • Action: "I led a new process/managed a team/developed a solution"
       • Result: "As a result, we achieved X% improvement / Y savings / high satisfaction"`;

  // הכנת טיפים מותאמים אישית
  const personalizedTips = isHebrew
    ? [
        skills.length > 0 ? `• כדאי להדגיש את המיומנויות הבאות: ${skills.join(', ')}` : '',
        experience.length > 0 ? `• אפשר לספר על ההישג המשמעותי ב-${experience[0].company}` : '',
        education.length > 0 ? `• ניתן להשתמש בידע שנרכש ב-${education[0].institution}` : '',
      ].filter(Boolean)
    : [
        skills.length > 0 ? `• Consider emphasizing these key skills: ${skills.join(', ')}` : '',
        experience.length > 0 ? `• Share your significant achievement at ${experience[0].company}` : '',
        education.length > 0 ? `• Leverage the knowledge gained at ${education[0].institution}` : '',
      ].filter(Boolean);

  return `
    <!DOCTYPE html>
    <html dir="${isHebrew ? 'rtl' : 'ltr'}" lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${isHebrew ? 'הכנה לראיון העבודה שלך' : 'Your Interview Preparation'}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f1;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background-color: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
          }
          .header {
            color: #4754D6;
            font-size: 28px;
            margin-bottom: 24px;
            text-align: ${isHebrew ? 'right' : 'left'};
            border-bottom: 2px solid #4754D6;
            padding-bottom: 12px;
            font-weight: bold;
          }
          .section {
            margin-bottom: 32px;
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #f0f2ff;
          }
          .section-title {
            font-weight: bold;
            color: #4754D6;
            margin-bottom: 16px;
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .highlight {
            background-color: #f8f9ff;
            padding: 16px;
            border-radius: 12px;
            margin: 12px 0;
            border-right: 4px solid #4754D6;
          }
          .motivation-quote {
            font-style: italic;
            color: #4754D6;
            text-align: center;
            font-size: 20px;
            margin: 32px 0;
            padding: 24px;
            background: linear-gradient(135deg, #f0f2ff 0%, #ffffff 100%);
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(71, 84, 214, 0.1);
          }
          .tips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-top: 16px;
          }
          .tip-card {
            background: #f8f9ff;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e0e4ff;
          }
          .tip-title {
            font-weight: bold;
            color: #4754D6;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          ul {
            padding-right: ${isHebrew ? '20px' : '0'};
            padding-left: ${isHebrew ? '0' : '20px'};
          }
          li {
            margin-bottom: 12px;
            position: relative;
          }
          .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 2px solid #f0f2ff;
            color: #666;
          }
          .star-model {
            background: linear-gradient(135deg, #f0f2ff 0%, #ffffff 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 20px 0;
            border-right: 4px solid #4754D6;
          }
          .star-step {
            margin: 12px 0;
            padding: 12px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(71, 84, 214, 0.1);
          }
          .personal-tips {
            background: #f8f9ff;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-right: 4px solid #4754D6;
          }
          .personal-tip-item {
            margin: 12px 0;
            padding: 8px;
            background: white;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1 class="header">
              ${isHebrew ? '🎯 תכנית הכנה אישית לראיון העבודה' : '🎯 Your Personal Interview Preparation'}
            </h1>
            
            <div class="section">
              <div class="motivation-quote">
                ${isHebrew 
                  ? '✨ הניסיון והכישורים שלך הם הבסיס להצלחה - בואו נבנה עליהם! ✨'
                  : '✨ Your experience and skills are the foundation for success - let\'s build on them! ✨'}
              </div>
              
              <p>
                ${isHebrew 
                  ? `היי ${firstName},`
                  : `Hi ${firstName},`}
              </p>
              
              <p>
                ${isHebrew 
                  ? `קיבלנו את הבקשה להכנה לראיון ונציג מהצוות שלנו ייצור קשר בקרוב. עברנו על קורות החיים והכנו תכנית הכנה מותאמת אישית, המתבססת על הניסיון ${lastRole ? `בתפקיד ${lastRole}` : 'המקצועי'} והכישורים הייחודיים שלך.`
                  : `We received your interview preparation request and our team member will contact you soon. We've reviewed your CV and prepared a personalized preparation plan based on your experience ${lastRole ? `as ${lastRole}` : 'in your professional role'} and your unique skills.`}
              </p>
            </div>

            <div class="section">
              <div class="section-title">
                ${isHebrew ? '🎯 ניתוח אישי והמלצות' : '🎯 Personal Analysis & Recommendations'}
              </div>
              ${analysis}
            </div>

            <div class="section">
              <div class="section-title">
                ${isHebrew ? '💫 טיפים מותאמים אישית עבורך' : '💫 Personalized Tips for You'}
              </div>
              <div class="personal-tips">
                ${personalizedTips.map(tip => `<div class="personal-tip-item">${tip}</div>`).join('')}
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                ${isHebrew ? '🌟 מודל STAR להצגת הישגים' : '🌟 STAR Model for Presenting Achievements'}
              </div>
              <div class="star-model">
                <p>
                  ${isHebrew 
                    ? 'מודל STAR הוא כלי מעולה להצגת הישגים בראיון עבודה. המודל מאפשר לך לספר סיפור מובנה ומשכנע על הניסיון שלך:'
                    : 'The STAR model is an excellent tool for presenting achievements in a job interview. It allows you to tell a structured and convincing story about your experience:'}
                </p>
                <div class="star-step">
                  <strong>${isHebrew ? 'S - מצב (Situation)' : 'S - Situation'}</strong>
                  <p>${isHebrew 
                    ? 'תארו את המצב או האתגר שעמדתם בפניו'
                    : 'Describe the situation or challenge you faced'}</p>
                </div>
                <div class="star-step">
                  <strong>${isHebrew ? 'T - משימה (Task)' : 'T - Task'}</strong>
                  <p>${isHebrew 
                    ? 'הסבירו מה הייתה המשימה שהייתם צריכים לבצע'
                    : 'Explain what task you needed to accomplish'}</p>
                </div>
                <div class="star-step">
                  <strong>${isHebrew ? 'A - פעולה (Action)' : 'A - Action'}</strong>
                  <p>${isHebrew 
                    ? 'פרטו אילו פעולות נקטתם כדי להשיג את המטרה'
                    : 'Detail the actions you took to achieve the goal'}</p>
                </div>
                <div class="star-step">
                  <strong>${isHebrew ? 'R - תוצאה (Result)' : 'R - Result'}</strong>
                  <p>${isHebrew 
                    ? 'תארו את התוצאות שהשגתם והערך שיצרתם'
                    : 'Describe the results you achieved and the value created'}</p>
                </div>
                <div class="highlight">
                  <strong>${isHebrew ? 'דוגמה אישית:' : 'Personal Example:'}</strong>
                  <p>${starExample}</p>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                ${isHebrew ? '💡 טיפים פרקטיים לראיון' : '💡 Practical Interview Tips'}
              </div>
              <div class="tips-grid">
                ${isHebrew ? `
                  <div class="tip-card">
                    <div class="tip-title">🕒 לפני הראיון</div>
                    <ul>
                      <li>חקרו את החברה: אתר, לינקדאין, חדשות אחרונות</li>
                      <li>הכינו 2-3 שאלות מעמיקות על החברה והתפקיד</li>
                      <li>תרגלו תשובות ל"ספרו על עצמכם" ו"למה אתם מתאימים"</li>
                      <li>הכינו דוגמאות ספציפיות להצלחות מניסיונכם</li>
                    </ul>
                  </div>
                  <div class="tip-card">
                    <div class="tip-title">👔 ביום הראיון</div>
                    <ul>
                      <li>הגיעו 15 דקות מוקדם יותר</li>
                      <li>התלבשו באופן מכובד ומקצועי</li>
                      <li>הביאו עותק מודפס של קורות החיים</li>
                      <li>בדקו את הניווט למקום מראש</li>
                    </ul>
                  </div>
                  <div class="tip-card">
                    <div class="tip-title">🗣️ במהלך הראיון</div>
                    <ul>
                      <li>שמרו על קשר עין ושפת גוף פתוחה</li>
                      <li>הקשיבו בתשומת לב ובקשו הבהרות במידת הצורך</li>
                      <li>תנו דוגמאות קונקרטיות מניסיונכם</li>
                      <li>הראו התלהבות והתעניינות בתפקיד</li>
                    </ul>
                  </div>
                  <div class="tip-card">
                    <div class="tip-title">💪 תשובות חזקות</div>
                    <ul>
                      <li>השתמשו במודל STAR לתיאור הצלחות</li>
                      <li>התמקדו בתוצאות ובהישגים מדידים</li>
                      <li>הדגישו כישורים רלוונטיים לתפקיד</li>
                      <li>שתפו בלקחים שלמדתם מאתגרים</li>
                    </ul>
                  </div>
                ` : `
                  <div class="tip-card">
                    <div class="tip-title">🕒 Before the Interview</div>
                    <ul>
                      <li>Research the company: website, LinkedIn, recent news</li>
                      <li>Prepare 2-3 thoughtful questions about the company and role</li>
                      <li>Practice answers to "Tell me about yourself" and "Why are you a good fit"</li>
                      <li>Prepare specific examples of your successes</li>
                    </ul>
                  </div>
                  <div class="tip-card">
                    <div class="tip-title">👔 On Interview Day</div>
                    <ul>
                      <li>Arrive 15 minutes early</li>
                      <li>Dress professionally and appropriately</li>
                      <li>Bring a printed copy of your CV</li>
                      <li>Check the route to the location in advance</li>
                    </ul>
                  </div>
                  <div class="tip-card">
                    <div class="tip-title">🗣️ During the Interview</div>
                    <ul>
                      <li>Maintain eye contact and open body language</li>
                      <li>Listen carefully and ask for clarification if needed</li>
                      <li>Provide concrete examples from your experience</li>
                      <li>Show enthusiasm and interest in the role</li>
                    </ul>
                  </div>
                  <div class="tip-card">
                    <div class="tip-title">💪 Strong Answers</div>
                    <ul>
                      <li>Use the STAR method for describing successes</li>
                      <li>Focus on measurable results and achievements</li>
                      <li>Emphasize skills relevant to the position</li>
                      <li>Share lessons learned from challenges</li>
                    </ul>
                  </div>
                `}
              </div>
            </div>

            <div class="section">
              <div class="section-title">
                ${isHebrew ? '🌟 שאלות נפוצות והצעות לתשובות' : '🌟 Common Questions & Suggested Answers'}
              </div>
              ${isHebrew ? `
                <div class="highlight">
                  <strong>1. "ספר/י לי על עצמך"</strong>
                  <p>התמקדו ב-2-3 דקות של תקציר מקצועי. התחילו מההווה, עברו לעבר הרלוונטי, וסיימו עם השאיפות שלכם לעתיד והקשר לתפקיד.</p>
                </div>
                <div class="highlight">
                  <strong>2. "למה את/ה רוצה לעבוד אצלנו?"</strong>
                  <p>הראו שחקרתם את החברה. ציינו 2-3 דברים ספציפיים שמושכים אתכם בחברה ובתפקיד.</p>
                </div>
                <div class="highlight">
                  <strong>3. "מה החולשות שלך?"</strong>
                  <p>בחרו חולשה אמיתית אך לא קריטית לתפקיד, והדגישו כיצד אתם עובדים על שיפורה.</p>
                </div>
              ` : `
                <div class="highlight">
                  <strong>1. "Tell me about yourself"</strong>
                  <p>Focus on a 2-3 minute professional summary. Start with the present, move to relevant past, and end with your aspirations and connection to the role.</p>
                </div>
                <div class="highlight">
                  <strong>2. "Why do you want to work here?"</strong>
                  <p>Show that you've researched the company. Mention 2-3 specific things that attract you to the company and role.</p>
                </div>
                <div class="highlight">
                  <strong>3. "What are your weaknesses?"</strong>
                  <p>Choose a real but non-critical weakness, and emphasize how you're working to improve it.</p>
                </div>
              `}
            </div>

            <div class="section">
              <div class="motivation-quote">
                ${isHebrew 
                  ? `💫 ${firstName}, הניסיון והכישורים שלך מרשימים - זה הזמן להציג אותם בצורה הטובה ביותר!`
                  : `💫 ${firstName}, your experience and skills are impressive - now it's time to present them in the best way possible!`}
              </div>
            </div>

            <div class="footer">
              ${isHebrew 
                ? 'צוות CVIT תמיד כאן לעזור 💙'
                : 'The CVIT team is always here to help 💙'}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  let lang = 'he';
  
  try {
    const { cvData, content, sessionId, lang: requestLang } = await request.json();
    lang = requestLang;
    
    console.log('Starting interview request process for session:', sessionId);
    
    // שליפת ה-PDF מ-Supabase Storage
    const { data: cvDataRow, error: cvDataError } = await supabase
      .from('cv_data')
      .select('pdf_filename')
      .eq('session_id', sessionId)
      .single();

    if (cvDataError) {
      console.error('Error fetching CV data:', cvDataError);
      throw new Error('Failed to fetch CV data');
    }

    console.log('CV data row:', cvDataRow);

    if (!cvDataRow?.pdf_filename) {
      console.error('PDF filename not found for session:', sessionId);
      throw new Error('PDF filename is missing');
    }

    console.log('Attempting to download PDF:', cvDataRow.pdf_filename);

    try {
      // נשתמש ב-signed URL במקום נתיב ציבורי
      console.log('Creating signed URL for:', cvDataRow.pdf_filename);
      
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('CVs')
        .createSignedUrl(cvDataRow.pdf_filename, 60); // URL תקף ל-60 שניות

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('Error creating signed URL:', signedUrlError);
        throw new Error('Failed to create download URL');
      }

      console.log('Successfully created signed URL');
      
      const response = await fetch(signedUrlData.signedUrl);
      if (!response.ok) {
        console.error('Error downloading PDF:', response.status, response.statusText);
        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }

      const pdfData = await response.blob();
      console.log('PDF downloaded successfully');

      // ניתוח קורות החיים
      const analysis = await analyzeCV(cvData, content);

      // שליחת מייל למראיין
      const mailOptions: Mail.Options = {
        from: `"CVIT Resume System" <${ZOHO_MAIL}>`,
        to: 'lee.penn@cvit.co.il',
        subject: 'בקשה חדשה להכנה לראיון עבודה',
        html: await createEmailTemplate(cvData, content, lang),
        attachments: cvDataRow?.pdf_filename ? [
          {
            filename: `${cvData.format_cv.personal_details.name} - CV.pdf`,
            content: Buffer.from(await pdfData.arrayBuffer()),
            contentType: 'application/pdf'
          }
        ] : []
      };

      // שליחת מייל למועמד
      const candidateMailOptions: Mail.Options = {
        from: `"CVIT Resume System" <${ZOHO_MAIL}>`,
        to: cvData.format_cv.personal_details.email,
        subject: lang === 'he' ? 'הכנה לראיון העבודה שלך' : 'Your Interview Preparation',
        html: await createCandidateEmailTemplate(cvData, content, lang, analysis),
        attachments: cvDataRow?.pdf_filename ? [
          {
            filename: `${cvData.format_cv.personal_details.name} - CV.pdf`,
            content: Buffer.from(await pdfData.arrayBuffer()),
            contentType: 'application/pdf'
          }
        ] : []
      };

      await Promise.all([
        transporter.sendMail(mailOptions),
        transporter.sendMail(candidateMailOptions)
      ]);

      return NextResponse.json({ 
        success: true,
        message: lang === 'he' ? 'הבקשה נשלחה בהצלחה' : 'Request sent successfully'
      });

    } catch (storageError) {
      console.error('Storage error details:', storageError);
      
      // נבדוק אם זו שגיאת הרשאות
      if (storageError instanceof Error && 
          (storageError.message.includes('permission denied') || 
           storageError.message.includes('not authorized'))) {
        console.error('Permission error accessing storage');
        throw new Error('אין הרשאות גישה לקובץ');
      }

      // נבדוק אם הקובץ לא נמצא
      if (storageError instanceof Error && 
          (storageError.message.includes('not found') || 
           storageError.message.includes('File not found'))) {
        console.error('File not found in storage');
        throw new Error('הקובץ לא נמצא במערכת');
      }
      
      // במקרה של שגיאה אחרת, נשלח את המייל בלי הקובץ המצורף
      console.log('Proceeding without PDF attachment due to storage error');
      
      // ניתוח קורות החיים
      const analysis = await analyzeCV(cvData, content);

      // שליחת מייל למועמד
      const candidateMailOptions: Mail.Options = {
        from: `"CVIT Resume System" <${ZOHO_MAIL}>`,
        to: cvData.format_cv.personal_details.email,
        subject: lang === 'he' ? 'הכנה לראיון העבודה שלך' : 'Your Interview Preparation',
        html: await createCandidateEmailTemplate(cvData, content, lang, analysis)
      };

      await transporter.sendMail(candidateMailOptions);

      return NextResponse.json({ 
        success: true,
        message: lang === 'he' ? 'הבקשה נשלחה בהצלחה (ללא קובץ מצורף)' : 'Request sent successfully (without attachment)',
        warning: 'לא ניתן היה לצרף את קובץ ה-PDF עקב תקלה טכנית'
      });
    }
  } catch (error) {
    console.error('Detailed error in send-interview-request:', error);
    
    // נוסיף מידע יותר ספציפי על השגיאה
    let errorMessage = 'שגיאה לא ידועה';
    if (error instanceof Error) {
      if (error.message.includes('PDF filename is missing')) {
        errorMessage = 'לא נמצא קובץ PDF במערכת';
      } else if (error.message.includes('permission denied') || error.message.includes('not authorized')) {
        errorMessage = 'אין הרשאות גישה לקובץ';
      } else if (error.message.includes('not found')) {
        errorMessage = 'הקובץ לא נמצא במערכת';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: lang === 'he' ? 'שגיאה בשליחת הבקשה' : 'Error sending request',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 