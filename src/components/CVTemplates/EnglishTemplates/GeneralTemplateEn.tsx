'use client';

import React from 'react';
import { ResumeData } from '../../../types/resume';
import MailIcon from '../../../../public/design/general/MailIcon.svg';
import PhoneIcon from '../../../../public/design/general/PhoneIcon.svg';
import LocIcon from '../../../../public/design/general/LocIcon.svg';
import BusiIcon from '../../../../public/design/general/busiIcon.svg';
import SchoolIcon from '../../../../public/design/general/SchoolIcon.svg';
import MilIcon from '../../../../public/design/general/MilIcon.svg';
import SkillIcon from '../../../../public/design/general/SkillIcon.svg';
import LangIcon from '../../../../public/design/general/langIcon.svg';
import DecUpLeft from '../../../../public/design/general/decUpLeft.svg';
import Building from '../../../../public/design/general/buiding.svg';
import IconDec from '../../../../public/design/general/Icon.svg';
import Cloud from '../../../../public/design/general/cloud.svg';
import Image from 'next/image';
import '../../../styles/templates/general-en.css';
import { Assistant } from 'next/font/google';

interface GeneralTemplateEnProps {
  data: ResumeData;
  lang: string;
}

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

const GeneralTemplateEn: React.FC<GeneralTemplateEnProps> = ({ data, lang }) => {
  const t = translations.en;

  const { personalInfo, experience, education, skills, military } = data;

  const getSkillLevel = (level: number) => {
    if (typeof level !== 'number') return 'Good';

    const levels: { [key: number]: string } = {
      5: 'Expert',
      4: 'Advanced',
      3: 'Good',
      2: 'Intermediate',
      1: 'Basic'
    };

    return levels[level] || 'Good';
  };

  // Check if data exists
  if (!data || !data.personalInfo) {
    console.error('Missing required data:', data);
    return (
      <div className="error-message" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Error: Missing required data
      </div>
    );
  }

  // Split name into first and last name
  const fullName = data.personalInfo.name || '';
  const [firstName, ...lastNameArr] = fullName.split(' ');
  const lastName = lastNameArr.join(' ');

  return (
    <div className={`${assistant.className} general-template-en`}>
      {/* Header */}
      <header className="general-header-en">
        <div className="general-header-content-en">
          <div className="general-header-name-en">
            <h1>
              <span className="firstname-en">{firstName}</span>
              <span className="lastname-en">{lastName}</span>
            </h1>
          </div>

          <div className="contact-info-en">
            {data.personalInfo.email && (
              <div className="contact-item-en">
                <div className="contact-item-icon-en">
                  <Image src={MailIcon} alt="email" width={16} height={16} />
                </div>
                <span>{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="contact-item-en">
                <div className="contact-item-icon-en">
                  <Image src={PhoneIcon} alt="phone" width={16} height={16} />
                </div>
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {data.personalInfo.address && (
              <div className="contact-item-en">
                <div className="contact-item-icon-en">
                  <Image src={LocIcon} alt="location" width={16} height={16} />
                </div>
                <span>{data.personalInfo.address}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="header-decoration-en right-decoration-en">
        <Image src={DecUpLeft} alt="" width={150} height={150} />
      </div>
      <div className="header-decoration-en left-decoration-en">
        <Image src={DecUpLeft} alt="" width={150} height={150} />
      </div>

      <div className="content-en">
        {/* Summary Section */}
        {data.personalInfo.summary && (
          <section className="summary-section-en">
            <h3 className="summary-title-en">
              {t.professionalSummary}
            </h3>
            <div className="summary-content-en">
              <p>{data.personalInfo.summary}</p>
            </div>
          </section>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="section-en">
            <h3 className="section-title-en">
              <div className="section-icon-en">
                <Image src={BusiIcon} alt="work" width={48} height={48} />
              </div>
              {t.workExperience}
            </h3>
            <div className="timeline-container-en">
              {data.experience.map((job, index) => (
                <div key={index} className="timeline-item-en">
                  <div className="timeline-header-en">
                    <h4>
                      <span className="timeline-position-en">{job.position}</span>
                      {job.company && (
                        <>
                          <span className="timeline-separator-en">|</span>
                          <span className="timeline-company-en">{job.company}</span>
                        </>
                      )}
                      {(job.startDate || job.endDate) && (
                        <span className="timeline-date-en">
                          {job.startDate} - {job.endDate}
                        </span>
                      )}
                    </h4>
                  </div>
                  {job.description && job.description.length > 0 && (
                    <div className="timeline-content-en">
                      {job.description.map((desc: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          <span>{desc}</span>
                          {i < arr.length - 1 && <span className="description-separator">|</span>}
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
          <section className="section-en">
            <h3 className="section-title-en">
              <div className="section-icon-en">
                <Image src={SchoolIcon} alt="education" width={48} height={48} />
              </div>
              {t.education}
            </h3>
            <div className="timeline-container-en">
              {data.education.degrees.map((edu, index) => (
                <div key={index} className="timeline-item-en">
                  <div className="timeline-header-en">
                    <h4>
                      <span className="timeline-position-en">{edu.type} {edu.field}</span>
                      {edu.institution && (
                        <>
                          <span className="timeline-separator-en">|</span>
                          <span className="timeline-company-en">{edu.institution}</span>
                        </>
                      )}
                      {edu.years && (
                        <span className="timeline-date-en">
                          {edu.years}
                        </span>
                      )}
                    </h4>
                  </div>
                  {edu.specialization && (
                    <div className="timeline-content-en">
                      <p>{t.specialization}: {edu.specialization}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Military Service */}
        {data.military && (
          <section className="section-en">
            <h3 className="section-title-en">
              <div className="section-icon-en">
                <Image src={MilIcon} alt="military" width={48} height={48} />
              </div>
              {data.military.role?.toLowerCase().includes('national') ? t.nationalService : t.militaryService}
            </h3>
            <div className="timeline-container-en">
              <div className="timeline-item-en">
                <div className="timeline-header-en">
                  <h4>
                    <span className="timeline-position-en">{data.military.role}</span>
                    {data.military.unit && (
                      <>
                        <span className="timeline-separator-en">|</span>
                        <span className="timeline-company-en">{data.military.unit}</span>
                      </>
                    )}
                    {(data.military.startDate || data.military.endDate) && (
                      <span className="timeline-date-en">
                        {data.military.startDate} - {data.military.endDate}
                      </span>
                    )}
                  </h4>
                </div>
                {data.military.description && data.military.description.length > 0 && (
                  <div className="timeline-content-en">
                    {data.military.description.map((desc: string, i: number, arr: string[]) => (
                      <React.Fragment key={i}>
                        <span>{desc}</span>
                        {i < arr.length - 1 && <span className="description-separator">|</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Skills */}
        {((data.skills.technical && data.skills.technical.length > 0) || 
          (data.skills.soft && data.skills.soft.length > 0)) && (
          <section className="section-en">
            <h3 className="section-title-en">
              <div className="section-icon-en">
                <Image src={SkillIcon} alt="skills" width={48} height={48} />
              </div>
              {t.skills}
            </h3>
            <div className="skills-grid-en">
              {data.skills.technical.map((skill, index) => (
                <span key={`tech-${index}`} className="skill-item-en">
                  {skill.name && `${skill.name}${skill.level ? ` - ${getSkillLevel(Number(skill.level))}` : ''}`}
                </span>
              ))}
              {data.skills.soft.map((skill, index) => (
                <span key={`soft-${index}`} className="skill-item-en">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.skills.languages && data.skills.languages.length > 0 && (
          <section className="section-en">
            <h3 className="section-title-en">
              <div className="section-icon-en">
                <Image src={LangIcon} alt="languages" width={48} height={48} />
              </div>
              {t.languages}
            </h3>
            <div className="languages-grid-en">
              {data.skills.languages.map((lang, index) => (
                <div key={index} className="language-item-en">
                  <span className="language-name-en">{lang.language}</span>
                  <span className="language-level-en">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer Decorations */}
      <div className="footer-decorations-en">
        <div className="building-decoration-en">
          <Image src={Building} alt="" width={200} height={200} />
        </div>
        <div className="icon-decoration-en">
          <Image src={IconDec} alt="" width={60} height={60} />
        </div>
        <div className="cloud-decoration-en">
          <Image src={Cloud} alt="" width={100} height={50} />
        </div>
      </div>
    </div>
  );
};

export default GeneralTemplateEn; 