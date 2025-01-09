import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// וביעת ה-URL הבסיסי של Green Invoice
const baseUrl = process.env.GREEN_INVOICE_URL || 'https://api.greeninvoice.co.il';
// וידוא שה-URL לא מכיל /api/v1 בסופו
const GREEN_INVOICE_URL = baseUrl.endsWith('/api/v1') ? baseUrl.slice(0, -7) : baseUrl;
const GREEN_INVOICE_API_KEY = process.env.GREEN_INVOICE_API_KEY;
const GREEN_INVOICE_SECRET = process.env.GREEN_INVOICE_SECRET;
const GREEN_INVOICE_PLUGIN_ID = process.env.GREEN_INVOICE_PLUGIN_ID;

export async function POST(request: Request) {
  try {
    console.log('=== Starting Green Invoice Payment Process ===');
    console.log('Environment Variables:');
    console.log('Base URL:', baseUrl);
    console.log('Final URL:', GREEN_INVOICE_URL);
    console.log('API Key exists:', !!GREEN_INVOICE_API_KEY);
    console.log('Secret exists:', !!GREEN_INVOICE_SECRET);
    console.log('Plugin ID:', GREEN_INVOICE_PLUGIN_ID);
    console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('Environment:', process.env.NODE_ENV);

    // בדיקה שה-URL של האפליקציה מוגדר נכון
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.cvit.co.il';
    console.log('Using APP_URL:', appUrl);

    if (!GREEN_INVOICE_API_KEY || !GREEN_INVOICE_SECRET || !GREEN_INVOICE_PLUGIN_ID) {
      console.error('Missing environment variables:', {
        hasApiKey: !!GREEN_INVOICE_API_KEY,
        hasSecret: !!GREEN_INVOICE_SECRET,
        hasPluginId: !!GREEN_INVOICE_PLUGIN_ID
      });
      throw new Error('Missing required environment variables');
    }

    // קבלת נתוני הבקשה
    const requestData = await request.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));
    
    const { sessionId, amount, lang, packageType, client } = requestData;

    // בדיקת תקינות הנתונים
    if (!sessionId || !amount || !lang || !packageType || !client) {
      console.error('Missing request data:', {
        hasSessionId: !!sessionId,
        hasAmount: !!amount,
        hasLang: !!lang,
        hasPackageType: !!packageType,
        hasClient: !!client
      });
      throw new Error('Missing required request data');
    }

    const supabase = createClientComponentClient();

    // יצירת טוקן הזדהות מול Green Invoice
    const authUrl = `${GREEN_INVOICE_URL}/api/v1/account/token`;
    console.log('=== Authentication Step ===');
    console.log('Auth URL:', authUrl);
    console.log('Auth request body:', JSON.stringify({
      id: '***' + GREEN_INVOICE_API_KEY?.slice(-4),
      secret: '***' + GREEN_INVOICE_SECRET?.slice(-4)
    }));
    
    const authResponse = await fetch(authUrl, {
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
      console.error('Auth Error:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        error: authError
      });
      throw new Error(`Authentication failed: ${authError}`);
    }

    const authData = await authResponse.json();
    console.log('Auth successful, token received');
    
    if (!authData.token) {
      console.error('No token in response:', authData);
      throw new Error('No token received');
    }

    const token = authData.token;

    // יצירת טופס תשלום
    console.log('=== Creating Payment Form ===');
    
    const paymentData = {
      description: lang === 'he' ? `חבילת ${packageType}` : `${packageType} Package`,
      type: 1,
      lang: lang === 'he' ? 'he' : 'en',
      currency: 'ILS',
      vatType: 0,
      amount: Number(amount),
      maxPayments: 1,
      pluginId: GREEN_INVOICE_PLUGIN_ID,
      client: {
        name: client.name,
        emails: Array.isArray(client.emails) ? client.emails : [client.email],
        taxId: client.taxId || '',
        phone: client.phone || '',
        address: '',
        city: '',
        country: 'IL',
        add: true
      },
      income: [{
        description: lang === 'he' ? `חבילת ${packageType}` : `${packageType} Package`,
        quantity: 1,
        price: Number(amount),
        currency: 'ILS',
        vatType: 0
      }],
      remarks: lang === 'he' ? 'הזמנת חבילת קורות חיים' : 'CV Package Order',
      successUrl: `${appUrl}/api/payment/success`,
      failureUrl: `${appUrl}/api/payment/failure`,
      notifyUrl: `${appUrl}/api/payment/notify`,
      custom: sessionId,
      redirectUrl: `${appUrl}/api/payment/success`,
      theme: 1
    };

    const paymentUrl = `https://${GREEN_INVOICE_URL.replace('https://', '')}/api/v1/payments/form`;
    console.log('Payment URL:', paymentUrl);
    console.log('Payment request data:', JSON.stringify(paymentData, null, 2));
    
    try {
      const paymentResponse = await fetch(paymentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      console.log('Payment Response:', {
        status: paymentResponse.status,
        statusText: paymentResponse.statusText,
        headers: Object.fromEntries(paymentResponse.headers.entries())
      });

      const responseText = await paymentResponse.text();
      console.log('Raw response:', responseText);

      if (!paymentResponse.ok) {
        console.error('Payment Error:', {
          status: paymentResponse.status,
          statusText: paymentResponse.statusText,
          response: responseText
        });
        
        let errorMessage = 'Payment form creation failed';
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = `${errorMessage}: ${JSON.stringify(errorJson)}`;
        } catch (e) {
          errorMessage = `${errorMessage}: ${responseText}`;
        }
        throw new Error(errorMessage);
      }

      let paymentResult;
      try {
        paymentResult = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response format');
      }
      
      if (!paymentResult.url) {
        console.error('No URL in response:', paymentResult);
        throw new Error('No payment URL received');
      }

      console.log('Payment form created successfully');
      return NextResponse.json({ success: true, paymentUrl: paymentResult.url });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

  } catch (error) {
    console.error('Final error:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process payment',
        details: error
      },
      { status: 500 }
    );
  }
} 