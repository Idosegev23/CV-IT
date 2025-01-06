import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const getSession = async () => {
  const supabase = createClientComponentClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
};

export const getUser = async () => {
  const session = await getSession();
  return session?.user;
};

export const signOut = async () => {
  const supabase = createClientComponentClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const updateSession = async (data: any) => {
  const supabase = createClientComponentClient();
  const { error } = await supabase.auth.updateUser(data);
  if (error) {
    throw error;
  }
}; 