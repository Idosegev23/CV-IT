'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  TagIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface DashboardStats {
  cvStats: {
    total: number;
    today: number;
    byLanguage: { language: string; count: number }[];
    byPackage: { package: string; count: number }[];
    completionRate: number;
  };
  conversionStats: {
    bounceRate: number;
    averageTime: number;
    conversionRate: number;
    dropoffPoints: { step: string; count: number }[];
  };
  financialStats: {
  totalRevenue: number;
    todayRevenue: number;
    averageOrderValue: number;
    revenueByPackage: { package: string; revenue: number }[];
  };
  couponsStats: {
    totalActive: number;
    totalUsed: number;
    totalExpired: number;
    byType: { type: string; count: number }[];
    byPackage: { package: string; count: number }[];
    usageStats: { date: string; used: number }[];
  };
  campaignStats: {
    active: number;
    totalBudget: number;
    totalROI: number;
    byPlatform: { platform: string; performance: number }[];
  };
  timeSeriesData: {
    cvCreation: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
  };
  aiCosts: {
    totalAiCosts: number;
    totalServerCosts: number;
    averageCostPerCV: number;
    costsByModel: {
      model: string;
      cost: number;
    }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export default function DashboardPage({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    cvStats: {
      total: 0,
      today: 0,
      byLanguage: [],
      byPackage: [],
      completionRate: 0
    },
    conversionStats: {
      bounceRate: 0,
      averageTime: 0,
      conversionRate: 0,
      dropoffPoints: []
    },
    financialStats: {
    totalRevenue: 0,
      todayRevenue: 0,
      averageOrderValue: 0,
      revenueByPackage: []
    },
    couponsStats: {
      totalActive: 0,
      totalUsed: 0,
      totalExpired: 0,
      byType: [],
      byPackage: [],
      usageStats: []
    },
    campaignStats: {
      active: 0,
      totalBudget: 0,
      totalROI: 0,
      byPlatform: []
    },
    timeSeriesData: {
      cvCreation: [],
      revenue: []
    },
    aiCosts: {
      totalAiCosts: 0,
      totalServerCosts: 0,
      averageCostPerCV: 0,
      costsByModel: []
    }
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // בדיקת אימות
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth check:', { user, error: authError });

      if (authError || !user) {
        console.error('Authentication error:', authError);
        toast.error('נא להתחבר מחדש');
        return;
      }

      // בדיקת הרשאות
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('Profile check:', { profile, error: profileError });

      if (profileError || !profile || profile.role !== 'admin') {
        console.error('Authorization error:', profileError);
        toast.error('אין הרשאות מתאימות');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // CV Stats
      const { data: cvData, error: cvError } = await supabase
        .from('cv_data')
        .select('*');

      if (cvError) throw cvError;

      const todayCVs = cvData?.filter(cv => 
        new Date(cv.created_at) >= today
      ).length || 0;

      const byLanguage = cvData?.reduce((acc: any[], cv) => {
        const lang = cv.language || 'unknown';
        const existing = acc.find(item => item.language === lang);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ language: lang, count: 1 });
        }
        return acc;
      }, []) || [];

      const byPackage = cvData?.reduce((acc: any[], cv) => {
        const pkg = cv.package || 'basic';
        const existing = acc.find(item => item.package === pkg);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ package: pkg, count: 1 });
        }
        return acc;
      }, []) || [];

      // Sessions analysis for completion rate
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*');

      const completedSessions = sessionsData?.filter(session => 
        session.status === 'completed'
      ).length || 0;

      const completionRate = sessionsData?.length 
        ? (completedSessions / sessionsData.length) * 100 
        : 0;

      // Coupon Stats
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupons')
        .select('*');

      console.log('Raw Coupons Data:', couponsData);
      console.log('Coupons Error:', couponsError);
      
      if (couponsError) {
        console.error('Error fetching coupons:', couponsError);
        toast.error('שגיאה בטעינת נתוני הקופונים');
      }

      if (!couponsData) {
        console.error('No coupons data received from Supabase');
      }

      const now = new Date();
      
      const couponsStats = {
        totalActive: 0,
        totalUsed: 0,
        totalExpired: 0,
        byType: [] as { type: string; count: number }[],
        byPackage: [] as { package: string; count: number }[],
        usageStats: [] as { date: string; used: number }[]
      };

      // נתוני שימוש בקופונים לפי תאריך (30 ימים אחרונים)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (couponsData) {
        console.log('Processing coupons data...');
        
        couponsData.forEach(coupon => {
          const expiryDate = new Date(coupon.expires_at);
          const isExpired = expiryDate < now;
          const isFullyUsed = coupon.current_uses >= coupon.max_uses;
          
          if (!isExpired && coupon.is_active && !isFullyUsed) {
            couponsStats.totalActive++;
          }
          
          if (isFullyUsed) {
            couponsStats.totalUsed++;
          }
          
          if (isExpired) {
            couponsStats.totalExpired++;
          }

          // קיבוץ לפי סוג הנחה
          const typeIndex = couponsStats.byType.findIndex(t => t.type === coupon.discount_type);
          if (typeIndex === -1) {
            couponsStats.byType.push({ 
              type: coupon.discount_type === 'percentage' ? 'אחוזים' : 'סכום קבוע', 
              count: 1 
            });
          } else {
            couponsStats.byType[typeIndex].count++;
          }

          // קיבוץ לפי סוג חבילה
          if (coupon.package_type) {
            const packageIndex = couponsStats.byPackage.findIndex(p => p.package === coupon.package_type);
            if (packageIndex === -1) {
              couponsStats.byPackage.push({ 
                package: coupon.package_type === 'basic' ? 'בסיסי' : 'מתקדם', 
                count: 1 
              });
            } else {
              couponsStats.byPackage[packageIndex].count++;
            }
          }
        });
      }

      // AI Costs Analysis
      const { data: cvWithAiData } = await supabase
        .from('cv_data')
        .select(`
          id,
          created_at,
          cv_analyses,
          package,
          language
        `);

      // חישוב עלויות AI
      let totalAiCosts = 0;
      let totalCVs = 0;
      const aiCostsByModel = new Map();
      const serverCosts = {
        storagePerCV: 0.001, // עלות אחסון לקורות חיים (בדולרים)
        deploymentDaily: 10, // עלות פריסה יומית (בדולרים)
        bandwidthPerCV: 0.0005 // עלות תעבורה לקורות חיים (בדולרים)
      };

      if (cvWithAiData) {
        cvWithAiData.forEach(cv => {
          totalCVs++;
          
          // חישוב עלויות AI
          if (cv.cv_analyses) {
            Object.entries(cv.cv_analyses).forEach(([model, usage]: [string, any]) => {
              // עלות לפי מודל
              let modelCost = 0;
              switch (model) {
                case 'gpt-4':
                  modelCost = usage.tokens * 0.00003; // $0.03 per 1K tokens
                  break;
                case 'gpt-3.5-turbo':
                  modelCost = usage.tokens * 0.000002; // $0.002 per 1K tokens
                  break;
                case 'text-embedding-ada-002':
                  modelCost = usage.tokens * 0.0000004; // $0.0004 per 1K tokens
                  break;
              }
              
              totalAiCosts += modelCost;
              aiCostsByModel.set(model, (aiCostsByModel.get(model) || 0) + modelCost);
            });
          }
        });
      }

      // חישוב עלויות כוללות
      const totalDays = 30; // נניח שמחשבים ל-30 יום
      const totalServerCosts = totalDays * serverCosts.deploymentDaily + 
                             totalCVs * (serverCosts.storagePerCV + serverCosts.bandwidthPerCV);
      
      const averageCostPerCV = totalCVs > 0 ? 
        (totalAiCosts + totalServerCosts) / totalCVs : 0;

      console.log('AI Costs Analysis:', {
        totalAiCosts,
        totalServerCosts,
        averageCostPerCV,
        aiCostsByModel: Object.fromEntries(aiCostsByModel),
        totalCVs
      });

      // Campaign Stats
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true);

      const campaignStats = {
        active: campaignsData?.length || 0,
        totalBudget: campaignsData?.reduce((sum, campaign) => sum + (campaign.budget || 0), 0) || 0,
        totalROI: campaignsData?.reduce((sum, campaign) => sum + (campaign.roi || 0), 0) || 0,
        byPlatform: [] as { platform: string; performance: number }[]
      };

      // Time series data for the last 30 days
      const cvTimeData = cvData
        ?.filter(cv => new Date(cv.created_at) >= thirtyDaysAgo)
        .reduce((acc: any[], cv) => {
          const date = new Date(cv.created_at).toLocaleDateString('he-IL');
          const existing = acc.find(item => item.date === date);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ date, count: 1 });
          }
          return acc;
        }, []) || [];

      setStats({
        cvStats: {
          total: cvData?.length || 0,
          today: todayCVs,
          byLanguage,
          byPackage,
          completionRate
        },
        conversionStats: {
          bounceRate: 0, // Calculate from sessions data
          averageTime: 0, // Calculate from sessions data
          conversionRate: 0, // Calculate from sessions data
          dropoffPoints: [] // Calculate from sessions data
        },
        financialStats: {
          totalRevenue: 0, // Calculate from payments data when available
          todayRevenue: 0,
          averageOrderValue: 0,
          revenueByPackage: []
        },
        couponsStats,
        campaignStats,
        timeSeriesData: {
          cvCreation: cvTimeData,
          revenue: []
        },
        aiCosts: {
          totalAiCosts,
          totalServerCosts,
          averageCostPerCV,
          costsByModel: Array.from(aiCostsByModel.entries()).map(([model, cost]) => ({
            model,
            cost
          }))
        }
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('אירעה שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    // המרה לשקלים (שער 3.7)
    const amountInILS = amount * 3.7;
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amountInILS);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const CostAnalysis = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">עלויות ממוצעות</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* חבילה בסיסית */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">חבילה בסיסית (75₪)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>עלות AI:</span>
                <span>₪0.78</span>
              </div>
              <div className="flex justify-between">
                <span>עלות שרת:</span>
                <span>₪1.85</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span>סה"כ עלות:</span>
                <span>₪2.63</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>רווח ממוצע:</span>
                <span>₪66.60</span>
              </div>
            </div>
          </div>

          {/* חבילה מתקדמת */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">חבילה מתקדמת (85₪)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>עלות AI:</span>
                <span>₪0.78</span>
              </div>
              <div className="flex justify-between">
                <span>עלות שרת:</span>
                <span>₪1.85</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span>סה"כ עלות:</span>
                <span>₪2.63</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>רווח ממוצע:</span>
                <span>₪77.70</span>
              </div>
            </div>
          </div>

          {/* חבילת Pro */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">חבילת Pro (95₪)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>עלות AI:</span>
                <span>₪1.22</span>
              </div>
              <div className="flex justify-between">
                <span>עלות שרת:</span>
                <span>₪1.85</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span>סה"כ עלות:</span>
                <span>₪3.07</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>רווח ממוצע:</span>
                <span>₪85.10</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          * כל המחירים מוצגים בשקלים
          <br />
          * הרווח הממוצע כולל הנחות של 20% בממוצע
          <br />
          * העלויות כוללות שימוש ב-Claude-3, GPT-4, ועלויות שרת
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold">דשבורד</h1>
        <button
          onClick={() => loadDashboardStats()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          רענן נתונים
        </button>
      </div>

      {/* קופסאות סטטיסטיקה */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* קורות חיים */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">קורות חיים</p>
              <h3 className="text-2xl font-bold">{stats.cvStats.total}</h3>
              <p className="text-sm text-green-600 mt-1">
                +{stats.cvStats.today} היום
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2"
                style={{ width: `${stats.cvStats.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {formatPercentage(stats.cvStats.completionRate)} שיעור השלמה
            </p>
          </div>
        </div>

        {/* הכנסות */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">הכנסות</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(stats.financialStats.totalRevenue)}
              </h3>
              <p className="text-sm text-green-600 mt-1">
                {formatCurrency(stats.financialStats.todayRevenue)} היום
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-600">
              ממוצע להזמנה: {formatCurrency(stats.financialStats.averageOrderValue)}
            </p>
          </div>
        </div>

        {/* קופונים */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">קופונים פעילים</p>
              <h3 className="text-2xl font-bold">{stats.couponsStats.totalActive}</h3>
              <p className="text-sm text-gray-600 mt-1">
                נוצלו: {stats.couponsStats.totalUsed}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-600">
              פגי תוקף: {stats.couponsStats.totalExpired}
            </p>
          </div>
        </div>

        {/* קמפיינים */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">קמפיינים פעילים</p>
              <h3 className="text-2xl font-bold">{stats.campaignStats.active}</h3>
              <p className="text-sm text-gray-600 mt-1">
                ROI: {formatPercentage(stats.campaignStats.totalROI)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-600">
              תקציב: {formatCurrency(stats.campaignStats.totalBudget)}
            </p>
          </div>
        </div>
      </div>

      {/* גלויות AI */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <CostAnalysis />
      </div>

      {/* גרפים */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* גרף קורות חיים לאורך זמן */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">קורות חיים שנוצרו</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timeSeriesData.cvCreation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* גרף הכנסות */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">הכנסות לאורך זמן</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timeSeriesData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* התפלגות שפות */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">התפלגות שפות</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.cvStats.byLanguage}
                  dataKey="count"
                  nameKey="language"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.cvStats.byLanguage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* התפלגות חבילות */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">התפלגות חבילות</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.cvStats.byPackage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="package" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {stats.cvStats.byPackage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* נתוני המרה ונטישה */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">נקודות נטישה</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.conversionStats.dropoffPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
                </div>
              </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">ביצועי קופונים</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.couponsStats.usageStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="used"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 