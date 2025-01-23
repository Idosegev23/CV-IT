'use client';

import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ClassicTemplate from '../CVTemplates/ClassicTemplate';
import ProfessionalTemplate from '../CVTemplates/ProfessionalTemplate';
import GeneralTemplate from '../CVTemplates/GeneralTemplate';
import CreativeTemplate from '../CVTemplates/CreativeTemplate';
import { TextEditor } from '@/components/TextEditor/page';
import { ResumeData } from '@/types/resume';
import { getDictionary } from '@/dictionaries';
import { Button } from '@/components/theme/ui/button';
import { Edit2, Eye, Download, FileText, Loader2, Menu, X, Globe, LayoutTemplate, Plus, Briefcase, GraduationCap, Languages, Wrench, Star, CheckCircle2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dictionary } from '@/dictionaries/dictionary';
import { useAppStore } from '@/lib/store';
import { useMediaQuery } from '@/hooks/use-media-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LoadingModal } from '../LoadingModal';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/theme/ui/dialog";
import { Input } from "@/components/theme/ui/input";
import { Textarea } from "@/components/theme/ui/textarea";
import { cn } from "@/lib/utils";
import ReactDOM from 'react-dom/client';
import ReactDOMServer from 'react-dom/server';
import { useRouter } from 'next/navigation';
import { EditPopup } from '../EditableFields/EditPopup';
import { AddItemPopup } from '../EditableFields/AddItemPopup';
import { UpgradePaymentModal } from '@/components/PaymentModal/UpgradePaymentModal';
import { PACKAGE_PRICES } from '@/lib/constants';
import type { Package } from '@/lib/store';
import { CVTutorialSteps } from '../cv/CVTutorialSteps';

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

interface CVDisplayProps {
  sessionId: string;
  lang: string;
  hideButtons?: boolean;
}

const templateComponents = {
  classic: ClassicTemplate,
  professional: ProfessionalTemplate,
  general: GeneralTemplate,
  creative: CreativeTemplate
};

const transformResumeData = (rawData: any): ResumeData => {
  return {
    personalInfo: {
      name: rawData.personal_details?.name || '',
      title: rawData.personal_details?.title || '',
      email: rawData.personal_details?.email || '',
      phone: rawData.personal_details?.phone || '',
      address: rawData.personal_details?.address || '',
      linkedin: rawData.personal_details?.linkedin || '',
      summary: rawData.professional_summary || ''
    },
    experience: (rawData.experience || []).map((exp: any) => ({
      position: exp.title || '',
      company: exp.company || '',
      startDate: exp.years?.split('-')[0] || '',
      endDate: exp.years?.split('-')[1] || '',
      description: exp.achievements || []
    })),
    education: {
      degrees: (rawData.education?.degrees || []).map((deg: any) => ({
        type: deg.type || '',
        field: deg.field || '',
        institution: deg.institution || '',
        years: deg.years || '',
        specialization: deg.specialization || ''
      }))
    },
    skills: {
      technical: (rawData.skills?.technical || []).map((skill: any) => ({
        name: skill.name || '',
        level: skill.level
      })),
      soft: (rawData.skills?.soft || []).map((skill: any) => ({
        name: skill.name || '',
        level: skill.level
      })),
      languages: Object.entries(rawData.languages || {}).map(([language, level]) => ({
        language,
        level: level as string
      }))
    },
    template: rawData.template_id || 'modern',
    references: [],
    lang: rawData.lang || 'he',
    interfaceLang: rawData.interfaceLang || 'he',
    military: rawData.military_service ? {
      role: rawData.military_service.role,
      unit: 'צה"ל',
      startDate: rawData.military_service.years.split('-')[0],
      endDate: rawData.military_service.years.split('-')[1],
      description: rawData.military_service.achievements
    } : undefined
  };
};

const MobilePreview: React.FC<{ 
  data: ResumeData;
  lang: string;
  template: keyof typeof templateComponents;
  dictionary: Dictionary;
}> = ({ data, lang, template, dictionary }) => {
  const TemplateComponent = templateComponents[template];
  
  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* כותרת מעל התצוגה המקדימה */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">
          {lang === 'he' ? 'תצוגה מקדימה' : 'Preview'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {lang === 'he' ? 'גלול למטה לצפייה בכל הקורות חיים' : 'Scroll down to view the entire CV'}
        </p>
      </div>

      {/* מסגרת מעוצבת */}
      <div className="mobile-preview bg-white rounded-2xl shadow-lg overflow-hidden border border-[#4856CD]/10">
        {/* סרגל עליון */}
        <div className="bg-gradient-to-r from-[#4856CD]/5 to-[#4856CD]/10 p-3 flex items-center justify-between border-b border-[#4856CD]/10">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          </div>
          <div className="text-xs font-medium text-gray-600">
            {data.personalInfo.name || 'CV Preview'}
          </div>
        </div>

        {/* תיבת גלילה */}
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
            {/* תוכן הקורות חיים */}
            <div id="cv-content-mobile" className="bg-white relative">
              <TemplateComponent
                data={data}
                lang={lang}
                isEditing={false}
                onUpdate={() => {}}
              />
            </div>
          </div>

          {/* אפקטים ויזואליים */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* טקסט הסבר מתחת */}
      <div className="text-center mt-4">
        <p className="text-[10px] text-gray-400">
          {lang === 'he'
            ? 'לעריכת הקורות חיים יש לעבור לגרסת המחשב'
            : 'To edit your CV, please switch to desktop version'}
        </p>
      </div>
    </div>
  );
};

interface CVSection {
  [key: string]: any;
}

interface ResumeDataWithIndex extends ResumeData {
  [key: string]: any;
}

// הוספת סגנונות חדשים לאנימציות
const pulseAnimation = {
  scale: [1, 1.2, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export const CVDisplay: React.FC<CVDisplayProps> = ({ 
  sessionId, 
  lang,
  hideButtons = false 
}) => {
  const isRTL = lang === 'he';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [cvData, setCvData] = useState<ResumeData | null>(null);
  const [template, setTemplate] = useState<string>('general');
  const [dictionary, setDictionary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isFromFinishPage, setIsFromFinishPage] = useState(false);
  const mounted = useRef(false);
  const supabase = createClientComponentClient();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const selectedPackage = useAppStore(state => state.selectedPackage);
  const setSelectedPackage = useAppStore(state => state.setSelectedPackage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templateComponents>('classic');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState<{
    type: string;
    fields: any[];
  } | null>(null);
  const canEdit = selectedPackage === 'advanced' || selectedPackage === 'pro';
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<{
    type: string;
    index?: number;
    data: any;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(() => {
    const savedEditMode = localStorage.getItem('isEditMode');
    return savedEditMode ? JSON.parse(savedEditMode) : true;
  });
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    isOpen: boolean;
    fromPackage: Package;
    toPackage: Package;
    upgradePrice: number;
  }>({
    isOpen: false,
    fromPackage: 'basic' as Package,
    toPackage: 'advanced' as Package,
    upgradePrice: 0
  });

  const [packageType, setPackageType] = useState<Package>('basic');
  const [isEditable, setIsEditable] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<'edit' | 'preview' | 'download' | null>(null);

  useEffect(() => {
    mounted.current = true;
    // בדיקה אם המשתמש הגיע מדף הסיום
    const referrer = document.referrer;
    setIsFromFinishPage(referrer.includes('/finish/'));
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('template_id')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        const { data: cvDataResult, error: cvError } = await supabase
          .from('cv_data')
          .select('format_cv, language')
          .eq('session_id', sessionId)
          .single();

        if (cvError) throw cvError;

        const rawData = cvDataResult?.format_cv;
        rawData.language = cvDataResult?.language || 'he';

        if (!rawData?.personal_details?.name) {
          throw new Error('Missing required field: name');
        }

        const formattedData = transformResumeData(rawData);
        const dictionary = await getDictionary(lang);
        
        setTemplate(sessionData.template_id || 'modern');
        setCvData(formattedData);
        setDictionary(dictionary);
        setIsLoading(false);

      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load CV data');
        setIsLoading(false);
      }
    };

    if (mounted.current) {
      fetchData();
    }
  }, [sessionId, lang, mounted]);

  useEffect(() => {
    const checkEditPermissions = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('cv_data')
          .select('package, is_editable')
          .eq('session_id', sessionId)
          .single();

        if (error) throw error;

        if (data) {
          setPackageType(data.package as Package);
          setIsEditable(true);
          // עדכון ה-store
          setSelectedPackage(data.package as Package);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        toast.error(
          lang === 'he' 
            ? 'שגיאה בטעינת הרשאות'
            : 'Error loading permissions'
        );
      }
    };

    checkEditPermissions();
  }, [sessionId, supabase, setSelectedPackage]);

  const handleSave = async (editedData: ResumeData) => {
    try {
      const typedData = editedData as ResumeDataWithIndex;
      setCvData(editedData);
      setHasChanges(true);  // מסמן שבוצעו שינויים
      
      const formattedForSave = {
        personal_details: {
          name: editedData.personalInfo.name,
          email: editedData.personalInfo.email,
          phone: editedData.personalInfo.phone,
          address: editedData.personalInfo.address
        },
        professional_summary: editedData.personalInfo.summary,
        experience: editedData.experience.map(exp => ({
          title: exp.position,
          company: exp.company,
          years: `${exp.startDate} - ${exp.endDate}`,
          achievements: exp.description
        })),
        education: editedData.education.degrees.map(degree => {
          console.log('Processing degree for save:', degree);
          return {
            degree: degree.type + (degree.field ? `, ${degree.field}` : ''),
            institution: degree.institution || '',
            specialization: degree.specialization || '',
            years: degree.years || ''
          };
        }),
        military_service: editedData.military ? {
          role: editedData.military.role,
          years: `${editedData.military.startDate} - ${editedData.military.endDate}`,
          achievements: editedData.military.description
        } : undefined,
        skills: [
          ...editedData.skills.technical,
          ...editedData.skills.soft
        ],
        languages: editedData.skills.languages.reduce((acc, curr) => ({
          ...acc,
          [curr.language]: curr.level
        }), {})
      };

      console.log('Formatted Data for Save:', formattedForSave);

      const { error } = await supabase
        .from('cv_data')
        .update({ format_cv: formattedForSave })
        .eq('session_id', sessionId);

      if (error) throw error;

      toast.success(dictionary.messages.saved);

    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error(dictionary.messages.saveFailed);
    }
  };

  const handlePdfDownload = async () => {
    if (isDownloadingPdf) {
      return;
    }

    // בדיקה אם נמצאים במצב עריכה
    if (isEditing) {
      toast.error(
        lang === 'he' 
          ? 'היי אנחנו עורכים פה נסיים ואז יהיה אפשר להוריד'
          : 'Please finish editing before downloading the CV'
      );
      return;
    }

    try {
      setIsDownloadingPdf(true);
      toast.info(lang === 'he' ? 'מכין PDF...' : 'Preparing PDF...');

      // מנסה למצוא את האלמנט המתאים (מובייל או דסקטופ)
      const element = document.getElementById('cv-content') || document.getElementById('cv-content-mobile');
      if (!element) {
        throw new Error('CV content element not found');
      }

      // המתנה לטעינה כל כל התמונות
      const images = element.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn('Failed to load image:', img.src);
              resolve();
            };
            setTimeout(resolve, 5000);
          });
        })
      );

      // איסוף סגנונות ויצירת HTML
      let styles = '';
      try {
        styles = Array.from(document.styleSheets)
          .map(sheet => {
            try {
              return Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n');
            } catch (e) {
              return '';
            }
          })
          .join('\n');
      } catch (e) {
        console.warn('Error collecting styles:', e);
      }

      let processedHtml = '';
      try {
        processedHtml = await processImages(element.innerHTML);
      } catch (e) {
        processedHtml = element.innerHTML;
      }

      // יצירת HTML מלא
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="${lang}" dir="${lang === 'he' ? 'rtl' : 'ltr'}">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              ${styles}
              
              @page {
                margin: 0;
                size: A4 portrait;
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
                font-family: 'Assistant', sans-serif;
              }
              
              #cv-content {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 0;
                background: white;
                position: relative;
                display: flex;
                flex-direction: column;
              }
              
              img {
                max-width: 100%;
                height: auto;
                display: block !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .flex { display: flex !important; }
              .flex-row { flex-direction: row !important; }
              .flex-col { flex-direction: column !important; }
              .items-center { align-items: center !important; }
              .justify-center { justify-content: center !important; }
              .gap-2 { gap: 0.5rem !important; }
              .gap-4 { gap: 1rem !important; }
              .p-4 { padding: 1rem !important; }
              .p-6 { padding: 1.5rem !important; }
              .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
              .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
              .text-center { text-align: center !important; }
              .font-bold { font-weight: 700 !important; }
              .text-lg { font-size: 1.125rem !important; }
              .text-xl { font-size: 1.25rem !important; }
              .text-2xl { font-size: 1.5rem !important; }
              .text-3xl { font-size: 1.875rem !important; }
              .rounded-full { border-radius: 9999px !important; }
              .rounded-lg { border-radius: 0.5rem !important; }
              .bg-white { background-color: white !important; }
              .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
              .relative { position: relative !important; }
              .absolute { position: absolute !important; }
              .w-full { width: 100% !important; }
              .h-full { height: 100% !important; }
              .overflow-hidden { overflow: hidden !important; }
            </style>
          </head>
          <body>
            <div id="cv-content" class="bg-white">
              ${processedHtml}
            </div>
          </body>
        </html>
      `;

      // ימירת הקורות חיים בסטורג׳
      try {
        // קודם נקבל את הPDF מהAPI
        const pdfResponse = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html: fullHtml,
            fileName: `CV-${cvData?.personalInfo?.name || 'cv'}-${Date.now()}`,
            sessionId
          }),
        });

        if (!pdfResponse.ok) {
          throw new Error('Failed to generate PDF');
        }

        const pdfBlob = await pdfResponse.blob();
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]);
          };
          reader.readAsDataURL(pdfBlob);
        });

        // שמירה בסטורג׳
        await fetch('/api/store-cv-copy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            pdfBuffer: base64Data,
            fileName: `cv_${sessionId}_${new Date().toISOString().split('T')[0]}.pdf`
          }),
        });

        // שליחת מייל מסכם
        try {
          await fetch('/api/send-summary-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              cvData: {
                ...cvData,
                pdfBuffer: base64Data
              },
              lang,
              fileName: `cv_${sessionId}_${new Date().toISOString().split('T')[0]}.pdf`
            }),
          });
        } catch (error) {
          console.warn('Failed to send summary email:', error);
        }

        // הורדה למחשב המשתמש
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cvData?.personalInfo?.name || 'cv'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(dictionary.messages.downloadSuccess);

        // ניווט למסך הסיום
        router.push(`/${lang}/finish/${sessionId}`);

      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error(dictionary.messages.downloadError);
      }
    } catch (error) {
      console.error('Error preparing PDF:', error);
      toast.error(dictionary.messages.downloadError);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // פונקציה להמרת תמונות ל-base64
  const processImages = async (html: string): Promise<string> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');

    const processImage = async (img: HTMLImageElement): Promise<void> => {
      try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = base64;
      } catch (error) {
        console.error('Error processing image:', img.src, error);
      }
    };

    await Promise.all(Array.from(images).map(processImage));
    return doc.body.innerHTML;
  };

  // נוסיף פונקציה חדשה לציה ב-PDF
  const handlePreviewPdf = async () => {
    // בדיקה אם נמצאים במצב עריכה
    if (isEditing) {
      toast.error(
        lang === 'he' 
          ? 'היי אנחנו עורכים פה נסיים ואז יהיה אפשר להוריד'
          : 'Please finish editing before downloading the CV'
      );
      return;
    }

    try {
      setIsGenerating(true);
      toast.info(lang === 'he' ? 'מכין תצוגה מקדימה...' : 'Preparing preview...');

      const element = document.getElementById('cv-content');
      if (!element) {
        throw new Error('CV content element not found');
      }

      // המתנה לטעינת תמונות - משתמש באותו קוד מ-handlePdfDownload
      const images = document.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 5000);
          });
        })
      );

      const cvContent = document.getElementById('cv-content');
      if (!cvContent) {
        toast.error(dictionary.messages.downloadError);
        return;
      }

      // איסוף סגנונות ויצירת HTML - זהה לקוד הקיים
      let styles = '';
      try {
        styles = Array.from(document.styleSheets)
          .map(sheet => {
            try {
              return Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n');
            } catch (e) {
              return '';
            }
          })
          .join('\n');
      } catch (e) {
        console.warn('Error collecting styles:', e);
      }

      let processedHtml = '';
      try {
        processedHtml = await processImages(cvContent.innerHTML);
      } catch (e) {
        processedHtml = cvContent.innerHTML;
      }

      // הוספת כל הפנטים הנדרשים
      const fonts = `
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@100;200;300;400;500;600;700&display=swap');
      `;

      const fullHtml = `
        <!DOCTYPE html>
        <html lang="${lang}" dir="${lang === 'he' ? 'rtl' : 'ltr'}">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              ${fonts}
              ${styles}
              
              /* הגדרות בסיס */
              body {
                margin: 0;
                padding: 0;
                width: 210mm;
                min-height: 297mm;
                background: white;
              }
              
              /* הגדרות פונטים לכל תבנית */
              .template-classic {
                font-family: 'Assistant', sans-serif;
              }
              .template-professional {
                font-family: 'Rubik', sans-serif;
              }
              .template-general {
                font-family: 'Open Sans', sans-serif;
              }
              .template-creative {
                font-family: 'Heebo', sans-serif;
              }
              
              /* תיקוני הדפסה */
              @page {
                size: A4;
                margin: 0;
              }
              @media print {
                html, body {
                  width: 210mm;
                  height: 297mm;
                }
              }
            </style>
          </head>
          <body>
            <div id="cv-content" class="bg-white template-${selectedTemplate}">
              ${processedHtml}
            </div>
          </body>
        </html>
      `;

      // יצירת PDF והצגתו
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: fullHtml,
          fileName: `CV-${cvData?.personalInfo?.name || 'cv'}-${Date.now()}`,
          sessionId
        }),
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      const pdfBlob = await pdfResponse.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // פתיחת ה-PDF בחלון חדש/באפליקציה של המכשיר
      window.open(pdfUrl, '_blank');

    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error(dictionary.messages.previewError || 'Failed to generate preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const onUpdate = (field: string, value: any) => {
    const newData = { ...cvData! } as ResumeDataWithIndex;
    if (field.includes('.')) {
      const [section, subField] = field.split('.');
      newData[section] = { ...newData[section], [subField]: value };
    } else {
      newData[field] = value;
    }
    handleSave(newData);
  };

  const onDelete = (section: string, index: number) => {
    const newData = { ...cvData! } as ResumeDataWithIndex;
    if (section.includes('.')) {
      const [mainSection, subSection] = section.split('.');
      const sectionData = newData[mainSection] as CVSection;
      sectionData[subSection] = (sectionData[subSection] as any[]).filter((_: any, i: number) => i !== index);
    } else {
      newData[section] = (newData[section] as any[]).filter((_: any, i: number) => i !== index);
    }
    handleSave(newData);
  };

  const handleEdit = (type: string, index: number) => {
    let itemData;
    switch (type) {
      case 'experience':
        itemData = cvData?.experience[index];
        break;
      case 'education':
        itemData = cvData?.education?.degrees[index];
        break;
      case 'language':
        itemData = cvData?.skills?.languages[index];
        break;
      case 'technicalSkill':
        itemData = cvData?.skills?.technical[index];
        break;
      case 'softSkill':
        itemData = cvData?.skills?.soft[index];
        break;
      default:
        return;
    }
    setEditingItem({ type, index, data: itemData });
  };

  const handleEditSave = (type: string, index: number, newData: any) => {
    const newCvData = { ...cvData! };
    switch (type) {
      case 'experience':
        const experienceData = {
          position: newData.position || '',
          company: newData.company || '',
          startDate: newData.startDate || '',
          endDate: newData.endDate || '',
          description: newData.description || []
        };
        newCvData.experience[index] = experienceData;
        break;
      case 'education':
        const educationData = {
          type: newData.type || '',
          field: newData.field || '',
          institution: newData.institution || '',
          years: newData.years || '',
          specialization: newData.specialization || ''
        };
        if (!newCvData.education) newCvData.education = { degrees: [] };
        newCvData.education.degrees[index] = educationData;
        break;
      case 'language':
        const languageData = {
          language: newData.language || '',
          level: newData.level || ''
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.languages[index] = languageData;
        break;
      case 'technicalSkill':
        const technicalSkillData = {
          name: newData.name || '',
          level: newData.level || 3
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.technical[index] = technicalSkillData;
        break;
      case 'softSkill':
        const softSkillData = {
          name: newData.name || '',
          level: newData.level || 3
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.soft[index] = softSkillData;
        break;
    }
    handleSave(newCvData);
    setEditingItem(null);
  };

  const handleAdd = (type: string) => {
    const newCvData = { ...cvData! };
    switch (type) {
      case 'experience':
        const newExperience = {
          position: '',
          company: '',
          startDate: '',
          endDate: '',
          description: []
        };
        onUpdate('experience', [...(newCvData.experience || []), newExperience]);
        break;
      case 'education':
        const newEducation = {
          type: '',
          field: '',
          institution: '',
          years: '',
          specialization: ''
        };
        if (!newCvData.education) newCvData.education = { degrees: [] };
        onUpdate('education', {
          ...newCvData.education,
          degrees: [...(newCvData.education.degrees || []), newEducation]
        });
        break;
      case 'language':
        const newLanguage = {
          language: '',
          level: ''
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.languages = [...(newCvData.skills.languages || []), newLanguage];
        break;
      case 'technicalSkill':
        const newTechnicalSkill = {
          name: '',
          level: 3
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.technical = [...(newCvData.skills.technical || []), newTechnicalSkill];
        break;
      case 'softSkill':
        const newSoftSkill = {
          name: '',
          level: 3
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.soft = [...(newCvData.skills.soft || []), newSoftSkill];
        break;
    }
  };

  const handleAddItem = (values: any) => {
    if (!isAddingItem) return;
    const newCvData = { ...cvData! };

    switch (isAddingItem.type) {
      case 'experience':
        const newExperienceItem = {
          position: values.position || '',
          company: values.company || '',
          startDate: values.startDate || '',
          endDate: values.endDate || '',
          description: values.description || []
        };
        onUpdate('experience', [...(newCvData.experience || []), newExperienceItem]);
        break;
      case 'education':
        const newEducationItem = {
          type: values.type || '',
          field: values.field || '',
          institution: values.institution || '',
          years: values.years || '',
          specialization: values.specialization || ''
        };
        if (!newCvData.education) newCvData.education = { degrees: [] };
        onUpdate('education', {
          ...newCvData.education,
          degrees: [...(newCvData.education.degrees || []), newEducationItem]
        });
        break;
      case 'language':
        const newLanguageItem = {
          language: values.language || '',
          level: values.level || ''
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.languages = [...(newCvData.skills.languages || []), newLanguageItem];
        break;
      case 'technicalSkill':
        const newTechnicalSkillItem = {
          name: values.name || '',
          level: values.level || 3
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.technical = [...(newCvData.skills.technical || []), newTechnicalSkillItem];
        break;
      case 'softSkill':
        const newSoftSkillItem = {
          name: values.name || '',
          level: values.level || 3
        };
        if (!newCvData.skills) newCvData.skills = { technical: [], soft: [], languages: [] };
        newCvData.skills.soft = [...(newCvData.skills.soft || []), newSoftSkillItem];
        break;
    }
    setIsAddingItem(null);
  };

  // פונקציה לחישוב ההפרש במחיר
  const calculateUpgradePrice = (fromPackage: Package, toPackage: Package) => {
    const currentPrice = PACKAGE_PRICES[fromPackage];
    const targetPrice = PACKAGE_PRICES[toPackage];
    return targetPrice - currentPrice;
  };

  // פונקציה לפתיחת מודל התשלום
  const handleUpgradeClick = (targetPackage: Package) => {
    const currentPackage = (selectedPackage || 'basic') as Package;
    const upgradeDiff = calculateUpgradePrice(currentPackage, targetPackage);
    
    setUpgradeModalData({
      isOpen: true,
      fromPackage: currentPackage,
      toPackage: targetPackage,
      upgradePrice: upgradeDiff
    });
    setIsUpgradeDialogOpen(false);
  };

  // נוסיף פונקציה לפורמוט המחיר
  const formatPriceDifference = (currentPackage: Package, targetPackage: Package) => {
    const currentPrice = PACKAGE_PRICES[currentPackage];
    const targetPrice = PACKAGE_PRICES[targetPackage];
    return targetPrice - currentPrice;
  };

  const renderEditButton = () => {
    if (selectedTemplate === 'classic') {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <motion.div
          animate={highlightedElement === 'edit' ? pulseAnimation : {}}
        >
          <Button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isDownloadingPdf}
            className={cn(
              "bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center",
              isDownloadingPdf && "opacity-50 cursor-not-allowed",
              highlightedElement === 'edit' && "ring-4 ring-[#4856CD]/30"
            )}
            aria-label={lang === 'he' ? 'עריכת קורות חיים' : 'Edit CV'}
          >
            {isEditing ? <X className="h-6 w-6" /> : <Edit2 className="h-6 w-6" />}
          </Button>
        </motion.div>
        <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
          {isEditing 
            ? (lang === 'he' ? 'סיום עריכה' : 'Finish Editing')
            : (lang === 'he' ? 'עריכת קורות החיים' : 'Edit CV')
          }
        </span>
      </div>
    );
  };

  const handleContinueWithoutDownload = () => {
    if (hasChanges) {
      setShowSavePrompt(true);
    } else {
      router.push(`/${lang}/finish/${sessionId}`);
    }
  };

  const handleDownloadAndContinue = async () => {
    await handlePdfDownload();
    setHasChanges(false);
    router.push(`/${lang}/finish/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !cvData || !dictionary) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        {error || 'Failed to load CV data'}
      </div>
    );
  }

  const TemplateComponent = templateComponents[selectedTemplate];

  const processedData: ResumeData = {
    ...cvData,
    lang: cvData.lang || 'he',
    interfaceLang: cvData.interfaceLang || 'he',
    military: cvData.military ? {
      role: cvData.military.role,
      unit: cvData.military.unit,
      startDate: cvData.military.startDate,
      endDate: cvData.military.endDate,
      description: cvData.military.description
    } : undefined
  };

  return (
    <div className="relative">
      {/* כפתור עזרה צף */}
      <button
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-8 left-8 bg-gradient-to-r from-[#4856CD] to-[#4856CD]/90 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 z-50"
      >
        <HelpCircle className="w-5 h-5" />
        <span>{lang === 'he' ? 'נתקעת? נעזור לך!' : 'Need help?'}</span>
      </button>

      {/* קומפוננטת ההדרכה */}
      <CVTutorialSteps
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        canEdit={canEdit}
        language={lang}
        isPreviewMode={isPreviewMode}
        onStepChange={setHighlightedElement}
        isMobile={isMobile}
      />

      <div className="min-h-screen flex flex-col items-center justify-start pt-4 md:pt-8">
        {/* תמונת סיום - מותאמת למובייל */}
        <div className="w-full flex justify-center mb-4 md:mb-8">
          <Image
            src="/design/finish.svg"
            alt={lang === 'he' ? 'סיום' : 'Finish'}
            width={120}
            height={120}
            className="mx-auto md:w-[180px] md:h-[180px]"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        <div className="container px-4 py-4 md:py-8 flex flex-col items-center justify-center w-full max-w-[800px]">
          {/* בחירת תבנית - מותאם למובייל ודסקטופ */}
          <div className="mb-4 md:mb-8 flex flex-col items-center gap-4 w-full">
            <div className="w-full max-w-[606px] mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-0">
                {Object.entries(templateComponents).map(([key, _], index) => (
                  <motion.div
                    key={key}
                    className={cn(
                      "relative",
                      index !== 0 && "md:border-l md:border-[#4856CD]/30",
                      "first:rounded-r-full last:rounded-l-full overflow-hidden"
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => setSelectedTemplate(key as keyof typeof templateComponents)}
                      className={cn(
                        "w-full h-full",
                        "text-sm md:text-base",
                        "font-rubik",
                        "transition-all duration-300",
                        "flex items-center justify-center",
                        "px-4 py-2",
                        selectedTemplate === key
                          ? "bg-[#4856CD] text-white"
                          : "bg-transparent text-gray-900 hover:bg-[#4856CD]/5",
                        "border border-[#4856CD]/30",
                        "md:rounded-none",
                        index === 0 && "rounded-r-full",
                        index === Object.entries(templateComponents).length - 1 && "rounded-l-full"
                      )}
                      aria-label={dictionary.templates[key as keyof typeof templateComponents].name}
                    >
                      {dictionary.templates[key as keyof typeof templateComponents].name}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* קו מפריד */}
          <div className="w-full max-w-4xl mx-auto mb-4 md:mb-8 border-t border-[#4856CD]/20" />

          {/* כצוגת CV עם ממשק עריכה */}
          <div className="w-full">
            {isMobile ? (
              <MobilePreview 
                data={cvData!}
                lang={lang}
                template={selectedTemplate}
                dictionary={dictionary}
              />
            ) : (
              <div className="relative mx-auto flex justify-center">
                <div 
                  id="cv-content" 
                  className={`shadow-2xl rounded-2xl mx-auto relative ${isEditing ? 'overflow-y-visible min-h-full' : 'overflow-hidden'}`}
                  style={{
                    width: '210mm',
                    height: isEditing ? 'fit-content' : '297mm',
                    minHeight: isEditing ? 'fit-content' : '297mm',
                    maxHeight: isEditing ? 'none' : '297mm',
                    transform: isEditing ? 'none' : 'scale(0.99)',
                    transformOrigin: 'top center',
                    margin: 0,
                    padding: 0,
                    position: 'relative',
                    background: 'white',
                    border: isEditing ? '1px solid rgba(72, 86, 205, 0.1)' : 'none'
                  }}
                >
                  {isEditing && (
                    <div className="absolute -right-16 top-0 flex flex-col gap-2 h-full py-4">
                      <div className="sticky top-4 flex flex-col gap-2">
                        <Button
                          onClick={() => {
                            const newData = { ...cvData! };
                            newData.experience = [...(newData.experience || []), {
                              position: '',
                              company: '',
                              startDate: '',
                              endDate: '',
                              description: []
                            }];
                            handleSave(newData);
                          }}
                          className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-[#4856CD]/10"
                          title={lang === 'he' ? 'הוסף ניסיון תעסוקתי' : 'Add Work Experience'}
                        >
                          <Plus className="h-4 w-4 text-gray-900" />
                        </Button>
                        <Button
                          onClick={() => {
                            const newData = { ...cvData! };
                            if (!newData.education) newData.education = { degrees: [] };
                            newData.education.degrees = [...(newData.education.degrees || []), {
                              type: '',
                              field: '',
                              institution: '',
                              years: '',
                              specialization: ''
                            }];
                            handleSave(newData);
                          }}
                          className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-[#4856CD]/10"
                          title={lang === 'he' ? 'הוסף השכלה' : 'Add Education'}
                        >
                          <Plus className="h-4 w-4 text-gray-900" />
                        </Button>
                        <Button
                          onClick={() => {
                            const newData = { ...cvData! };
                            if (!newData.skills) newData.skills = { technical: [], soft: [], languages: [] };
                            newData.skills.languages = [...(newData.skills.languages || []), {
                              language: '',
                              level: ''
                            }];
                            handleSave(newData);
                          }}
                          className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-[#4856CD]/10"
                          title={lang === 'he' ? 'הוסף שפה' : 'Add Language'}
                        >
                          <Plus className="h-4 w-4 text-gray-900" />
                        </Button>
                        <Button
                          onClick={() => {
                            const newData = { ...cvData! };
                            if (!newData.skills) newData.skills = { technical: [], soft: [], languages: [] };
                            newData.skills.technical = [...(newData.skills.technical || []), {
                              name: '',
                              level: 3
                            }];
                            handleSave(newData);
                          }}
                          className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-[#4856CD]/10"
                          title={lang === 'he' ? 'הוסף כישור טכני' : 'Add Technical Skill'}
                        >
                          <Plus className="h-4 w-4 text-gray-900" />
                        </Button>
                        <Button
                          onClick={() => {
                            const newData = { ...cvData! };
                            if (!newData.skills) newData.skills = { technical: [], soft: [], languages: [] };
                            newData.skills.soft = [...(newData.skills.soft || []), {
                              name: '',
                              level: 3
                            }];
                            handleSave(newData);
                          }}
                          className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-[#4856CD]/10"
                          title={lang === 'he' ? 'הוסף כישור רך' : 'Add Soft Skill'}
                        >
                          <Plus className="h-4 w-4 text-gray-900" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <TemplateComponent
                    data={cvData!}
                    lang={cvData?.lang || 'he'}
                    isEditing={isEditing}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onEdit={handleEdit}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* כפתורי פעולה - מותאמים למובייל ודסקטופ */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
          {renderEditButton()}

          {/* כפתור צפייה - רק במובייל */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <motion.div
                animate={highlightedElement === 'preview' ? pulseAnimation : {}}
              >
                <Button
                  onClick={handlePreviewPdf}
                  disabled={isGenerating}
                  className={cn(
                    "bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center",
                    highlightedElement === 'preview' && "ring-4 ring-[#4856CD]/30"
                  )}
                  aria-label={lang === 'he' ? 'צפייה בקובץ' : 'View file'}
                >
                  {isGenerating ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Eye className="h-6 w-6" />
                  )}
                </Button>
              </motion.div>
              <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                {lang === 'he' ? 'צפייה' : 'View'}
              </span>
            </div>
          )}

          {/* כפתור הורדה והמשך */}
          {!isFromFinishPage ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={highlightedElement === 'download' ? pulseAnimation : {}}
              >
                <Button
                  onClick={handleDownloadAndContinue}
                  disabled={isDownloadingPdf || isEditing || selectedTemplate === 'classic'}
                  className={cn(
                    "bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center",
                    (isEditing || selectedTemplate === 'classic') && "opacity-50 cursor-not-allowed",
                    highlightedElement === 'download' && "ring-4 ring-[#4856CD]/30"
                  )}
                  aria-label={lang === 'he' ? 'הורדת קובץ PDF והמשך' : 'Download PDF and Continue'}
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Download className="h-6 w-6" />
                  )}
                </Button>
              </motion.div>
              <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                {selectedTemplate === 'classic' 
                  ? (lang === 'he' ? 'התבנית בבנייה' : 'Template Under Construction')
                  : (lang === 'he' ? 'הורדת הקורות חיים והמשך למסך ההטבות' : 'Download CV and Continue to Benefits Screen')
                }
              </span>
            </div>
          ) : (
            <>
              {/* כפתור הורדה - כשחוזרים מדף הסיום */}
              {hasChanges && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePdfDownload}
                    disabled={isDownloadingPdf || isEditing}
                    className={cn(
                      "bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center",
                      isEditing && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label={lang === 'he' ? 'הורדת קובץ PDF' : 'Download PDF'}
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Download className="h-6 w-6" />
                    )}
                  </Button>
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                    {lang === 'he' ? 'הורדת הקורות חיים' : 'Download CV'}
                  </span>
                </div>
              )}
              {/* כפתור המשך */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleContinueWithoutDownload}
                  className="bg-[#4856CD] text-white hover:opacity-90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  aria-label={lang === 'he' ? 'המשך למסך ההטבות' : 'Continue to Benefits'}
                >
                  <FileText className="h-6 w-6" />
                </Button>
                <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                  {lang === 'he' ? 'המשך למסך ההטבות' : 'Continue to Benefits'}
                </span>
              </div>
            </>
          )}
        </div>

        <LoadingModal 
          isOpen={isDownloadingPdf} 
          lang={lang} 
          dictionary={dictionary} 
          action="generate-pdf"
        />

        {/* פופאפ שמירת שינויים */}
        <Dialog open={showSavePrompt} onOpenChange={setShowSavePrompt}>
          <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-white rounded-2xl">
            <div className="p-6 border-b border-[#4856CD]/10">
              <DialogHeader>
                <DialogTitle className={`text-center text-xl ${lang === 'he' ? 'font-heebo' : ''}`}>
                  {lang === 'he' ? 'שמירת שינויים' : 'Save Changes'}
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#4856CD]/10 flex items-center justify-center">
                    <Download className="w-8 h-8 text-[#4856CD]" />
                  </div>
                </div>
                <p className={`text-center text-gray-600 ${lang === 'he' ? 'font-heebo' : ''}`}>
                  {lang === 'he' 
                    ? 'היי, ערכת את קורות החיים. אולי כדאי לשמור את השינויים?'
                    : 'Hey, you\'ve made changes to your CV. Would you like to save them?'}
                </p>
                <div className={`flex gap-3 ${lang === 'he' ? 'flex-row-reverse' : ''}`}>
                  <Button
                    onClick={handleDownloadAndContinue}
                    className="flex-1 bg-[#4856CD] text-white hover:bg-[#4856CD]/90 rounded-full py-2"
                  >
                    {lang === 'he' ? 'הורד והמשך' : 'Download & Continue'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSavePrompt(false);
                      router.push(`/${lang}/finish/${sessionId}`);
                    }}
                    variant="outline"
                    className="flex-1 border-[#4856CD] text-[#4856CD] hover:bg-[#4856CD]/5 rounded-full py-2"
                  >
                    {lang === 'he' ? 'המשך בלי להוריד' : 'Continue without Download'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* פופאפים קיימים */}
        {editingItem && (
          <EditPopup
            isOpen={true}
            onClose={() => setEditingItem(null)}
            data={editingItem.data}
            onSave={(newData) => handleEditSave(editingItem.type, editingItem.index!, newData)}
            section={editingItem.type}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0",
              isRTL ? "rtl" : "ltr"
            )}
            isRTL={isRTL}
          />
        )}
        {isAddingItem && (
          <AddItemPopup
            isOpen={true}
            onClose={() => setIsAddingItem(null)}
            onAdd={handleAddItem}
            section={isAddingItem.type}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0",
              isRTL ? "rtl" : "ltr"
            )}
            isRTL={isRTL}
          />
        )}

        {/* מודל התשלום */}
        <UpgradePaymentModal
          isOpen={upgradeModalData.isOpen}
          onClose={() => setUpgradeModalData(prev => ({ ...prev, isOpen: false }))}
          isRTL={lang === 'he'}
          lang={lang as 'he' | 'en'}
          fromPackage={upgradeModalData.fromPackage}
          toPackage={upgradeModalData.toPackage}
          feature="edit"
          upgradedFeatures={[
            {
              key: 'edit',
              title: lang === 'he' ? 'עריכת קורות חיים' : 'CV Editing',
              description: lang === 'he' ? 'עריכה מלאה של קורות החיים' : 'Full CV editing',
              icon: '/icons/edit.svg',
              requiredPackage: 'advanced' as Package,
              route: '/cv',
              upgradePrice: upgradeModalData.upgradePrice
            }
          ]}
          upgradePrice={upgradeModalData.upgradePrice}
        />
      </div>
    </div>
  );
};