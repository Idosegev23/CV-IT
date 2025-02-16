import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { couponId } = await request.json();

    if (!couponId) {
      return NextResponse.json(
        { message: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('reservist_coupons')
      .update({ is_used: true })
      .eq('id', couponId);

    if (error) {
      console.error('Error updating coupon:', error);
      return NextResponse.json(
        { message: 'Failed to update coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update-reservist-coupon:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 