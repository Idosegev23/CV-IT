'use client';

import React, { useEffect, useState } from 'react';
import { CVTemplate } from '@/components/CVTemplates';
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import { templates } from '@/components/CVTemplates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { LoadingModal } from '@/components/LoadingModal';
import { getDictionary } from '@/dictionaries';
import { ResumeData } from '@/types/resume';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/theme/ui/button';
import { Loader2, Eye, Download, LayoutTemplate, X, Edit2, Plus } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/theme/ui/dialog';
import { Input } from "@/components/theme/ui/input";
import { Textarea } from "@/components/theme/ui/textarea";
import { BackButton } from '@/components/BackButton';

interface PageProps {
  params: Promise<{
    lang: string;
    templateId: string;
  }>;
}

interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string[];
  title?: string;
  years?: string;
  achievements?: string[];
}

interface Education {
  type: string;
  field: string;
  years: string;
  institution: string;
  specialization?: string;
}

interface Skill {
  name: string;
  level: string | number;
}

interface CVData {
  personal_details: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  professional_summary: string;
  experience: Experience[];
  education: {
    degrees: Education[];
  };
  skills: {
    technical: Skill[];
    soft: Skill[];
  };
  languages: Record<string, string>;
  military_service?: {
    role: string;
    years: string;
    achievements: string[];
  };
}

const renderTemplate = (templateId: string, data: ResumeData, lang: string) => {
  return (
    <CVTemplate
      templateId={templateId}
      data={data}
      lang={lang}
    />
  );
};

// סגנונות חדשים למובייל
const mobileStyles = `
  .mobile-preview {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
    transform: scale(0.98);
    transform-origin: top center;
  }

  .mobile-preview-content {
    width: 100%;
    height: auto;
    aspect-ratio: 210/297;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 16px;
  }

  .mobile-preview-content::-webkit-scrollbar {
    width: 6px;
  }

  .mobile-preview-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .mobile-preview-content::-webkit-scrollbar-thumb {
    background: rgba(72, 86, 205, 0.3);
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  .mobile-preview-content::-webkit-scrollbar-thumb:hover {
    background: rgba(72, 86, 205, 0.5);
  }
`;

// הוספת הסגנונות לראש המסמך
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = mobileStyles;
  document.head.appendChild(style);
}

export default function CVPage({ params }: PageProps) {
  const resolvedParams = React.use(params) as { lang: string; templateId: string };
  const { lang: interfaceLang, templateId } = resolvedParams;
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('sessionId') ?? null;
  const [cvData, setCvData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const supabase = createClientComponentClient();

  // טעינת נתונים ראשונית
  useEffect(() => {
    const loadData = async () => {
      try {
        const dict = await getDictionary(interfaceLang);
        setDictionary(dict);

        if (!sessionId) {
          throw new Error('No session ID found');
        }

        const { data, error } = await supabase
          .from('cv_data')
          .select('format_cv, en_format_cv')
          .eq('session_id', sessionId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        const relevantData = data.en_format_cv || data.format_cv;
        
        if (!relevantData) {
          throw new Error('No CV data found');
        }

        const formattedData: ResumeData = {
          personalInfo: {
            name: relevantData.personal_details?.name || '',
            title: '',
            email: relevantData.personal_details?.email || '',
            phone: relevantData.personal_details?.phone || '',
            address: relevantData.personal_details?.address || '',
            summary: relevantData.professional_summary || ''
          },
          experience: (relevantData.experience || []).map((exp: Experience) => ({
            position: exp.title || '',
            company: exp.company || '',
            startDate: (exp.years || '').split('-')[0] || '',
            endDate: (exp.years || '').split('-')[1] || '',
            description: exp.achievements || []
          })),
          education: {
            degrees: ((relevantData.education || {}).degrees || []).map((edu: Education) => ({
              type: edu.type || '',
              field: edu.field || '',
              institution: edu.institution || '',
              years: edu.years || '',
              specialization: edu.specialization || ''
            }))
          },
          skills: {
            technical: ((relevantData.skills || {}).technical || []).map((skill: Skill) => ({
              name: skill.name || '',
              level: skill.level === 'Expert' ? 5 : skill.level === 'High' ? 4 : 3
            })),
            soft: ((relevantData.skills || {}).soft || []).map((skill: Skill) => ({
              name: skill.name || '',
              level: skill.level === 'Expert' ? 5 : skill.level === 'High' ? 4 : 3
            })),
            languages: ((relevantData.skills || {}).languages || []).map((lang: any) => ({
              language: lang.language || '',
              level: lang.level || ''
            }))
          },
          military: relevantData.military_service ? {
            role: relevantData.military_service.role || '',
            unit: relevantData.military_service.unit || 'IDF',
            startDate: (relevantData.military_service.years || '').split('-')[0] || '',
            endDate: (relevantData.military_service.years || '').split('-')[1] || '',
            description: relevantData.military_service.achievements || []
          } : undefined,
          template: templateId,
          references: [],
          lang: 'en',
          interfaceLang: interfaceLang
        };

        console.log('Formatted data:', formattedData);
        setCvData(formattedData);
      } catch (error) {
        console.error('Error loading CV data:', error);
        toast.error(interfaceLang === 'he' ? 'שגיאה בטעינת נתונים' : 'Error loading CV data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [interfaceLang, sessionId, supabase, templateId]);

  const handlePdfDownload = async () => {
    try {
      setIsDownloadingPdf(true);
      toast.info(interfaceLang === 'he' ? 'מכין PDF...' : 'Preparing PDF...');
      
      const element = document.getElementById('cv-content');
      if (!element) {
        throw new Error('CV content element not found');
      }

      const nextImages = element.querySelectorAll('img');
      await Promise.all(Array.from(nextImages).map(async (img) => {
        try {
          const originalSrc = img.getAttribute('src');
          if (!originalSrc || originalSrc.startsWith('data:')) return;

          const response = await fetch(originalSrc);
          if (!response.ok) throw new Error(`Failed to fetch image: ${originalSrc}`);

          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') resolve(reader.result);
            };
            reader.readAsDataURL(blob);
          });

          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          img.src = base64;
          
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        } catch (error) {
          console.error('Failed to convert image:', error);
        }
      }));

      await new Promise(resolve => setTimeout(resolve, 2000));

      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      const html = `
        <!DOCTYPE html>
        <html lang="${interfaceLang}" dir="${interfaceLang === 'he' ? 'rtl' : 'ltr'}">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
              ${styles}
              @page {
                size: A4;
                margin: 0;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                width: 210mm;
                min-height: 297mm;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              #cv-content {
                width: 210mm !important;
                min-height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
                position: relative !important;
                background: white !important;
                transform: none !important;
                zoom: 1 !important;
              }
              img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                object-fit: contain !important;
              }
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          html,
          fileName: `${cvData?.personalInfo?.name || 'cv'}_${interfaceLang}`,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const fileName = `${cvData?.personalInfo?.name || 'cv'}_${interfaceLang}.pdf`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(
        interfaceLang === 'he' 
          ? 'קורות החיים נוצרו בהצלחה' 
          : 'CV created successfully'
      );
    } catch (error) {
      console.error('Error in handlePdfDownload:', error);
      toast.error(
        interfaceLang === 'he' 
          ? 'שגיאה בהכנת קורות החיים' 
          : 'Error preparing CV'
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!['he', 'en'].includes(interfaceLang)) {
    console.error('Invalid language:', interfaceLang);
    notFound();
  }

  const validTemplate = templates.find(t => t.id === templateId);
  if (!validTemplate) {
    console.error('Invalid template:', templateId);
    notFound();
  }

  if (isLoading || !dictionary) {
    return <LoadingModal isOpen={true} lang={interfaceLang} dictionary={dictionary} />;
  }

  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">
            {interfaceLang === 'he' ? 'לא נמצאו נתונים' : 'No CV data found'}
          </h1>
          <p className="text-gray-600">
            {interfaceLang === 'he' 
              ? 'לא מצאו נתוני קורות חיים. אנא נסה ליצור קורות חיים חדשים.'
              : 'No CV data found. Please try creating a new CV.'}
          </p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-8 bg-[#EAEAE7]">
        <div className="w-full flex justify-center mb-8">
          <Image
            src="/design/finish.svg"
            alt={interfaceLang === 'he' ? 'סיום' : 'Finish'}
            width={180}
            height={190}
            className="mx-auto"
          />
        </div>

        <div className="container px-4 py-8 flex flex-col items-center justify-center w-full max-w-[800px]">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-[#4856CD]">
              {interfaceLang === 'he' ? 'וואו! איזה קורות חיים מדהימים!' : 'Wow! What an amazing CV!'}
            </h2>
            <p className="text-gray-600">
              {interfaceLang === 'he' 
                ? 'עכשיו נשאר רק להוריד ולהתחיל לשלוח'
                : 'Now just download and start sending it'}
            </p>
          </div>

          {/* תחירת תבנית - מותאם למובייל */}
          <div className="w-full max-w-[400px] mb-8 px-4">
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  onClick={() => router.push(`/${interfaceLang}/cv/${template.id}?sessionId=${sessionId}`)}
                  className={`
                    relative px-4 py-2 rounded-full transition-all duration-300 w-full
                    ${templateId === template.id 
                      ? 'bg-[#4856CD] text-white'
                      : 'bg-transparent text-[#4856CD] border-2 border-[#4856CD] hover:bg-[#4856CD]/5'
                    }
                  `}
                >
                  {template.name[interfaceLang as keyof typeof template.name]}
                </Button>
              ))}
            </div>
          </div>

          {/* תצוגה מקדימה למובייל */}
          <div className="w-full max-w-md mx-auto px-4 mb-8">
            <div className="mobile-preview bg-white rounded-2xl shadow-lg overflow-hidden border border-[#4856CD]/10">
              <div className="bg-gradient-to-r from-[#4856CD]/5 to-[#4856CD]/10 p-3 flex items-center justify-between border-b border-[#4856CD]/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="text-xs font-medium text-gray-600">
                  {cvData.personalInfo.name || 'CV Preview'}
                </div>
              </div>

              <div className="relative">
                <div 
                  className="mobile-preview-content"
                  style={{ 
                    height: 'calc(100vh - 280px)',
                    maxHeight: '700px',
                    WebkitOverflowScrolling: 'touch',
                    transform: 'scale(0.98)',
                    transformOrigin: 'top center',
                    aspectRatio: '210/297'
                  }}
                >
                  <div id="cv-content-mobile" className="bg-white relative">
                    <CVTemplate
                      templateId={templateId}
                      data={cvData}
                      lang={interfaceLang}
                    />
                  </div>
                </div>

                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <Button
              onClick={handlePdfDownload}
              disabled={isDownloadingPdf}
              className="w-full max-w-[300px] mx-auto bg-[#4856CD] hover:opacity-90 h-14 rounded-full text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              {isDownloadingPdf ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {interfaceLang === 'he' ? 'רגע, מכין משהו מיוחד...' : 'Just a moment, preparing something special...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-5 w-5" />
                  {interfaceLang === 'he' ? 'הורדת קורות החיים' : 'Download your CV'}
                </div>
              )}
            </Button>

            <Link href={`/${interfaceLang}/finish/${sessionId}`} className="w-full max-w-[300px] mx-auto">
              <Button 
                className="w-full bg-[#C287EB] hover:opacity-90 h-14 text-lg font-bold rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                {interfaceLang === 'he' ? 'למסך הסיום' : 'To finish screen'}
              </Button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'none', position: 'absolute', left: '-9999px' }}>
          <div id="cv-content">
            <CVTemplate
              templateId={templateId}
              data={cvData}
              lang={interfaceLang}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEAE7]">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <BackButton isRTL={interfaceLang === 'he'} />
      </div>

      <div className="container px-4 py-8 flex flex-col items-center justify-center w-full max-w-[800px]">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-[#4856CD]">
            {interfaceLang === 'he' ? 'וואו! איזה קורות חיים מדהימים!' : 'Wow! What an amazing CV!'}
          </h2>
          <p className="text-gray-600">
            {interfaceLang === 'he' 
              ? 'עכשיו נשאר רק להוריד ולהתחיל לשלוח'
              : 'Now just download and start sending it'}
          </p>
        </div>

        {/* בחירת תבנית - דסקטופ */}
        <div className="w-full max-w-[800px] mb-8 px-4">
          <div className="flex h-[57px] w-full border-2 border-[#4856CD] rounded-full overflow-hidden shadow-lg">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                className={`
                  flex-1 
                  relative 
                  ${index !== templates.length - 1 ? 'border-r-2 border-[#4856CD]' : ''}
                `}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => router.push(`/${interfaceLang}/cv/${template.id}?sessionId=${sessionId}`)}
                  className={`
                    w-full 
                    h-full 
                    text-base 
                    font-rubik 
                    rounded-none
                    transition-all
                    duration-300
                    flex
                    items-center
                    justify-center
                    ${templateId === template.id 
                      ? 'bg-[#4856CD] text-white'
                      : 'bg-transparent text-[#4856CD] hover:bg-[#4856CD]/5'
                    }
                  `}
                >
                  {template.name[interfaceLang as keyof typeof template.name]}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        <div id="cv-content">
          <CVTemplate
            templateId={templateId}
            data={cvData}
            lang={interfaceLang}
          />
        </div>

        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePdfDownload}
              disabled={isDownloadingPdf}
              className="bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              {isDownloadingPdf ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Download className="h-6 w-6" />
              )}
            </Button>
            <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
              {interfaceLang === 'he' ? 'הורדת קורות החיים' : 'Download your CV'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/${interfaceLang}/finish/${sessionId}`}>
              <Button 
                className="bg-[#C287EB] hover:opacity-90 p-4 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <LayoutTemplate className="h-6 w-6" />
              </Button>
            </Link>
            <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
              {interfaceLang === 'he' ? 'למסך הסיום' : 'To finish screen'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 