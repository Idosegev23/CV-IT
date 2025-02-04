'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ClassicTemplate from '@/components/CVTemplates/ClassicTemplate';
import ProfessionalTemplate from '@/components/CVTemplates/ProfessionalTemplate';
import GeneralTemplate from '@/components/CVTemplates/GeneralTemplate';
import CreativeTemplate from '@/components/CVTemplates/CreativeTemplate';
import { ResumeData } from '@/types/resume';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const templateComponents = {
  classic: ClassicTemplate,
  professional: ProfessionalTemplate,
  general: GeneralTemplate,
  creative: CreativeTemplate
};

const templates = [
  { id: 'classic', name: 'קלאסי' },
  { id: 'professional', name: 'מקצועי' },
  { id: 'creative', name: 'יצירתי' },
  { id: 'general', name: 'כללי' },
];

const transformResumeData = (rawData: any): ResumeData => {
  return {
    personalInfo: {
      name: rawData?.personal_details?.name || '',
      title: rawData?.personal_details?.title || rawData?.title || (rawData?.professional_summary?.split('.')[0] || ''),
      email: rawData?.personal_details?.email || '',
      phone: rawData?.personal_details?.phone || '',
      address: rawData?.personal_details?.address || '',
      linkedin: rawData?.personalInfo?.linkedin || rawData?.personal_details?.linkedin || '',
      summary: rawData?.personal_details?.summary || rawData?.professional_summary || ''
    },
    experience: Array.isArray(rawData?.experience) ? rawData.experience.map((exp: any) => ({
      position: exp.title || '',
      company: exp.company || '',
      location: '',
      startDate: exp.years?.split('-')[0]?.trim() || '',
      endDate: exp.years?.split('-')[1]?.trim() || '',
      description: exp.achievements || []
    })) : [],
    education: {
      degrees: Array.isArray(rawData?.education?.degrees) ? rawData.education.degrees.map((deg: any) => ({
        type: deg.type || '',
        degreeType: deg.degreeType || 'academic',
        field: deg.field || '',
        institution: deg.institution || '',
        startDate: deg.years?.split('-')[0]?.trim() || deg.startDate || '',
        endDate: deg.years?.split('-')[1]?.trim() || deg.endDate || '',
        specialization: deg.specialization || '',
        years: deg.years || `${deg.startDate || ''} - ${deg.endDate || ''}`
      })) : []
    },
    skills: {
      technical: Array.isArray(rawData?.skills?.technical) ? rawData.skills.technical.map((skill: any) => ({
        name: skill.name || '',
        level: skill.level
      })) : [],
      soft: Array.isArray(rawData?.skills?.soft) ? rawData.skills.soft.map((skill: any) => ({
        name: skill.name || '',
        level: skill.level
      })) : [],
      languages: typeof rawData?.languages === 'object' ? Object.entries(rawData.languages || {}).map(([language, level]) => ({
        language,
        level: level as string
      })) : []
    },
    military: rawData?.military_service ? {
      role: rawData?.military_service?.role || '',
      unit: rawData?.military_service?.unit || 'צה"ל',
      startDate: rawData?.military_service?.years?.split('-')[0]?.trim() || '',
      endDate: rawData?.military_service?.years?.split('-')[1]?.trim() || '',
      description: rawData?.military_service?.achievements || []
    } : undefined,
    template: rawData?.template_id || 'classic',
    references: [],
    lang: rawData?.lang || 'he'
  };
};

const CVViewer = ({ sessionId, selectedTemplate }: { sessionId: string, selectedTemplate: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvData, setCvData] = useState<ResumeData | null>(null);
  const supabase = createClientComponentClient({
    options: {
      global: {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    },
  });

  // פונקציה לטעינת הנתונים מחדש
  const loadCVData = async () => {
    setLoading(true);
    try {
      const { data: cvDataResult, error: cvError } = await supabase
        .from('cv_data')
        .select('format_cv')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (cvError) {
        throw cvError;
      }

      if (!cvDataResult?.format_cv) {
        throw new Error('לא נמצאו נתונים');
      }

      const formattedData = transformResumeData(cvDataResult.format_cv);
      formattedData.template = selectedTemplate;
      setCvData(formattedData);

    } catch (error) {
      console.error('Error loading CV data:', error);
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  // טעינת הנתונים רק בטעינה ראשונית ובשינוי תבנית
  React.useEffect(() => {
    loadCVData();
  }, [selectedTemplate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="text-center text-red-500 p-4">
        {error || 'שגיאה בטעינת הנתונים'}
      </div>
    );
  }

  const TemplateComponent = templateComponents[cvData.template as keyof typeof templateComponents];
  
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <TemplateComponent
          data={cvData}
          lang="he"
          isEditing={false}
          onUpdate={() => {}}
          onDelete={() => {}}
          onEdit={() => {}}
        />
      </div>
    </div>
  );
};

export default function CVMaker() {
  const supabase = createClientComponentClient();
  const [sessionId, setSessionId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [loading, setLoading] = useState(false);
  const [showCV, setShowCV] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId?.trim()) {
      toast.error('נא להזין Session ID');
      return;
    }

    setLoading(true);

    try {
      // בדיקה שה-session קיים
      const { data: existingData, error: checkError } = await supabase
        .from('cv_data')
        .select('id')
        .eq('session_id', sessionId.trim())
        .maybeSingle();

      if (checkError) {
        console.error('Check error:', checkError);
        toast.error('שגיאה בבדיקת הנתונים');
        return;
      }

      if (!existingData) {
        toast.error('לא נמצאו נתונים עבור session_id זה');
        return;
      }

      // עדכון התבנית הנבחרת
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ template_id: selectedTemplate })
        .eq('id', sessionId.trim());

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('שגיאה בעדכון התבנית');
        return;
      }

      setShowCV(true);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (showCV) {
    return <CVViewer sessionId={sessionId} selectedTemplate={selectedTemplate} />;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">יצירת קורות חיים</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
            Session ID
          </label>
          <input
            type="text"
            id="sessionId"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="הכנס Session ID"
            required
          />
        </div>

        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
            בחר תבנית
          </label>
          <select
            id="template"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'טוען...' : 'צור קורות חיים'}
        </button>
      </form>
    </div>
  );
} 
