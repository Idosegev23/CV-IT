import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isRTL: boolean;
}

const stepTitles = {
  he: [
    'פרטים\nבסיסיים',
    'חוזקות\nמקצועיות',
    'ניסיון\nתעסוקתי',
    'השכלה\nוהכשרה',
    'כישורים\nומיומנויות',
    'שפות נוספות',
    'שירות\nצבאי',
    'תפקיד\nמבוקש'
  ],
  en: [
    'Basic\nDetails',
    'Professional\nSkills',
    'Work\nExperience',
    'Education',
    'Skills',
    'Languages',
    'Military\nService',
    'Desired\nPosition'
  ]
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  isRTL
}) => (
  <div className="flex justify-center w-full mb-8">
    <div className="flex items-center justify-center px-4 pb-6">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center relative">
          <div className="relative w-[20px] h-[20px] md:w-[33px] md:h-[33px]">
            {index === currentStep - 1 ? (
              <Image
                src="/design/currentB.svg"
                alt={`שלב נוכחי ${index + 1} מתוך ${totalSteps}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 20px, 33px"
                priority={index === currentStep - 1}
              />
            ) : index < currentStep - 1 ? (
              <Image
                src="/design/pastB.svg"
                alt={`שלב ${index + 1} הושלם`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 20px, 33px"
              />
            ) : (
              <Image
                src="/design/futureB.svg"
                alt={`שלב ${index + 1} עתידי`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 20px, 33px"
              />
            )}
            <span className={cn(
              "absolute -bottom-6 left-1/2 -translate-x-1/2",
              "text-[8px]",
              "transition-colors duration-300",
              "whitespace-pre-line md:whitespace-nowrap text-center",
              "max-w-[40px] md:max-w-none",
              "leading-tight",
              index <= currentStep - 1 ? "text-[#4856CD]" : "text-gray-400"
            )}>
              {stepTitles[!isRTL ? 'he' : 'en'][index]}
            </span>
          </div>

          {index < totalSteps - 1 && (
            <div className={cn(
              "relative",
              "h-[3px] md:h-[5px]",
              "w-[25px] md:w-[46px]",
              "-mx-[2px]",
              index < currentStep - 1 ? "bg-[#E5E7F0]" : "bg-transparent",
              "overflow-hidden"
            )}>
              {index < currentStep - 1 && (
                <div
                  className={cn(
                    "absolute inset-0",
                    "bg-[#4856CD]",
                    "animate-progressFill"
                  )}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);