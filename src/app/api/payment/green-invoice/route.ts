import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const GREEN_INVOICE_SANDBOX_URL = process.env.GREEN_INVOICE_SANDBOX_URL;
const GREEN_INVOICE_SANDBOX_KEY = process.env.GREEN_INVOICE_SANDBOX_KEY;
const GREEN_INVOICE_SANDBOX_SECRET = process.env.GREEN_INVOICE_SANDBOX_SECRET;
const GREEN_INVOICE_PLUGIN_ID = process.env.GREEN_INVOICE_PLUGIN_ID;

export async function POST(request: Request) {
  try {
    console.log('Starting Green Invoice payment process...');
    
    // בדיקת משתני הסביבה
    if (!GREEN_INVOICE_SANDBOX_URL || !GREEN_INVOICE_SANDBOX_KEY || !GREEN_INVOICE_SANDBOX_SECRET || !GREEN_INVOICE_PLUGIN_ID) {
      console.error('Missing required environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('Missing NEXT_PUBLIC_APP_URL');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // קבלת נתוני הבקשה
    const requestData = await request.json();
    const { sessionId, amount, lang, packageType, client } = requestData;

    // בדיקת תקינות הנתונים
    if (!sessionId || !amount || !lang || !packageType || !client) {
      console.error('Missing required request data:', { sessionId, amount, lang, packageType, client });
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const supabase = createClientComponentClient();

    // יצירת טוקן הזדהות מול Green Invoice
    console.log('Authenticating with Green Invoice...');
    
    const authResponse = await fetch(`${GREEN_INVOICE_SANDBOX_URL}/account/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: GREEN_INVOICE_SANDBOX_KEY,
        secret: GREEN_INVOICE_SANDBOX_SECRET
      })
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Green Invoice authentication failed:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const authData = await authResponse.json();
    
    if (!authData.token) {
      console.error('No token received from Green Invoice');
      return NextResponse.json({ error: 'Invalid authentication response' }, { status: 500 });
    }

    const token = authData.token;
    console.log('Successfully authenticated with Green Invoice');

    // יצירת טופס תשלום
    console.log('=== Creating Payment Form ===');
    console.log('Request Data Received:', {
      sessionId,
      amount,
      lang,
      packageType,
      client
    });
    
    const paymentData = {
      description: lang === 'he' ? `חבילת ${packageType}` : `${packageType} Package`,
      type: "400",
      lang: lang === 'he' ? 'he' : 'en',
      currency: 'ILS',
      vatType: 0,
      amount: amount,
      maxPayments: 1,
      pluginId: GREEN_INVOICE_PLUGIN_ID,
      client: {
        name: client.name,
        emails: [client.email],
        phone: client.phone,
        taxId: client.taxId,
        country: 'IL',
        add: true
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/success`,
      failureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/failure`,
      notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/notify`,
      custom: sessionId
    };

    console.log('=== Payment Form Data ===');
    console.log(JSON.stringify(paymentData, null, 2));
    console.log('=== URLs ===');
    console.log('Success URL:', paymentData.successUrl);
    console.log('Failure URL:', paymentData.failureUrl);
    console.log('Notify URL:', paymentData.notifyUrl);
    console.log('=== Client Data ===');
    console.log('Client:', JSON.stringify(paymentData.client, null, 2));
    
    console.log('Sending payment form request to:', `${GREEN_INVOICE_SANDBOX_URL}/payments/form`);
    const paymentResponse = await fetch(`${GREEN_INVOICE_SANDBOX_URL}/payments/form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.text();
      console.error('Green Invoice payment form creation failed:', paymentError);
      return NextResponse.json({ error: 'Payment form creation failed', details: paymentError }, { status: paymentResponse.status });
    }

    const paymentResult = await paymentResponse.json();
    
    if (!paymentResult.url) {
      console.error('No payment URL in response:', paymentResult);
      return NextResponse.json({ error: 'Invalid payment form response' }, { status: 500 });
    }

    console.log('Payment process completed successfully');
    return NextResponse.json({ success: true, paymentUrl: paymentResult.url });

  } catch (error) {
    console.error('Detailed payment error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process payment',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 