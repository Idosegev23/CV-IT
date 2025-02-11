'use client';
import React, { useEffect } from 'react';
import { ResumeData, Language, Degree, MilitaryService, PersonalInfo, Experience, Skills } from '../../types/resume';
import '../../styles/templates/professional.css';
import { Assistant, Rubik } from 'next/font/google';
import { formatDate } from './utils';
import { Edit2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type DisplayLanguage = 'he' | 'en';

interface ProfessionalTemplateProps {
  data: ResumeData;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index: number) => void;
  displayLang?: DisplayLanguage;
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

const translations: Record<DisplayLanguage, {
  skills: string;
  languages: string;
  workExperience: string;
  education: string;
  militaryService: string;
  nationalService: string;
  professionalSummary: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  grade: string;
  to: string;
  present: string;
  technicalSkills: string;
  softSkills: string;
  skillLevel: string;
}> = {
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
    skillLevel: 'רמת מיומנות'
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

const ProfessionalTemplate: React.FC<ProfessionalTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {},
  onEdit = () => {},
  displayLang = 'he'
}) => {
  const t = translations[displayLang as DisplayLanguage];
  const { personalInfo, experience, education, skills } = data;
  const military = data.military as MilitaryService | undefined;
  const isRTL = displayLang === 'he';

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
    if (typeof level !== 'number') return displayLang === 'he' ? 'רמה טובה' : 'Good Level';

    const levels: { [key: number]: { he: string; en: string } } = {
      5: { he: 'רמה גבוהה מאוד', en: 'Expert Level' },
      4: { he: 'רמה גבוהה', en: 'Advanced Level' },
      3: { he: 'רמה טובה', en: 'Intermediate Level' },
      2: { he: 'רמה מינונית', en: 'Basic Level' },
      1: { he: 'רמה בסיסית', en: 'Beginner Level' }
    };

    return levels[level]?.[displayLang] || (displayLang === 'he' ? 'רמה טובה' : 'Good Level');
  };

  const handleEdit = (type: string, index: number = 0) => {
    if (onEdit) {
      onEdit(type, index);
    }
  };

  return (
    <div className={cn(
      "professional-template",
      assistant.className,
      displayLang === ('he' as DisplayLanguage) ? 'professional-template-he' : 'professional-template-en'
    )}
    dir={displayLang === ('he' as DisplayLanguage) ? 'rtl' : 'ltr'}
    style={{
      width: '210mm',
      height: '297mm',
      margin: '0 auto',
      padding: '0',
      background: 'white',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div className={cn(
      "professional-right-column",
      displayLang === ('he' as DisplayLanguage) ? 'professional-right-column-he' : 'professional-right-column-en'
    )}>
      {displayLang === ('he' as DisplayLanguage) ? (
        <>
      <div className={cn(
        "professional-header",
            displayLang === ('he' as DisplayLanguage) ? 'professional-header-he' : 'professional-header-en'
      )}>
        <div className={cn(
          "professional-name relative",
              displayLang === ('he' as DisplayLanguage) ? 'professional-name-he' : 'professional-name-en'
        )}>
          <div className="professional-name-first">{splitName(personalInfo.name).firstName}</div>
          <div className="professional-name-last">{splitName(personalInfo.name).lastName}</div>
          {isEditing && (
            <button
              onClick={() => handleEdit('personalInfo', 0)}
              className={cn(
                "professional-edit-button professional-edit-button-personal",
                    displayLang === ('he' as DisplayLanguage) ? 'professional-edit-button-he' : 'professional-edit-button-en'
              )}
                  title={displayLang === ('he' as DisplayLanguage) ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>

        <div className="professional-separator" />

        <div className={cn(
          "professional-contact",
              displayLang === ('he' as DisplayLanguage) ? 'professional-contact-he' : 'professional-contact-en'
        )}>
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

      {((skills.technical && skills.technical.length > 0) || 
        (skills.soft && skills.soft.length > 0) ||
        (skills.languages && skills.languages.length > 0)) && (
        <section className="relative">
          <h2 className="professional-section-title">
            {t.skills}
            {isEditing && (
              <button 
                onClick={() => handleEdit('skills', 0)}
                className="professional-edit-button professional-edit-button-skills"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך כישורים' : 'Edit Skills'}
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

      {skills.languages && skills.languages.length > 0 && (
        <section className="relative" style={{ marginTop: '2rem' }}>
          <h2 className="professional-section-title">
            {t.languages}
            {isEditing && (
              <button 
                onClick={() => handleEdit('languages', 0)}
                className="professional-edit-button professional-edit-button-languages"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך שפות' : 'Edit Languages'}
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
                  <div className="professional-skill-wrapper">
                    <span className="professional-skill-name">{langItem.language}</span>
                    <span className="professional-skill-level">{langItem.level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
          )}
        </>
      ) : (
        <>
          <section className="professional-summary relative">
            {isEditing && (
              <button
                onClick={() => handleEdit('professionalSummary', 0)}
                className="professional-edit-button professional-edit-button-summary"
                title={displayLang === ('he' as DisplayLanguage) ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <p className="professional-summary-text" style={{
              textAlign: 'justify',
              padding: '0 1rem',
              margin: '0.5rem 0',
              maxWidth: '100%',
              wordWrap: 'break-word',
              overflow: 'hidden'
            }}>
              {personalInfo.summary || (isEditing ? (displayLang === ('he' as DisplayLanguage) ? 'לחץ על העיפרון כדי להוסיף תקציר מקצועי' : 'Click the pencil to add a professional summary') : '')}
            </p>
          </section>

          {experience && experience.length > 0 && (
            <section className="professional-experience">
              <h2 className="professional-section-title">
                {t.workExperience}
                {isEditing && (
                  <button 
                    onClick={() => handleEdit('experience', 0)}
                    className="professional-edit-button professional-edit-button-experience"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </h2>
              {[...experience]
                .sort((a, b) => {
                  const yearA = parseInt(a.startDate) || 0;
                  const yearB = parseInt(b.startDate) || 0;
                  return yearB - yearA;
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
                      {formatDate(exp.startDate, exp.endDate, displayLang)}
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

          {education?.degrees && education.degrees.length > 0 && (
            <section className="professional-education">
              <h2 className="professional-section-title">
                {t.education}
                {isEditing && (
                  <button 
                    onClick={() => handleEdit('education', 0)}
                    className="professional-edit-button professional-edit-button-education"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך השכלה' : 'Edit Education'}
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
                                 displayLang)}
                    </span>
                  </div>
                  {degree.specialization && (
                    <div className="professional-education-specialization">
                      {`${t.specialization}: ${degree.specialization}`}
                    </div>
                  )}
                  {degree.grade && (
                    <div className="professional-education-grade">
                      {`${t.grade}: ${degree.grade}`}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {(military || isEditing) && (
            <section className="professional-military-section">
              <h2 className="professional-section-title">
                {t.militaryService}
                {isEditing && (
                  <button 
                    onClick={() => handleEdit('military', 0)}
                    className="professional-edit-button professional-edit-button-military"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך שירות צבאי' : 'Edit Military Service'}
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
                      {formatDate(military.startDate, military.endDate, displayLang)}
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
        </>
      )}

      <div className="professional-logo">
        <img src="/design/piont.svg" alt="logo" />
      </div>
    </div>

    <div className={cn(
      "professional-left-column",
      displayLang === ('he' as DisplayLanguage) ? 'professional-left-column-he' : 'professional-left-column-en'
    )}>
      {displayLang === ('he' as DisplayLanguage) ? (
        <>
      <section className="professional-summary relative">
        {isEditing && (
          <button
            onClick={() => handleEdit('professionalSummary', 0)}
            className="professional-edit-button professional-edit-button-summary"
                title={displayLang === ('he' as DisplayLanguage) ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        <p className="professional-summary-text" style={{
          textAlign: 'justify',
          padding: '0 1rem',
          margin: '0.5rem 0',
          maxWidth: '100%',
          wordWrap: 'break-word',
          overflow: 'hidden'
        }}>
              {personalInfo.summary || (isEditing ? (displayLang === ('he' as DisplayLanguage) ? 'לחץ על העיפרון כדי להוסיף תקציר מקצועי' : 'Click the pencil to add a professional summary') : '')}
        </p>
      </section>

      {experience && experience.length > 0 && (
        <section className="professional-experience">
          <h2 className="professional-section-title">
            {t.workExperience}
            {isEditing && (
              <button 
                onClick={() => handleEdit('experience', 0)}
                className="professional-edit-button professional-edit-button-experience"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </h2>
          {[...experience]
            .sort((a, b) => {
              const yearA = parseInt(a.startDate) || 0;
              const yearB = parseInt(b.startDate) || 0;
                  return yearB - yearA;
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
                      {formatDate(exp.startDate, exp.endDate, displayLang)}
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

      {education?.degrees && education.degrees.length > 0 && (
        <section className="professional-education">
          <h2 className="professional-section-title">
            {t.education}
            {isEditing && (
              <button 
                onClick={() => handleEdit('education', 0)}
                className="professional-edit-button professional-edit-button-education"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך השכלה' : 'Edit Education'}
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
                                 displayLang)}
                </span>
              </div>
              {degree.specialization && (
                <div className="professional-education-specialization">
                  {`${t.specialization}: ${degree.specialization}`}
                </div>
              )}
              {degree.grade && (
                <div className="professional-education-grade">
                  {`${t.grade}: ${degree.grade}`}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {(military || isEditing) && (
        <section className="professional-military-section">
          <h2 className="professional-section-title">
            {t.militaryService}
            {isEditing && (
              <button 
                onClick={() => handleEdit('military', 0)}
                className="professional-edit-button professional-edit-button-military"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך שירות צבאי' : 'Edit Military Service'}
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
                      {formatDate(military.startDate, military.endDate, displayLang)}
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
        </>
      ) : (
        <>
          <div className={cn(
            "professional-header",
            displayLang === ('he' as DisplayLanguage) ? 'professional-header-he' : 'professional-header-en'
          )}>
            <div className={cn(
              "professional-name relative",
              displayLang === ('he' as DisplayLanguage) ? 'professional-name-he' : 'professional-name-en'
            )}>
              <div className="professional-name-first">{splitName(personalInfo.name).firstName}</div>
              <div className="professional-name-last">{splitName(personalInfo.name).lastName}</div>
              {isEditing && (
                <button
                  onClick={() => handleEdit('personalInfo', 0)}
                  className={cn(
                    "professional-edit-button professional-edit-button-personal",
                    displayLang === ('he' as DisplayLanguage) ? 'professional-edit-button-he' : 'professional-edit-button-en'
                  )}
                  title={displayLang === ('he' as DisplayLanguage) ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            <div className="professional-separator" />

            <div className={cn(
              "professional-contact",
              displayLang === ('he' as DisplayLanguage) ? 'professional-contact-he' : 'professional-contact-en'
            )}>
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

          {((skills.technical && skills.technical.length > 0) || 
            (skills.soft && skills.soft.length > 0) ||
            (skills.languages && skills.languages.length > 0)) && (
            <section className="relative">
              <h2 className="professional-section-title">
                {t.skills}
                {isEditing && (
                  <button 
                    onClick={() => handleEdit('skills', 0)}
                    className="professional-edit-button professional-edit-button-skills"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך כישורים' : 'Edit Skills'}
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

          {skills.languages && skills.languages.length > 0 && (
            <section className="relative" style={{ marginTop: '2rem' }}>
              <h2 className="professional-section-title">
                {t.languages}
                {isEditing && (
                  <button 
                    onClick={() => handleEdit('languages', 0)}
                    className="professional-edit-button professional-edit-button-languages"
                    title={displayLang === ('he' as DisplayLanguage) ? 'ערוך שפות' : 'Edit Languages'}
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
                      <div className="professional-skill-wrapper">
                        <span className="professional-skill-name">{langItem.language}</span>
                        <span className="professional-skill-level">{langItem.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  </div>
);
};

export default ProfessionalTemplate; 