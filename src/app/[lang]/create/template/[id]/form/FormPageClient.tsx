'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionForm } from '@/components/QuestionForm';
import { questions } from '@/lib/questions';
import { ResumeData } from '@/types/resume';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface FormPageClientProps {
  initialLang: string;
  initialId: string;
  initialData: ResumeData;
}

interface CVAnalysis {
  level: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT';
  market: 'TECH' | 'FINANCE' | 'MARKETING' | 'OPERATIONS' | 'HR' | 'SALES' | 'OTHER';
  cv_info: {
    full_name: string;
    city: string;
    phone: string;
    email: string;
    last_position: string;
    years_in_last_position: number;
    relevant_positions: string[];
    job_search_area: string;
  };
}

const CV_ANALYSIS_PROMPT = `
אתה מומחה לניתוח קורות חיים וגיוס. נתח את קורות החיים ותן לי את המידע הבא:

1. רמת המועמד (level):
   - JUNIOR: 0-2 שנות ניסיון
   - MID: 3-5 שנות ניסיון
   - SENIOR: 6-8 שנות ניסיון
   - EXPERT: 9+ שנות ניסיון

2. שוק העבודה הרלוונטי (market):
   - TECH: הייטק ופיתוח
   - FINANCE: פיננסים ובנקאות
   - MARKETING: שיווק ופרסום
   - OPERATIONS: תפעול ולוגיסטיקה
   - HR: משאבי אנוש
   - SALES: מכירות
   - OTHER: אחר

3. מידע נוסף (cv_info):
   - full_name: שם מלא
   - city: עיר מגורים
   - phone: טלפון
   - email: מייל
   - last_position: תפקיד אחרון
   - years_in_last_position: שנות ניסיון בתפקיד אחרון
   - relevant_positions: תפקידים רלוונטיים (מערך)
   - job_search_area: אזור חיפוש עבודה

החזר את התוצאה כאובייקט JSON בפורמט הבא:
{
  "level": "JUNIOR" | "MID" | "SENIOR" | "EXPERT",
  "market": "TECH" | "FINANCE" | "MARKETING" | "OPERATIONS" | "HR" | "SALES" | "OTHER",
  "cv_info": {
    "full_name": string,
    "city": string,
    "phone": string,
    "email": string,
    "last_position": string,
    "years_in_last_position": number,
    "relevant_positions": string[],
    "job_search_area": string
  }
}
`;

export default function FormPageClient({ 
  initialLang, 
  initialId,
  initialData 
}: FormPageClientProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleFormComplete = async (answers: Record<string, string>): Promise<void> => {
    try {
      console.log('Form completed:', answers);
      setFormData(answers);

      // נמירת קורות החיים וניתוח באמצעות Claude
      const response = await fetch('/api/save-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          sessionId: initialId,
          language: initialLang,
          shouldAnalyze: true // מפעיל את הניתוח
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save CV data');
      }

      const { analysis } = await response.json();

      // שמירת תוצאות הניתוח ב-Supabase
      if (analysis) {
        const { error: updateError } = await supabase
          .from('cv_data')
          .update({
            market: analysis.market,
            level: analysis.level,
            metadata: {
              ...analysis.cv_info,
              desiredPosition: answers.desired_position || ''
            }
          })
          .eq('session_id', initialId);

        if (updateError) {
          throw updateError;
        }
      }

      console.log('✅ CV data saved successfully, redirecting to payment...');
      router.push(`/${initialLang}/payment`);

    } catch (error) {
      console.error('Error saving form data:', error);
      toast.error(
        initialLang === 'he' 
          ? 'אירעה שגיאה בשמירת הנתונים' 
          : 'Error saving data'
      );
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEAE7]">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <main className="pt-24 pb-16">
          <QuestionForm
            questions={questions.map(q => ({...q, id: q.key}))}
            onComplete={handleFormComplete}
            lang={initialLang as 'he' | 'en'}
            sessionId={initialId}
          />
        </main>
      </div>
    </div>
  );
} 