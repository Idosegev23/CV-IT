'use client';
import React, { useEffect } from 'react';
import { ResumeData, Language, Degree, MilitaryService } from '../../types/resume';
import MailIcon from '../../../public/design/general/MailIcon.svg';
import PhoneIcon from '../../../public/design/general/PhoneIcon.svg';
import LocIcon from '../../../public/design/general/LocIcon.svg';
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
  onEdit = () => {}
}) => {
  const cvLang = data.lang;
  const t = translations[cvLang as keyof typeof translations];
  const { personalInfo, experience, education, skills } = data;
  const military = data.military as MilitaryService | undefined;
  const isRTL = cvLang === 'he';

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
    <div className={`${assistant.className} general-template-wrapper`}>
      <div 
        className="general-template"
        data-cv-lang={cvLang}
        dir={lang === 'he' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <header className="general-header">
          <div className="general-header-content">
            <div className="general-header-name relative">
              <h1>
                <span className="firstname">{firstName}</span>
                <span className="lastname">{lastName}</span>
                {isEditing && (
                  <button
                    onClick={() => handleEdit('personalInfo', 0)}
                    className="edit-button"
                    title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </h1>
            </div>

            <div className="contact-info" dir={lang === 'he' ? 'rtl' : 'ltr'}>
              {data.personalInfo.email && (
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <Image src={MailIcon} alt="email" width={16} height={16} />
                  </div>
                  <span>{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <Image src={PhoneIcon} alt="phone" width={16} height={16} />
                  </div>
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.address && (
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <Image src={LocIcon} alt="location" width={16} height={16} />
                  </div>
                  <span>{data.personalInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="header-decoration right-decoration">
          <Image src={DecUpLeft} alt="" width={150} height={150} priority />
        </div>
        <div className="header-decoration left-decoration">
          <Image src={DecUpLeft} alt="" width={150} height={150} priority />
        </div>
        <div className="content">

        {/* Summary Section */}
        {data.personalInfo.summary && (
          <section className="summary-section">
            <h3 className="summary-title">
              {t.professionalSummary}
            </h3>
            <div className="summary-content">
              <p>{data.personalInfo.summary}</p>
            </div>
          </section>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="section">
            <h3 className="section-title">
              <div className="section-icon">
                <Image src={BusiIcon} alt="work" width={48} height={48} />
              </div>
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
            </h3>
            <div className="section-content">
              {data.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <h4 className="experience-title">
                      {exp.position}
                    </h4>
                    {exp.company && (
                      <span className="experience-company">
                        {exp.company}
                      </span>
                    )}
                    <span className="experience-date">
                      {formatDate(exp.startDate, exp.endDate, lang)}
                    </span>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="experience-description">
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
          <section className="section">
            <h3 className="section-title">
              <div className="section-icon">
                <Image src={SchoolIcon} alt="education" width={48} height={48} />
              </div>
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
            </h3>
            <div className="timeline-container">
              {data.education.degrees.map((degree, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title-wrapper">
                      <span className="timeline-position">{degree.type} {degree.field}</span>
                      {degree.institution && (
                        <>
                          <span className="timeline-separator">|</span>
                          <span className="timeline-company">{degree.institution}</span>
                        </>
                      )}
                    </div>
                    <span className="timeline-date">
                      {formatDate(degree.startDate, degree.endDate, lang)}
                    </span>
                  </div>
                  {degree.specialization && (
                    <div className="timeline-description">
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
          <section className="section">
            <h3 className="section-title">
              <div className="section-icon">
                <Image src={MilIcon} alt="military" width={48} height={48} />
              </div>
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
            </h3>
            <div className="timeline-container">
              <div className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title-wrapper">
                    <span className="timeline-position">{data.military.role}</span>
                    {data.military.unit && (
                      <>
                        <span className="timeline-separator">|</span>
                        <span className="timeline-company">{data.military.unit}</span>
                      </>
                    )}
                  </div>
                  <span className="timeline-date">
                    {formatDate(data.military.startDate, data.military.endDate, lang)}
                  </span>
                </div>
                {data.military.description && data.military.description.length > 0 && (
                  <ul className="timeline-description">
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
          <section className="skills-section">
            <h3 className="section-title">
              <div className="section-icon">
                <Image src={SkillIcon} alt="skills" width={48} height={48} />
              </div>
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
            </h3>
            <div className="skills-items">
              {/* Technical Skills */}
              {Array.isArray(data.skills.technical) && data.skills.technical.map((skill, index) => (
                <React.Fragment key={`tech-${index}`}>
                  <span className="skill-item">
                    <span className="skill-name">{skill.name}</span>
                    {skill.level && (
                      <span className="skill-level"> - {getSkillLevel(skill.level)}</span>
                    )}
                  </span>
                  {index < data.skills.technical.length - 1 && <span className="skill-separator">|</span>}
                </React.Fragment>
              ))}
              
              {/* Separator between technical and soft skills */}
              {Array.isArray(data.skills.technical) && data.skills.technical.length > 0 && 
               Array.isArray(data.skills.soft) && data.skills.soft.length > 0 && (
                <span className="skills-type-separator">|</span>
              )}
              
              {/* Soft Skills */}
              {Array.isArray(data.skills.soft) && data.skills.soft.map((skill, index) => (
                <React.Fragment key={`soft-${index}`}>
                  <span className="skill-item">
                    <span className="skill-name">{skill.name}</span>
                  </span>
                  {index < data.skills.soft.length - 1 && <span className="skill-separator">|</span>}
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.skills?.languages && data.skills.languages.length > 0 && (
          <section className="languages-section">
            <h3 className="section-title">
              <div className="section-icon">
                <Image src={LangIcon} alt="languages" width={48} height={48} />
              </div>
              {t.languages}
              {isEditing && (
                <button
                  onClick={() => handleEdit('language', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h3>
            <div className="languages-items">
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
      <div className="footer-decorations">
        <div className="cloud-decoration">
          <Image 
            src={Cloud} 
            alt="" 
            width={100} 
            height={100}
            style={{ opacity: 0.8 }}
          />
        </div>
        <div className="building-decoration">
          <Image 
            src={Building} 
            alt="" 
            width={200} 
            height={200}
            style={{ opacity: 1 }}
            priority
          />
        </div>
        <div className="icon-decoration">
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