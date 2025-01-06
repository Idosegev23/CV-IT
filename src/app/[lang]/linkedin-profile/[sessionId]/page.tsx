'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/theme/ui/card';
import { Button } from '@/components/theme/ui/button';
import { Clipboard, Linkedin, Languages, ArrowLeft, ArrowRight, FileText, Briefcase, GraduationCap, Lightbulb, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getDictionary } from '@/dictionaries';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LinkedInData {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
}

// הגדרת פונקציה לבדיקת השפה
const getIsHebrew = (lang?: string) => lang === 'he';

interface CVData {
  skills: {
    soft: Array<{ name: string; level: number }>;
    technical: Array<{ name: string; level: number }>;
  };
  education: {
    degrees: Array<{
      type: string;
      field: string;
      years: string;
      institution: string;
      specialization: string;
    }>;
  };
  languages: Record<string, string>;
  experience: Array<{
    title: string;
    years: string;
    company: string;
    achievements: string[];
  }>;
  professional_summary: string;
  personal_details: {
    name: string;
    email: string;
    phone: string;
    address: string;
    birth_date: string;
  };
}

interface FormattedItem {
  id: string;
  title?: string;
  content?: string;
  isTranslated?: boolean;
  fields?: {
    name: string;
    value: string;
    label: string;
  }[];
}

function formatExperience(experience: CVData['experience'], isHebrew: boolean): FormattedItem[] {
  return experience.map((job, index) => ({
    id: `exp-${index}`,
    title: `${job.title} ב-${job.company}`,
    content: `תפקיד: ${job.title}\nחברה: ${job.company}\nתקופה: ${job.years}\n\nהישגים ותחומי אחריות:\n${job.achievements.map(achievement => `• ${achievement}`).join('\n')}`,
    fields: [
      { name: 'Title', value: job.title, label: isHebrew ? 'תפקיד (Title)' : 'Title' },
      { name: 'Company', value: job.company, label: isHebrew ? 'חברה (Company)' : 'Company' },
      { name: 'Period', value: job.years, label: isHebrew ? 'תקופה (Start/End date)' : 'Start/End date' },
      { name: 'Location', value: '', label: isHebrew ? 'מיקום (Location)' : 'Location' },
      { name: 'Description', value: job.achievements.map(achievement => `• ${achievement}`).join('\n'), label: isHebrew ? 'תיאור תפקיד (Description)' : 'Description' }
    ]
  }));
}

function formatEducation(education: CVData['education'], isHebrew: boolean): FormattedItem[] {
  return education.degrees.map((degree, index) => ({
    id: `edu-${index}`,
    title: `${degree.type} - ${degree.institution}`,
    content: `מוסד לימודים: ${degree.institution}\nתואר: ${degree.type}\nתחום: ${degree.field}\nתקופה: ${degree.years}${degree.specialization ? `\nהתמחות: ${degree.specialization}` : ''}`,
    fields: [
      { name: 'School', value: degree.institution, label: isHebrew ? 'מוסד לימודים (School)' : 'School' },
      { name: 'Degree', value: degree.type, label: isHebrew ? 'תואר (Degree)' : 'Degree' },
      { name: 'Field', value: degree.field, label: isHebrew ? 'תחום לימודים (Field of study)' : 'Field of study' },
      { name: 'Period', value: degree.years, label: isHebrew ? 'תקופת לימודים (Start/End date)' : 'Start/End date' },
      { name: 'Grade', value: '', label: isHebrew ? 'ציון (Grade)' : 'Grade' },
      { name: 'Activities', value: '', label: isHebrew ? 'פעילויות ואגודות (Activities and societies)' : 'Activities and societies' },
      { name: 'Description', value: degree.specialization || '', label: isHebrew ? 'תיאור נוסף (Description)' : 'Description' }
    ]
  }));
}

function formatSkills(skills: CVData['skills'], isHebrew: boolean): FormattedItem[] {
  return [
    {
      id: 'technical',
      title: isHebrew ? 'מיומנויות טכניות' : 'Technical Skills',
      content: skills.technical.map(skill => skill.name).join('\n'),
      fields: skills.technical.map((skill, index) => ({
        name: `skill-tech-${index}`,
        value: skill.name,
        label: isHebrew ? 'מיומנות (Skill)' : 'Skill'
      }))
    },
    {
      id: 'soft',
      title: isHebrew ? 'מיומנויות רכות' : 'Soft Skills',
      content: skills.soft.map(skill => skill.name).join('\n'),
      fields: skills.soft.map((skill, index) => ({
        name: `skill-soft-${index}`,
        value: skill.name,
        label: isHebrew ? 'מיומנות (Skill)' : 'Skill'
      }))
    }
  ];
}

function formatLanguages(languages: CVData['languages'], isHebrew: boolean): FormattedItem[] {
  return [{
    id: 'languages',
    title: isHebrew ? 'שפות' : 'Languages',
    content: Object.entries(languages).map(([lang, level]) => `${lang}: ${level}`).join('\n'),
    fields: Object.entries(languages).map(([lang, level], index) => ({
      name: `lang-${index}`,
      value: `${lang} - ${level}`,
      label: isHebrew ? 'שפה ורמה (Language & Proficiency)' : 'Language & Proficiency'
    }))
  }];
}

function formatSummary(summary: string, isHebrew: boolean): FormattedItem[] {
  return [{
    id: 'summary',
    title: isHebrew ? 'תקציר מקצועי' : 'Professional Summary',
    content: summary
  }];
}

const sections = (isHebrew: boolean) => [
  {
    key: 'summary' as const,
    title: isHebrew ? 'תקציר מקצועי' : 'Professional Summary',
    linkedinUrl: 'https://www.linkedin.com/in/me/edit/forms/summary/new/?profileFormEntryPoint=PROFILE_SECTION',
    icon: FileText,
    description: isHebrew 
      ? 'העתק את התקציר המקצועי והדבק אותו בעמוד התקציר בלינקדאין'
      : 'Copy your professional summary and paste it in your LinkedIn profile',
    getInstructions: (isHebrew: boolean) => {
      const steps = isHebrew ? [
        'לחץ על כפתור "פתח בלינקדאין"',
        'העתק את התקציר מכאן',
        'הדבק בשדה "About"',
        'לחץ על שמור'
      ] : [
        'Click "Open in LinkedIn"',
        'Copy the summary from here',
        'Paste in the "About" field',
        'Click save'
      ];
      return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
    }
  },
  {
    key: 'experience' as const,
    title: isHebrew ? 'ניסיון תעסוקתי' : 'Work Experience',
    linkedinUrl: 'https://www.linkedin.com/in/me/edit/forms/position/new/',
    icon: Briefcase,
    description: isHebrew 
      ? 'העתק כל משרה בנפרד והוסף אותה בלינקדאין'
      : 'Copy each position separately and add it to LinkedIn',
    fields: [
      { name: 'Title', label: isHebrew ? 'תפקיד' : 'Position' },
      { name: 'Company', label: isHebrew ? 'חברה' : 'Company' },
      { name: 'Period', label: isHebrew ? 'תקופה' : 'Period' },
      { name: 'Description', label: isHebrew ? 'תיאור ותחומי אחריות' : 'Description and Responsibilities' }
    ],
    getInstructions: (isHebrew: boolean) => {
      const steps = isHebrew ? [
        'לחץ על "פתח בלינקדאין"',
        'העתק את פרטי המשרה',
        'מלא את השדות המתאימים:',
        '   • Title - תפקיד',
        '   • Company - שם החברה',
        '   • Start/End Date - תאריכי התחלה וסיום',
        '   • Description - העתק את ההישגים ותחומי האחריות',
        'לחץ על שמור',
        'חזור על התהליך עבור כל משרה'
      ] : [
        'Click "Open in LinkedIn"',
        'Copy the position details',
        'Fill in the appropriate fields:',
        '   • Title',
        '   • Company',
        '   • Start/End Date',
        '   • Description - Copy achievements and responsibilities',
        'Click save',
        'Repeat for each position'
      ];
      return steps.map((step, index) => step.startsWith('   •') ? step : `${index + 1}. ${step}`).join('\n');
    }
  },
  {
    key: 'education' as const,
    title: isHebrew ? 'השכלה' : 'Education',
    linkedinUrl: 'https://www.linkedin.com/in/me/edit/forms/education/new/',
    icon: GraduationCap,
    description: isHebrew 
      ? 'העתק כל תואר או הכשרה בנפרד'
      : 'Copy each degree or certification separately',
    fields: [
      { name: 'School', label: isHebrew ? 'מוסד לימודים' : 'School' },
      { name: 'Degree', label: isHebrew ? 'תואר' : 'Degree' },
      { name: 'Field', label: isHebrew ? 'תחום לימודים' : 'Field of Study' },
      { name: 'Period', label: isHebrew ? 'תקופה' : 'Period' }
    ],
    getInstructions: (isHebrew: boolean) => {
      const steps = isHebrew ? [
        'לחץ על "פתח בלינקדאין"',
        'העתק את פרטי התואר',
        'מלא את השדות:',
        '   • School - שם המוסד',
        '   • Degree - סוג התואר',
        '   • Field of study - תחום הלימודים',
        '   • Start/End Date - תקופת הלימודים',
        'לחץ על שמור'
      ] : [
        'Click "Open in LinkedIn"',
        'Copy the degree details',
        'Fill in the fields:',
        '   • School',
        '   • Degree',
        '   • Field of study',
        '   • Start/End Date',
        'Click save'
      ];
      return steps.map((step, index) => step.startsWith('   •') ? step : `${index + 1}. ${step}`).join('\n');
    }
  },
  {
    key: 'skills' as const,
    title: isHebrew ? 'מיומנויות' : 'Skills',
    linkedinUrl: 'https://www.linkedin.com/in/me/edit/skills/new/',
    icon: Lightbulb,
    description: isHebrew 
      ? 'הוסף כל מיומנות בנפרד'
      : 'Add each skill separately',
    getInstructions: (isHebrew: boolean) => {
      const steps = isHebrew ? [
        'לחץ על "פתח בלינקדאין"',
        'העתק מיומנות אחת',
        'הדבק בשדה Skill',
        'לחץ על שמור',
        'חזור על התהליך עבור כל מיומנות'
      ] : [
        'Click "Open in LinkedIn"',
        'Copy one skill',
        'Paste in the Skill field',
        'Click save',
        'Repeat for each skill'
      ];
      return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
    }
  },
  {
    key: 'languages' as const,
    title: isHebrew ? 'שפות' : 'Languages',
    linkedinUrl: 'https://www.linkedin.com/in/me/edit/forms/language/new/',
    icon: Globe,
    description: isHebrew 
      ? 'הוסף את השפות שאתה שולט בהן'
      : 'Add the languages you know',
    getInstructions: (isHebrew: boolean) => {
      const steps = isHebrew ? [
        'לחץ על "פתח בלינקדאין"',
        'בחר שפה',
        'בחר את רמת השליטה',
        'לחץ על שמור',
        'חזור על התהליך עבור כל שפה'
      ] : [
        'Click "Open in LinkedIn"',
        'Select a language',
        'Choose proficiency level',
        'Click save',
        'Repeat for each language'
      ];
      return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
    }
  }
];

function LinkedInProfileContent() {
  const params = useParams();
  const isHebrew = getIsHebrew(params?.lang as string);
  const { toast } = useToast();
  const [data, setData] = useState<LinkedInData | null>(null);
  const [translatedData, setTranslatedData] = useState<LinkedInData | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [currentSection, setCurrentSection] = useState<keyof LinkedInData>('summary');
  const [formattedData, setFormattedData] = useState<Record<string, FormattedItem[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.sessionId) return;

      const { data: cvData, error } = await supabase
        .from('cv_data')
        .select('format_cv')
        .eq('session_id', params.sessionId)
        .single();

      if (error) {
        console.error('Error fetching data:', error);
        toast({
          title: isHebrew ? 'שגיאה בטעינת הנתונים' : 'Error Loading Data',
          description: isHebrew ? 'אנא נסה שוב מאוחר יותר' : 'Please try again later',
          variant: 'destructive',
        });
        return;
      }

      const rawData = cvData.format_cv as CVData;
      
      setFormattedData({
        summary: formatSummary(rawData.professional_summary, isHebrew),
        experience: formatExperience(rawData.experience, isHebrew),
        education: formatEducation(rawData.education, isHebrew),
        skills: formatSkills(rawData.skills, isHebrew),
        languages: formatLanguages(rawData.languages, isHebrew)
      });
    };

    fetchData();
  }, [params?.sessionId, isHebrew]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: isHebrew ? 'הועתק!' : 'Copied!',
      description: isHebrew ? 'הטקסט הועתק ללוח' : 'Text copied to clipboard',
    });
  };

  const openLinkedIn = (url: string) => {
    window.open(url, '_blank');
  };

  const handleTranslateSection = async (sectionKey: string, items: FormattedItem[]) => {
    try {
      toast({
        title: isHebrew ? 'טוען...' : 'Loading...',
        description: isHebrew ? 'אנא המתן' : 'Please wait',
      });

      // תרגום כל הפריטים בסקציה
      const translatedItems = await Promise.all(items.map(async (item) => {
        if (!item.content && !item.fields) return item;

        let translatedContent = item.content;
        let translatedFields = item.fields;

        // תרגום התוכן הראשי אם קיים
        if (item.content) {
          const response = await fetch('/api/translate-section', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: item.content }),
          });

          if (response.ok) {
            const data = await response.json();
            if (!data.error) {
              translatedContent = data.translatedText;
            }
          }
        }

        // תרגום השדות אם קיימים
        if (item.fields) {
          translatedFields = await Promise.all(item.fields.map(async (field) => {
            const response = await fetch('/api/translate-section', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: field.value }),
            });

            if (response.ok) {
              const data = await response.json();
              return {
                ...field,
                value: data.error ? field.value : data.translatedText
              };
            }
            return field;
          }));
        }

        return {
          ...item,
          content: translatedContent,
          fields: translatedFields,
          isTranslated: true
        };
      }));

      setFormattedData(prevData => ({
        ...prevData,
        [sectionKey]: translatedItems
      }));

      toast({
        title: isHebrew ? 'התרגום הושלם' : 'Translation Complete',
        description: isHebrew ? 'הטקסט תורגם בהצלחה לאנגלית' : 'Text successfully translated to English',
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: isHebrew ? 'שגיאה' : 'Error',
        description: isHebrew ? 'התרגום נכשל, אנא נסה שוב' : 'Translation failed, please try again',
        variant: 'destructive',
      });
    }
  };

  const handleTranslateItem = async (itemId: string, text: string) => {
    try {
      toast({
        title: isHebrew ? 'טוען...' : 'Loading...',
        description: isHebrew ? 'אנא המתן' : 'Please wait',
      });

      const response = await fetch('/api/translate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      if (data.error) {
        toast({
          title: isHebrew ? 'שגיאה' : 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setFormattedData(prevData => {
        const newData = { ...prevData };
        
        Object.keys(newData).forEach(sectionKey => {
          const itemIndex = newData[sectionKey].findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            newData[sectionKey][itemIndex] = {
              ...newData[sectionKey][itemIndex],
              content: data.translatedText,
              isTranslated: true
            };
          }
        });

        return newData;
      });

      toast({
        title: isHebrew ? 'התרגום הושלם' : 'Translation Complete',
        description: isHebrew ? 'הטקסט תורגם בהצלחה לאנגלית' : 'Text successfully translated to English',
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: isHebrew ? 'שגיאה' : 'Error',
        description: isHebrew ? 'התרגום נכשל, אנא נסה שוב' : 'Translation failed, please try again',
        variant: 'destructive',
      });
    }
  };

  const handleCopyItem = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: isHebrew ? 'הועתק!' : 'Copied!',
      description: isHebrew ? 'הטקסט הועתק ללוח' : 'Text copied to clipboard',
    });
  };

  const handleDirectUpdate = async (type: string, data: any) => {
    try {
      const response = await fetch(`/api/linkedin/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update LinkedIn');
      }

      toast({
        title: isHebrew ? 'עודן בהצלחה' : 'Successfully Updated',
        description: isHebrew ? 'הנתונים עודכנו ישירות בפרופיל הלינקדאין שלך' : 'Data updated directly in your LinkedIn profile'
      });
    } catch (error) {
      console.error('LinkedIn API error:', error);
      toast({
        title: isHebrew ? 'שגיאה בעדכון' : 'Update Error',
        description: isHebrew ? 'לא ניתן לעדכן ישירות את הפרופיל. אנא העתק והדבק ידנית.' : 'Could not update profile directly. Please copy and paste manually.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEAE7]">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <Link
            href={`/${params?.lang}/finish/${params?.sessionId}`}
            className="inline-flex items-center gap-2 text-[#3F55D2] hover:text-[#B78BE6] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            {isHebrew ? 'חזרה לסיום' : 'Back to Finish'}
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#3F55D2] mb-4">
              {isHebrew ? 'עדכון פרופיל LinkedIn שלך בקלות!' : 'Update LinkedIn Profile'}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isHebrew 
                ? 'בעזרת הכלים שלנו תוכל להעתיק את המידע שיצרנו עבורך ולהדביק אותו ישירות בפרופיל הלינקדאין שלך'
                : 'Copy your CV information directly to your LinkedIn profile'}
            </p>
          </div>

          <div className="space-y-8">
            {sections(isHebrew).map((section) => (
              <Card key={section.key} className="overflow-hidden rounded-[32px] border-2 border-[#B78BE6] hover:shadow-lg transition-all">
                <div className="p-6 bg-white border-b-2 border-[#B78BE6]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-[#EAEAE7] p-2">
                        {React.createElement(section.icon, {
                          className: "w-6 h-6 text-[#3F55D2]"
                        })}
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-[#3F55D2] mb-2">
                          {section.title}
                        </h2>
                        <p className="text-gray-600">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => openLinkedIn(section.linkedinUrl)}
                        className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full transition-colors min-w-[180px]"
                      >
                        <Linkedin className="w-5 h-5 ml-2" />
                        {isHebrew ? 'פתח בלינקדאין' : 'Open in LinkedIn'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTranslateSection(section.key, formattedData[section.key] || [])}
                        className="rounded-full border-[#B78BE6] text-[#B78BE6] hover:bg-[#B78BE6] hover:text-white min-w-[180px]"
                      >
                        <Languages className="w-4 h-4 ml-2" />
                        {isHebrew ? 'תרגם לאנגלית' : 'Translate to English'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#EAEAE7]">
                  <h3 className="font-semibold text-[#3F55D2] mb-4">
                    {isHebrew ? 'הוראות' : 'Instructions'}
                  </h3>
                  <div className="space-y-3">
                    {section.getInstructions(isHebrew).split('\n').map((instruction, index) => (
                      <div 
                        key={index} 
                        className={`${
                          instruction.startsWith('   •') 
                            ? 'mr-6 text-gray-600 text-sm' 
                            : 'text-gray-700 font-medium'
                        }`}
                      >
                        {instruction}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-[#F5F8FA]">
                  {formattedData[section.key]?.map((item) => (
                    <div key={item.id} className="mb-6 last:mb-0">
                      {item.title && (
                        <div className="font-semibold text-[#3F55D2] mb-2">
                          {item.title}
                        </div>
                      )}
                      <div className="relative">
                        {item.fields ? (
                          <div className="bg-white p-4 rounded-[16px] border-2 border-[#B78BE6] space-y-4">
                            {item.fields.map((field, index) => (
                              <div key={index} className="relative">
                                <div className="font-medium text-[#3F55D2] mb-1">{field.label}</div>
                                <div className="group relative">
                                  <div className="bg-[#EAEAE7] p-3 rounded-lg text-gray-700 font-normal leading-relaxed">
                                    {field.value.split('\n').map((line, i) => (
                                      <div key={i} className={`${line.startsWith('•') ? 'mr-4' : ''}`}>
                                        {line}
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    onClick={() => handleCopyItem(field.value)}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 hover:text-[#3F55D2] transition-colors"
                                  >
                                    <Clipboard className="w-6 h-6" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="relative group">
                            <div className="bg-white p-4 rounded-[16px] text-gray-700 font-normal leading-relaxed border-2 border-[#B78BE6]">
                              {item.content?.split('\n').map((line, i) => (
                                <div key={i} className={`${line.startsWith('•') ? 'mr-4' : ''}`}>
                                  {line}
                                </div>
                              ))}
                            </div>
                            {item.content && (
                              <button
                                onClick={() => handleCopyItem(item.content!)}
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 hover:text-[#3F55D2] transition-colors"
                              >
                                <Clipboard className="w-6 h-6" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LinkedInProfile() {
  const params = useParams();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  const isHebrew = getIsHebrew(lang);

  return (
    <div>
      <LinkedInProfileContent />
    </div>
  );
} 