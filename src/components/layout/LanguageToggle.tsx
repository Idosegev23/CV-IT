'use client';
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/theme/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="text-white/60 hover:text-white transition-colors"
      title={language === 'he' ? 'Switch to English' : 'החלף לעברית'}
    >
      <Languages className="w-5 h-5" />
    </Button>
  );
} 