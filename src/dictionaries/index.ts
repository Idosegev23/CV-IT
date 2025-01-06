import { Dictionary } from './dictionary';
import { en } from './en';
import { he } from './he';

export const dictionaries: { [key: string]: Dictionary } = {
  en,
  he
};

export type { Dictionary };

/**
 * מחזיר את המילון המתאים לשפה הנבחרת
 * @param lang קוד השפה (he/en)
 * @returns מילון התרגומים המתאים
 */
export const getDictionary = (lang: string): Dictionary => {
  const dictionary = dictionaries[lang] || en; // ברירת מחדל לאנגלית
  
  // בדיקת מפתחות חובה
  const requiredKeys = ['editor', 'errors', 'messages', 'buttons', 'sections'];
  const missingKeys = requiredKeys.filter(key => !dictionary[key]);
  
  if (missingKeys.length > 0) {
    console.warn(`Missing translations for: ${missingKeys.join(', ')}`);
  }

  return dictionary;
};

export default getDictionary; 