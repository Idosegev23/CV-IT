import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// יצירת חיבור ל-Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const { data: cvData, error } = await supabase
      .from('cv_data')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) throw error;

    // בדיקת תקיעות בתהליך
    if (cvData.status === 'processing') {
      const processStartTime = new Date(cvData.process_started_at).getTime();
      const currentTime = new Date().getTime();
      const processingTime = currentTime - processStartTime;
      
      // אם התהליך תקוע יותר מ-5 דקות
      if (processingTime > 5 * 60 * 1000) {
        // ניסיון אוטומטי לאתחול מחדש
        await fetch('/api/generate-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId,
            retryFromContent: true,
            isAutoRecovery: true
          })
        });
        
        return NextResponse.json({ status: 'restarted' });
      }
    }

    return NextResponse.json({ status: cvData.status });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
} 