import type { ResumeData } from '@/types/resume';
import { supabase } from './supabase';

export async function getResumeData(id: string): Promise<ResumeData> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Error fetching resume data:', error);
    throw error;
  }
} 