import { useEffect, useState } from 'react';

export function useAutoSave<T>(
  currentData: T,
  lastSavedData: T,
  onSave: (data: T) => Promise<void>,
  delay: number
) {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // ... implementation
  }, [currentData, lastSavedData, onSave, delay]);

  return { isDirty, setIsDirty };
} 