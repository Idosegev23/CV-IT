'use client';
import React, { useEffect } from 'react';
import { ResumeData, Degree } from '@/types/resume';
import '../../styles/templates/classic.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';
import { adjustTemplateSize, formatDescription, formatDate, getSkillLevel } from './utils';
import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  data: ResumeDataWithSkills;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index: number) => void;
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
    to: 'to',
    present: 'Present',
    technicalSkills: 'Technical Skills',
    softSkills: 'Soft Skills',
    skillLevel: 'Skill Level'
  }
};

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {},
  onEdit = () => {}
}) => {
  const cvLang = data.lang;
  const t = translations[cvLang as keyof typeof translations];
  const { personalInfo, experience, education, skills, military } = data;
  const isRTL = cvLang === 'he';

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

  return (
    <div className={`${assistant.className} classic-template`}
      data-cv-lang={cvLang}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ position: 'relative', background: 'white', width: '210mm', minHeight: '297mm', padding: 0, margin: '0 auto' }}
    >
      <div className="classic-header relative">
        <Image
          src="/design/classic/dec.svg"
          alt="header decoration"
          width={15}
          height={15}
          className="absolute top-1/2 -translate-y-1/2 right-12 header-corner-decoration"
          priority={true}
        />
        <div className="relative z-10">
          <div className="header-name-wrapper section-container">
            <h1 className="header-name">
              <div className="flex items-center">
                <span className="header-name-first">{firstName}</span>
                {lastName && <span className="header-name-last">{lastName}</span>}
                {isEditing && (
                  <button
                    onClick={() => onEdit('personalInfo', 0)}
                    className="edit-button ml-80 opacity-100"
                    title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </h1>
          </div>
          <div className="classic-contact-info">
            {personalInfo.email && (
              <div className="contact-item">
                <Image
                  src="/design/classic/MailIcon.svg"
                  alt="email"
                  width={16}
                  height={16}
                  className="contact-icon"
                />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="contact-item">
                <Image
                  src="/design/classic/PhoneIcon.svg"
                  alt="phone"
                  width={16}
                  height={16}
                  className="contact-icon"
                />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="contact-item">
                <Image
                  src="/design/classic/LocIcon.svg"
                  alt="address"
                  width={16}
                  height={16}
                  className="contact-icon"
                />
                <span>{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="contact-item">
                <Image
                  src="/design/classic/LinkedInIcon.svg"
                  alt="linkedin"
                  width={16}
                  height={16}
                  className="contact-icon"
                />
                <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="classic-content">
        {/* תקציר */}
        {data.personalInfo.summary && (
          <section className="summary-section section-container relative">
            <div className="summary-content">
              {data.personalInfo.summary}
              {isEditing && (
                <button
                  onClick={() => onEdit('professionalSummary', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>
        )}

        {/* ניסיון תעסוקתי */}
        {experience && experience.length > 0 && (
          <section className="experience-section">
            <div className="section-container">
              <h2 className="section-title relative">
                {t.workExperience}
                {isEditing && (
                  <button
                    onClick={() => onEdit('experience', 0)}
                    className="edit-button"
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
                        {formatDate(exp.startDate, exp.endDate, cvLang)}
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
          <section className="education-section">
            <div className="section-container">
              <h2 className="section-title relative">
                {t.education}
                {isEditing && (
                  <button
                    onClick={() => onEdit('education', 0)}
                    className="edit-button"
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
                        {formatDate(degree.startDate, degree.endDate, cvLang)}
                      </div>
                    </div>
                    {degree.specialization && (
                      <div className="education-specialization">
                        התמחות: {degree.specialization}
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
              <h2 className="section-title relative">
                {military.role?.toLowerCase().includes('לאומי') ? t.nationalService : t.militaryService}
                {isEditing && (
                  <button
                    onClick={() => onEdit('military', 0)}
                    className="edit-button"
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
                    {formatDate(military.startDate, military.endDate, lang)}
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
        {skills && (
          <section className="skills-section">
            <div className="section-container">
              <h2 className="section-title relative">
                {t.skills}
                {isEditing && (
                  <button
                    onClick={() => onEdit('skills', 0)}
                    className="edit-button"
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
                        <span className="skill-level">{getSkillLevel(skill.level, cvLang)}</span>
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

        {/* שפות */}
        {skills.languages && skills.languages.length > 0 && (
          <section className="languages-section section-container">
            <h2 className="section-title">
              {t.languages}
              {isEditing && (
                <button
                  onClick={() => onEdit('languages', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            <div className="languages-items">
              {skills.languages.map((langItem, index) => (
                <>
                  <span key={`lang-${index}`} className="languages-items">
                    <span className="skill-name">{langItem.language}</span> - <span>{langItem.level}</span>
                  </span>
                  {index < skills.languages.length - 1 && <span> | </span>}
                </>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="classic-footer">
      </div>
    </div>
  );
};

export default ClassicTemplate;