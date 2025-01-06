import { ResumeData, Skill } from '@/types/resume';

interface RawSkill {
  name: string;
  level: string | number;
}

interface RawCVData {
  skills: {
    technical: RawSkill[];
    soft: RawSkill[];
    languages: {
      [key: string]: string;
    };
  } | RawSkill[] | any;
  education: {
    degrees: Array<{
      type: string;
      field: string;
      years: string;
      institution: string;
      specialization?: string;
    }>;
  };
  languages: {
    [key: string]: string;
  };
  experience: Array<{
    title: string;
    years: string;
    company: string;
    achievements: string[];
  }>;
  military_service: {
    role: string;
    years: string;
    achievements: string[];
  };
  personal_details: {
    name: string;
    email: string;
    phone: string;
    address: string;
    birth_date: string;
  };
  professional_summary: string;
}

export function transformResumeData(rawData: RawCVData): ResumeData {
  console.log('Raw data received:', JSON.stringify(rawData, null, 2));
  console.log('Raw skills structure:', {
    hasSkills: !!rawData.skills,
    hasTechnical: !!rawData.skills?.technical,
    hasSoft: !!rawData.skills?.soft,
    technicalIsArray: Array.isArray(rawData.skills?.technical),
    softIsArray: Array.isArray(rawData.skills?.soft),
  });

  let technical: Skill[] = [];
  let soft: Skill[] = [];

  if (rawData.skills) {
    if (Array.isArray(rawData.skills.technical)) {
      technical = rawData.skills.technical.map((skill: RawSkill) => ({
        name: skill.name,
        level: typeof skill.level === 'number' ? skill.level : parseInt(skill.level)
      }));
    }

    if (Array.isArray(rawData.skills.soft)) {
      soft = rawData.skills.soft.map((skill: RawSkill) => ({
        name: skill.name,
        level: typeof skill.level === 'number' ? skill.level : parseInt(skill.level)
      }));
    }
  }

  console.log('Final technical skills:', technical);
  console.log('Final soft skills:', soft);

  const languages = Object.entries(rawData.languages || {}).map(([language, level]) => ({
    language,
    level
  }));

  console.log('Transformed languages:', languages);

  const experience = (rawData.experience || []).map(exp => ({
    position: exp.title,
    company: exp.company,
    startDate: exp.years.split('-')[0].trim(),
    endDate: exp.years.split('-')[1]?.trim() || 'כיום',
    description: exp.achievements || []
  }));

  const military = rawData.military_service ? {
    role: rawData.military_service.role,
    unit: 'צה"ל',
    startDate: rawData.military_service.years.split('-')[0].trim(),
    endDate: rawData.military_service.years.split('-')[1].trim(),
    description: rawData.military_service.achievements
  } : undefined;

  const transformedData: ResumeData = {
    template: 'creative',
    personalInfo: {
      title: '',
      name: rawData.personal_details.name,
      email: rawData.personal_details.email,
      phone: rawData.personal_details.phone,
      address: rawData.personal_details.address,
      summary: rawData.professional_summary,
      linkedin: ''
    },
    experience,
    education: {
      degrees: rawData.education.degrees
    },
    skills: {
      technical,
      soft,
      languages
    },
    military,
    lang: 'he',
    references: []
  };

  console.log('Final transformed data structure:', {
    hasSkills: !!transformedData.skills,
    technicalLength: transformedData.skills.technical.length,
    softLength: transformedData.skills.soft.length,
    languagesLength: transformedData.skills.languages.length
  });

  return transformedData;
}

export function getLinkedInFieldValue(linkedInData: any, fieldType: string) {
  switch (fieldType) {
    case 'name':
      return `${linkedInData.personalInfo.firstName} ${linkedInData.personalInfo.lastName}`;
    case 'title':
      return linkedInData.personalInfo.title;
    case 'email':
      return linkedInData.personalInfo.email;
    case 'phone':
      return linkedInData.personalInfo.phone;
    case 'experience':
      return linkedInData.experience.map((exp: any) => ({
        title: exp.position,
        company: exp.company,
        years: `${exp.startDate}-${exp.endDate}`,
        achievements: exp.description ? [exp.description] : []
      }));
    case 'education':
      return linkedInData.education.map((edu: any) => ({
        type: edu.degree,
        field: edu.field,
        institution: edu.institution,
        years: `${edu.startDate}-${edu.endDate}`,
      }));
    case 'skills':
      return linkedInData.skills.map((skill: string) => ({
        name: skill,
        level: 3 // ברירת מחדל
      }));
    default:
      return null;
  }
} 