import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Payment success handler started');
  
  try {
    // נסה לקרוא את הנתונים בכל הפורמטים האפשריים
    let sessionId, transactionId, sum, paymentDetails;
    
    try {
      const formData = await request.formData();
      console.log('Form data received:', Object.fromEntries(formData));
      sessionId = formData.get('custom');
      transactionId = formData.get('TranzilaPK');
      sum = formData.get('sum');
      paymentDetails = {
        transaction_id: transactionId,
        sum: sum,
        card_type: formData.get('cardtype'),
        card_last_digits: formData.get('ccno'),
        payment_type: formData.get('cred_type'),
        installments: formData.get('npay'),
        date: new Date().toISOString()
      };
    } catch (e) {
      console.log('Failed to parse as form data, trying JSON');
      const jsonData = await request.json();
      console.log('JSON data received:', jsonData);
      sessionId = jsonData.custom;
      transactionId = jsonData.transactionId;
      sum = jsonData.amount;
      paymentDetails = {
        transaction_id: jsonData.transactionId,
        sum: jsonData.amount,
        payment_type: 'green_invoice',
        date: new Date().toISOString()
      };
    }
  
    if (!sessionId) {
      console.error('Missing session ID in payment success');
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    console.log('Processing payment success for session:', sessionId);
    const supabase = createRouteHandlerClient({ cookies });

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

    console.log('Payment success processing completed');
    const script = `
      <script>
        window.parent.postMessage(JSON.stringify({
          success: true,
          transactionId: "${transactionId}",
          sessionId: "${sessionId}"
        }), "*");
        
        // ניסיון לנווט בחזרה לאפליקציה
        window.location.href = "${process.env.NEXT_PUBLIC_APP_URL}/he/create/template/1/form?session=${sessionId}";
      </script>
    `;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Payment success handler error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
} 