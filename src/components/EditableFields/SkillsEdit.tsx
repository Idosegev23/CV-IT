import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/theme/ui/dialog';
import { Input } from '@/components/theme/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/theme/ui/select"
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

  const getLevelText = (level: number, isRTL: boolean) => {
    const levels = {
      1: { he: 'מתחיל', en: 'Beginner' },
      2: { he: 'מתחיל מתקדם', en: 'Advanced Beginner' },
      3: { he: 'בינוני', en: 'Intermediate' },
      4: { he: 'מתקדם', en: 'Advanced' },
      5: { he: 'מומחה', en: 'Expert' }
    };
    return isRTL ? levels[level as keyof typeof levels].he : levels[level as keyof typeof levels].en;
  };

  const renderSkillList = (type: 'technical' | 'soft') => {
    const skills = formData[type];
    const icon = type === 'technical' ? <Wrench className="!w-5 !h-5" /> : <Brain className="!w-5 !h-5" />;
    const title = type === 'technical' 
      ? (isRTL ? 'כישורים טכניים' : 'Technical Skills')
      : (isRTL ? 'כישורים רכים' : 'Soft Skills');

    return (
      <div className="!space-y-4">
        <div className="!flex !items-center !gap-2 !mb-4">
          {icon}
          <h3 className="!text-lg !font-medium">{title}</h3>
        </div>

        <div className="!space-y-3">
          {skills.map((skill, index) => (
            <div key={index} className="!flex !items-center !gap-3">
              <div className="!relative !flex-1">
                <Input
                  value={skill.name}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      [type]: prev[type].map((s, i) => 
                        i === index ? { ...s, name: e.target.value } : s
                      )
                    }));
                  }}
                  placeholder={isRTL ? "שם הכישור" : "Skill name"}
                  className={cn(
                    "!w-full !h-11 !bg-white !text-[14px] !text-gray-900",
                    "!rounded-lg !border !border-gray-200/80",
                    "!shadow-sm !shadow-gray-100/50",
                    "hover:!border-[#4856CD]/30 focus:!border-[#4856CD]",
                    "focus:!ring-2 focus:!ring-[#4856CD]/10",
                    "!transition !duration-200",
                    isRTL ? "!pr-11 !text-right" : "!pl-11"
                  )}
                  dir="auto"
                />
                {type === 'technical' ? (
                  <Wrench className={cn(
                    "!absolute !top-1/2 !-translate-y-1/2 !w-[18px] !h-[18px]",
                    "!text-gray-400 group-hover:!text-[#4856CD]/70",
                    "!transition-colors !duration-200",
                    isRTL ? "!right-4" : "!left-4"
                  )} />
                ) : (
                  <Brain className={cn(
                    "!absolute !top-1/2 !-translate-y-1/2 !w-[18px] !h-[18px]",
                    "!text-gray-400 group-hover:!text-[#4856CD]/70",
                    "!transition-colors !duration-200",
                    isRTL ? "!right-4" : "!left-4"
                  )} />
                )}
              </div>
              <Select
                value={skill.level.toString()}
                onValueChange={(value) => handleLevelChange(type, index, parseInt(value))}
              >
                <SelectTrigger className={cn(
                  "!w-[180px] !bg-white !text-[#4856CD]",
                  "!border-[#4856CD] !border-2",
                  "hover:!bg-[#4856CD] hover:!text-white",
                  "!transition-colors",
                  "!text-right"
                )}>
                  <SelectValue placeholder={isRTL ? "בחר רמה" : "Select Level"} />
                </SelectTrigger>
                <SelectContent className="!bg-white !border-[#4856CD] !border-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem 
                      key={level} 
                      value={level.toString()}
                      className={cn(
                        "!text-[#4856CD]",
                        "hover:!bg-[#4856CD] hover:!text-white",
                        "focus:!bg-[#4856CD] focus:!text-white",
                        "!cursor-pointer !transition-colors",
                        "!text-right"
                      )}
                    >
                      {getLevelText(level, isRTL)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => handleRemoveSkill(type, index)}
                className="!text-red-500 hover:!text-red-600 !transition-colors"
              >
                <Trash2 className="!w-5 !h-5" />
              </button>
            </div>
          ))}

          <div className="!flex !items-center !gap-3 !mt-4">
            <div className="!relative !flex-1">
              <Input
                value={newSkill.type === type ? newSkill.name : ''}
                onChange={(e) => setNewSkill(prev => ({
                  ...prev,
                  type,
                  name: e.target.value
                }))}
                placeholder={isRTL ? "הוסף כישור חדש" : "Add new skill"}
                className={cn(
                  "!w-full !h-11 !bg-white !text-[14px] !text-gray-900",
                  "!rounded-lg !border !border-gray-200/80",
                  "!shadow-sm !shadow-gray-100/50",
                  "hover:!border-[#4856CD]/30 focus:!border-[#4856CD]",
                  "focus:!ring-2 focus:!ring-[#4856CD]/10",
                  "!transition !duration-200",
                  isRTL ? "!pr-11 !text-right" : "!pl-11"
                )}
                dir="auto"
              />
              {type === 'technical' ? (
                <Wrench className={cn(
                  "!absolute !top-1/2 !-translate-y-1/2 !w-[18px] !h-[18px]",
                  "!text-gray-400 group-hover:!text-[#4856CD]/70",
                  "!transition-colors !duration-200",
                  isRTL ? "!right-4" : "!left-4"
                )} />
              ) : (
                <Brain className={cn(
                  "!absolute !top-1/2 !-translate-y-1/2 !w-[18px] !h-[18px]",
                  "!text-gray-400 group-hover:!text-[#4856CD]/70",
                  "!transition-colors !duration-200",
                  isRTL ? "!right-4" : "!left-4"
                )} />
              )}
            </div>
            <button
              onClick={() => handleAddSkill(type)}
              className={cn(
                "!p-2 !rounded-lg",
                "!bg-[#4856CD] !text-white",
                "hover:!bg-[#4856CD]/90 !transition-colors"
              )}
            >
              <Plus className="!w-5 !h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className={cn(
            "!fixed !top-[50%] !left-[50%] !transform !-translate-x-1/2 !-translate-y-1/2",
            "!w-[900px] !max-w-[92vw]",
            "!p-0 !m-0 !gap-0 !overflow-hidden",
            "!bg-gradient-to-br !from-white !via-white !to-gray-50/80",
            "!rounded-2xl !shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] !border !border-gray-100",
            isRTL ? "!rtl" : "!ltr",
            template === 'professional' && "!font-rubik",
            template === 'creative' && "!font-heebo",
            template === 'general' && "!font-opensans",
            template === 'classic' && "!font-assistant",
            "!block"
          )}
          style={{
            width: '900px',
            maxWidth: '92vw'
          }}>
            <div className="!px-6 !py-5 !border-b !border-[#4856CD]/5 !bg-gradient-to-r !from-[#4856CD]/[0.03] !to-transparent">
              <DialogHeader>
                <DialogTitle className={cn(
                  "!text-center !text-[22px] !font-bold",
                  "!bg-gradient-to-r !from-[#4856CD] !to-[#4856CD]/90 !text-transparent !bg-clip-text"
                )}>
                  {isRTL ? 'כישורים' : 'Skills'}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="!px-8 !py-6 !space-y-8">
              <div className="!grid !grid-cols-2 !gap-6">
                {renderSkillList('technical')}
                {renderSkillList('soft')}
              </div>

              <div className="!flex !gap-3 !mt-6">
                <button
                  onClick={onClose}
                  className={cn(
                    "!flex-1 !px-4 !py-2.5",
                    "!rounded-lg !border-2 !border-[#4856CD]",
                    "!text-[#4856CD] hover:!bg-[#4856CD]/5",
                    "!transition-colors !font-medium"
                  )}
                >
                  {isRTL ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  className={cn(
                    "!flex-1 !px-4 !py-2.5",
                    "!rounded-lg !bg-[#4856CD]",
                    "!text-white hover:!bg-[#4856CD]/90",
                    "!transition-colors !font-medium"
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