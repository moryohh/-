import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Zap,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAppTheme } from '../services/themeService';
import {
  signInWithGoogle,
  signInAsDeveloper,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from '../services/authService';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBypassAsGuest?: () => void;
}

const IS_DEV_MODE = true;

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
}) => {
  const { theme } = useAppTheme();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Google OAuth Sign-in
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setErrorMessage(res.error);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بمزود Google');
      setIsGoogleLoading(false);
    }
  };

  // 2. Developer Quick Bypass Login
  const handleDeveloperBypass = () => {
    setErrorMessage(null);
    const devUser = signInAsDeveloper();
    onLoginSuccess(devUser);
  };

  // 3. Email & Password Form Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const res = await signInWithEmailPassword(email.trim(), password.trim());
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          onLoginSuccess(res.user);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('يرجى إدخال اسم الطالب الكامل');
          setIsLoading(false);
          return;
        }
        const res = await signUpWithEmailPassword(email.trim(), password.trim(), fullName.trim());
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          if (res.message) {
            setSuccessMessage(res.message);
          }
          if (res.user) {
            onLoginSuccess(res.user);
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 text-right select-none animate-in fade-in duration-300">
      <div
        className={`w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border relative overflow-hidden transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 12px 40px ${theme.colors.glow}`,
        }}
      >
        {/* Top Decorative Glow Line */}
        <div
          className="absolute top-0 inset-x-0 h-1.5 transition-colors"
          style={{
            background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent})`,
          }}
        />

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2 mb-6">
          <div className="inline-flex items-center justify-center gap-1.5 mb-1">
            <span
              className="text-xl font-black filter"
              style={{
                color: theme.colors.secondary,
                filter: `drop-shadow(0 0 10px ${theme.colors.secondary})`,
              }}
            >
              ✦
            </span>
            <h1 className="text-2xl font-black tracking-wide leading-none flex items-center gap-1.5">
              <span className={theme.classes.textMain}>منصة</span>
              <span
                style={{
                  color: theme.colors.secondary,
                  filter: `drop-shadow(0 0 12px ${theme.colors.glow})`,
                }}
              >
                نحن معك
              </span>
            </h1>
          </div>

          <p className={`text-xs ${theme.classes.textMuted} font-medium`}>
            المنصة التفاعلية لطلاب السادس الإعدادي • المنهج العراقي المعتمد
          </p>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1"
              style={{
                backgroundColor: `${theme.colors.primary}15`,
                borderColor: `${theme.colors.primary}40`,
                color: theme.colors.primary,
              }}
            >
              <ShieldCheck className="w-3 h-3" />
              دفعة 2026
            </span>
            <span
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
            >
              <Zap className="w-3 h-3" />
              الفرع العلمي والأدبي
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. GOOGLE OAUTH ONE-CLICK LOGIN BUTTON */}
        {/* ======================================================== */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className={`w-full py-3.5 px-4 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] shadow-md cursor-pointer ${
              theme.isLight
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-900/90 hover:bg-slate-800 border-white/20 text-white'
            }`}
            style={{
              boxShadow: `0 4px 20px ${theme.colors.glow}`,
            }}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: theme.colors.primary }} />
                <span>جاري الاتصال بـ Google...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' Multi-color SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-black">التسجيل باستخدام Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className={`flex-1 h-px ${theme.classes.cardBorder} bg-current opacity-20`} />
            <span className={`text-[11px] font-bold ${theme.classes.textMuted}`}>
              أو عبر البريد الإلكتروني
            </span>
            <div className={`flex-1 h-px ${theme.classes.cardBorder} bg-current opacity-20`} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. TAB TOGGLE (LOGIN / SIGNUP) */}
        {/* ======================================================== */}
        <div
          className={`grid grid-cols-2 p-1 rounded-2xl border mb-4 ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
        >
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              authMode === 'login'
                ? 'text-white shadow-md'
                : `${theme.classes.textMuted} hover:${theme.classes.textMain}`
            }`}
            style={
              authMode === 'login'
                ? {
                    backgroundColor: theme.colors.primary,
                    boxShadow: `0 2px 10px ${theme.colors.glow}`,
                  }
                : {}
            }
          >
            تسجيل الدخول
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'text-white shadow-md'
                : `${theme.classes.textMuted} hover:${theme.classes.textMain}`
            }`}
            style={
              authMode === 'signup'
                ? {
                    backgroundColor: theme.colors.primary,
                    boxShadow: `0 2px 10px ${theme.colors.glow}`,
                  }
                : {}
            }
          >
            حساب طالب جديد
          </button>
        </div>

        {/* ======================================================== */}
        {/* 3. EMAIL & PASSWORD FORM */}
        {/* ======================================================== */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className={`text-[11px] font-bold block ${theme.classes.textMain}`}>
                اسم الطالب الثلاثي
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: علي حيدر عبد الله"
                  className={`w-full pl-3 pr-9 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
                  style={{ borderColor: theme.colors.primary }}
                />
                <User
                  className="w-4 h-4 absolute right-3 top-3"
                  style={{ color: theme.colors.primary }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className={`text-[11px] font-bold block ${theme.classes.textMain}`}>
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className={`w-full pl-3 pr-9 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
                style={{ borderColor: theme.colors.primary }}
              />
              <Mail
                className="w-4 h-4 absolute right-3 top-3"
                style={{ color: theme.colors.primary }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-[11px] font-bold block ${theme.classes.textMain}`}>
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-3 pr-9 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
                style={{ borderColor: theme.colors.primary }}
              />
              <Lock
                className="w-4 h-4 absolute right-3 top-3"
                style={{ color: theme.colors.primary }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer mt-2 disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: `0 4px 15px ${theme.colors.glow}`,
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{authMode === 'login' ? 'دخول للمنصة' : 'إنشاء الحساب وبدء الدراسة'}</span>
              </>
            )}
          </button>
        </form>

        {/* ======================================================== */}
        {/* 4. DEVELOPER QUICK LOGIN / TEMPORARY BYPASS BUTTON */}
        {/* ======================================================== */}
        {IS_DEV_MODE && (
          <div className="mt-6 pt-4 border-t text-center space-y-2 border-dashed border-white/20">
            <button
              type="button"
              onClick={handleDeveloperBypass}
              className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:opacity-90 active:scale-95 ${
                theme.isLight
                  ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>دخول سريع كمطور 🛠️ (تجاوز مؤقت)</span>
            </button>
            <p className={`text-[10px] ${theme.classes.textMuted}`}>
              مخصص للتجربة البرمجية السريعة والتحقق الفوري دون طلب كلمة مرور.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
