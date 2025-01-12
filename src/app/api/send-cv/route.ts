import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
if (!process.env.ZOHO_MAIL_USER || !process.env.ZOHO_MAIL_PASS) throw new Error('Missing ZOHO mail credentials');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_MAIL_USER,
    pass: process.env.ZOHO_MAIL_PASS
  }
});

interface CVAnalysis {
  candidate_info: {
    full_name: string;
    city: string;
    phone: string;
    email: string;
    last_position: string;
    experience_in_role: string;
  };
  professional_analysis: {
    relevant_positions: string[];
    geographic_search_area: string;
    candidate_level: string;
    field: string;
  };
}

const generateAnalysisHtml = (analysis: CVAnalysis, analysisFormat: any) => {
  if (!analysisFormat) return '';

  const sections = [];
  
  // פרטי מועמד
  const candidateInfo = [];
  if (analysisFormat.include_full_name) candidateInfo.push(['שם מלא', analysis.candidate_info.full_name]);
  if (analysisFormat.include_city) candidateInfo.push(['עיר', analysis.candidate_info.city]);
  if (analysisFormat.include_phone) candidateInfo.push(['טלפון', analysis.candidate_info.phone]);
  if (analysisFormat.include_email) candidateInfo.push(['מייל', analysis.candidate_info.email]);

  if (candidateInfo.length > 0) {
    sections.push(`
      <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h2 style="color: #34495e; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          פרטי המועמד
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${candidateInfo.map(([label, value]) => `
            <tr>
              <td style="padding: 8px; color: #7f8c8d; width: 40%;">${label}:</td>
              <td style="padding: 8px; color: #2c3e50;">${value}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `);
  }

  // מידע מקצועי
  const professionalInfo = [];
  if (analysisFormat.include_last_position) {
    professionalInfo.push(['תפקיד אחרון', analysis.candidate_info.last_position]);
  }
  if (analysisFormat.include_experience_years) {
    professionalInfo.push(['ניסיון בתפקיד', analysis.candidate_info.experience_in_role]);
  }
  if (analysisFormat.include_relevant_positions) {
    professionalInfo.push(['תפקידים רלוונטיים', analysis.professional_analysis.relevant_positions.join(', ')]);
  }
  if (analysisFormat.include_search_area) {
    professionalInfo.push(['אזור חיפוש', analysis.professional_analysis.geographic_search_area]);
  }

  if (professionalInfo.length > 0) {
    sections.push(`
      <div style="background-color: #ffffff; padding: 15px; border-radius: 8px;">
        <h2 style="color: #34495e; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          מידע מקצועי
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${professionalInfo.map(([label, value]) => `
            <tr>
              <td style="padding: 8px; color: #7f8c8d; width: 40%;">${label}:</td>
              <td style="padding: 8px; color: #2c3e50;">${value}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `);
  }

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>קורות חיים חדשים מ-CVIT</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://res.cloudinary.com/dsoh3yteb/image/upload/v1735156794/MailLogo_jrcesy.png" 
                 alt="CVIT Logo" 
                 style="max-width: 200px; height: auto;">
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px; text-align: center;">
              קורות חיים חדשים התקבלו ממערכת CVIT
            </h1>
            
            ${sections.join('\n')}
          </div>

          <div style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px;">
            <p>מייל זה נשלח באופן אוטומטי ממערכת CVIT</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const replaceTemplateVariables = (template: string, variables: Record<string, string>) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
};

export async function POST(request: Request) {
  try {
    console.log('Starting CV send process...');
    const { sessionId } = await request.json();
    
    // מציאת הקובץ בדאטהבייס
    const { data: cvData, error: cvError } = await supabase
      .from('cv_data')
      .select('pdf_filename, format_cv, pdf_url')
      .eq('session_id', sessionId)
      .single();

    if (cvError || !cvData?.pdf_filename) {
      console.error('CV data error:', cvError);
      throw new Error('CV data not found');
    }

    // מציאת כל חברות ההשמה הפעילות
    const { data: agencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('*')
      .eq('is_active', true);

    if (agenciesError) {
      console.error('Agencies error:', agenciesError);
      throw new Error('Failed to fetch agencies');
    }

    // הורדת הקובץ מהאחסון
    const { data: fileData, error: storageError } = await supabase.storage
      .from('CVs')
      .download(cvData.pdf_filename);

    if (storageError || !fileData) {
      console.error('Storage error:', storageError);
      throw new Error('Failed to download CV file');
    }

    // המרה לבאפר
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ניתוח הקו"ח
    const analysisCompletion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        { 
          role: 'user', 
          content: `נתח את קורות החיים הבאים: ${JSON.stringify(cvData.format_cv)}`
        }
      ],
      system: CV_ANALYSIS_SYSTEM_PROMPT
    });

    const analysis = analysisCompletion.content[0].type === 'text' 
      ? JSON.parse(analysisCompletion.content[0].text)
      : null;

    if (!analysis) {
      throw new Error('Failed to analyze CV');
    }

    // שליחת מייל לכל חברת השמה
    const emailPromises = agencies.map(async (agency) => {
      try {
        let emailHtml = '';
        let subject = '';

        // בניית תוכן המייל בהתאם לתבנית של החברה
        if (agency.email_format.include_analysis) {
          emailHtml = generateAnalysisHtml(analysis, agency.email_format.analysis_format);
        } else if (agency.email_format.body_template) {
          // שימוש בתבנית מותאמת אישית
          const variables = {
            ...agency.email_format.custom_fields,
            candidate_name: analysis.candidate_info.full_name,
            // הוספת משתנים נוספים לפי הצורך
          };
          emailHtml = replaceTemplateVariables(agency.email_format.body_template, variables);
        }

        // בניית נושא המייל
        if (agency.email_format.subject_template) {
          const variables = {
            ...agency.email_format.custom_fields,
            candidate_name: analysis.candidate_info.full_name,
            // הוספת משתנים נוספים לפי הצורך
          };
          subject = replaceTemplateVariables(agency.email_format.subject_template, variables);
        } else {
          subject = `קורות חיים חדשים מ-CVIT - ${analysis.candidate_info.full_name}`;
        }

        const mailOptions: Mail.Options = {
          from: `"CVIT Resume System" <${process.env.ZOHO_MAIL_USER}>`,
          to: agency.email,
          subject,
          html: emailHtml,
          attachments: [
            {
              filename: `${analysis.candidate_info.full_name || 'CV'}.pdf`,
              content: buffer,
              contentType: 'application/pdf',
              encoding: 'base64'
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${agency.name} (${agency.email})`);
        
        return { success: true, agency: agency.name };
      } catch (error) {
        console.error(`Failed to send email to ${agency.name}:`, error);
        return { success: false, agency: agency.name, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const failedAgencies = results.filter(r => !r.success);

    if (failedAgencies.length > 0) {
      console.warn('Failed to send emails to some agencies:', failedAgencies);
    }

    return NextResponse.json({ 
      success: true,
      totalSent: results.length,
      failedCount: failedAgencies.length,
      failedAgencies: failedAgencies.map(f => f.agency)
    });

  } catch (error) {
    console.error('Error in send-cv:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send CV' },
      { status: 500 }
    );
  }
} 