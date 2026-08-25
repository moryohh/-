import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppThemeId =
  | 'solar_light'
  | 'golden_navy'
  | 'amber_work'
  | 'sky_cyan'
  | 'emerald_nature'
  | 'night';

export interface ThemeConfig {
  id: AppThemeId;
  name: string;
  subtitle: string;
  isLight: boolean;
  colors: {
    primary: string; // e.g. '#00A3FF'
    secondary: string;
    accent: string;
    bgMain: string;
    bgWrapper: string;
    bgCard: string;
    bgCardSubtle: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    glow: string;
  };
  classes: {
    outerBg: string;
    wrapperBg: string;
    headerBg: string;
    navBg: string;
    cardBg: string;
    cardSubtleBg: string;
    cardBorder: string;
    textMain: string;
    textMuted: string;
    accentText: string;
    accentBg: string;
    accentBorder: string;
    modalBg: string;
    glowBlob1: string;
    glowBlob2: string;
    pillActive: string;
  };
}

export const APP_THEMES: Record<AppThemeId, ThemeConfig> = {
  // 1. DEFAULT: Solar Light (Pure White / Day Mode)
  solar_light: {
    id: 'solar_light',
    name: 'النظام الشمسي المشرق (الافتراضي)',
    subtitle: 'واجهة بيضاء ساطعة ونقية عالية الوضوح مع تفاصيل شمسية زاهية',
    isLight: true,
    colors: {
      primary: '#0284C7',
      secondary: '#F59E0B',
      accent: '#2563EB',
      bgMain: '#E8EDF5',
      bgWrapper: '#F8FAFC',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#F1F5F9',
      border: 'rgba(0,0,0,0.1)',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      glow: 'rgba(2, 132, 199, 0.15)',
    },
    classes: {
      outerBg: 'bg-[#E2E8F0]',
      wrapperBg: 'bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9]',
      headerBg: 'bg-white/95',
      navBg: 'bg-white/95',
      cardBg: 'bg-white shadow-md',
      cardSubtleBg: 'bg-slate-50',
      cardBorder: 'border-slate-200/80 shadow-sm',
      textMain: 'text-slate-900',
      textMuted: 'text-slate-500',
      accentText: 'text-sky-600',
      accentBg: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
      accentBorder: 'border-sky-500/40',
      modalBg: 'bg-white text-slate-900',
      glowBlob1: 'bg-sky-400/10',
      glowBlob2: 'bg-amber-400/10',
      pillActive: 'bg-sky-600 text-white',
    },
  },

  // 2. Golden Royal (Light Ivory with Gold & Amber Accents)
  golden_navy: {
    id: 'golden_navy',
    name: 'النمط الذهبي الملكي',
    subtitle: 'أصفر ذهبي وبرتقالي ملكي متناسق مع خلفية عاجية فاتحة مشرقة',
    isLight: true,
    colors: {
      primary: '#D97706',
      secondary: '#F59E0B',
      accent: '#EA580C',
      bgMain: '#FEF3C7',
      bgWrapper: '#FFFDF5',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#FEF9C3',
      border: 'rgba(217,119,6,0.25)',
      textPrimary: '#451A03',
      textSecondary: '#78350F',
      glow: 'rgba(217, 119, 6, 0.2)',
    },
    classes: {
      outerBg: 'bg-[#FEF3C7]',
      wrapperBg: 'bg-gradient-to-b from-[#FFFDF5] via-[#FEF9EE] to-[#FEF3C7]',
      headerBg: 'bg-[#FFFDF5]/95',
      navBg: 'bg-[#FFFDF5]/95',
      cardBg: 'bg-white shadow-md',
      cardSubtleBg: 'bg-[#FEF9EE]',
      cardBorder: 'border-amber-200 shadow-sm',
      textMain: 'text-amber-950',
      textMuted: 'text-amber-700/80',
      accentText: 'text-amber-600',
      accentBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      accentBorder: 'border-amber-400/60',
      modalBg: 'bg-white text-amber-950',
      glowBlob1: 'bg-amber-400/15',
      glowBlob2: 'bg-orange-400/15',
      pillActive: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    },
  },

  // 3. Electric Amber Blue (Electric Yellow + Dark Blue + Clear Mid Blue)
  amber_work: {
    id: 'amber_work',
    name: 'النمط الكهربائي الكهرماني الأزرق',
    subtitle: 'أصفر كهربائي مع أزرق داكن وأزرق متوسط واضح القراءة',
    isLight: true,
    colors: {
      primary: '#F59E0B',
      secondary: '#FACC15',
      accent: '#2563EB',
      bgMain: '#DBEAFE',
      bgWrapper: '#F8FBFF',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#EFF6FF',
      border: 'rgba(37,99,235,0.24)',
      textPrimary: '#0F172A',
      textSecondary: '#1E3A8A',
      glow: 'rgba(37, 99, 235, 0.22)',
    },
    classes: {
      outerBg: 'bg-[#DBEAFE]',
      wrapperBg: 'bg-gradient-to-b from-[#FFFFFF] via-[#EFF6FF] to-[#DBEAFE]',
      headerBg: 'bg-[#F8FBFF]/95',
      navBg: 'bg-[#F8FBFF]/95',
      cardBg: 'bg-white shadow-md',
      cardSubtleBg: 'bg-[#EFF6FF]',
      cardBorder: 'border-blue-200 shadow-sm',
      textMain: 'text-slate-900',
      textMuted: 'text-blue-900/70',
      accentText: 'text-blue-700',
      accentBg: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-blue-600 text-slate-950',
      accentBorder: 'border-blue-400/60',
      modalBg: 'bg-white text-slate-900',
      glowBlob1: 'bg-blue-500/15',
      glowBlob2: 'bg-amber-400/20',
      pillActive: 'bg-blue-600 text-white',
    },
  },

  // 4. Sky Cyan (Light Crystal Ice & Bright Cyan)
  sky_cyan: {
    id: 'sky_cyan',
    name: 'النمط السماوي الساطع',
    subtitle: 'أزرق سماوي ناصع مع خلفية جليدية بيضاء منعشة ومريحة',
    isLight: true,
    colors: {
      primary: '#0284C7',
      secondary: '#06B6D4',
      accent: '#0EA5E9',
      bgMain: '#E0F2FE',
      bgWrapper: '#F0F9FF',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#E0F2FE',
      border: 'rgba(2,132,199,0.25)',
      textPrimary: '#0C4A6E',
      textSecondary: '#0369A1',
      glow: 'rgba(2, 132, 199, 0.2)',
    },
    classes: {
      outerBg: 'bg-[#E0F2FE]',
      wrapperBg: 'bg-gradient-to-b from-[#F0F9FF] via-[#E8F6FD] to-[#E0F2FE]',
      headerBg: 'bg-[#F0F9FF]/95',
      navBg: 'bg-[#F0F9FF]/95',
      cardBg: 'bg-white shadow-md',
      cardSubtleBg: 'bg-[#F0F9FF]',
      cardBorder: 'border-sky-200 shadow-sm',
      textMain: 'text-sky-950',
      textMuted: 'text-sky-700/80',
      accentText: 'text-sky-600',
      accentBg: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white',
      accentBorder: 'border-sky-400/60',
      modalBg: 'bg-white text-sky-950',
      glowBlob1: 'bg-sky-400/15',
      glowBlob2: 'bg-cyan-400/15',
      pillActive: 'bg-sky-600 text-white',
    },
  },

  // 5. Emerald Nature (Light Mint & Emerald Green)
  emerald_nature: {
    id: 'emerald_nature',
    name: 'النمط الطبيعي الزمردي',
    subtitle: 'أخضر زمردي مهدئ بخلفية نعناعية بيضاء طبيعية تريح العينين',
    isLight: true,
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#0D9488',
      bgMain: '#D1FAE5',
      bgWrapper: '#F0FDF4',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#ECFDF5',
      border: 'rgba(5,150,105,0.25)',
      textPrimary: '#064E3B',
      textSecondary: '#047857',
      glow: 'rgba(5, 150, 105, 0.2)',
    },
    classes: {
      outerBg: 'bg-[#D1FAE5]',
      wrapperBg: 'bg-gradient-to-b from-[#F0FDF4] via-[#E6F9EE] to-[#D1FAE5]',
      headerBg: 'bg-[#F0FDF4]/95',
      navBg: 'bg-[#F0FDF4]/95',
      cardBg: 'bg-white shadow-md',
      cardSubtleBg: 'bg-[#ECFDF5]',
      cardBorder: 'border-emerald-200 shadow-sm',
      textMain: 'text-emerald-950',
      textMuted: 'text-emerald-700/80',
      accentText: 'text-emerald-600',
      accentBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
      accentBorder: 'border-emerald-400/60',
      modalBg: 'bg-white text-emerald-950',
      glowBlob1: 'bg-emerald-400/15',
      glowBlob2: 'bg-teal-400/15',
      pillActive: 'bg-emerald-600 text-white',
    },
  },

  // 6. Quiet Night Theme (soft twilight light mode)
  night: {
    id: 'night',
    name: 'النمط الليلي الهادئ',
    subtitle: 'ألوان غروب ليلية فاتحة وهادئة ومريحة للعين',
    isLight: true,
    colors: {
      primary: '#475569',
      secondary: '#7C3AED',
      accent: '#2563EB',
      bgMain: '#E8EDF7',
      bgWrapper: '#F7F8FC',
      bgCard: '#FFFFFF',
      bgCardSubtle: '#EEF2F8',
      border: 'rgba(71,85,105,0.18)',
      textPrimary: '#1E293B',
      textSecondary: '#475569',
      glow: 'rgba(71, 85, 105, 0.16)',
    },
    classes: {
      outerBg: 'bg-[#E8EDF7]',
      wrapperBg: 'bg-gradient-to-b from-[#F7F8FC] via-[#F1F4FA] to-[#E8EDF7]',
      headerBg: 'bg-[#F7F8FC]/95',
      navBg: 'bg-[#F7F8FC]/95',
      cardBg: 'bg-white shadow-md',
      cardSubtleBg: 'bg-[#EEF2F8]',
      cardBorder: 'border-slate-300/70 shadow-sm',
      textMain: 'text-slate-800',
      textMuted: 'text-slate-500',
      accentText: 'text-indigo-600',
      accentBg: 'bg-gradient-to-r from-slate-600 to-indigo-600 text-white',
      accentBorder: 'border-indigo-400/60',
      modalBg: 'bg-white text-slate-800',
      glowBlob1: 'bg-indigo-400/10',
      glowBlob2: 'bg-slate-400/15',
      pillActive: 'bg-indigo-600 text-white',
    },
  },
};

const THEME_STORAGE_KEY = 'nahnu_maak_app_theme_v2';
const THEME_STORAGE_FALLBACK_KEY = 'nahnu_maak_theme_backup';

interface ThemeContextType {
  currentThemeId: AppThemeId;
  theme: ThemeConfig;
  setThemeId: (id: AppThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  currentThemeId: 'solar_light',
  theme: APP_THEMES.solar_light,
  setThemeId: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<AppThemeId>(() => {
    try {
      const saved = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(THEME_STORAGE_FALLBACK_KEY)) as AppThemeId;
      if (saved && APP_THEMES[saved]) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'solar_light'; // Default is now Solar Light (White)
  });

  const setThemeId = (id: AppThemeId) => {
    if (APP_THEMES[id]) {
      setCurrentThemeId(id);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, id);
        localStorage.setItem(THEME_STORAGE_FALLBACK_KEY, id);
      } catch {
        // ignore
      }
    }
  };

  const theme = APP_THEMES[currentThemeId] || APP_THEMES.solar_light;

  return (
    <ThemeContext.Provider value={{ currentThemeId, theme, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
