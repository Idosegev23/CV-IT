'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface SortConfig {
  key: keyof CVData;
  direction: 'asc' | 'desc';
}

interface CVData {
  id: string;
  session_id: string;
  content: {
    personal_info: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    file_path?: string;
  };
  language: string;
  status: string;
  package: string;
  created_at: string;
  updated_at: string;
  pdf_url: string | null;
  pdf_filename: string | null;
  format_cv: any;
  en_format_cv: any;
  level: any;
  cv_analyses: any;
  last_generated: any;
  is_editable: boolean;
  error_message?: string;
  cv_info?: any;
  market?: any;
  tags?: string;
}

interface FilterState {
  status: string;
  language: string;
  package: string;
  dateRange: string;
}

export default function CVManagement({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const [cvs, setCvs] = useState<CVData[]>([]);
  const [filteredCvs, setFilteredCvs] = useState<CVData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    language: '',
    package: '',
    dateRange: ''
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadCVs();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [cvs, filters, searchTerm, sortConfig]);

  const loadCVs = async () => {
    try {
      setLoading(true);
      setError(null);

      // בדיקת אימות
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        setError('שגיאת אימות - נא להתחבר מחדש');
        return;
      }

      if (!user) {
        setError('משתמש לא מחובר');
        return;
      }

      // בדיקת הרשאות
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        setError('שגיאה בטעינת פרופיל המשתמש');
        return;
      }

      if (!profile || profile.role !== 'admin') {
        setError('אין הרשאות מתאימות');
        return;
      }

      // טעינת קורות החיים
      const { data, error: cvsError } = await supabase
        .from('cv_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (cvsError) {
        console.error('Error loading CVs:', cvsError);
        setError('שגיאה בטעינת קורות החיים');
        return;
      }

      setCvs(data || []);
      setFilteredCvs(data || []);
    } catch (error) {
      console.error('Error in loadCVs:', error);
      setError('שגיאה לא צפויה');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...cvs];

    // החלת פילטרים
    if (filters.status) {
      filtered = filtered.filter(cv => cv.status === filters.status);
    }
    if (filters.language) {
      filtered = filtered.filter(cv => cv.language === filters.language);
    }
    if (filters.package) {
      filtered = filtered.filter(cv => cv.package === filters.package);
    }
    if (filters.dateRange) {
      const now = new Date();
      const days = parseInt(filters.dateRange);
      const cutoff = new Date(now.setDate(now.getDate() - days));
      filtered = filtered.filter(cv => new Date(cv.created_at) >= cutoff);
    }

    // החלת חיפוש
    if (searchTerm) {
      filtered = filtered.filter(cv => {
        const contentMatch = JSON.stringify(cv.content).toLowerCase().includes(searchTerm.toLowerCase());
        const filenameMatch = cv.pdf_filename ? cv.pdf_filename.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        return contentMatch || filenameMatch;
      });
    }

    // החלת מיון
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = String(a[sortConfig.key] || '');
        const bValue = String(b[sortConfig.key] || '');
        
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    setFilteredCvs(filtered);
  };

  const handleSort = (key: keyof CVData) => {
    setSortConfig((prev): SortConfig => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      return {
        key,
        direction: prev.direction === 'asc' ? 'desc' : 'asc'
      };
    });
  };

  const sortedCvs = [...cvs].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const key = sortConfig.key;
    const direction = sortConfig.direction;
    
    const aValue = String(a[key] || '');
    const bValue = String(b[key] || '');
    
    return direction === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const downloadPDF = async (pdfUrl: string | null, filename: string) => {
    if (!pdfUrl) {
      toast.error('קישור ה-PDF חסר');
      return;
    }

    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('שגיאה בהורדת ה-PDF');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL');
  };

  // פונקציה לניקוי HTML מטקסט
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  // חישוב העמודים
  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCvs.slice(startIndex, endIndex);

  // פונקציה למעבר בין עמודים
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // פונקציה לשינוי מספר הרשומות בעמוד
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // חזרה לעמוד הראשון
  };

  const downloadFile = async (path: string | undefined, filename: string) => {
    if (!path) {
      toast.error('נתיב הקובץ חסר');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('cvs')
        .download(path);

      if (error) {
        throw error;
      }

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('שגיאה בהורדת הקובץ');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול קורות חיים</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            סינון
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="חיפוש..."
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
              <select
                className="w-full border rounded-lg p-2"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">הכל</option>
                <option value="completed">הושלם</option>
                <option value="in_progress">בתהליך</option>
                <option value="failed">נכשל</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שפה</label>
              <select
                className="w-full border rounded-lg p-2"
                value={filters.language}
                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="">הכל</option>
                <option value="he">עברית</option>
                <option value="en">אנגלית</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">חבילה</label>
              <select
                className="w-full border rounded-lg p-2"
                value={filters.package}
                onChange={(e) => setFilters(prev => ({ ...prev, package: e.target.value }))}
              >
                <option value="">הכל</option>
                <option value="basic">בסיסי</option>
                <option value="pro">מקצועי</option>
                <option value="premium">פרימיום</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">טווח תאריכים</label>
              <select
                className="w-full border rounded-lg p-2"
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="">הכל</option>
                <option value="1">24 שעות אחרונות</option>
                <option value="7">7 ימים אחרונים</option>
                <option value="30">30 ימים אחרונים</option>
                <option value="90">90 ימים אחרונים</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  שם מלא
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  אימייל
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  טלפון
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  חבילה
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  שפה
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך יצירה
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((cv) => (
                <tr key={cv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stripHtml(cv.format_cv?.personal_details?.name) || 'לא צוין'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cv.format_cv?.personal_details?.email || 'לא צוין'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cv.format_cv?.personal_details?.phone || 'לא צוין'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cv.package === 'basic' ? 'בסיסי' :
                     cv.package === 'advanced' ? 'מתקדם' : 'פרו'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cv.language === 'he' ? 'עברית' : 'אנגלית'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${cv.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        cv.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {cv.status === 'completed' ? 'הושלם' :
                       cv.status === 'in_progress' ? 'בתהליך' : 'נכשל'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cv.created_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      {/* צפייה בקובץ המקורי */}
                      {cv.content?.file_path && (
                        <button
                          onClick={() => downloadFile(cv.content.file_path, `original_${cv.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          קובץ מקורי
                        </button>
                      )}
                      
                      {/* צפייה ב-PDF */}
                      {cv.pdf_url && (
                        <a
                          href={cv.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          PDF
                        </a>
                      )}
                      
                      {/* הורדת PDF */}
                      {cv.pdf_url && cv.pdf_filename && (
                        <button
                          onClick={() => {
                            if (cv.pdf_url && cv.pdf_filename) {
                              downloadPDF(cv.pdf_url, cv.pdf_filename);
                            }
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          הורדה
                        </button>
                      )}
                      
                      {/* צפייה בפרטים מלאים */}
                      <button
                        onClick={() => {
                          // כאן נוסיף פופאפ או ניווט לדף פרטים מלאים
                          console.log('CV Details:', cv);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        פרטים מלאים
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* חלוקה לעמודים */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 ml-4">
              רשומות בעמוד:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="mr-2 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                מציג {startIndex + 1} עד {Math.min(endIndex, filteredCvs.length)} מתוך {filteredCvs.length} תוצאות
              </span>
            </div>

            <div className="flex gap-2 mr-4">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                ראשון
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                הקודם
              </button>
              
              {/* מספרי העמודים */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } border rounded-md`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                הבא
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                אחרון
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 