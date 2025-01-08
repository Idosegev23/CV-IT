import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { CV_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';
import puppeteer from 'puppeteer';

// בדיקת קיום משתני סביבה נדרשים
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
if (!process.env.ZOHO_MAIL_USER || !process.env.ZOHO_MAIL_PASS) throw new Error('Missing ZOHO mail credentials');

// יצירת לקוח Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// יצירת לקוח Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// הגדרת transporter למייל
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_MAIL_USER,
    pass: process.env.ZOHO_MAIL_PASS
  }
});

interface Agency {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  send_cv_template: {
    subject: string;
    body: string;
  };
}

async function generatePDF(sessionId: string, cvData: any) {
  try {
    console.log('Starting PDF generation...');
    
    // קבלת מידע על התבנית הנבחרת
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('template_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    const templateId = sessionData.template_id;
    if (!templateId) throw new Error('No template selected');

    // יצירת PDF באמצעות puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    
    // טעינת הדף של התבנית
    await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/he/cv/${templateId}?sessionId=${sessionId}`, {
      waitUntil: 'networkidle0'
    });

    // יצירת PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    // שמירת הקובץ ב-Storage
    const fileName = `cv_${sessionId}_${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('CVs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (uploadError) throw uploadError;

    // עדכון הדאטהבייס
    const { error: updateError } = await supabase
      .from('cv_data')
      .update({
        pdf_filename: fileName,
        pdf_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/CVs/${fileName}`
      })
      .eq('session_id', sessionId);

    if (updateError) throw updateError;

    return { fileName, pdfBuffer };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting CV send process...');
    const { sessionId, agencyIds } = await request.json();
    
    // 1. מציאת הקובץ בדאטהבייס
    const { data: cvData, error: cvError } = await supabase
      .from('cv_data')
      .select('pdf_filename, format_cv, pdf_url')
      .eq('session_id', sessionId)
      .single();

    if (cvError) {
      console.error('CV data error:', cvError);
      throw new Error('CV data not found');
    }

    let pdfBuffer;
    let fileName = cvData?.pdf_filename;

    // אם אין PDF, ניצור אחד
    if (!fileName) {
      console.log('No PDF found, generating new one...');
      const pdfData = await generatePDF(sessionId, cvData);
      pdfBuffer = pdfData.pdfBuffer;
      fileName = pdfData.fileName;
    } else {
      // הורדת הקובץ הקיים מהאחסון
      const { data: fileData, error: storageError } = await supabase.storage
        .from('CVs')
        .download(fileName);

      if (storageError || !fileData) {
        console.error('Storage error:', storageError);
        throw new Error('Failed to download CV file');
      }

      const arrayBuffer = await fileData.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    }

    // בדיקה שהקובץ תקין
    console.log('File size:', pdfBuffer.length);

    // 3. ניתוח הקו"ח
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

    console.log('Successfully analyzed CV:', analysis);

    // 4. שציאת חברות ההשמה הרלוונטיות
    let agencies: Agency[] = [];
    if (agencyIds && agencyIds.length > 0) {
      const { data: selectedAgencies, error: agenciesError } = await supabase
        .from('agencies')
        .select('id, name, email, is_active, send_cv_template')
        .in('id', agencyIds)
        .eq('is_active', true);

      if (agenciesError) throw agenciesError;
      agencies = selectedAgencies || [];
    } else {
      const { data: allAgencies, error: agenciesError } = await supabase
        .from('agencies')
        .select('id, name, email, is_active, send_cv_template')
        .eq('is_active', true);

      if (agenciesError) throw agenciesError;
      agencies = allAgencies || [];
    }

    // 5. שליחת המייל לכל חברת השמה
    const sendResults = await Promise.all(agencies.map(async (agency) => {
      try {
        // החלפת משתנים בתבנית
        const emailSubject = agency.send_cv_template.subject
          .replace('{{candidate_name}}', analysis.candidate_info.full_name)
          .replace('{{agency_name}}', agency.name);

        const emailBody = agency.send_cv_template.body
          .replace(/{{candidate_name}}/g, analysis.candidate_info.full_name)
          .replace(/{{candidate_phone}}/g, analysis.candidate_info.phone)
          .replace(/{{candidate_email}}/g, analysis.candidate_info.email)
          .replace(/{{candidate_experience}}/g, analysis.candidate_info.experience_in_role)
          .replace(/{{agency_name}}/g, agency.name);

        const mailOptions: Mail.Options = {
          from: `"CVIT Resume System" <${process.env.ZOHO_MAIL_USER}>`,
          to: agency.email,
          subject: emailSubject,
          html: emailBody,
          attachments: [
            {
              filename: `${analysis.candidate_info.full_name || 'CV'}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
              encoding: 'base64'
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        return { agency: agency.name, success: true };
      } catch (error) {
        console.error(`Failed to send email to ${agency.name}:`, error);
        return { agency: agency.name, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }));

    const successCount = sendResults.filter(result => result.success).length;
    const failureCount = sendResults.filter(result => !result.success).length;

    console.log('Email sending results:', {
      total: sendResults.length,
      success: successCount,
      failure: failureCount
    });
    
    return NextResponse.json({ 
      success: true,
      results: sendResults,
      summary: {
        total: sendResults.length,
        success: successCount,
        failure: failureCount
      }
    });

  } catch (error) {
    console.error('Error in send-cv:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send CV' },
      { status: 500 }
    );
  }
} 