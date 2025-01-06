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
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cv_data')
      .select('status, format_cv, en_format_cv, level, market, cv_info, error_message')
      .eq('session_id', sessionId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      status: data.status,
      cv: data.status === 'completed' ? data.format_cv : null,
      en_cv: data.status === 'completed' ? data.en_format_cv : null,
      level: data.level,
      market: data.market,
      cv_info: data.cv_info,
      error: data.error_message
    });

  } catch (error) {
    console.error('❌ [API] Error checking CV status:', error);
    return NextResponse.json(
      { error: 'Failed to check CV status' },
      { status: 500 }
    );
  }
} 