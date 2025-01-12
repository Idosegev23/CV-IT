'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface EmailTemplate {
  subject_template: string;
  body_template: string;
  include_analysis: boolean;
  analysis_format: {
    include_full_name: boolean;
    include_city: boolean;
    include_phone: boolean;
    include_email: boolean;
    include_last_position: boolean;
    include_experience_years: boolean;
    include_relevant_positions: boolean;
    include_search_area: boolean;
  };
  custom_fields: Record<string, string>;
}

interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  contact_person: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes: string;
  specialties: string[];
  regions: string[];
  website?: string;
  address?: string;
  logo_url?: string;
  social_media?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  email_format: EmailTemplate;
}

interface NewAgency extends Omit<Agency, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

interface SortConfig {
  key: keyof Agency;
  direction: 'asc' | 'desc';
}

export default function AgenciesManagement({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [isConverting, setIsConverting] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const defaultEmailFormat: EmailTemplate = {
        subject_template: '',
        body_template: '',
        include_analysis: false,
        analysis_format: {
          include_full_name: true,
          include_city: true,
          include_phone: true,
          include_email: true,
          include_last_position: true,
          include_experience_years: true,
          include_relevant_positions: true,
          include_search_area: true
        },
        custom_fields: {}
      };

      const normalizedData = (data || []).map(agency => ({
        ...agency,
        email_format: {
          ...defaultEmailFormat,
          ...agency.email_format
        }
      }));

      setAgencies(normalizedData);
    } catch (error) {
      console.error('Error loading agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Agency) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedAgencies = [...agencies].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortConfig.direction === 'asc'
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  const [newAgency, setNewAgency] = useState<NewAgency>({
    name: '',
    email: '',
    phone: '',
    contact_person: '',
    is_active: true,
    notes: '',
    specialties: [],
    regions: [],
    email_format: {
      subject_template: '',
      body_template: '',
      include_analysis: false,
      analysis_format: {
        include_full_name: true,
        include_city: true,
        include_phone: true,
        include_email: true,
        include_last_position: true,
        include_experience_years: true,
        include_relevant_positions: true,
        include_search_area: true
      },
      custom_fields: {}
    }
  });

  const handleNewTemplateTextChange = async (text: string) => {
    setNewAgency(prev => ({
      ...prev,
      email_format: {
        ...prev.email_format,
        body_template: text
      }
    }));
  };

  const handleAddAgency = async () => {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .insert([{
          ...newAgency,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setAgencies(prev => [data, ...prev]);
      setShowAddModal(false);
      setNewAgency({
        name: '',
        email: '',
        phone: '',
        contact_person: '',
        is_active: true,
        notes: '',
        specialties: [],
        regions: [],
        email_format: {
          subject_template: '',
          body_template: '',
          include_analysis: false,
          analysis_format: {
            include_full_name: true,
            include_city: true,
            include_phone: true,
            include_email: true,
            include_last_position: true,
            include_experience_years: true,
            include_relevant_positions: true,
            include_search_area: true
          },
          custom_fields: {}
        }
      });
      toast.success('חברת ההשמה נוספה בהצלחה');
    } catch (error) {
      console.error('Error adding agency:', error);
      toast.error('אירעה שגיאה בהוספת חברת ההשמה');
    }
  };

  const handleEditAgency = async () => {
    try {
      if (!selectedAgency) return;

      const { error } = await supabase
        .from('agencies')
        .update({
          ...selectedAgency,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAgency.id);

      if (error) throw error;

      setAgencies(prev => prev.map(agency => 
        agency.id === selectedAgency.id ? selectedAgency : agency
      ));
      setShowEditModal(false);
      setSelectedAgency(null);
      toast.success('חברת ההשמה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error updating agency:', error);
      toast.error('אירעה שגיאה בעדכון חברת ההשמה');
    }
  };

  const handleDeleteAgency = async (agencyId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק חברה זו?')) return;

    try {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', agencyId);

      if (error) throw error;

      setAgencies(prev => prev.filter(agency => agency.id !== agencyId));
      toast.success('חברת ההשמה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting agency:', error);
      toast.error('אירעה שגיאה במחיקת חברת ההשמה');
    }
  };

  const toggleAgencyStatus = async (agencyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('agencies')
        .update({ is_active: !isActive })
        .eq('id', agencyId);

      if (error) throw error;

      setAgencies(prev => prev.map(agency => 
        agency.id === agencyId ? { ...agency, is_active: !isActive } : agency
      ));
      toast.success(`חברת ההשמה ${isActive ? 'הושבתה' : 'הופעלה'} בהצלחה`);
    } catch (error) {
      console.error('Error toggling agency status:', error);
      toast.error('אירעה שגיאה בעדכון סטטוס חברת ההשמה');
    }
  };

  const handleEditAgencyField = (field: keyof Agency, value: any) => {
    if (!selectedAgency) return;
    setSelectedAgency(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const convertTemplateToHtml = async (text: string) => {
    try {
      setIsConverting(true);
      const response = await fetch('/api/convert-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to convert template');

      const { htmlTemplate } = await response.json();
      return htmlTemplate;
    } catch (error) {
      console.error('Error converting template:', error);
      toast.error('אירעה שגיאה בהמרת התבנית');
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  const handleTemplateTextChange = async (text: string) => {
    if (!selectedAgency) return;

    const updatedTemplate = {
      ...selectedAgency.email_format,
      body_template: text
    };

    setSelectedAgency({
      ...selectedAgency,
      email_format: updatedTemplate
    });
  };

  const EmailTemplateForm = ({ template, onChange }: { 
    template: EmailTemplate; 
    onChange: (template: EmailTemplate) => void;
  }) => {
    const [showCustomField, setShowCustomField] = useState(false);
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');

    const handleCustomFieldAdd = () => {
      if (!newFieldKey) return;
      
      onChange({
        ...template,
        custom_fields: {
          ...template.custom_fields,
          [newFieldKey]: newFieldValue
        }
      });
      
      setNewFieldKey('');
      setNewFieldValue('');
      setShowCustomField(false);
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">תבנית נושא המייל</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={template.subject_template}
            onChange={(e) => onChange({ ...template, subject_template: e.target.value })}
            placeholder='לדוגמה: "מספר משרה: {{job_id}} | גורם מפנה: CVIT"'
          />
          <p className="mt-1 text-sm text-gray-500">
            ניתן להשתמש במשתנים כתוך סוגריים מסולסלים כפולים
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">תבנית גוף המייל</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={5}
            value={template.body_template}
            onChange={(e) => onChange({ ...template, body_template: e.target.value })}
            placeholder="תוכן המייל. לדוגמה: referid={{referid}}"
          />
          <p className="mt-1 text-sm text-gray-500">
            השאר ריק אם ברצונך להשתמש בניתוח קורות החיים האוטומטי
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              checked={template.include_analysis}
              onChange={(e) => onChange({ ...template, include_analysis: e.target.checked })}
            />
            <span className="mr-2">כלול ניתוח קורות חיים אוטומטי</span>
          </label>
          
          <div className="text-sm text-gray-500">
            בחר אפשרות זו אם ברצונך לקבל ניתוח מפורט של קורות החיים
          </div>
        </div>

        {template.include_analysis && (
          <div className="border rounded p-4 space-y-2">
            <h4 className="font-medium">פרטים לכלול בניתוח</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(template.analysis_format).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    checked={value}
                    onChange={(e) => onChange({
                      ...template,
                      analysis_format: {
                        ...template.analysis_format,
                        [key]: e.target.checked
                      }
                    })}
                  />
                  <span className="mr-2">{getAnalysisFieldLabel(key)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="border rounded p-4">
          <h4 className="font-medium mb-2">שדות מותאמים אישית</h4>
          <div className="space-y-2">
            {Object.entries(template.custom_fields).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="font-medium min-w-[100px]">{key}:</span>
                <span className="flex-1">{value}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newCustomFields = { ...template.custom_fields };
                    delete newCustomFields[key];
                    onChange({ ...template, custom_fields: newCustomFields });
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {showCustomField ? (
            <div className="flex items-center gap-2 mt-4">
              <input
                type="text"
                placeholder="שם השדה (לדוגמה: referid)"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="ערך (לדוגמה: 8707)"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
              />
              <button
                type="button"
                onClick={handleCustomFieldAdd}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                הוסף
              </button>
              <button
                type="button"
                onClick={() => setShowCustomField(false)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomField(true)}
              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 ml-1" />
              הוסף שדה מותאם אישית
            </button>
          )}
        </div>
      </div>
    );
  };

  const getAnalysisFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      include_full_name: 'שם מלא',
      include_city: 'עיר מגורים',
      include_phone: 'טלפון',
      include_email: 'דוא"ל',
      include_last_position: 'תפקיד אחרון',
      include_experience_years: 'שנות ניסיון',
      include_relevant_positions: 'תפקידים רלוונטיים',
      include_search_area: 'אזור חיפוש עבודה'
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול חברות השמה</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          הוסף חברה חדשה
        </button>
      </div>

      {/* טבלת חברות השמה */}
      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">שם החברה</th>
              <th className="py-3 px-6 text-right">דוא"ל</th>
              <th className="py-3 px-6 text-right">טלפון</th>
              <th className="py-3 px-6 text-right">איש קשר</th>
              <th className="py-3 px-6 text-right">סטטוס</th>
              <th className="py-3 px-6 text-right">פעולות</th>
              </tr>
            </thead>
          <tbody className="text-gray-600 text-sm">
            {agencies.map((agency) => (
              <tr key={agency.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{agency.name}</td>
                <td className="py-3 px-6 text-right">{agency.email}</td>
                <td className="py-3 px-6 text-right">{agency.phone}</td>
                <td className="py-3 px-6 text-right">{agency.contact_person}</td>
                <td className="py-3 px-6 text-right">
                        <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      agency.is_active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}
                        >
                    {agency.is_active ? 'פעיל' : 'לא פעיל'}
                        </span>
                  </td>
                <td className="py-3 px-6 text-right">
                  <div className="flex item-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedAgency(agency);
                          setShowEditModal(true);
                        }}
                      className="text-blue-500 hover:text-blue-700"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    <button
                      onClick={() => toggleAgencyStatus(agency.id, agency.is_active)}
                      className={`${
                        agency.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'
                      }`}
                    >
                      {agency.is_active ? 'השבת' : 'הפעל'}
                    </button>
                      <button
                        onClick={() => handleDeleteAgency(agency.id)}
                      className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* מודל הוספת חברה חדשה */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">הוספת חברת השמה חדשה</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם החברה
                </label>
                <input
                  type="text"
                  value={newAgency.name}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  דוא"ל
                </label>
                <input
                  type="email"
                  value={newAgency.email}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <input
                  type="tel"
                  value={newAgency.phone}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  איש קשר
                </label>
                <input
                  type="text"
                  value={newAgency.contact_person}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, contact_person: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הערות
                </label>
                <textarea
                  value={newAgency.notes}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תחומי התמחות
                </label>
                <input
                  type="text"
                  value={newAgency.specialties.join(', ')}
                  onChange={(e) => setNewAgency(prev => ({
                    ...prev,
                    specialties: e.target.value.split(',').map(s => s.trim())
                  }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="הפרד תחומים בפסיקים"
                />
                  </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אזורים
                    </label>
                  <input
                  type="text"
                  value={newAgency.regions.join(', ')}
                    onChange={(e) => setNewAgency(prev => ({
                      ...prev,
                    regions: e.target.value.split(',').map(s => s.trim())
                    }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="הפרד אזורים בפסיקים"
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תבנית מייל
                </label>
                <EmailTemplateForm
                  template={newAgency.email_format}
                  onChange={(template) => setNewAgency(prev => ({
                      ...prev,
                    email_format: template
                    }))}
                  />
                </div>
              </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                ביטול
              </button>
              <button
                onClick={handleAddAgency}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                הוסף
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מודל עריכת חברה */}
      {showEditModal && selectedAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">עריכת חברת השמה</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם החברה
                </label>
                <input
                  type="text"
                  value={selectedAgency.name}
                  onChange={(e) => handleEditAgencyField('name', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  דוא"ל
                </label>
                <input
                  type="email"
                  value={selectedAgency.email}
                  onChange={(e) => handleEditAgencyField('email', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <input
                  type="tel"
                  value={selectedAgency.phone}
                  onChange={(e) => handleEditAgencyField('phone', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  איש קשר
                </label>
                <input
                  type="text"
                  value={selectedAgency.contact_person}
                  onChange={(e) => handleEditAgencyField('contact_person', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הערות
                </label>
                <textarea
                  value={selectedAgency.notes}
                  onChange={(e) => handleEditAgencyField('notes', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תחומי התמחות
                </label>
                <input
                  type="text"
                  value={selectedAgency.specialties.join(', ')}
                  onChange={(e) => handleEditAgencyField('specialties', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full p-2 border rounded-md"
                  placeholder="הפרד תחומים בפסיקים"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אזורים
                </label>
                  <input
                  type="text"
                  value={selectedAgency.regions.join(', ')}
                  onChange={(e) => handleEditAgencyField('regions', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full p-2 border rounded-md"
                  placeholder="הפרד אזורים בפסיקים"
                />
                  </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תבנית מייל
                    </label>
                <EmailTemplateForm
                  template={selectedAgency.email_format}
                  onChange={(template) => handleEditAgencyField('email_format', template)}
                    />
                  </div>
              </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAgency(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                ביטול
              </button>
              <button
                onClick={handleEditAgency}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 