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
      role: "נציגת שירות לקוחות",
      text: "ממשק מעולה! שווה כל שקל, אני הכי טכנופובית שיש, ובזכות סיביט הנדירה התקבלתי למוקד שירות של חברת הביטוח. ממליצה בחום… זה באמת היה מהיר",
      image: "/design/1.svg",
      alt: "איור של עדי לוי"
    },
    {
      name: "יוסי כהן",
      role: "מנהל פרויקטים בנדל\"ן",
      text: "חיפשתי דרך לחדש את קורות החיים שלי בלי להשתגע. סיביט פשוט הציל אותי – תוך כמה דקות קיבלתי מסמך שנראה מקצועי ברמות אין עליכם!",
      image: "/design/2.svg",
      alt: "איור של יוסי כהן"
    },
    {
      name: "אלכס ויסמן",
      role: "טכנאי מחשבים",
      text: "העברית שלי עוד לא מושלמת, וממש פחדתי לכתוב קורות חיים לבד. סיביט עזרו לי לנסח הכל בצורה מקצועית, ואפילו תרגמו לי גם לאנגלית. תוך חודש כבר עבדתי בחברת הייטק גדולה!",
      image: "/design/3.svg",
      alt: "איור של אלכס ויסמן"
    },
    {
      name: "רייצ'ל גולדשטיין",
      role: "מהנדסת תוכנה",
      text: "עליתי לארץ לפני חצי שנה והייתי ממש לחוצה איך להתאים את קורות החיים שלי לשוק הישראלי. סיביט עזרו לי להמיר את הניסיון שלי בצורה מושלמת, וכבר אחרי שבועיים התקבלתי לחברת הייטק בתל אביב!",
      image: "/design/3.svg",
      alt: "איור של רייצ'ל גולדשטיין"
    },
    {
      name: "מישל דוד",
      role: "מעצבת גרפית",
      text: "כשהגעתי מצרפת, הייתי אבודה לגמרי עם איך מציגים פה קורות חיים. סיביט לא רק עזרו לי עם התרגום, אלא גם התאימו את הפורמט למה שמקובל בישראל. תודה רבה!",
      image: "/design/AboutPic.svg",
      alt: "איור של מישל דוד"
    },
    {
      name: "דניאל ברקוביץ'",
      role: "יועץ פיננסי",
      text: "המעבר מלונדון היה מאתגר, אבל סיביט הפכו את החלק של חיפוש העבודה להרבה יותר קל. הם ידעו בדיוק איך להציג את הניסיון הבינלאומי שלי בצורה שתדבר לחברות ישראליות.",
      image: "/design/1.svg",
      alt: "איור של דניאל ברקוביץ'"
    },
    {
      name: "שרה רוזנבלום",
      role: "מורה לאנגלית",
      text: "התלבטתי המון איך להציג את הניסיון ההוראה שלי מארה״ב. סיביט עזרו לי להבליט את היתרונות שלי בצורה שמתאימה למערכת החינוך בארץ. היום אני מלמדת בתיכון מוביל!",
      image: "/design/2.svg",
      alt: "איור של שרה רוזנבלום"
    },
    {
      name: "אליה בן-חיים",
      role: "טבחית",
      text: "הגעתי מצרפת עם ניסיון במטבחים מובילים, אבל היה לי קשה להסביר את זה בעברית. סיביט עזרו לי לתרגם את קורות החיים בצורה מקצועית, והיום אני עובדת במסעדת שף מדהימה בתל אביב.",
      image: "/design/3.svg",
      alt: "איור של אליה בן-חיים"
    },
    {
      name: "רועי אברהם",
      role: "מנהל תפעול",
      text: "אחרי 6 שנים באותו מקום עבודה, לא ידעתי איך לגשת לעדכון קורות החיים. סיביט עזרו לי להציג את הניסיון שלי בצורה עדכנית ומקצועית. תוך שבוע כבר הוזמנתי לראיונות!",
      image: "/design/2.svg",
      alt: "איור של רועי אברהם"
    },
    {
      name: "מיכל שטרן",
      role: "אחות מוסמכת",
      text: "חיפשתי דרך להבליט את ההתמחויות והקורסים שעברתי. סיביט ארגנו את הכל בצורה כל כך ברורה ומקצועית, שהתקבלתי ישר למחלקה שרציתי. ממליצה בחום!",
      image: "/design/1.svg",
      alt: "איור של מיכל שטרן"
    }
  ],
  en: [
    {
      name: "Adi Levy",
      role: "Customer Service Representative",
      text: "Amazing interface! Worth every penny. I'm the most technophobic person ever, and thanks to the incredible CVIT I got accepted to an insurance company's service center. Highly recommend... it was truly fast!",
      image: "/design/1.svg",
      alt: "Adi Levy illustration"
    },
    {
      name: "Yossi Cohen",
      role: "Real Estate Project Manager",
      text: "I was looking for a way to update my CV without going crazy. CVIT simply saved me - within minutes I got a document that looks incredibly professional!",
      image: "/design/2.svg",
      alt: "Yossi Cohen illustration"
    },
    {
      name: "Alex Weissman",
      role: "Computer Technician",
      text: "My Hebrew isn't perfect yet, and I was really scared to write a CV by myself. CVIT helped me phrase everything professionally, and even translated it to English. Within a month I was already working at a major tech company!",
      image: "/design/3.svg",
      alt: "Alex Weissman illustration"
    },
    {
      name: "Rachel Goldstein",
      role: "Software Engineer",
      text: "After making Aliyah 6 months ago, I was really stressed about adapting my resume to the Israeli market. CVIT helped me translate my experience perfectly, and within two weeks I landed a job at a tech company in Tel Aviv!",
      image: "/design/3.svg",
      alt: "Rachel Goldstein illustration"
    },
    {
      name: "Michelle David",
      role: "Graphic Designer",
      text: "Coming from France, I was completely lost about how to present my CV here. CVIT not only helped with the translation but also adapted the format to Israeli standards. Thank you so much!",
      image: "/design/AboutPic.svg",
      alt: "Michelle David illustration"
    },
    {
      name: "Daniel Berkowitz",
      role: "Financial Advisor",
      text: "Moving from London was challenging, but CVIT made the job hunting part so much easier. They knew exactly how to present my international experience in a way that resonates with Israeli companies.",
      image: "/design/1.svg",
      alt: "Daniel Berkowitz illustration"
    },
    {
      name: "Sarah Rosenblum",
      role: "English Teacher",
      text: "I was unsure how to present my teaching experience from the US. CVIT helped me highlight my strengths in a way that fits the Israeli education system. Now I'm teaching at a leading high school!",
      image: "/design/2.svg",
      alt: "Sarah Rosenblum illustration"
    },
    {
      name: "Elia Ben-Haim",
      role: "Chef",
      text: "I came from France with experience in leading kitchens, but I struggled to explain it in Hebrew. CVIT helped me translate my CV professionally, and today I'm working at an amazing chef restaurant in Tel Aviv.",
      image: "/design/3.svg",
      alt: "Elia Ben-Haim illustration"
    },
    {
      name: "Roy Avraham",
      role: "Operations Manager",
      text: "After 6 years at the same workplace, I didn't know how to approach updating my CV. CVIT helped me present my experience in a modern and professional way. Within a week I was already invited to interviews!",
      image: "/design/2.svg",
      alt: "Roy Avraham illustration"
    },
    {
      name: "Michal Stern",
      role: "Registered Nurse",
      text: "I was looking for a way to highlight my specializations and courses. CVIT organized everything so clearly and professionally that I was immediately accepted to the department I wanted. Highly recommend!",
      image: "/design/1.svg",
      alt: "Michal Stern illustration"
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