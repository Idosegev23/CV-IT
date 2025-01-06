import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Payment failure handler started');
  
  try {
    // נסה לקרוא את הנתונים בכל הפורמטים האפשריים
    let sessionId, error, errorMessage;
    
    try {
      const formData = await request.formData();
      console.log('Form data received:', Object.fromEntries(formData));
      sessionId = formData.get('custom');
      error = formData.get('Response');
      errorMessage = formData.get('ErrorMessage');
    } catch (e) {
      console.log('Failed to parse as form data, trying JSON');
      const jsonData = await request.json();
      console.log('JSON data received:', jsonData);
      sessionId = jsonData.custom;
      error = jsonData.error;
      errorMessage = jsonData.errorMessage;
    }
  
    console.log('Processing payment failure for session:', sessionId);
    
    if (sessionId) {
      const supabase = createRouteHandlerClient({ cookies });
      
      // עדכון סטטוס התשלום לנכשל
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ 
          payment_status: 'failed',
          payment_error: {
            code: error,
            message: errorMessage,
            date: new Date().toISOString()
          }
        })
        .eq('id', sessionId);
        
      if (updateError) {
        console.error('Failed to update session:', updateError);
      }
    }
    
    console.log('Payment failure processing completed');
    const script = `
      <script>
        window.parent.postMessage(JSON.stringify({
          success: false,
          error: "${errorMessage || error || 'Payment failed'}",
          sessionId: "${sessionId}"
        }), "*");
        
        // ניסיון לנווט בחזרה לאפליקציה
        window.location.href = "${process.env.NEXT_PUBLIC_APP_URL}/he/packages?error=payment_failed";
      </script>
    `;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Payment failure handler error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 