'use client';
import React, { useEffect } from 'react';
import { ResumeData } from '../../../types/resume';
import '../../../styles/templates/professional-en.css';
import { Assistant } from 'next/font/google';

interface ProfessionalTemplateProps {
  data: ResumeData;
  lang: string;
}

const assistant = Assistant({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-assistant',
  preload: true,
  display: 'swap',
});

const translations = {
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

// Date formatting function
const formatDate = (startDate: string, endDate: string) => {
  const formattedEnd = endDate === 'Present' || endDate === 'present' ? 
    translations.en.present : 
    endDate;
  
  return `${startDate} ${translations.en.to} ${formattedEnd}`;
};

const shouldPreventWordWrap = (text: string = '') => {
  const wordCount = text.trim().split(/\s+/).length;
  return wordCount <= 5;
};

const ProfessionalTemplateEn: React.FC<ProfessionalTemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, military } = data;

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
    if (typeof level !== 'number') return 'Good Level';

    const levels: { [key: number]: string } = {
      5: 'Expert Level',
      4: 'Advanced Level',
      3: 'Intermediate Level',
      2: 'Basic Level',
      1: 'Beginner Level'
    };

    return levels[level] || 'Good Level';
  };

  return (
    <div 
      className={`${assistant.className} professional-template`}
      dir="ltr"
    >
      {/* Left Column (was right in RTL) */}
      <div className="professional-left-column">
        <header className="professional-header">
          <div className="professional-name">
            {(() => {
              const { firstName, lastName } = splitName(personalInfo.name);
              return (
                <>
                  <span className="professional-name-first">{firstName}</span>
                  {lastName && <span className="professional-name-last">{lastName}</span>}
                </>
              );
            })()}
          </div>
          <div className="professional-separator" />
          <div className="professional-contact">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.address && <span>{personalInfo.address}</span>}
          </div>
        </header>

        {/* Skills */}
        {((skills.technical && skills.technical.length > 0) || 
          (skills.soft && skills.soft.length > 0) ||
          (skills.languages && skills.languages.length > 0)) && (
          <section>
            <h2 className="professional-section-title">{translations.en.skills}</h2>
            <div className="professional-separator" />
            <div className="professional-skills">
              {/* Technical Skills with Level */}
              {skills.technical.map((skill, index) => (
                <div key={`tech-${index}`} className="professional-skill-item">
                  <div className="professional-skill-content">
                    <span className="professional-skill-name">{skill.name}</span>
                    <span className="professional-skill-separator">|</span>
                    <span className="professional-skill-level">{getSkillLevel(skill.level)}</span>
                  </div>
                </div>
              ))}
              
              {/* Soft Skills without Level */}
              {skills.soft.map((skill, index) => (
                <div key={`soft-${index}`} className="professional-skill-item">
                  <div className="professional-skill-content">
                    <span className="professional-skill-name">{skill.name}</span>
                  </div>
                </div>
              ))}

              {/* Languages */}
              {skills.languages && skills.languages.length > 0 && (
                <div className="professional-languages">
                  <h2 className="professional-section-title">{translations.en.languages}</h2>
                  <div className="professional-separator" />
                  {skills.languages.map((lang, index) => (
                    <div key={`lang-${index}`} className="professional-skill-item">
                      <div className="professional-skill-content">
                        <span className="professional-skill-name">{lang.language}</span>
                        <span className="professional-skill-separator">|</span>
                        <span className="professional-skill-level">{lang.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Logo */}
        <div className="professional-logo">
          <img src="/design/piont.svg" alt="logo" />
        </div>
      </div>

      {/* Right Column */}
      <div className="professional-right-column">
        {/* Professional Summary */}
        {personalInfo.summary && (
          <section className="professional-summary">
            <h2 className="professional-section-title">{translations.en.professionalSummary}</h2>
            <p className="professional-summary-text">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <section className="professional-experience">
            <h2 className="professional-section-title">{translations.en.workExperience}</h2>
            {experience.map((exp, index) => (
              <div key={index} className="professional-experience-item">
                <div className="professional-experience-header">
                  <div className="professional-experience-title-wrapper">
                    <span 
                      className="professional-experience-title"
                      style={{ whiteSpace: shouldPreventWordWrap(exp.position) ? 'nowrap' : 'normal' }}
                    >
                      {exp.position}
                    </span>
                    {exp.company && (
                      <>
                        <span className="professional-experience-separator">|</span>
                        <span 
                          className="professional-experience-company"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {exp.company}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="professional-experience-date">
                    {formatDate(exp.startDate, exp.endDate)}
                  </span>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <div className="professional-experience-description">
                    {exp.description.map((desc, i, arr) => (
                      <React.Fragment key={i}>
                        <span style={{ display: 'inline' }}>{desc}</span>
                        {i < arr.length - 1 && <span className="professional-description-separator">|</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education?.degrees && education.degrees.length > 0 && (
          <div className="professional-section-en">
            <h2 className="professional-section-title-en">{translations.en.education}</h2>
            <div className="professional-section-content-en">
              {education.degrees.map((edu, index) => {
                const hasDetails = edu.specialization || edu.years;
                return (
                  <div key={index} className="professional-item-en">
                    <div className="professional-item-header-en">
                      <div className="professional-item-title-en">
                        <span style={{ whiteSpace: 'nowrap' }}>{`${edu.type} ${edu.field}`}</span>
                        {hasDetails ? (
                          <span className="separator">|</span>
                        ) : (
                          <span className="separator">*</span>
                        )}
                        <span style={{ whiteSpace: 'nowrap' }}>{edu.institution}</span>
                      </div>
                      {edu.years && <span className="professional-item-date-en">{edu.years}</span>}
                    </div>
                    {edu.specialization && (
                      <div className="professional-item-description-en">
                        {edu.specialization}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Military Service */}
        {military && (
          <div className="professional-section-en">
            <h2 className="professional-section-title-en">
              {military.unit?.toLowerCase().includes('national') ? translations.en.nationalService : translations.en.militaryService}
            </h2>
            <div className="professional-section-content-en">
              <div className="professional-item-en">
                <div className="professional-item-header-en">
                  <div className="professional-item-title-en">
                    <span style={{ whiteSpace: 'nowrap' }}>{military.role}</span>
                    {military.description?.length > 0 ? (
                      <span className="separator">|</span>
                    ) : (
                      <span className="separator">*</span>
                    )}
                    <span style={{ whiteSpace: 'nowrap' }}>{military.unit}</span>
                  </div>
                  {military.startDate && military.endDate && (
                    <span className="professional-item-date-en">
                      {formatDate(military.startDate, military.endDate)}
                    </span>
                  )}
                </div>
                {military.description && military.description.length > 0 && (
                  <ul className="professional-item-description-en">
                    {military.description.map((desc: string, i: number) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTemplateEn; 