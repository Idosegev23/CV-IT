export type TemplateId = 'classic' | 'professional' | 'general' | 'creative';
export type TemplateType = TemplateId;

export interface Language {
  language: string;
  level: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface Skills {
  soft: Skill[];
  technical: Skill[];
  languages: Language[];
}

export interface RawMilitaryService {
  role: string;
  years: string;
  achievements: string[];
}

export interface MilitaryService {
  role: string;
  unit: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Degree {
  type: string;
  field: string;
  institution: string;
  startDate: string;
  endDate: string;
  specialization?: string;
}

export interface Education {
  degrees: Degree[];
}

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string[];
  achievements?: string[];
  location?: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  summary?: string;
}

export interface Recommendation {
  name: string;
  role: string;
  text: string;
  company: string;
}

export interface Reference {
  name: string;
  position: string;
  company: string;
  contact: string;
}

export interface Metadata {
  showReferences: boolean;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
    summary: string;
  };
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  education: {
    degrees: Degree[];
  };
  skills: {
    technical: Array<{ name: string; level: number }>;
    soft: Array<{ name: string; level: number }>;
    languages: Array<{ language: string; level: string }>;
  };
  template: string;
  references: any[];
  lang: string;
  interfaceLang?: string;
  military?: {
    role: string;
    unit: string;
    startDate: string;
    endDate: string;
    description: string[];
  };
} 