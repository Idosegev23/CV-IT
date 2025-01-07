'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

const WhatsAppButton = () => (
  <button 
    onClick={() => window.open('https://wa.me/972509365605', '_blank')}
    className="inline-flex items-center gap-1 text-[#25D366] hover:underline"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    וואטסאפ
  </button>
);

const content = {
  he: {
    title: 'תקנון אתר CVit',
    subtitle: 'כתובת האתר: cvit.co.il',
    sections: [
      {
        title: 'מבוא',
        content: `ברוכים הבאים לאתר CVit (להלן: "האתר"), המופעל על ידי חברת CVit בע"מ (להלן: "החברה").
        האתר נועד לספק שירותי יצירת קורות חיים באמצעות טכנולוגיית בינה מלאכותית, תוך מתן פתרונות מתקדמים למציאת עבודה ושיפור מיתוג אישי בשוק התעסוקה.
        
        התקנון מגדיר את תנאי השימוש באתר, את מערכת היחסים בין המשתמשים לבין החברה, ואת מדיניות השימוש במידע. השימוש באתר מהווה הסכמה לתקנון זה.`
      },
      {
        title: 'השירותים המוצעים באתר',
        content: `האתר מציע שלוש חבילות שירות עיקריות, המותאמות לצרכים שונים של מחפשי עבודה:

        1. חבילת Basic (75 ₪):
           - יצירת קורות חיים בעברית
           - עיצוב קורות חיים מותאם אישית
           - הפצה לחברות השמה
           - הכנה לריאיון עבודה
           - מחשבון שכר מותאם אישית
           - קובץ PDF להורדה

        2. חבילת Advanced (85 ₪):
           כוללת את כל המאפיינים של חבילת Basic ובנוסף:
           - יצירת קורות חיים באנגלית
           - עריכת קורות חיים
           - בניית פרופיל LinkedIn אוטומטי

        3. חבילת Pro (95 ₪):
           כוללת את כל המאפיינים של חבילת Advanced ובנוסף:
           - הכנה אישית לריאיון עבודה
           - ליווי אישי מול מעסיקים
           - שובר לריאיון עבודה עם מונית GetCVit`
      },
      {
        title: 'תנאי שימוש',
        content: `1. השימוש באתר מיועד לאנשים פרטיים בגיל 18 ומעלה בלבד.
        2. אין לעשות באתר שימוש מסחרי ללא אישור בכתב מהחברה.
        3. חל איסור להעלות תכנים לאתר או להשתמש באתר בצורה הפוגעת בזכויות צד ג' או בחוק.
        4. המשתמש אחראי לבדוק את התוצרים שנוצרו באתר לפני השימוש בהם.`
      },
      {
        title: 'איסוף ושימוש במידע אישי',
        content: `1. איסוף מידע:
           - המידע שנמסר על ידי המשתמשים (כולל פרטי קשר וקורות חיים) נשמר במסד הנתונים של החברה.
           - המידע נשמר שמית ומשויך לחשבון המשתמש.

        2. שימוש במידע:
           - המידע האישי משמש לצורך מתן השירותים המוצעים באתר, כולל הפצת קורות החיים לגורמי השמה.
           - החברה שומרת לעצמה את הזכות להשתמש במידע לצרכים מסחריים, לרבות מכירת קורות חיים לגורמים שלישיים.
           - החברה לא תחשוף פרטי קשר אישיים ללא הסכמת המשתמש.

        3. שמירת מידע:
           - המידע נשמר בשרתי החברה ומוגן באמצעי אבטחה מתקדמים.

        4. זכויות המשתמש:
           - המשתמש רשאי לבקש גישה למידע שלו או למחוק אותו בהתאם לחוק.`
      },
      {
        title: 'תשלומים ומדיניות החזרות',
        content: `1. תשלום:
           - התשלום עבור השירותים מתבצע באמצעות כרטיס אשראי דרך ספקי תשלום מאובטחים.
           - כל התשלומים מוצגים בשקלים חדשים וכוללים מע"מ.

        2. מדיניות החזרות:
           - החברה אינה מספקת החזר כספי או ביטול עסקה לאחר ביצוע התשלום.`
      },
      {
        title: 'אבטחת מידע',
        content: `1. האתר משתמש באמצעי אבטחה מתקדמים לשמירה על המידע האישי, כולל:
           - הצפנה של נתונים במעבר (TLS) ובמנוחה.
           - בקרת גישה קפדנית למסד הנתונים.
           - עדכוני אבטחה שוטפים.

        2. החברה אינה אחראית לנזקים כתוצאה מחדירה בלתי מורשית, אך מתחייבת לפעול למניעת פריצות ככל האפשר.`
      },
      {
        title: 'נגישות האתר',
        content: `1. האתר עומד בתקן נגישות AA, המבטיח חוויית שימוש נוחה לכל המשתמשים, כולל אנשים עם מוגבלויות.
        2. בעיות נגישות יטופלו במהירות האפשרית.`
      },
      {
        title: 'שירות לקוחות',
        content: [
          '1. לפניות ושאלות ניתן לפנות לכתובת המייל: office@cvit.co.il',
          '2. שירות לקוחות זמין גם ב-<whatsapp />',
          '3. החברה מתחייבת למענה תוך 2 ימי עסקים.'
        ].join('\n')
      },
      {
        title: 'זכויות יוצרים וקניין רוחני',
        content: `1. כל התכנים באתר הם רכושה הבלעדי של החברה.
        2. אין להעתיק, לשכפל או להפיץ תכנים מהאתר ללא אישור מראש ובכתב.`
      },
      {
        title: 'שינויים בתקנון',
        content: `1. החברה שומרת לעצמה את הזכות לעדכן את התקנון בכל עת.
        2. העדכונים יפורסמו באתר וייכנסו לתוקף מידית.`
      },
      {
        title: 'סמכות שיפוט',
        content: `1. על תקנון זה יחולו דיני מדינת ישראל בלבד.
        2. כל מחלוקת תידון בבית המשפט המוסמך במחוז תל אביב.`
      },
      {
        title: 'פרטי התקשרות',
        content: [
          'ליצירת קשר עם החברה:',
          'טלפון: 050-936-5605',
          'דוא"ל: office@cvit.co.il',
          'כתובת: צבי סגל 20א, אשקלון'
        ].join('\n')
      },
      {
        title: 'אספקת המוצרים',
        content: `1. אופן האספקה:
           - קורות החיים והמסמכים הנלווים יישלחו לכתובת המייל שסופקה בעת ההרשמה.
           - המשלוח הינו מיידי ואוטומטי לאחר השלמת התהליך והתשלום.
           - ביתן להוריד את קורות החיים באופן מיידי מהמערכת.
           - במקרה של תקלה טכנית, החברה מתחייבת לטפל בבעיה תוך 24 שעות לכל היותר.

        2. פורמט הקבצים:
           - קורות החיים יסופקו בפורמט PDF בלבד.

        3. גישה למערכת:
           - לאחר הרכישה, תינתן גישה מיידית למערכת הניהול האישית.
           - אפשרות העריכה של קורות החיים זמינה רק בחבילות Advanced ו-Pro.`
      }
    ]
  },
  en: {
    title: 'CVit Terms of Service',
    subtitle: 'Website: cvit.co.il',
    sections: [
      {
        title: 'Introduction',
        content: `Welcome to CVit (hereinafter: "the Site"), operated by CVit Ltd. (hereinafter: "the Company").
        The site is designed to provide CV creation services using artificial intelligence technology, while providing advanced solutions for job search and personal branding in the job market.
        
        These terms define the conditions of use of the site, the relationship between users and the Company, and the information usage policy. Use of the site constitutes agreement to these terms.`
      },
      {
        title: 'Services Offered',
        content: `The site offers three main service packages, tailored to different job seekers' needs:

        1. Basic Package (75 NIS):
           - Hebrew CV creation
           - Personalized CV design
           - Distribution to recruitment agencies
           - Job interview preparation
           - Personalized salary calculator
           - PDF file download

        2. Advanced Package (85 NIS):
           Includes all Basic package features plus:
           - English CV creation
           - CV editing
           - Automatic LinkedIn profile creation

        3. Pro Package (95 NIS):
           Includes all Advanced package features plus:
           - Personal job interview preparation
           - Personal guidance with employers
           - GetCVit taxi voucher for job interview`
      },
      {
        title: 'Terms of Use',
        content: `1. The use of the site is intended for private individuals aged 18 and above only.
        2. Commercial use of the site is prohibited without written permission from the Company.
        3. It is forbidden to upload content to the site or use the site in a way that violates third-party rights or the law.
        4. The user is responsible for checking the products created on the site before using them.`
      },
      {
        title: 'Personal Information Collection and Use',
        content: `1. Information Collection:
           - Information provided by users (including contact details and CVs) is stored in the Company's database.
           - Information is stored by name and associated with the user account.

        2. Use of Information:
           - Personal information is used to provide the services offered on the site, including CV distribution to recruitment agencies.
           - The Company reserves the right to use the information for commercial purposes, including selling CVs to third parties.
           - The Company will not disclose personal contact details without user consent.

        3. Information Storage:
           - Information is stored on Company servers and protected by advanced security measures.

        4. User Rights:
           - Users may request access to their information or delete it in accordance with the law.`
      },
      {
        title: 'Payments and Refund Policy',
        content: `1. Payment:
           - Payment for services is made by credit card through secure payment providers.
           - All payments are displayed in New Israeli Shekels and include VAT.

        2. Refund Policy:
           - The Company does not provide refunds or transaction cancellations after payment.`
      },
      {
        title: 'Information Security',
        content: `1. The site uses advanced security measures to protect personal information, including:
           - Data encryption in transit (TLS) and at rest.
           - Strict database access control.
           - Regular security updates.

        2. The Company is not responsible for damages resulting from unauthorized access but commits to preventing breaches as much as possible.`
      },
      {
        title: 'Site Accessibility',
        content: `1. The site complies with AA accessibility standard, ensuring a comfortable user experience for all users, including people with disabilities.
        2. Accessibility issues will be addressed as quickly as possible.`
      },
      {
        title: 'Customer Service',
        content: [
          '1. For inquiries and questions, please email: office@cvit.co.il',
          '2. Customer service is also available on <whatsapp />',
          '3. The Company commits to responding within 2 business days.'
        ].join('\n')
      },
      {
        title: 'Copyright and Intellectual Property',
        content: `1. All content on the site is the exclusive property of the Company.
        2. Copying, duplicating, or distributing content from the site without prior written permission is prohibited.`
      },
      {
        title: 'Changes to Terms',
        content: `1. The Company reserves the right to update these terms at any time.
        2. Updates will be published on the site and take effect immediately.`
      },
      {
        title: 'Jurisdiction',
        content: `1. These terms shall be governed exclusively by the laws of the State of Israel.
        2. Any dispute will be heard in the competent court in the Tel Aviv district.`
      },
      {
        title: 'Contact Information',
        content: [
          'Contact us:',
          'Phone: +972-50-936-5605',
          'Email: office@cvit.co.il',
          'Address: 20A Tzvi Segal St., Ashkelon, Israel'
        ].join('\n')
      },
      {
        title: 'Product Delivery',
        content: `1. Delivery Method:
           - CVs and accompanying documents will be sent to the email address provided during registration.
           - Delivery is immediate and automatic upon process and payment completion.
           - CVs can be downloaded immediately from the system.
           - In case of technical issues, the Company commits to resolving the problem within 24 hours maximum.

        2. File Format:
           - CVs will be delivered in PDF format only.

        3. System Access:
           - After purchase, immediate access will be granted to the personal management system.
           - CV editing capability is available only in Advanced and Pro packages.`
      }
    ]
  }
};

export default function TermsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'he';
  const currentContent = content[lang as keyof typeof content];
  const isRTL = lang === 'he';

  const renderContent = (content: string) => {
    // מחליף את תג ה-whatsapp בקומפוננטה האמיתית
    const parts = content.split('<whatsapp />');
    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && <WhatsAppButton />}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <main 
      className="min-h-screen bg-[#EAEAE7] py-12"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* כותרת ראשית */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
              {currentContent.title}
            </h1>
            <h2 className="text-xl text-[#4B4553]">
              {currentContent.subtitle}
            </h2>
          </div>

          {/* תוכן התקנון */}
          <div className="space-y-8">
            {currentContent.sections.map((section, index) => (
              <motion.section
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/40 backdrop-blur-sm rounded-[24px] p-6 border border-white"
              >
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">
                  {section.title}
                </h3>
                <div className="text-[#4B4553] whitespace-pre-line">
                  {renderContent(section.content)}
                </div>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
} 