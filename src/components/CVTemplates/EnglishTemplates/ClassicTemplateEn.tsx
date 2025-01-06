'use client';
import React, { useEffect } from 'react';
import { ResumeData } from '../../../types/resume';
import '../../../styles/templates/classic-en.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';
import { formatDescription } from '../utils';

interface ClassicTemplateProps {
  data: ResumeData;
  lang: string;
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
  const formattedEnd = endDate === 'היום' || 
    endDate === 'today' || 
    endDate === 'present' || 
    endDate === 'Present' ? 
    'Present' : 
    endDate;
  
  return `${startDate} - ${formattedEnd}`;
};

const formatSummary = (summary: string) => {
  return summary.split('.').filter(Boolean).map((sentence, index) => (
    <React.Fragment key={index}>
      {sentence.trim()}.
      <br />
    </React.Fragment>
  ));
};

const ClassicTemplateEn: React.FC<ClassicTemplateProps> = ({ data }) => {
  const { personalInfo, experience, education, skills, military } = data;

  const splitName = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    return { firstName, lastName };
  };

  const { firstName, lastName } = splitName(personalInfo.name);

  useEffect(() => {
    const adjustSize = () => {
      const content = document.querySelector('.classic-template') as HTMLElement;
      if (!content) return;

      // A4 size in pixels (approximate)
      const A4_HEIGHT = 1123; // 297mm
      const contentHeight = content.scrollHeight;
      
      if (contentHeight > A4_HEIGHT) {
        const scale = A4_HEIGHT / contentHeight;
        document.documentElement.style.setProperty('--scale-factor', scale.toString());
      }
    };

    adjustSize();
    window.addEventListener('resize', adjustSize);
    return () => window.removeEventListener('resize', adjustSize);
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

  return (
    <div 
      className={`${assistant.className} classic-template`}
      dir="ltr"
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
              {data.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <div className="experience-title-wrapper">
                      <h3 className="experience-title">{exp.position}</h3>
                      {exp.company && (
                        <span className="experience-company">{exp.company}</span>
                      )}
                    </div>
                    <div className="experience-date">
                      {exp.startDate} - {exp.endDate}
                    </div>
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
          <section className="education-section">
            <h2 className="section-title">{translations.en.education}</h2>
            <div className="education-items">
              {data.education.degrees.map((degree, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <div className="education-title-wrapper">
                      <span className="education-degree">
                        {`${degree.type} ${degree.field}`}
                      </span>
                      <span className="experience-separator">|</span>
                      <span className="education-institution">{degree.institution}</span>
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

        {/* Military Service */}
        {military && (
          <section className="military-section">
            <h2 className="section-title">{translations.en.militaryService}</h2>
            <div className="experience-items">
              <div className="experience-item">
                <div className="experience-header">
                  <div className="experience-title-wrapper">
                    <span className="experience-title">{military.role}</span>
                    <span className="experience-separator">|</span>
                    <span className="experience-company">{military.unit}</span>
                  </div>
                  <div className="experience-date">
                    {formatDate(military.startDate, military.endDate)}
                  </div>
                </div>
                {military.description && military.description.length > 0 && (
                  <ul className="experience-description">
                    {formatDescription(military.description, 4).map((desc, i) => (
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
          <section className="skills-section">
            <h2 className="section-title">{translations.en.skills}</h2>
            {/* לוגים */}
            <>{console.log('Skills data:', data.skills)}</>
            
            <div className="skills-items">
              {/* Technical Skills */}
              {data.skills.technical && data.skills.technical.length > 0 && (
                <>
                  <>{console.log('Technical skills:', data.skills.technical)}</>
                  {data.skills.technical.map((skill, index) => (
                    <span key={`tech-${index}`} className="skill-item">
                      {skill.name}
                      {index < data.skills.technical.length - 1 && (
                        <span className="experience-separator">|</span>
                      )}
                    </span>
                  ))}
                </>
              )}

              {/* Soft Skills */}
              {data.skills.soft && data.skills.soft.length > 0 && (
                <>
                  <>{console.log('Soft skills:', data.skills.soft)}</>
                  {data.skills.soft.map((skill, index) => (
                    <span key={`soft-${index}`} className="skill-item">
                      {skill.name}
                      {index < data.skills.soft.length - 1 && (
                        <span className="experience-separator">|</span>
                      )}
                    </span>
                  ))}
                </>
              )}

              {/* Languages */}
              {data.skills.languages && data.skills.languages.length > 0 && (
                <>
                  <>{console.log('Languages:', data.skills.languages)}</>
                  {data.skills.languages.map((lang, index) => (
                    <span key={`lang-${index}`} className="skill-item">
                      {`${lang.language} - ${lang.level}`}
                      {index < data.skills.languages.length - 1 && (
                        <span className="experience-separator">|</span>
                      )}
                    </span>
                  ))}
                </>
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