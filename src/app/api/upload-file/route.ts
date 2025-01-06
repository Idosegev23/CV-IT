import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClientComponentClient();
    
    // העלאת הקובץ ל-Storage
    const { data, error } = await supabase.storage
      .from('salary-analysis')
      .upload(`${sessionId}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // יצירת URL ציבורי לקובץ
    const { data: { publicUrl } } = supabase.storage
      .from('salary-analysis')
      .getPublicUrl(`${sessionId}/${file.name}`);

    return NextResponse.json({ fileUrl: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 