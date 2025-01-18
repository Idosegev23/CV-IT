'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Copy, ExternalLink } from 'lucide-react';

export default function CreateCV() {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [supabase] = useState(() => createClientComponentClient());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('הקישור הועתק!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId?.trim()) {
      toast.error('נא להזין Session ID');
      return;
    }

    setLoading(true);
    setShowLinks(false);

    try {
      // בדיקה שה-session קיים
      const { data: existingData, error: checkError } = await supabase
        .from('cv_data')
        .select('id, content')
        .eq('session_id', sessionId.trim())
        .maybeSingle();

      if (checkError) {
        console.error('Check error:', checkError);
        toast.error('שגיאה בבדיקת הנתונים');
        return;
      }

      if (!existingData) {
        toast.error('לא נמצאו נתונים עבור session_id זה');
        return;
      }

      if (!existingData.content) {
        toast.error('לא נמצא תוכן לקורות החיים');
        return;
      }

      // עדכון הסטטוס ל-paid
      const { error: updateError } = await supabase
        .from('cv_data')
        .update({ 
          status: 'paid',
          last_updated: new Date().toISOString()
        })
        .eq('session_id', sessionId.trim());

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('שגיאה בעדכון הנתונים');
        return;
      }

      // התחלת תהליך יצירת קורות החיים
      const generateResponse = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: sessionId.trim(),
          lang: 'he'
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to start CV generation');
      }

      setShowLinks(true);
      toast.success('התהליך הושלם בהצלחה!');

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error?.message || 'שגיאה בתהליך');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#EAEAE7] p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEAE7] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-2xl font-bold text-center mb-6">השלמת תהליך יצירת קורות חיים</h1>
          <p className="text-gray-600 text-center mb-8">
            הכלי הזה מאפשר להשלים את תהליך התשלום עבור לקוחות שהתהליך נקטע באמצע
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
              <h2 className="text-xl font-semibold mb-4 text-center">קישור להמשך התהליך</h2>
              
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">קישור ליצירת קורות חיים</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyLink(`${window.location.origin}/he/cv/classic?sessionId=${sessionId}`)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="העתק קישור"
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <a
                      href={`${window.location.origin}/he/cv/classic?sessionId=${sessionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="פתח בחלון חדש"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-600" />
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-500 break-all">{`${window.location.origin}/he/cv/classic?sessionId=${sessionId}`}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 