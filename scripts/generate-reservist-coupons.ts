import { createClient } from '@supabase/supabase-js';
import { customAlphabet } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// טעינת משתני הסביבה
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

interface Coupon {
  code: string;
  is_used: boolean;
  created_at: string;
}

// יצירת מחרוזת אקראית בפורמט XXXX-XXXX-XXXX
const generateCouponCode = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);

const formatCouponCode = (code: string): string => {
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
};

async function generateCoupons() {
  console.log('מתחיל ביצירת קופונים...');

  // יצירת חיבור ל-Supabase
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  console.log('מחובר ל-Supabase');

  const coupons: Coupon[] = [];
  const couponCodes = new Set<string>();

  // יצירת 1000 קופונים ייחודיים
  console.log('מייצר קופונים...');
  while (couponCodes.size < 1000) {
    const code = formatCouponCode(generateCouponCode());
    if (!couponCodes.has(code)) {
      couponCodes.add(code);
      coupons.push({
        code,
        is_used: false,
        created_at: new Date().toISOString()
      });
    }
  }

  console.log(`נוצרו ${coupons.length} קופונים`);

  try {
    console.log('מכניס קופונים ל-Supabase...');
    // הכנסת הקופונים ל-Supabase
    const { error } = await supabase
      .from('reservist_coupons')
      .insert(coupons);

    if (error) {
      console.error('שגיאה בהכנסת הקופונים ל-Supabase:', error);
      throw error;
    }

    console.log('הקופונים נשמרו בהצלחה ב-Supabase');

    // שמירת הקופונים לקובץ CSV
    const csvContent = ['Code,Created At\n'];
    coupons.forEach(coupon => {
      csvContent.push(`${coupon.code},${coupon.created_at}\n`);
    });

    const outputPath = path.join(process.cwd(), 'reservist-coupons.csv');
    fs.writeFileSync(outputPath, csvContent.join(''));
    console.log(`✅ הקופונים נשמרו בקובץ: ${outputPath}`);

  } catch (error) {
    console.error('שגיאה ביצירת הקופונים:', error);
    process.exit(1);
  }
}

generateCoupons(); 