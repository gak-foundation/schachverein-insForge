import { insforge } from '@/lib/insforge/client';

export const createClient = () => {
  return { auth: insforge.auth };
};

export const getSupabaseClient = createClient;
