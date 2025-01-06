'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/theme/ui/button';
import { Card } from '@/components/theme/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ComparisonSection {
  title: string;
  linkedinContent?: string;
  cvContent: string;
  status: 'missing' | 'different' | 'ok';
  action: 'add' | 'update' | 'none';
}

export default function LinkedInCompare() {
  const { toast } = useToast();
  const [sections, setSections] = useState<ComparisonSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const compareProfiles = async () => {
      try {
        // קבלת נתוני פרופיל לינקדאין
        const linkedinResponse = await fetch('/api/linkedin/profile');
        const linkedinData = await linkedinResponse.json();

        // קבלת נתוני קורות חיים
        const cvResponse = await fetch('/api/cv/data');
        const cvData = await cvResponse.json();

        // השוואה והכנת הסקצי��ת
        const comparisonSections: ComparisonSection[] = [
          {
            title: 'תקציר מקצועי',
            linkedinContent: linkedinData.summary,
            cvContent: cvData.professional_summary,
            status: linkedinData.summary ? 'different' : 'missing',
            action: linkedinData.summary ? 'update' : 'add'
          },
          // ... השוואת שאר הסקציות
        ];

        setSections(comparisonSections);
      } catch (error) {
        console.error('Comparison error:', error);
        toast({
          title: 'שגיאה בהשוואת הפרופילים',
          description: 'אנא נסה שוב מאוחר יותר',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    compareProfiles();
  }, []);

  const handleAction = async (section: ComparisonSection) => {
    try {
      const response = await fetch('/api/linkedin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: section.title,
          content: section.cvContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      toast({
        title: 'עודכן בהצלחה',
        description: `${section.title} עודכן בפרופיל הלינקדאין שלך`,
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'שגיאה בעדכון',
        description: 'לא ניתן לעדכן את הפרופיל כרגע',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">משווה את הפרופילים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            השוואת פרופיל LinkedIn לקורות החיים
          </h1>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {section.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        section.status === 'missing' ? 'bg-red-100 text-red-800' :
                        section.status === 'different' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {section.status === 'missing' ? 'חסר' :
                         section.status === 'different' ? 'שונה' :
                         'תקין'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">פרופיל LinkedIn</h3>
                      <div className="bg-gray-50 p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
                        {section.linkedinContent || 'אין תוכן'}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">קורות חיים</h3>
                      <div className="bg-gray-50 p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
                        {section.cvContent}
                      </div>
                    </div>
                  </div>

                  {section.action !== 'none' && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleAction(section)}
                        className="bg-[#0A66C2] hover:bg-[#004182] text-white"
                      >
                        {section.action === 'add' ? 'הוסף לפרופיל' : 'עדכן בפרופיל'}
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 