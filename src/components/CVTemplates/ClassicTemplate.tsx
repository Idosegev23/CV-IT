'use client';
import React, { useEffect, useState, useRef } from 'react';
import { ResumeData, Degree } from '@/types/resume';
import '../../styles/templates/classic.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';
import { adjustTemplateSize, formatDescription, formatDate, getSkillLevel } from './utils';
import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonalInfoEdit } from '../EditableFields/PersonalInfoEdit';

// הגדרת טיפוסים
interface TechnicalSkill {
  name: string;
  level: number;
}

interface SoftSkill {
  name: string;
  level: number;
}

interface LanguageSkill {
  language: string;
  level: string;
}

interface Skills {
  technical: TechnicalSkill[];
  soft: SoftSkill[];
  languages: LanguageSkill[];
}

interface ResumeDataWithSkills extends ResumeData {
  skills: Skills;
}

interface ClassicTemplateProps {
  data: ResumeData;
  lang: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index?: number) => void;
  displayLang?: 'he' | 'en';
}

interface TransformedMilitary {
  role: string;
  unit: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'date';
  value?: any;
  placeholder?: string;
}

// A4 Dimensions and Section Calculations
const A4_DIMENSIONS = {
  width: '210mm',
  height: '297mm',
  padding: {
    top: '20mm',
    bottom: '20mm',
    left: '20mm',
    right: '20mm'
  },
  contentHeight: '257mm', // 297mm - 40mm (top + bottom padding)
  contentWidth: '170mm'   // 210mm - 40mm (left + right padding)
} as const;

const SECTION_HEIGHT_RATIOS = {
  header: 0.15,        // 15% מהגובה הכולל
  summary: 0.15,       // 15% מהגובה הכולל
  experience: 0.35,    // 35% מהגובה הכולל
  education: 0.15,     // 15% מהגובה הכולל
  skills: 0.15,        // 15% מהגובה הכולל
  additional: 0.05     // 5% מהגובה הכולל
} as const;

const calculateMaxSectionHeight = (section: keyof typeof SECTION_HEIGHT_RATIOS) => {
  const contentHeightInMm = 257; // A4_DIMENSIONS.contentHeight in mm
  return `${contentHeightInMm * SECTION_HEIGHT_RATIOS[section]}mm`;
};

const checkSectionOverflow = (sectionRef: React.RefObject<HTMLElement>) => {
  if (sectionRef.current) {
    const { scrollHeight, clientHeight } = sectionRef.current;
    return scrollHeight > clientHeight;
  }
  return false;
};

const assistant = Assistant({ 
  subsets: ['hebrew', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-assistant',
});

const translations = {
  he: {
    skills: 'כישורים',
    languages: 'שפות',
    workExperience: 'ניסיון תעסוקתי',
    education: 'השכלה',
    militaryService: 'שירות צבאי',
    nationalService: 'שירות לאומי',
    professionalSummary: 'תקציר מקצועי',
    email: 'דוא"ל',
    phone: 'טלפון',
    address: 'כתובת',
    specialization: 'התמחות',
    grade: 'ממוצע ציונים',
    to: 'עד',
    present: 'היום',
    technicalSkills: 'כישורים טכניים',
    softSkills: 'כישורים רכים',
    skillLevel: 'רמת מנות'
  },
  en: {
    skills: 'Skills',
    languages: 'Languages',
    workExperience: 'Work Experience',
    education: 'Education',
    militaryService: 'Military Service',
    nationalService: 'National Service',
    professionalSummary: 'Professional Summary',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    specialization: 'Specialization',
    grade: 'GPA',
    to: 'to',
    present: 'Present',
    technicalSkills: 'Technical Skills',
    softSkills: 'Soft Skills',
    skillLevel: 'Skill Level'
  }
};

interface OverflowContent {
  sectionName: string;
  content: string;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ 
  data,
  lang,
  isEditing = false,
  onUpdate,
  onDelete,
  onEdit,
  displayLang = 'he'
}) => {
  const t = translations[displayLang as keyof typeof translations];
  const { personalInfo, experience, education, skills, military } = data;
  const isRTL = displayLang === 'he';
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [overflowContent, setOverflowContent] = useState<OverflowContent | null>(null);

  // הוספת refs לכל סקציה
  const summaryRef = React.useRef<HTMLElement>(null);
  const experienceRef = React.useRef<HTMLElement>(null);
  const educationRef = React.useRef<HTMLElement>(null);
  const skillsRef = React.useRef<HTMLElement>(null);

  // בדיקת חריגות בכל שינוי של הדאטה
  useEffect(() => {
    if (!isEditing) return; // בדיקת חריגות רק במצב עריכה

    const sections = {
      summary: { ref: summaryRef, name: t.professionalSummary },
      experience: { ref: experienceRef, name: t.workExperience },
      education: { ref: educationRef, name: t.education },
      skills: { ref: skillsRef, name: t.skills }
    };

    Object.entries(sections).forEach(([sectionKey, { ref, name }]) => {
      if (ref.current) {
        const { scrollHeight, clientHeight } = ref.current;
        const hasOverflow = scrollHeight > clientHeight;
        
        if (hasOverflow) {
          ref.current.classList.add('overflow-warning');
          // שמירת התוכן שנחתך
          const overflowAmount = scrollHeight - clientHeight;
          const content = ref.current.innerHTML;
          setOverflowContent({
            sectionName: name,
            content: `תוכן נחתך בסקציית ${name}. גובה חריגה: ${Math.round(overflowAmount)}px`
          });
        } else {
          ref.current.classList.remove('overflow-warning');
        }
      }
    });
  }, [data, isEditing, t]);

  console.log('ClassicTemplate - Full data:', data);
  console.log('ClassicTemplate - Skills:', skills);
  console.log('ClassicTemplate - Languages:', skills?.languages);

  const splitName = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    return { firstName, lastName };
  };

  const { firstName, lastName } = splitName(personalInfo.name);

  useEffect(() => {
    adjustTemplateSize('.classic-template');
  }, [data]);

  const handleEdit = (type: string, index: number = 0) => {
    if (onEdit) {
      onEdit(type, index);
    }
  };

  const handlePersonalInfoSave = (newData: any) => {
    if (onUpdate) {
      onUpdate('personalInfo', newData);
    }
  };

  return (
    <>
      <div 
        className={cn(
          assistant.className,
          'classic-template',
          displayLang === 'he' ? 'classic-template-he' : 'classic-template-en',
          isEditing && 'is-editing'
        )}
        dir={displayLang === 'he' ? 'rtl' : 'ltr'}
        style={{
          width: A4_DIMENSIONS.width,
          height: A4_DIMENSIONS.height,
          padding: `${A4_DIMENSIONS.padding.top} ${A4_DIMENSIONS.padding.right} ${A4_DIMENSIONS.padding.bottom} ${A4_DIMENSIONS.padding.left}`,
          margin: '0 auto',
          background: 'white',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          border: process.env.NODE_ENV === 'development' ? '1px solid #ccc' : 'none'
        }}
      >
        <div className={cn(
          "classic-header relative",
          displayLang === 'he' ? 'classic-header-he' : 'classic-header-en'
        )}>
          <div className="relative z-10">
            <div className={cn(
              "header-name-wrapper",
              displayLang === 'he' ? 'header-name-wrapper-he' : 'header-name-wrapper-en'
            )}>
              {isEditing && (
                <button
                  onClick={() => setIsPersonalInfoOpen(true)}
                  className="edit-button"
                  title={displayLang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <h1 className="header-name">
                <span className={cn(
                  "header-name-first",
                  displayLang === 'he' ? 'header-name-first-he' : 'header-name-first-en'
                )}>
                  {firstName}
                </span>
                {lastName && (
                  <span className={cn(
                    "header-name-last",
                    displayLang === 'he' ? 'header-name-last-he' : 'header-name-last-en'
                  )}>
                    {lastName}
                  </span>
                )}
              </h1>
              <Image
                src="/design/classic/dec.svg"
                alt="header decoration"
                width={40}
                height={40}
                className={cn(
                  "header-corner-decoration",
                  displayLang === 'he' ? 'header-corner-decoration-he' : 'header-corner-decoration-en'
                )}
                priority={true}
              />
            </div>
            <div className={cn(
              "header-contact",
              displayLang === 'he' ? 'header-contact-he' : 'header-contact-en'
            )}>
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.email && personalInfo.phone && <span className="contact-separator">|</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.phone && personalInfo.address && <span className="contact-separator">|</span>}
              {personalInfo.address && <span>{personalInfo.address}</span>}
              {personalInfo.address && personalInfo.linkedin && <span className="contact-separator">|</span>}
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            </div>
          </div>
        </div>

        <PersonalInfoEdit
          isOpen={isPersonalInfoOpen}
          onClose={() => setIsPersonalInfoOpen(false)}
          data={data.personalInfo}
          onSave={handlePersonalInfoSave}
          isRTL={displayLang === 'he'}
          template="classic"
        />

        <main className="classic-content">
          {/* תקציר */}
          {data.personalInfo.summary && (
            <section 
              ref={summaryRef as React.RefObject<HTMLElement>}
              className="summary-section section-container relative"
              style={{ maxHeight: calculateMaxSectionHeight('summary') }}
            >
              {isEditing && (
                <button
                  onClick={() => handleEdit('professionalSummary')}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <div className="summary-content">
                {data.personalInfo.summary}
              </div>
            </section>
          )}

          {/* ניסיון תעסוקתי */}
          {experience && experience.length > 0 && (
            <section 
              ref={experienceRef as React.RefObject<HTMLElement>}
              className="experience-section section-container relative"
              style={{ maxHeight: calculateMaxSectionHeight('experience') }}
            >
              <div className="section-container">
                <h2 className="section-title relative flex items-center justify-between">
                  <div className="flex items-center">
                    {t.workExperience}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('experience')}
                      className="edit-button mr-2"
                      title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </h2>
                <div className="experience-items">
                  {experience.map((exp, index) => (
                    <div key={index} className="experience-item relative">
                      <div className="experience-header">
                        <div className="experience-title-wrapper">
                          <div className="flex items-center gap-1">
                            <span className="experience-title">{exp.position}</span>
                          </div>
                          {exp.company && (
                            <>
                              <span className="experience-separator">|</span>
                              <span className="experience-company">{exp.company}</span>
                            </>
                          )}
                        </div>
                        <div className="experience-date">
                          {formatDate(exp.startDate, exp.endDate, displayLang)}
                        </div>
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="experience-description">
                          {exp.description.map((desc, i) => (
                            <li key={i}>{desc}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* השכלה */}
          {education?.degrees && education.degrees.length > 0 && (
            <section 
              ref={educationRef as React.RefObject<HTMLElement>}
              className="education-section section-container relative"
              style={{ maxHeight: calculateMaxSectionHeight('education') }}
            >
              <div className="section-container">
                <h2 className="section-title relative flex items-center justify-between">
                  <div className="flex items-center">
                    {t.education}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('education')}
                      className="edit-button mr-2"
                      title={lang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </h2>
                <div className="education-items">
                  {education.degrees.map((degree, index) => (
                    <div key={index} className="education-item relative">
                      <div className="education-header">
                        <div className="education-title-wrapper">
                          <div className="flex items-center gap-1">
                            <span className="education-degree">
                              {`${degree.type} ${degree.field}`}
                            </span>
                          </div>
                          <span className="experience-separator">|</span>
                          <span className="education-institution">{degree.institution}</span>
                        </div>
                        <div className="education-date">
                          {formatDate(degree.startDate, degree.endDate, displayLang)}
                        </div>
                      </div>
                      {degree.specialization && (
                        <div className="education-specialization">
                          {`${t.specialization}: ${degree.specialization}`}
                        </div>
                      )}
                      {degree.grade && (
                        <div className="education-grade">
                          {`${t.grade}: ${degree.grade}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* שירות צבאי/לאומי */}
          {military && (
            <section className="military-section">
              <div className="section-container">
                <h2 className="section-title relative flex items-center justify-between">
                  <div className="flex items-center">
                    {military.role?.toLowerCase().includes('לאומי') ? t.nationalService : t.militaryService}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('military')}
                      className="edit-button mr-2"
                      title={lang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </h2>
                <div className="military-content">
                  <div className="military-header">
                    <div className="military-title-wrapper">
                      <div className="flex items-center gap-1">
                        <h3 className="military-title">{military.role}</h3>
                        <span className="military-separator">|</span>
                        <span className="military-unit">{military.unit}</span>
                      </div>
                    </div>
                    <div className="military-date">
                      {formatDate(military.startDate, military.endDate, displayLang)}
                    </div>
                  </div>
                  {military.description && military.description.length > 0 && (
                    <ul className="military-description">
                      {formatDescription(military.description, 3).map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* כישורים */}
          {skills && (skills.technical?.length > 0 || skills.soft?.length > 0) && (
            <section 
              ref={skillsRef as React.RefObject<HTMLElement>}
              className="skills-section section-container relative"
              style={{ maxHeight: calculateMaxSectionHeight('skills') }}
            >
              <div className="section-container">
                <h2 className="section-title relative flex items-center justify-between">
                  <div className="flex items-center">
                    {t.skills}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('skills')}
                      className="edit-button mr-2"
                      title={lang === 'he' ? 'ערוך כישורים' : 'Edit Skills'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </h2>
                <div className="skills-items">
                  {/* כישורים טכניים */}
                  {skills.technical && skills.technical.length > 0 && (
                    <>
                      <h3 className="skills-subtitle">{t.technicalSkills}</h3>
                      {skills.technical.map((skill, index) => (
                        <span key={`tech-${index}`} className="skill-item relative">
                          <span className="skill-name">{skill.name}</span>
                          {" - "}
                          <span className="skill-level">{getSkillLevel(skill.level, displayLang)}</span>
                          {index < skills.technical.length - 1 && " | "}
                        </span>
                      ))}
                    </>
                  )}
                  
                  {/* כישורים רכים */}
                  {skills.soft && skills.soft.length > 0 && (
                    <>
                      <h3 className="skills-subtitle">{t.softSkills}</h3>
                      {skills.soft.map((skill, index) => (
                        <span key={`soft-${index}`} className="skill-item relative">
                          <span className="skill-name">{skill.name}</span>
                          {index < skills.soft.length - 1 && " | "}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* שפות - סקציה נפרדת */}
          {(() => {
            console.log('Languages data:', skills?.languages);
            console.log('Display language:', displayLang);
            return skills?.languages && Array.isArray(skills.languages) && skills.languages.length > 0 && (
              <section className="languages-section">
                <div className="section-container">
                  <h2 className="section-title relative flex items-center justify-between">
                    <div className="flex items-center">
                      {t.languages}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleEdit('languages')}
                        className="edit-button mr-2"
                        title={lang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </h2>
                  <div className={cn(
                    "languages-items",
                    displayLang === 'he' ? 'text-right' : 'text-left'
                  )}>
                    {skills.languages.map((langItem, index) => {
                      console.log('Rendering language item:', langItem);
                      return (
                        <span key={`lang-${index}`} className="language-item">
                          <span className="language-name">{langItem.language}</span>
                          {" - "}
                          <span className="language-level">{langItem.level}</span>
                          {index < skills.languages.length - 1 && <span className="language-separator"> | </span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })()}
        </main>

        <div className="classic-footer">
        </div>
      </div>

      {/* פופאפ לתוכן שנחתך */}
      {isEditing && overflowContent && (
        <div className={cn("overflow-popup", "show", displayLang === 'he' ? 'rtl' : 'ltr')}>
          <div className="overflow-popup-title">
            {displayLang === 'he' ? 'התראת חריגת תוכן' : 'Content Overflow Alert'}
          </div>
          <div className="overflow-popup-content">
            {overflowContent.content}
          </div>
        </div>
      )}
    </>
  );
};

export default ClassicTemplate;