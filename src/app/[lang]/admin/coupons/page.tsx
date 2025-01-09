'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TagIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free_package';
  discount_value: number;
  package_type?: 'basic' | 'advanced' | 'pro';
  max_uses: number;
  current_uses: number;
  starts_at?: string;
  expires_at: string;
  campaign_id?: string;
  is_active: boolean;
  created_at: string;
}

interface NewCoupon extends Omit<Coupon, 'id' | 'created_at' | 'current_uses'> {
  id?: string;
  created_at?: string;
  current_uses?: number;
}

interface SortConfig {
  key: keyof Coupon;
  direction: 'asc' | 'desc';
}

export default function CouponsManagement({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [newCoupon, setNewCoupon] = useState<NewCoupon>({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    max_uses: 1000,
    is_active: true,
    expires_at: ''
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [couponsResponse, campaignsResponse] = await Promise.all([
        supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('campaigns')
          .select('*')
          .order('start_date', { ascending: false }),
      ]);

      if (couponsResponse.error) throw couponsResponse.error;
      if (campaignsResponse.error) throw campaignsResponse.error;

      setCoupons(couponsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCouponField = (field: keyof Coupon, value: any) => {
    if (!selectedCoupon) return;
    
    setSelectedCoupon({
      ...selectedCoupon,
      [field]: value
    });
  };

  const handleSort = (key: keyof Coupon) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedCoupons = [...coupons].sort((a, b) => {
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

  const handleAddCoupon = async () => {
    try {
      if (!newCoupon.code || !newCoupon.discount_type || !newCoupon.expires_at) {
        toast.error('נא למלא את כל השדות החובה');
        return;
      }

      if (newCoupon.discount_type === 'free_package' && !newCoupon.package_type) {
        toast.error('נא לבחור חבילה');
        return;
      }

      const { data, error } = await supabase
        .from('coupons')
        .insert([{
          ...newCoupon,
          created_at: new Date().toISOString(),
          starts_at: new Date().toISOString(),
          current_uses: 0,
        }])
        .select()
        .single();

      if (error) throw error;

      setCoupons(prev => [data, ...prev]);
      setShowAddModal(false);
      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        max_uses: 1000,
        is_active: true,
        expires_at: '',
      });
      toast.success('הקופון נוצר בהצלחה');
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast.error('אירעה שגיאה ביצירת הקופון');
    }
  };

  const handleEditCoupon = async () => {
    try {
      if (!selectedCoupon) return;

      const { error } = await supabase
        .from('coupons')
        .update(selectedCoupon)
        .eq('id', selectedCoupon.id);

      if (error) throw error;

      setCoupons(prev => prev.map(coupon => 
        coupon.id === selectedCoupon.id ? selectedCoupon : coupon
      ));
      setShowEditModal(false);
      setSelectedCoupon(null);
      toast.success('הקופון עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('אירעה שגיאה בעדכון הקופון');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCoupons(prev => prev.filter(coupon => coupon.id !== id));
      toast.success('הקופון נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('אירעה שגיאה במחיקת הקופון');
    }
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
        <h1 className="text-2xl font-bold">ניהול קופונים</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          קופון חדש
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
                    onClick={() => handleSort('code')}
                  >
                    קוד
                    {sortConfig.key === 'code' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סוג הנחה
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ערך
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  חבילה
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort('current_uses')}
                  >
                    שימושים
                    {sortConfig.key === 'current_uses' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => handleSort('expires_at')}
                  >
                    תוקף
                    {sortConfig.key === 'expires_at' && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פטטוס
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-blue-500" />
                      {coupon.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.discount_type === 'percentage' ? 'אחוזים' :
                      coupon.discount_type === 'fixed' ? 'סכום קבוע' : 'חבילה חינם'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` :
                      coupon.discount_type === 'fixed' ? `₪${coupon.discount_value}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.package_type ? (
                      coupon.package_type === 'basic' ? 'בסיסי' :
                      coupon.package_type === 'advanced' ? 'מתקדם' : 'פרו'
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                      {coupon.current_uses}/{coupon.max_uses}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      {new Date(coupon.expires_at).toLocaleDateString('he-IL')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {coupon.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedCoupon(coupon);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-900"
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

      {/* מודל יצירת קופון */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">יצירת קופון חדש</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  קוד קופון
                </label>
                <input
                  type="text"
                  value={newCoupon.code || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                  placeholder="הזן קוד קופון"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סוג הנחה
                </label>
                <select
                  value={newCoupon.discount_type || 'percentage'}
                  onChange={(e) => setNewCoupon(prev => ({ 
                    ...prev, 
                    discount_type: e.target.value as 'percentage' | 'fixed' | 'free_package',
                    discount_value: e.target.value === 'free_package' ? 100 : prev.discount_value,
                    package_type: e.target.value === 'free_package' ? 'basic' : undefined
                  }))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="percentage">אחוזים</option>
                  <option value="fixed">מחיר קבוע</option>
                  <option value="free_package">חבילה חינם</option>
                </select>
              </div>

              {(newCoupon.discount_type === 'percentage' || newCoupon.discount_type === 'fixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newCoupon.discount_type === 'percentage' ? 'אחוז הנחה' : 'מחיר קבוע (₪)'}
                  </label>
                  <input
                    type="number"
                    value={newCoupon.discount_value || 0}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                    className="w-full border rounded-lg p-2"
                    min="0"
                    max={newCoupon.discount_type === 'percentage' ? "100" : undefined}
                    step={newCoupon.discount_type === 'fixed' ? "0.1" : "1"}
                  />
                </div>
              )}

              {newCoupon.discount_type === 'free_package' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    חבילה
                  </label>
                  <select
                    value={newCoupon.package_type || 'basic'}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, package_type: e.target.value as 'basic' | 'advanced' | 'pro' }))}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="basic">בסיסי (75₪)</option>
                    <option value="advanced">מתקדם (85₪)</option>
                    <option value="pro">פרו (95₪)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר שימושים מקסימלי
                </label>
                <input
                  type="number"
                  value={newCoupon.max_uses || 1000}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, max_uses: Number(e.target.value) }))}
                  className="w-full border rounded-lg p-2"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך תפוגה
                </label>
                <input
                  type="datetime-local"
                  value={newCoupon.expires_at || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
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
                onClick={handleAddCoupon}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                יצירת קופון
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מודל עריכת קופון */}
      {showEditModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">עריכת קופון</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  קוד קופון
                </label>
                <input
                  type="text"
                  value={selectedCoupon.code}
                  onChange={(e) => handleEditCouponField('code', e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סוג הנחה
                </label>
                <select
                  value={selectedCoupon.discount_type}
                  onChange={(e) => handleEditCouponField('discount_type', e.target.value as 'percentage' | 'fixed' | 'free_package')}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="percentage">אחוזים</option>
                  <option value="fixed">מחיר קבוע</option>
                  <option value="free_package">חבילה חינם</option>
                </select>
              </div>

              {(selectedCoupon.discount_type === 'percentage' || selectedCoupon.discount_type === 'fixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedCoupon.discount_type === 'percentage' ? 'אחוז הנחה' : 'מחיר קבוע (₪)'}
                  </label>
                  <input
                    type="number"
                    value={selectedCoupon.discount_value}
                    onChange={(e) => handleEditCouponField('discount_value', Number(e.target.value))}
                    className="w-full border rounded-lg p-2"
                    min="0"
                    max={selectedCoupon.discount_type === 'percentage' ? "100" : undefined}
                    step={selectedCoupon.discount_type === 'fixed' ? "0.1" : "1"}
                  />
                </div>
              )}

              {selectedCoupon.discount_type === 'free_package' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    חבילה
                  </label>
                  <select
                    value={selectedCoupon.package_type}
                    onChange={(e) => handleEditCouponField('package_type', e.target.value as 'basic' | 'advanced' | 'pro')}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="basic">בסיסי (75₪)</option>
                    <option value="advanced">מתקדם (85₪)</option>
                    <option value="pro">פרו (95₪)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר שימושים מקסימלי
                </label>
                <input
                  type="number"
                  value={selectedCoupon.max_uses}
                  onChange={(e) => handleEditCouponField('max_uses', Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך תפוגה
                </label>
                <input
                  type="datetime-local"
                  value={selectedCoupon.expires_at}
                  onChange={(e) => handleEditCouponField('expires_at', e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCoupon.is_active}
                    onChange={(e) => handleEditCouponField('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">קופון פעיל</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCoupon(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg"
              >
                ביטול
              </button>
              <button
                onClick={handleEditCoupon}
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