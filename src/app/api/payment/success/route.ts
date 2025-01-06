import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// פונקציה משותפת לטיפול בתשלום מוצלח
async function handlePaymentSuccess(data: any) {
  console.log('Processing payment data:', data);
  
  const sessionId = data.custom || data.sessionId;
  const transactionId = data.transactionId || data.TranzilaPK;
  const sum = data.amount || data.sum;
  
  if (!sessionId) {
    console.error('Missing session ID in payment success');
    throw new Error('Missing session ID');
  }

  console.log('Processing payment success for session:', sessionId);
  const supabase = createRouteHandlerClient({ cookies });

  const paymentDetails = {
    transaction_id: transactionId,
    sum: sum,
    payment_type: 'green_invoice',
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
    
    const result = await handlePaymentSuccess(params);
    
    const script = `
      <script>
        window.parent.postMessage(JSON.stringify({
          success: true,
          transactionId: "${result.transactionId}",
          sessionId: "${result.sessionId}"
        }), "*");
        
        window.location.href = "${process.env.NEXT_PUBLIC_APP_URL}/he/create/template/1/form?session=${result.sessionId}";
      </script>
    `;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Payment success GET handler error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
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
      <script>
        window.parent.postMessage(JSON.stringify({
          success: true,
          transactionId: "${result.transactionId}",
          sessionId: "${result.sessionId}"
        }), "*");
        
        window.location.href = "${process.env.NEXT_PUBLIC_APP_URL}/he/create/template/1/form?session=${result.sessionId}";
      </script>
    `;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Payment success POST handler error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 