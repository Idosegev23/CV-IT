'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { FileText, Zap, Globe, Clock } from 'lucide-react';

const content = {
  he: {
    mainTitle: "אודות",
    mainDescription: `CVIT היא הפלטפורמה החדשה שתיקח את קורות החיים שלכם לרמה הבאה.

    שלושה יזמים צעירים פיתחו את המערכת הזו, שתוך פחות מ-24 שעות, ובעלות מינימלית, תספק לכם קורות חיים בעברית ובאנגלית מותאמים אישית.
    
    אנחנו כאן כדי להפוך את התהליך לפשוט, מהיר ומדויק – כל מה שנשאר לכם זה להתכונן לשלב הבא בקריירה.`,
    
    featuresTitle: "למה CV-IT?",
    featuresSubtitle: "הדרך המקצועית ליצור קורות חיים שמתבלטים",
    features: [
      {
        icon: FileText,
        title: "תבניות מקצועיות",
        description: "מגוון תבניות מעוצבות בקפידה שיעזרו לך להתבלט"
      },
      {
        icon: Zap,
        title: "קל לשימוש",
        description: "ממשק פשוט ואינטואיטיבי שיאפשר לך ליצור קורות חיים בדקות"
      },
      {
        icon: Globe,
        title: "תמיכה בשפות",
        description: "יצירת קורות חיים בעברית ובאנגלית בקלות"
      },
      {
        icon: Clock,
        title: "חיסכון בזמן",
        description: "כלים חכמים שיחסכו לך זמן יקר בתהליך היצירה"
      }
    ]
  },
  en: {
    mainTitle: "About Us",
    mainDescription: `CVIT is the new platform that will take your resume to the next level.

    Three young entrepreneurs developed this system, which in less than 24 hours, at minimal cost, will provide you with personalized resumes in both Hebrew and English.
    
    We're here to make the process simple, fast, and precise - all you need to do is prepare for the next step in your career.`,
    
    featuresTitle: "Why CV-IT?",
    featuresSubtitle: "The professional way to create standout resumes",
    features: [
      {
        icon: FileText,
        title: "Professional Templates",
        description: "Carefully designed templates that help you stand out"
      },
      {
        icon: Zap,
        title: "Easy to Use",
        description: "Simple and intuitive interface to create resumes in minutes"
      },
      {
        icon: Globe,
        title: "Language Support",
        description: "Create resumes in Hebrew and English easily"
      },
      {
        icon: Clock,
        title: "Time Saving",
        description: "Smart tools that save you valuable time in the creation process"
      }
    ]
  }
};

export default function AboutSection() {
  const { language } = useLanguage();
  const currentContent = content[language as keyof typeof content];
  const isRTL = language === 'he';

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-[100px] -top-48 -right-48" />
        <div className="absolute w-[400px] h-[400px] bg-teal-500/5 rounded-full filter blur-[100px] bottom-0 left-0" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Main About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-32"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text mb-12">
            {currentContent.mainTitle}
          </h2>
          
          <div className={`prose prose-lg prose-invert mx-auto ${isRTL ? 'rtl' : 'ltr'}`}>
            {currentContent.mainDescription.split('\n\n').map((paragraph, index) => (
              <p 
                key={index} 
                className={`text-white/60 text-lg md:text-xl leading-relaxed mb-6 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text mb-6">
            {currentContent.featuresTitle}
          </h2>
          <p className="text-xl md:text-2xl text-white/60">
            {currentContent.featuresSubtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${isRTL ? 'rtl' : 'ltr'}`}>
          {currentContent.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
              <div className="absolute inset-0 bg-white/5 rounded-2xl transition-colors group-hover:bg-white/10" />
              <div className="relative p-8">
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/60">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 