/**
 * מקבל תאריך בפורמט YYYY-MM ומחזיר אותו בפורמט מקוצר
 * @param dateString תאריך בפורמט YYYY-MM
 * @returns תאריך מפורמט (לדוגמה: "Jan 2024")
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // אם התאריך הוא "היום" או "present"
  if (dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'היום') {
    return dateStr;
  }

  // אם התאריך הוא רק שנה
  if (/^\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  try {
    // ניסיון לפרסר את התאריך
    const date = new Date(dateStr);
    
    // בדיקה אם התאריך תקין
    if (isNaN(date.getTime())) {
      return dateStr; // אם לא תקין, נחזיר את המחרוזת המקורית
    }

    // פורמט התאריך
    const month = date.toLocaleString('he', { month: 'long' });
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr; // במקרה של שגיאה, נחזיר את המחרוזת המקורית
  }
}

/**
 * מחזיר טווח תאריכים מפורמט
 * @param startDate תאריך התחלה
 * @param endDate תאריך סיום
 * @param lang שפה (he/en)
 * @returns טווח תאריכים מפורמט
 */
export function formatDateRange(
  startDate: string, 
  endDate: string, 
  lang: string = 'he'
): string {
  if (!startDate && !endDate) return '';
  
  const formattedStart = formatDate(startDate);
  const formattedEnd = endDate ? formatDate(endDate) : (lang === 'he' ? 'היום' : 'Present');
  
  // אם יש רק שנים, נציג אותן
  if (/^\d{4}$/.test(startDate) && /^\d{4}$/.test(endDate)) {
    return `${startDate}-${endDate}`;
  }
  
  // אחרת, נציג את הפורמט המלא
  return `${formattedStart} - ${formattedEnd}`;
}

/**
 * מחשב את משך הזמן בין שני תאריכים
 * @param startDate תאריך התחלה
 * @param endDate תאריך סיום
 * @param lang שפה (he/en)
 * @returns משך זמן מפורמט (לדוגמה: "2 years 3 months")
 */
export const calculateDuration = (startDate?: string, endDate?: string, lang: string = 'en'): string => {
  if (!startDate) return '';
  
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                  (end.getMonth() - start.getMonth());
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (lang === 'he') {
      const yearsText = years > 0 ? `${years} שנים` : '';
      const monthsText = remainingMonths > 0 ? `${remainingMonths} חודשים` : '';
      return [yearsText, monthsText].filter(Boolean).join(' ו-');
    } else {
      const yearsText = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
      const monthsText = remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : '';
      return [yearsText, monthsText].filter(Boolean).join(' ');
    }
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '';
  }
}; 