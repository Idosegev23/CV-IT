import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import Lottie from 'lottie-react';
import successAnimation from '@/assets/animations/success.json';

export const CompletionScreen = ({ lang }: { lang: 'he' | 'en' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-20 h-20 mb-6">
        <Lottie 
          animationData={successAnimation}
          loop={false}
        />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-4">
        {lang === 'he' 
          ? 'מעולה! סיימנו למלא את כל הפרטים' 
          : 'Great! We have completed all the details'}
      </h2>
      
      <p className="text-muted-foreground mb-8">
        {lang === 'he'
          ? 'כל הנתונים נשמרו בהצלחה. אתה מוכן ליצור את קורות החיים שלך!'
          : 'All data has been saved successfully. You are ready to create your CV!'}
      </p>
      
      <Link 
        href={`/${lang}/payment`}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground
                 px-8 py-4 rounded-xl font-medium
                 transform transition-all duration-200
                 hover:scale-105 hover:shadow-xl
                 active:scale-100"
      >
        {lang === 'he' ? (
          <>
            צור קורות חיים מקצועיים
            <FileText className="w-5 h-5" />
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            Create Professional CV
          </>
        )}
      </Link>
    </motion.div>
  );
}; 