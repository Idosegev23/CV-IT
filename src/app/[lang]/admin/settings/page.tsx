'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import {
  LinkIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface SocialConnection {
  id: string;
  platform: string;
  account_name: string;
  is_connected: boolean;
  last_sync: string | null;
  username?: string;
  password?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

const PLATFORM_OPTIONS = [
  { 
    id: 'facebook',
    name: 'פייסבוק',
    icon: '/icons/facebook.svg',
    description: 'חיבור לפייסבוק יאפשר פרסום אוטומטי של קמפיינים ומעקב אחר ביצועים'
  },
  {
    id: 'instagram',
    name: 'אינסטגרם',
    icon: '/icons/instagram.svg',
    description: 'חיבור לאינסטגרם יאפשר פרסום אוטומטי של קמפיינים ומעקב אחר ביצועים'
  },
  {
    id: 'linkedin',
    name: 'לינקדאין',
    icon: '/icons/linkedin.svg',
    description: 'חיבור ללינקדאין יאפשר פרסום אוטומטי של קמפיינים ומעקב אחר ביצועים'
  },
  {
    id: 'google',
    name: 'גוגל',
    icon: '/icons/google.svg',
    description: 'חיבור לגוגל יאפשר ניהול קמפיינים בגוגל אדס ומעקב אחר ביצועים'
  },
  {
    id: 'tiktok',
    name: 'טיקטוק',
    icon: '/icons/tiktok.svg',
    description: 'חיבור לטיקטוק יאפשר פרסום אוטומטי של קמפיינים ומעקב אחר ביצועים'
  }
];

export default function SettingsPage({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error('אירעה שגיאה בטעינת החיבורים');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlatform) return;
    
    try {
      const platform = PLATFORM_OPTIONS.find(p => p.id === selectedPlatform);
      if (!platform) return;

      if (!formData.username || !formData.password) {
        toast.error('נא למלא את כל השדות');
        return;
      }

      // שיסיון התחברות לפלטפורמה
      const response = await fetch('/api/social/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'אירעה שגיאה בהתחברות');
      }

      // שמירת פרטי החיבור בדאטהבייס רק אם ההתחברות הצליחה
      const { error } = await supabase
        .from('social_connections')
        .insert([{
          platform: selectedPlatform,
          account_name: formData.username,
          is_connected: true,
          username: formData.username,
          password: formData.password,
          metadata: {
            ...data.accountInfo,
            last_login: new Date().toISOString()
          }
        }]);

      if (error) throw error;

      toast.success('החיבור הושלם בהצלחה');
      setShowConnectModal(false);
      setSelectedPlatform(null);
      setFormData({ username: '', password: '' });
      loadConnections();
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה בתהליך החיבור');
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('האם אתה בטוח שברצונך לנתק חיבור זה?')) return;

    try {
      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      setConnections(prev => prev.filter(c => c.id !== connectionId));
      toast.success('החיבור נותק בהצלחה');
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast.error('אירעה שגיאה בניתוק החיבור');
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) return;

      // כנכרון נתונים מהפלטפורמה
      const response = await fetch('/api/social/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          platform: connection.platform,
          username: connection.username,
          password: connection.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'אירעה שגיאה בסנכרון');
      }

      // עדכון הנתונים בדאטהבייס
      const { error } = await supabase
        .from('social_connections')
        .update({
          last_sync: new Date().toISOString(),
          metadata: {
            ...connection.metadata,
            ...data.platformData,
            last_sync_status: 'success'
          }
        })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('הנתונים סונכרנו בהצלחה');
      loadConnections();
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error(error instanceof Error ? error.message : 'אירעה שגיאה בסנכרון הנתונים');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'לא סונכרן';
    return new Date(date).toLocaleString('he-IL');
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
        <h1 className="text-2xl font-bold">הגדרות חיבורים</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORM_OPTIONS.map((platform) => {
          const connection = connections.find(c => c.platform === platform.id);
          
          return (
            <div
              key={platform.id}
              className="bg-white rounded-lg shadow p-6 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={platform.icon}
                  alt={platform.name}
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="text-lg font-semibold">{platform.name}</h3>
                  {connection && (
                    <p className="text-sm text-gray-500">
                      {connection.account_name}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {platform.description}
              </p>

              <div className="mt-auto">
                {connection ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      מחובר
                    </div>
                    <div className="text-sm text-gray-500">
                      סנכרון אחרון: {formatDate(connection.last_sync)}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSync(connection.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        סנכרון
                      </button>
                      <button
                        onClick={() => handleDisconnect(connection.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                        ניתוק
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                      setShowConnectModal(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <LinkIcon className="h-5 w-5" />
                    חיבור
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* מודל חיבור פלטפורמה */}
      {showConnectModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              חיבור {PLATFORM_OPTIONS.find(p => p.id === selectedPlatform)?.name}
            </h2>
            
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם משתמש
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="הכנס שם משתמש"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סיסמא
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border rounded-lg p-2 pl-10"
                    placeholder="הכנס סיסמא"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 px-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowConnectModal(false);
                    setSelectedPlatform(null);
                    setFormData({ username: '', password: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
                >
                  חיבור
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 