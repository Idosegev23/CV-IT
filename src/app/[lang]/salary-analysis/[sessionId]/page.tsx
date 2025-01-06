'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getDictionary } from '@/dictionaries';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SalaryAnalysis {
  minSalary: number;
  maxSalary: number;
  averageSalary: number;
  factors: {
    title: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  marketDemand: 'high' | 'medium' | 'low';
  recommendations: string[];
  personalNote?: string;
}

const CoinLoader = () => {
  const coins = Array(5).fill(0);
  return (
    <div className="relative w-32 h-32">
      {coins.map((_, index) => (
        <motion.div
          key={index}
          className="absolute left-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-2xl font-bold text-yellow-700 shadow-lg"
          initial={{ 
            y: -100,
            x: -24,
            rotate: 0,
            opacity: 0 
          }}
          animate={{ 
            y: [null, 100],
            x: [-24 + (index - 2) * 10, -24 + (index - 2) * 20],
            rotate: [0, 360],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.2,
            times: [0, 0.4, 0.8, 1],
            ease: "easeIn"
          }}
        >
          ₪
        </motion.div>
      ))}
      <motion.div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default function SalaryAnalysisPage() {
  const params = useParams();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  const sessionId = params?.sessionId as string;
  const isRTL = lang === 'he';
  
  const [dictionary, setDictionary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<SalaryAnalysis | null>(null);
  const [displayedSalary, setDisplayedSalary] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const supabase = createClientComponentClient();

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isRTL ? 20 : -20 },
    visible: { opacity: 1, x: 0 }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const dict = await getDictionary(lang);
        setDictionary(dict);

        const { data: cvData, error } = await supabase
          .from('cv_data')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error) throw error;

        setUserName(cvData.first_name || '');

        const response = await fetch('/api/analyze-salary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cvData }),
        });

        if (!response.ok) throw new Error('Failed to analyze salary');

        const analysisData = await response.json();
        setAnalysis(analysisData);
        
        // התחל אנימציה של המספרים
        const startCounting = async () => {
          setShowResults(true);
          const duration = 2500; // 2.5 seconds
          const steps = 60;
          const increment = analysisData.averageSalary / steps;
          
          for (let i = 0; i <= steps; i++) {
            await new Promise(resolve => setTimeout(resolve, duration / steps));
            setDisplayedSalary(Math.round(increment * i));
          }
          
          // הפעל קונפטי כשמגיעים לסכום הסופי
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#4856CD', '#22C55E', '#6B7280']
          });
        };

        setTimeout(startCounting, 1000);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(
          isRTL 
            ? 'שגיאה בטעינת הנתונים' 
            : 'Error loading data'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lang, sessionId, supabase]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'he' ? 'he-IL' : 'en-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generatePDF = async () => {
    if (!resultRef.current) return;
    
    setIsPdfGenerating(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // הוספת לוגו
      const logoImg = document.createElement('img');
      logoImg.src = '/Wlogo.svg';
      await new Promise((resolve) => {
        logoImg.onload = resolve;
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      pdf.addImage(
        imgData,
        'PNG',
        0,
        30,
        imgWidth * ratio,
        imgHeight * ratio
      );
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'salary-analysis.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(isRTL ? 'שגיאה ביצירת ה-PDF' : 'Error generating PDF');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const shareAnalysis = async () => {
    if (!resultRef.current) return;
    
    setIsPdfGenerating(true);
    try {
      // יצירת תמונה מה-DOM
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true,
        backgroundColor: '#FFFFFF'
      });
      
      // המרה ל-Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png', 1.0);
      });

      // יצירת קובץ לשיתוף
      const file = new File([blob], 'salary-analysis.png', { type: 'image/png' });

      // בדיקה אם Web Share API זמין עם תמיכה בקבצים
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: isRTL ? 'הערך שלי בשוק העבודה' : 'My Market Value',
            text: `${isRTL ? 'השווי שלי בשוק העבודה הוא' : 'My market value is'} ${formatCurrency(analysis?.averageSalary || 0)}`
          });
        } catch (shareError) {
          console.error('Share failed:', shareError);
          // אם השיתוף נכשל, ננסה לשתף רק טקסט
          await navigator.share({
            title: isRTL ? 'הערך שלי בשוק העבודה' : 'My Market Value',
            text: `${isRTL ? 'השווי שלי בשוק העבודה הוא' : 'My market value is'} ${formatCurrency(analysis?.averageSalary || 0)}`,
          });
        }
      } else {
        // אם Web Share API לא זמין או לא תומך בקבצים
        // ננסה להשתמש ב-Clipboard API
        try {
          const clipboardItems = [
            new ClipboardItem({
              [file.type]: blob
            })
          ];
          await navigator.clipboard.write(clipboardItems);
          toast.success(
            isRTL 
              ? 'התמונה הועתקה ללוח. עכשיו אפשר להדביק אותה בכל מקום' 
              : 'Image copied to clipboard. You can now paste it anywhere'
          );
        } catch (clipboardError) {
          // אם גם זה לא עובד, נאפשר הורדה
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'salary-analysis.png';
          link.click();
          URL.revokeObjectURL(url);
          toast.success(
            isRTL 
              ? 'התמונה הורדה בהצלחה' 
              : 'Image downloaded successfully'
          );
        }
      }
    } catch (error) {
      console.error('Error sharing analysis:', error);
      toast.error(
        isRTL 
          ? 'שגיאה בשיתוף הניתוח' 
          : 'Error sharing analysis'
      );
    } finally {
      setIsPdfGenerating(false);
    }
  };

  if (!dictionary) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F5]">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            className="flex justify-center mb-8"
            variants={variants}
            whileHover="hover"
          >
            <Image
              src="/Wlogo.svg"
              alt="CVIT Logo"
              width={120}
              height={40}
              className="h-auto"
            />
          </motion.div>

          {loading ? (
            <motion.div 
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
              variants={variants}
            >
              <CoinLoader />
              <motion.div className="text-center space-y-2">
                <motion.p 
                  className="text-2xl font-medium text-gray-800"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isRTL 
                    ? `${userName}, אנחנו מחשבים את הערך שלך בשוק` 
                    : `${userName}, we're calculating your market value`}
                </motion.p>
                <motion.p
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {isRTL 
                    ? 'מנתחים נתונים ומגמות שוק...'
                    : 'Analyzing data and market trends...'}
                </motion.p>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              <motion.div 
                ref={resultRef}
                variants={variants}
                whileHover="hover"
                className="bg-white rounded-3xl shadow-lg p-6 md:p-12 text-center relative overflow-hidden"
              >
                <motion.div
                  className="absolute top-0 left-0 w-full h-2"
                  initial={{ background: "linear-gradient(to right, #4856CD, #22C55E, #4856CD)", backgroundSize: "200% 100%" }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                <motion.div
                  variants={variants}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    {isRTL 
                      ? `${userName}, הנה הערך שלך בשוק העבודה` 
                      : `${userName}, Here's Your Market Value`}
                  </h1>
                  <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                    {isRTL 
                      ? 'הערכת השכר מבוססת על ניתוח מעמיק של הניסיון, הכישורים והידע שלך' 
                      : 'Salary estimation based on deep analysis of your experience, skills, and expertise'}
                  </p>

                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        variants={variants}
                        initial="hidden"
                        animate="visible"
                        className="mb-8"
                      >
                        <motion.div 
                          className="text-6xl font-bold text-[#4856CD] mb-4 tracking-tight"
                          variants={pulseVariants}
                          initial="initial"
                          animate="pulse"
                        >
                          {formatCurrency(displayedSalary)}
                        </motion.div>
                        <p className="text-lg text-gray-500 mb-2">
                          {isRTL ? 'שכר חודשי ממוצע (ברוטו)' : 'Average Monthly Salary (Gross)'}
                        </p>
                        <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
                          <span>{formatCurrency(analysis?.minSalary || 0)}</span>
                          <div className="w-16 h-1 bg-gray-200 rounded-full" />
                          <span>{formatCurrency(analysis?.maxSalary || 0)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-4">
                          {isRTL 
                            ? '* ההערכה מבוססת על נתוני שוק העבודה העדכניים ביותר' 
                            : '* Estimation based on latest market data'}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {analysis && showResults && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <motion.div
                      variants={variants}
                      whileHover="hover"
                      className="bg-white rounded-2xl shadow-lg p-8"
                    >
                      <h2 className="text-2xl font-semibold mb-6">
                        {isRTL ? 'גורמים משפיעים' : 'Impact Factors'}
                      </h2>
                      <motion.div 
                        className="space-y-6"
                        variants={containerVariants}
                      >
                        {analysis.factors.map((factor, index) => (
                          <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-start space-x-4 rtl:space-x-reverse"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              factor.impact === 'positive' && "bg-green-100",
                              factor.impact === 'negative' && "bg-red-100",
                              factor.impact === 'neutral' && "bg-gray-100"
                            )}>
                              <Image
                                src={`/design/${factor.impact}.svg`}
                                alt={factor.impact}
                                width={24}
                                height={24}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg text-gray-800">
                                {factor.title}
                              </h3>
                              <p className="text-gray-600">
                                {factor.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>

                    <motion.div
                      variants={variants}
                      whileHover="hover"
                      className="bg-white rounded-2xl shadow-lg p-8"
                    >
                      <h2 className="text-2xl font-semibold mb-6">
                        {isRTL ? 'המלצות אישיות' : 'Personal Recommendations'}
                      </h2>
                      <motion.div 
                        className="space-y-4"
                        variants={containerVariants}
                      >
                        {analysis.recommendations.map((recommendation, index) => (
                          <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-start space-x-3 rtl:space-x-reverse bg-gray-50 rounded-xl p-4"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#4856CD] text-white flex items-center justify-center flex-shrink-0 text-sm">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {recommendation}
                            </p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </div>

                  {analysis.personalNote && (
                    <motion.div
                      variants={variants}
                      whileHover="hover"
                      className="bg-[#4856CD] text-white rounded-2xl shadow-lg p-8 text-center"
                    >
                      <motion.p 
                        className="text-lg"
                        variants={pulseVariants}
                        initial="initial"
                        animate="pulse"
                      >
                        {analysis.personalNote}
                      </motion.p>
                    </motion.div>
                  )}

                  <motion.div
                    variants={containerVariants}
                    className="flex flex-col gap-4 justify-center mt-8 fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg md:relative md:bg-transparent md:shadow-none md:flex-row md:p-0"
                  >
                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareAnalysis}
                      disabled={isPdfGenerating}
                      className="bg-[#4856CD] hover:bg-[#3A45B0] text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                      {isPdfGenerating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                        </svg>
                      )}
                      {isRTL ? 'שתף תוצאות' : 'Share Results'}
                    </motion.button>

                    <motion.a
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`/${lang}/finish/${sessionId}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                      </svg>
                      {isRTL ? 'חזרה להטבות' : 'Back to Benefits'}
                    </motion.a>
                  </motion.div>

                  {/* הערה למשתמשי מובייל */}
                  <motion.div 
                    variants={variants}
                    className="block md:hidden text-center text-sm text-gray-500 mt-20"
                  >
                    {isRTL 
                      ? 'לעריכת קורות החיים מומלץ להשתמש במחשב נייח'
                      : 'For CV editing, it is recommended to use a desktop computer'}
                  </motion.div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 