'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/theme/ui/button';
import { Tooltip } from '@/components/theme/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { EditorToolbar } from './EditorToolbar';
import { MobileToolbar } from './MobileToolbar';
import { EditableSection } from './EditableSection';
import { ResumeData } from '@/types/resume';
import { Dictionary } from '@/dictionaries/dictionary';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAutoSave } from '@/hooks/use-auto-save';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  initialData: ResumeData;
  onSave: (data: ResumeData) => Promise<void>;
  onCancel: () => void;
  lang: string;
  dictionary: Dictionary;
}

// פונקציית עזר לפירוק מידע מהסקשן
const parseSection = (section: string, field: string, value: string): Partial<ResumeData> => {
  const [parentField, childField] = field.split('.');
  if (childField) {
    return {
      [section]: {
        [parentField]: {
          [childField]: value
        }
      }
    };
  }
  return {
    [section]: {
      [field]: value
    }
  };
};

export const TextEditor: React.FC<TextEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  lang,
  dictionary,
}) => {
  const [editableData, setEditableData] = useState<ResumeData>(initialData);
  const [selectedFont, setSelectedFont] = useState('Assistant');
  const [fontSize, setFontSize] = useState('16px');
  const [direction, setDirection] = useState(lang === 'he' ? 'rtl' : 'ltr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<ResumeData[]>([initialData]);
  const [redoStack, setRedoStack] = useState<ResumeData[]>([]);
  const [lastSavedData, setLastSavedData] = useState<ResumeData>(initialData);

  const editorRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // אוטו-שמירה
  const { isDirty, setIsDirty } = useAutoSave(editableData, lastSavedData, async (data) => {
    try {
      await onSave(data);
      setLastSavedData(data);
      setIsDirty(false);
      toast({
        title: dictionary.messages.autoSaved,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: dictionary.errors.autoSaveFailed,
        variant: "destructive",
      });
    }
  }, 30000); // שמירה כל 30 שניות

  // קיצורי מקלדת
  useHotkeys('mod+s', (e) => {
    e.preventDefault();
    handleSubmit();
  }, { enableOnFormTags: true });

  useHotkeys('mod+z', (e) => {
    e.preventDefault();
    handleUndo();
  }, { enableOnFormTags: true });

  useHotkeys('mod+shift+z', (e) => {
    e.preventDefault();
    handleRedo();
  }, { enableOnFormTags: true });

  // פונקציות עזר
  const handleUndo = useCallback(() => {
    if (undoStack.length > 1) {
      const prevState = undoStack[undoStack.length - 2];
      const currentState = undoStack[undoStack.length - 1];
      
      setRedoStack(prev => [...prev, currentState]);
      setUndoStack(prev => prev.slice(0, -1));
      setEditableData(prevState);
    }
  }, [undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      
      setUndoStack(prev => [...prev, nextState]);
      setRedoStack(prev => prev.slice(0, -1));
      setEditableData(nextState);
    }
  }, [redoStack]);

  const handleTextChange = (section: keyof ResumeData, field: string, value: string) => {
    const newData = { ...editableData } as ResumeData;
    
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      if (section in newData && typeof newData[section] === 'object' && newData[section] !== null) {
        const sectionData = newData[section] as Record<string, any>;
        if (parentField in sectionData) {
          sectionData[parentField][childField] = value;
        }
      }
    } else {
      if (section in newData) {
        (newData[section] as any)[field] = value;
      }
    }
    
    setEditableData(newData);
    setIsDirty(true);
  };

  const handleFormat = useCallback((command: string, value?: string) => {
    try {
      document.execCommand(command, false, value);
    } catch (error) {
      toast({
        title: dictionary.errors.formatFailed,
        variant: "destructive",
      });
    }
  }, [dictionary.errors.formatFailed]);

  const handleSubmit = async () => {
    if (!isDirty) return;

    setIsSubmitting(true);
    try {
      await onSave(editableData);
      setLastSavedData(editableData);
      setIsDirty(false);
      toast({
        title: dictionary.messages.saved,
      });
    } catch (error) {
      toast({
        title: dictionary.errors.saveFailed,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // נוסיף טיפוס מדויק לכיוון
  const getDirection = (lang: string): 'rtl' | 'ltr' => {
    return lang === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Toolbar - מותאם למובייל/דסקטופ */}
      {isMobile ? (
        <MobileToolbar
          selectedFont={selectedFont}
          setSelectedFont={setSelectedFont}
          fontSize={fontSize}
          setFontSize={setFontSize}
          direction={direction}
          setDirection={setDirection}
          handleFormat={handleFormat}
          dictionary={dictionary}
          lang={lang}
        />
      ) : (
        <EditorToolbar
          selectedFont={selectedFont}
          setSelectedFont={setSelectedFont}
          fontSize={fontSize}
          setFontSize={setFontSize}
          direction={direction}
          setDirection={setDirection}
          handleFormat={handleFormat}
          dictionary={dictionary}
          lang={lang}
          canUndo={undoStack.length > 1}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      )}

      {/* תוכן העורך */}
      <div 
        className="w-full max-w-[210mm] mx-auto bg-white shadow-lg my-4 relative"
        ref={editorRef}
      >
        <div 
          className={cn(
            "cv-content",
            direction,
            "min-h-[297mm] p-8 md:p-[20mm]"
          )}
          style={{ 
            fontFamily: selectedFont,
            fontSize,
          }}
        >
          <EditableSection
            section="personalInfo"
            data={editableData.personalInfo}
            onChange={handleTextChange}
            isActive={activeSection === 'personalInfo'}
            setActiveSection={setActiveSection}
            dictionary={dictionary}
            direction={getDirection(lang)}
          />

          <EditableSection
            section="experience"
            data={editableData.experience}
            onChange={handleTextChange}
            isActive={activeSection === 'experience'}
            setActiveSection={setActiveSection}
            dictionary={dictionary}
            direction={getDirection(lang)}
          />

          <EditableSection
            section="education"
            data={editableData.education}
            onChange={handleTextChange}
            isActive={activeSection === 'education'}
            setActiveSection={setActiveSection}
            dictionary={dictionary}
            direction={getDirection(lang)}
          />

          <EditableSection
            section="skills"
            data={editableData.skills}
            onChange={handleTextChange}
            isActive={activeSection === 'skills'}
            setActiveSection={setActiveSection}
            dictionary={dictionary}
            direction={getDirection(lang)}
          />
        </div>
      </div>

      {/* כפתורי פעולה */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-end gap-2 z-50">
        <Button 
          variant="outline" 
          onClick={onCancel}
          aria-label={dictionary.buttons.cancel}
        >
          {dictionary.buttons.cancel}
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !isDirty}
          aria-label={isSubmitting ? dictionary.buttons.saving : dictionary.buttons.save}
        >
          {isSubmitting ? dictionary.buttons.saving : dictionary.buttons.save}
        </Button>
      </div>
    </div>
  );
};

export default TextEditor;