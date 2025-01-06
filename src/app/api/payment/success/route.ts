import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const formData = await request.formData();
  const sessionId = formData.get('custom');
  const transactionId = formData.get('TranzilaPK');
  const sum = formData.get('sum');
  const cardType = formData.get('cardtype');
  const cardLastDigits = formData.get('ccno');
  const paymentType = formData.get('cred_type');
  const installments = formData.get('npay');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // עדכון סטטוס התשלום
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        is_paid: true,
        status: 'paid',
        current_step: 'template_selection',
        payment_details: {
          transaction_id: transactionId,
          sum: sum,
          card_type: cardType,
          card_last_digits: cardLastDigits,
          payment_type: paymentType,
          installments: installments,
          date: new Date().toISOString()
        }
      })
      .eq('id', sessionId);

    if (updateError) throw updateError;

    // התחלת תהליך יצירת קורות החיים
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId })
    });

    if (!response.ok) {
      throw new Error('Failed to start CV generation');
    }

    const script = `
      <script>
        window.parent.postMessage(JSON.stringify({
          success: true,
          transactionId: "${transactionId}",
          sessionId: "${sessionId}"
        }), "*");
      </script>
    `;

    return new NextResponse(script, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Payment success handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 