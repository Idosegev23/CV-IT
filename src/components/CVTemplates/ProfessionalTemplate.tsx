'use client';
import React, { useEffect } from 'react';
import { ResumeData, Language, Degree, MilitaryService, PersonalInfo, Experience, Skills } from '../../types/resume';
import '../../styles/templates/professional.css';
import { Assistant, Rubik } from 'next/font/google';
import { formatDate } from './utils';
import { Edit2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ProfessionalTemplateProps {
  data: ResumeData;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index: number) => void;
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'date';
  value?: any;
  placeholder?: string;
}

interface OldDegree {
  type: string;
  field: string;
  institution: string;
  years?: string;
  specialization?: string;
}

const assistant = Assistant({ 
  subsets: ['hebrew', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-assistant',
  preload: true,
  display: 'swap',
});

const translations = {
  he: {
    skills: 'כישורים',
    languages: 'שפות',
    workExperience: 'ניסיון תעסוקתי',
    education: 'השכלה',
    militaryService: 'שירות צבאי',
    professionalSummary: 'תקציר מקצועי',
    email: 'דוא"ל',
    phone: 'טלפון',
    address: 'כתובת',
    specialization: 'התמחות',
    to: 'עד',
    present: 'היום',
    technicalSkills: 'כישורים טכניים',
    softSkills: 'כישורים רכים',
    skillLevel: 'רמת מיומנות'
  },
  en: {
    skills: 'Skills',
    languages: 'Languages',
    workExperience: 'Work Experience',
    education: 'Education',
    militaryService: 'Military Service',
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

const ProfessionalTemplate: React.FC<ProfessionalTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {},
  onEdit = () => {}
}) => {
  const cvLang = data.lang;
  const t = translations[cvLang as keyof typeof translations];
  const { personalInfo, experience, education, skills } = data;
  const military = data.military as MilitaryService | undefined;
  const isRTL = cvLang === 'he';

  useEffect(() => {
    const adjustSize = () => {
      const content = document.querySelector('.professional-template') as HTMLElement;
      if (!content) return;
      
      const A4_HEIGHT = 1123;
      let scale = 1;
      const contentHeight = content.scrollHeight;
      
      if (contentHeight > A4_HEIGHT) {
        scale = A4_HEIGHT / contentHeight;
        document.documentElement.style.setProperty('--scale-factor', `${scale}`);
      }
    };

    adjustSize();
    window.addEventListener('resize', adjustSize);
    return () => window.removeEventListener('resize', adjustSize);
  }, [data]);

  const splitName = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    return { firstName, lastName };
  };

  const getSkillLevel = (level: number) => {
    if (typeof level !== 'number') return 'רמה טובה';

    const levels: { [key: number]: string } = {
      5: 'רמה גבוהה מאוד',
      4: 'רמה גבוהה',
      3: 'רמה טובה',
      2: 'רמה מינונית',
      1: 'רמה בסיסית'
    };

    return levels[level] || 'רמה טובה';
  };

  const handleEdit = (type: string, index: number = 0) => {
    if (onEdit) {
      onEdit(type, index);
    }
  };

  return (
    <div className={cn(
      "professional-template",
      assistant.className
    )}>
      <div className="professional-right-column">
        <div className="professional-header">
          {/* Personal Info Section */}
          <div className="professional-name relative">
            <div className="professional-name-first">{splitName(personalInfo.name).firstName}</div>
            <div className="professional-name-last">{splitName(personalInfo.name).lastName}</div>
            {isEditing && (
              <button
                onClick={() => handleEdit('personalInfo', 0)}
                className="edit-button"
                title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          <div className="professional-separator" />

          <div className="professional-contact">
            {personalInfo.phone && (
              <div className="professional-contact-item">
                <Image
                  src="/design/professional/PhoneIcon.svg"
                  alt="phone"
                  width={16}
                  height={16}
                  className="contact-icon"
                />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.email && (
              <div className="professional-contact-item">
                <Image
                  src="/design/professional/MailIcon.svg"
                  alt="email"
                  width={16}
                  height={16}
                  className="contact-icon"
                />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="professional-contact-item">
                <Image
                  src="/design/professional/LocIcon.svg"
                  alt="address"
                  width={16}
                  height={16}
                  className="contact-icon"
                />
                <span>{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="professional-contact-item">
                <Image
                  src="/design/professional/LinkedInIcon.svg"
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

        {/* כישורים */}
        {((skills.technical && skills.technical.length > 0) || 
          (skills.soft && skills.soft.length > 0) ||
          (skills.languages && skills.languages.length > 0)) && (
          <section className="relative">
            <h2 className="professional-section-title">
              {t.skills}
              {isEditing && (
                <button 
                  onClick={() => handleEdit('skills', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך כישורים' : 'Edit Skills'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            <div className="professional-separator" />
            <div className="professional-skills">
              {skills.technical.length > 0 && (
                <>
                  <h3 className="professional-subsection-title">{t.technicalSkills}</h3>
                  {skills.technical.map((skill, index) => (
                    <div key={`tech-${index}`} className="professional-skill-item">
                      <div className="professional-skill-content">
                        <div className="professional-skill-wrapper">
                          <span className="professional-skill-name">{skill.name}</span>
                          <span className="professional-skill-level">{getSkillLevel(skill.level)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {skills.soft.length > 0 && (
                <>
                  <h3 className="professional-subsection-title">{t.softSkills}</h3>
                  {skills.soft.map((skill, index) => (
                    <div key={`soft-${index}`} className="professional-skill-item">
                      <div className="professional-skill-content">
                        <span className="professional-skill-name">{skill.name}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        )}

        {/* שפות */}
        {skills.languages && skills.languages.length > 0 && (
          <section className="relative" style={{ marginTop: '2rem' }}>
            <h2 className="professional-section-title">
              {t.languages}
              {isEditing && (
                <button 
                  onClick={() => handleEdit('languages', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            <div className="professional-separator" />
            <div className="professional-skills">
              {skills.languages.map((langItem: Language, index) => (
                <div key={`lang-${index}`} className="professional-skill-item">
                  <div className="professional-skill-content">
                    <span className="professional-skill-name">{langItem.language}</span>
                    <span className="professional-skill-separator">|</span>
                    <span className="professional-skill-level">{langItem.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* לוגו */}
        <div className="professional-logo">
          <img src="/design/piont.svg" alt="logo" />
        </div>
      </div>

      {/* עמודה שמאלית */}
      <div className="professional-left-column">
        {/* תקציר מקצועי */}
        <section className="professional-summary relative">
          {isEditing && (
            <button 
              onClick={() => handleEdit('professionalSummary', 0)}
              className="edit-button"
              title={lang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <h2 className="professional-section-title">{t.professionalSummary}</h2>
          <p className="professional-summary-text" style={{
            textAlign: 'justify',
            padding: '0 1rem',
            margin: '0.5rem 0',
            maxWidth: '100%',
            wordWrap: 'break-word',
            overflow: 'hidden'
          }}>
            {personalInfo.summary || (isEditing ? (lang === 'he' ? 'לחץ על העיפרון כדי להוסיף תקציר מקצועי' : 'Click the pencil to add a professional summary') : '')}
          </p>
        </section>

        {/* ניסיון תעסוקתי */}
        {experience && experience.length > 0 && (
          <section className="professional-experience">
            <h2 className="professional-section-title">
              {t.workExperience}
              {isEditing && (
                <button 
                  onClick={() => handleEdit('experience', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            {[...experience]
              .sort((a, b) => {
                const yearA = parseInt(a.startDate) || 0;
                const yearB = parseInt(b.startDate) || 0;
                return yearB - yearA; // החדש ביותר למעלה
              })
              .map((exp, index) => (
              <div key={index} className="professional-experience-item relative">
                <div className="professional-experience-header">
                  <div className="professional-experience-title-wrapper">
                    <span className="professional-experience-title">{exp.position}</span>
                    {exp.company && (
                      <>
                        <span className="professional-experience-separator">|</span>
                        <span className="professional-experience-company">{exp.company}</span>
                      </>
                    )}
                  </div>
                  <span className="professional-experience-date">
                    {formatDate(exp.startDate, exp.endDate, lang)}
                  </span>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="professional-experience-description">
                    {exp.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* השכלה */}
        {education?.degrees && education.degrees.length > 0 && (
          <section className="professional-education">
            <h2 className="professional-section-title">
              {t.education}
              {isEditing && (
                <button 
                  onClick={() => handleEdit('education', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            {education.degrees.map((degree: any, index) => (
              <div key={index} className="professional-education-item relative">
                <div className="professional-education-header">
                  <div className="professional-education-title-wrapper">
                    <span className="professional-education-title">
                      {degree.type} {degree.field}
                    </span>
                    {degree.institution && (
                      <>
                        <span className="professional-experience-separator">|</span>
                        <span className="professional-education-institution">{degree.institution}</span>
                      </>
                    )}
                  </div>
                  <span className="professional-education-date">
                    {formatDate(degree.startDate || degree.years?.split('-')[0] || '', 
                               degree.endDate || degree.years?.split('-')[1] || '', 
                               lang)}
                  </span>
                </div>
                {degree.specialization && (
                  <div className="professional-education-specialization">
                    התמחות: {degree.specialization}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* שירות צבאי */}
        {(military || isEditing) && (
          <section className="professional-military-section">
            <h2 className="professional-section-title">
              {t.militaryService}
              {isEditing && (
                <button 
                  onClick={() => handleEdit('military', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            {military && (
              <div className="professional-military-item relative">
                <div className="professional-military-header">
                  <div className="professional-military-title-wrapper">
                    <span className="professional-military-title">{military.role}</span>
                    {military.unit && (
                      <>
                        <span className="professional-experience-separator">|</span>
                        <span className="professional-military-unit">{military.unit}</span>
                      </>
                    )}
                  </div>
                  <span className="professional-military-date">
                    {formatDate(military.startDate, military.endDate, lang)}
                  </span>
                </div>
                {military.description && military.description.length > 0 && (
                  <ul className="professional-experience-description">
                    {military.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTemplate; 