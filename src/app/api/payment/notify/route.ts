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
  const status = formData.get('Response');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    await supabase
      .from('payment_notifications')
      .insert({
        session_id: sessionId,
        transaction_id: transactionId,
        status: status,
        payment_details: {
          sum: sum,
          card_type: cardType,
          card_last_digits: cardLastDigits,
          payment_type: paymentType,
          installments: installments,
          date: new Date().toISOString()
        }
      });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Payment notification handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 