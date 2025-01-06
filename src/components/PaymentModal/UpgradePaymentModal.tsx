'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSessionStore } from '@/store/sessionStore';
import { PACKAGE_PRICES } from '@/lib/constants';
import type { Package } from '@/lib/store';
import type { FeatureConfig } from '@/app/[lang]/finish/[sessionId]/page';
import Link from 'next/link';

interface FeatureWithUpgrade extends FeatureConfig {
  key: string;
  upgradePrice: number;
}

interface UpgradePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
  lang: 'he' | 'en';
  fromPackage: Package;
  toPackage: Package;
  feature: string;
  upgradedFeatures: FeatureWithUpgrade[];
  upgradePrice: number;
}

export const UpgradePaymentModal: React.FC<UpgradePaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  isRTL, 
  lang,
  fromPackage,
  toPackage,
  feature,
  upgradedFeatures,
  upgradePrice
}: UpgradePaymentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const sessionId = useSessionStore(state => state.sessionId);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'processing'>('idle');
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    holderName: '',
    id: ''
  });

  // חישוב ההפרש במחיר בין החבילות
  const priceDifference = PACKAGE_PRICES[toPackage as keyof typeof PACKAGE_PRICES] - 
    PACKAGE_PRICES[fromPackage as keyof typeof PACKAGE_PRICES];

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (!sessionId) {
        throw new Error('No session ID found');
      }

      // עדכון החבילה בדאטהבייס
      const { error: updateError } = await supabase
        .from('cv_data')
        .update({ 
          package: toPackage,
          payment_details: {
            upgrade_from: fromPackage,
            upgrade_to: toPackage,
            price: priceDifference,
            date: new Date().toISOString()
          }
        })
        .eq('session_id', sessionId);

      if (updateError) throw updateError;

      setPaymentStatus('success');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPaymentStatus('processing');

      toast.success(
        isRTL 
          ? 'השדרוג בוצע בהצלחה!' 
          : 'Package upgraded successfully!'
      );

      // חזרה לדף הסיום עם החבילה המשודרגת
      router.push(`/${lang}/finish`);
      onClose();

    } catch (error) {
      console.error('Upgrade process failed:', error);
      toast.error(
        isRTL 
          ? 'אירעה שגיאה בתהליך השדרוג' 
          : 'Error in upgrade process'
      );
      setPaymentStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const getFeatureTitle = () => {
    const titles = {
      translate: isRTL ? 'תרגום לאנגלית' : 'English Translation',
      interview: isRTL ? 'הכנה לראיון' : 'Interview Preparation',
      taxi: isRTL ? 'מונית לראיון' : 'Interview Taxi'
    };
    return titles[feature as keyof typeof titles] || feature;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          <motion.div
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
                    {isRTL ? 'שדרוג חבילה' : 'Package Upgrade'}
                  </h2>
                  
                  <div className="text-center mb-6">
                    <p className="text-lg text-gray-600 mb-4">
                      {isRTL 
                        ? `שדרוג לחבילת ${toPackage === 'advanced' ? 'מתקדם' : 'פרו'} כפתח עבורך:`
                        : `Upgrading to ${toPackage} package will unlock:`
                      }
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {upgradedFeatures.map((feature) => (
                        <div key={feature.key} className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#4754D7]" />
                          <span className="text-gray-600">{feature.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#4754D7]">
                        {priceDifference}
                      </span>
                      <span className="text-lg text-[#4754D7]">₪</span>
                    </div>
                  </div>

                  {/* טופס תשלום זלא */}
                  <form className="space-y-4" onSubmit={handlePayment}>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#4754D7]">
                        {isRTL ? 'מספר כרטיס' : 'Card Number'}
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#4754D7]">
                          {isRTL ? 'תוקף' : 'Expiry'}
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#4754D7]">CVV</label>
                        <input
                          type="text"
                          maxLength={3}
                          className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#4754D7]">
                        {isRTL ? 'שם בעל הכרטיס' : 'Card Holder'}
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border focus:border-[#4856CD] outline-none text-[#4754D7]"
                        placeholder={isRTL ? 'ישראל ישראלי' : 'John Doe'}
                        value={formData.holderName}
                        onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
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
                      />
                    </div>

                    <div className="flex items-start mt-4">
                      <input
                        type="checkbox"
                        id="terms-upgrade"
                        required
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#4856CD] focus:ring-[#4856CD]"
                      />
                      <label htmlFor="terms-upgrade" className="mr-2 text-sm text-gray-600">
                        {isRTL ? (
                          <span>אני מאשר/ת את <Link href={`/${lang}/terms`} className="text-[#4856CD] hover:underline">תנאי השימוש והתקנון</Link></span>
                        ) : (
                          <span>I agree to the <Link href={`/${lang}/terms`} className="text-[#4856CD] hover:underline">Terms and Conditions</Link></span>
                        )}
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
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
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        isRTL ? 'אישור תשלום' : 'Confirm Payment'
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                {paymentStatus === 'success' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <CheckCircle2 className="w-16 h-16 mx-auto text-[#4754D7] mb-4" />
                    <h2 className="text-xl font-bold mb-2 text-[#4754D7]">
                      {isRTL ? 'השדרוג בוצע בהצלחה!' : 'Upgrade Successful!'}
                    </h2>
                  </motion.div>
                )}

                {paymentStatus === 'processing' && (
                  <motion.div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <Image 
                        src="/design/CV.svg"
                        alt="CV"
                        width={96}
                        height={96}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      />
                      
                      <motion.div
                        className="absolute top-0 right-0"
                        animate={{ rotate: 360 }}
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
                    </div>
                    
                    <h2 className="text-xl font-bold text-[#4754D7]">
                      {isRTL ? 'מעדכן את החבילה שלך...' : 'Updating your package...'}
                    </h2>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 