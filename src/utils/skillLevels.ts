export const getSkillLevel = (level: number, lang: string = 'he') => {
  const levels: { [key: number]: { he: string; en: string } } = {
    5: { he: 'רמה גבוהה מאוד', en: 'Expert Level' },
    4: { he: 'רמה גבוהה', en: 'Advanced Level' },
    3: { he: 'רמה טובה', en: 'Intermediate Level' },
    2: { he: 'רמה בינונית', en: 'Basic Level' },
    1: { he: 'רמה בסיסית', en: 'Beginner Level' }
  };

  return levels[level]?.[lang as 'he' | 'en'] || 
    (lang === 'he' ? 'רמה טובה' : 'Good Level');
}; 