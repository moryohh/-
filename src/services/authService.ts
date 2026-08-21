import { getSupabaseClient } from '../lib/supabase';
import { UserProfile } from '../types';

const STORAGE_KEY = 'nahnu_maak_current_user';

export const DEV_MOCK_USER: UserProfile = {
  id: 'dev-guest-001',
  name: 'مطور المنصة',
  email: 'dev@platform.local',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  grade: 'السادس الإعدادي',
  branch: 'الفرع العلمي',
  level: 22,
  points: 2250,
  studyHours: 14.2,
  streakDays: 12,
  isDevBypass: true,
};

/**
 * Check if the user object is the developer bypass session
 */
export const isDeveloperBypass = (user: UserProfile | null): boolean => {
  return !!user?.isDevBypass || user?.id === 'dev-guest-001';
};

/**
 * Get locally stored user session
 */
export const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Store user session in localStorage
 */
export const storeUser = (user: UserProfile | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error updating localStorage auth user:', err);
  }
};

/**
 * Synchronize or upsert student profile data into Supabase 'profiles' table
 */
export async function syncUserProfile(supabaseUser: any): Promise<UserProfile> {
  const client = getSupabaseClient();
  const userId = supabaseUser.id;
  const email = supabaseUser.email || '';
  const meta = supabaseUser.user_metadata || {};

  const name =
    meta.full_name ||
    meta.name ||
    meta.user_name ||
    email.split('@')[0] ||
    'طالب المنصة';

  const avatarUrl =
    meta.avatar_url ||
    meta.picture ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  const baseProfile: UserProfile = {
    id: userId,
    email,
    name,
    avatarUrl,
    grade: meta.grade || 'السادس الإعدادي',
    branch: meta.branch || 'الفرع العلمي',
    level: 1,
    points: 100,
    studyHours: 0.5,
    streakDays: 1,
    isDevBypass: false,
  };

  if (!client) {
    storeUser(baseProfile);
    return baseProfile;
  }

  try {
    // 1. Try to fetch existing profile from 'profiles' table
    const { data: existingProfile, error: fetchErr } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile && !fetchErr) {
      const mergedProfile: UserProfile = {
        id: userId,
        email: existingProfile.email || email,
        name: existingProfile.full_name || existingProfile.name || name,
        avatarUrl: existingProfile.avatar_url || avatarUrl,
        grade: existingProfile.grade || 'السادس الإعدادي',
        branch: existingProfile.branch || 'الفرع العلمي',
        level: existingProfile.level || 1,
        points: existingProfile.points || 100,
        studyHours: existingProfile.study_hours || 0.5,
        streakDays: existingProfile.streak_days || 1,
        isDevBypass: false,
      };
      storeUser(mergedProfile);
      return mergedProfile;
    }

    // 2. Insert or update student profile in Supabase table
    const profilePayload = {
      id: userId,
      email,
      full_name: name,
      avatar_url: avatarUrl,
      grade: 'السادس الإعدادي',
      branch: 'الفرع العلمي',
      updated_at: new Date().toISOString(),
    };

    await client
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    storeUser(baseProfile);
    return baseProfile;
  } catch (err) {
    console.warn('Profile sync fallback gracefully used:', err);
    storeUser(baseProfile);
    return baseProfile;
  }
}

/**
 * 1. Sign In With Google OAuth
 */
export async function signInWithGoogle(): Promise<{ error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'خدمة Supabase غير مهيأة حالياً. يمكنك استخدام الدخول السريع للمطور.' };
  }

  try {
    const redirectUrl = window.location.origin;

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (err: any) {
    return { error: err.message || 'حدث خطأ أثناء الاتصال بمزود Google' };
  }
}

/**
 * 2. Sign In as Developer (Temporary Bypass)
 */
export function signInAsDeveloper(): UserProfile {
  storeUser(DEV_MOCK_USER);
  return DEV_MOCK_USER;
}

/**
 * 3. Sign In With Email & Password
 */
export async function signInWithEmailPassword(
  email: string,
  pass: string
): Promise<{ user?: UserProfile; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'خدمة Supabase غير متوفرة.' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.user) {
      const profile = await syncUserProfile(data.user);
      return { user: profile };
    }

    return { error: 'لم يتم العثور على بيانات المستخدم' };
  } catch (err: any) {
    return { error: err.message || 'فشل تسجيل الدخول' };
  }
}

/**
 * 4. Sign Up With Email & Password
 */
export async function signUpWithEmailPassword(
  email: string,
  pass: string,
  fullName: string
): Promise<{ user?: UserProfile; error?: string; message?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'خدمة Supabase غير متوفرة.' };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.user) {
      const profile = await syncUserProfile(data.user);
      return {
        user: profile,
        message: 'تم إنشاء الحساب بنجاح! تفقد بريدك لتأكيد الحساب إذا لزم الأمر.',
      };
    }

    return { message: 'تم إرسال رسالة التأكيد إلى بريدك الإلكتروني.' };
  } catch (err: any) {
    return { error: err.message || 'فشل إنشاء الحساب' };
  }
}

/**
 * 5. Sign Out
 */
export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  storeUser(null);
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Error signing out from Supabase:', err);
    }
  }
}

/**
 * 6. Get Current Auth State on App Startup
 */
export async function getInitialAuthState(): Promise<UserProfile | null> {
  // Check stored dev session first
  const localUser = getStoredUser();
  if (localUser && localUser.isDevBypass) {
    return localUser;
  }

  const client = getSupabaseClient();
  if (!client) {
    return localUser;
  }

  try {
    const { data } = await client.auth.getSession();
    if (data?.session?.user) {
      return await syncUserProfile(data.session.user);
    }
  } catch (err) {
    console.debug('No active supabase session:', err);
  }

  return localUser;
}

/**
 * 7. Listen for Auth State Changes (OAuth redirect completions, token refresh, etc.)
 */
export function onAuthStateChange(callback: (user: UserProfile | null) => void) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const { data } = client.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const profile = await syncUserProfile(session.user);
      callback(profile);
    } else if (event === 'SIGNED_OUT') {
      const current = getStoredUser();
      if (!current?.isDevBypass) {
        storeUser(null);
        callback(null);
      }
    }
  });

  return () => {
    data.subscription.unsubscribe();
  };
}
