import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { PACKAGE_PRICES } from '@/lib/constants';

export const config = {
  maxDuration: 60,
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
};

export async function POST(request: Request) {
  try {
    console.log('🔍 [API Payment] Starting payment process...');
    const { userId, paymentDetails, lang, packageType } = await request.json();
    const price = PACKAGE_PRICES[packageType as keyof typeof PACKAGE_PRICES];

    // עדכון סטטוס התשלום
    console.log('💳 [API Payment] Updating payment status for user:', userId);
    await sql`
      UPDATE cv_data 
      SET 
        payment_status = 'completed',
        payment_details = ${JSON.stringify({
          ...paymentDetails,
          package: packageType,
          price,
          date: new Date().toISOString()
        })}::jsonb
      WHERE user_id = ${userId}
    `;

    // שליחת בקשה ליצירת קורות חיים
    console.log('📤 [API Payment] Sending request to generate CV...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: userId, lang })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [API Payment] CV generation failed:', errorData);
      throw new Error(`Failed to generate CV: ${errorData}`);
    }

    const cvResult = await response.json();
    console.log('✅ [API Payment] Process completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: lang === 'he' ? 'התשלום אושר וקורות החיים מוכנים!' : 'Payment approved and CV is ready!',
      data: cvResult.data 
    });

  } catch (error) {
    console.error('❌ [API Payment] Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process payment',
        success: false,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : null : undefined
      },
      { status: 500 }
    );
  }
} 