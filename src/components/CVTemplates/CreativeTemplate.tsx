'use client';
import React, { useEffect, useState } from 'react';
import { ResumeData } from '../../types/resume';
import '../../styles/templates/creative.css';
import Image from 'next/image';
import { Assistant } from 'next/font/google';
import { formatDescription, formatDate } from './utils';
import { EditableText } from '../EditableFields/EditableText';
import { EditableList } from '../EditableFields/EditableList';
import { EditButton } from '../EditableFields/EditButton';
import { EditPopup } from '../EditableFields/EditPopup';
import { AddItemPopup } from '../EditableFields/AddItemPopup';

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

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'date';
  value?: any;
  placeholder?: string;
}

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
  const [editingSection, setEditingSection] = useState<{
    type: string;
    index?: number;
    data: Field[];
  } | null>(null);

  const [isAddingItem, setIsAddingItem] = useState<{
    type: string;
    fields: Field[];
  } | null>(null);

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

  // פונקציה לפורמוט תאריכים
  const formatDate = (startDate: string, endDate: string) => {
    const formattedEnd = endDate === 'כיום' || endDate === 'היום' ? 
      t.present : 
      endDate;
    
    return isRTL ? 
      `${startDate} - ${formattedEnd}` : 
      `${startDate} ${t.to} ${formattedEnd}`;
  };

  // Add handleUpdate functions
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

  const handleEdit = (type: string, index?: number, data?: any) => {
    let fields: Field[] = [];
    switch (type) {
      case 'personalInfo':
        fields = [
          { name: 'name', label: isRTL ? 'שם מלא' : 'Full Name', type: 'text', value: personalInfo.name },
          { name: 'email', label: isRTL ? 'דוא"ל' : 'Email', type: 'text', value: personalInfo.email },
          { name: 'phone', label: isRTL ? 'טלפון' : 'Phone', type: 'text', value: personalInfo.phone },
          { name: 'address', label: isRTL ? 'כתובת' : 'Address', type: 'text', value: personalInfo.address },
          { name: 'summary', label: isRTL ? 'תקציר מקצועי' : 'Professional Summary', type: 'textarea', value: personalInfo.summary }
        ];
        break;
      case 'military':
        if (military) {
          fields = [
            { name: 'role', label: isRTL ? 'תפקיד' : 'Role', type: 'text', value: military.role },
            { name: 'unit', label: isRTL ? 'יחידה' : 'Unit', type: 'text', value: military.unit },
            { name: 'startDate', label: isRTL ? 'תאריך התחלה' : 'Start Date', type: 'text', value: military.startDate },
            { name: 'endDate', label: isRTL ? 'תאריך סיום' : 'End Date', type: 'text', value: military.endDate },
            { name: 'description', label: isRTL ? 'תיאור השירות' : 'Service Description', type: 'list', value: military.description }
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
      case 'technicalSkill':
        const techSkill = skills.technical[index || 0];
        fields = [
          { name: 'name', label: isRTL ? 'שם הכישור' : 'Skill Name', type: 'text', value: techSkill.name },
          { name: 'level', label: isRTL ? 'רמת מיומנות' : 'Skill Level', type: 'text', value: techSkill.level }
        ];
        break;
      case 'softSkill':
        const softSkill = skills.soft[index || 0];
        fields = [
          { name: 'name', label: isRTL ? 'שם הכישור' : 'Skill Name', type: 'text', value: softSkill.name },
          { name: 'level', label: isRTL ? 'רמת מיומנות' : 'Skill Level', type: 'text', value: softSkill.level }
        ];
        break;
      case 'language':
        const langSkill = skills.languages[index || 0];
        fields = [
          { name: 'language', label: isRTL ? 'שפה' : 'Language', type: 'text', value: langSkill.language },
          { name: 'level', label: isRTL ? 'רמת שליטה' : 'Proficiency Level', type: 'text', value: langSkill.level }
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
      case 'language':
        fields = [
          { name: 'language', label: isRTL ? 'שפה' : 'Language', type: 'text' },
          { name: 'level', label: isRTL ? 'רמת שליטה' : 'Proficiency Level', type: 'text' }
        ];
        break;
      case 'technicalSkill':
        fields = [
          { name: 'name', label: isRTL ? 'שם הכישור' : 'Skill Name', type: 'text' },
          { name: 'level', label: isRTL ? 'רמת מיומנות' : 'Skill Level', type: 'text' }
        ];
        break;
      case 'softSkill':
        fields = [
          { name: 'name', label: isRTL ? 'שם הכישור' : 'Skill Name', type: 'text' }
        ];
        break;
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
      case 'military':
        if (military) {
          onUpdate('military', { ...military, ...values });
        }
        break;
      case 'technicalSkill':
        if (typeof editingSection.index === 'number') {
          const newSkills = { ...skills };
          newSkills.technical[editingSection.index] = { ...newSkills.technical[editingSection.index], ...values };
          onUpdate('skills', newSkills);
        }
        break;
      case 'softSkill':
        if (typeof editingSection.index === 'number') {
          const newSkills = { ...skills };
          newSkills.soft[editingSection.index] = { ...newSkills.soft[editingSection.index], ...values };
          onUpdate('skills', newSkills);
        }
        break;
      case 'language':
        if (typeof editingSection.index === 'number') {
          const newSkills = { ...skills };
          newSkills.languages[editingSection.index] = { ...newSkills.languages[editingSection.index], ...values };
          onUpdate('skills', newSkills);
        }
        break;
    }
    setEditingSection(null);
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
      case 'language':
        const newSkills = { ...skills };
        newSkills.languages = [...(newSkills.languages || []), values];
        onUpdate('skills', newSkills);
        break;
      case 'technicalSkill':
        const newTechSkills = { ...skills };
        newTechSkills.technical = [...(newTechSkills.technical || []), values];
        onUpdate('skills', newTechSkills);
        break;
      case 'softSkill':
        const newSoftSkills = { ...skills };
        newSoftSkills.soft = [...(newSoftSkills.soft || []), values];
        onUpdate('skills', newSoftSkills);
        break;
    }
    setIsAddingItem(null);
  };

  return (
    <div 
      className={`${assistant.className} creative-template`}
      data-cv-lang={cvLang}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
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
          <h1 className="creative-name">
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
              <EditButton
                onClick={() => handleEdit('personalInfo', undefined, personalInfo)}
                title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                variant="light"
              />
            )}
          </h1>
          <div className="creative-separator" />
          <div className="creative-contact-info">
            <div>{data.personalInfo.email && `${t.email}: ${data.personalInfo.email}`}</div>
            <div>{data.personalInfo.phone && `${t.phone}: ${data.personalInfo.phone}`}</div>
            <div>{data.personalInfo.address && `${t.address}: ${data.personalInfo.address}`}</div>
          </div>
        </div>

        {/* שפות */}
        {data.skills.languages && data.skills.languages.length > 0 && (
          <div className="creative-section">
            <h2 className="creative-section-title">
              {t.languages}
              {isEditing && (
                <span className="text-base font-normal flex items-center gap-1 text-white hover:text-gray-200 cursor-pointer" onClick={() => handleAdd('language')}>
                  הוסף שפה
                  <EditButton
                    onClick={() => handleAdd('language')}
                    title={lang === 'he' ? 'הוסף שפה' : 'Add Language'}
                    variant="light"
                  />
                </span>
              )}
            </h2>
            <div className="creative-separator" />
            <div className="creative-languages">
              {data.skills.languages.map((lang, index) => (
                <div key={index} className="creative-language-item">
                  <span className="creative-language">{lang.language}</span>
                  {isEditing && (
                    <EditButton
                      onClick={() => handleEdit('language', index, skills.languages[index])}
                      title={cvLang === 'he' ? 'ערוך שפה' : 'Edit Language'}
                      variant="light"
                    />
                  )}
                  <span className="creative-separator-vertical">|</span>
                  <span className="creative-level">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* כישורים */}
        {data.skills && (
          (Array.isArray(data.skills.technical) && data.skills.technical.length > 0) || 
          (Array.isArray(data.skills.soft) && data.skills.soft.length > 0)
        ) && (
          <div className="creative-section">
            <h2 className="creative-section-title">
              {t.skills}
              {isEditing && (
                <div className="flex flex-col gap-2">
                  <span className="text-base font-normal flex items-center gap-1 text-white hover:text-gray-200 cursor-pointer" onClick={() => handleAdd('technicalSkill')}>
                    הוסף כישור טכני
                    <EditButton
                      onClick={() => handleAdd('technicalSkill')}
                      title={lang === 'he' ? 'הוסף כישור טכני' : 'Add Technical Skill'}
                      variant="light"
                    />
                  </span>
                  <span className="text-base font-normal flex items-center gap-1 text-white hover:text-gray-200 cursor-pointer" onClick={() => handleAdd('softSkill')}>
                    הוסף כישור רך
                    <EditButton
                      onClick={() => handleAdd('softSkill')}
                      title={lang === 'he' ? 'הוסף כישור רך' : 'Add Soft Skill'}
                      variant="light"
                    />
                  </span>
                </div>
              )}
            </h2>
            <div className="creative-separator" />
            <div className="creative-skills">
              {/* כישורים טכניים עם נקודות */}
              {Array.isArray(data.skills.technical) && data.skills.technical.map((skill, index) => (
                <div key={`tech-${index}`} className="creative-skill-item">
                  <div className="creative-skill-content">
                    <span className={getSkillNameClass(skill.name)}>{skill.name}</span>
                    {isEditing && (
                      <EditButton
                        onClick={() => handleEdit('technicalSkill', index)}
                        title={lang === 'he' ? 'ערוך כישור טכני' : 'Edit Technical Skill'}
                        variant="light"
                      />
                    )}
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

        {/* נקציר מקצועי */}
        {data.personalInfo.summary && (
          <div className="creative-summary">
            <h2 className="creative-summary-title">
              {t.professionalSummary}
            </h2>
            <div className="creative-summary-content">
              <p>{data.personalInfo.summary}</p>
            </div>
          </div>
        )}

        {/* ניסיון תעסוקתי */}
        {data.experience && data.experience.length > 0 && (
          <div className="creative-experience">
            <h2 className="creative-section-title dark">
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
            <div className="creative-experience-items">
              {data.experience.map((exp, index) => (
                <div key={index} className="creative-experience-item">
                  <div className="creative-experience-header">
                    <h3 className="creative-experience-title">
                      {exp.position}
                      {isEditing && (
                        <EditButton
                          onClick={() => handleEdit('experience', index, experience[index])}
                          title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                          variant="dark"
                        />
                      )}
                      {exp.company && (
                        <span className="creative-experience-company">
                          {exp.company}
                        </span>
                      )}
                    </h3>
                    <span className="creative-experience-date">
                      {formatDate(exp.startDate, exp.endDate, lang)}
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
            <h2 className="creative-section-title dark">
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
            <div className="creative-experience-items">
              {data.education.degrees.map((degree, index) => (
                <div key={index} className="creative-experience-item">
                  <div className="creative-experience-header">
                    <div className="creative-experience-title-wrapper">
                      <h3 className="creative-experience-position">{`${degree.type} ${degree.field}`}</h3>
                      <span className="creative-experience-company">{degree.institution}</span>
                    </div>
                    <div className="creative-experience-date">{degree.years}</div>
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
            <h2 className="creative-section-title dark">
              {t.militaryService}
            </h2>
            <div className="creative-experience-items">
              <div className="creative-experience-item">
                <div className="creative-experience-header">
                  <div className="creative-experience-title-wrapper">
                    <h3 className="creative-experience-position">{military?.role}</h3>
                    <span className="creative-experience-company">{military?.unit}</span>
                    {isEditing && (
                      <EditButton
                        onClick={() => handleEdit('military', undefined, military)}
                        title={lang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                        variant="dark"
                      />
                    )}
                  </div>
                  <div className="creative-experience-date">
                    {formatDate(data.military.startDate, data.military.endDate, lang)}
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
  );
};

export default CreativeTemplate; 