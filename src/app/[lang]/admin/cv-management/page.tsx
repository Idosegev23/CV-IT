'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DocumentPlusIcon } from '@heroicons/react/24/outline';

export default function CVManagement() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/he/admin/login');
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול קורות חיים</h1>
        <button
          onClick={() => router.push('/he/admin/cv-management/create')}
          className="flex items-center gap-2 px-4 py-2 bg-[#4856CD] text-white rounded-lg hover:bg-[#3A45C0] transition-colors"
        >
          <DocumentPlusIcon className="h-5 w-5" />
          השלמת תהליך
        </button>
      </div>

      {/* שאר התוכן של הדף */}
    </div>
  );
} 