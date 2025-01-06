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
    const systemPrompt = `אתה מומחה לניתוח קורות חיים והכנה לראיונות עבודה. 
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

      const mailOptions: Mail.Options = {
        from: `"CVIT Resume System" <${ZOHO_MAIL}>`,
        to: 'lee.penn@cvit.co.il',
        subject: 'בקשה חדשה להכנה לראיון עבודה',
        html: await createEmailTemplate(cvData, content, lang),
        attachments: [
          {
            filename: `${cvData.format_cv.personal_details.name} - CV.pdf`,
            content: Buffer.from(await pdfData.arrayBuffer()),
            contentType: 'application/pdf'
          }
        ]
      };

      console.log('Sending email with PDF attachment');
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully with PDF');

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
      
      const mailOptions: Mail.Options = {
        from: `"CVIT Resume System" <${ZOHO_MAIL}>`,
        to: 'lee.penn@cvit.co.il',
        subject: 'בקשה חדשה להכנה לראיון עבודה',
        html: await createEmailTemplate(cvData, content, lang)
      };

      await transporter.sendMail(mailOptions);

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