'use client';
import React, { useEffect, useState } from 'react';
import { ResumeData, Language, Degree, MilitaryService } from '../../types/resume';
import '../../styles/templates/classic.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';
import { EditableText } from '../EditableFields/EditableText';
import { EditableList } from '../EditableFields/EditableList';
import { adjustTemplateSize, formatDescription, formatDate, getSkillLevel } from './utils';
import { EditPopup } from '../EditableFields/EditPopup';
import { EditButton } from '../EditableFields/EditButton';
import { AddItemPopup } from '../EditableFields/AddItemPopup';
import { Button } from '@/components/theme/ui/button';
import { Plus, Edit2 } from 'lucide-react';
import { PersonalInfoEdit } from '../EditableFields/PersonalInfoEdit';
import { SkillsEdit } from '../EditableFields/SkillsEdit';
import { EducationEdit } from '../EditableFields/EducationEdit';
import { MilitaryEdit } from '../EditableFields/MilitaryEdit';
import { ExperienceEdit } from '../EditableFields/ExperienceEdit';
import { ProfessionalSummaryEdit } from '../EditableFields/ProfessionalSummaryEdit';
import { LanguagesEdit } from '../EditableFields/LanguagesEdit';

// הגדרת טיפוסים
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

interface Skills {
  technical: TechnicalSkill[];
  soft: SoftSkill[];
  languages: LanguageSkill[];
}

interface ResumeDataWithSkills extends ResumeData {
  skills: Skills;
}

interface ClassicTemplateProps {
  data: ResumeDataWithSkills;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index: number) => void;
}

interface TransformedMilitary {
  role: string;
  unit: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'date';
  value?: any;
  placeholder?: string;
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
    nationalService: 'שירות לאומי',
    professionalSummary: 'תקציר מקצועי',
    email: 'דוא"ל',
    phone: 'טלפון',
    address: 'כתובת',
    specialization: 'התמחות',
    to: 'עד',
    present: 'היום',
    technicalSkills: 'כישורים טכניים',
    softSkills: 'כישורים רכים',
    skillLevel: 'רמת מנות'
  },
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

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {},
  onEdit = () => {}
}) => {
  // הוספת לוג לבדיקת הנתונים
  console.log('Full CV Data:', data);
  console.log('Skills Data:', data.skills);
  console.log('Languages Data:', data?.skills?.languages);

  const [editingSection, setEditingSection] = useState<{
    type: string;
    index?: number;
    data: any;
  } | null>(null);

  const [isAddingItem, setIsAddingItem] = useState<{
    type: string;
    fields: any[];
  } | null>(null);

  const [fontSize, setFontSize] = useState(16); // גודל ברירת מחדל

  const cvLang = data.lang;
  const t = translations[cvLang as keyof typeof translations];
  const { personalInfo, experience, education, skills, military } = data;
  const isRTL = cvLang === 'he';

  // הוספת states חדשים לפופאפים
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isMilitaryOpen, setIsMilitaryOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isProfessionalSummaryOpen, setIsProfessionalSummaryOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  const handlePersonalInfoUpdate = (field: keyof typeof personalInfo, value: string) => {
    onUpdate('personalInfo', { ...personalInfo, [field]: value });
  };

  const handleExperienceUpdate = (index: number, field: string, value: any) => {
    const newExperience = [...experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    onUpdate('experience', newExperience);
  };

  const handleEducationUpdate = (index: number, field: string, value: any) => {
    const newEducation = { ...education };
    newEducation.degrees[index] = { ...newEducation.degrees[index], [field]: value };
    onUpdate('education', newEducation);
  };

  const handleMilitaryUpdate = (field: string, value: any) => {
    const newMilitary = { ...military, [field]: value };
    onUpdate('military', newMilitary);
  };

  const handleSkillsUpdate = (type: 'technical' | 'soft' | 'languages', index: number, field: string, value: any) => {
    const newSkills = { ...skills };
    if (type === 'languages') {
      newSkills.languages[index] = { ...newSkills.languages[index], [field]: value };
    } else if (type === 'technical') {
      newSkills.technical[index] = { ...newSkills.technical[index], [field]: value };
    } else {
      newSkills.soft[index] = { ...newSkills.soft[index], [field]: value };
    }
    onUpdate('skills', newSkills);
  };

  const handleAddSkill = (type: 'technical' | 'soft') => {
    const newSkills = { ...skills };
    if (type === 'technical') {
      const newSkill: TechnicalSkill = {
        name: '',
        level: 3
      };
      newSkills.technical = [...(newSkills.technical || []), newSkill];
    } else {
      const newSkill: SoftSkill = {
        name: '',
        level: 3
      };
      newSkills.soft = [...(newSkills.soft || []), newSkill];
    }
    onUpdate('skills', newSkills);
  };

  const handleAddLanguage = () => {
    const newSkills = { ...skills };
    newSkills.languages = [...(newSkills.languages || []), { language: '', level: '' }];
    onUpdate('skills', newSkills);
  };

  const splitName = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    return { firstName, lastName };
  };

  const { firstName, lastName } = splitName(personalInfo.name);

  const adjustFontSizeToContent = () => {
    const content = document.querySelector('.classic-content');
    
    if (!content) return;
    
    // קביעת גודל פונט מקסימלי קבוע
    const maxFontSize = 16;
    document.documentElement.style.setProperty('--base-font-size', `${maxFontSize}px`);
  };

  const adjustFontSize = (direction: 'increase' | 'decrease') => {
    const newSize = direction === 'increase' ? fontSize + 0.5 : fontSize - 0.5;
    
    // הגבלת הגודל בין 12 ל-20 פיקסלים
    if (newSize >= 12 && newSize <= 20) {
      setFontSize(newSize);
      document.documentElement.style.setProperty('--base-font-size', `${newSize}px`);
    }
  };

  useEffect(() => {
    adjustTemplateSize('.classic-template');
    adjustFontSizeToContent();
  }, [data]);

  const handleEdit = (type: string, index?: number) => {
    switch (type) {
      case 'personalInfo':
        setIsPersonalInfoOpen(true);
        break;
      case 'skills':
        setIsSkillsOpen(true);
        break;
      case 'education':
        setIsEducationOpen(true);
        break;
      case 'military':
        setIsMilitaryOpen(true);
        break;
      case 'experience':
        setIsExperienceOpen(true);
        break;
      case 'summary':
        setIsProfessionalSummaryOpen(true);
        break;
      case 'languages':
        setIsLanguagesOpen(true);
        break;
    }
  };

  const handleAdd = (type: string) => {
    let fields: Field[] = [];
    switch (type) {
      case 'experience':
        fields = [
          { name: 'position', label: isRTL ? 'תפקיד' : 'Position', type: 'text' },
          { name: 'company', label: isRTL ? 'חברה' : 'Company', type: 'text' },
          { name: 'startDate', label: isRTL ? 'תאריך התחלה' : 'Start Date', type: 'text' },
          { name: 'endDate', label: isRTL ? 'תאריך סיום' : 'End Date', type: 'text' },
          { name: 'description', label: isRTL ? 'תיאור התפקיד' : 'Job Description', type: 'list' }
        ];
        break;
      case 'education':
        fields = [
          { name: 'type', label: isRTL ? 'סוג תואר' : 'Degree Type', type: 'text' },
          { name: 'field', label: isRTL ? 'תחום' : 'Field', type: 'text' },
          { name: 'institution', label: isRTL ? 'מוסד' : 'Institution', type: 'text' },
          { name: 'startDate', label: isRTL ? 'תאריך התחלה' : 'Start Date', type: 'text' },
          { name: 'endDate', label: isRTL ? 'תאריך סיום' : 'End Date', type: 'text' },
          { name: 'specialization', label: isRTL ? 'התמחות' : 'Specialization', type: 'text' }
        ];
        break;
      // ... Add more cases for other sections
    }
    setIsAddingItem({ type, fields });
  };

  const handleSave = (values: any) => {
    if (!editingSection) return;

    switch (editingSection.type) {
      case 'personalInfo':
        onUpdate('personalInfo', { ...personalInfo, ...values });
        break;
      case 'experience':
        if (typeof editingSection.index === 'number') {
          const newExperience = [...experience];
          newExperience[editingSection.index] = { ...newExperience[editingSection.index], ...values };
          onUpdate('experience', newExperience);
        }
        break;
      case 'education':
        if (typeof editingSection.index === 'number') {
          const newEducation = { ...education };
          newEducation.degrees[editingSection.index] = { ...newEducation.degrees[editingSection.index], ...values };
          onUpdate('education', newEducation);
        }
        break;
      // ... Add more cases for other sections
    }
  };

  const handleAddItem = (values: any) => {
    if (!isAddingItem) return;

    switch (isAddingItem.type) {
      case 'experience':
        const newExperience = [...experience, values];
        onUpdate('experience', newExperience);
        break;
      case 'education':
        const newEducation = { ...education };
        newEducation.degrees = [...(newEducation.degrees || []), values];
        onUpdate('education', newEducation);
        break;
      // ... Add more cases for other sections
    }
  };

  return (
    <div className={`${assistant.className} classic-template`}
      data-cv-lang={cvLang}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* כפתורי שליטה בגודל */}
      <div className="font-size-controls" style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        display: 'none',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        <button 
          onClick={() => adjustFontSize('decrease')}
          className="font-size-button"
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            background: 'white'
          }}
        >
          -
        </button>
        <span style={{ fontSize: '14px' }}>{fontSize}px</span>
        <button 
          onClick={() => adjustFontSize('increase')}
          className="font-size-button"
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            background: 'white'
          }}
        >
          +
        </button>
      </div>

      <div className="classic-header relative">
        <Image
          src="/design/classic/dec.svg"
          alt="header decoration"
          width={15}
          height={15}
          className="absolute top-1/2 -translate-y-1/2 right-12 header-corner-decoration"
          priority={true}
        />
        <div className="relative z-10">
          <div className="header-name-wrapper">
            <h1 className="header-name">
              <span className="header-name-first">{firstName}</span>
              {lastName && <span className="header-name-last">{lastName}</span>}
            </h1>
            {isEditing && (
              <button 
                onClick={() => handleEdit('personalInfo', 0)}
                className="edit-button"
                title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="header-contact">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.email && personalInfo.phone && <span className="contact-separator">|</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.phone && personalInfo.address && <span className="contact-separator">|</span>}
            {personalInfo.address && <span>{personalInfo.address}</span>}
          </div>
        </div>
      </div>

      <main className="classic-content">
        {/* תקציר */}
        <section className="summary-section">
          <h2 className="section-title">
            {t.professionalSummary}
            {isEditing && (
              <button 
                onClick={() => handleEdit('summary', 0)}
                className="edit-button"
                title={lang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </h2>
          <div className="summary-content">
            {data.personalInfo.summary}
          </div>
        </section>

        {/* ניסיון תעסוקתי */}
        {experience && experience.length > 0 && (
          <section className="experience-section">
            <h2 className="section-title">
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
            </h2>
            <div className="experience-items">
              {experience.map((exp, index) => (
                <div key={index} className="experience-item relative">
                  <div className="experience-header">
                    <div className="experience-title-wrapper">
                      <div className="flex items-center gap-1">
                        <span className="experience-title">{exp.position}</span>
                      </div>
                      {exp.company && (
                        <>
                          <span className="experience-separator">|</span>
                          <span className="experience-company">{exp.company}</span>
                        </>
                      )}
                    </div>
                    <div className="experience-date">
                      {formatDate(exp.startDate, exp.endDate, cvLang)}
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="experience-description" style={{ listStyle: 'none', paddingRight: 0 }}>
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

        {/* השכלה */}
        {education?.degrees && education.degrees.length > 0 && (
          <section className="education-section">
            <h2 className="section-title">
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
            </h2>
            <div className="education-items">
              {education.degrees.map((degree, index) => (
                <div key={index} className="education-item relative">
                  <div className="education-header">
                    <div className="education-title-wrapper">
                      <div className="flex items-center gap-1">
                        <span className="education-degree">
                          {`${degree.type} ${degree.field}`}
                        </span>
                      </div>
                      <span className="experience-separator">|</span>
                      <span className="education-institution">{degree.institution}</span>
                    </div>
                    <div className="education-date">
                      {formatDate(degree.startDate, degree.endDate, cvLang)}
                    </div>
                  </div>
                  {degree.specialization && (
                    <div className="education-specialization">
                      התמחות: {degree.specialization}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* שירות צבאי/לאומי */}
        {military && (
          <section className="military-section">
            <h2 className="section-title">
              {military.role?.toLowerCase().includes('לאומי') ? t.nationalService : t.militaryService}
              {isEditing && (
                <button 
                  onClick={() => handleEdit('military', 0)}
                  className="edit-button"
                  title={lang === 'he' ? (military.role?.toLowerCase().includes('לאומי') ? 'ערוך שירות לאומי' : 'ערוך שירות צבאי') : 'Edit Service'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            <div className="military-content">
              <div className="military-header">
                <div className="military-title-wrapper">
                  <div className="flex items-center gap-1">
                    <h3 className="military-title">{military.role}</h3>
                    <span className="military-separator">|</span>
                    <span className="military-unit">{military.unit}</span>
                  </div>
                </div>
                <div className="military-date">
                  {formatDate(military.startDate, military.endDate, lang)}
                </div>
              </div>
              {military.description && military.description.length > 0 && (
                <ul className="military-description" style={{ listStyle: 'none', paddingRight: 0 }}>
                  {formatDescription(military.description, 3).map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* כישורים */}
        {skills && (
          <section className="skills-section">
            <h2 className="section-title">
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
            </h2>
            <div className="skills-items" style={{ display: 'block' }}>
              <span style={{ display: 'inline-block' }}>
                {skills.technical?.map((skill, index) => (
                  <span key={`tech-${index}`} style={{ display: 'inline', textAlign: 'justify' }}>
                    <span style={{ fontWeight: 600 }}>{skill.name}</span>
                    {" - "}
                    <span style={{ fontWeight: 300, color: '#666' }}>{getSkillLevel(skill.level, cvLang)}</span>
                    {index < skills.technical.length - 1 && <span style={{ margin: '0 0.2rem', opacity: 0.4 }}>|</span>}
                  </span>
                ))}
              </span>
              {skills.soft?.length > 0 && (
                <span style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                  {skills.soft.map((skill, index) => (
                    <span key={`soft-${index}`} style={{ display: 'inline', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 600 }}>{skill.name}</span>
                      {" - "}
                      <span style={{ fontWeight: 300, color: '#666' }}>{getSkillLevel(skill.level, cvLang)}</span>
                      {index < skills.soft.length - 1 && <span style={{ margin: '0 0.2rem', opacity: 0.4 }}>|</span>}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </section>
        )}

        {/* שפות */}
        {data.skills?.languages && data.skills.languages.length > 0 && (
          <section className="languages-section">
            <h2 className="section-title">
              {t.languages}
              {isEditing && (
                <button 
                  onClick={() => handleEdit('languages', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            <div style={{ display: 'inline-block', margin: '0 4rem 0 6rem' }}>
              {data.skills.languages.map((langSkill, index, arr) => (
                <span key={`lang-${index}`} style={{ display: 'inline' }}>
                  <span style={{ fontWeight: 600, fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)' }}>{langSkill.language}</span>
                  <span style={{ margin: '0 2px' }}>-</span>
                  <span style={{ fontWeight: 300, color: '#666', fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)' }}>{langSkill.level}</span>
                  {index < arr.length - 1 && <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="classic-footer">
      </div>
      {editingSection && (
        <EditPopup
          isOpen={true}
          onClose={() => setEditingSection(null)}
          data={editingSection.data}
          onSave={handleSave}
          section={editingSection.type}
        />
      )}
      {isAddingItem && (
        <AddItemPopup
          isOpen={true}
          onClose={() => setIsAddingItem(null)}
          onAdd={handleAddItem}
          section={isAddingItem.type}
        />
      )}

      {/* Edit Popups */}
      <PersonalInfoEdit
        isOpen={isPersonalInfoOpen}
        onClose={() => setIsPersonalInfoOpen(false)}
        data={data.personalInfo}
        onSave={(newData) => {
          onUpdate('personalInfo', { ...data.personalInfo, summary: data.personalInfo.summary, ...newData });
          setIsPersonalInfoOpen(false);
        }}
        isRTL={isRTL}
        template="classic"
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
        template="classic"
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
        template="classic"
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
        template="classic"
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
        template="classic"
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
        template="classic"
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
        template="classic"
      />
    </div>
  );
};

export default ClassicTemplate;