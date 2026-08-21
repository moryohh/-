import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { useAppTheme } from '../services/themeService';

interface HeaderProps {
  title?: string;
  unreadCount: number;
  showBackButton?: boolean;
  onBack?: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenGames?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadCount,
  showBackButton = false,
  onBack,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const { theme } = useAppTheme();

  return (
    <header
      className={`sticky top-0 z-30 ${theme.classes.headerBg} backdrop-blur-xl border-b ${theme.classes.cardBorder} px-4 py-3 relative flex items-center justify-between min-h-[58px] transition-all duration-300`}
    >
      {/* Right side (in RTL): Back button if needed, or placeholder for balance */}
      <div className="flex items-center gap-2 z-10">
        {showBackButton && onBack ? (
          <button
            onClick={onBack}
            className={`px-3 py-1.5 rounded-xl ${theme.classes.cardBg} border ${theme.classes.cardBorder} flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-lg cursor-pointer`}
            aria-label="رجوع للرئيسية"
            title="الرجوع للصفحة الرئيسية"
            style={{
              color: theme.colors.primary,
            }}
          >
            <ArrowRight className="w-4 h-4" style={{ color: theme.colors.primary }} />
            <span className={`text-xs font-bold ${theme.classes.textMain}`}>رجوع</span>
          </button>
        ) : (
          <div className="w-9 h-9 opacity-0 pointer-events-none" />
        )}
      </div>

      {/* Center: App Logo 'منصة نحن معك' strictly centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1.5 select-none pointer-events-auto">
          {/* Glowing Sparkle Icon */}
          <div className="relative flex items-center justify-center">
            <span
              className="text-lg font-black filter"
              style={{
                color: theme.colors.secondary,
                filter: `drop-shadow(0 0 8px ${theme.colors.secondary})`,
              }}
            >
              ✦
            </span>
          </div>

          {/* Calligraphic / Modern Logo Text */}
          <h1 className="text-base sm:text-lg font-black tracking-wide leading-none flex items-center gap-1">
            <span className={`${theme.classes.textMain} drop-shadow-sm font-sans`}>منصة</span>
            <span
              className="font-sans"
              style={{
                color: theme.colors.secondary,
                filter: `drop-shadow(0 0 10px ${theme.colors.glow})`,
              }}
            >
              نحن معك
            </span>
          </h1>
        </div>
      </div>

      {/* Left side: Icons (Notification & Profile Avatar) */}
      <div className="flex items-center gap-2.5 z-10">
        {/* Notification Bell with Badge */}
        <button
          onClick={onOpenNotifications}
          className={`relative w-9 h-9 rounded-full ${theme.classes.cardBg} border ${theme.classes.cardBorder} flex items-center justify-center transition-all active:scale-95 ${theme.classes.textMuted} hover:${theme.classes.textMain} cursor-pointer`}
          aria-label="الإشعارات"
          title="الإشعارات"
        >
          <Bell className="w-4.5 h-4.5" />
          <span
            className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-white text-[9px] font-black rounded-full flex items-center justify-center border shadow-sm"
            style={{
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.bgMain,
            }}
          >
            {unreadCount > 0 ? unreadCount : 4}
          </span>
        </button>

        {/* Student Avatar */}
        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full p-[1.5px] transition-all active:scale-95 shrink-0 overflow-hidden cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent})`,
            boxShadow: `0 0 10px ${theme.colors.glow}`,
          }}
          aria-label="الحساب"
          title="الحساب الشخصي"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="صورة الطالب"
            className="w-full h-full object-cover rounded-full"
          />
        </button>
      </div>
    </header>
  );
};
