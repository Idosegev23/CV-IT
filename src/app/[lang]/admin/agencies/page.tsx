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
  send_cv_template: {
    subject: string;
    body: string;
  };
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

      setAgencies(data || []);
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
    send_cv_template: {
      subject: '',
      body: ''
    }
  });

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
        send_cv_template: {
          subject: '',
          body: ''
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

      loadAgencies();
    } catch (error) {
      console.error('Error deleting agency:', error);
    }
  };

  const toggleAgencyStatus = async (agencyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('agencies')
        .update({ is_active: !isActive })
        .eq('id', agencyId);

      if (error) throw error;

      loadAgencies();
    } catch (error) {
      console.error('Error toggling agency status:', error);
    }
  };

  const handleEditAgencyField = (field: keyof Agency, value: any) => {
    if (!selectedAgency) return;
    
    setSelectedAgency({
      ...selectedAgency,
      [field]: value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">ניהול חברות השמה</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5" />
          חברה חדשה
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort('name')}
                  >
                    שם החברה
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort('contact_person')}
                  >
                    איש קשר
                    {sortConfig.key === 'contact_person' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פרטי קשר
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  התמחויות
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  אזורים
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAgencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {agency.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      {agency.contact_person}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4" />
                        {agency.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4" />
                        {agency.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {agency.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {agency.regions.map((region, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                        >
                          {region}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAgencyStatus(agency.id, agency.is_active)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${agency.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {agency.is_active ? 'פעיל' : 'לא פעיל'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedAgency(agency);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="עריכה"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAgency(agency.id)}
                        className="text-red-600 hover:text-red-900"
                        title="מחיקה"
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
      </div>

      {/* מודל הוספת חברת השמה */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">הוספת חברת השמה חדשה</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם החברה
                </label>
                <input
                  type="text"
                  value={newAgency.name || ''}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל
                </label>
                <input
                  type="email"
                  value={newAgency.email || ''}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <input
                  type="tel"
                  value={newAgency.phone || ''}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  איש קשר
                </label>
                <input
                  type="text"
                  value={newAgency.contact_person || ''}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, contact_person: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אתר אינטרנט
                </label>
                <input
                  type="url"
                  value={newAgency.website || ''}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כתובת
                </label>
                <input
                  type="text"
                  value={newAgency.address || ''}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הערות
                </label>
                <textarea
                  value={newAgency.notes || ''}
                  onChange={(e) => setNewAgency(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  התמחויות
                </label>
                <select
                  multiple
                  value={newAgency.specialties || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setNewAgency(prev => ({ ...prev, specialties: values }));
                  }}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="tech">היי-טק</option>
                  <option value="finance">פיננסים</option>
                  <option value="medical">רפואה</option>
                  <option value="sales">מכירות</option>
                  <option value="marketing">שיווק</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אזורים
                </label>
                <select
                  multiple
                  value={newAgency.regions || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setNewAgency(prev => ({ ...prev, regions: values }));
                  }}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="north">צפון</option>
                  <option value="center">מרכז</option>
                  <option value="south">דרום</option>
                  <option value="jerusalem">ירושלים</option>
                  <option value="sharon">השרון</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAgency.is_active || false}
                    onChange={(e) => setNewAgency(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">חברה פעילה</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg"
              >
                ביטול
              </button>
              <button
                onClick={handleAddAgency}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                הוספת חברה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מודל עריכת חברת השמה */}
      {showEditModal && selectedAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">עריכת חברת השמה</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם החברה
                </label>
                <input
                  type="text"
                  value={selectedAgency.name || ''}
                  onChange={(e) => handleEditAgencyField('name', e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל
                </label>
                <input
                  type="email"
                  value={selectedAgency.email || ''}
                  onChange={(e) => handleEditAgencyField('email', e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <input
                  type="tel"
                  value={selectedAgency.phone || ''}
                  onChange={(e) => handleEditAgencyField('phone', e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  איש קשר
                </label>
                <input
                  type="text"
                  value={selectedAgency.contact_person || ''}
                  onChange={(e) => handleEditAgencyField('contact_person', e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אתר אינטרנט
                </label>
                <input
                  type="url"
                  value={selectedAgency.website || ''}
                  onChange={(e) => handleEditAgencyField('website', e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כתובת
                </label>
                <input
                  type="text"
                  value={selectedAgency.address || ''}
                  onChange={(e) => handleEditAgencyField('address', e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הערות
                </label>
                <textarea
                  value={selectedAgency.notes || ''}
                  onChange={(e) => handleEditAgencyField('notes', e.target.value)}
                  className="w-full border rounded-lg p-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  התמחויות
                </label>
                <select
                  multiple
                  value={selectedAgency.specialties || []}
                  onChange={(e) => handleEditAgencyField('specialties', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="tech">היי-טק</option>
                  <option value="finance">פיננסים</option>
                  <option value="medical">רפואה</option>
                  <option value="sales">מכירות</option>
                  <option value="marketing">שיווק</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אזורים
                </label>
                <select
                  multiple
                  value={selectedAgency.regions || []}
                  onChange={(e) => handleEditAgencyField('regions', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="north">צפון</option>
                  <option value="center">מרכז</option>
                  <option value="south">דרום</option>
                  <option value="jerusalem">ירושלים</option>
                  <option value="sharon">השרון</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAgency.is_active || false}
                    onChange={(e) => handleEditAgencyField('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">חברה פעילה</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAgency(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg"
              >
                ביטול
              </button>
              <button
                onClick={handleEditAgency}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                שמירת שינויים
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 