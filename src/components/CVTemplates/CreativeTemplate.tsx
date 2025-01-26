'use client';
import React, { useEffect, useState } from 'react';
import { ResumeData } from '../../types/resume';
import '../../styles/templates/creative.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';
import { formatDescription, formatDate } from './utils';
import { Edit2 } from 'lucide-react';
import { PersonalInfoEdit } from '../EditableFields/PersonalInfoEdit';
import { SkillsEdit } from '../EditableFields/SkillsEdit';
import { EducationEdit } from '../EditableFields/EducationEdit';
import { MilitaryEdit } from '../EditableFields/MilitaryEdit';
import { ExperienceEdit } from '../EditableFields/ExperienceEdit';
import { ProfessionalSummaryEdit } from '../EditableFields/ProfessionalSummaryEdit';
import { LanguagesEdit } from '../EditableFields/LanguagesEdit';

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
    skillLevel: 'רמת מיומנות',
    topDecoration: 'קישוט עליון',
    bottomDecoration: 'קישוט תחתון',
    greyBackground: 'רקע אפור',
    emptyDot: 'נקודה ריקה',
    fullDot: 'נקודה מלאה'
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
    skillLevel: 'Skill Level',
    topDecoration: 'Top Decoration',
    bottomDecoration: 'Bottom Decoration',
    greyBackground: 'Grey Background',
    emptyDot: 'Empty Dot',
    fullDot: 'Full Dot'
  }
} as const;

interface CreativeTemplateProps {
  data: ResumeData;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index: number) => void;
}

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {},
  onEdit = () => {}
}) => {
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isMilitaryOpen, setIsMilitaryOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isProfessionalSummaryOpen, setIsProfessionalSummaryOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  // שימוש בשפת התוכן המקורית של קורות החיים
  const cvLang = data.lang;
  
  // משתמשים בשפת התוכן המקורית לכותרות
  const t = translations[cvLang as keyof typeof translations];

  const { personalInfo, experience, education, skills, military } = data;
  // שימוש בשפת הממשק רק לכיוון הטקסט
  const isRTL = cvLang === 'he';

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

  const splitName = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    return { firstName, lastName };
  };

  const formatDate = (startDate: string, endDate: string) => {
    const formattedEnd = endDate === 'כיום' || endDate === 'היום' ? 
      t.present : 
      endDate;
    
    return isRTL ? 
      `${startDate} - ${formattedEnd}` : 
      `${startDate} ${t.to} ${formattedEnd}`;
  };

  return (
    <div className={`${assistant.className} creative-template`} data-cv-lang={cvLang} dir={isRTL ? 'rtl' : 'ltr'}>
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
                  onClick={() => setIsPersonalInfoOpen(true)}
                  className="edit-button mr-2 -mt-1"
                  title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                >
                  <Edit2 size={14} />
                </button>
              )}
            </h1>
          </div>
          <div className="creative-separator" />
          <div className="creative-contact-info">
            <div>{data.personalInfo.email && `${t.email}: ${data.personalInfo.email}`}</div>
            <div>{data.personalInfo.phone && `${t.phone}: ${data.personalInfo.phone}`}</div>
            <div>{data.personalInfo.address && `${t.address}: ${data.personalInfo.address}`}</div>
          </div>
        </div>

        {/* כישורים */}
        {data.skills && (
          (Array.isArray(data.skills.technical) && data.skills.technical.length > 0) || 
          (Array.isArray(data.skills.soft) && data.skills.soft.length > 0)
        ) && (
          <div className="creative-section">
            <h2 className="creative-section-title relative">
              {t.skills}
              {isEditing && (
                <button
                  onClick={() => setIsSkillsOpen(true)}
                  className="edit-button absolute right-full ml-2"
                  title={lang === 'he' ? 'ערוך כישורים' : 'Edit Skills'}
                >
                  <Edit2 size={14} />
                </button>
              )}
            </h2>
            <div className="creative-separator" />
            <div className="creative-skills">
              {/* כישורים טכניים עם נקודות */}
              {Array.isArray(data.skills.technical) && data.skills.technical.map((skill, index) => (
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
              
              {/* כישורים רכים ללא נקודות */}
              {Array.isArray(data.skills.soft) && data.skills.soft.map((skill, index) => (
                <div key={`soft-${index}`} className="creative-skill-item soft-skill">
                  <div className="creative-skill-content">
                    <span className={getSkillNameClass(skill.name)}>{skill.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* שפות */}
        {data.skills.languages && data.skills.languages.length > 0 && (
          <div className="creative-section">
            <h2 className="creative-section-title relative">
              {t.languages}
              {isEditing && (
                <button
                  onClick={() => setIsLanguagesOpen(true)}
                  className="edit-button absolute right-full ml-2"
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

        {/* קישוט תחתון */}
        <Image
          src="/design/creative/on_blueD.svg"
          alt={t.bottomDecoration}
          className="creative-bg-bottom"
          width={200}
          height={200}
        />
      </div>

      <div className="creative-left-column">
        {/* קישוט עליון */}
        <Image
          src="/design/creative/icon.svg"
          alt={t.topDecoration}
          className="creative-icon-top"
          width={60}
          height={60}
        />
        
        {/* רקע אפור */}
        <Image
          src="/design/creative/greyBG.svg"
          alt={t.greyBackground}
          className="creative-bg-grey"
          width={100}
          height={50}
        />

        {/* תקציר מקצועי */}
        {data.personalInfo.summary && (
          <div className="creative-summary">
            <h2 className="creative-summary-title relative">
              {t.professionalSummary}
              {isEditing && (
                <button
                  onClick={() => setIsProfessionalSummaryOpen(true)}
                  className="edit-button absolute right-full ml-2"
                  title={lang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
                >
                  <Edit2 size={14} />
                </button>
              )}
            </h2>
            <div className="creative-summary-content">
              <p>{data.personalInfo.summary}</p>
            </div>
          </div>
        )}

        {/* ניסיון תעסוקתי */}
        {data.experience && data.experience.length > 0 && (
          <div className="creative-experience">
            <h2 className="creative-section-title dark relative">
              {t.workExperience}
              {isEditing && (
                <button
                  onClick={() => setIsExperienceOpen(true)}
                  className="edit-button absolute right-full ml-2"
                  title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                >
                  <Edit2 size={14} />
                </button>
              )}
            </h2>
            <div className="creative-experience-items">
              {data.experience.map((exp, index) => (
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
                      {formatDate(exp.startDate, exp.endDate)}
                    </span>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="creative-experience-description">
                      {formatDescription(exp.description, data.experience.length).map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* השכלה */}
        {data.education?.degrees && data.education.degrees.length > 0 && (
          <div className="creative-experience">
            <h2 className="creative-section-title dark relative">
              {t.education}
              {isEditing && (
                <button
                  onClick={() => setIsEducationOpen(true)}
                  className="edit-button absolute right-full ml-2"
                  title={lang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                >
                  <Edit2 size={14} />
                </button>
              )}
            </h2>
            <div className="creative-experience-items">
              {data.education.degrees.map((degree, index) => (
                <div key={index} className="creative-experience-item">
                  <div className="creative-experience-header">
                    <div className="creative-experience-title-wrapper">
                      <h3 className="creative-experience-position">{`${degree.type} ${degree.field}`}</h3>
                      <span className="creative-experience-company">{degree.institution}</span>
                    </div>
                    <div className="creative-experience-date">
                      {formatDate(degree.startDate, degree.endDate)}
                    </div>
                  </div>
                  {degree.specialization && (
                    <div className="creative-education-description">
                      {`${t.specialization}: ${degree.specialization}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* שירות צבאי */}
        {data.military && (
          <div className="creative-experience">
            <h2 className="creative-section-title dark relative">
              {t.militaryService}
              {isEditing && (
                <button
                  onClick={() => setIsMilitaryOpen(true)}
                  className="edit-button absolute right-full ml-2"
                  title={lang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                >
                  <Edit2 size={14} />
                </button>
              )}
            </h2>
            <div className="creative-experience-items">
              <div className="creative-experience-item">
                <div className="creative-experience-header">
                  <div className="creative-experience-title-wrapper">
                    <h3 className="creative-experience-position">{military?.role}</h3>
                    <span className="creative-experience-company">{military?.unit}</span>
                  </div>
                  <div className="creative-experience-date">
                    {formatDate(data.military.startDate, data.military.endDate)}
                  </div>
                </div>
                {data.military.description && data.military.description.length > 0 && (
                  <ul className="creative-experience-description">
                    {formatDescription(data.military.description, 3).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Popups */}
      <PersonalInfoEdit
        isOpen={isPersonalInfoOpen}
        onClose={() => setIsPersonalInfoOpen(false)}
        data={data.personalInfo}
        onSave={(newData) => {
          onUpdate('personalInfo', newData);
          setIsPersonalInfoOpen(false);
        }}
        isRTL={isRTL}
        template="creative"
      />

      <SkillsEdit
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        data={data.skills}
        onSave={(newData) => {
          onUpdate('skills', newData);
          setIsSkillsOpen(false);
        }}
        isRTL={isRTL}
        template="creative"
      />

      <EducationEdit
        isOpen={isEducationOpen}
        onClose={() => setIsEducationOpen(false)}
        data={data.education?.degrees || []}
        onSave={(newData) => {
          onUpdate('education', { degrees: newData });
          setIsEducationOpen(false);
        }}
        isRTL={isRTL}
        template="creative"
      />

      <MilitaryEdit
        isOpen={isMilitaryOpen}
        onClose={() => setIsMilitaryOpen(false)}
        data={data.military || null}
        onSave={(newData) => {
          onUpdate('military', newData);
          setIsMilitaryOpen(false);
        }}
        isRTL={isRTL}
        template="creative"
      />

      <ExperienceEdit
        isOpen={isExperienceOpen}
        onClose={() => setIsExperienceOpen(false)}
        data={data.experience}
        onSave={(newData) => {
          onUpdate('experience', newData);
          setIsExperienceOpen(false);
        }}
        isRTL={isRTL}
        template="creative"
      />

      <ProfessionalSummaryEdit
        isOpen={isProfessionalSummaryOpen}
        onClose={() => setIsProfessionalSummaryOpen(false)}
        data={data.personalInfo.summary || ''}
        onSave={(newData) => {
          onUpdate('personalInfo', { ...data.personalInfo, summary: newData });
          setIsProfessionalSummaryOpen(false);
        }}
        isRTL={isRTL}
        template="creative"
        cvData={data}
      />

      <LanguagesEdit
        isOpen={isLanguagesOpen}
        onClose={() => setIsLanguagesOpen(false)}
        data={data.skills.languages || []}
        onSave={(newData) => {
          onUpdate('skills', { ...data.skills, languages: newData });
          setIsLanguagesOpen(false);
        }}
        isRTL={isRTL}
        template="creative"
      />
    </div>
  );
};

export default CreativeTemplate; 