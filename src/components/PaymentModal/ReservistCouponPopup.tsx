import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

interface CouponPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
  onSuccess: () => void;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  type: 'reservist' | 'other' | null;
  data?: any;
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
  const supabase = createClientComponentClient();
  const setSelectedPackage = useAppStore(state => state.setSelectedPackage);

  const validateCoupon = async (code: string): Promise<ValidationResult> => {
    console.log('Starting coupon validation process...');
    console.log('Checking reservist coupons table...');
    
    // בדיקת קופון מילואים
    const { data: reservistCoupon, error: reservistError } = await supabase
      .from('reservist_coupons')
      .select('*')
      .eq('code', code)
      .single();

    console.log('Reservist coupon check result:', { data: reservistCoupon, error: reservistError });

    if (reservistCoupon && !reservistError) {
      console.log('Found reservist coupon:', reservistCoupon);
      if (reservistCoupon.is_used) {
        console.log('Reservist coupon already used');
        return {
          isValid: false,
          error: isRTL ? 'קוד הקופון כבר נמצא בשימוש' : 'Coupon code already used',
          type: 'reservist'
        };
      }
      return {
        isValid: true,
        data: reservistCoupon,
        type: 'reservist'
      };
    }

    // כאן אפשר להוסיף בדיקות לסוגי קופונים נוספים
    // לדוגמה:
    /*
    console.log('Checking other coupon types...');
    const { data: otherCoupon, error: otherError } = await supabase
      .from('other_coupons')
      .select('*')
      .eq('code', code)
      .single();
    
    if (otherCoupon && !otherError) {
      // בדיקות ספציפיות לסוג הקופון
    }
    */

    console.log('No valid coupon found');
    return {
      isValid: false,
      error: isRTL ? 'קוד קופון לא תקין' : 'Invalid coupon code',
      type: null
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting coupon submission process for code:', couponCode);
      const validationResult = await validateCoupon(couponCode.trim());
      console.log('Validation result:', validationResult);

      if (!validationResult.isValid) {
        setError(validationResult.error || 'Invalid coupon code');
        return;
      }

      // טיפול בסוגי קופונים שונים
      switch (validationResult.type) {
        case 'reservist':
          console.log('Processing reservist coupon...');
          const { error: updateError } = await supabase
            .from('reservist_coupons')
            .update({ 
              is_used: true, 
              updated_at: new Date().toISOString() 
            })
            .eq('code', couponCode);

          if (updateError) {
            console.error('Error updating reservist coupon:', updateError);
            throw updateError;
          }

          setSelectedPackage('advanced');
          break;

        // כאן אפשר להוסיף case נוספים לסוגי קופונים אחרים
        default:
          console.error('Unknown coupon type');
          throw new Error('Unknown coupon type');
      }
      
      console.log('Coupon processed successfully');
      toast.success(
        isRTL 
          ? 'קופון הופעל בהצלחה!' 
          : 'Coupon activated successfully!'
      );

      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error processing coupon:', error);
      setError(isRTL ? 'אירעה שגיאה בבדיקת הקופון' : 'Error validating coupon');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="coupon-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0"
        >
          <div 
            key="coupon-modal-backdrop"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
            onClick={onClose} 
          />

          <motion.div
            key="coupon-modal-content"
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
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-4 text-[#4754D7]">
                {isRTL ? 'הזנת קופון' : 'Enter Coupon'}
              </h2>

              <p className="text-center text-gray-600 mb-6">
                {isRTL 
                  ? 'יש לך קופון? הזן אותו כאן' 
                  : 'Have a coupon? Enter it here'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div key="coupon-input-container">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={isRTL ? 'קוד קופון' : 'Coupon Code'}
                    className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                  />
                </div>

                {error && (
                  <div key="coupon-error" className="flex items-center gap-2 text-red-500 text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  key="coupon-submit"
                  type="submit"
                  disabled={isLoading || !couponCode}
                  className={cn(
                    "w-full",
                    "mt-6",
                    "px-6 py-3",
                    "bg-[#4856CD]",
                    "text-white",
                    "rounded-full",
                    "font-medium",
                    "transition-all",
                    "hover:bg-[#4856CD]/90",
                    "disabled:opacity-50",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {isLoading ? (
                    <Loader2 key="loading-spinner" className="w-5 h-5 animate-spin" />
                  ) : (
                    <span key="submit-text">{isRTL ? 'הפעל קופון' : 'Activate Coupon'}</span>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 