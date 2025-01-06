import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    console.log('API route /api/save-content called');
    
    const body = await request.json();
    console.log('Received request body:', body);
    
    const { sessionId, content } = body;
    console.log('Processing session:', sessionId);

    if (!sessionId || !content) {
      console.error('Missing required fields:', { sessionId, content });
      return NextResponse.json(
        { error: 'Missing sessionId or content' },
        { status: 400 }
      );
    }

    // עדכון הנתונים בטבלת cv_data
    const { data, error: updateError } = await supabaseAdmin
      .from('cv_data')
      .update({
        content: content,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('session_id', sessionId)  // שימוש ב-session_id במקום id
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update CV content', details: updateError },
        { status: 500 }
      );
    }

    console.log('Successfully updated CV data:', data);
    return NextResponse.json({ 
      success: true,
      savedData: data
    });

  } catch (error) {
    console.error('Detailed error in save-content:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to save content',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 