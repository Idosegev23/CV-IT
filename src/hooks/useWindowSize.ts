'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // הוספת האזנה לשינויי גודל מסך
    window.addEventListener('resize', handleResize);
    
    // קריאה ראשונית לקבלת גודל המסך
    handleResize();

    // ניקוי האזנה בעת סגירת הקומפוננטה
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
} 