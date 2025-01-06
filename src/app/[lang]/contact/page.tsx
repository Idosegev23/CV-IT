'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { nanoid } from 'nanoid';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const content = {
  he: {
    title: 'בואו נדבר!',
    subtitle: 'נשמח לעזור לך בכל שאלה או בעיה :)',
    whatsappButton: 'פתח וואטסאפ',
    fields: {
      firstName: 'שם פרטי',
      lastName: 'שם משפחה',
      phone: 'טלפון נייד',
      email: 'דואר אלקטרוני',
      subject: 'נושא הפנייה',
      message: 'תוכן ההודעה',
      acceptTerms: 'אני מאשר/ת קבלת עדכונים במייל ואת',
      termsLink: 'תקנון האתר',
    },
    submit: 'שליחה',
    success: 'פנייתך התקבלה בהצלחה!',
    ticketNumber: 'מספר פנייה:',
  },
  en: {
    title: "Let's Talk!",
    subtitle: "We're happy to help with any question or issue :)",
    whatsappButton: 'Open WhatsApp',
    fields: {
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Mobile Phone',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      acceptTerms: 'I agree to receive updates by email and accept the',
      termsLink: 'Terms of Service',
    },
    submit: 'Send',
    success: 'Your message has been sent successfully!',
    ticketNumber: 'Ticket Number:',
  }
};

const formSchema = z.object({
  firstName: z.string().min(2, 'שם פרטי חייב להכיל לפחות 2 תווים'),
  lastName: z.string().min(2, 'שם משפחה חייב להכיל לפחות 2 תווים'),
  phone: z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  subject: z.string().min(2, 'נא לבחור נושא פנייה'),
  message: z.string().min(10, 'תוכן ההודעה חייב להכיל לפחות 10 תווים'),
  acceptTerms: z.boolean().refine((val) => val === true, 'יש לאשר את תנאי השימוש'),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactPage() {
  const params = useParams();
  const lang = (params?.lang ?? 'he') as keyof typeof content;
  const currentContent = content[lang];
  const isRTL = lang === 'he';

  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const newTicketNumber = nanoid(8);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ticketNumber: newTicketNumber,
        }),
      });

      if (response.ok) {
        setTicketNumber(newTicketNumber);
        reset();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/972509365605', '_blank');
  };

  return (
    <div className={`h-screen bg-[#EAEAE7] relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* וקטור רקע בצבע לבן */}
      <div 
        className="fixed bottom-0 right-0 w-full h-[75vh] pointer-events-none [mask-image:url('/design/BGvector.svg')] [mask-size:contain] [mask-position:bottom_right] [mask-repeat:no-repeat]"
        style={{
          backgroundColor: 'white',
          opacity: 0.5
        }}
      />

      <div className="container mx-auto h-full px-2 flex flex-col">
        {/* כותרות */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-6 mb-2"
        >
          <h1 className="text-[#4754D6] text-4xl md:text-5xl font-bold mb-4">
            {currentContent.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-4">
            {currentContent.subtitle}
          </p>
          <button
            onClick={() => window.open('https://wa.me/972509365605', '_blank')}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-full transition-colors shadow-lg mb-8"
          >
            <Image
              src="/design/whatsapp.svg"
              alt="WhatsApp"
              width={24}
              height={24}
              className="w-6 h-6 invert"
            />
            <span>{currentContent.whatsappButton}</span>
          </button>
        </motion.div>

        {/* טופס צור קשר */}
        <div className="relative flex flex-col items-center">
          {/* איור טלפון - עכשיו מופיע מתחת לטופס במובייל */}
          <div className="lg:absolute lg:left-[80px] lg:top-1/2 lg:-translate-y-1/2 mt-6 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/design/phone.svg"
                alt=""
                width={150}
                height={150}
                className="w-[120px] lg:w-[150px]"
              />
            </motion.div>
          </div>

          {/* טופס */}
          <div className="max-w-[800px] w-full relative">
            <div className="absolute inset-0 bg-white/40 rounded-[44px] border border-white" />
            <div className="relative p-4 md:p-6">
              {ticketNumber ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="mb-6">
                    <svg
                      className="mx-auto h-16 w-16 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-700 mb-4">
                    {currentContent.success}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {currentContent.ticketNumber} {ticketNumber}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 md:space-y-3">
                  {/* Grid containers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <InputField
                      label={currentContent.fields.firstName}
                      name="firstName"
                      register={register}
                      error={errors.firstName}
                      isRTL={isRTL}
                    />
                    <InputField
                      label={currentContent.fields.lastName}
                      name="lastName"
                      register={register}
                      error={errors.lastName}
                      isRTL={isRTL}
                    />
                  </div>

                  {/* Grid containers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <InputField
                      label={currentContent.fields.email}
                      name="email"
                      type="email"
                      register={register}
                      error={errors.email}
                      isRTL={isRTL}
                      dir="ltr"
                    />
                    <InputField
                      label={currentContent.fields.phone}
                      name="phone"
                      type="tel"
                      register={register}
                      error={errors.phone}
                      isRTL={isRTL}
                      dir="ltr"
                    />
                  </div>

                  {/* נושא */}
                  <InputField
                    label={currentContent.fields.subject}
                    name="subject"
                    register={register}
                    error={errors.subject}
                    isRTL={isRTL}
                  />

                  {/* הודעה */}
                  <div className="space-y-2">
                    <textarea
                      {...register('message')}
                      placeholder={currentContent.fields.message}
                      className="w-full bg-white/90 border-white rounded-[20px] md:rounded-[30px] 
                                h-[100px] md:h-[120px] p-4 text-sm md:text-base"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-600">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* תנאי שימוש */}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-600">
                      {currentContent.fields.acceptTerms}{' '}
                      <Link href={`/${lang}/terms`} className="text-[#4754D6] hover:underline">
                        {currentContent.fields.termsLink}
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-600 -mt-1">
                      {errors.acceptTerms.message}
                    </p>
                  )}

                  {/* כפתור שליחה */}
                  <div className="flex justify-center md:justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto bg-[#4856CD] text-white rounded-full px-12 py-3"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <svg 
                            className="animate-spin h-5 w-5" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle 
                              className="opacity-25" 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="4"
                            />
                            <path 
                              className="opacity-75" 
                              fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          {isRTL ? 'שולח...' : 'Sending...'}
                        </div>
                      ) : (
                        currentContent.submit
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Input Field Component
function InputField({
  label,
  name,
  type = 'text',
  register,
  error,
  isRTL,
  dir,
}: {
  label: string;
  name: string;
  type?: string;
  register: any;
  error: any;
  isRTL: boolean;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <div className="space-y-1 md:space-y-2">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        type={type}
        {...register(name)}
        dir={dir || (isRTL ? 'rtl' : 'ltr')}
        className="w-full h-11 md:h-12 rounded-[20px] border-gray-300 shadow-sm 
                 focus:border-blue-500 focus:ring-blue-500 
                 text-sm md:text-base px-4"
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
} 