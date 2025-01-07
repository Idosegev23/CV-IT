import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Payment notify handler started');
  
  try {
    let data;
    
    try {
      const formData = await request.formData();
      console.log('Form data received:', Object.fromEntries(formData));
      data = Object.fromEntries(formData);
    } catch (e) {
      console.log('Failed to parse as form data, trying JSON');
      data = await request.json();
      console.log('JSON data received:', data);
    }
    
    // אם אין מידע בבקשה, נחזיר שגיאה
    if (!data) {
      return NextResponse.json({ error: 'No data received' }, { status: 400 });
    }

    const sessionId = data.custom || data.sessionId;
    
    if (sessionId) {
      console.log('Processing payment notification for session:', sessionId);
      const supabase = createRouteHandlerClient({ cookies });
      
      // עדכון סטטוס התשלום
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ 
          payment_status: 'completed',
          payment_details: {
            ...data,
            notification_date: new Date().toISOString()
          }
        })
        .eq('id', sessionId);
        
      if (updateError) {
        console.error('Failed to update session:', updateError);
        throw updateError;
      }
    }
    
    // נחזיר תשובה חיובית לשרת התשלומים
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Payment notify handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 