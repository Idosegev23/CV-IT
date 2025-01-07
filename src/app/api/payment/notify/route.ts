import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Payment notify handler started');
  
  try {
    const data = await request.json();
    console.log('Notify data received:', data);
    
    // אם אין מידע בבקשה, נחזיר שגיאה
    if (!data) {
      return NextResponse.json({ error: 'No data received' }, { status: 400 });
    }
    
    // נחזיר תשובה חיובית לשרת התשלומים
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Payment notify handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 