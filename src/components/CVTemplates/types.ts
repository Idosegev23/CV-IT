import { ResumeData } from '@/types/resume';
import { Dictionary } from '@/dictionaries/dictionary';

export type Language = 'he' | 'en';

export type Direction = 'rtl' | 'ltr';

export interface SectionTitles {
  he: {
    experience: string;
    education: string;
    skills: string;
    languages: string;
    military: string;
    summary: string;
  };
  en: {
    experience: string;
    education: string;
    skills: string;
    languages: string;
    military: string;
    summary: string;
  };
}

export interface CVTemplateProps {
  data: ResumeData;
  lang: Language;
}

export interface BaseTemplateProps extends CVTemplateProps {
  children: React.ReactNode;
}

export interface StyleProps {
  direction: Direction;
  textAlign: 'right' | 'left';
  fontFamily: string;
  maxWidth?: string;
  minHeight?: string;
  margin?: string;
  position?: 'relative' | 'absolute' | 'fixed';
  overflow?: 'hidden' | 'auto' | 'scroll';
}

export interface ClassicTemplateProps extends BaseTemplateProps {}      // תבנית קלאסית - מסודרת ומאורגנת
export interface ProfessionalTemplateProps extends BaseTemplateProps {} // תבנית מקצועית - מדגישה ניסיון והישגים
export interface GeneralTemplateProps extends BaseTemplateProps {}      // תבנית כללית - גמישה ונוחה להתאמה
export interface CreativeTemplateProps extends BaseTemplateProps {}     // תבנית יצירתית - מאפשרת בולטות וייחודיות 