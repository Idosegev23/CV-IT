import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// וידוא שה-URL מסתיים ללא /
const baseUrl = process.env.GREEN_INVOICE_URL?.endsWith('/') 
  ? process.env.GREEN_INVOICE_URL.slice(0, -1)
  : process.env.GREEN_INVOICE_URL;

const GREEN_INVOICE_URL = `${baseUrl}/api/v1`;
const GREEN_INVOICE_API_KEY = process.env.GREEN_INVOICE_API_KEY;
const GREEN_INVOICE_SECRET = process.env.GREEN_INVOICE_SECRET;
const GREEN_INVOICE_PLUGIN_ID = process.env.GREEN_INVOICE_PLUGIN_ID;

export async function POST(request: Request) {
  try {
    console.log('Starting Green Invoice payment process...');
    console.log('Environment Variables Values:');
    console.log('GREEN_INVOICE_URL:', GREEN_INVOICE_URL);
    console.log('GREEN_INVOICE_API_KEY:', GREEN_INVOICE_API_KEY ? 'exists (hidden)' : 'missing');
    console.log('GREEN_INVOICE_SECRET:', GREEN_INVOICE_SECRET ? 'exists (hidden)' : 'missing');
    console.log('GREEN_INVOICE_PLUGIN_ID:', GREEN_INVOICE_PLUGIN_ID);
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

    // בדיקה שה-URL של האפליקציה מוגדר נכון
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.cvit.co.il';
    console.log('Using APP_URL:', appUrl);

    if (!GREEN_INVOICE_URL || !GREEN_INVOICE_API_KEY || !GREEN_INVOICE_SECRET || !GREEN_INVOICE_PLUGIN_ID) {
      throw new Error('Missing required environment variables');
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
    console.log('Auth URL:', `${GREEN_INVOICE_URL}/account/token`);
    
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

    console.log('Auth Response Status:', authResponse.status);
    
    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Auth Error Response:', authError);
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
      group: 100,
      client: {
        name: client.name,
        emails: [client.email],
        phone: client.phone,
        taxId: client.taxId,
        country: 'IL',
        add: true
      },
      successUrl: `${appUrl}/api/payment/success`,
      failureUrl: `${appUrl}/api/payment/failure`,
      notifyUrl: `${appUrl}/api/payment/notify`,
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

    console.log('Payment Response Status:', paymentResponse.status);

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.text();
      console.error('Payment Error Response:', paymentError);
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