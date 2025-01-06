export const adjustTemplateSize = (selector: string) => {
  const content = document.querySelector(selector) as HTMLElement;
  if (!content) return;
  
  // גודל A4 בפיקסלים (בקירוב)
  const A4_HEIGHT = 1123; // 297mm בערך
  
  let scale = 1;
  const contentHeight = content.scrollHeight;
  
  if (contentHeight > A4_HEIGHT) {
    scale = A4_HEIGHT / contentHeight;
    document.documentElement.style.setProperty('--scale-factor', `${scale}`);
  }
};

export const getSkillLevel = (level: number): string => {
  switch (level) {
    case 1:
      return 'מתחיל';
    case 2:
      return 'בינוני';
    case 3:
      return 'מתקדם';
    case 4:
      return 'מומחה';
    default:
      return '';
  }
};

export const formatDate = (startDate: string, endDate: string, lang: string): string => {
  if (!startDate && !endDate) return '';
  
  const present = lang === 'he' ? 'עד היום' : 'Present';
  const to = lang === 'he' ? 'עד' : 'to';
  
  if (!endDate || endDate.toLowerCase() === 'present') {
    return `${startDate} - ${present}`;
  }
  
  return `${startDate} ${to} ${endDate}`;
};

export const splitName = (fullName: string): { firstName: string; lastName: string } => {
  if (!fullName) return { firstName: '', lastName: '' };
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  
  return { firstName, lastName };
}; 