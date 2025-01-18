import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, XCircle, Medal, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const TEMPLATE_IDS = ['classic', 'professional', 'general', 'creative'];

interface CouponPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
  onSuccess?: () => void;
}

export const ReservistCouponPopup: React.FC<CouponPopupProps> = ({
  isOpen,
  onClose,
  isRTL,
  onSuccess
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // בדיקת תקינות הקופון
      const { data: reservistCoupon, error: reservistError } = await supabase
        .from('reservist_coupons')
        .select('*')
        .eq('coupon_code', couponCode.trim())
        .eq('is_verified', true)
        .single();

      if (reservistError || !reservistCoupon) {
        setError(isRTL ? 'קוד קופון לא תקין' : 'Invalid coupon code');
        return;
      }

      if (reservistCoupon.is_used) {
        setError(isRTL ? 'קוד הקופון כבר נמצא בשימוש' : 'Coupon code already used');
        return;
      }

      // בחירת תבנית רנדומלית
      const randomTemplate = TEMPLATE_IDS[Math.floor(Math.random() * TEMPLATE_IDS.length)];
      const lang = isRTL ? 'he' : 'en';

      // יצירת סשן חדש
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          template_id: randomTemplate,
          language: lang,
          status: 'active',
          current_step: 'initial',
          metadata: {
            template: randomTemplate,
            startedAt: new Date().toISOString(),
            isAnonymous: true,
            isReservist: true
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // יצירת רשומה ב-cv_data
      const { error: cvError } = await supabase
        .from('cv_data')
        .insert({
          session_id: sessionData.id,
          language: lang,
          status: 'draft',
          content: {},
          package: 'advanced',
          is_editable: true,
          last_updated: new Date().toISOString(),
          format_cv: {},
          updated_at: new Date().toISOString()
        });

      if (cvError) throw cvError;

      // עדכון הקופון כ"בשימוש"
      const { error: updateError } = await supabase
        .from('reservist_coupons')
        .update({ is_used: true })
        .eq('id', reservistCoupon.id);

      if (updateError) {
        throw updateError;
      }

      setSessionId(sessionData.id);
      setShowSuccess(true);

    } catch (error) {
      console.error('Error processing coupon:', error);
      setError(isRTL ? 'אירעה שגיאה בבדיקת הקופון' : 'Error validating coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    const lang = isRTL ? 'he' : 'en';
    if (sessionId) {
      router.push(`/${lang}/create/template/${sessionId}/form`);
      onClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0"
        >
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
            onClick={onClose} 
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "relative",
              "w-full max-w-[400px]",
              "bg-white",
              "rounded-3xl",
              "shadow-xl",
              "overflow-hidden",
              "mx-4",
              isRTL ? "rtl" : "ltr"
            )}
          >
            {showSuccess ? (
              // תצוגת הצלחה
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex justify-center mb-4"
                >
                  <div className="relative">
                    <div className="relative w-16 h-16 bg-[#4B5320]/10 rounded-full flex items-center justify-center">
                      <Medal className="w-10 h-10 text-[#4B5320]" />
                    </div>
                    <ShieldCheck className="absolute -bottom-2 -right-2 w-7 h-7 text-green-500" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold mb-2 text-[#4B5320]">
                  {isRTL ? 'תודה על השירות!' : 'Thank You for Your Service!'}
                </h2>

                <p className="text-gray-600 mb-6">
                  {isRTL 
                    ? 'הקופון הופעל בהצלחה. בוא נתחיל ביצירת קורות החיים שלך!' 
                    : 'Coupon activated successfully. Let\'s create your CV!'}
                </p>

                <button
                  onClick={handleContinue}
                  className={cn(
                    "w-full",
                    "px-6 py-3",
                    "bg-[#4B5320]",
                    "text-white",
                    "rounded-full",
                    "font-medium",
                    "transition-all",
                    "hover:bg-[#4B5320]/90",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  <span>
                    {isRTL ? 'המשך ליצירת קורות חיים' : 'Continue to CV Creation'}
                  </span>
                </button>
              </div>
            ) : (
              // תצוגת הזנת קוד
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#4B5320]/10 rounded-full flex items-center justify-center">
                    <Medal className="w-10 h-10 text-[#4B5320]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2 text-[#4B5320]">
                  {isRTL ? 'קופון מילואים' : 'Military Coupon'}
                </h2>

                <p className="text-center text-gray-600 mb-6">
                  {isRTL 
                    ? 'הזן את קוד הקופון שקיבלת כמשרת/ת מילואים' 
                    : 'Enter your military service coupon code'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={isRTL ? 'קוד קופון' : 'Coupon Code'}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#4B5320] focus:border-[#4B5320] outline-none text-[#4B5320] placeholder-[#4B5320]/50"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !couponCode}
                    className={cn(
                      "w-full",
                      "mt-6",
                      "px-6 py-3",
                      "bg-[#4B5320]",
                      "text-white",
                      "rounded-full",
                      "font-medium",
                      "transition-all",
                      "hover:bg-[#4B5320]/90",
                      "disabled:opacity-50",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>{isRTL ? 'הפעל קופון' : 'Activate Coupon'}</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 