import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/theme/ui/dialog';
import { Input } from '@/components/theme/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skills, Skill } from '@/types/resume';
import { Wrench, Brain, Languages, Trash2, Plus } from 'lucide-react';

interface SkillsEditProps {
  isOpen: boolean;
  onClose: () => void;
  data: Partial<Skills>;
  onSave: (newData: Skills) => void;
  isRTL?: boolean;
  template?: string;
}

export const SkillsEdit: React.FC<SkillsEditProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  isRTL = document.documentElement.lang === 'he',
  template = 'professional'
}) => {
  const [formData, setFormData] = useState<Skills>({
    technical: [],
    soft: [],
    languages: []
  });

  const [newSkill, setNewSkill] = useState<{
    type: 'technical' | 'soft';
    name: string;
    level: number;
  }>({
    type: 'technical',
    name: '',
    level: 1
  });

  useEffect(() => {
    if (isOpen && data) {
      setFormData({
        technical: data.technical || [],
        soft: data.soft || [],
        languages: data.languages || []
      });
    }
  }, [data, isOpen]);

  const handleAddSkill = (type: 'technical' | 'soft') => {
    if (!newSkill.name.trim()) return;

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name: newSkill.name.trim(), level: newSkill.level }]
    }));

    setNewSkill({
      type,
      name: '',
      level: 1
    });
  };

  const handleRemoveSkill = (type: 'technical' | 'soft', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleLevelChange = (type: 'technical' | 'soft', index: number, newLevel: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((skill, i) => 
        i === index ? { ...skill, level: Math.max(1, Math.min(5, newLevel)) } : skill
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const renderSkillList = (type: 'technical' | 'soft') => {
    const skills = formData[type];
    const icon = type === 'technical' ? <Wrench className="w-5 h-5" /> : <Brain className="w-5 h-5" />;
    const title = type === 'technical' 
      ? (isRTL ? 'כישורים טכניים' : 'Technical Skills')
      : (isRTL ? 'כישורים רכים' : 'Soft Skills');

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-lg font-medium">{title}</h3>
        </div>

        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                value={skill.name}
                readOnly
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(type, index, level)}
                    className={cn(
                      "w-6 h-6 rounded-full",
                      "transition-colors",
                      level <= skill.level ? "bg-[#4856CD]" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={() => handleRemoveSkill(type, index)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Input
            value={newSkill.type === type ? newSkill.name : ''}
            onChange={(e) => setNewSkill(prev => ({
              ...prev,
              type,
              name: e.target.value
            }))}
            placeholder={isRTL ? 'הוסף כישור חדש' : 'Add new skill'}
            className="flex-1"
          />
          <button
            onClick={() => handleAddSkill(type)}
            className={cn(
              "p-2 rounded-full",
              "bg-[#4856CD] text-white",
              "hover:bg-[#4856CD]/90 transition-colors"
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className={cn(
            "sm:max-w-[600px] p-0 gap-0",
            "bg-gradient-to-b from-white to-gray-50",
            "rounded-2xl shadow-xl border-0",
            isRTL ? "rtl" : "ltr",
            template === 'professional' && "font-rubik",
            template === 'creative' && "font-heebo",
            template === 'general' && "font-opensans",
            template === 'classic' && "font-assistant",
          )}>
            <div className="p-6 border-b border-[#4856CD]/10">
              <DialogHeader>
                <DialogTitle className={cn(
                  "text-center text-2xl font-bold",
                  "bg-gradient-to-r from-[#4856CD] to-[#4856CD]/80 text-transparent bg-clip-text"
                )}>
                  {isRTL ? 'כישורים' : 'Skills'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-8">
              {renderSkillList('technical')}
              {renderSkillList('soft')}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className={cn(
                    "flex-1 px-4 py-2.5",
                    "rounded-full border-2 border-[#4856CD]",
                    "text-[#4856CD] hover:bg-[#4856CD]/5",
                    "transition-colors font-medium"
                  )}
                >
                  {isRTL ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  className={cn(
                    "flex-1 px-4 py-2.5",
                    "rounded-full bg-[#4856CD]",
                    "text-white hover:bg-[#4856CD]/90",
                    "transition-colors font-medium"
                  )}
                >
                  {isRTL ? 'שמירה' : 'Save'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 