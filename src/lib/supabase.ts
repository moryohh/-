import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve standard environment variables safely for Vite client-side
const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  'https://qlfleszoyujelygwzdgu.supabase.co'
).trim();

// PUBLIC Anon key ONLY. Under no circumstances should service_role key be included in client code.
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZmxlc3pveXVqZWx5Z3d6ZGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjA0NDMsImV4cCI6MjEwMjAzNjQ0M30.2jZ1vh8O1VW_PzS6NlKAW1QDNHBW99IoHDwa2A7QVOI'
).trim();

export const SUPABASE_STORAGE_BUCKET = (
  import.meta.env.VITE_SUPABASE_BUCKET || 'educational-data'
).trim();

/**
 * Validates if the Supabase environment configuration is active and sound.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20
  );
};

let clientInstance: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client instance configured securely with the public Anon key.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not properly configured with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
};

// Exported singleton client for direct usage across the application
export const supabase = getSupabaseClient();
