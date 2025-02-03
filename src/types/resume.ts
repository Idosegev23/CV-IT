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

export interface Languages {
  [key: string]: string;
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

export type DegreeType = 
  | 'academic' // תואר אקדמי
  | 'certification' // תעודת הסמכה
  | 'course' // קורס
  | 'bootcamp' // מחנה הכשרה
  | 'training' // הכשרה מקצועית
  | 'highschool' // תיכון
  | 'other'; // אחר

export interface RawDegree {
  type: string;
  field: string;
  years: string;
  institution: string;
  specialization?: string;
}

export interface Degree {
  type: string;
  degreeType: DegreeType;
  field: string;
  institution: string;
  startDate: string;
  endDate: string;
  specialization?: string;
  years?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  grade?: string;
  description?: string;
}

export interface Education {
  degrees: RawDegree[];
}

export interface RawExperience {
  title: string;
  years: string;
  company: string;
  achievements: string[];
}

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string | string[];
  achievements?: string[];
  location?: string;
}

export interface PersonalDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
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

export interface AdditionalInfo {
  certifications: any[];
}

export interface RawResumeData {
  skills: {
    soft: Skill[];
    technical: Skill[];
  };
  languages: Languages;
  education: Education;
  experience: RawExperience[];
  additional_info: AdditionalInfo;
  military_service: RawMilitaryService;
  personal_details: PersonalDetails;
  professional_summary: string;
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