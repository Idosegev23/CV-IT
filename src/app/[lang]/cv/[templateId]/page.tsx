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

interface TranslationPreview {
  original: any;
  translated: any;
  type: 'experience' | 'education' | 'skill' | 'language';
  index?: number;
  skillType?: 'technical' | 'soft';
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

const extractTranslation = (text: string, field: string): string => {
  const regex = new RegExp(`${field}:\\s*(.+)(?=\\n|$)`);
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};

const formatPreviewContent = (content: any): string => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.join('\n');
  if (typeof content === 'object') {
    return Object.entries(content)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
  return String(content);
};

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const supabase = createClientComponentClient();
  const [isTranslationPreviewOpen, setIsTranslationPreviewOpen] = useState(false);
  const [translationPreview, setTranslationPreview] = useState<TranslationPreview | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // בדיקת הרשאות עריכה בטעינת הדף
  useEffect(() => {
    const checkEditPermissions = async () => {
      if (!sessionId) return;
      
      const { data: cvData } = await supabase
        .from('cv_data')
        .select('is_editable, package')
        .eq('session_id', sessionId)
        .single();

      if (cvData) {
        localStorage.setItem('isEditable', String(cvData.is_editable));
        setIsEditing(cvData.is_editable);
      }
    };

    checkEditPermissions();
  }, [sessionId, supabase]);

  // בדיקת מצב העריכה בכל טעינת דף
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isEditable = localStorage.getItem('isEditable') === 'true';
      setIsEditing(isEditable);
    }
  }, []);

  useEffect(() => {
    console.log('Component mounted/updated with templateId:', templateId);
  }, [templateId]);

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
            technical: ((relevantData.skills?.[0] || {}).technical || []).map((skill: Skill) => ({
              name: skill.name || '',
              level: skill.level === 'Expert' ? 5 : skill.level === 'High' ? 4 : 3
            })),
            soft: ((relevantData.skills?.[0] || {}).soft || []).map((skill: Skill) => ({
              name: skill.name || '',
              level: skill.level === 'Expert' ? 5 : skill.level === 'High' ? 4 : 3
            })),
            languages: Object.entries(relevantData.languages || {}).map(([language, level]) => ({
              language: language || '',
              level: (level as string) || ''
            }))
          },
          military: relevantData.military_service ? {
            role: relevantData.military_service.role || '',
            unit: '',
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

  const handleTemplateChange = (newTemplateId: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.pathname = `/${interfaceLang}/cv/${newTemplateId}`;
    router.push(currentUrl.toString());
  };

  const handlePdfDownload = async () => {
    console.log('handlePdfDownload clicked', { 
      templateId, 
      interfaceLang,
      isMobile,
      elements: {
        cvContent: document.getElementById('cv-content'),
        mobilePdfContainer: document.getElementById('mobile-pdf-container'),
        desktopPdfContainer: document.getElementById('desktop-pdf-container')
      }
    });
    
    try {
      setIsDownloadingPdf(true);
      toast.info(interfaceLang === 'he' ? 'מכין PDF...' : 'Preparing PDF...');
      
      const element = document.getElementById('cv-content');
      if (!element) {
        console.error('CV content element not found, available elements:', {
          allElements: document.querySelectorAll('*'),
          byId: {
            cvContent: document.getElementById('cv-content'),
            mobilePdfContainer: document.getElementById('mobile-pdf-container'),
            desktopPdfContainer: document.getElementById('desktop-pdf-container')
          }
        });
        throw new Error('CV content element not found');
      }

      // המרת תמונות Next.js לתמונות רגילות
      const nextImages = element.querySelectorAll('img');
      console.log('Found images:', nextImages.length);

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

      // המתנה נוספת לוודא שכל התמונות נטענו
      await new Promise(resolve => setTimeout(resolve, 2000));

      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
          } catch (e) {
            console.warn('Error accessing stylesheet:', e);
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
        const errorText = await response.text();
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }

      const blob = await response.blob();
      const fileName = `${cvData?.personalInfo?.name || 'cv'}_${interfaceLang}.pdf`;
      
      // הורדה ישירה בכל המכשירים
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

  const translateText = async (text: string) => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const { translatedText } = await response.json();
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  };

  const handleTranslationPreview = async (text: string, type: 'experience' | 'education' | 'skill' | 'language') => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const { translatedText } = await response.json();
      setTranslationPreview({
        original: text,
        translated: translatedText,
        type
      });
      setIsTranslationPreviewOpen(true);
    } catch (error) {
      console.error('Translation preview error:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בתרגום' : 'Translation error');
    }
  };

  const handleTranslationConfirm = async () => {
    if (!translationPreview || !cvData) return;

    const { original, translated, type, index } = translationPreview;

    switch (type) {
      case 'experience':
        const updatedExperiences = [...cvData.experience];
        if (index !== undefined && updatedExperiences[index]) {
          updatedExperiences[index] = {
            ...updatedExperiences[index],
            position: translated.title,
            company: translated.company,
            description: translated.achievements
          };
          updateCVData({ experience: updatedExperiences });
        } else {
          updateCVData({
            experience: [
              ...cvData.experience,
              {
                position: translated.title,
                company: translated.company,
                startDate: translated.years.split('-')[0],
                endDate: translated.years.split('-')[1],
                description: translated.achievements
              }
            ]
          });
        }
        break;

      case 'education':
        const updatedEducation = [...cvData.education.degrees];
        if (index !== undefined && updatedEducation[index]) {
          updatedEducation[index] = {
            ...updatedEducation[index],
            type: translated.type,
            field: translated.field,
            institution: translated.institution,
            specialization: translated.specialization
          };
          updateCVData({ education: { degrees: updatedEducation } });
        } else {
          updateCVData({
            education: {
              degrees: [
                ...cvData.education.degrees,
                {
                  type: translated.type,
                  field: translated.field,
                  institution: translated.institution,
                  specialization: translated.specialization,
                  years: translated.years
                }
              ]
            }
          });
        }
        break;

      case 'skill':
        const skillType = translationPreview.skillType as 'technical' | 'soft';
        const updatedSkills = {
          ...cvData.skills,
          [skillType]: index !== undefined
            ? cvData.skills[skillType].map((skill, i) => 
                i === index ? { ...skill, name: translated.name } : skill
              )
            : [...cvData.skills[skillType], { name: translated.name, level: translated.level }]
        };
        updateCVData({ skills: updatedSkills });
        break;

      case 'language':
        const updatedSkillsWithLanguages = {
          ...cvData.skills,
          languages: [
            ...cvData.skills.languages,
            {
              language: translated.language,
              level: translated.level
            }
          ]
        };
        updateCVData({ skills: updatedSkillsWithLanguages });
        break;
    }

    setIsTranslationPreviewOpen(false);
    toast.success(
      interfaceLang === 'he'
        ? 'התרגום נשמר בהצלחה'
        : 'Translation saved successfully'
    );
  };

  const handleAddExperience = async (formData: FormData) => {
    try {
      const position = formData.get('position') as string;
      const company = formData.get('company') as string;
      const startDate = formData.get('startDate') as string;
      const endDate = formData.get('endDate') as string;
      const description = (formData.get('description') as string).split('\n').filter(Boolean);

      const translatedText = await translateText(
        `Position: ${position}\nCompany: ${company}\nDescription: ${description.join('\n')}`
      );

      setTranslationPreview({
        original: {
          position,
          company,
          startDate,
          endDate,
          description
        },
        translated: {
          title: extractTranslation(translatedText, 'Position'),
          company: extractTranslation(translatedText, 'Company'),
          years: `${startDate}-${endDate}`,
          achievements: extractTranslation(translatedText, 'Description').split('\n')
        },
        type: 'experience'
      });
      
      setIsTranslationPreviewOpen(true);
    } catch (error) {
      console.error('Error in experience preview:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בתצוגה מקדימה' : 'Preview error');
    }
  };

  const handleAddEducation = async (formData: FormData) => {
    try {
      const type = formData.get('type') as string;
      const field = formData.get('field') as string;
      const institution = formData.get('institution') as string;
      const specialization = formData.get('specialization') as string;

      await handleTranslationPreview(
        `Degree: ${type}\nField: ${field}\nInstitution: ${institution}${specialization ? `\nSpecialization: ${specialization}` : ''}`,
        'education'
      );
    } catch (error) {
      console.error('Error in education preview:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בתצוגה מקדימה' : 'Preview error');
    }
  };

  const handleAddSkill = async (formData: FormData, skillType: 'technical' | 'soft') => {
    try {
      const name = formData.get('name') as string;
      await handleTranslationPreview(`Skill: ${name}`, 'skill');
    } catch (error) {
      console.error('Error in skill preview:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בתצוגה מקדימה' : 'Preview error');
    }
  };

  const handleAddLanguage = async (formData: FormData) => {
    try {
      const language = formData.get('language') as string;
      const level = formData.get('level') as string;
      await handleTranslationPreview(`Language: ${language}\nLevel: ${level}`, 'language');
    } catch (error) {
      console.error('Error in language preview:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בתצוגה מקדימה' : 'Preview error');
    }
  };

  const handleEditExistingExperience = async (experience: Experience, index: number) => {
    try {
      const text = `Position: ${experience.position}\nCompany: ${experience.company}\nDescription: ${experience.description.join('\n')}`;
      const translatedText = await translateText(text);

      setTranslationPreview({
        original: experience,
        translated: {
          title: extractTranslation(translatedText, 'Position'),
          company: extractTranslation(translatedText, 'Company'),
          achievements: extractTranslation(translatedText, 'Description').split('\n'),
          years: `${experience.startDate}-${experience.endDate}`
        },
        type: 'experience',
        index
      });
      
      setIsTranslationPreviewOpen(true);
    } catch (error) {
      console.error('Error in experience edit:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בעריכה' : 'Edit error');
    }
  };

  const handleEditExistingEducation = async (education: Education, index: number) => {
    try {
      const text = `Type: ${education.type}\nField: ${education.field}\nInstitution: ${education.institution}${education.specialization ? `\nSpecialization: ${education.specialization}` : ''}`;
      const translatedText = await translateText(text);

      setTranslationPreview({
        original: education,
        translated: {
          type: extractTranslation(translatedText, 'Type'),
          field: extractTranslation(translatedText, 'Field'),
          institution: extractTranslation(translatedText, 'Institution'),
          specialization: education.specialization ? extractTranslation(translatedText, 'Specialization') : undefined,
          years: education.years
        },
        type: 'education',
        index
      });
      
      setIsTranslationPreviewOpen(true);
    } catch (error) {
      console.error('Error in education edit:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בעריכה' : 'Edit error');
    }
  };

  const handleEditExistingSkill = async (skill: Skill, type: 'technical' | 'soft', index: number) => {
    try {
      const translatedText = await translateText(`Skill: ${skill.name}`);

      setTranslationPreview({
        original: skill,
        translated: {
          name: extractTranslation(translatedText, 'Skill'),
          level: typeof skill.level === 'number' ? String(skill.level) : skill.level
        },
        type: 'skill',
        skillType: type,
        index
      });
      
      setIsTranslationPreviewOpen(true);
    } catch (error) {
      console.error('Error in skill edit:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בעריכה' : 'Edit error');
    }
  };

  const handleEditExistingLanguage = async (language: string, level: string) => {
    try {
      const translatedText = await translateText(`Language: ${language}\nLevel: ${level}`);

      setTranslationPreview({
        original: { language, level },
        translated: {
          language: extractTranslation(translatedText, 'Language'),
          level: extractTranslation(translatedText, 'Level')
        },
        type: 'language'
      });
      
      setIsTranslationPreviewOpen(true);
    } catch (error) {
      console.error('Error in language edit:', error);
      toast.error(interfaceLang === 'he' ? 'שגיאה בעריכה' : 'Edit error');
    }
  };

  const updateCVData = (newData: Partial<ResumeData>) => {
    setCvData(prevData => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        ...newData
      };
    });
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
        {/* תמונת סיום */}
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
          {/* הודעת הסבר */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-[#4856CD]">
              {interfaceLang === 'he' ? 'בואו נראה מה יצא!' : 'Let\'s see what we\'ve got!'}
            </h2>
            <p className="text-gray-600">
              {interfaceLang === 'he' 
                ? 'בחר תבנית והורד את קורות החיים שלך'
                : 'Choose a template and download your CV'}
            </p>
          </div>

          {/* בחירת תבנית */}
          <div className="w-full max-w-[300px] mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {templates.map((template) => {
                const isUnderConstruction = template.id === 'creative' || template.id === 'general';
                return (
                  <Button
                    key={template.id}
                    onClick={() => {
                      if (!isUnderConstruction) {
                        router.push(`/${interfaceLang}/cv/${template.id}?sessionId=${sessionId}`);
                      }
                    }}
                    disabled={isUnderConstruction}
                    className={`
                      relative px-4 py-2 rounded-full transition-all duration-300 w-full
                      ${templateId === template.id 
                        ? 'bg-[#4856CD] text-white'
                        : isUnderConstruction
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-white text-[#4856CD] border-2 border-[#4856CD]'
                      }
                    `}
                  >
                    {template.name[interfaceLang as keyof typeof template.name]}
                    {isUnderConstruction && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full transform rotate-12">
                        {interfaceLang === 'he' ? 'בבנייה' : 'Under Construction'}
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="w-full flex flex-col gap-4">
            {/* כפתור הורדה */}
            <Button
              onClick={handlePdfDownload}
              disabled={isDownloadingPdf}
              className="w-full max-w-[300px] mx-auto bg-[#4856CD] hover:opacity-90 h-14 rounded-full text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              {isDownloadingPdf ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {interfaceLang === 'he' ? 'מכין...' : 'Preparing...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-5 w-5" />
                  {interfaceLang === 'he' ? 'הורד PDF' : 'Download PDF'}
                </div>
              )}
            </Button>

            {/* כפתור המשך */}
            <Link href={`/${interfaceLang}/finish/${sessionId}`} className="w-full max-w-[300px] mx-auto">
              <Button 
                className="w-full bg-[#C287EB] hover:opacity-90 h-14 text-lg font-bold rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                {interfaceLang === 'he' ? 'יאללה ממשיכים' : 'Continue'}
              </Button>
            </Link>
          </div>
        </div>

        {/* תצוגה מוסתרת של ה-CV לצורך ייצוא PDF בלבד */}
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

  console.log('Rendering desktop template:', { templateId, interfaceLang });
  return (
    <div id="desktop-container" className="min-h-screen flex flex-col items-center justify-start pt-8" style={{ background: '#EAEAE7' }} dir={interfaceLang === 'he' ? 'rtl' : 'ltr'}>
      {/* Finish image */}
      <div className="w-full flex justify-center mb-8">
        <Image
          src="/design/finish.svg"
          alt={interfaceLang === 'he' ? 'סיום' : 'Finish'}
          width={180}
          height={190}
          className="mx-auto"
        />
      </div>

      {/* Template Switcher */}
      {!isMobile && (
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
      )}

      <div id="desktop-pdf-container" className="container mx-auto px-4 py-8">
        <div 
          id="cv-container"
          style={{ 
            width: '210mm',
            minHeight: '297mm',
            position: 'absolute',
            left: '-9999px',
            top: 0,
            background: 'white'
          }}
        >
          <div id="cv-content">
            <CVTemplate
              templateId={templateId}
              data={cvData}
              lang={interfaceLang}
            />
          </div>
        </div>

        <div id="desktop-preview" className="relative">
          <div 
            className="mx-auto bg-white shadow-lg"
            style={{
              width: '210mm',
              minHeight: '297mm',
              transformOrigin: 'top center'
            }}
          >
            {/* כפתורי עריכה לתוכן קיים */}
            {isEditing && (
              <div className="absolute left-4 top-4 flex flex-col gap-4 z-50">
                {cvData.experience.map((exp, index) => (
                  <Button
                    key={`exp-${index}`}
                    onClick={() => handleEditExistingExperience(exp, index)}
                    className="bg-black/90 hover:bg-black text-white shadow-sm"
                  >
                    {interfaceLang === 'he' ? 'ערוך ניסיון' : 'Edit Experience'} {index + 1}
                  </Button>
                ))}
                
                {cvData.education.degrees.map((edu, index) => (
                  <Button
                    key={`edu-${index}`}
                    onClick={() => handleEditExistingEducation(edu, index)}
                    className="bg-black/90 hover:bg-black text-white shadow-sm"
                  >
                    {interfaceLang === 'he' ? 'ערוך השכלה' : 'Edit Education'} {index + 1}
                  </Button>
                ))}
                
                {cvData.skills.technical.map((skill, index) => (
                  <Button
                    key={`tech-${index}`}
                    onClick={() => handleEditExistingSkill(skill, 'technical', index)}
                    className="bg-black/90 hover:bg-black text-white shadow-sm"
                  >
                    {interfaceLang === 'he' ? 'ערוך כישור טכני' : 'Edit Technical Skill'} {index + 1}
                  </Button>
                ))}
                
                {cvData.skills.soft.map((skill, index) => (
                  <Button
                    key={`soft-${index}`}
                    onClick={() => handleEditExistingSkill(skill, 'soft', index)}
                    className="bg-black/90 hover:bg-black text-white shadow-sm"
                  >
                    {interfaceLang === 'he' ? 'ערוך כישור רך' : 'Edit Soft Skill'} {index + 1}
                  </Button>
                ))}
                
                {cvData.skills.languages.map((lang, index) => (
                  <Button
                    key={`lang-${index}`}
                    onClick={() => handleEditExistingLanguage(lang.language, lang.level)}
                    className="bg-black/90 hover:bg-black text-white shadow-sm"
                  >
                    {interfaceLang === 'he' ? 'ערוך שפה' : 'Edit Language'} {index + 1}
                  </Button>
                ))}
              </div>
            )}
            
            <CVTemplate
              templateId={templateId}
              data={cvData}
              lang={interfaceLang}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            {isEditing ? (
              <X className="h-6 w-6" />
            ) : (
              <Edit2 className="h-6 w-6" />
            )}
          </Button>
          <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
            {isEditing ? (interfaceLang === 'he' ? 'סיום עריכה' : 'Finish Editing') : (interfaceLang === 'he' ? 'עריכה' : 'Edit')}
          </span>
        </div>

        {isEditing && (
          <div className="flex flex-col gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center gap-2">
                  <Button className="bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                    {interfaceLang === 'he' ? 'הוסף ניסיון תעסוקתי' : 'Add Experience'}
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {interfaceLang === 'he' ? 'הוספת ניסיון תעסוקתי' : 'Add Experience'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddExperience(new FormData(e.currentTarget));
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        {interfaceLang === 'he' ? 'תפקיד' : 'Position'}
                      </label>
                      <Input name="position" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {interfaceLang === 'he' ? 'חברה' : 'Company'}
                      </label>
                      <Input name="company" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">
                          {interfaceLang === 'he' ? 'שנת התחלה' : 'Start Year'}
                        </label>
                        <Input name="startDate" type="number" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          {interfaceLang === 'he' ? 'שנת סיום' : 'End Year'}
                        </label>
                        <Input name="endDate" type="number" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        {interfaceLang === 'he' ? 'תיאור התפקיד' : 'Description'}
                      </label>
                      <Textarea name="description" required />
                    </div>
                    <Button type="submit" className="w-full">
                      {interfaceLang === 'he' ? 'שמור' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center gap-2">
                  <Button className="bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                    {interfaceLang === 'he' ? 'הוסף השכלה' : 'Add Education'}
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddEducation(new FormData(e.currentTarget));
                }}>
                  {/* תוכן הפורם זהה למקור */}
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center gap-2">
                  <Button className="bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                    {interfaceLang === 'he' ? 'הוסף כישור טכני' : 'Add Technical Skill'}
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSkill(new FormData(e.currentTarget), 'technical');
                }}>
                  {/* תוכן הפורם זהה למקור */}
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center gap-2">
                  <Button className="bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                    {interfaceLang === 'he' ? 'הוסף כישור רך' : 'Add Soft Skill'}
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSkill(new FormData(e.currentTarget), 'soft');
                }}>
                  {/* תוכן הפורם זהה למקור */}
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center gap-2">
                  <Button className="bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                    {interfaceLang === 'he' ? 'הוסף שפה' : 'Add Language'}
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddLanguage(new FormData(e.currentTarget));
                }}>
                  {/* תוכן הפורם זהה למקור */}
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

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
            {interfaceLang === 'he' ? 'הורדת קובץ PDF' : 'Download PDF'}
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
            {interfaceLang === 'he' ? 'מה כשיו?' : 'What now?'}
          </span>
        </div>
      </div>

      <Dialog open={isTranslationPreviewOpen} onOpenChange={setIsTranslationPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {interfaceLang === 'he' ? 'תצוגה מקדימה של התרגום' : 'Translation Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">
                {interfaceLang === 'he' ? 'טקסט מקורי' : 'Original Text'}
              </h3>
              <div className="p-4 bg-gray-100 rounded-lg min-h-[100px] whitespace-pre-wrap">
                {formatPreviewContent(translationPreview?.original)}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">
                {interfaceLang === 'he' ? 'תרגום' : 'Translation'}
              </h3>
              <div className="p-4 bg-gray-100 rounded-lg min-h-[100px] whitespace-pre-wrap">
                {formatPreviewContent(translationPreview?.translated)}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={() => setIsTranslationPreviewOpen(false)}
              variant="outline"
            >
              {interfaceLang === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button
              onClick={handleTranslationConfirm}
            >
              {interfaceLang === 'he' ? 'אישור ושמירה' : 'Confirm & Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 