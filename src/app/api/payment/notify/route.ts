import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Payment notify handler started');
  
  try {
    const data = await request.json();
    console.log('Notify data received:', data);
    
    // אם אין מידע בבקשה, נחזיר שגיאה
    if (!data) {
      return NextResponse.json({ error: 'No data received' }, { status: 400 });
    }

    // וידוא שזו הודעה מ-Green Invoice
    if (data.pluginId !== process.env.GREEN_INVOICE_PLUGIN_ID) {
      console.error('Invalid plugin ID received');
      return NextResponse.json({ error: 'Invalid plugin ID' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // חילוץ ה-sessionId מהשדה המותאם אישית
    const sessionId = data.custom;
    
    if (!sessionId) {
      console.error('No session ID in notification');
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    // עדכון סטטוס התשלום בדאטהבייס
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        payment_status: data.status === 1 ? 'completed' : 'failed',
        payment_details: {
          transaction_id: data.transactionId,
          status: data.status,
          message: data.message,
          date: new Date().toISOString()
        }
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to update session:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
    
    // נחזיר תשובה חיובית לשרת התשלומים
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Payment notify handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 