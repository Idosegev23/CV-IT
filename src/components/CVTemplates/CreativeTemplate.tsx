'use client';
import React, { useEffect } from 'react';
import { ResumeData } from '../../types/resume';
import '../../styles/templates/creative.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';
import { formatDescription, formatDate, splitName } from './utils';
import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MailIcon from '../../../public/design/creative/MailIcon.svg';
import PhoneIcon from '../../../public/design/creative/PhoneIcon.svg';
import LocIcon from '../../../public/design/creative/LocIcon.svg';
import LinkedInIcon from '../../../public/design/creative/LinkedInIcon.svg';

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
    grade: 'ממוצע ציונים',
    to: 'עד',
    present: 'היום',
    technicalSkills: 'כישורים טכניים',
    softSkills: 'כישורים רכים',
    skillLevel: 'רמת מיומנות',
    topDecoration: 'קישוט עליון',
    bottomDecoration: 'קישוט תחתון',
    greyBackground: 'רקע אפור',
    emptyDot: 'נקודה ריקה',
    fullDot: 'נקודה מלאה',
    beginner: 'מתחיל',
    expert: 'מומחה'
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
    grade: 'GPA',
    to: 'to',
    present: 'Present',
    technicalSkills: 'Technical Skills',
    softSkills: 'Soft Skills',
    skillLevel: 'Skill Level',
    topDecoration: 'Top Decoration',
    bottomDecoration: 'Bottom Decoration',
    greyBackground: 'Grey Background',
    emptyDot: 'Empty Dot',
    fullDot: 'Full Dot',
    beginner: 'Beginner',
    expert: 'Expert'
  }
} as const;

interface CreativeTemplateProps {
  data: ResumeData;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index: number) => void;
  displayLang?: 'he' | 'en';
}

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {},
  onEdit = () => {},
  displayLang = 'he'
}) => {
  const t = translations[displayLang as keyof typeof translations];
  const { personalInfo, experience, education, skills, military } = data;
  const isRTL = displayLang === 'he';

  console.log('CV Language:', displayLang);

  const handleEdit = (type: string, index: number = 0) => {
    if (onEdit) {
      onEdit(type, index);
    }
  };

  useEffect(() => {
    const adjustSize = () => {
      const content = document.querySelector('.creative-template') as HTMLElement;
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

  const getSkillNameClass = (name: string) => {
    if (!name) return 'creative-skill-name';
    if (name.length > 25) return 'creative-skill-name smaller';
    if (name.length > 20) return 'creative-skill-name small';
    return 'creative-skill-name';
  };

  return (
    <div className={cn(
      `${assistant.className} creative-template`,
      displayLang === 'he' ? 'creative-template-he' : 'creative-template-en'
    )} 
    data-cv-lang={displayLang} 
    dir={isRTL ? 'rtl' : 'ltr'}>
      {isRTL ? (
        <>
          <div className="creative-right-column">
            {/* רקע עליון */}
            <Image
              src="/design/creative/pink_on_blue.svg"
              alt={t.topDecoration}
              className="creative-bg-top"
              width={40}
              height={40}
            />

            {/* פרטים אישיים */}
            <div className="creative-personal-info">
              <div className="flex items-center">
                <h1 className="creative-name flex items-center">
                  {(() => {
                    const { firstName, lastName } = splitName(data.personalInfo.name);
                    return (
                      <>
                        <span className="creative-firstname">{firstName}</span>
                        {lastName && <span className="creative-lastname">{lastName}</span>}
                      </>
                    );
                  })()}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('personalInfo', 0)}
                      className="creative-edit-button creative-edit-button-personal"
                      title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h1>
              </div>
              <div className="creative-separator" />
              <div className="creative-contact-info">
                {data.personalInfo.email && (
                  <div className="creative-contact-item">
                    <div className="creative-contact-item-icon">
                      <Image src={MailIcon.src} alt={t.email} width={16} height={16} />
                    </div>
                    <span>{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.phone && (
                  <div className="creative-contact-item">
                    <div className="creative-contact-item-icon">
                      <Image src={PhoneIcon.src} alt={t.phone} width={16} height={16} />
                    </div>
                    <span>{data.personalInfo.phone}</span>
                  </div>
                )}
                {data.personalInfo.address && (
                  <div className="creative-contact-item">
                    <div className="creative-contact-item-icon">
                      <Image src={LocIcon.src} alt={t.address} width={16} height={16} />
                    </div>
                    <span>{data.personalInfo.address}</span>
                  </div>
                )}
                {data.personalInfo.linkedin && (
                  <div className="creative-contact-item">
                    <div className="creative-contact-item-icon">
                      <Image src={LinkedInIcon.src} alt="LinkedIn" width={16} height={16} />
                    </div>
                    <span>{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* כישורים */}
            {data.skills && (
              (Array.isArray(data.skills.technical) && data.skills.technical.length > 0) || 
              (Array.isArray(data.skills.soft) && data.skills.soft.length > 0)
            ) && (
              <div className="creative-section creative-skills-section">
                <h2 className="creative-section-title relative">
                  {t.skills}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('skills', 0)}
                      className="creative-edit-button creative-edit-button-skills"
                      title={lang === 'he' ? 'ערוך כישורים' : 'Edit Skills'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-separator" />
                <div className="creative-skills">
                  {/* כישורים טכניים עם נקודות */}
                  {Array.isArray(data.skills.technical) && data.skills.technical.length > 0 && (
                    <div className="creative-skills-group">
                      <h3 className="creative-skills-subtitle">{t.technicalSkills}</h3>
                      <div className="creative-skills-legend">
                        <div className="creative-skills-legend-item">
                          <div className="creative-skills-legend-dots">
                            <Image
                              src="/design/creative/level_empty.svg"
                              alt={t.emptyDot}
                              width={6}
                              height={6}
                            />
                          </div>
                          <span className="creative-skills-legend-text">{t.beginner}</span>
                        </div>
                        <div className="creative-skills-legend-item">
                          <div className="creative-skills-legend-dots">
                            {[...Array(5)].map((_, i) => (
                              <Image
                                key={i}
                                src="/design/creative/level_full.svg"
                                alt={t.fullDot}
                                width={6}
                                height={6}
                              />
                            ))}
                          </div>
                          <span className="creative-skills-legend-text">{t.expert}</span>
                        </div>
                      </div>
                      {(isRTL ? data.skills.technical : [...data.skills.technical].reverse()).map((skill, index) => (
                        <div key={`tech-${index}`} className="creative-skill-item">
                          <div className="creative-skill-content">
                            <span className={getSkillNameClass(skill.name)}>{skill.name}</span>
                            <div className="creative-skill-level">
                              {[...Array(5)].map((_, i) => (
                                <Image
                                  key={i}
                                  src={i >= skill.level ? '/design/creative/level_empty.svg' : '/design/creative/level_full.svg'}
                                  alt={i >= skill.level ? t.emptyDot : t.fullDot}
                                  width={8}
                                  height={8}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* כישורים רכים ללא נקודות */}
                  {Array.isArray(data.skills.soft) && data.skills.soft.length > 0 && (
                    <div className="creative-skills-group">
                      <h3 className="creative-skills-subtitle">{t.softSkills}</h3>
                      {(isRTL ? data.skills.soft : [...data.skills.soft].reverse()).map((skill, index) => (
                        <div key={`soft-${index}`} className="creative-skill-item soft-skill">
                          <div className="creative-skill-content">
                            <span className={getSkillNameClass(skill.name)}>{skill.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* שפות */}
            {data.skills.languages && data.skills.languages.length > 0 && (
              <div className="creative-section creative-languages-section">
                <h2 className="creative-section-title relative">
                  {t.languages}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('languages', 0)}
                      className="creative-edit-button creative-edit-button-languages"
                      title={lang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-separator" />
                <div className="creative-languages">
                  {data.skills.languages.map((lang, index) => (
                    <div key={index} className="creative-language-item">
                      <span className="creative-language">{lang.language}</span>
                      <span className="creative-separator-vertical">|</span>
                      <span className="creative-level">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* קישוט תחתון בעברית */}
            <Image
              src="/design/creative/on_blueD.svg"
              alt={t.bottomDecoration}
              className="creative-bg-bottom-he"
              width={200}
              height={200}
            />
          </div>
          <div className="creative-left-column">
            {/* קישוטים */}
            <div className="creative-icon-decoration" />
            <div className="creative-grey-decoration" />
            
            {/* תקציר מקצועי */}
            {data.personalInfo.summary && (
              <div className="creative-summary">
                {isEditing && (
                  <button 
                    onClick={() => handleEdit('professionalSummary', 0)}
                    className="creative-edit-button creative-edit-button-summary"
                    title={lang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                <div className="creative-summary-content">
                  <p>{data.personalInfo.summary}</p>
                </div>
              </div>
            )}

            {/* ניסיון תעסוקתי */}
            {experience && experience.length > 0 && (
              <div className="creative-experience">
                <h2 className="creative-section-title dark">
                  {t.workExperience}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('experience', 0)}
                      className="creative-edit-button creative-edit-button-experience"
                      title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-experience-items">
                  {experience.map((exp, index) => (
                    <div key={index} className="creative-experience-item">
                      <div className="creative-experience-header">
                        <h3 className="creative-experience-title">
                          {exp.position}
                          {exp.company && (
                            <span className="creative-experience-company">
                              {exp.company}
                            </span>
                          )}
                        </h3>
                        <span className="creative-experience-date">
                          {formatDate(exp.startDate, exp.endDate, displayLang)}
                        </span>
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <div className="creative-experience-description">
                          {formatDescription(exp.description, exp.description.length).map((desc, i) => (
                            <div key={i}>{desc}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* השכלה */}
            {education?.degrees && education.degrees.length > 0 && (
              <div className="creative-experience">
                <h2 className="creative-section-title dark">
                  {t.education}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('education', 0)}
                      className="creative-edit-button creative-edit-button-education"
                      title={lang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-experience-items">
                  {education.degrees.map((degree, index) => (
                    <div key={index} className="creative-experience-item">
                      <div className="creative-experience-title-wrapper">
                        <div className="creative-education-header">
                          <div className="creative-education-main">
                            <h3 className="creative-education-degree">{degree.type}</h3>
                            <span className="creative-education-institution">{degree.institution}</span>
                          </div>
                          <span className="creative-experience-date">
                            {formatDate(degree.startDate || degree.years?.split('-')[0] || '', 
                                       degree.endDate || degree.years?.split('-')[1] || '', 
                                       displayLang)}
                          </span>
                        </div>
                        {(degree.field || degree.specialization) && (
                          <div className="creative-education-details">
                            {degree.field && <div>{degree.field}</div>}
                            {degree.specialization && (
                              <div>{`${t.specialization}: ${degree.specialization}`}</div>
                            )}
                            {degree.grade && (
                              <div>{`${t.grade}: ${degree.grade}`}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* שירות צבאי */}
            {data.military && (
              <div className="creative-experience">
                <h2 className="creative-section-title dark">
                  {t.militaryService}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('military', 0)}
                      className="creative-edit-button creative-edit-button-military"
                      title={lang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-experience-items">
                  <div className="creative-experience-item">
                    <div className="creative-experience-title-wrapper">
                      <div className="creative-military-header">
                        <div className="creative-military-main">
                          <h3 className="creative-military-role">{military?.role}</h3>
                          <span className="creative-military-unit">{military?.unit}</span>
                        </div>
                        <span className="creative-experience-date">
                          {formatDate(data.military.startDate, data.military.endDate, displayLang)}
                        </span>
                      </div>
                      {data.military.description && data.military.description.length > 0 && (
                        <div className="creative-military-details">
                          {formatDescription(data.military.description, 3).map((desc, i) => (
                            <div key={i}>{desc}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="creative-right-column">
            {/* קישוטים */}
            <div className="creative-icon-decoration" />
            <div className="creative-grey-decoration" />

            <div className="creative-summary">
              {data.personalInfo.summary && (
                <>
                  {isEditing && (
                    <button 
                      onClick={() => handleEdit('professionalSummary', 0)}
                      className="creative-edit-button creative-edit-button-summary"
                      title={lang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  <div className="creative-summary-content">
                    <p>{data.personalInfo.summary}</p>
                  </div>
                </>
              )}
            </div>

            {experience && experience.length > 0 && (
              <div className="creative-experience">
                <h2 className="creative-section-title dark">
                  {t.workExperience}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('experience', 0)}
                      className="creative-edit-button creative-edit-button-experience"
                      title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-experience-items">
                  {experience.map((exp, index) => (
                    <div key={index} className="creative-experience-item">
                      <div className="creative-experience-header">
                        <h3 className="creative-experience-title">
                          {exp.position}
                          {exp.company && (
                            <span className="creative-experience-company">
                              {exp.company}
                            </span>
                          )}
                        </h3>
                        <span className="creative-experience-date">
                          {formatDate(exp.startDate, exp.endDate, displayLang)}
                        </span>
                      </div>
                      {exp.description && exp.description.length > 0 && (
                        <div className="creative-experience-description">
                          {formatDescription(exp.description, exp.description.length).map((desc, i) => (
                            <div key={i}>{desc}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education?.degrees && education.degrees.length > 0 && (
              <div className="creative-experience">
                <h2 className="creative-section-title dark">
                  {t.education}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('education', 0)}
                      className="creative-edit-button creative-edit-button-education"
                      title={lang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-experience-items">
                  {education.degrees.map((degree, index) => (
                    <div key={index} className="creative-experience-item">
                      <div className="creative-experience-title-wrapper">
                        <div className="creative-education-header">
                          <div className="creative-education-main">
                            <h3 className="creative-education-degree">{degree.type}</h3>
                            <span className="creative-education-institution">{degree.institution}</span>
                          </div>
                          <span className="creative-experience-date">
                            {formatDate(degree.startDate || degree.years?.split('-')[0] || '', 
                                       degree.endDate || degree.years?.split('-')[1] || '', 
                                       displayLang)}
                          </span>
                        </div>
                        {(degree.field || degree.specialization) && (
                          <div className="creative-education-details">
                            {degree.field && <div>{degree.field}</div>}
                            {degree.specialization && (
                              <div>{`${t.specialization}: ${degree.specialization}`}</div>
                            )}
                            {degree.grade && (
                              <div>{`${t.grade}: ${degree.grade}`}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.military && (
              <div className="creative-experience">
                <h2 className="creative-section-title dark">
                  {t.militaryService}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('military', 0)}
                      className="creative-edit-button creative-edit-button-military"
                      title={lang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-experience-items">
                  <div className="creative-experience-item">
                    <div className="creative-experience-title-wrapper">
                      <div className="creative-military-header">
                        <div className="creative-military-main">
                          <h3 className="creative-military-role">{military?.role}</h3>
                          <span className="creative-military-unit">{military?.unit}</span>
                        </div>
                        <span className="creative-experience-date">
                          {formatDate(data.military.startDate, data.military.endDate, displayLang)}
                        </span>
                      </div>
                      {data.military.description && data.military.description.length > 0 && (
                        <div className="creative-military-details">
                          {formatDescription(data.military.description, 3).map((desc, i) => (
                            <div key={i}>{desc}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="creative-left-column">
            <Image
              src="/design/creative/pink_on_blue.svg"
              alt={t.topDecoration}
              className="creative-bg-top"
              width={40}
              height={40}
            />

            <div className="creative-personal-info">
              <div className="flex items-center">
                <h1 className="creative-name flex items-center">
                  {(() => {
                    const { firstName, lastName } = splitName(data.personalInfo.name);
                    return (
                      <>
                        <span className="creative-firstname">{firstName}</span>
                        {lastName && <span className="creative-lastname">{lastName}</span>}
                      </>
                    );
                  })()}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('personalInfo', 0)}
                      className="creative-edit-button creative-edit-button-personal"
                      title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h1>
              </div>
              <div className="creative-separator" />
              <div className="creative-contact-info">
                {data.personalInfo.email && (
                  <div className="creative-contact-item">
                    <div className="creative-contact-item-icon">
                      <Image src={MailIcon.src} alt={t.email} width={16} height={16} />
                    </div>
                    <span>{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.phone && (
                  <div className="creative-contact-item">
                    <div className="creative-contact-item-icon">
                      <Image src={PhoneIcon.src} alt={t.phone} width={16} height={16} />
                    </div>
                    <span>{data.personalInfo.phone}</span>
                  </div>
                )}
                {data.personalInfo.address && (
                  <div className="creative-contact-item">
                    <div className="creative-contact-item-icon">
                      <Image src={LocIcon.src} alt={t.address} width={16} height={16} />
                    </div>
                    <span>{data.personalInfo.address}</span>
                  </div>
                )}
                {data.personalInfo.linkedin && (
                  <div className="creative-contact-item">
                    <div className="creative-contact-item-icon">
                      <Image src={LinkedInIcon.src} alt="LinkedIn" width={16} height={16} />
                    </div>
                    <span>{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </div>
            </div>

            {((skills.technical && skills.technical.length > 0) || 
              (skills.soft && skills.soft.length > 0)) && (
              <div className="creative-section creative-skills-section">
                <h2 className="creative-section-title relative">
                  {t.skills}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('skills', 0)}
                      className="creative-edit-button creative-edit-button-skills"
                      title={lang === 'he' ? 'ערוך כישורים' : 'Edit Skills'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-separator" />
                <div className="creative-skills">
                  {Array.isArray(skills.technical) && skills.technical.length > 0 && (
                    <div className="creative-skills-group">
                      <h3 className="creative-skills-subtitle">{t.technicalSkills}</h3>
                      <div className="creative-skills-legend">
                        <div className="creative-skills-legend-item">
                          <div className="creative-skills-legend-dots">
                            <Image
                              src="/design/creative/level_empty.svg"
                              alt={t.emptyDot}
                              width={6}
                              height={6}
                            />
                          </div>
                          <span className="creative-skills-legend-text">{t.beginner}</span>
                        </div>
                        <div className="creative-skills-legend-item">
                          <div className="creative-skills-legend-dots">
                            {[...Array(5)].map((_, i) => (
                              <Image
                                key={i}
                                src="/design/creative/level_full.svg"
                                alt={t.fullDot}
                                width={6}
                                height={6}
                              />
                            ))}
                          </div>
                          <span className="creative-skills-legend-text">{t.expert}</span>
                        </div>
                      </div>
                      {(isRTL ? skills.technical : [...skills.technical].reverse()).map((skill, index) => (
                        <div key={`tech-${index}`} className="creative-skill-item">
                          <div className="creative-skill-content">
                            <span className={getSkillNameClass(skill.name)}>{skill.name}</span>
                            <div className="creative-skill-level">
                              {[...Array(5)].map((_, i) => (
                                <Image
                                  key={i}
                                  src={i >= skill.level ? '/design/creative/level_empty.svg' : '/design/creative/level_full.svg'}
                                  alt={i >= skill.level ? t.emptyDot : t.fullDot}
                                  width={8}
                                  height={8}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {Array.isArray(skills.soft) && skills.soft.length > 0 && (
                    <div className="creative-skills-group">
                      <h3 className="creative-skills-subtitle">{t.softSkills}</h3>
                      {(isRTL ? skills.soft : [...skills.soft].reverse()).map((skill, index) => (
                        <div key={`soft-${index}`} className="creative-skill-item soft-skill">
                          <div className="creative-skill-content">
                            <span className={getSkillNameClass(skill.name)}>{skill.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {skills.languages && skills.languages.length > 0 && (
              <div className="creative-section creative-languages-section">
                <h2 className="creative-section-title relative">
                  {t.languages}
                  {isEditing && (
                    <button
                      onClick={() => handleEdit('languages', 0)}
                      className="creative-edit-button creative-edit-button-languages"
                      title={lang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </h2>
                <div className="creative-separator" />
                <div className="creative-languages">
                  {skills.languages.map((lang, index) => (
                    <div key={index} className="creative-language-item">
                      <span className="creative-language">{lang.language}</span>
                      <span className="creative-separator-vertical">|</span>
                      <span className="creative-level">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* קישוט תחתון באנגלית */}
            <Image
              src="/design/creative/on_blueD.svg"
              alt={t.bottomDecoration}
              className="creative-bg-bottom-en"
              width={200}
              height={200}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CreativeTemplate; 