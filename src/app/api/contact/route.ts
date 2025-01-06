import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

interface MailOptions extends Mail.Options {
  from: {
    name: string;
    address: string;
  };
}

// בדיקת משתנים סביבתיים והגדרתם כקבועים
const ZOHO_MAIL = process.env.ZOHO_MAIL_USER;
const ZOHO_PASSWORD = process.env.ZOHO_MAIL_PASS;

if (!ZOHO_MAIL || !ZOHO_PASSWORD) {
  throw new Error('Missing ZOHO mail credentials');
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

const createEmailTemplate = (data: any, ticketNumber: string, isConfirmation = false) => {
  const currentDate = new Date().toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isConfirmation) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>אישור קבלת פנייה - CVIT</title>
        </head>
        <body style="
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f1;
        ">
          <div style="
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          ">
            <div style="
              background-color: white;
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            ">
              <!-- Header Logo -->
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="https://cvit.co.il/logo.png" alt="CVIT Logo" style="height: 40px;">
              </div>

              <h1 style="
                color: #4754D6;
                font-size: 24px;
                margin-bottom: 24px;
                text-align: center;
              ">
                תודה על פנייתך!
              </h1>

              <p style="
                color: #333;
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 24px;
              ">
                שלום ${data.firstName},
              </p>

              <p style="
                color: #333;
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 24px;
              ">
                פנייתך התקבלה במערכת ותטופל בהקדם על ידי צוות השירות שלנו.
              </p>

              <div style="
                background-color: #f8f9ff;
                border: 1px solid #e5e7ff;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
              ">
                <p style="
                  color: #4754D6;
                  font-size: 16px;
                  font-weight: bold;
                  margin: 0;
                ">
                  מספר פנייה: ${ticketNumber}
                </p>
              </div>

              <p style="
                color: #666;
                font-size: 14px;
                margin-bottom: 24px;
              ">
                אנא שמור/י מספר זה למעקב אחר הפנייה.
              </p>

              <hr style="
                border: none;
                border-top: 1px solid #eee;
                margin: 32px 0;
              ">

              <p style="
                color: #666;
                font-size: 14px;
                text-align: center;
                margin: 0;
              ">
                בברכה,<br>
                צוות CVIT
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // תבנית המייל למערכת
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>פנייה חדשה מ-CVIT</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f4f4f1;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        ">
          <div style="
            background-color: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          ">
            <!-- System Alert Header -->
            <div style="
              background-color: #4754D6;
              color: white;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 24px;
              text-align: center;
            ">
              <h1 style="margin: 0; font-size: 20px;">פנייה חדשה התקבלה במערכת</h1>
            </div>

            <!-- Ticket Info -->
            <div style="
              background-color: #f8f9ff;
              border: 1px solid #e5e7ff;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 24px;
            ">
              <p style="margin: 0; font-size: 16px;">
                <strong>מספר פנייה:</strong> ${ticketNumber}<br>
                <strong>תאריך:</strong> ${currentDate}
              </p>
            </div>

            <!-- Contact Details -->
            <div style="margin-bottom: 24px;">
              <h2 style="
                color: #4754D6;
                font-size: 18px;
                margin-bottom: 16px;
              ">
                פרטי הפונה
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    <strong>שם מלא:</strong>
                  </td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${data.firstName} ${data.lastName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    <strong>טלפון:</strong>
                  </td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${data.phone}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    <strong>אימייל:</strong>
                  </td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${data.email}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    <strong>נושא:</strong>
                  </td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${data.subject}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Message Content -->
            <div style="margin-bottom: 24px;">
              <h2 style="
                color: #4754D6;
                font-size: 18px;
                margin-bottom: 16px;
              ">
                תוכן ההודעה
              </h2>
              <div style="
                background-color: #f8f9ff;
                border: 1px solid #e5e7ff;
                border-radius: 8px;
                padding: 16px;
              ">
                <p style="
                  margin: 0;
                  white-space: pre-wrap;
                  line-height: 1.6;
                ">
                  ${data.message}
                </p>
              </div>
            </div>

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
                הודעה זו נשלחה באופן אוטומטי ממערכת הפניות של CVIT
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketNumber, ...data } = body;

    // שליחת מייל למערכת
    await transporter.sendMail({
      from: {
        name: 'CVIT Contact Form',
        address: ZOHO_MAIL || '' // Add fallback empty string to handle undefined
      },
      to: 'office@cvit.co.il', 
      subject: `פנייה חדשה - ${ticketNumber}`,
      html: createEmailTemplate(data, ticketNumber),
    });

    // שליחת אישור ללקוח
    await transporter.sendMail({
      from: {
        name: 'CVIT',
        address: ZOHO_MAIL || '' // Add fallback empty string to handle undefined
      },
      to: data.email,
      subject: `פנייתך התקבלה - ${ticketNumber}`,
      html: createEmailTemplate(data, ticketNumber, true),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'המייל נשלח בהצלחה',
      ticketNumber 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'שגיאה בשליחת המייל' },
      { status: 500 }
    );
  }
} 