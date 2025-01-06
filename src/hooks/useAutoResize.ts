import { RefObject, useEffect } from 'react';

interface AutoResizeOptions {
  minHeight?: number;
  maxHeight?: number;
}

export const useAutoResize = (
  ref: RefObject<HTMLTextAreaElement>,
  value: string,
  options: AutoResizeOptions = {}
) => {
  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, options.minHeight || 0),
        options.maxHeight || Infinity
      );
      textarea.style.height = `${newHeight}px`;
    };

    adjustHeight();

    // האזנה לשינויי גודל חלון
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [ref, value, options.minHeight, options.maxHeight]);
}; 