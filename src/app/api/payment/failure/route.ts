import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const formData = await request.formData();
  const sessionId = formData.get('custom');
  const error = formData.get('Response');
  const errorMessage = formData.get('ErrorMessage');
  
  if (sessionId) {
    const supabase = createRouteHandlerClient({ cookies });
    
    // עדכון סטטוס התשלום לנכשל
    await supabase
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
  }
  
  const script = `
    <script>
      window.parent.postMessage(JSON.stringify({
        success: false,
        error: "${errorMessage || error || 'Payment failed'}",
        sessionId: "${sessionId}"
      }), "*");
    </script>
  `;

  return new NextResponse(script, {
    headers: { 'Content-Type': 'text/html' },
  });
} 