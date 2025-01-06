import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: Request) {
  console.log('🚀 Starting CV storage process');
  
  try {
    const { pdfBuffer, sessionId, fileName } = await request.json();
    console.log('📄 Received data:', { 
      sessionId, 
      fileName,
      bufferLength: pdfBuffer?.length || 0 
    });

    if (!pdfBuffer || !sessionId) {
      console.error('❌ Missing required fields:', { 
        hasPdfBuffer: !!pdfBuffer, 
        hasSessionId: !!sessionId 
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🔄 Converting base64 to Buffer');
    const buffer = Buffer.from(pdfBuffer, 'base64');
    
    const timestamp = new Date().toISOString();
    const uniqueFileName = `${sessionId}_${timestamp}_${fileName || 'cv.pdf'}`;
    console.log('📝 Generated unique filename:', uniqueFileName);
    
    console.log('⬆️ Starting upload to Supabase storage');
    const { error: uploadError } = await supabase
      .storage
      .from('CVs')
      .upload(uniqueFileName, buffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
    }
    console.log('✅ File uploaded successfully');

    console.log('🔗 Getting public URL');
    const { data } = await supabase
      .storage
      .from('CVs')
      .createSignedUrl(uniqueFileName, 60 * 60 * 24 * 7, {
        download: true
      });

    if (!data) {
      throw new Error('Failed to create signed URL');
    }

    const signedUrl = data.signedUrl;
    console.log('📎 Signed URL:', signedUrl);

    console.log('💾 Checking if record exists');
    const { data: existingRecord } = await supabase
      .from('cv_data')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    console.log('💾 Updating/Creating database record');
    const { error: dbError } = await supabase
      .from('cv_data')
      .upsert({
        session_id: sessionId,
        pdf_url: signedUrl,
        pdf_filename: uniqueFileName,
        ...(existingRecord 
          ? { updated_at: new Date().toISOString() }
          : { created_at: new Date().toISOString() }
        )
      }, {
        onConflict: 'session_id',
        ignoreDuplicates: false
      });

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }
    console.log('✅ Database updated successfully');

    console.log('🎉 Storage process completed successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('🔴 Error in store-cv-copy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 