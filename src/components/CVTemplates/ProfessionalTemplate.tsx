'use client';
import React, { useEffect, useState } from 'react';
import { ResumeData, Language, Degree, MilitaryService } from '../../types/resume';
import '../../styles/templates/professional.css';
import { Assistant } from 'next/font/google';
import { EditableText } from '../EditableFields/EditableText';
import { EditableList } from '../EditableFields/EditableList';
import { EditButton } from '../EditableFields/EditButton';
import { EditPopup } from '../EditableFields/EditPopup';
import { AddItemPopup } from '../EditableFields/AddItemPopup';
import { formatDescription, formatDate } from './utils';
import { Edit2, Plus } from 'lucide-react';
import { PersonalInfoEdit } from '../EditableFields/PersonalInfoEdit';
import { cn } from '../../lib/utils';
import { SkillsEdit } from '../EditableFields/SkillsEdit';
import { EducationEdit } from '../EditableFields/EducationEdit';
import { MilitaryEdit } from '../EditableFields/MilitaryEdit';

interface ProfessionalTemplateProps {
  data: ResumeData;
  lang?: string;
  isEditing?: boolean;
  onUpdate?: (field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;
  onEdit?: (type: string, index: number) => void;
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'date';
  value?: any;
  placeholder?: string;
}

interface OldDegree {
  type: string;
  field: string;
  institution: string;
  years?: string;
  specialization?: string;
}

const assistant = Assistant({ 
  subsets: ['hebrew', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-assistant',
  preload: true,
  display: 'swap',
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

const ProfessionalTemplate: React.FC<ProfessionalTemplateProps> = ({ 
  data, 
  lang = 'he',
  isEditing = false,
  onUpdate = () => {},
  onDelete = () => {},
  onEdit = () => {}
}) => {
  const cvLang = data.lang;
  const t = translations[cvLang as keyof typeof translations];
  const { personalInfo, experience, education, skills } = data;
  const military = data.military as MilitaryService | undefined;
  const isRTL = cvLang === 'he';

  const [editingSection, setEditingSection] = useState<{
    type: string;
    index?: number;
    data: any;
  } | null>(null);

  const [isAddingItem, setIsAddingItem] = useState<{
    type: string;
    fields: any[];
  } | null>(null);

  const [isEducationEditOpen, setIsEducationEditOpen] = useState(false);
  const [isMilitaryEditOpen, setIsMilitaryEditOpen] = useState(false);

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
    if (typeof level !== 'number') return 'רמה טובה';

    const levels: { [key: number]: string } = {
      5: 'רמה גבוהה מאוד',
      4: 'רמה גבוהה',
      3: 'רמה טובה',
      2: 'רמה מינונית',
      1: 'רמה בסיסית'
    };

    return levels[level] || 'רמה טובה';
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
          { name: 'name', label: isRTL ? 'שם מלא' : 'Full Name', type: 'text', value: data.name },
          { name: 'email', label: isRTL ? 'דוא"ל' : 'Email', type: 'text', value: data.email },
          { name: 'phone', label: isRTL ? 'טלפון' : 'Phone', type: 'text', value: data.phone },
          { name: 'address', label: isRTL ? 'כתובת' : 'Address', type: 'text', value: data.address },
          { name: 'summary', label: isRTL ? 'תקציר מקצועי' : 'Professional Summary', type: 'textarea', value: data.summary }
        ];
        break;
      case 'military':
        fields = [
          { name: 'role', label: isRTL ? 'תפקיד' : 'Role', type: 'text', value: data.role },
          { name: 'unit', label: isRTL ? 'יחידה' : 'Unit', type: 'text', value: data.unit },
          { name: 'startDate', label: isRTL ? 'תאריך התחלה' : 'Start Date', type: 'text', value: data.startDate },
          { name: 'endDate', label: isRTL ? 'תאריך סיום' : 'End Date', type: 'text', value: data.endDate },
          { name: 'description', label: isRTL ? 'תיאור השירות' : 'Service Description', type: 'list', value: data.description }
        ];
        break;
      case 'experience':
        fields = [
          { name: 'position', label: isRTL ? 'תפקיד' : 'Position', type: 'text', value: data.position },
          { name: 'company', label: isRTL ? 'חברה' : 'Company', type: 'text', value: data.company },
          { name: 'startDate', label: isRTL ? 'תאריך התחלה' : 'Start Date', type: 'text', value: data.startDate },
          { name: 'endDate', label: isRTL ? 'תאריך סיום' : 'End Date', type: 'text', value: data.endDate },
          { name: 'description', label: isRTL ? 'תיאור התפקיד' : 'Job Description', type: 'list', value: data.description }
        ];
        break;
      case 'education':
        fields = [
          { name: 'type', label: isRTL ? 'סוג תואר' : 'Degree Type', type: 'text', value: data.type },
          { name: 'field', label: isRTL ? 'תחום' : 'Field', type: 'text', value: data.field },
          { name: 'institution', label: isRTL ? 'מוסד' : 'Institution', type: 'text', value: data.institution },
          { name: 'years', label: isRTL ? 'שנים' : 'Years', type: 'text', value: data.years },
          { name: 'specialization', label: isRTL ? 'התמחות' : 'Specialization', type: 'text', value: data.specialization }
        ];
        break;
      case 'technicalSkill':
        fields = [
          { name: 'name', label: isRTL ? 'שם הכישור' : 'Skill Name', type: 'text', value: data.name },
          { name: 'level', label: isRTL ? 'רמת מיומנות' : 'Skill Level', type: 'text', value: data.level }
        ];
        break;
      case 'softSkill':
        fields = [
          { name: 'name', label: isRTL ? 'שם הכישור' : 'Skill Name', type: 'text', value: data.name },
          { name: 'level', label: isRTL ? 'רמת מיומנות' : 'Skill Level', type: 'text', value: data.level }
        ];
        break;
      case 'language':
        fields = [
          { name: 'language', label: isRTL ? 'שפה' : 'Language', type: 'text', value: data.language },
          { name: 'level', label: isRTL ? 'רמת שליטה' : 'Proficiency Level', type: 'text', value: data.level }
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
    }
    setIsAddingItem(null);
  };

  const handlePersonalInfoSave = (newData: any) => {
    onUpdate('personalInfo', {
      ...personalInfo,
      ...newData
    });
  };

  // Convert old education format to new format
  const convertEducationData = (degrees: any[]): Degree[] => {
    return degrees.map(degree => ({
      type: degree.type || '',
      field: degree.field || '',
      institution: degree.institution || '',
      startDate: degree.startDate || (degree.years ? degree.years.split('-')[0].trim() : ''),
      endDate: degree.endDate || (degree.years ? degree.years.split('-')[1].trim() : ''),
      specialization: degree.specialization
    }));
  };

  const handleEducationSave = (newDegrees: Degree[]) => {
    onUpdate('education', { ...education, degrees: newDegrees });
  };

  const handleMilitaryServiceSave = (newData: MilitaryService) => {
    onUpdate('military', newData);
  };

  return (
    <div className={cn(
      "professional-template",
      assistant.className
    )}>
      <div className="professional-right-column">
        <div className="professional-header">
          {/* Personal Info Section */}
          <div className="professional-name relative">
            <div className="professional-name-first">{splitName(personalInfo.name).firstName}</div>
            <div className="professional-name-last">{splitName(personalInfo.name).lastName}</div>
            {isEditing && (
              <button
                onClick={() => onEdit('personalInfo', 0)}
                className="edit-button"
                title={lang === 'he' ? 'ערוך פרטים אישיים' : 'Edit Personal Info'}
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>

          <div className="professional-separator" />

          <div className="professional-contact">
            {personalInfo.phone && (
              <div className="professional-contact-item">
                {t.phone}: {personalInfo.phone}
              </div>
            )}
            {personalInfo.email && (
              <div className="professional-contact-item">
                {t.email}: {personalInfo.email}
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="professional-contact-item">
                LinkedIn: {personalInfo.linkedin}
              </div>
            )}
          </div>
        </div>

        {/* כישורים */}
        {((skills.technical && skills.technical.length > 0) || 
          (skills.soft && skills.soft.length > 0) ||
          (skills.languages && skills.languages.length > 0)) && (
          <section className="relative">
            <h2 className="professional-section-title">
              {t.skills}
              {isEditing && (
                <button 
                  onClick={() => onEdit('skills', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך כישורים' : 'Edit Skills'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            <div className="professional-separator" />
            <div className="professional-skills">
              {skills.technical.map((skill, index) => (
                <div key={`tech-${index}`} className="professional-skill-item">
                  <div className="professional-skill-content">
                    <span className="professional-skill-name">{skill.name}</span>
                    <span className="professional-skill-separator">|</span>
                    <span className="professional-skill-level">{getSkillLevel(skill.level)}</span>
                  </div>
                </div>
              ))}
              
              {skills.soft.map((skill, index) => (
                <div key={`soft-${index}`} className="professional-skill-item">
                  <div className="professional-skill-content">
                    <span className="professional-skill-name">{skill.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* שפות */}
        {skills.languages && skills.languages.length > 0 && (
          <section className="relative" style={{ marginTop: '2rem' }}>
            <h2 className="professional-section-title">
              {t.languages}
              {isEditing && (
                <button 
                  onClick={() => onEdit('languages', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך שפות' : 'Edit Languages'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            <div className="professional-separator" />
            <div className="professional-skills">
              {skills.languages.map((langItem: Language, index) => (
                <div key={`lang-${index}`} className="professional-skill-item">
                  <div className="professional-skill-content">
                    <span className="professional-skill-name">{langItem.language}</span>
                    <span className="professional-skill-separator">|</span>
                    <span className="professional-skill-level">{langItem.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* לוגו */}
        <div className="professional-logo">
          <img src="/design/piont.svg" alt="logo" />
        </div>
      </div>

      {/* עמודה שמאלית */}
      <div className="professional-left-column">
        {/* תקציר מקצועי */}
        <section className="professional-summary relative">
          {isEditing && (
            <button 
              onClick={() => onEdit('summary', 0)}
              className="edit-button"
              title={lang === 'he' ? 'ערוך תקציר מקצועי' : 'Edit Professional Summary'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <h2 className="professional-section-title">{t.professionalSummary}</h2>
          <p className="professional-summary-text">
            {personalInfo.summary || (isEditing ? (lang === 'he' ? 'לחץ על העיפרון כדי להוסיף תקציר מקצועי' : 'Click the pencil to add a professional summary') : '')}
          </p>
        </section>

        {/* ניסיון תעסוקתי */}
        {experience && experience.length > 0 && (
          <section className="professional-experience">
            <h2 className="professional-section-title">
              {t.workExperience}
              {isEditing && (
                <button 
                  onClick={() => onEdit('experience', 0)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך ניסיון תעסוקתי' : 'Edit Work Experience'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            {[...experience]
              .sort((a, b) => {
                const yearA = parseInt(a.startDate) || 0;
                const yearB = parseInt(b.startDate) || 0;
                return yearB - yearA; // החדש ביותר למעלה
              })
              .map((exp, index) => (
              <div key={index} className="professional-experience-item relative">
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
                    {formatDate(exp.startDate, exp.endDate, lang)}
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

        {/* השכלה */}
        {education?.degrees && education.degrees.length > 0 && (
          <section className="professional-education">
            <h2 className="professional-section-title">
              {t.education}
              {isEditing && (
                <button 
                  onClick={() => setIsEducationEditOpen(true)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך השכלה' : 'Edit Education'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            {education.degrees.map((degree: any, index) => (
              <div key={index} className="professional-education-item relative">
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
                  <span className="professional-education-date">
                    {formatDate(degree.startDate || degree.years?.split('-')[0] || '', 
                               degree.endDate || degree.years?.split('-')[1] || '', 
                               lang)}
                  </span>
                </div>
                {degree.specialization && (
                  <div className="professional-education-specialization">
                    התמחות: {degree.specialization}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* שירות צבאי */}
        {(military || isEditing) && (
          <section className="professional-military-section">
            <h2 className="professional-section-title">
              {t.militaryService}
              {isEditing && (
                <button 
                  onClick={() => setIsMilitaryEditOpen(true)}
                  className="edit-button"
                  title={lang === 'he' ? 'ערוך שירות צבאי' : 'Edit Military Service'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h2>
            {military && (
              <div className="professional-military-item relative">
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
                    {formatDate(military.startDate, military.endDate, lang)}
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
            )}
          </section>
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

      {isEducationEditOpen && (
        <EducationEdit
          isOpen={isEducationEditOpen}
          onClose={() => setIsEducationEditOpen(false)}
          data={convertEducationData(education?.degrees || [])}
          onSave={handleEducationSave}
          isRTL={isRTL}
          template={data.template}
        />
      )}

      {isMilitaryEditOpen && (
        <MilitaryEdit
          isOpen={isMilitaryEditOpen}
          onClose={() => setIsMilitaryEditOpen(false)}
          data={military || null}
          onSave={handleMilitaryServiceSave}
          isRTL={isRTL}
          template={data.template}
        />
      )}
    </div>
  );
};

export default ProfessionalTemplate; 