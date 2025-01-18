'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { ResumeData } from '@/types/resume';
import { CVTemplate } from '@/components/CVTemplates';
import { Copy, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

const emptyResumeData: ResumeData = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    summary: ''
  },
  experience: [],
  education: {
    degrees: []
  },
  skills: {
    technical: [],
    soft: [],
    languages: []
  },
  template: 'classic',
  references: [],
  lang: 'he',
  interfaceLang: 'he'
};

export default function AdminCreateCV() {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formattedData, setFormattedData] = useState<ResumeData>(emptyResumeData);
  const [showLinks, setShowLinks] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/he/admin/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          router.push('/he/admin');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/he/admin/login');
      } finally {
        setInitialLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#EAEAE7] p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('הקישור הועתק!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowLinks(false);

    try {
      // בדיקת אימות והרשאות
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('שגיאת אימות - נא להתחבר מחדש');
        return;
      }

      // בדיקת הרשאות אדמין
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        toast.error('אין הרשאות מתאימות');
        return;
      }

      // בדיקה שה-session קיים וקבלת הנתונים
      const { data: cvData, error: cvError } = await supabase
        .from('cv_data')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (cvError || !cvData) {
        toast.error('לא נמצאו נתונים עבור session_id זה');
        return;
      }

      // המרת הנתונים לפורמט הנדרש
      const relevantData = cvData.en_format_cv || cvData.format_cv;
      
      if (!relevantData) {
        toast.error('לא נמצאו נתונים מפורמטים');
        return;
      }

      const newFormattedData: ResumeData = {
        personalInfo: {
          name: relevantData.personal_details?.name || '',
          title: '',
          email: relevantData.personal_details?.email || '',
          phone: relevantData.personal_details?.phone || '',
          address: relevantData.personal_details?.address || '',
          summary: relevantData.professional_summary || ''
        },
        experience: (relevantData.experience || []).map((exp: any) => ({
          position: exp.title || '',
          company: exp.company || '',
          startDate: (exp.years || '').split('-')[0] || '',
          endDate: (exp.years || '').split('-')[1] || '',
          description: exp.achievements || []
        })),
        education: {
          degrees: ((relevantData.education || {}).degrees || []).map((edu: any) => ({
            type: edu.type || '',
            field: edu.field || '',
            institution: edu.institution || '',
            years: edu.years || '',
            specialization: edu.specialization || ''
          }))
        },
        skills: {
          technical: ((relevantData.skills || {}).technical || []).map((skill: any) => ({
            name: skill.name || '',
            level: skill.level === 'Expert' ? 5 : skill.level === 'High' ? 4 : 3
          })),
          soft: ((relevantData.skills || {}).soft || []).map((skill: any) => ({
            name: skill.name || '',
            level: skill.level === 'Expert' ? 5 : skill.level === 'High' ? 4 : 3
          })),
          languages: ((relevantData.skills || {}).languages || []).map((lang: any) => ({
            language: lang.language || '',
            level: lang.level || ''
          }))
        },
        military: relevantData.military_service ? {
          role: relevantData.military_service.role || '',
          unit: relevantData.military_service.unit || 'IDF',
          startDate: (relevantData.military_service.years || '').split('-')[0] || '',
          endDate: (relevantData.military_service.years || '').split('-')[1] || '',
          description: relevantData.military_service.achievements || []
        } : undefined,
        template: 'classic',
        references: [],
        lang: 'he',
        interfaceLang: 'he'
      };

      setFormattedData(newFormattedData);

      // יצירת ה-PDF
      const element = document.createElement('div');
      element.innerHTML = `
        <div id="cv-content">
          <style>
            ${await fetch('/styles/templates/classic.css').then(res => res.text())}
            ${await fetch('/styles/templates/general.css').then(res => res.text())}
          </style>
          <div>
            ${document.getElementById('cv-preview')?.innerHTML || ''}
          </div>
        </div>
      `;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          html: element.outerHTML,
          fileName: `${newFormattedData.personalInfo.name || 'cv'}_he`,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // עדכון הסטטוס ב-Supabase
      await supabase
        .from('cv_data')
        .update({ 
          status: 'completed',
          last_generated: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      setShowLinks(true);
      toast.success('קורות החיים נוצרו בהצלחה!');

    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה בתהליך יצירת קורות החיים');
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cvit.co.il';

  return (
    <div className="min-h-screen bg-[#EAEAE7] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-2xl font-bold text-center mb-6">השלמת תהליך יצירת קורות חיים</h1>
          <p className="text-gray-600 text-center mb-8">
            הכלי הזה מאפשר להשלים את תהליך יצירת קורות החיים עבור לקוחות שהתהליך נקטע באמצע
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
            <div>
              <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
                Session ID
              </label>
              <input
                type="text"
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4856CD] focus:border-transparent"
                placeholder="הכנס Session ID"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#4856CD] text-white py-3 rounded-lg font-medium
                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#3A45C0]'}
                transition-colors duration-200`}
            >
              {loading ? 'מעבד...' : 'השלמת התהליך'}
            </button>
          </form>

          {/* הצגת הקישורים */}
          {showLinks && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">קישורים ללקוח</h2>
              
              {/* קישור למסך הסיום */}
              <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">מסך סיום</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyLink(`${baseUrl}/he/finish/${sessionId}`)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="העתק קישור"
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <a
                      href={`${baseUrl}/he/finish/${sessionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="פתח בחלון חדש"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-600" />
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-500 break-all">{`${baseUrl}/he/finish/${sessionId}`}</p>
              </div>

              {/* קישור למסך הורדה */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">מסך הורדה</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyLink(`${baseUrl}/he/cv/classic?sessionId=${sessionId}`)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="העתק קישור"
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <a
                      href={`${baseUrl}/he/cv/classic?sessionId=${sessionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="פתח בחלון חדש"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-600" />
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-500 break-all">{`${baseUrl}/he/cv/classic?sessionId=${sessionId}`}</p>
              </div>
            </div>
          )}
        </div>

        {/* תצוגה מקדימה של ה-CV */}
        <div id="cv-preview" className="hidden">
          <CVTemplate
            templateId="classic"
            data={formattedData}
            lang="he"
          />
        </div>
      </div>
    </div>
  );
} 