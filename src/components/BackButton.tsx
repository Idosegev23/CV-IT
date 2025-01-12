'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Utility function for conditional class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface BackButtonProps {
  isRTL: boolean;
  className?: string;
}

export function BackButton({ isRTL, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-[#4856CD] text-white hover:bg-[#4856CD]/90 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[#4856CD]/50",
        isRTL ? "flex-row-reverse" : "flex-row",
        className
      )}
      aria-label={isRTL ? 'חזור לדף הקודם' : 'Go back to previous page'}
    >
      {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
      <span className="text-sm font-medium">
        {isRTL ? 'חזרה' : 'Back'}
      </span>
    </button>
  );
} 