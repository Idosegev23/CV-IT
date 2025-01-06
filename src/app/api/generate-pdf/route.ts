import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export async function POST(req: Request) {
  let browser;
  console.log('🚀 Starting PDF generation process');
  
  try {
    const { html: rawHtml, fileName, sessionId } = await req.json();
    console.log('📄 Received request data:', { fileName, sessionId });

    const isDevelopment = process.env.NODE_ENV === 'development';

    // הגדרות הדפדפן המשותפות
    const commonBrowserArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
      '--disable-web-security',
      '--allow-file-access-from-files',
      '--enable-local-file-access'
    ];

    if (isDevelopment) {
      browser = await puppeteer.launch({
        headless: true,
        args: commonBrowserArgs,
        executablePath: process.platform === 'win32' 
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome'
      });
    } else {
      browser = await puppeteer.launch({
        args: [...chromium.args, ...commonBrowserArgs],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();
    
    // הגדרות נסיסיות
    await page.setCacheEnabled(false);
    await page.setBypassCSP(true);
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
    });
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);

    // הגדרת גודל הדף
    await page.setViewport({
      width: 793,
      height: 1122,
      deviceScaleFactor: 2,
    });

    // הוספת סקריפט עזר לטיפול בתמונות
    await page.evaluateOnNewDocument(() => {
      window.addEventListener('load', () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (!img.complete) {
            img.style.visibility = 'hidden';
            img.onload = () => {
              img.style.visibility = 'visible';
            };
            img.onerror = () => {
              console.error('Failed to load image:', img.src);
              img.style.display = 'none';
            };
          }
        });
      });
    });

    // טעינת התוכן
    await page.setContent(rawHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
      timeout: 60000,
    });

    // המתנה לטעינת פונטים ותמונות
    await page.evaluate(async () => {
      await document.fonts.ready;
      
      const images = Array.from(document.images);
      await Promise.all(
        images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // אם התמונה לא נטענת תוך 5 שניות, נמיך הלאה
            setTimeout(resolve, 5000);
          });
        })
      );
    });

    // המתנה נוספת לוודא שהכל נטען
    await new Promise(resolve => setTimeout(resolve, 2000));

    // הוספת סגנונות מיוחדים ל-PDF
    await page.addStyleTag({
      content: `
        @page {
          margin: 0;
          size: A4 portrait;
        }
        
        @font-face {
          font-family: 'Assistant';
          src: url('https://fonts.gstatic.com/s/assistant/v19/2sDPZGJYnIjSi6H75xkZZE1I0yCmYzzQtuZnEGGf3qGuvovg.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          background: white !important;
          font-family: 'Assistant', sans-serif !important;
        }
        
        #cv-content {
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
        }
        
        img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .flex { display: flex !important; }
        .flex-row { flex-direction: row !important; }
        .flex-col { flex-direction: column !important; }
        .items-center { align-items: center !important; }
        .justify-center { justify-content: center !important; }
        .gap-2 { gap: 0.5rem !important; }
        .gap-4 { gap: 1rem !important; }
        .p-4 { padding: 1rem !important; }
        .p-6 { padding: 1.5rem !important; }
        .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
        .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .text-center { text-align: center !important; }
        .font-bold { font-weight: 700 !important; }
        .text-lg { font-size: 1.125rem !important; }
        .text-xl { font-size: 1.25rem !important; }
        .text-2xl { font-size: 1.5rem !important; }
        .text-3xl { font-size: 1.875rem !important; }
        .rounded-full { border-radius: 9999px !important; }
        .rounded-lg { border-radius: 0.5rem !important; }
        .bg-white { background-color: white !important; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
        .relative { position: relative !important; }
        .absolute { position: absolute !important; }
        .w-full { width: 100% !important; }
        .h-full { height: 100% !important; }
        .overflow-hidden { overflow: hidden !important; }
      `
    });

    // יצירת ה-PDF
    console.log('📑 Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      scale: 1,
      height: '297mm',
      width: '210mm',
      timeout: 60000,
    });

    console.log('✅ PDF generated successfully');

    // שמירה ב-Supabase
    console.log('💾 Starting storage process');
    const timestamp = new Date().toISOString();
    const sanitizedFileName = sanitizeFileName(fileName?.replace(/\.pdf$/, '') || 'cv');
    const uniqueFileName = `${sessionId}_${timestamp}_${sanitizedFileName}.pdf`;

    // בדיקה אם הקובץ כבר קיים ומחיקתו אם כן
    try {
      const { data: existingFiles } = await supabase
        .storage
        .from('CVs')
        .list('', {
          search: sessionId
        });

      if (existingFiles && existingFiles.length > 0) {
        console.log('🗑️ Removing old PDF files...');
        const filesToRemove = existingFiles.map(file => file.name);
        await supabase
          .storage
          .from('CVs')
          .remove(filesToRemove);
      }
    } catch (error) {
      console.warn('⚠️ Error while checking/removing old files:', error);
      // ממשיכים למרות השגיאה
    }

    // העלאת הקובץ החדש
    console.log('⬆️ Uploading new PDF file...');
    const { error: uploadError } = await supabase
      .storage
      .from('CVs')
      .upload(uniqueFileName, pdf, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    // קידוא שהקובץ הועלה בהצלחה
    const { data: fileCheck } = await supabase
      .storage
      .from('CVs')
      .list('', {
        search: uniqueFileName
      });

    if (!fileCheck || fileCheck.length === 0) {
      throw new Error('File upload verification failed');
    }

    console.log('✅ File uploaded successfully');

    // יצירת URL חתום עם תוקף של שבוע
    console.log('🔗 Creating signed URL...');
    const { data: urlData } = await supabase
      .storage
      .from('CVs')
      .createSignedUrl(uniqueFileName, 60 * 60 * 24 * 7, {
        download: true,
        transform: {
          quality: 100
        }
      });

    if (!urlData) {
      throw new Error('Failed to create signed URL');
    }

    console.log('✅ Signed URL created successfully');

    // עדכון בסיס הנתונים
    console.log('💾 Updating database record...');
    const { error: dbError } = await supabase
      .from('cv_data')
      .update({
        pdf_url: urlData.signedUrl,
        pdf_filename: uniqueFileName,
        updated_at: new Date().toISOString(),
        status: 'completed',
        last_generated: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    console.log('✅ Database updated successfully');
    console.log('🎉 Storage process completed successfully');

    // החזרת ה-PDF
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName || 'cv')}.pdf`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error: any) {
    console.error('🔴 Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  } finally {
    if (browser) {
      console.log('🔄 Closing browser');
      await browser.close();
    }
  }
}