import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { headers } from 'next/headers';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const ZOHO_MAIL = process.env.ZOHO_MAIL_USER;
const ZOHO_PASSWORD = process.env.ZOHO_MAIL_PASS;

if (!ZOHO_MAIL || !ZOHO_PASSWORD) {
  throw new Error('Missing ZOHO mail credentials');
}

type PackageType = 'basic' | 'advanced' | 'pro';
type LanguageType = 'he' | 'en';

interface LanguageStrings {
  he: string[];
  en: string[];
}

interface PackageFeatures {
  basic: LanguageStrings;
  advanced: LanguageStrings;
  pro: LanguageStrings;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: ZOHO_MAIL,
    pass: ZOHO_PASSWORD
  }
});

const createEmailTemplate = (data: any, lang: LanguageType, baseUrl: string) => {
  const isHebrew = lang === 'he';
  const personalDetails = data.format_cv.personal_details;
  const currentPackage = (data.package || 'basic') as PackageType;

  const viewLink = `${baseUrl}/${lang}/create/template/${data.session_id}/preview`;

  const packageFeatures: PackageFeatures = {
    basic: {
      he: [
        'הורדת קורות חיים בפורמט PDF',
        'תבניות קלאסיות ומקצועיות',
        'חיפוש עבודה',
        'הכנה לראיון',
        'מונית לראיון'
      ],
      en: [
        'Download CV in PDF format',
        'Classic and Professional templates',
        'Job search',
        'Interview preparation',
        'Interview taxi'
      ]
    },
    advanced: {
      he: [
        'כל התכונות של החבילה הבסיסית',
        'תרגום לאנגלית',
        'בניית פרופיל LinkedIn',
        'מה השווי שלי?'
      ],
      en: [
        'All Basic package features',
        'English translation',
        'LinkedIn profile builder',
        'What\'s my worth?'
      ]
    },
    pro: {
      he: [
        'כל התכונות של החבילה המתקדמת',
        'עריכה מקצועית',
        'ליווי אישי',
        'הורדה בפורמט DOCX'
      ],
      en: [
        'All Advanced package features',
        'Professional editing',
        'Personal guidance',
        'Download in DOCX format'
      ]
    }
  };

  const upgradeFeatures = currentPackage === 'basic' ? packageFeatures.advanced : 
                         currentPackage === 'advanced' ? packageFeatures.pro : 
                         { he: [], en: [] };

  return `
    <!DOCTYPE html>
    <html dir="${isHebrew ? 'rtl' : 'ltr'}" lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${isHebrew ? 'קורות החיים שלך מוכנים!' : 'Your CV is ready!'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
          * {
            font-family: 'Assistant', sans-serif;
            direction: ${isHebrew ? 'rtl' : 'ltr'};
            text-align: ${isHebrew ? 'right' : 'left'};
          }
          .logo {
            width: 120px;
            height: auto;
            margin: 0 auto;
            display: block;
          }
          .content {
            direction: ${isHebrew ? 'rtl' : 'ltr'};
            text-align: ${isHebrew ? 'right' : 'left'};
          }
          .button {
            direction: ${isHebrew ? 'rtl' : 'ltr'};
            text-align: center;
            margin: 20px auto;
          }
          .features-list {
            list-style-position: inside;
            padding: 0;
            margin: 0;
          }
          .features-list li {
            text-align: ${isHebrew ? 'right' : 'left'};
            direction: ${isHebrew ? 'rtl' : 'ltr'};
          }
        </style>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        background-color: #E4DFD9;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        ">
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <img 
              src="${baseUrl}/images/MailLogo.png" 
              alt="CVIT Logo" 
              class="logo"
            >
          </div>

          <div class="content" style="
            background-color: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
          ">
            <!-- Decorative Elements -->
            <img src="${baseUrl}/images/Maildec1.png" alt="" style="position: absolute; top: 0; ${isHebrew ? 'left' : 'right'}: 0; opacity: 0.1;">
            <img src="${baseUrl}/images/Maildec2.png" alt="" style="position: absolute; bottom: 0; ${isHebrew ? 'right' : 'left'}: 0;">
            <img src="${baseUrl}/images/Maildec3.png" alt="" style="position: absolute; top: 20px; ${isHebrew ? 'right' : 'left'}: 20px;">
            <img src="${baseUrl}/images/Maildec4.png" alt="" style="position: absolute; bottom: 20px; ${isHebrew ? 'left' : 'right'}: 20px;">

            <!-- Main Content -->
            <div style="position: relative; z-index: 1;">
              <h1 style="
                color: #4856CD;
                font-size: 28px;
                margin-bottom: 24px;
              ">
                ${isHebrew ? 'קורות החיים שלך מוכנים!' : 'Your CV is ready!'}
              </h1>

              <p style="
                color: #333;
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 24px;
              ">
                ${isHebrew ? 
                  `היי ${personalDetails.name},` : 
                  `Hi ${personalDetails.name},`}
              </p>

              <p style="
                color: #333;
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 32px;
              ">
                ${isHebrew ? 
                  'קורות החיים שלך מוכנים! מצורף קובץ PDF וכן קישור ישיר לצפייה:' : 
                  'Your CV is ready! Attached is a PDF file and a direct link to view it:'}
              </p>

              <!-- Direct Link Button -->
              <div class="button">
                <a href="${viewLink}"
                  style="
                    display: inline-block;
                    background-color: #4856CD;
                    color: white;
                    padding: 16px 32px;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: bold;
                    box-shadow: 0 4px 6px rgba(72, 86, 205, 0.2);
                  "
                >
                  ${isHebrew ? 'צפייה בקורות החיים' : 'View your CV'}
                </a>
              </div>

              <!-- Package Features -->
              <div style="
                background-color: #F8F9FF;
                border: 1px solid #E5E7FF;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 32px;
              ">
                <h2 style="
                  color: #4856CD;
                  font-size: 20px;
                  margin-bottom: 16px;
                ">
                  ${isHebrew ? 'מה כלול בחבילה שלך?' : 'What\'s included in your package?'}
                </h2>
                <ul class="features-list">
                  ${packageFeatures[currentPackage][lang].map((feature: string) => `
                    <li style="
                      margin-bottom: 12px;
                      padding-${isHebrew ? 'right' : 'left'}: 24px;
                      position: relative;
                    ">
                      <span style="
                        position: absolute;
                        ${isHebrew ? 'right' : 'left'}: 0;
                        color: #B78BE6;
                      ">✓</span>
                      ${feature}
                    </li>
                  `).join('')}
                </ul>
              </div>

              ${upgradeFeatures[lang].length > 0 ? `
                <!-- Upgrade Features -->
                <div style="
                  background-color: #FFF5FF;
                  border: 1px solid #F4D7FF;
                  border-radius: 16px;
                  padding: 24px;
                  margin-bottom: 32px;
                ">
                  <h2 style="
                    color: #B78BE6;
                    font-size: 20px;
                    margin-bottom: 16px;
                  ">
                    ${isHebrew ? 'מה תקבל בשדרוג החבילה?' : 'What you\'ll get by upgrading?'}
                  </h2>
                  <ul class="features-list">
                    ${upgradeFeatures[lang].map((feature: string) => `
                      <li style="
                        margin-bottom: 12px;
                        padding-${isHebrew ? 'right' : 'left'}: 24px;
                        position: relative;
                      ">
                        <span style="
                          position: absolute;
                          ${isHebrew ? 'right' : 'left'}: 0;
                          color: #B78BE6;
                        ">✦</span>
                        ${feature}
                      </li>
                    `).join('')}
                  </ul>

                  <!-- Upgrade Button -->
                  <div class="button">
                    <a href="${baseUrl}/${lang}/packages"
                      style="
                        display: inline-block;
                        background-color: #B78BE6;
                        color: white;
                        padding: 16px 32px;
                        border-radius: 50px;
                        text-decoration: none;
                        font-weight: bold;
                        box-shadow: 0 4px 6px rgba(183, 139, 230, 0.2);
                      "
                    >
                      ${isHebrew ? 'שדרוג החבילה' : 'Upgrade Package'}
                    </a>
                  </div>
                </div>
              ` : ''}

              <!-- Footer -->
              <div style="
                text-align: center;
                color: #666;
                font-size: 14px;
                margin-top: 32px;
                padding-top: 32px;
                border-top: 1px solid #eee;
              ">
                <p style="margin: 0;">
                  ${isHebrew ? 
                    'תודה שבחרת ב-CVIT' : 
                    'Thank you for choosing CVIT'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const { cvData, sessionId, lang } = await request.json();
    const language = lang as LanguageType;
    
    // בדיקת תקינות הנתונים
    if (!cvData || !sessionId || !lang) {
      throw new Error('Missing required data');
    }

    // המרת ה-base64 ל-Buffer בצורה בטוחה יותר
    let pdfBuffer;
    try {
      pdfBuffer = Buffer.from(cvData.pdfBuffer || '', 'base64');
    } catch (error) {
      console.error('Error converting PDF buffer:', error);
      throw new Error('Invalid PDF buffer');
    }

    console.log('Received request data:', {
      sessionId,
      lang,
      hasFormatCv: cvData?.format_cv ? 'yes' : 'no',
      hasPdfBuffer: cvData?.pdfBuffer ? 'yes' : 'no'
    });
    
    // Get base URL from headers
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Get CV data from Supabase
    const supabase = createClientComponentClient();
    const { data: cvDataFromDB, error: cvError } = await supabase
      .from('cv_data')
      .select('*, sessions!inner(*)')
      .eq('session_id', sessionId)
      .single();

    if (cvError) {
      console.error('Error fetching CV data from Supabase:', cvError);
      throw cvError;
    }

    console.log('CV data from DB:', {
      hasData: cvDataFromDB ? 'yes' : 'no',
      personalDetails: cvDataFromDB?.format_cv?.personal_details ? 'yes' : 'no'
    });

    // בדיקה שיש לנו את כתובת האימייל
    const userEmail = cvDataFromDB?.format_cv?.personal_details?.email;
    if (!userEmail) {
      console.error('No email found in CV data');
      throw new Error('Email address not found in CV data');
    }

    console.log('Preparing to send email to:', userEmail);

    const mailOptions: Mail.Options = {
      from: `"CVIT Resume System" <${ZOHO_MAIL}>`,
      to: userEmail,
      subject: language === 'he' ? 'קורות החיים שלך מוכנים! 🎉' : 'Your CV is ready! 🎉',
      html: createEmailTemplate(cvDataFromDB, language, baseUrl),
      attachments: [
        {
          filename: `${cvDataFromDB?.format_cv?.personal_details?.name || 'cv'}_CV.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log('Mail options prepared:', {
      to: userEmail,
      hasAttachment: pdfBuffer ? 'yes' : 'no',
      attachmentSize: pdfBuffer?.length || 0
    });

    console.log('Attempting to send email...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    return NextResponse.json({ 
      success: true,
      message: language === 'he' ? 'המייל נשלח בהצלחה' : 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error in send-summary-email:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to send summary email',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 