import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSessionStore } from '@/store/sessionStore';
import { PACKAGE_PRICES } from '@/lib/constants';
import { useAppStore } from '@/lib/store';
import { ReservistCouponPopup } from './ReservistCouponPopup';
import Link from 'next/link';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
  lang: 'he' | 'en';
}

export const PaymentModal = ({ isOpen, onClose, isRTL, lang }: PaymentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [cvStatus, setCvStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [cvError, setCvError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'generating'>('idle');
  const [isReservistPopupOpen, setIsReservistPopupOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [paymentIframe, setPaymentIframe] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id: ''
  });

  const selectedPackage = useAppStore(state => state.selectedPackage);
  const setSelectedPackage = useAppStore(state => state.setSelectedPackage);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionData?.id) {
        setCurrentSessionId(sessionData.id);
        useSessionStore.getState().setSessionId(sessionData.id);
      }
    };

    if (isOpen) {
      checkSession();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPackage) {
      const price = PACKAGE_PRICES[selectedPackage];
      setOriginalPrice(price);
      setFinalPrice(price);
    }
  }, [selectedPackage]);

  const checkCVStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/generate-cv/status?sessionId=${sessionId}`);
      const data = await response.json();
      
      console.log('CV Status:', data.status);
      
      switch(data.status) {
        case 'completed':
          setCvStatus('completed');
          // ניווט לדף התצוגה המקדימה רק כשקורות החיים מוכנים
          toast.success(
            isRTL 
              ? 'קורות החיים שלך מוכנים!' 
              : 'Your CV is ready!',
            {
              duration: 2000,
            }
          );
          setTimeout(() => {
            window.location.href = `/${lang}/create/template/${sessionId}/preview`;
          }, 1000);
          break;
        case 'error':
          setCvStatus('error');
          setCvError(data.error);
          toast.error(isRTL ? 'אירעה שגיאה ביצירת קורות החיים' : 'Error generating CV');
          break;
        case 'processing':
        case 'pending':
        default:
          // המשך לבדוק את הסטטוס כל 3 שניות
          console.log('CV still processing, checking again in 3 seconds...');
          setTimeout(() => checkCVStatus(sessionId), 3000);
          break;
      }
    } catch (error) {
      console.error('Error checking CV status:', error);
      setCvStatus('error');
      setCvError('Failed to check CV status');
      toast.error(
        isRTL 
          ? 'אירעה שגיאה בבדיקת סטטוס קורות החיים' 
          : 'Error checking CV status'
      );
      // נסה שוב בעוד 3 שניות במקרה של שגיאה
      setTimeout(() => checkCVStatus(sessionId), 3000);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      console.log('Starting payment process...');

      if (!currentSessionId) {
        throw new Error('No session ID found');
      }

      if (!selectedPackage) {
        throw new Error('No package selected');
      }

      if (!formData.name || !formData.email || !formData.phone || !formData.id) {
        throw new Error('Please fill in all required fields');
      }

      // יצירת טופס תשלום ב-Green Invoice
      console.log('Creating payment form with data:', {
        sessionId: currentSessionId,
        amount: finalPrice,
        lang,
        packageType: selectedPackage,
        client: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          taxId: formData.id
        }
      });

      const response = await fetch('/api/payment/green-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          amount: finalPrice,
          lang,
          packageType: selectedPackage,
          client: {
            name: formData.name,
            emails: [formData.email],
            phone: formData.phone,
            taxId: formData.id,
            country: 'IL'
          },
          coupon: appliedCoupon?.data
        })
      });

      console.log('Payment form response status:', response.status);
      const data = await response.json();
      console.log('Payment form response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment form');
      }

      if (!data.paymentUrl) {
        throw new Error('No payment URL received');
      }

      console.log('Setting payment iframe URL:', data.paymentUrl);
      setPaymentIframe(data.paymentUrl);

      // הוספת מאזין להודעות מה-iframe
      const messageHandler = (event: MessageEvent) => {
        try {
          console.log('Received message from iframe:', event.data);
          let data;
          
          // אם זה אובייקט רגיל (לא JSON string)
          if (typeof event.data === 'object' && event.data !== null) {
            data = event.data;
            // אם זה הודעת תשלום מהשרת של Green Invoice
            if (data.action === 'payment') {
              data = {
                success: data.status === 1,
                error: data.status !== 1 ? 'Payment failed' : undefined
              };
            }
          } else {
            // אם זה JSON string
            try {
              data = JSON.parse(event.data);
            } catch (e) {
              console.log('Not a valid message format, ignoring');
              return;
            }
          }
          
          if (data.success) {
            console.log('Payment successful');
            
            // סגירת ה-iframe של התשלום
            setPaymentIframe(null);
            
            // עדכון סטטוס התשלום
            setPaymentStatus('success');
            
            // הצגת הודעת הצלחה
            toast.success(
              isRTL 
                ? 'התשלום התקבל בהצלחה!' 
                : 'Payment successful!',
              {
                duration: 3000,
              }
            );
            
            // המתנה קצרה לפני המעבר לשלב הבא
            setTimeout(async () => {
              setPaymentStatus('generating');
              
              // התחלת תהליך יצירת קורות החיים
              if (currentSessionId) {
                try {
                  // קריאה ל-API ליצירת קורות החיים
                  const generateResponse = await fetch('/api/generate-cv', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                      sessionId: currentSessionId,
                      lang
                    }),
                  });

                  if (!generateResponse.ok) {
                    throw new Error('Failed to start CV generation');
                  }

                  console.log('Started CV generation process');
                  
                  // התחלת בדיקת הסטטוס
                  checkCVStatus(currentSessionId);
                } catch (error) {
                  console.error('Failed to start CV generation:', error);
                  toast.error(
                    isRTL 
                      ? 'אירעה שגיאה בהתחלת תהליך יצירת קורות החיים' 
                      : 'Error starting CV generation'
                  );
                  setPaymentStatus('idle');
                }
              } else {
                console.error('No session ID available');
                toast.error(isRTL ? 'אירעה שגיאה בתהליך' : 'An error occurred');
              }
            }, 2000);
            
          } else if (data.error) {
            console.error('Payment error from iframe:', data.error);
            // סגירת ה-iframe של התשלום
            setPaymentIframe(null);
            
            // הצגת הודעת שגיאה
            toast.error(
              isRTL 
                ? 'התשלום לא התקבל. אנא נסה שוב או צור קשר עם התמיכה.' 
                : 'Payment failed. Please try again or contact support.',
              {
                duration: 5000,
              }
            );
            
            // איפוס הטופס
            setPaymentStatus('idle');
          }
        } catch (error) {
          console.error('Error handling message:', error);
          // סגירת ה-iframe של התשלום
          setPaymentIframe(null);
          
          // הצגת הודעת שגיאה
          toast.error(
            isRTL 
              ? 'אירעה שגיאה בתהליך התשלום. אנא נסה שוב.' 
              : 'An error occurred during payment. Please try again.',
            {
              duration: 5000,
            }
          );
          
          // איפוס הטופס
          setPaymentStatus('idle');
        }
      };

      window.addEventListener('message', messageHandler);

      // ניקוי המאזין כשהקומפוננטה מתפרקת
      return () => {
        window.removeEventListener('message', messageHandler);
      };

    } catch (error) {
      console.error('Process failed:', error);
      setCvStatus('error');
      
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', error.stack);
      }
      
      toast.error(
        isRTL 
          ? `שגיאה בתהליך: ${errorMessage}` 
          : `Error in process: ${errorMessage}`
      );
      setPaymentStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCoupon = async (code: string) => {
    setIsValidatingCoupon(true);
    try {
      const { data: regularCoupon, error: regularError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (regularCoupon && !regularError) {
        // בדיקות תקינות הקופון...
        setAppliedCoupon({ type: 'regular', data: regularCoupon });
        
        // חישוב המחיר החדש
        let newPrice = originalPrice;
        let discountText = '';
        
        switch (regularCoupon.discount_type) {
          case 'free_package':
            newPrice = 0;
            discountText = isRTL ? 'חבילה חינם!' : 'Free package!';
            break;
          
          case 'percentage':
            const discountAmount = originalPrice * (regularCoupon.discount_value / 100);
            newPrice = originalPrice - discountAmount;
            discountText = isRTL 
              ? `${regularCoupon.discount_value}% הנחה` 
              : `${regularCoupon.discount_value}% discount`;
            break;
          
          case 'fixed':
            newPrice = Math.max(0, originalPrice - regularCoupon.discount_value);
            discountText = isRTL 
              ? `${regularCoupon.discount_value}₪ הנחה` 
              : `${regularCoupon.discount_value}₪ discount`;
            break;
        }
        
        setFinalPrice(newPrice);
        toast.success(isRTL 
          ? `קופון הופעל בהצלחה! ${discountText}` 
          : `Coupon activated! ${discountText}`);
      } else {
        toast.error(isRTL ? 'קוד קופון לא תקין' : 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error(isRTL ? 'אירעה שגיאה בבדיקת הקופון' : 'Error validating coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="payment-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            key="payment-modal-content"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "relative",
              "w-full max-w-[500px]",
              "bg-white",
              "rounded-3xl",
              "shadow-xl",
              "overflow-hidden",
              "mx-4",
              "max-h-[90vh]",
              "overflow-y-auto",
              isRTL ? "rtl" : "ltr"
            )}
          >
            {paymentStatus === 'idle' ? (
              <>
                <div className="relative h-24 md:h-32 bg-white">
                  <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 scale-75 md:scale-100">
                    <Image
                      src="/design/CreditCard.svg"
                      alt="Credit Card"
                      width={156}
                      height={141}
                      priority
                    />
                  </div>
                </div>

                <div className="p-4 md:p-6 pt-20 md:pt-24">
                  <h2 className="text-2xl font-bold text-center mb-2 text-[#4754D7]">
                    {isRTL ? 'פרטי תשלום' : 'Payment Details'}
                  </h2>
                  
                  <div className="text-center mb-6">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#4754D7]">
                        {finalPrice.toFixed(1)}
                      </span>
                      <span className="text-lg text-[#4754D7]">₪</span>
                    </div>
                    {appliedCoupon && (
                      <div className="text-sm text-green-600 mt-1">
                        {isRTL ? 'קופון הופעל בהצלחה!' : 'Coupon applied successfully!'}
                      </div>
                    )}
                    <div className="text-sm text-[#4754D7]/70">
                      {isRTL 
                        ? `חבילת ${selectedPackage === 'basic' ? 'בסיס' : selectedPackage === 'advanced' ? 'מתקדמת' : 'פרו'}`
                        : `${selectedPackage === 'basic' ? 'Basic' : selectedPackage === 'advanced' ? 'Advanced' : 'Pro'} Package`
                      }
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-[#4754D7]">
                      {isRTL ? 'סיכום תשלום' : 'Payment Summary'}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      {/* מחיר מקורי */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {isRTL ? 'מחיר מקורי' : 'Original Price'}
                        </span>
                        <span className={appliedCoupon ? 'line-through text-gray-500' : 'text-gray-900'}>
                          ₪{originalPrice.toFixed(1)}
                        </span>
                      </div>

                      {/* הנחה - מוצג רק אם יש קופון */}
                      {appliedCoupon && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>
                            {isRTL ? 'הנחה' : 'Discount'}
                          </span>
                          <span>
                            {appliedCoupon.data.discount_type === 'percentage'
                              ? `${appliedCoupon.data.discount_value}%`
                              : appliedCoupon.data.discount_type === 'fixed'
                              ? `₪${appliedCoupon.data.discount_value}`
                              : isRTL ? 'חבילה חינם' : 'Free Package'}
                          </span>
                        </div>
                      )}

                      {/* מחיר סופי */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="font-bold text-[#4754D7]">
                          {isRTL ? 'מחיר סופי' : 'Final Price'}
                        </span>
                        <span className="font-bold text-[#4754D7]">
                          ₪{finalPrice.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* קופון */}
                    <div className="mt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder={isRTL ? "קוד קופון" : "Coupon code"}
                          className="flex-1 px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                        />
                        <button
                          onClick={() => validateCoupon(couponCode)}
                          disabled={isValidatingCoupon || !couponCode}
                          className="px-4 py-2 bg-[#4754D7] text-white rounded-lg hover:bg-[#4856CD] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isValidatingCoupon ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              {isRTL ? 'בודק...' : 'Checking...'}
                            </span>
                          ) : (
                            isRTL ? 'הפעל קופון' : 'Apply Coupon'
                          )}
                        </button>
                      </div>
                      {appliedCoupon && (
                        <div className="mt-2 text-sm text-green-600">
                          {isRTL ? 'קופון פעיל' : 'Coupon active'}
                        </div>
                      )}
                    </div>

                    {/* כופס פרטים */}
                    <form className="space-y-4 mt-6" onSubmit={handlePayment}>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#4754D7]">
                          {isRTL ? 'שם מלא' : 'Full Name'}
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                          placeholder={isRTL ? 'ישראל ישראלי' : 'John Doe'}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#4754D7]">
                          {isRTL ? 'דוא"ל' : 'Email'}
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                          placeholder="example@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#4754D7]">
                          {isRTL ? 'טלפון' : 'Phone'}
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                          placeholder="050-0000000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#4754D7]">
                          {isRTL ? 'תעודת זהות' : 'ID Number'}
                        </label>
                        <input
                          type="text"
                          maxLength={9}
                          className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                          placeholder="123456789"
                          value={formData.id}
                          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                          required
                        />
                      </div>

                      <div className="flex items-start mt-4">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#4856CD] focus:ring-[#4856CD]"
                        />
                        <label htmlFor="terms" className="mr-2 text-sm text-gray-600">
                          {isRTL ? (
                            <span>אני מאשר/ת את <Link href={`/${lang}/terms`} className="text-[#4856CD] hover:underline">תנאי השימוש והתקנון</Link></span>
                          ) : (
                            <span>I agree to the <Link href={`/${lang}/terms`} className="text-[#4856CD] hover:underline">Terms and Conditions</Link></span>
                          )}
                        </label>
                      </div>

                      {/* כפתור תשלום */}
                      <button
                        type="submit"
                        disabled={isLoading || !formData.name || !formData.email || !formData.phone || !formData.id}
                        className="w-full mt-6 px-6 py-3 bg-[#4754D7] text-white rounded-lg hover:bg-[#4856CD] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {isRTL ? 'מעבד...' : 'Processing...'}
                          </span>
                        ) : (
                          isRTL ? 'המשך לתשלום' : 'Proceed to Payment'
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <motion.div 
                key="payment-status-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                {paymentStatus === 'success' && (
                  <motion.div
                    key="payment-success-content"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <CheckCircle2 className="w-16 h-16 mx-auto text-[#4754D7] mb-4" />
                    <h2 className="text-xl font-bold mb-2 text-[#4754D7]">
                      {isRTL ? 'התשלום התקבל בהצלחה!' : 'Payment Successful!'}
                    </h2>
                  </motion.div>
                )}

                {paymentStatus === 'generating' && (
                  <motion.div 
                    key="payment-generating-content"
                    className="space-y-4"
                  >
                    <div className="relative w-32 h-32 mx-auto">
                      <Image 
                        src="/design/CV.svg"
                        alt="CV"
                        width={96}
                        height={96}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      />
                      
                      <motion.div
                        key="blue-wheel"
                        className="absolute top-0 right-0"
                        animate={{ 
                          rotate: 360
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Image 
                          src="/design/wheelblue.svg"
                          alt="Blue Wheel"
                          width={48}
                          height={48}
                        />
                      </motion.div>

                      <motion.div
                        key="white-wheel"
                        className="absolute bottom-0 left-0"
                        animate={{ 
                          rotate: -360
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Image 
                          src="/design/wheelwhite.svg"
                          alt="White Wheel"
                          width={48}
                          height={48}
                        />
                      </motion.div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-[#4754D7]">
                      {isRTL ? 'מכין את קורות החיים שלך...' : 'Generating your CV...'}
                    </h2>
                    <p className="text-[#4754D7]/70">
                      {isRTL 
                        ? 'אנא המתן מספר שניות' 
                        : 'Please wait a few seconds'}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      <ReservistCouponPopup
        key="reservist-popup"
        isOpen={isReservistPopupOpen}
        onClose={() => setIsReservistPopupOpen(false)}
        isRTL={isRTL}
        onSuccess={() => {
          setPaymentStatus('success');
          setTimeout(() => {
            setPaymentStatus('generating');
            if (currentSessionId) {
              checkCVStatus(currentSessionId);
            }
          }, 1500);
        }}
      />
    </AnimatePresence>
  );
}; 