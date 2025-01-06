'use client';
import React from 'react';

interface CVPreviewProps {
  templateId: string;
  language: string;
}

export function CVPreview({ templateId, language }: CVPreviewProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {language === 'he' ? 'תצוגה מקדימה' : 'Preview'}
      </h2>
      <div className="text-sm text-zinc-500">
        Template ID: {templateId}
      </div>
    </div>
  );
} 