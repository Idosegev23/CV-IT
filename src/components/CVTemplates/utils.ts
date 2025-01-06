import { ResumeData } from '@/types/resume';

export const createSafeData = (data: any): ResumeData => {
  return {
    personalInfo: {
      name: data?.personal_details?.name || '',
      title: data?.professional_summary?.split('.')[0] || '',
      email: data?.personal_details?.email || '',
      phone: data?.personal_details?.phone || '',
      address: data?.personal_details?.address || '',
      linkedin: data?.personalInfo?.linkedin || '',
      summary: data?.professional_summary || ''
    },
    experience: Array.isArray(data?.experience) ? data.experience.map((exp: any) => ({
      position: exp.title || '',
      company: exp.company || '',
      location: '',
      startDate: exp.years?.split('-')[0]?.trim() || '',
      endDate: exp.years?.split('-')[1]?.trim() || '',
      description: exp.achievements || []
    })) : [],
    education: {
      degrees: data?.education?.degrees || []
    },
    skills: {
      technical: data?.skills?.technical || [],
      soft: data?.skills?.soft || [],
      languages: Array.isArray(data?.skills?.languages) 
        ? data.skills.languages 
        : Object.entries(data?.languages || {}).map(([language, level]) => ({
            language,
            level: level as string
          }))
    },
    military: data?.military_service ? {
      role: data?.military_service?.role || '',
      unit: 'צה"ל',
      startDate: data?.military_service?.years?.split('-')[0]?.trim() || '',
      endDate: data?.military_service?.years?.split('-')[1]?.trim() || '',
      description: data?.military_service?.achievements || []
    } : undefined,
    template: data?.template_id || 'classic',
    references: [],
    lang: data?.lang || 'he'
  };
};

export const splitName = (fullName: string) => {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');
  return { firstName, lastName };
};

export const getSkillLevel = (level: number, lang: string = 'he') => {
  const levels: { [key: number]: { he: string; en: string } } = {
    5: { he: 'רמה גבוהה מאוד', en: 'Expert Level' },
    4: { he: 'רמה גבוהה', en: 'Advanced Level' },
    3: { he: 'רמה טובה', en: 'Intermediate Level' },
    2: { he: 'רמה בינונית', en: 'Basic Level' },
    1: { he: 'רמה בסיסית', en: 'Beginner Level' }
  };

  return levels[level]?.[lang as 'he' | 'en'] || 
    (lang === 'he' ? 'רמה טובה' : 'Good Level');
};

export const formatDate = (startDate: string | undefined, endDate?: string, lang: string = 'he') => {
  if (!startDate) return '';
  if (!endDate) return startDate;
  
  const formattedEnd = endDate === 'כיום' || endDate === 'היום' ? 
    translations[lang as keyof typeof translations].present : 
    endDate;
  
  return lang === 'he' ? 
    `${startDate} - ${formattedEnd}` : 
    `${startDate} ${translations[lang as keyof typeof translations].to} ${formattedEnd}`;
};

export const translations = {
  he: {
    skills: 'כישורים',
    languages: 'שפות',
    workExperience: 'ניסיון תעסוקתי',
    education: 'השכלה',
    militaryService: 'שירות צבאי',
    professionalSummary: 'תקציר מקצועי',
    summary: 'תקציר מקצועי',
    email: 'דוא"ל',
    phone: 'טלפון',
    address: 'כתובת',
    specialization: 'התמחות',
    to: 'עד',
    present: 'היום',
    technicalSkills: 'כישורים טכניים',
    softSkills: 'כישורים רכים',
    skillLevel: 'רמת מיומנות',
    topDecoration: 'קישוט עליון',
    bottomDecoration: 'קישוט תחתון',
    greyBackground: 'רקע אפור',
    emptyDot: 'נקודה ריקה',
    fullDot: 'נקודה מלאה'
  },
  en: {
    skills: 'Skills',
    languages: 'Languages',
    workExperience: 'Work Experience',
    education: 'Education',
    militaryService: 'Military Service',
    professionalSummary: 'Professional Summary',
    summary: 'Professional Summary',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    specialization: 'Specialization',
    to: 'to',
    present: 'Present',
    technicalSkills: 'Technical Skills',
    softSkills: 'Soft Skills',
    skillLevel: 'Skill Level',
    topDecoration: 'Top decoration',
    bottomDecoration: 'Bottom decoration',
    greyBackground: 'Grey background',
    emptyDot: 'Empty dot',
    fullDot: 'Full dot'
  }
};

export const A4_HEIGHT_MM = 297;
export const A4_WIDTH_MM = 210;
export const MM_TO_PX = 3.7795275591;

export const calculateOptimalFontSize = (
  container: HTMLElement,
  maxHeight: number,
  maxWidth: number,
  minFontSize = 8,
  maxFontSize = 16
): number => {
  let low = minFontSize;
  let high = maxFontSize;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    container.style.fontSize = `${mid}px`;
    
    if (container.scrollHeight <= maxHeight && container.scrollWidth <= maxWidth) {
      low = mid + 0.5;
    } else {
      high = mid - 0.5;
    }
  }
  
  return high;
};

export const adjustTemplateSize = (containerSelector: string) => {
  const container = document.querySelector(containerSelector) as HTMLElement;
  if (!container) return;

  const maxHeight = A4_HEIGHT_MM * MM_TO_PX;
  const maxWidth = A4_WIDTH_MM * MM_TO_PX;
  
  // חישוב גודל פונט אופטימלי
  const optimalFontSize = calculateOptimalFontSize(container, maxHeight, maxWidth);
  
  // עדכון משתני CSS
  document.documentElement.style.setProperty('--base-font-size', `${optimalFontSize}px`);
  document.documentElement.style.setProperty('--header-font-size', `${optimalFontSize * 1.5}px`);
  document.documentElement.style.setProperty('--section-title-font-size', `${optimalFontSize * 1.25}px`);
  document.documentElement.style.setProperty('--content-font-size', `${optimalFontSize}px`);
};

export const getTranslation = (key: string, lang: string, contentLang: string) => {
  const languageToUse = contentLang || lang;
  return translations[languageToUse as keyof typeof translations]?.[key as keyof (typeof translations)['he']] || key;
};

export const formatDescription = (descriptions: string[], totalJobs: number) => {
  // אם יש יותר מ-3 משרות או שזה שירות צבאי, מציג רק 2 תיאורים
  const maxDescriptions = totalJobs > 3 ? 2 : descriptions.length;
  
  // מקצר את התיאורים לפי המקסימום שקבענו
  const shortenedDescriptions = descriptions
    .slice(0, maxDescriptions)
    .map(desc => {
      if (desc.length > 100) {
        return desc.substring(0, 97) + '...';
      }
      return desc;
    });

  // מחזיר את התיאורים כמערך נפרד עם מפריד
  return shortenedDescriptions.map((desc, index, arr) => {
    if (index === arr.length - 1) return desc;
    return desc + ' | ';
  });
}; 