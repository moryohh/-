import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read configuration from environment variables safely
const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] || '';
  }
  return '';
};

// Default Anon Key provided for the project (Service Role key has been removed completely)
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZmxlc3pveXVqZWx5Z3d6ZGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjA0NDMsImV4cCI6MjEwMjAzNjQ0M30.2jZ1vh8O1VW_PzS6NlKAW1QDNHBW99IoHDwa2A7QVOI';

const defaultProjectUrl = 'https://qlfleszoyujelygwzdgu.supabase.co';

const rawKey = (
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  getEnv('VITE_SUPABASE_KEY') ||
  getEnv('VITE_SUPABASE_API_KEY') ||
  getEnv('VITE_KEY') ||
  defaultAnonKey
).trim();

const rawUrl = (getEnv('VITE_SUPABASE_URL') || defaultProjectUrl).trim();
export const SUPABASE_STORAGE_BUCKET = (getEnv('VITE_SUPABASE_BUCKET') || 'educational-data').trim();

/**
 * Extracts Supabase Project URL from a JWT token if only 1 key was provided.
 */
function extractUrlFromJwtKey(key: string): string | null {
  if (!key) return null;
  try {
    const parts = key.split('.');
    if (parts.length === 3) {
      // Decode Base64 URL payload
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadStr = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(payloadStr);

      if (payload.iss && typeof payload.iss === 'string' && payload.iss.startsWith('http')) {
        return payload.iss.replace(/\/auth\/v1\/?$/, '');
      }
      if (payload.ref && typeof payload.ref === 'string') {
        return `https://${payload.ref}.supabase.co`;
      }
    }
  } catch (err) {
    console.debug('Could not auto-extract Supabase URL from JWT key:', err);
  }
  return null;
}

// Resolve effective Supabase URL & Key
export const getResolvedSupabaseConfig = () => {
  const key = rawKey;
  let url = rawUrl;

  if (!url && key) {
    const autoUrl = extractUrlFromJwtKey(key);
    if (autoUrl) {
      url = autoUrl;
    }
  }

  return { url, key };
};

// Check if credentials are properly configured (either full URL+Key or valid 1-Key)
export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getResolvedSupabaseConfig();
  return !!(
    key &&
    key.length > 20 &&
    !key.includes('ضع_مفتاح') &&
    url &&
    url.startsWith('https://') &&
    !url.includes('ضع_رابط')
  );
};

let clientInstance: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client instance configured with the public Anon key.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, key } = getResolvedSupabaseConfig();

  if (!clientInstance && url && key) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
};

const resolved = getResolvedSupabaseConfig();
export const supabase = isSupabaseConfigured() && resolved.url && resolved.key
  ? createClient(resolved.url, resolved.key)
  : null;
