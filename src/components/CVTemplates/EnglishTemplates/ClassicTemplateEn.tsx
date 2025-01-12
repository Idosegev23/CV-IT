'use client';
import React, { useEffect } from 'react';
import { ResumeData } from '../../../types/resume';
import '../../../styles/templates/classic-en.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';
import { formatDescription, formatDate } from '../utils';

interface Military {
  role: string;
  unit: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface ClassicTemplateProps {
  data: {
    personalInfo: any;
    experience: any[];
    education: {
      degrees: any[];
    };
    skills: {
      technical: TechnicalSkill[];
      soft: SoftSkill[];
      languages: LanguageSkill[];
    };
    military?: Military;
  };
  lang: string;
}

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

const assistant = Assistant({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-assistant',
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

const formatSummary = (summary: string) => {
  return summary.split('.').filter(Boolean).map((sentence: string, index: number) => (
    <React.Fragment key={index}>
      {sentence.trim()}.
      <br />
    </React.Fragment>
  ));
};

const ClassicTemplateEn: React.FC<ClassicTemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, military } = data;
  
  console.log('Full data:', data);
  console.log('Skills data:', data.skills);
  console.log('Technical skills:', data.skills?.technical);
  console.log('Soft skills:', data.skills?.soft);

  const splitName = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    return { firstName, lastName };
  };

  const { firstName, lastName } = splitName(personalInfo.name);

  useEffect(() => {
    const adjustFontSize = () => {
      const content = document.querySelector('.classic-template') as HTMLElement;
      if (!content) return;

      const contentHeight = content.scrollHeight;
      const containerHeight = content.clientHeight;
      
      if (contentHeight > containerHeight) {
        const ratio = containerHeight / contentHeight;
        const currentFontSize = parseFloat(getComputedStyle(content).fontSize);
        const newFontSize = currentFontSize * ratio * 0.95; // 0.95 for some padding
        
        content.style.fontSize = `${newFontSize}px`;
      }
    };

    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [data]);

  const getSkillLevel = (level: number) => {
    switch (level) {
      case 1: return 'Basic';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      case 4: return 'Expert';
      default: return 'Basic';
    }
  };

  const shouldPreventWordWrap = (text: string) => {
    const wordCount = text.trim().split(/\s+/).length;
    return wordCount <= 5;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const truncateDescription = (descriptions: string[]) => {
    if (!descriptions || descriptions.length === 0) return [];
    if (descriptions.length > 5) return descriptions.slice(0, 5);
    return descriptions.map(desc => truncateText(desc, 100));
  };

  const limitItems = (items: any[], maxItems: number = 4) => {
    if (!items || items.length === 0) return [];
    return items.slice(0, maxItems);
  };

  return (
    <div 
      className={`${assistant.className} classic-template`}
      dir="ltr"
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
      <div className="classic-header relative">
        <div className="relative z-10">
          <div className="header-name-wrapper">
            <h1 className="header-name">
              <span className="header-name-first">{firstName}</span>
              {lastName && <span className="header-name-last">{lastName}</span>}
            </h1>
            <Image
              src="/design/classic/dec.svg"
              alt="header decoration"
              width={40}
              height={40}
              className="header-corner-decoration"
              priority={true}
            />
          </div>
          <div className="header-contact">
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

      <main className="classic-content">
        {/* Summary */}
        {data.personalInfo.summary && (
          <section className="summary-section">
            <div className="summary-content">
              {formatSummary(data.personalInfo.summary)}
            </div>
          </section>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="experience-section">
            <h2 className="section-title">{translations.en.workExperience}</h2>
            <div className="experience-items">
              {limitItems(data.experience).map((exp: any, index: number) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <div className="experience-title-wrapper">
                      <h3 className="experience-title">{exp.position}</h3>
                      {exp.company && (
                        <>
                          <span className="separator">|</span>
                          <span className="experience-company">{exp.company}</span>
                        </>
                      )}
                    </div>
                    <div className="experience-date">
                      {formatDate(exp.startDate, exp.endDate)}
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <div className="experience-description">
                      {truncateDescription(exp.description).map((desc: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          <span>{desc}</span>
                          {i < arr.length - 1 && <span className="separator">|</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education?.degrees && data.education.degrees.length > 0 && (
          <section className="education-section">
            <h2 className="section-title">{translations.en.education}</h2>
            <div className="education-items">
              {limitItems(data.education.degrees, 3).map((degree, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <div className="education-title-wrapper">
                      <span className="education-degree" style={{ whiteSpace: shouldPreventWordWrap(`${degree.type} ${degree.field}`) ? 'nowrap' : 'normal' }}>
                        {`${degree.type} ${degree.field}`}
                      </span>
                      <span className="separator">|</span>
                      <span className="education-institution" style={{ whiteSpace: 'nowrap' }}>{degree.institution}</span>
                    </div>
                    <div className="education-date">{degree.years}</div>
                  </div>
                  {degree.specialization && (
                    <div className="education-specialization">
                      Specialization: {degree.specialization}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Military/National Service */}
        {military && (
          <section className="military-section">
            <h2 className="section-title">
              {military.unit.toLowerCase().includes('national') ? translations.en.nationalService : translations.en.militaryService}
            </h2>
            <div className="experience-items">
              <div className="experience-item">
                <div className="experience-header">
                  <div className="experience-title-wrapper">
                    <span className="experience-title">{military.role}</span>
                    <span className="separator">|</span>
                    <span className="experience-company">{military.unit}</span>
                  </div>
                  <div className="experience-date">
                    {formatDate(military.startDate, military.endDate)}
                  </div>
                </div>
                {military.description && military.description.length > 0 && (
                  <div className="experience-description">
                    {truncateDescription(military.description).map((desc: string, i: number, arr: string[]) => (
                      <React.Fragment key={i}>
                        <span>{desc}</span>
                        {i < arr.length - 1 && <span className="separator">|</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        
        {/* Skills and Languages */}
        {(data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0 || data.skills.languages?.length > 0)) && (
          <section className="skills-section">
            <h2 className="section-title">{translations.en.skills} & {translations.en.languages}</h2>
            <div className="skills-items">
              {/* Technical Skills */}
              {data.skills.technical && data.skills.technical.length > 0 && (
                <div className="technical-skills">
                  <h3 className="sub-title">{translations.en.technicalSkills}</h3>
                  <div className="skills-list">
                    {limitItems(data.skills.technical, 8).map((skill: TechnicalSkill, index: number, arr: TechnicalSkill[]) => (
                      <span key={`tech-${index}`}>
                        {skill.name}
                        {index < arr.length - 1 && ' | '}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {data.skills.soft && data.skills.soft.length > 0 && (
                <div className="soft-skills">
                  <h3 className="sub-title">{translations.en.softSkills}</h3>
                  <div className="skills-list">
                    {limitItems(data.skills.soft, 6).map((skill: SoftSkill, index: number, arr: SoftSkill[]) => (
                      <span key={`soft-${index}`}>
                        {skill.name}
                        {index < arr.length - 1 && ' | '}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {data.skills?.languages && data.skills.languages.length > 0 && (
                <div className="languages-skills">
                  <h3 className="sub-title">{translations.en.languages}</h3>
                  <div className="skills-list">
                    {data.skills.languages.map((lang: LanguageSkill, index: number) => (
                      <span key={`lang-${index}`} className="skill-item">
                        {lang.language} - {lang.level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <div className="classic-footer relative">
      </div>
    </div>
  );
};

export default ClassicTemplateEn; 