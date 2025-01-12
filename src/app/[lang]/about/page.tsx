'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Lottie from 'lottie-react';
import { useWindowSize } from '@/hooks/useWindowSize';
import { BackButton } from '@/components/BackButton';

// הגדרת טיפוס למאפיינ
type Feature = {
  image: string;
  icon?: React.ElementType;
  title: string;
  description: string;
}

const content = {
  he: {
    title: "קבלו אותנו ;CVIT",
    subtitle: "באנו להשים!",
    description: {
      part1: "בינה מלאכותית, או יותר נכון – הסערה החדשה בעולם קורות החיים. ",
      part2: "לא סתם עוד קובץ משעמם. ",
      part3: "אז מה זה אומר? קודם כל, אנחנו מוצאים לך עבודה, מחשבים לך שכר, מדריכים אותך לפני הריאיון. ",
      part4: "אחר כך? דואגים שגם הלינקדאין שלך יראה כמו מיליון דולר. ",
      parenthetical: "(איך לא חשבנו על זה קודם?)",
      part5: "<span class='font-bold'>בואו נדבר תכל'ס:</span> אנחנו פה כדי לחסוך לך את כל הכאב ראש. לכתוב קורות חיים? זה בערך כמו לשטוף כלים אחרי ארוחת שישי – כולם מנסים להתחמק מזה.",
      part6: "אבל יש לנו בשורות טובות. הולכים לעשות את זה פשוט וקליל. כמה שאלות קצרות, קצת קסם של AI, ותוך דקה יש לך קורות חיים שגורמים לכולם לומר 'וואו'.",
      part7: "ומפה? אנחנו שולחים את קורות החיים שלך ישר למגייסים הכי טובים. כל מה שנשאר זה להתכונן לראיון.",
      finalPart: ";CVIT – קל, משתלם ומרשים במיוחד"
    },
    features: [
      {
        image: '/design/upright.svg' as string,
        title: "תבניות מקצועיות בסטייל",
        description: "תבניות שיגרמו למעסיקים להגיד 'וואו'\nולך להגיד 'איך לא עשיתי את זה קודם?'"
      },
      {
        image: '/design/upmid.svg' as string,
        title: "טכנולוגיה חכמה עלינו",
        description: "8 שאלות פשוטות, ובום! ה-AI שלנו יוציא ממך את המיטב.\nכן, זה באמת כזה פשוט"
      },
      {
        image: '/design/upleft.svg' as string,
        title: "מכל מקום בעולם",
        description: "בבית, בבית קפה, או על חוף הים.\nאיפה שנוח לך, מתי שנוח לך"
      },
      {
        image: '/design/downright.svg',
        title: "גם באנגלית",
        description: "תרגום מקצועי בלחיצת כפתור.\nכי אנגלית זה לא רק Yes ו-No"
      },
      {
        image: '/design/downmid.svg',
        title: "מקושרים לחברות ההשמה",
        description: "קורות החיים שלך? ישר למסך של המגייסים הכי חמים.\nבלי ספאם, בלי סחבת, בלי בלגן"
      },
      {
        image: '/design/downleft.svg',
        title: "חיסכון בזמן וכאבי ראש",
        description: "תשכחו מהסיוט של כתיבת קורות חיים.\nאנחנו עושים את העבודה, אתם מקבלים את הקרדיט"
      },
      {
        image: '/design/linkedin.svg',
        title: "בניית פרופיל לינקדאין",
        description: "פרופיל לינקדאין שעובד בשבילך 24/7.\nכמו מכונת גיוס פרטית, רק בלי המשכורת"
      },
      {
        image: '/design/salary.svg',
        title: "מחשבון שכר",
        description: "נגיד לך כמה מגיע לך באמת.\nכי ״נתון למשא ומתן״ זה ממש 2022"
      },
      {
        image: '/design/interview.svg',
        title: "הכנה לריאיון עבודה",
        description: "טיפים, טריקים וכל מה שצריך לדעת.\nכי ביטחון זה חצי מההצלחה"
      }
    ] as Feature[]
  },
  en: {
    title: "Meet CVIT;",
    subtitle: "Your Career Game-Changer",
    description: {
      part1: "AI isn't just changing the resume game – it's completely revolutionizing it. ",
      part2: "This isn't your typical CV builder. ",
      part3: "What's in it for you? First, we find you the perfect job, calculate your worth, and prep you for interviews. ",
      part4: "Then? We transform your LinkedIn into a recruiter magnet. ",
      parenthetical: "(Why didn't anyone think of this before?)",
      part5: "<span class='font-bold'>Here's the deal:</span> we're here to make your life easier. Writing a CV? It's like doing taxes – everyone tries to avoid it until the last minute.",
      part6: "But we've got good news. We're making this super simple. A few quick questions, some AI magic, and boom – you've got a CV that makes employers say 'wow'.",
      part7: "What's next? We send your CV straight to the top recruiters. All you need to do is prep for the interview.",
      finalPart: "CVIT; – Simple, Smart, Stunning"
    },
    features: [
      {
        image: '/design/upright.svg' as string,
        title: "Professional Templates",
        description: "Stunning designs and winning templates.\nMaking your CV stand out, effortlessly"
      },
      {
        image: '/design/upmid.svg' as string,
        title: "Smart AI Technology",
        description: "Just answer 8 quick questions.\nOur AI will do the heavy lifting"
      },
      {
        image: '/design/upleft.svg' as string,
        title: "From Anywhere",
        description: "Create your perfect CV anytime, anywhere.\nOn any device"
      },
      {
        image: '/design/downright.svg',
        title: "English Ready",
        description: "One click translation.\nOpening doors to global opportunities"
      },
      {
        image: '/design/downmid.svg',
        title: "Direct to Recruiters",
        description: "Your CV goes straight to top recruiters.\nNo spam, no hassle, just results"
      },
      {
        image: '/design/downleft.svg',
        title: "Time & Hassle Saver",
        description: "We do the work.\nYou get the credit"
      },
      {
        image: '/design/linkedin.svg',
        title: "LinkedIn Profile Builder",
        description: "Your LinkedIn profile working 24/7.\nLike a personal recruitment machine"
      },
      {
        image: '/design/salary.svg',
        title: "Salary Calculator",
        description: "Know your true market value.\nNo more guessing games"
      },
      {
        image: '/design/interview.svg',
        title: "Interview Prep",
        description: "Tips, tricks, and everything you need.\nBecause confidence is half the battle"
      }
    ] as Feature[]
  }
} as const;

export default function AboutPage() {
  const params = useParams();
  const lang = (params?.lang ?? 'he') as keyof typeof content;
  const isRTL = lang === 'he';
  const currentContent = content[lang];
  const { width } = useWindowSize();

  // פונקציה שמחזירה גדלים דינמיים בהתאים לרוחב המסך
  const getDynamicSizes = () => {
    // גדלי פונט - הקטנה בדרגה אחת
    const titleSize = width < 360 ? 'text-xl' : 
                     width < 480 ? 'text-2xl' :
                     width < 640 ? 'text-3xl' :
                     width < 768 ? 'text-4xl' : 'text-5xl';

    const textSize = width < 360 ? 'text-sm' :
                    width < 480 ? 'text-base' :
                    width < 640 ? 'text-lg' : 'text-xl';

    // גודל תמונה
    const imageSize = width < 360 ? 240 :
                     width < 480 ? 280 :
                     width < 640 ? 320 :
                     width < 768 ? 360 : 400;

    // מרווחים - הקטנו עוד יותר
    const spacing = width < 360 ? 'gap-1' :  // היה gap-2
                   width < 480 ? 'gap-1.5' :  // היה gap-3
                   width < 640 ? 'gap-2' : 'gap-3';  // היו gap-4 ו-gap-5

    // padding
    const padding = width < 360 ? 'p-3' :
                   width < 480 ? 'p-4' :
                   width < 640 ? 'p-5' : 'p-6';

    return { titleSize, textSize, imageSize, spacing, padding };
  };

  const { titleSize, textSize, imageSize, spacing, padding } = getDynamicSizes();

  // נשתמש בדינמי ייבוא
  const [animations, setAnimations] = useState<any[]>([]);

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const anim1 = await fetch('/lottie/CV1.json').then(res => res.json());
        const anim2 = await fetch('/lottie/CV2.json').then(res => res.json());
        const anim3 = await fetch('/lottie/CV3.json').then(res => res.json());
        setAnimations([anim1, anim2, anim3]);
      } catch (error) {
        console.error('Error loading animations:', error);
      }
    };
    
    loadAnimations();
  }, []);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#EAEAE7]">
      {/* Hero Section */}
      <section className="container mx-auto px-6 sm:px-4 pt-6 pb-4">
        <div className="mb-8">
          <BackButton isRTL={isRTL} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-600">
            {currentContent.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          <motion.div className="text-lg md:text-xl lg:text-2xl text-gray-600 px-4 sm:px-0">
            <p className="mb-4">{currentContent.description.part1}{currentContent.description.part2}</p>
            <p className="mb-4">
              {currentContent.description.part3}
              {currentContent.description.part4}
              {currentContent.description.parenthetical}
            </p>
          </motion.div>
          <motion.div className="w-full">
            <Image
              src="/about/1.png"
              alt="CVIT Process"
              width={300}
              height={300}
              className="w-[80%] sm:w-[60%] h-auto mx-auto rounded-3xl"
            />
          </motion.div>
        </div>
      </section>

      {/* חלק שני - מחוץ לקונטיינר הראשי */}
      <div className="w-full bg-[#F4F4F1] py-16">
        <div className="container mx-auto px-6 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            <motion.div className="order-2 md:order-1 w-full">
              <Image
                src="/about/2.png"
                alt="CVIT Results"
                width={300}
                height={300}
                className="w-[80%] sm:w-[60%] h-auto mx-auto rounded-3xl"
              />
            </motion.div>
            <motion.div className="order-1 md:order-2 text-lg md:text-xl lg:text-2xl text-gray-600 px-4 sm:px-0">
              <p className="mb-6" dangerouslySetInnerHTML={{ __html: currentContent.description.part5 }} />
              <p className="mb-6" dangerouslySetInnerHTML={{ __html: currentContent.description.part6 }} />
              <p dangerouslySetInnerHTML={{ __html: currentContent.description.part7 }} />
            </motion.div>
          </div>

          {/* משפט סיום - בסוף החלק השני */}
          <motion.div className="text-center mt-8">
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-600">
              {currentContent.description.finalPart}
            </p>
          </motion.div>
        </div>
      </div>

      {/* חלק שלישי - השלבים */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-600">
            {isRTL ? 'מה מקבלים?' : 'What Do You Get?'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* שלב ראשון */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F4F4F1] rounded-[24px] p-6 text-center relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#4856CD] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <Image
                src="/design/CV1.svg"
                alt="Step 1"
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-3 text-gray-600">
                {isRTL ? 'קורות חיים מנצחים' : 'Winning CV'}
              </h3>
              <p className="text-gray-600">
                {isRTL 
                  ? 'תבניות מעוצבות, טקסטים מנצחים וכל מה שצריך כדי להרשים מעסיקים. בלי להתאמץ'
                  : 'Designed templates, winning texts, and everything needed to impress employers. Effortlessly'}
              </p>
            </motion.div>

            {/* שלב שני */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#F4F4F1] rounded-[24px] p-6 text-center relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#4856CD] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <Image
                src="/design/CV2.svg"
                alt="Step 2"
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-3 text-gray-600">
                {isRTL ? 'עוזרים לך למצוא עבודה' : 'Job Search assistant'}
              </h3>
              <p className="text-gray-600">
                {isRTL 
                  ? 'שליחה למגייסים המובילים, הכנה לראיון, מחשבון שכר ואפילו מונית לראיון. הכל במקום אחד'
                  : 'Sending to top recruiters, interview prep, salary calculator, and even a taxi to the interview. All in one place'}
              </p>
            </motion.div>

            {/* שלב שלישי */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#F4F4F1] rounded-[24px] p-6 text-center relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#4856CD] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <Image
                src="/design/CV3.svg"
                alt="Step 3"
                width={80}
                height={80}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-3 text-gray-600">
                {isRTL ? 'נוכחות דיגיטלית' : 'Digital Presence'}
              </h3>
              <p className="text-gray-600">
                {isRTL 
                  ? 'פרופיל לינקדאין מקצועי שעובד 24/7 ומושך את תשומת הלב של המגייסים הנכונים'
                  : 'A professional LinkedIn profile that works 24/7 and attracts the right recruiters'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* חלק רביעי - הכחול */}
      <section className="bg-[#2D3E9F] rounded-t-[32px]">
        <div className="container mx-auto px-4 py-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 text-white"
          >
            {currentContent.subtitle}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {currentContent.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[16px] p-4 flex flex-col items-center"
              >
                <div className="mb-4">
                  <Image
                    src={feature.image}
                    alt=""
                    width={80}
                    height={80}
                    className="w-auto h-[80px]"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#2D3E9F] mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center whitespace-pre-line">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 