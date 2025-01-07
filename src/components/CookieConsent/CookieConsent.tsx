'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

const content = {
  he: {
    title: 'אנחנו משתמשים בעוגיות 🍪',
    description: 'אנחנו משתמשים בעוגיות כדי לשפר את חווית המשתמש שלך באתר. העוגיות מאפשרות לנו לספק לך שירות טוב יותר ולהבין כיצד אתה משתמש באתר.',
    acceptButton: 'מסכים',
    rejectButton: 'לא מסכים',
    privacyLink: 'מדיניות פרטיות',
  },
  en: {
    title: 'We use cookies 🍪',
    description: 'We use cookies to enhance your browsing experience. Cookies help us provide you with better service and understand how you use our site.',
    acceptButton: 'Accept',
    rejectButton: 'Decline',
    privacyLink: 'Privacy Policy',
  }
};

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [lang, setLang] = useState('he');

  useEffect(() => {
    setMounted(true);
    setLang(document.documentElement.lang || 'he');
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('cookieConsent', 'accepted');
      setIsVisible(false);
    }, 300);
  };

  const handleReject = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('cookieConsent', 'rejected');
      setIsVisible(false);
    }, 300);
  };

  if (!mounted || !isVisible) return null;

  const currentContent = content[lang as keyof typeof content];
  const isRTL = lang === 'he';

  const element = (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 transition-all duration-300 ease-in-out ${
        isExiting ? 'translate-y-[100px] opacity-0' : 'translate-y-0 opacity-100'
      }`}
      role="dialog"
      aria-labelledby="cookie-consent-title"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
          <h2 
            id="cookie-consent-title"
            className="text-xl font-bold text-gray-800 mb-2"
          >
            {currentContent.title}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {currentContent.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={handleAccept}
              className="w-full sm:w-auto px-6 py-2 bg-[#4856CD] text-white rounded-full hover:bg-[#4856CD]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4856CD]/50 focus:ring-offset-2"
              aria-label={currentContent.acceptButton}
            >
              {currentContent.acceptButton}
            </button>
            
            <button
              onClick={handleReject}
              className="w-full sm:w-auto px-6 py-2 bg-[#B78BE6] text-white rounded-full hover:bg-[#B78BE6]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B78BE6]/50 focus:ring-offset-2"
              aria-label={currentContent.rejectButton}
            >
              {currentContent.rejectButton}
            </button>

            <Link
              href={`/${lang}/terms`}
              className="text-sm text-gray-500 hover:text-[#4856CD] transition-colors"
            >
              {currentContent.privacyLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const portalRoot = document.getElementById('cookie-consent-root');
  if (!portalRoot) return null;

  return createPortal(element, portalRoot);
} 