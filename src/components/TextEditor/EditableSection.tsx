'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dictionary } from '@/dictionaries/dictionary';
import { ResumeData } from '@/types/resume';
import { EditableText } from '@/components/EditableFields/EditableText';

interface EditableSectionProps {
  section: keyof ResumeData;
  data: any;
  onChange: (section: keyof ResumeData, field: string, value: string) => void;
  isActive: boolean;
  setActiveSection: (section: keyof ResumeData | null) => void;
  dictionary: Dictionary;
  direction: 'rtl' | 'ltr';
}

interface SectionData {
  title?: string;
  name?: string;
  description?: string | string[];
  position?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

interface Skill {
  name: string;
}

interface Language {
  language: string;
  level: string;
}

interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string | string[];
}

interface Education {
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
}

const ensureString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      const firstValue = Object.values(value)[0];
      return firstValue?.toString() || '';
    }
  }
  return '';
};

const renderSectionContent = (
  section: keyof ResumeData,
  data: SectionData,
  dictionary: Dictionary
): React.ReactNode => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        {ensureString(data.title || '')}
      </h2>
      <div className="text-lg">
        {ensureString(data.name || '')}
      </div>
      <div className="text-sm">
        {ensureString(data.description || '')}
      </div>
    </div>
  );
};

export const EditableSection: React.FC<EditableSectionProps> = ({
  section,
  data,
  onChange,
  isActive,
  setActiveSection,
  dictionary,
  direction,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setActiveSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveSection]);

  const handleFocus = () => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (section) {
      case 'personalInfo':
        const title = ensureString(data.title);
        const name = ensureString(data.name);
        const description = ensureString(data.description);
        
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              <EditableText
                value={title}
                onChange={(value) => onChange(section, 'title', value)}
                isEditing={isActive}
                className="font-bold"
              />
            </h2>
            <div className="text-lg">
              <EditableText
                value={name}
                onChange={(value) => onChange(section, 'name', value)}
                isEditing={isActive}
              />
            </div>
            <div className="text-sm">
              <EditableText
                value={description}
                onChange={(value) => onChange(section, 'description', value)}
                isEditing={isActive}
              />
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{dictionary.sections.experience}</h2>
            {Array.isArray(data) && data.map((exp: Experience, index: number) => {
              const position = ensureString(exp.position);
              const company = ensureString(exp.company);
              const startDate = ensureString(exp.startDate);
              const endDate = ensureString(exp.endDate);
              const expDescription = Array.isArray(exp.description) 
                ? exp.description.join('\n') 
                : ensureString(exp.description);

              return (
                <div key={index} className="space-y-2">
                  <div className="font-bold">
                    <EditableText
                      value={position}
                      onChange={(value) => onChange(section, `${index}.position`, value)}
                      isEditing={isActive}
                      className="font-bold"
                    />
                  </div>
                  <div>
                    <EditableText
                      value={company}
                      onChange={(value) => onChange(section, `${index}.company`, value)}
                      isEditing={isActive}
                    />
                  </div>
                  <div className="flex gap-2 text-sm">
                    <EditableText
                      value={startDate}
                      onChange={(value) => onChange(section, `${index}.startDate`, value)}
                      isEditing={isActive}
                      className="text-sm"
                    />
                    -
                    <EditableText
                      value={endDate}
                      onChange={(value) => onChange(section, `${index}.endDate`, value)}
                      isEditing={isActive}
                      className="text-sm"
                    />
                  </div>
                  <div className="text-sm">
                    <EditableText
                      value={expDescription}
                      onChange={(value) => onChange(section, `${index}.description`, value)}
                      isEditing={isActive}
                      className="text-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{dictionary.sections.education}</h2>
            {Array.isArray(data) && data.map((edu: Education, index: number) => {
              const degree = ensureString(edu.degree);
              const institution = ensureString(edu.institution);
              const startYear = ensureString(edu.startYear);
              const endYear = ensureString(edu.endYear);

              return (
                <div key={index} className="space-y-2">
                  <div className="font-bold">
                    <EditableText
                      value={degree}
                      onChange={(value) => onChange(section, `${index}.degree`, value)}
                      isEditing={isActive}
                      className="font-bold"
                    />
                  </div>
                  <div>
                    <EditableText
                      value={institution}
                      onChange={(value) => onChange(section, `${index}.institution`, value)}
                      isEditing={isActive}
                    />
                  </div>
                  <div className="flex gap-2 text-sm">
                    <EditableText
                      value={startYear}
                      onChange={(value) => onChange(section, `${index}.startYear`, value)}
                      isEditing={isActive}
                      className="text-sm"
                    />
                    -
                    <EditableText
                      value={endYear}
                      onChange={(value) => onChange(section, `${index}.endYear`, value)}
                      isEditing={isActive}
                      className="text-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'skills':
        const technicalSkills = Array.isArray(data.technical) 
          ? data.technical.map((skill: unknown) => ensureString(skill))
          : [];
        
        const softSkills = Array.isArray(data.soft)
          ? data.soft.map((skill: unknown) => ensureString(skill))
          : [];
        
        const languages = Array.isArray(data.languages)
          ? data.languages.map((lang: any) => ({
              language: ensureString(lang.language),
              level: ensureString(lang.level)
            }))
          : [];

        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{dictionary.sections.skills}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">{String(dictionary.sections.technicalSkills)}</h3>
                {technicalSkills.map((skill: string, index: number) => (
                  <div key={index} className="mb-1">
                    <EditableText
                      value={skill}
                      onChange={(value) => {
                        const newSkills = [...technicalSkills];
                        newSkills[index] = value;
                        onChange(section, 'technical', newSkills.join('\n'));
                      }}
                      isEditing={isActive}
                    />
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-bold mb-2">{String(dictionary.sections.softSkills)}</h3>
                {softSkills.map((skill: string, index: number) => (
                  <div key={index} className="mb-1">
                    <EditableText
                      value={skill}
                      onChange={(value) => {
                        const newSkills = [...softSkills];
                        newSkills[index] = value;
                        onChange(section, 'soft', newSkills.join('\n'));
                      }}
                      isEditing={isActive}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">{String(dictionary.sections.languages)}</h3>
              {languages.map((lang: Language, index: number) => (
                <div key={index} className="flex gap-2 items-center">
                  <EditableText
                    value={lang.language}
                    onChange={(value) => {
                      const newLangs = [...languages];
                      newLangs[index] = { ...lang, language: value };
                      onChange(section, 'languages', JSON.stringify(newLangs));
                    }}
                    isEditing={isActive}
                  />
                  :
                  <EditableText
                    value={lang.level}
                    onChange={(value) => {
                      const newLangs = [...languages];
                      newLangs[index] = { ...lang, level: value };
                      onChange(section, 'languages', JSON.stringify(newLangs));
                    }}
                    isEditing={isActive}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={sectionRef}
      className={cn(
        "section-wrapper mb-8",
        isActive && "ring-2 ring-primary ring-offset-2",
        "hover:bg-gray-50/5 transition-colors duration-200"
      )}
      onFocus={handleFocus}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {renderContent()}
    </motion.div>
  );
};