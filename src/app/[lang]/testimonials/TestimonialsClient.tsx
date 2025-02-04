'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TestimonialsClientProps {
  lang: string;
}

const testimonials = {
  he: [
    {
      name: "עדי לוי",
      role: "מנהלת משאבי אנוש",
      text: "תודה רבה על השירות המעולה! הצלחתי לעדכן את קורות החיים שלי בקלות ובמהירות. התבנית המקצועית והעיצוב הנקי ממש שדרגו את המסמך",
      image: "/design/1.svg",
      alt: "איור של עדי לוי"
    },
    {
      name: "יוסי כהן",
      role: "מהנדס תעשייה וניהול",
      text: "אחרי 7 שנים באותו מקום עבודה, התקשיתי לארגן את כל הניסיון שצברתי בצורה ברורה. האתר עזר לי להציג את היכולות שלי בצורה מסודרת ומקצועית",
      image: "/design/2.svg",
      alt: "איור של יוסי כהן"
    },
    {
      name: "מיכל ברק",
      role: "מעצבת UX/UI",
      text: "חיפשתי פורמט שיאפשר לי להציג את התיק עבודות שלי בצורה יצירתית אבל עדיין מקצועית. התבנית שבחרתי פה בדיוק ענתה על הצורך. תוך יומיים כבר קיבלתי הזמנה לראיון!",
      image: "/design/3.svg",
      alt: "איור של מיכל ברק"
    },
    {
      name: "אלכס ויסמן",
      role: "מפתח Full Stack",
      text: "העברית שלי לא מושלמת, והאתר ממש עזר לי לנסח את קורות החיים בצורה מקצועית. האפשרות לתרגום לאנגלית הייתה בונוס משמעותי",
      image: "/design/3.svg",
      alt: "איור של אלכס ויסמן"
    },
    {
      name: "שירה אברהמי",
      role: "מנהלת שיווק דיגיטלי",
      text: "הייתי צריכה לעדכן את קורות החיים שלי בדחיפות לקראת ראיון. התהליך היה פשוט וקל, והתוצאה הסופית נראית ממש מרשימה. ממליצה בחום!",
      image: "/design/AboutPic.svg",
      alt: "איור של שירה אברהמי"
    },
    {
      name: "דניאל ברקוביץ'",
      role: "יועץ עסקי",
      text: "חיפשתי דרך להבליט את ההישגים המקצועיים שלי בצורה שתדבר למנהלים. הפורמט המובנה עזר לי להציג את הערך שאני מביא בצורה ברורה ומשכנעת",
      image: "/design/1.svg",
      alt: "איור של דניאל ברקוביץ'"
    },
    {
      name: "נועה רוזן",
      role: "מורה לחינוך מיוחד",
      text: "רציתי קורות חיים שישקפו לא רק את הניסיון המקצועי אלא גם את הגישה החינוכית שלי. התבניות המוצעות אפשרו לי להביע את זה בדיוק כמו שרציתי",
      image: "/design/2.svg",
      alt: "איור של נועה רוזן"
    },
    {
      name: "רועי אברהם",
      role: "מנהל מכירות",
      text: "פשוט, מהיר ומקצועי. הצלחתי לבנות קורות חיים מרשימים תוך פחות משעה. כבר המלצתי לכל החברים שלי שמחפשים עבודה",
      image: "/design/2.svg",
      alt: "איור של רועי אברהם"
    },
    {
      name: "מיכל שטרן",
      role: "אחות במחלקת ילדים",
      text: "הפורמט המובנה עזר לי להציג את כל ההכשרות והניסיון שלי בצורה מסודרת. קיבלתי המון תגובות חיוביות על העיצוב המקצועי",
      image: "/design/1.svg",
      alt: "איור של מיכל שטרן"
    },
    {
      name: "עומר דוידוב",
      role: "אנליסט נתונים",
      text: "חיפשתי דרך להציג את הפרויקטים והמיומנויות הטכניות שלי בצורה שתתפוס את העין. התבנית שבחרתי עזרה לי להשיג בדיוק את זה",
      image: "/design/3.svg",
      alt: "איור של עומר דוידוב"
    }
  ],
  en: [
    {
      name: "Adi Levi",
      role: "HR Manager",
      text: "Thank you for the excellent service! I managed to update my CV easily and quickly. The professional template and clean design really upgraded my document",
      image: "/design/1.svg",
      alt: "Adi Levi illustration"
    },
    {
      name: "Yossi Cohen",
      role: "Industrial Engineer",
      text: "After 7 years at the same workplace, I struggled to organize all my experience clearly. The site helped me present my skills in an organized and professional way",
      image: "/design/2.svg",
      alt: "Yossi Cohen illustration"
    },
    {
      name: "Michal Barak",
      role: "UX/UI Designer",
      text: "I was looking for a format that would allow me to present my portfolio creatively yet professionally. The template I chose here met exactly what I needed. Within two days I got an interview invitation!",
      image: "/design/3.svg",
      alt: "Michal Barak illustration"
    },
    {
      name: "Alex Weissman",
      role: "Full Stack Developer",
      text: "My Hebrew isn't perfect, and the site really helped me phrase my CV professionally. The option to translate to English was a significant bonus",
      image: "/design/3.svg",
      alt: "Alex Weissman illustration"
    },
    {
      name: "Shira Abrami",
      role: "Digital Marketing Manager",
      text: "I needed to update my CV urgently before an interview. The process was simple and easy, and the final result looks really impressive. Highly recommend!",
      image: "/design/AboutPic.svg",
      alt: "Shira Abrami illustration"
    },
    {
      name: "Daniel Berkowitz",
      role: "Business Consultant",
      text: "I was looking for a way to highlight my professional achievements in a way that speaks to managers. The structured format helped me present my value clearly and convincingly",
      image: "/design/1.svg",
      alt: "Daniel Berkowitz illustration"
    },
    {
      name: "Noa Rosen",
      role: "Special Education Teacher",
      text: "I wanted a CV that would reflect not just my professional experience but also my educational approach. The offered templates allowed me to express that exactly as I wanted",
      image: "/design/2.svg",
      alt: "Noa Rosen illustration"
    },
    {
      name: "Roy Avraham",
      role: "Sales Manager",
      text: "Simple, fast and professional. I managed to build an impressive CV in less than an hour. I've already recommended it to all my friends who are job hunting",
      image: "/design/2.svg",
      alt: "Roy Avraham illustration"
    },
    {
      name: "Michal Stern",
      role: "Pediatric Nurse",
      text: "The structured format helped me present all my training and experience in an organized way. I got lots of positive feedback on the professional design",
      image: "/design/1.svg",
      alt: "Michal Stern illustration"
    },
    {
      name: "Omer Davidov",
      role: "Data Analyst",
      text: "I was looking for a way to present my projects and technical skills in an eye-catching way. The template I chose helped me achieve exactly that",
      image: "/design/3.svg",
      alt: "Omer Davidov illustration"
    }
  ]
};

export function TestimonialsClient({ lang }: TestimonialsClientProps) {
  const isRTL = lang === 'he';
  const content = testimonials[lang as keyof typeof testimonials];

  return (
    <main 
      className={cn(
        "min-h-screen bg-[#F4F4F1] py-8 px-4 sm:py-12 md:py-24 md:px-8",
        isRTL ? "rtl" : "ltr"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16",
            "text-[#4856CD]"
          )}
        >
          {isRTL ? 'מה אומרים עלינו?' : 'What People Say'}
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {content.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow"
              tabIndex={0}
              role="article"
              aria-label={`${item.name} - ${item.role}`}
            >
              <div className={cn(
                "flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4",
                isRTL ? "flex-row" : "flex-row-reverse"
              )}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 relative shrink-0">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#4856CD]">{item.name}</h2>
                  <p className="text-sm sm:text-base text-[#B78BE6]">{item.role}</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-gray-700">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 sm:mt-16 md:mt-24 text-center"
        >
          <p className="text-base sm:text-lg font-medium text-[#4856CD]">
            {isRTL ? 
              '✨ יאללה, הגיע הזמן לבחור לך תבנית מושלמת' : 
              '✨ Come on, it\'s time to choose your perfect template'}
          </p>
        </motion.footer>
      </div>
    </main>
  );
} 