'use client';
import React, { useEffect, useState } from 'react';
import { ResumeData } from '../../types/resume';
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
import { Plus } from 'lucide-react';

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
  const [editingSection, setEditingSection] = useState<{
    type: string;
    index?: number;
    data: any;
  } | null>(null);

  const [isAddingItem, setIsAddingItem] = useState<{
    type: string;
    fields: any[];
  } | null>(null);

  const cvLang = data.lang;
  const t = translations[cvLang as keyof typeof translations];
  const { personalInfo, experience, education, skills, military } = data;
  const isRTL = cvLang === 'he';

  // הוספת לוגים לבדיקת הנתונים
  console.log('CV Data:', data);
  console.log('Skills:', skills);
  console.log('Technical Skills:', skills?.technical);
  console.log('Soft Skills:', skills?.soft);

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

  useEffect(() => {
    adjustTemplateSize('.classic-template');
  }, [data]);

  const handleEdit = (type: string, index?: number, data?: any) => {
    let fields: Field[] = [];
    switch (type) {
      case 'personalInfo':
        fields = [
          { name: 'name', label: isRTL ? 'שם מלא' : 'Full Name', type: 'text', value: data.name },
          { name: 'email', label: isRTL ? 'דוא"ל' : 'Email', type: 'text', value: data.email },
          { name: 'phone', label: isRTL ? 'טלפון' : 'Phone', type: 'text', value: data.phone },
          { name: 'address', label: isRTL ? 'כתובת' : 'Address', type: 'text', value: data.address },
          { name: 'summary', label: isRTL ? 'תקציר מקצועי' : 'Professional Summary', type: 'textarea', value: data.summary }
        ];
        break;
      case 'military':
        if (military) {
          fields = [
            { name: 'role', label: isRTL ? 'תפקיד' : 'Role', type: 'text', value: military.role || '' },
            { name: 'unit', label: isRTL ? 'יחידה' : 'Unit', type: 'text', value: military.unit || '' },
            { name: 'startDate', label: isRTL ? 'תאריך התחלה' : 'Start Date', type: 'text', value: military.startDate || '' },
            { name: 'endDate', label: isRTL ? 'תאריך סיום' : 'End Date', type: 'text', value: military.endDate || '' },
            { name: 'description', label: isRTL ? 'תיאור השירות' : 'Service Description', type: 'list', value: military.description || [] }
          ];
        }
        break;
      case 'experience':
        const exp = experience[index || 0];
        fields = [
          { name: 'position', label: isRTL ? 'תפקיד' : 'Position', type: 'text', value: exp.position },
          { name: 'company', label: isRTL ? 'חברה' : 'Company', type: 'text', value: exp.company },
          { name: 'startDate', label: isRTL ? 'תאריך התחלה' : 'Start Date', type: 'text', value: exp.startDate },
          { name: 'endDate', label: isRTL ? 'תאריך סיום' : 'End Date', type: 'text', value: exp.endDate },
          { name: 'description', label: isRTL ? 'תיאור התפקיד' : 'Job Description', type: 'list', value: exp.description }
        ];
        break;
      case 'education':
        const edu = education.degrees[index || 0];
        fields = [
          { name: 'type', label: isRTL ? 'סוג תואר' : 'Degree Type', type: 'text', value: edu.type },
          { name: 'field', label: isRTL ? 'תחום' : 'Field', type: 'text', value: edu.field },
          { name: 'institution', label: isRTL ? 'מוסד' : 'Institution', type: 'text', value: edu.institution },
          { name: 'years', label: isRTL ? 'שנים' : 'Years', type: 'text', value: edu.years },
          { name: 'specialization', label: isRTL ? 'התמחות' : 'Specialization', type: 'text', value: edu.specialization }
        ];
        break;
    }
    setEditingSection({ type, index, data: fields });
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
          { name: 'years', label: isRTL ? 'שנים' : 'Years', type: 'text' },
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
      <div className="under-construction">
        <div className="flex flex-col items-center gap-4">
          <span className="bg-[#4856CD] text-white px-6 py-3 rounded-lg text-xl font-bold">
            {cvLang === 'he' ? 'בבנייה' : 'Under Construction'}
          </span>
          <span className="text-white text-lg">
            {cvLang === 'he' ? 'התבנית אינה זמינה כרגע' : 'This template is currently unavailable'}
          </span>
        </div>
      </div>
      {/* מונע אינטראקציה עם התבנית */}
      <div className="pointer-events-none">
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
                <div className="flex items-center gap-1">
                  <span className="header-name-first">{firstName}</span>
                  {lastName && <span className="header-name-last">{lastName}</span>}
                  {isEditing && (
                    <EditButton
                      onClick={() => handleEdit('personalInfo', undefined, personalInfo)}
                      title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                      variant="light"
                    />
                  )}
                </div>
              </h1>
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
          {data.personalInfo.summary && (
            <section className="summary-section">
              <div className="summary-content">
                {data.personalInfo.summary}
              </div>
            </section>
          )}

          {/* ניסיון תעסוקתי */}
          {experience && experience.length > 0 && (
            <section className="experience-section">
              <h2 className="section-title relative flex items-center gap-4">
                {t.workExperience}
                {isEditing && (
                  <span className="text-base font-normal flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleAdd('experience')}>
                    הוסף ניסיון תעסוקתי
                    <EditButton
                      onClick={() => handleAdd('experience')}
                      title={lang === 'he' ? 'הוסף ניסיון תעסוקתי' : 'Add Work Experience'}
                      variant="dark"
                    />
                  </span>
                )}
              </h2>
              <div className="experience-items">
                {experience.map((exp, index) => (
                  <div key={index} className="experience-item relative">
                    <div className="experience-header">
                      <div className="experience-title-wrapper">
                        <div className="flex items-center gap-1">
                          <span className="experience-title">{exp.position}</span>
                          {isEditing && (
                            <EditButton
                              onClick={() => onEdit('experience', index)}
                              title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                              variant="dark"
                            />
                          )}
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
              <h2 className="section-title relative flex items-center gap-4">
                {t.education}
                {isEditing && (
                  <span className="text-base font-normal flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleAdd('education')}>
                    הוסף השכלה
                    <EditButton
                      onClick={() => handleAdd('education')}
                      title={lang === 'he' ? 'הוסף השכלה' : 'Add Education'}
                      variant="dark"
                    />
                  </span>
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
                          {isEditing && (
                            <EditButton
                              onClick={() => onEdit('education', index)}
                              title={lang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                              variant="dark"
                            />
                          )}
                        </div>
                        <span className="experience-separator">|</span>
                        <span className="education-institution">{degree.institution}</span>
                      </div>
                      <div className="education-date">{degree.years}</div>
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

          {/* כירות צבאי/לאומי */}
          {military && (
            <section className="military-section">
              <h2 className="section-title relative flex items-center gap-4">
                {military.role?.toLowerCase().includes('לאומי') ? t.nationalService : t.militaryService}
                {isEditing && (
                  <span className="text-base font-normal flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleEdit('military', undefined, military)}>
                    {military.role?.toLowerCase().includes('לאומי') ? 'ערוך שירות לאומי' : 'ערוך שירות צבאי'}
                    <EditButton
                      onClick={() => handleEdit('military', undefined, military)}
                      title={lang === 'he' ? (military.role?.toLowerCase().includes('לאומי') ? 'ערוך שירות לאומי' : 'ערוך שירות צבאי') : 'Edit Service'}
                      variant="dark"
                    />
                  </span>
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
              <h2 className="section-title relative flex items-center gap-4">
                {t.skills}
                {isEditing && (
                  <div className="flex gap-4 text-base font-normal">
                    <span className="flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleAdd('technicalSkill')}>
                      הוסף כישור טכני
                      <EditButton
                        onClick={() => handleAdd('technicalSkill')}
                        title={lang === 'he' ? 'הוסף כישור טכני' : 'Add Technical Skill'}
                        variant="dark"
                      />
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleAdd('softSkill')}>
                      הוסף כישור רך
                      <EditButton
                        onClick={() => handleAdd('softSkill')}
                        title={lang === 'he' ? 'הוסף כישור רך' : 'Add Soft Skill'}
                        variant="dark"
                      />
                    </span>
                  </div>
                )}
              </h2>
              <div className="skills-items">
                {skills.technical?.map((skill, index) => (
                  <span key={`tech-${index}`} className="skill-item">
                    <span className="skill-name">{skill.name}</span>
                    {" - "}
                    <span className="skill-level">{getSkillLevel(skill.level, cvLang)}</span>
                    {index < skills.technical.length - 1 && <span className="skill-separator"> | </span>}
                    {isEditing && (
                      <EditButton
                        onClick={() => onEdit('technicalSkill', index)}
                        title={lang === 'he' ? 'ערוך כישור טכני' : 'Edit Technical Skill'}
                        variant="dark"
                      />
                    )}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* שפות */}
          {data.skills?.languages && data.skills.languages.length > 0 && (
            <section className="languages-section">
              <h2 className="section-title">
                {t.languages}
                {isEditing && (
                  <span className="text-base font-normal flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleAddLanguage()}>
                    הוסף שפה
                    <EditButton
                      onClick={() => handleAddLanguage()}
                      title={lang === 'he' ? 'הוסף שפה' : 'Add Language'}
                      variant="dark"
                    />
                  </span>
                )}
              </h2>
              <div className="languages-items">
                {data.skills.languages.map((langSkill, index) => (
                  <div key={index} className="language-item">
                    <span className="language-tag">
                      {langSkill.language} - {langSkill.level}
                    </span>
                    {isEditing && (
                      <EditButton
                        onClick={() => onEdit('language', index)}
                        title={cvLang === 'he' ? 'ערוך שפה' : 'Edit Language'}
                        variant="dark"
                      />
                    )}
                  </div>
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
      </div>
    </div>
  );
};

export default ClassicTemplate;