import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseConfig } from '@/lib/supabaseConfig';

let client: SupabaseClient | null = null;

/** Browser Supabase client (publishable key + the owner's session). Admin/preview only. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see SETUP.md).');
  }
  client ??= createClient(supabaseConfig.url, supabaseConfig.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'portfolio-admin-auth',
    },
  });
  return client;
}
