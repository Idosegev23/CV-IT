import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// פונקציה משותפת לטיפול בתשלום שנכשל
async function handlePaymentFailure(data: any) {
  console.log('Processing failure data:', data);
  
  const sessionId = data.custom || data.sessionId;
  const error = data.error || data.Response;
  const errorMessage = data.errorMessage || data.ErrorMessage;
  
  if (sessionId) {
    console.log('Processing payment failure for session:', sessionId);
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
  
  return { sessionId, error, errorMessage };
}

// טיפול בבקשת GET
export async function GET(request: Request) {
  console.log('Payment failure GET handler started');
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    console.log('GET params:', params);
    
    const result = await handlePaymentFailure(params);
    
    const script = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Failed</title>
        </head>
        <body>
          <script>
            window.parent.postMessage(JSON.stringify({
              success: false,
              error: "${result.errorMessage || result.error || 'Payment failed'}",
              sessionId: "${result.sessionId}"
            }), "*");
          </script>
        </body>
      </html>
    `;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Payment failure GET handler error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}

// טיפול בבקשת POST
export async function POST(request: Request) {
  console.log('Payment failure POST handler started');
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
    
    const result = await handlePaymentFailure(data);
    
    const script = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Failed</title>
        </head>
        <body>
          <script>
            window.parent.postMessage(JSON.stringify({
              success: false,
              error: "${result.errorMessage || result.error || 'Payment failed'}",
              sessionId: "${result.sessionId}"
            }), "*");
          </script>
        </body>
      </html>
    `;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Payment failure POST handler error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 