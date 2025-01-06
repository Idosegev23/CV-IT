import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// פונקציה משותפת לטיפול בתשלום מוצלח
async function handlePaymentSuccess(data: any) {
  console.log('Processing payment data:', data);
  
  // קבלת ה-requestId כ-transactionId
  const transactionId = data.requestId;
  
  // חילוץ ה-sessionId מה-flow
  const sessionId = data.flow;
  
  if (!sessionId) {
    console.error('Missing session ID (flow) in payment success');
    throw new Error('Missing session ID');
  }

  console.log('Processing payment success for session:', sessionId);
  const supabase = createRouteHandlerClient({ cookies });

  const paymentDetails = {
    transaction_id: transactionId,
    request_id: data.requestId,
    message: data.message,
    date: new Date().toISOString()
  };

  // עדכון סטטוס התשלום
  const { error: updateError } = await supabase
    .from('sessions')
    .update({ 
      is_paid: true,
      status: 'paid',
      current_step: 'template_selection',
      payment_details: paymentDetails
    })
    .eq('id', sessionId);

  if (updateError) {
    console.error('Failed to update session:', updateError);
    throw updateError;
  }

  // התחלת תהליך יצירת קורות החיים
  console.log('Starting CV generation process');
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-cv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId })
  });

  if (!response.ok) {
    console.error('Failed to start CV generation:', await response.text());
    throw new Error('Failed to start CV generation');
  }

  return { sessionId, transactionId };
}

// טיפול בבקשת GET
export async function GET(request: Request) {
  console.log('Payment success GET handler started');
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    console.log('GET params:', params);
    
    // בדיקה שהתשלום אכן הצליח
    if (params.success !== 'true') {
      throw new Error('Payment was not successful');
    }
    
    const result = await handlePaymentSuccess(params);
    
    // החזרת script שישלח הודעה לחלון הראשי
    const script = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Success</title>
        </head>
        <body>
          <script>
            window.parent.postMessage(JSON.stringify({
              success: true,
              transactionId: "${result.transactionId}",
              sessionId: "${result.sessionId}",
              flow: "${result.sessionId}"
            }), "*");
          </script>
        </body>
      </html>
    `;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
    
  } catch (error) {
    console.error('Payment success GET handler error:', error);
    const script = `
      <script>
        window.parent.postMessage(JSON.stringify({
          success: false,
          error: "Payment failed"
        }), "*");
      </script>
    `;
    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// טיפול בבקשת POST
export async function POST(request: Request) {
  console.log('Payment success POST handler started');
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
    
    const result = await handlePaymentSuccess(data);
    
    const script = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Success</title>
        </head>
        <body>
          <script>
            window.parent.postMessage(JSON.stringify({
              success: true,
              transactionId: "${result.transactionId}",
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
    console.error('Payment success POST handler error:', error);
    const errorScript = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Error</title>
        </head>
        <body>
          <script>
            window.parent.postMessage(JSON.stringify({
              success: false,
              error: "Payment failed"
            }), "*");
          </script>
        </body>
      </html>
    `;
    return new NextResponse(errorScript, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
} 