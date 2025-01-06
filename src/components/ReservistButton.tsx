'use client';

import React, { useState } from 'react';
import { Button } from '@/components/theme/ui/button';
import { Input } from '@/components/theme/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/theme/ui/dialog';
import { Shield, Loader2, Medal, Star, ArrowRight } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ReservistButtonProps {
  lang: 'he' | 'en';
}

const content = {
  he: {
    buttonText: 'משרתים במילואים? לחצו כאן',
    infoTitle: 'מסלול מילואים - חינם!',
    infoDescription: 'כחלק מהערכתנו לשירות המילואים שלך, אנחנו מעניקים לך גישה חינם למסלול Advanced.\n\nכדי לממש את ההטבה:\n1. הירשם באתר הייעודי למילואימניקים\n2. קבל קוד קופון אישי\n3. בעת התשלום, לחץ על "יש לי קופון" והזן את הקוד\n\nהמסלול כולל את כל התכונות של חבילת Advanced לרבות קורות חיים באנגלית, עריכת קורות חיים ופרופיל לינקדאין אוטומטי.',
    continueButton: 'הבנתי',
    dialogTitle: 'ברוכים הבאות למסלול המילואים!',
    dialogDescription: 'כחלק מהערכתנו לשירות המילואים שלך, קיבלת גישה חינם למסלול Advanced',
    placeholder: 'נא להזין את קוד הקופון האישי',
    submit: 'אישור',
    invalidCode: 'קוד לא תקין',
    success: 'הקוד אומת בהצלחה! המסלול שודרג ל-Advanced',
    error: 'אירעה שגיאה, נא לנסות שוב'
  },
  en: {
    buttonText: 'IDF Reservist? Click Here',
    infoTitle: 'Reservist Plan - Free!',
    infoDescription: 'As part of our appreciation for your service, we\'re giving you free access to the Advanced plan.\n\nTo redeem:\n1. Register on the dedicated reservist website\n2. Get your personal coupon code\n3. During payment, click "I have a coupon" and enter the code\n\nThe plan includes all Advanced features including English CV, CV editing, and automatic LinkedIn profile.',
    continueButton: 'Got it',
    dialogTitle: 'Welcome to the Reservist Plan!',
    dialogDescription: 'As part of our appreciation for your service, you get free access to the Advanced plan',
    placeholder: 'Enter your personal coupon code',
    submit: 'Verify',
    invalidCode: 'Invalid code',
    success: 'Code validated successfully! Your plan has been upgraded to Advanced',
    error: 'An error occurred, please try again'
  }
};

export default function ReservistButton({ lang }: ReservistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const isRTL = lang === 'he';
  const t = content[lang];

  const handleInfoContinue = () => {
    setIsInfoOpen(false);
  };

  const validateCoupon = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      toast({
        title: isRTL ? 'נא להזין קוד קופון' : 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }

    console.log('Starting coupon validation for code:', trimmedCode);
    setIsLoading(true);
    setIsSearching(true);
    
    try {
      console.log('Fetching coupon data...');
      // בדיקת הקוד בדאטהבייס
      const { data: coupons, error: fetchError } = await supabase
        .from('reservist_coupons')
        .select('*')
        .eq('code', trimmedCode);

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Coupon search results:', coupons);
      const matchingCoupon = coupons?.[0];

      setIsSearching(false);

      if (!matchingCoupon) {
        console.log('No coupon found for code:', trimmedCode);
        toast({
          title: isRTL ? 'קוד לא נמצא' : 'Coupon not found',
          description: isRTL 
            ? 'נא לוודא שהקוד נכון ולנסות שוב' 
            : 'Please verify the code and try again',
          variant: 'destructive',
        });
        return;
      }

      // בדיקה אם הקופון כבר בשימוש
      if (matchingCoupon.is_used) {
        console.log('Coupon already used');
        toast({
          title: isRTL ? 'אופס, הקופון כבר בשימוש' : 'Oops, coupon already used',
          description: isRTL 
            ? 'נראה שכבר השתמשו בקופון הזה... 🤔 יש לך אולי קוד אחר?' 
            : 'Looks like this coupon has already been used... 🤔 Do you have another code?',
          variant: 'destructive',
        });
        return;
      }

      console.log('Updating coupon status...');
      // עדכון הקופון כמשומש
      const { error: updateError } = await supabase
        .from('reservist_coupons')
        .update({ is_used: true })
        .eq('id', matchingCoupon.id);

      if (updateError) throw updateError;

      // קבלת ה-session הנוכחי
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No active session');
      }

      // עדכון ה-session בדאטהבייס
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({ 
          is_paid: true,
          package: 'advanced',
          payment_method: 'reservist_coupon'
        })
        .eq('user_id', session.user.id);

      if (sessionError) {
        throw sessionError;
      }

      console.log('Coupon validated successfully');
      toast({
        title: isRTL ? 'הקוד אומת בהצלחה!' : 'Code validated successfully!',
        description: isRTL 
          ? `ברוך הבא! מעביר אותך למסלול המתקדם...` 
          : `Welcome! Redirecting to advanced plan...`,
        variant: 'default',
      });

      // מציג אנימציה של אישור לפני המעבר
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsOpen(false);
      
      // הפניה לשאלון
      window.location.href = `/${lang}/questionnaire`;
      
    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        title: isRTL ? 'שגיאה באימות הקוד' : 'Error validating code',
        description: isRTL 
          ? 'אירעה שגיאה בבדיקת הקוד. נא לנסות שוב או ליצור קשר עם התמיכה'
          : 'An error occurred while validating the code. Please try again or contact support',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const formatCode = (input: string) => {
    // מסיר רווחים ומעביר לאותיות קטנות
    return input.replace(/\s+/g, '').toLowerCase();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      validateCoupon();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={() => setIsInfoOpen(true)}
          className={`
            aspect-square
            w-12 h-12
            bg-[#4B5320]/80 hover:bg-[#4B5320]
            rounded-full text-white/90 hover:text-white
            border border-[#4B5320]/20
            shadow-sm hover:shadow-md
            transition-all duration-300
            flex items-center justify-center
            backdrop-blur-sm
          `}
          aria-label={isRTL ? 'פתח טופס קופון למילואים' : 'Open reservist coupon form'}
        >
          <Shield className="w-6 h-6" />
        </Button>
        <span className="text-sm text-gray-700 font-medium text-center">
          {t.buttonText}
        </span>
      </div>

      {/* Info Dialog */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent 
          className="!sm:max-w-[450px] !bg-[#F4F5F0] !rounded-3xl !border-2 !border-[#4B5320]/20 !shadow-2xl !max-h-[90vh] !overflow-hidden !flex !flex-col !mx-4 !sm:mx-0 !p-0"
          style={{
            direction: isRTL ? 'rtl' : 'ltr'
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4B5320] via-[#5C6627] to-[#4B5320]" />
          
          <DialogHeader className="!px-8 !pt-8 !pb-4 !bg-[#4B5320]/10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Medal key="info-medal-icon" className="w-8 h-8 text-[#4B5320]" />
              <Star key="info-star-icon" className="w-6 h-6 text-[#4B5320]" />
              <Shield key="info-shield-icon" className="w-8 h-8 text-[#4B5320]" />
            </div>
            <DialogTitle className="!text-center !text-3xl !font-bold !text-[#4B5320]">
              {t.infoTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="!flex-1 !overflow-y-auto !px-8 !py-6 !bg-gradient-to-b !from-[#4B5320]/5 !to-transparent">
            <div className="!space-y-6">
              <p className="!text-[#4B5320] !whitespace-pre-line">
                {t.infoDescription}
              </p>
              
              <motion.button
                onClick={handleInfoContinue}
                className={`
                  !w-full !rounded-xl !bg-[#4B5320] hover:!bg-[#5C6627] !text-white !shadow-lg hover:!shadow-xl 
                  !px-6 !py-5 !font-bold !text-lg !transition-all !duration-300 
                  !border-2 !border-transparent hover:!border-[#4B5320]/20
                  !flex !items-center !justify-center !gap-2
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.continueButton}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="!sm:max-w-[450px] !bg-[#F4F5F0] !rounded-3xl !border-2 !border-[#4B5320]/20 !shadow-2xl !max-h-[90vh] !overflow-hidden !flex !flex-col !mx-4 !sm:mx-0 !p-0"
          style={{
            direction: isRTL ? 'rtl' : 'ltr'
          }}
          aria-describedby="reservist-dialog-description"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4B5320] via-[#5C6627] to-[#4B5320]" />
          
          <DialogHeader className="!px-8 !pt-8 !pb-4 !bg-[#4B5320]/10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Medal key="coupon-medal-icon" className="w-8 h-8 text-[#4B5320]" />
              <Star key="coupon-star-icon" className="w-6 h-6 text-[#4B5320]" />
              <Shield key="coupon-shield-icon" className="w-8 h-8 text-[#4B5320]" />
            </div>
            <DialogTitle className="!text-center !text-3xl !font-bold !text-[#4B5320]">
              {t.dialogTitle}
            </DialogTitle>
            <p id="reservist-dialog-description" className="!text-center !text-base !text-[#4B5320]/80 !mt-3 !font-medium">
              {t.dialogDescription}
            </p>
          </DialogHeader>

          <div className="!flex-1 !overflow-y-auto !px-8 !py-6 !bg-gradient-to-b !from-[#4B5320]/5 !to-transparent">
            <div className="!space-y-5">
              <div className="relative">
                <Input
                  value={code}
                  onChange={(e) => setCode(formatCode(e.target.value))}
                  onKeyPress={handleKeyPress}
                  placeholder={isRTL ? 'לדוגמה: abc123' : 'e.g., abc123'}
                  className="!w-full !rounded-xl !border-2 !border-[#4B5320]/30 focus:!border-[#4B5320] !shadow-inner !bg-white/80 !text-lg !py-6 !px-4 !font-medium !text-[#4B5320] placeholder:!text-[#4B5320]/50"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  disabled={isLoading}
                  autoComplete="off"
                  maxLength={20}
                />
                {isSearching && (
                  <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'}`}>
                    <Loader2 className="w-6 h-6 animate-spin text-[#4B5320]" />
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none rounded-xl bg-[#4B5320]/5" />
              </div>
              <p className="!text-sm !text-[#4B5320]/60 !text-center">
                {isRTL 
                  ? 'הקוד צריך להיות בדיוק כפי שנשלח אליך, ללא רווחים'
                  : 'The code should be exactly as sent to you, without spaces'}
              </p>
              
              <motion.button
                onClick={validateCoupon}
                disabled={isLoading}
                className={`
                  !w-full !rounded-xl !bg-[#4B5320] hover:!bg-[#5C6627] !text-white !shadow-lg hover:!shadow-xl 
                  !px-6 !py-5 !font-bold !text-lg !transition-all !duration-300 
                  disabled:!opacity-50 disabled:!cursor-not-allowed !border-2 !border-transparent hover:!border-[#4B5320]/20
                  ${isLoading ? '!bg-[#4B5320]/70' : ''}
                `}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{isSearching ? (isRTL ? 'מחפש...' : 'Searching...') : (isRTL ? 'מאמת...' : 'Validating...')}</span>
                  </div>
                ) : t.submit}
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 