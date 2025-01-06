'use client';

import React, { useEffect } from 'react';
import { ResumeData } from '../../../types/resume';
import '../../../styles/templates/creative-en.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';

const assistant = Assistant({ 
  subsets: ['hebrew', 'latin'],
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
    skillLevel: 'Skill Level',
    topDecoration: 'Top Decoration',
    bottomDecoration: 'Bottom Decoration',
    greyBackground: 'Grey Background',
    emptyDot: 'Empty Dot',
    fullDot: 'Full Dot'
  }
} as const;

interface CreativeTemplateEnProps {
  data: ResumeData;
  lang: string;
}

const CreativeTemplateEn: React.FC<CreativeTemplateEnProps> = ({ data, lang }) => {
  const t = translations.en;

  const { personalInfo, experience, education, skills, military } = data;

  useEffect(() => {
    const adjustSize = () => {
      const content = document.querySelector('.creative-template-en') as HTMLElement;
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
    if (!name) return 'creative-skill-name-en';
    if (name.length > 25) return 'creative-skill-name-en smaller';
    if (name.length > 20) return 'creative-skill-name-en small';
    return 'creative-skill-name-en';
  };

  const splitName = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    return { firstName, lastName };
  };

  const formatDate = (startDate: string, endDate: string) => {
    const formattedEnd = endDate === 'Present' || endDate === 'present' ? 
      t.present : 
      endDate;
    
    return `${startDate} ${t.to} ${formattedEnd}`;
  };

  return (
    <div className={`${assistant.className} creative-template-en`}>
      <div className="creative-left-column-en">
        {/* Top Background */}
        <Image
          src="/design/creative/pink_on_blue.svg"
          alt={t.topDecoration}
          className="creative-bg-top-en"
          width={40}
          height={40}
        />

        {/* Personal Info */}
        <div className="creative-personal-info-en">
          <h1 className="creative-name-en">
            {(() => {
              const { firstName, lastName } = splitName(data.personalInfo.name);
              return (
                <>
                  <span className="creative-firstname-en">{firstName}</span>
                  {lastName && <span className="creative-lastname-en">{lastName}</span>}
                </>
              );
            })()}
          </h1>
          <div className="creative-separator-en" />
          <div className="creative-contact-info-en">
            <div>{data.personalInfo.email && `${t.email}: ${data.personalInfo.email}`}</div>
            <div>{data.personalInfo.phone && `${t.phone}: ${data.personalInfo.phone}`}</div>
            <div>{data.personalInfo.address && `${t.address}: ${data.personalInfo.address}`}</div>
          </div>
        </div>

        {/* Languages */}
        {data.skills.languages && data.skills.languages.length > 0 && (
          <div className="creative-section-en">
            <h2 className="creative-section-title-en">
              {t.languages}
            </h2>
            <div className="creative-separator-en" />
            <div className="creative-languages-en">
              {data.skills.languages.map((lang, index) => (
                <div key={index} className="creative-language-item-en">
                  <span className="creative-language-en">{lang.language}</span>
                  <span className="creative-separator-vertical-en">|</span>
                  <span className="creative-level-en">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {((data.skills.technical && data.skills.technical.length > 0) || 
          (data.skills.soft && data.skills.soft.length > 0)) && (
          <div className="creative-section-en">
            <h2 className="creative-section-title-en">
              {t.skills}
            </h2>
            <div className="creative-separator-en" />
            <div className="creative-skills-en">
              {/* Technical Skills with dots */}
              {data.skills.technical.map((skill, index) => (
                <div key={`tech-${index}`} className="creative-skill-item-en">
                  <div className="creative-skill-content-en">
                    <span className={getSkillNameClass(skill.name)}>{skill.name}</span>
                    <div className="creative-skill-level-en">
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
              
              {/* Soft Skills without dots */}
              {data.skills.soft.map((skill, index) => (
                <div key={`soft-${index}`} className="creative-skill-item-en soft-skill">
                  <div className="creative-skill-content-en">
                    <span className={getSkillNameClass(skill.name)}>{skill.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Decoration */}
        <Image
          src="/design/creative/on_blueD.svg"
          alt={t.bottomDecoration}
          className="creative-bg-bottom-en"
          width={200}
          height={200}
        />
      </div>

      <div className="creative-right-column-en">
        {/* Top Icon */}
        <Image
          src="/design/creative/icon.svg"
          alt={t.topDecoration}
          className="creative-icon-top-en"
          width={60}
          height={60}
        />
        
        {/* Grey Background */}
        <Image
          src="/design/creative/greyBG.svg"
          alt={t.greyBackground}
          className="creative-bg-grey-en"
          width={100}
          height={50}
        />

        {/* Professional Summary */}
        {data.personalInfo.summary && (
          <div className="creative-summary-en">
            <h2 className="creative-summary-title-en">{t.professionalSummary}</h2>
            <p className="creative-summary-content-en">{data.personalInfo.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <div className="creative-experience-en">
            <h2 className="creative-section-title-en dark">{t.workExperience}</h2>
            <div className="creative-experience-items-en">
              {experience.map((exp, index) => (
                <div key={index} className="creative-experience-item-en">
                  <div className="creative-experience-header-en">
                    <div className="creative-experience-title-wrapper-en">
                      <h3 className="creative-experience-position-en">{exp.position}</h3>
                      <span className="creative-experience-company-en">{exp.company}</span>
                    </div>
                    <span className="creative-experience-date-en">
                      {formatDate(exp.startDate, exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <ul className="creative-experience-description-en">
                      {exp.description.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education?.degrees && education.degrees.length > 0 && (
          <div className="creative-experience-en">
            <h2 className="creative-section-title-en dark">{t.education}</h2>
            <div className="creative-experience-items-en">
              {education.degrees.map((edu, index) => (
                <div key={index} className="creative-experience-item-en">
                  <div className="creative-experience-header-en">
                    <div className="creative-experience-title-wrapper-en">
                      <h3 className="creative-experience-position-en">{`${edu.type} ${edu.field}`}</h3>
                      <span className="creative-experience-company-en">{edu.institution}</span>
                    </div>
                    <span className="creative-experience-date-en">
                      {edu.years}
                    </span>
                  </div>
                  {edu.specialization && (
                    <div className="creative-education-description-en">
                      {edu.specialization}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Military Service */}
        {military && (
          <div className="creative-experience-en">
            <h2 className="creative-section-title-en dark">{t.militaryService}</h2>
            <div className="creative-experience-items-en">
              <div className="creative-experience-item-en">
                <div className="creative-experience-header-en">
                  <div className="creative-experience-title-wrapper-en">
                    <h3 className="creative-experience-position-en">{military.role}</h3>
                    <span className="creative-experience-company-en">{military.unit}</span>
                  </div>
                  <span className="creative-experience-date-en">
                    {formatDate(military.startDate, military.endDate)}
                  </span>
                </div>
                {military.description && (
                  <ul className="creative-experience-description-en">
                    {military.description.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
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

export default CreativeTemplateEn; 