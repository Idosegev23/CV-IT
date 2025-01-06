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
  CurrencyDollarIcon,
  ChartBarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  budget: number | null;
  total_usage: number;
  total_discount: number;
  is_active: boolean;
  status: string;
  roi: number;
  media_types: string[];
  target_audience: any;
  metrics: any;
  platform_data: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface CampaignCoupon {
  id: string;
  campaign_id: string;
  coupon_id: string;
  created_at: string;
}

interface SortConfig {
  key: keyof Campaign;
  direction: 'asc' | 'desc';
}

const MEDIA_TYPE_OPTIONS = [
  { value: 'facebook', label: 'פייסבוק' },
  { value: 'instagram', label: 'אינסטגרם' },
  { value: 'linkedin', label: 'לינקדאין' },
  { value: 'google', label: 'גוגל' },
  { value: 'tiktok', label: 'טיקטוק' },
  { value: 'influencer', label: 'אינפלואנסרים' },
  { value: 'email', label: 'אימייל' },
  { value: 'sms', label: 'SMS' },
  { value: 'other', label: 'אחר' }
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'טיוטה' },
  { value: 'active', label: 'פעיל' },
  { value: 'paused', label: 'מושהה' },
  { value: 'completed', label: 'הושלם' },
  { value: 'cancelled', label: 'בוטל' }
];

export default function CampaignsManagement({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [campaignCoupons, setCampaignCoupons] = useState<Record<string, CampaignCoupon[]>>({});
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadCampaigns();
    loadCoupons();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
      
      // טעינת הקופונים המקושרים לכל קמפיין
      const campaignIds = data?.map(c => c.id) || [];
      if (campaignIds.length > 0) {
        const { data: couponsData, error: couponsError } = await supabase
          .from('campaign_coupons')
          .select('*')
          .in('campaign_id', campaignIds);

        if (couponsError) throw couponsError;

        const couponsMap: Record<string, CampaignCoupon[]> = {};
        couponsData?.forEach(cc => {
          if (!couponsMap[cc.campaign_id]) {
            couponsMap[cc.campaign_id] = [];
          }
          couponsMap[cc.campaign_id].push(cc);
        });
        setCampaignCoupons(couponsMap);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('אירעה שגיאה בטעינת הקמפיינים');
    } finally {
      setLoading(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setAvailableCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  const handleSort = (key: keyof Campaign) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
    
    return sortConfig.direction === 'asc'
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });

  const handleAddCampaign = async (campaign: Partial<Campaign>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;

      setCampaigns(prev => [data, ...prev]);
      setShowAddModal(false);
      toast.success('הקמפיין נוצר בהצלחה');
    } catch (error) {
      console.error('Error adding campaign:', error);
      toast.error('אירעה שגיאה ביצירת הקמפיין');
    }
  };

  const handleEditCampaign = async (campaign: Campaign) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update(campaign)
        .eq('id', campaign.id);

      if (error) throw error;

      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id ? campaign : c
      ));
      setShowEditModal(false);
      setSelectedCampaign(null);
      toast.success('הקמפיין עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('אירעה שגיאה בעדכון הקמפיין');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קמפיין זה?')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('הקמפיין נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('אירעה שגיאה במחיקת הקמפיין');
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('he-IL');
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
        <h1 className="text-2xl font-bold">ניהול קמפיינים</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5" />
          קמפיין חדש
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
                    שם הקמפיין
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מדיות
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort('start_date')}
                  >
                    תאריך התחלה
                    {sortConfig.key === 'start_date' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort('budget')}
                  >
                    תקציב
                    {sortConfig.key === 'budget' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort('roi')}
                  >
                    ROI
                    {sortConfig.key === 'roi' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
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
              {sortedCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">{campaign.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {campaign.media_types.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {MEDIA_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(campaign.start_date)}</div>
                    {campaign.end_date && (
                      <div className="text-xs text-gray-400">עד {formatDate(campaign.end_date)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(campaign.budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      campaign.roi > 0 ? 'text-green-600' : 
                      campaign.roi < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {campaign.roi}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {STATUS_OPTIONS.find(opt => opt.value === campaign.status)?.label || campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="עריכה"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
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

      {/* מודל יצירת/עריכת קמפיין */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {showAddModal ? 'יצירת קמפיין חדש' : 'עריכת קמפיין'}
            </h2>
            
            <CampaignForm
              campaign={selectedCampaign}
              onSubmit={showAddModal ? handleAddCampaign : handleEditCampaign}
              onCancel={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedCampaign(null);
              }}
              availableCoupons={availableCoupons}
              campaignCoupons={campaignCoupons[selectedCampaign?.id || ''] || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSubmit: (campaign: any) => void;
  onCancel: () => void;
  availableCoupons: any[];
  campaignCoupons: CampaignCoupon[];
}

function CampaignForm({
  campaign,
  onSubmit,
  onCancel,
  availableCoupons,
  campaignCoupons
}: CampaignFormProps) {
  const [formData, setFormData] = useState<any>({
    name: campaign?.name || '',
    description: campaign?.description || '',
    start_date: campaign?.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '',
    end_date: campaign?.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
    budget: campaign?.budget || '',
    status: campaign?.status || 'draft',
    media_types: campaign?.media_types || [],
    target_audience: campaign?.target_audience || {},
    metrics: campaign?.metrics || {},
    platform_data: campaign?.platform_data || {},
    is_active: campaign?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שם הקמפיין
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            סטטוס
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border rounded-lg p-2"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תאריך התחלה
          </label>
          <input
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תאריך סיום
          </label>
          <input
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תקציב
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.budget || ''}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            מדיות
          </label>
          <select
            multiple
            value={formData.media_types}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({ ...formData, media_types: values });
            }}
            className="w-full border rounded-lg p-2"
          >
            {MEDIA_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תיאור
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded-lg p-2"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            קהל יעד
          </label>
          <textarea
            value={JSON.stringify(formData.target_audience, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({ ...formData, target_audience: parsed });
              } catch (error) {
                // אם ה-JSON לא תקין, נשמור את הטקסט כמו שהוא
                setFormData({ ...formData, target_audience: e.target.value });
              }
            }}
            className="w-full border rounded-lg p-2 font-mono"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg"
        >
          ביטול
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
          {campaign ? 'שמירת שינויים' : 'יצירת קמפיין'}
        </button>
      </div>
    </form>
  );
} 