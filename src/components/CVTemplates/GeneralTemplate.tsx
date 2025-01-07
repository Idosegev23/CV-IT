'use client';
import React, { useState } from 'react';
import { ResumeData } from '../../types/resume';
import MailIcon from '../../../public/design/general/MailIcon.svg';
import PhoneIcon from '../../../public/design/general/PhoneIcon.svg';
import LocIcon from '../../../public/design/general/LocIcon.svg';
import BusiIcon from '../../../public/design/general/busiIcon.svg';
import SchoolIcon from '../../../public/design/general/SchoolIcon.svg';
import MilIcon from '../../../public/design/general/MilIcon.svg';
import SkillIcon from '../../../public/design/general/SkillIcon.svg';
import LangIcon from '../../../public/design/general/langIcon.svg';
import DecUpLeft from '../../../public/design/general/decUpLeft.svg';
import Building from '../../../public/design/general/buiding.svg';
import IconDec from '../../../public/design/general/Icon.svg';
import Cloud from '../../../public/design/general/cloud.svg';
import Image from 'next/image';
import '../../styles/templates/general.css';
import { Assistant } from 'next/font/google';
import { formatDescription } from './utils';
import { EditButton } from '../EditableFields/EditButton';
import { EditPopup } from '../EditableFields/EditPopup';
import { AddItemPopup } from '../EditableFields/AddItemPopup';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'date';
  value?: any;
  placeholder?: string;
}

interface GeneralTemplateProps {
  data: ResumeData;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
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
    professionalSummary: 'תקציר מקצועי',
    email: 'דוא"ל',
    phone: 'טלפון',
    address: 'כתובת',
    specialization: 'התמחות',
    to: 'עד',
    present: 'היום',
    technicalSkills: 'כישורים טכניים',
    softSkills: 'כישורים רכים',
    skillLevel: 'רמת מיומנות'
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
    skillLevel: 'Skill Level'
  }
};

const GeneralTemplate: React.FC<GeneralTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {}
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

  const cvLang = data.lang;
  const t = translations[cvLang as keyof typeof translations];
  const isRTL = cvLang === 'he';

  const { personalInfo, experience, education, skills, military } = data;

  // Split name into first and last name
  const fullName = personalInfo.name || '';
  const [firstName, ...lastNameArr] = fullName.split(' ');
  const lastName = lastNameArr.join(' ');

  const getSkillLevel = (level: number) => {
    if (typeof level !== 'number') return isRTL ? 'רמה טובה' : 'Good';

    const levels: { [key: number]: string } = isRTL ? {
      5: 'רמה גבוהה מאוד',
      4: 'רמה גבוהה',
      3: 'רמה טובה',
      2: 'רמה בינונית',
      1: 'רמה בסיסית'
    } : {
      5: 'Expert',
      4: 'Advanced',
      3: 'Good',
      2: 'Intermediate',
      1: 'Basic'
    };

    return levels[level] || (isRTL ? 'רמה טובה' : 'Good');
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
          { name: 'name', label: isRTL ? 'שם הכישור' : 'Skill Name', type: 'text', value: softSkill.name }
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
      className={`${assistant.className} general-template`}
      data-cv-lang={cvLang}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="general-header">
        <div className="general-header-content">
          <div className="general-header-name">
            <h1>
              <span className="firstname">{firstName}</span>
              <span className="lastname">{lastName}</span>
              {isEditing && (
                <EditButton
                  onClick={() => handleEdit('personalInfo', undefined, personalInfo)}
                  title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
                  variant="dark"
                />
              )}
            </h1>
          </div>

          <div className="contact-info" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            {data.personalInfo.email && (
              <div className="contact-item">
                <div className="contact-item-icon">
                  <Image src={MailIcon} alt="email" width={16} height={16} />
                </div>
                <span>{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="contact-item">
                <div className="contact-item-icon">
                  <Image src={PhoneIcon} alt="phone" width={16} height={16} />
                </div>
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {data.personalInfo.address && (
              <div className="contact-item">
                <div className="contact-item-icon">
                  <Image src={LocIcon} alt="location" width={16} height={16} />
                </div>
                <span>{data.personalInfo.address}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="header-decoration right-decoration">
        <Image src={DecUpLeft} alt="" width={150} height={150} priority />
      </div>
      <div className="header-decoration left-decoration">
        <Image src={DecUpLeft} alt="" width={150} height={150} priority />
      </div>
      <div className="content">

      {/* Summary Section */}
      {data.personalInfo.summary && (
        <section className="summary-section">
          <h3 className="summary-title">
            {t.professionalSummary}
          </h3>
          <div className="summary-content">
            <p>{data.personalInfo.summary}</p>
          </div>
        </section>
      )}

      {/* Work Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="section">
          <h3 className="section-title">
            <div className="section-icon">
              <Image src={BusiIcon} alt="work" width={48} height={48} />
            </div>
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
          </h3>
          <div className="timeline-container">
            {data.experience.map((exp, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title-wrapper">
                    <h4>
                      <span className="timeline-position">{exp.position}</span>
                      {isEditing && (
                        <EditButton
                          onClick={() => handleEdit('experience', index, experience[index])}
                          title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                          variant="dark"
                        />
                      )}
                      {exp.company && (
                        <>
                          <span className="timeline-separator">|</span>
                          <span className="timeline-company">{exp.company}</span>
                        </>
                      )}
                      <span className="timeline-separator">|</span>
                      <span className="timeline-date">
                        {`${exp.startDate} - ${exp.endDate}`}
                      </span>
                    </h4>
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="timeline-description">
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
        <section className="section">
          <h3 className="section-title">
            <div className="section-icon">
              <Image src={SchoolIcon} alt="education" width={48} height={48} />
            </div>
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
          </h3>
          <div className="timeline-container">
            {data.education.degrees.map((degree, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-header">
                  <h4>
                    <span className="timeline-position">{degree.type} {degree.field}</span>
                    {isEditing && (
                      <EditButton
                        onClick={() => handleEdit('education', index, education.degrees[index])}
                        title={lang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                        variant="dark"
                      />
                    )}
                    {degree.institution && (
                      <>
                        <span className="timeline-separator">|</span>
                        <span className="timeline-company">{degree.institution}</span>
                      </>
                    )}
                    <span className="timeline-date">{degree.years}</span>
                  </h4>
                </div>
                {degree.specialization && (
                  <div className="timeline-description">
                    <li>{`${t.specialization}: ${degree.specialization}`}</li>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Military Service */}
      {data.military && (
        <section className="section">
          <h3 className="section-title">
            <div className="section-icon">
              <Image src={MilIcon} alt="military" width={48} height={48} />
            </div>
            {t.militaryService}
          </h3>
          <div className="timeline-container">
            <div className="timeline-item">
              <div className="timeline-header">
                <h4>
                  <span className="timeline-position">{data.military.role}</span>
                  {isEditing && (
                    <EditButton
                      onClick={() => handleEdit('military', undefined, military)}
                      title={lang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                      variant="dark"
                    />
                  )}
                  {data.military.unit && (
                    <>
                      <span className="timeline-separator">|</span>
                      <span className="timeline-company">{data.military.unit}</span>
                    </>
                  )}
                  <span className="timeline-date">
                    {`${data.military.startDate} - ${data.military.endDate}`}
                  </span>
                </h4>
              </div>
              {data.military.description && data.military.description.length > 0 && (
                <ul className="timeline-description">
                  {formatDescription(data.military.description, 3).map((desc, i) => (
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
        (Array.isArray(data.skills.technical) && data.skills.technical.length > 0) || 
        (Array.isArray(data.skills.soft) && data.skills.soft.length > 0)
      ) && (
        <section className="section">
          <h3 className="section-title">
            <div className="section-icon">
              <Image src={SkillIcon} alt="skills" width={48} height={48} />
            </div>
            {t.skills}
            {isEditing && (
              <div className="flex flex-col gap-2">
                <span className="text-base font-normal flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleAdd('technicalSkill')}>
                  הוסף כישור טכני
                  <EditButton
                    onClick={() => handleAdd('technicalSkill')}
                    title={lang === 'he' ? 'הוסף כישור טכני' : 'Add Technical Skill'}
                    variant="dark"
                  />
                </span>
                <span className="text-base font-normal flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleAdd('softSkill')}>
                  הוסף כישור רך
                  <EditButton
                    onClick={() => handleAdd('softSkill')}
                    title={lang === 'he' ? 'הוסף כישור רך' : 'Add Soft Skill'}
                    variant="dark"
                  />
                </span>
              </div>
            )}
          </h3>
          <div className="skills-grid">
            {/* Technical Skills */}
            {Array.isArray(data.skills.technical) && data.skills.technical.map((skill, index) => (
              <div key={`tech-${index}`} className="skill-item">
                <span>{skill.name && `${skill.name}${skill.level ? ` - ${getSkillLevel(skill.level)}` : ''}`}</span>
                {isEditing && (
                  <EditButton
                    onClick={() => handleEdit('technicalSkill', index)}
                    title={lang === 'he' ? 'ערוך כישור טכני' : 'Edit Technical Skill'}
                    variant="dark"
                  />
                )}
              </div>
            ))}
            
            {/* Soft Skills */}
            {Array.isArray(data.skills.soft) && data.skills.soft.map((skill, index) => (
              <div key={`soft-${index}`} className="skill-item">
                <span>{skill.name}</span>
                {isEditing && (
                  <EditButton
                    onClick={() => handleEdit('softSkill', index)}
                    title={lang === 'he' ? 'ערוך כישור רך' : 'Edit Soft Skill'}
                    variant="dark"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {data.skills?.languages && data.skills.languages.length > 0 && (
        <section className="section">
          <h3 className="section-title">
            <div className="section-icon">
              <Image src={LangIcon} alt="languages" width={48} height={48} />
            </div>
            {t.languages}
            {isEditing && (
              <span className="text-base font-normal flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer" onClick={() => handleAdd('language')}>
                הוסף שפה
                <EditButton
                  onClick={() => handleAdd('language')}
                  title={lang === 'he' ? 'הוסף שפה' : 'Add Language'}
                  variant="dark"
                />
              </span>
            )}
          </h3>
          <div className="languages-grid">
            {data.skills.languages.map((lang, index) => (
              <div key={index} className="language-item">
                <span className="language-name">{lang.language}</span>
                {isEditing && (
                  <EditButton
                    onClick={() => handleEdit('language', index, skills.languages[index])}
                    title={cvLang === 'he' ? 'ערוך שפה' : 'Edit Language'}
                    variant="dark"
                  />
                )}
                <span className="language-level">{lang.level}</span>
              </div>
            ))}
          </div>
        </section>
      )}

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
      <div className="footer-decorations">
        <div className="cloud-decoration">
          <Image 
            src={Cloud} 
            alt="" 
            width={100} 
            height={100}
            style={{ opacity: 0.8 }}
          />
        </div>
        <div className="building-decoration">
          <Image 
            src={Building} 
            alt="" 
            width={200} 
            height={200}
            style={{ opacity: 1 }}
            priority
          />
        </div>
        <div className="icon-decoration">
          <Image 
            src={IconDec} 
            alt="" 
            width={50} 
            height={50}
            style={{ opacity: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralTemplate; 