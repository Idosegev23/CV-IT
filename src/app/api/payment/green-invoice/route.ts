import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const GREEN_INVOICE_URL = process.env.GREEN_INVOICE_URL;
const GREEN_INVOICE_API_KEY = process.env.GREEN_INVOICE_API_KEY;
const GREEN_INVOICE_SECRET = process.env.GREEN_INVOICE_SECRET;
const GREEN_INVOICE_PLUGIN_ID = process.env.GREEN_INVOICE_PLUGIN_ID;

export async function POST(request: Request) {
  try {
    console.log('Starting Green Invoice payment process...');
    
    // בדיקת משתני הסביבה
    console.log('Checking environment variables...');
    console.log('GREEN_INVOICE_URL:', GREEN_INVOICE_URL ? 'exists' : 'missing');
    console.log('GREEN_INVOICE_API_KEY:', GREEN_INVOICE_API_KEY ? 'exists' : 'missing');
    console.log('GREEN_INVOICE_SECRET:', GREEN_INVOICE_SECRET ? 'exists' : 'missing');
    console.log('GREEN_INVOICE_PLUGIN_ID:', GREEN_INVOICE_PLUGIN_ID ? 'exists' : 'missing');
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? 'exists' : 'missing');

    if (!GREEN_INVOICE_URL || !GREEN_INVOICE_API_KEY || !GREEN_INVOICE_SECRET || !GREEN_INVOICE_PLUGIN_ID) {
      throw new Error('Missing required environment variables');
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('Missing NEXT_PUBLIC_APP_URL');
    }

    // קבלת נתוני הבקשה
    const requestData = await request.json();
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    const { sessionId, amount, lang, packageType, client } = requestData;

    // בדיקת תקינות הנתונים
    if (!sessionId || !amount || !lang || !packageType || !client) {
      throw new Error(`Missing required request data: ${JSON.stringify({ 
        sessionId: !!sessionId, 
        amount: !!amount, 
        lang: !!lang, 
        packageType: !!packageType, 
        client: !!client 
      })}`);
    }

    const supabase = createClientComponentClient();

    // יצירת טוקן הזדהות מול Green Invoice
    console.log('Authenticating with Green Invoice...');
    
    const authResponse = await fetch(`${GREEN_INVOICE_URL}/account/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: GREEN_INVOICE_API_KEY,
        secret: GREEN_INVOICE_SECRET
      })
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      throw new Error(`Green Invoice authentication failed: ${authError}`);
    }

    const authData = await authResponse.json();
    console.log('Auth response:', JSON.stringify(authData, null, 2));
    
    if (!authData.token) {
      throw new Error('No token received from Green Invoice');
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
      type: "320",
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

    console.log('Payment request data:', JSON.stringify(paymentData, null, 2));
    console.log('Sending request to:', `${GREEN_INVOICE_URL}/payments/form`);
    
    const paymentResponse = await fetch(`${GREEN_INVOICE_URL}/payments/form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.text();
      throw new Error(`Green Invoice payment form creation failed: ${paymentError}`);
    }

    const paymentResult = await paymentResponse.json();
    console.log('Payment response:', JSON.stringify(paymentResult, null, 2));
    
    if (!paymentResult.url) {
      throw new Error(`Invalid payment form response: ${JSON.stringify(paymentResult)}`);
    }

    console.log('Payment process completed successfully');
    return NextResponse.json({ success: true, paymentUrl: paymentResult.url });

  } catch (error) {
    console.error('Payment error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error details:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process payment',
        details: error
      },
      { status: 500 }
    );
  }
} 