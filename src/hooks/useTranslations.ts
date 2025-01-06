import { useParams } from 'next/navigation';
import { getDictionary } from '@/dictionaries';

export function useTranslations() {
  const params = useParams();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  return getDictionary(lang);
} 