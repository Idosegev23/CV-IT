import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { couponCode } = await request.json();

    if (!couponCode) {
      return NextResponse.json(
        { message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const { data: coupons, error } = await supabase
      .from('reservist_coupons')
      .select('*')
      .eq('coupon_code', couponCode)
      .eq('is_verified', true);

    if (error) {
      console.error('Error validating coupon:', error);
      return NextResponse.json(
        { message: 'Failed to validate coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon: coupons[0] || null });
  } catch (error) {
    console.error('Error in validate-reservist-coupon:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 