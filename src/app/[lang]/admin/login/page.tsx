'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AdminLogin() {
  const params = useParams();
  const lang = (typeof params?.lang === 'string' ? params.lang : 'he') as string;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log('דף התחברות נטען');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('מתחיל תהליך התחברות');
    setError(null);
    
    try {
      setLoading(true);
      console.log('מנסה להתחבר עם:', email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('תוצאת התחברות:', { data, error: signInError });

      if (signInError) {
        throw signInError;
      }

      console.log('התחברות הצליחה, מעביר לדשבורד');
      router.push(`/${lang}/admin/dashboard`);
      
    } catch (err) {
      console.error('שגיאת התחברות:', err);
      setError('שגיאה בהתחברות. אנא בדקו את פרטי ההתחברות שלכם.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            התחברות למערכת הניהול
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            או{' '}
            <Link href={`/${lang}/admin/register`} className="font-medium text-blue-600 hover:text-blue-500">
              הרשמה למערכת
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="mr-3">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">אימייל</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="אימייל"
                dir="rtl"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">סיסמה</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="סיסמה"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 