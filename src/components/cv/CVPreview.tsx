'use client';
import React, { useState, useEffect } from 'react';
import { CVTutorialSteps } from './CVTutorialSteps';
import styles from './CVTutorialSteps.module.css';

interface CVPreviewProps {
  templateId: string;
  language: string;
  canEdit: boolean;
}

export function CVPreview({ templateId, language, canEdit }: CVPreviewProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentHighlight, setCurrentHighlight] = useState<'edit' | 'download' | null>(null);

  // Listen for tutorial step changes and update highlighted elements
  useEffect(() => {
    if (currentHighlight) {
      const element = document.querySelector(`[data-highlight="${currentHighlight}"]`);
      if (element) {
        element.classList.add(styles.highlightedElement);
      }
      return () => {
        if (element) {
          element.classList.remove(styles.highlightedElement);
        }
      };
    }
  }, [currentHighlight]);

  return (
    <div className="p-4 relative">
      <h2 className="text-xl font-bold mb-4">
        {language === 'he' ? 'תצוגה מקדימה' : 'Preview'}
      </h2>
      
      <div className="flex gap-4 mb-4">
        <button
          data-highlight="edit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => {/* הוסף לוגיקת עריכה */}}
        >
          {language === 'he' ? 'עריכה' : 'Edit'}
        </button>
        
        <button
          data-highlight="download"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          onClick={() => {/* הוסף לוגיקת הורדה */}}
        >
          {language === 'he' ? 'הורדה' : 'Download'}
        </button>
      </div>

      <div className="text-sm text-zinc-500">
        Template ID: {templateId}
      </div>

      <button
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-8 left-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 z-50"
      >
        <span className="text-xl">❓</span>
        <span>{language === 'he' ? 'נתקעת? נעזור לך!' : 'Need help?'}</span>
      </button>

      <CVTutorialSteps
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        canEdit={canEdit}
        language={language}
      />
    </div>
  );
} 