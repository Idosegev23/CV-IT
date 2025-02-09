'use client';
import React, { useEffect } from 'react';
import { ResumeData, Language, Degree, MilitaryService } from '../../types/resume';
import MailIcon from '../../../public/design/general/MailIcon.svg';
import PhoneIcon from '../../../public/design/general/PhoneIcon.svg';
import LocIcon from '../../../public/design/general/LocIcon.svg';
import LinkedInIcon from '../../../public/design/general/LinkedInIcon.svg';
import BusiIcon from '../../../public/design/general/busiIcon.svg';
import SchoolIcon from '../../../public/design/general/SchoolIcon.svg';
import MilIcon from '../../../public/design/general/MilIcon.svg';
import SkillIcon from '../../../public/design/general/SkillIcon.svg';
import LangIcon from '../../../public/design/general/langIcon.svg';
import DecUpLeft from '../../../public/design/general/decUpLeft.svg';
import Building from '../../../public/design/general/buiding.svg';
import IconDec from '../../../public/design/general/Icon.svg';
import Cloud from '../../../public/design/general/cloud.svg';
import Image from 'next/image';
import '../../styles/templates/general.css';
import { Assistant } from 'next/font/google';
import { formatDescription, formatDate } from './utils';
import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneralTemplateProps {
  data: ResumeData;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index: number) => void;
  displayLang?: 'he' | 'en';
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

const GeneralTemplate: React.FC<GeneralTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {},
  onEdit = () => {},
  displayLang = 'he'
}) => {
  const t = translations[displayLang as keyof typeof translations];
  const { personalInfo, experience, education, skills } = data;
  const military = data.military as MilitaryService | undefined;
  const isRTL = displayLang === 'he';

  console.log('CV Language:', displayLang);

  const { firstName, lastName } = (() => {
    const nameParts = personalInfo.name.trim().split(/\s+/);
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    return { firstName, lastName };
  })();

  useEffect(() => {
    const adjustSize = () => {
      const content = document.querySelector('.general-template') as HTMLElement;
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

  useEffect(() => {
    const adjustLinePosition = () => {
      const summarySection = document.querySelector('.general-professional-summary');
      const content = document.querySelector('.general-content') as HTMLElement;
      if (summarySection && content) {
        const summaryHeight = summarySection.getBoundingClientRect().height;
        const contentStyle = getComputedStyle(content);
        const marginTop = parseInt(contentStyle.marginTop);
        const lineStartPosition = summaryHeight + marginTop + 40; // 40px נוסף למרווח
        content.style.setProperty('--line-start-position', `${lineStartPosition}px`);
      }
    };

    adjustLinePosition();
    window.addEventListener('resize', adjustLinePosition);
    return () => window.removeEventListener('resize', adjustLinePosition);
  }, [data.personalInfo.summary]);

  const getSkillLevel = (level: number) => {
    if (typeof level !== 'number') return displayLang === 'he' ? 'רמה טובה' : 'Good Level';

    const levels: { [key: number]: Record<'he' | 'en', string> } = {
      5: { he: 'רמה גבוהה מאוד', en: 'Expert Level' },
      4: { he: 'רמה גבוהה', en: 'Advanced Level' },
      3: { he: 'רמה טובה', en: 'Intermediate Level' },
      2: { he: 'רמה מינונית', en: 'Basic Level' },
      1: { he: 'רמה בסיסית', en: 'Beginner Level' }
    };

    return levels[level]?.[displayLang as 'he' | 'en'] || (displayLang === 'he' ? 'רמה טובה' : 'Good Level');
  };

  const handleEdit = (type: string, index: number = 0) => {
    if (onEdit) {
      onEdit(type, index);
    }
  };

  const contactItems = [
    data.personalInfo.email && (
      <div key="email" className="general-contact-item">
        <div className="general-contact-item-icon">
          <Image src={MailIcon} alt="email" width={16} height={16} />
        </div>
        <span>{data.personalInfo.email}</span>
      </div>
    ),
    data.personalInfo.phone && (
      <div key="phone" className="general-contact-item">
        <div className="general-contact-item-icon">
          <Image src={PhoneIcon} alt="phone" width={16} height={16} />
        </div>
        <span>{data.personalInfo.phone}</span>
      </div>
    ),
    data.personalInfo.address && (
      <div key="address" className="general-contact-item">
        <div className="general-contact-item-icon">
          <Image src={LocIcon} alt="location" width={16} height={16} />
        </div>
        <span>{data.personalInfo.address}</span>
      </div>
    ),
    data.personalInfo.linkedin && (
      <div key="linkedin" className="general-contact-item">
        <div className="general-contact-item-icon">
          <Image src={LinkedInIcon} alt="linkedin" width={16} height={16} />
        </div>
        <span>{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
      </div>
    )
  ].filter(Boolean);

  const orderedContactItems = displayLang === 'en' ? [...contactItems].reverse() : contactItems;

  return (
    <div className={`${assistant.className} general-template-wrapper`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div 
        className="general-template"
        data-cv-lang={displayLang}
        dir={displayLang === 'he' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <header className="general-header">
          <div className="general-header-content">
            <div className="general-header-name relative">
              <h1>
                <span className="general-firstname">{firstName}</span>
                <span className="general-lastname">{lastName}</span>
                {isEditing && (
                  <button
                    onClick={() => handleEdit('personalInfo', 0)}
                    className="general-edit-button general-edit-button-personal"
                    title={displayLang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </h1>
            </div>

            <div className="general-contact-info">
              {orderedContactItems}
            </div>
          </div>
        </header>
        <div className="general-header-decoration general-right-decoration">
          <Image src={DecUpLeft} alt="" width={150} height={150} priority />
        </div>
        <div className="general-header-decoration general-left-decoration">
          <Image src={DecUpLeft} alt="" width={150} height={150} priority />
        </div>
        <div className="general-content">

        {/* תקציר מקצועי */}
        {data.personalInfo.summary && (
          <section className="general-section">
            {isEditing && (
              <button
                onClick={() => handleEdit('professionalSummary', 0)}
                className="general-edit-button general-edit-button-summary"
                title={displayLang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <div className="general-professional-summary">
              <p>{data.personalInfo.summary}</p>
            </div>
          </section>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="general-section">
            <h3 className="general-section-title">
              <div className="general-section-icon">
                <Image src={BusiIcon} alt="work" width={48} height={48} />
              </div>
              {t.workExperience}
              {isEditing && (
                <button
                  onClick={() => handleEdit('experience', 0)}
                  className="general-edit-button general-edit-button-experience"
                  title={displayLang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h3>
            <div className="general-section-content">
              {data.experience.map((exp, index) => (
                <div key={index} className="general-experience-item">
                  <div className="general-experience-header">
                    <h4 className="general-experience-title">
                      {exp.position}
                    </h4>
                    {exp.company && (
                      <span className="general-experience-company">
                        {exp.company}
                      </span>
                    )}
                    <span className="general-experience-date">
                      {formatDate(exp.startDate, exp.endDate, displayLang)}
                    </span>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="general-experience-description">
                      {formatDescription(exp.description, data.experience.length).map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education?.degrees && data.education.degrees.length > 0 && (
          <section className="general-section">
            <h3 className="general-section-title">
              <div className="general-section-icon">
                <Image src={SchoolIcon} alt="education" width={48} height={48} />
              </div>
              {t.education}
              {isEditing && (
                <button
                  onClick={() => handleEdit('education', 0)}
                  className="general-edit-button general-edit-button-education"
                  title={displayLang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h3>
            <div className="general-timeline-container">
              {data.education.degrees.map((degree, index) => (
                <div key={index} className="general-timeline-item">
                  <div className="general-timeline-header">
                    <div className="general-timeline-title-wrapper">
                      <span className="general-timeline-position">{degree.type} {degree.field}</span>
                      {degree.institution && (
                        <>
                          <span className="general-timeline-separator">|</span>
                          <span className="general-timeline-company">{degree.institution}</span>
                        </>
                      )}
                    </div>
                    <span className="general-timeline-date">
                      {formatDate(degree.startDate, degree.endDate, displayLang)}
                    </span>
                  </div>
                  {degree.specialization && (
                    <div className="general-timeline-description">
                      <li>{`${t.specialization}: ${degree.specialization}`}</li>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Military Service */}
        {data.military && (
          <section className="general-section">
            <h3 className="general-section-title">
              <div className="general-section-icon">
                <Image src={MilIcon} alt="military" width={48} height={48} />
              </div>
              {t.militaryService}
              {isEditing && (
                <button
                  onClick={() => handleEdit('military', 0)}
                  className="general-edit-button general-edit-button-military"
                  title={displayLang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h3>
            <div className="general-timeline-container">
              <div className="general-timeline-item">
                <div className="general-timeline-header">
                  <div className="general-timeline-title-wrapper">
                    <span className="general-timeline-position">{data.military.role}</span>
                    {data.military.unit && (
                      <>
                        <span className="general-timeline-separator">|</span>
                        <span className="general-timeline-company">{data.military.unit}</span>
                      </>
                    )}
                  </div>
                  <span className="general-timeline-date">
                    {formatDate(data.military.startDate, data.military.endDate, displayLang)}
                  </span>
                </div>
                {data.military.description && data.military.description.length > 0 && (
                  <ul className="general-timeline-description">
                    {formatDescription(data.military.description, 3).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && (
          (Array.isArray(data.skills.technical) && data.skills.technical.length > 0) || 
          (Array.isArray(data.skills.soft) && data.skills.soft.length > 0)
        ) && (
          <section className="general-skills-section">
            <h3 className="general-section-title">
              <div className="general-section-icon">
                <Image src={SkillIcon} alt="skills" width={48} height={48} />
              </div>
              {t.skills}
              {isEditing && (
                <button
                  onClick={() => handleEdit('skills', 0)}
                  className="general-edit-button general-edit-button-skills"
                  title={displayLang === 'he' ? 'ערוך כישורים' : 'Edit Skills'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h3>
            <div className="general-skills-items">
              {/* Technical Skills */}
              {Array.isArray(data.skills.technical) && data.skills.technical.length > 0 && (
                <div className="general-skills-category">
                  <h4 className="general-skills-subtitle">{t.technicalSkills}</h4>
                  <div className="general-skills-list">
                    {data.skills.technical.map((skill, index) => (
                      <React.Fragment key={`tech-${index}`}>
                        <span className="general-skill-item">
                          <span className="general-skill-name">{skill.name}</span>
                          {skill.level && (
                            <span className="general-skill-level"> - {getSkillLevel(skill.level)}</span>
                          )}
                        </span>
                        {index < data.skills.technical.length - 1 && <span className="general-skill-separator">|</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Soft Skills */}
              {Array.isArray(data.skills.soft) && data.skills.soft.length > 0 && (
                <div className="general-skills-category">
                  <h4 className="general-skills-subtitle">{t.softSkills}</h4>
                  <div className="general-skills-list">
                    {data.skills.soft.map((skill, index) => (
                      <React.Fragment key={`soft-${index}`}>
                        <span className="general-skill-item">
                          <span className="general-skill-name">{skill.name}</span>
                        </span>
                        {index < data.skills.soft.length - 1 && <span className="general-skill-separator">|</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.skills?.languages && data.skills.languages.length > 0 && (
          <section className="general-languages-section">
            <h3 className="general-section-title">
              <div className="general-section-icon">
                <Image src={LangIcon} alt="languages" width={48} height={48} />
              </div>
              {t.languages}
              {isEditing && (
                <button
                  onClick={() => handleEdit('language', 0)}
                  className="general-edit-button general-edit-button-languages"
                  title={displayLang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h3>
            <div className="general-languages-items">
              {data.skills.languages.map((lang, index) => (
                <span key={index}>
                  <span>{lang.language}</span>
                  <span> - </span>
                  <span>{lang.level}</span>
                </span>
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
      <div className="general-footer-decorations">
        <div className="general-cloud-decoration">
          <Image 
            src={Cloud} 
            alt="" 
            width={100} 
            height={100}
            style={{ opacity: 0.8 }}
          />
        </div>
        <div className="general-building-decoration">
          <Image 
            src={Building} 
            alt="" 
            width={200} 
            height={200}
            style={{ opacity: 1 }}
            priority
          />
        </div>
        <div className="general-icon-decoration">
          <Image 
            src={IconDec} 
            alt="" 
            width={50} 
            height={50}
            style={{ opacity: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
}

export default GeneralTemplate;