'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import GeneralTemplate from './GeneralTemplate';
import ClassicTemplate from './ClassicTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import CreativeTemplate from './CreativeTemplate';
import ClassicTemplateEn from './EnglishTemplates/ClassicTemplateEn';
import ProfessionalTemplateEn from './EnglishTemplates/ProfessionalTemplateEn';
import CreativeTemplateEn from './EnglishTemplates/CreativeTemplateEn';
import GeneralTemplateEn from './EnglishTemplates/GeneralTemplateEn';

export interface CVTemplateProps {
  templateId: string;
  data: ResumeData;
  lang: string;
}

export const CVTemplate: React.FC<CVTemplateProps> = ({
  templateId,
  data,
  lang
}) => {
  console.log('CVTemplate rendering with:', { 
    templateId, 
    lang, 
    dataLang: data.lang,
    template: data.template
  });

  if (data.lang === 'en') {
    console.log('Using English template');
    switch (templateId) {
      case 'classic':
        console.log('Rendering ClassicTemplateEn');
        return <ClassicTemplateEn data={data} lang={lang} />;
      case 'professional':
        console.log('Rendering ProfessionalTemplateEn');
        return <ProfessionalTemplateEn data={data} lang={lang} />;
      case 'creative':
        console.log('Rendering CreativeTemplateEn');
        return <CreativeTemplateEn data={data} lang={lang} />;
      case 'general':
        console.log('Rendering GeneralTemplateEn');
        return <GeneralTemplateEn data={data} lang={lang} />;
      default:
        console.warn('No matching English template for:', templateId);
        console.log('Using ProfessionalTemplateEn as default');
        return <ProfessionalTemplateEn data={data} lang={lang} />;
    }
  }

  console.log('Using Hebrew template');
  switch (templateId) {
    case 'classic':
      console.log('Rendering ClassicTemplate');
      return <ClassicTemplate data={data} lang={lang} />;
    case 'professional':
      console.log('Rendering ProfessionalTemplate');
      return <ProfessionalTemplate {...{data, lang}} />;
    case 'general':
      console.log('Rendering GeneralTemplate');
      return <GeneralTemplate data={data} lang={lang} />;
    case 'creative':
      console.log('Rendering CreativeTemplate');
      return <CreativeTemplate data={data} lang={lang} />;
    default:
      console.warn('No matching Hebrew template for:', templateId);
      console.log('Using ProfessionalTemplate as default');
      return <ProfessionalTemplate data={data} lang={lang} />;
  }
};

export const templates = [
  { 
    id: 'classic',
    name: { he: 'קלאסי', en: 'Classic' },
    description: {
      he: 'מתאים למשרות אדמיניסטרטיביות, סוכנים ותפקידים הדורשים סדר וארגון',
      en: 'Suitable for administrative positions, agents, and roles requiring order and organization'
    }
  },
  { 
    id: 'professional',
    name: { he: 'מקצועי', en: 'Professional' },
    description: {
      he: 'מתאים למנהלים, אנשי פיננסים והייטק – מדגיש רצינות ומקצוענות',
      en: 'Suitable for managers, finance professionals, and tech positions - emphasizes seriousness and professionalism'
    }
  },
  { 
    id: 'general',
    name: { he: 'כללי', en: 'General' },
    description: {
      he: 'גמיש ומתאים למגוון תפקידים, כמו שירות לקוחות, מכירות וסטודנטים',
      en: 'Flexible and suitable for various positions like customer service, sales, and students'
    }
  },
  { 
    id: 'creative',
    name: { he: 'יצירתי', en: 'Creative' },
    description: {
      he: 'מיועד למעצבים, אנשי שיווק ואמנים שרוצים להבליט ייחודיות',
      en: 'Designed for designers, marketers, and artists who want to highlight uniqueness'
    }
  }
] as const;

export type TemplateId = typeof templates[number]['id'];