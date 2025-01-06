export const useTextDirection = (text: string, defaultLang: 'he' | 'en') => {
  const isRTL = defaultLang === 'he';
  
  if (!text) return isRTL ? 'rtl' : 'ltr';
  
  const rtlChars = text.match(/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/g);
  const ltrChars = text.match(/[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8]/g);
  
  const rtlCount = rtlChars ? rtlChars.length : 0;
  const ltrCount = ltrChars ? ltrChars.length : 0;
  
  return rtlCount > ltrCount ? 'rtl' : 'ltr';
};
