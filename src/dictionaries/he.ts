import { Dictionary } from "./dictionary";

export const he: Dictionary = {
 editor: {
   edit: 'עריכה',
   preview: 'תצוגה מקדימה',
   save: 'שמירה',
   selectFont: 'בחר גופן',
   selectSize: 'בחר גודל',
   bold: 'מודגש',
   italic: 'נטוי',
   underline: 'קו תחתון',
   alignLeft: 'יישור לשמאל',
   alignCenter: 'יישור למרכז',
   alignRight: 'יישור לימין', 
   toggleDirection: 'שינוי כיוון',
   bulletList: 'רשימת תבליטים',
   numberList: 'רשימה ממוספרת',
   indent: 'הזחה',
   addLink: 'הוסף קישור',
   removeLink: 'הסר קישור',
   addImage: 'הוסף תמונה',
   openToolbar: 'פתח סרגל כלים',
   undo: 'בטל',
   redo: 'בצע שוב'
 },
 errors: {
   notFound: 'לא נמצא',
   saveFailed: 'השמירה נכשלה',
   loadFailed: 'הטעינה נכשלה',
   invalidData: 'נתונים לא תקינים',
   formatFailed: 'העיצוב נכשל',
   autoSaveFailed: 'שמירה אוטומטית נכשלה'
 },
 messages: {
   saved: 'נשמר',
   unsaved: 'לא נשמר',
   confirmDelete: 'האם אתה בטוח שברצונך למחוק?',
   editTemplate: 'ערוך תבנית',
   autoSaved: 'נשמר אוטומטית',
   downloadSuccess: 'הקובץ הורד בהצלחה',
   downloadError: 'שגיאה בהורדת הקובץ',
   processing: 'מעבד...',
   sendSuccess: 'נשלח בהצלחה',
   sendError: 'שגיאה בשליחה'
 },
 buttons: {
   save: 'שמור',
   saving: 'שומר...',
   cancel: 'ביטול',
   delete: 'מחק',
   edit: 'ערוך',
   add: 'הוסף',
   download: 'הורד',
   close: 'סגור',
   back: 'חזור',
   downloadDocx: 'הורד כקובץ Word',
   downloadPdf: 'הורד כקובץ PDF',
   select: 'בחר',
   selected: 'נבחר',
   finish: 'סיום'
 },
 sections: {
   personalInfo: 'פרטים אישיים',
   experience: 'ניסיון תעסוקתי',
   education: 'השכלה',
   military: 'שירות צבאי',
   skills: 'כישורים',
   recommendations: 'המלצות',
   navigation: {
     next: 'הבא',
     back: 'חזור'
   }
 },
 personal: {
   name: 'שם מלא',
   namePlaceholder: 'הכנס את שמך המלא',
   title: 'תפקיד',
   titlePlaceholder: 'הכנס את התפקיד הנוכחי שלך',
   email: 'אימייל',
   emailPlaceholder: 'הכנס את כתובת האימייל שלך',
   phone: 'טלפון',
   phonePlaceholder: 'הכנס את מספר הטלפון שלך',
   address: 'כתובת',
   addressPlaceholder: 'הכנס את כתובת המגורים שלך',
   linkedin: 'לינקדאין',
   linkedinPlaceholder: 'הכנס את הקישור לפרופיל הלינקדאין שלך',
   summary: 'תקציר מקצועי',
   summaryPlaceholder: 'כתוב תקציר קצר על הניסיון והכישורים שלך',
   birthYear: 'שנת לידה',
   status: 'מצב משפחתי',
   viewProfile: 'צפה בפרופיל'
 },
 experience: {
   title: 'ניסיון תעסוקתי',
   position: 'תפקיד',
   positionPlaceholder: 'הכנס את שם התפקיד',
   company: 'חברה',
   companyPlaceholder: 'הכנס את שם החברה',
   location: 'מיקום',
   locationPlaceholder: 'עיר, מדינה',
   startDate: 'תאריך התחלה',
   endDate: 'תאריך סיום',
   current: 'עד היום',
   description: 'תיאור התפקיד',
   descriptionPlaceholder: 'תאר את תחומי האחריות והמשימות העיקריות',
   achievements: 'הישגים',
   achievementsPlaceholder: 'תאר הישגים משמעותיים בתפקיד',
   addDescription: 'הוסף תיאור',
   addAchievement: 'הוסף הישג',
   addNew: 'הוסף ניסיון תעסוקתי'
 },
 education: {
   title: 'השכלה',
   degree: 'תואר',
   degreePlaceholder: 'סוג התואר (לדוגמה: תואר ראשון)',
   institution: 'מוסד לימודים',
   institutionPlaceholder: 'שם המוסד האקדמי',
   field: 'תחום לימודים',
   fieldPlaceholder: 'תחום ההתמחות',
   graduationDate: 'תאריך סיום',
   description: 'פרטים נוספים',
   descriptionPlaceholder: 'הוסף מידע רלוונטי על הלימודים',
   addDescription: 'הוסף פרטים',
   addNew: 'הוסף השכלה'
 },
 military: {
   title: 'שירות צבאי',
   role: 'תפקיד',
   rolePlaceholder: 'התפקיד הצבאי שלך',
   unit: 'יחידה',
   unitPlaceholder: 'שם היחידה',
   startDate: 'תאריך גיוס',
   endDate: 'תאריך שחרור',
   description: 'תיאור השירות',
   descriptionPlaceholder: 'תאר את תפקידך ותחומי האחריות',
   achievements: 'הישגים',
   achievementsPlaceholder: 'ציין הישגים משמעותיים במהלך השירות',
   addDescription: 'הוסף תיאור',
   addAchievement: 'הוסף הישג'
 },
 skills: {
   title: 'כישורים',
   technical: 'כישורים טכניים',
   technicalPlaceholder: 'הוסף כישור טכני',
   soft: 'כישורים רכים',
   softPlaceholder: 'הוסף כישור רך',
   languages: 'שפות',
   languagePlaceholder: 'הוסף שפה',
   addTechnical: 'הוסף כישור טכני',
   addSoft: 'הוסף כישור רך',
   addLanguage: 'הוסף שפה',
   levels: {
     native: 'שפת אם',
     fluent: 'שוטף',
     professional: 'ברמה מקצועית',
     intermediate: 'ברמה בינונית',
     basic: 'ברמה בסיסית'
   }
 },
 references: {
   title: 'ממליצים',
   name: 'שם הממליץ',
   namePlaceholder: 'שם מלא של הממליץ',
   position: 'תפקיד',
   positionPlaceholder: 'תפקיד הממליץ',
   company: 'חברה',
   companyPlaceholder: 'שם החברה',
   relationship: 'קשר מקצעי',
   relationshipPlaceholder: 'תאר את הקשר המקצועי עם הממליץ',
   phone: 'טלפון',
   phonePlaceholder: 'מספר הטלפון של הממליץ',
   email: 'אימייל',
   emailPlaceholder: 'כתובת האימייל של הממליץ',
   addNew: 'הוסף ממליץ'
 },
 direction: 'rtl',
 aria: {
   cvPreview: 'תצוגה מקדימה של קורות החיים',
   downloadOptions: 'אפשרויות הורדה',
 },
 templates: {
   title: 'בחר תבנית מושלמת',
   classic: {
     name: 'קלאסי',
     description: 'מתאים למשרות אדמיניסטרטיביות, סוכנים ותפקידים הדורשים סדר וארגון',
     suitable: ['משרות אדמיניסטרטיביות', 'סוכנים', 'תפקידי ניהול', 'משרות מסורתיות']
   },
   professional: {
     name: 'מקצועי',
     description: 'מתאים למנהלים, אנשי פיננסים והייטק – מדגיש רצינות ומקצוענות',
     suitable: ['הייטק', 'פיננסים', 'ניהול בכיר', 'תפקידים מקצועיים']
   },
   general: {
     name: 'כללי',
     description: 'גמיש ומתאים למגוון תפקידים, כמו שירות לקוחות, מכירות וסטודנטים',
     suitable: ['שירות לקוחות', 'מכירות', 'סטודנטים', 'משרות התחלתיות']
   },
   creative: {
     name: 'קריאייטיבי',
     description: 'מיועד למעצבים, אנשי שיווק ואמנים שרוצים להבליט ייחודיות',
     suitable: ['עיצוב', 'שיווק', 'מדיה', 'אמנות']
   }
 },
 mobile: {
   previewTitle: 'צפייה בקורות החיים',
   previewDescription: 'לחץ על הכפתור למטה כדי לצפות בקורות החיים שלך בפורמט PDF',
   downloadTip: 'ניתן גם להוריד את הקובץ ולשמו או��ו במכשיר',
 },
 preview: {
   title: 'תצוגה מקדימה של קורות החיים',
 },
 finish: {
   title: 'סיימנו!',
   subtitle: 'קורות החיים שלך מוכנים! מה תרצה לעשות עכשיו?',
   translateButton: 'תרגום קורות החיים לאנגלית',
   lookButton: 'שנמצא לך עבודה?',
   imageAlt: 'סיום התהליך',
   translateAlt: 'תרגום קורות חיים',
   lookAlt: 'חיפוש עבודה'
 }
};