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
                  <h3 className="professional-subsection-title">{translations.en.languages}</h3>
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

      {/* Right Column (was left in RTL) */}
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
                    <span className="professional-experience-title">{exp.position}</span>
                    {exp.company && (
                      <>
                        <span className="professional-experience-separator">|</span>
                        <span className="professional-experience-company">{exp.company}</span>
                      </>
                    )}
                  </div>
                  <span className="professional-experience-date">
                    {formatDate(exp.startDate, exp.endDate)}
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

        {/* Education */}
        {education?.degrees && education.degrees.length > 0 && (
          <section className="professional-education">
            <h2 className="professional-section-title">{translations.en.education}</h2>
            {education.degrees.map((degree, index) => (
              <div key={index} className="professional-education-item">
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
                  {degree.years && (
                    <span className="professional-education-date">{degree.years}</span>
                  )}
                </div>
                {degree.specialization && (
                  <div className="professional-education-specialization">
                    Specialization: {degree.specialization}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Military Service */}
        {military && (
          <section className="professional-military-section">
            <h2 className="professional-section-title">{translations.en.militaryService}</h2>
            <div className="professional-military-item">
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
                  {formatDate(military.startDate, military.endDate)}
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
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTemplateEn; 