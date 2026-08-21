import React, { useState } from 'react';
import {
  User,
  ChevronLeft,
  Check,
  Palette,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Crown,
  Leaf,
  Zap,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useAppTheme, AppThemeId } from '../services/themeService';
import { gameAudio } from '../utils/gameAudio';

interface SettingsViewProps {
  onOpenProfile?: () => void;
  onBack?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenProfile, onBack }) => {
  const { currentThemeId, theme, setThemeId } = useAppTheme();
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const themeList: {
    id: AppThemeId;
    title: string;
    description: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    swatches: string[];
    gradient: string;
  }[] = [
    {
      id: 'solar_light',
      title: 'النظام الشمسي المشرق (الافتراضي)',
      description: 'واجهة نهارية بيضاء نقية عالية الوضوح مع تفاصيل شمسية زاهية',
      badge: 'الافتراضي (أبيض)',
      icon: Sun,
      swatches: ['#FFFFFF', '#0284C7', '#F59E0B', '#F1F5F9'],
      gradient: 'from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9]',
    },
    {
      id: 'golden_navy',
      title: 'النمط الذهبي الملكي (فاتح)',
      description: 'أصفر ذهبي وعاجي مشرق بدون أي سواد متناسق وفاخر',
      badge: 'ذهبي فاتح',
      icon: Crown,
      swatches: ['#FFFDF5', '#D97706', '#F59E0B', '#FEF3C7'],
      gradient: 'from-[#FFFDF5] via-[#FEF9EE] to-[#FEF3C7]',
    },
    {
      id: 'amber_work',
      title: 'نمط العمل والتركيز الكهرماني (فاتح)',
      description: 'أصفر مكثف وعنبري دافئ بخلفية فاتحة مشجعة للنشاط والتركيز',
      badge: 'أصفر فاتح',
      icon: Zap,
      swatches: ['#FFFFF0', '#CA8A04', '#EAB308', '#FEF9C3'],
      gradient: 'from-[#FFFFF0] via-[#FEFCE8] to-[#FEF9C3]',
    },
    {
      id: 'sky_cyan',
      title: 'النمط السماوي الساطع (فاتح)',
      description: 'أزرق سماوي كريستالي ناصع مع خلفية جليدية بيضاء منعشة',
      badge: 'سماوي فاتح',
      icon: Sparkles,
      swatches: ['#F0F9FF', '#0284C7', '#06B6D4', '#E0F2FE'],
      gradient: 'from-[#F0F9FF] via-[#E8F6FD] to-[#E0F2FE]',
    },
    {
      id: 'emerald_nature',
      title: 'النمط الطبيعي الزمردي (فاتح)',
      description: 'أخضر زمردي مهدئ بخلفية نعناعية بيضاء طبيعية تريح العينين',
      badge: 'زمردي فاتح',
      icon: Leaf,
      swatches: ['#F0FDF4', '#059669', '#10B981', '#D1FAE5'],
      gradient: 'from-[#F0FDF4] via-[#E6F9EE] to-[#D1FAE5]',
    },
    {
      id: 'night',
      title: 'النمط الليلي الفلكي (داكن)',
      description: 'الخيار الداكن الوحيد: أزرق داكن وسماء ليلية فلكية مريحة',
      badge: 'داكن فقط',
      icon: Moon,
      swatches: ['#090e1f', '#00A3FF', '#1A1A24', '#38BDF8'],
      gradient: 'from-[#090e1f] via-[#070b18] to-[#04060d]',
    },
  ];

  const handleSelectTheme = (tId: AppThemeId) => {
    gameAudio.playClick();
    setThemeId(tId);
  };

  const currentThemeObj = themeList.find((t) => t.id === currentThemeId) || themeList[0];
  const CurrentIcon = currentThemeObj.icon;

  return (
    <div className="space-y-4 px-2 sm:px-3 pt-2 pb-20 animate-in fade-in duration-200 select-none text-right">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              borderColor: `${theme.colors.primary}40`,
              color: theme.colors.primary,
            }}
          >
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h1 className={`text-base font-black ${theme.classes.textMain}`}>الإعدادات</h1>
            <p className={`text-[10px] ${theme.classes.textMuted}`}>إدارة الحساب ومظهر العرض</p>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
            style={{ color: theme.colors.primary }}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. PROFILE / ACCOUNT CARD (الصفحة الشخصية) */}
      {/* ======================================================== */}
      <div
        onClick={onOpenProfile}
        className={`p-4 rounded-3xl border transition-all duration-300 shadow-xl cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 8px 30px ${theme.colors.glow}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-13 h-13 rounded-2xl p-0.5 border shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  borderColor: theme.colors.primary,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                  alt="الصورة الشخصية"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-black group-hover:opacity-80 transition-opacity ${theme.classes.textMain}`}>
                  أحمد حيدر
                </h3>
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${theme.colors.primary}20`,
                    borderColor: `${theme.colors.primary}40`,
                    color: theme.colors.primary,
                  }}
                >
                  السادس الإعدادي
                </span>
              </div>
              <p className={`text-xs ${theme.classes.textMuted}`}>الفرع العلمي • العراق</p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-500" />
                  مستوى 22
                </span>
                <span className={`text-[10px] ${theme.classes.textMuted}`}>• 2,250 نقطة</span>
              </div>
            </div>
          </div>

          <div
            className="w-8 h-8 rounded-xl border flex items-center justify-center group-hover:-translate-x-1 transition-transform"
            style={{
              backgroundColor: `${theme.colors.primary}15`,
              borderColor: `${theme.colors.primary}30`,
              color: theme.colors.primary,
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SINGLE DEDICATED COLOR / DISPLAY THEME ACTION CARD */}
      {/* ======================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className={`text-xs font-black ${theme.classes.textMain}`}>مظهر وألوان العرض</span>
          <span className={`text-[10px] font-bold ${theme.classes.textMuted}`}>
            {themeList.length} سمات متوفرة
          </span>
        </div>

        {/* The Trigger Button for Theme Filter Drawer */}
        <div
          onClick={() => {
            gameAudio.playClick();
            setIsThemePickerOpen(true);
          }}
          className={`p-4 rounded-3xl border transition-all duration-300 shadow-xl cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
          style={{
            boxShadow: `0 8px 30px ${theme.colors.glow}`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl border flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform"
                style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  borderColor: theme.colors.primary,
                  color: theme.colors.primary,
                  boxShadow: `0 0 15px ${theme.colors.glow}`,
                }}
              >
                <CurrentIcon className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-black ${theme.classes.textMain}`}>
                    {currentThemeObj.title}
                  </h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm"
                    style={{
                      backgroundColor: `${theme.colors.primary}20`,
                      borderColor: `${theme.colors.primary}50`,
                      color: theme.colors.primary,
                    }}
                  >
                    السمة النشطة
                  </span>
                </div>
                <p className={`text-[11px] ${theme.classes.textMuted} line-clamp-1`}>
                  {currentThemeObj.description}
                </p>

                {/* Live Swatches Preview */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {currentThemeObj.swatches.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span className="text-[10px] font-bold mr-1" style={{ color: theme.colors.primary }}>
                    تغيير اللون 🎨
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-colors"
              style={{
                backgroundColor: `${theme.colors.primary}15`,
                borderColor: `${theme.colors.primary}40`,
                color: theme.colors.primary,
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فلاتر الألوان</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FILTER-STYLE MODAL / DRAWER FOR COLOR SELECTION */}
      {/* ======================================================== */}
      {isThemePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-3xl p-4 sm:p-5 shadow-2xl text-right relative max-h-[90vh] flex flex-col border transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
            style={{
              boxShadow: `0 0 35px ${theme.colors.glow}`,
            }}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${theme.classes.cardBorder}`}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: `${theme.colors.primary}20`,
                    borderColor: theme.colors.primary,
                    color: theme.colors.primary,
                  }}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${theme.classes.textMain}`}>
                    اختر السمة ولون الشاشة
                  </h3>
                  <p className={`text-[10px] ${theme.classes.textMuted}`}>
                    اللون الأبيض هو الافتراضي، وتم إزالة السواد من جميع الأنماط
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsThemePickerOpen(false)}
                className={`p-1.5 rounded-full border transition-colors cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Themes List with Filter Radio Selection */}
            <div className="overflow-y-auto space-y-2.5 py-3 custom-scrollbar flex-1 pr-1">
              {themeList.map((t) => {
                const IconComponent = t.icon;
                const isSelected = currentThemeId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'scale-[1.01] shadow-lg'
                        : `${theme.classes.cardSubtleBg} opacity-90 hover:opacity-100 hover:scale-[1.005]`
                    }`}
                    style={{
                      borderColor: isSelected ? theme.colors.primary : 'rgba(0,0,0,0.08)',
                      backgroundColor: isSelected ? `${theme.colors.primary}15` : undefined,
                      boxShadow: isSelected ? `0 4px 20px ${theme.colors.glow}` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        {/* Theme Icon Bubble */}
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                            isSelected ? 'shadow-md' : ''
                          }`}
                          style={{
                            backgroundColor: isSelected ? `${theme.colors.primary}25` : 'rgba(0,0,0,0.04)',
                            borderColor: isSelected ? theme.colors.primary : 'rgba(0,0,0,0.1)',
                            color: isSelected ? theme.colors.primary : undefined,
                          }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-xs sm:text-sm font-black transition-colors ${
                                isSelected ? '' : theme.classes.textMain
                              }`}
                              style={isSelected ? { color: theme.colors.primary } : {}}
                            >
                              {t.title}
                            </h4>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border"
                              style={{
                                backgroundColor: isSelected ? `${theme.colors.primary}25` : 'rgba(0,0,0,0.05)',
                                borderColor: isSelected ? theme.colors.primary : 'rgba(0,0,0,0.1)',
                                color: isSelected ? theme.colors.primary : undefined,
                              }}
                            >
                              {t.badge}
                            </span>
                          </div>
                          <p className={`text-[10px] ${theme.classes.textMuted} line-clamp-1`}>
                            {t.description}
                          </p>

                          {/* Color Palette Dots */}
                          <div className="flex items-center gap-1 pt-1">
                            {t.swatches.map((clr, cIdx) => (
                              <span
                                key={cIdx}
                                className="w-3 h-3 rounded-full border border-black/15 shadow-sm"
                                style={{ backgroundColor: clr }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Selection Check Circle */}
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'scale-110 shadow-md' : 'opacity-40'
                        }`}
                        style={{
                          backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                          borderColor: isSelected ? theme.colors.primary : 'rgba(0,0,0,0.3)',
                          color: '#FFFFFF',
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close / Done Button */}
            <div className={`pt-2 border-t ${theme.classes.cardBorder}`}>
              <button
                onClick={() => setIsThemePickerOpen(false)}
                className="w-full py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  backgroundColor: theme.colors.primary,
                  boxShadow: `0 4px 15px ${theme.colors.glow}`,
                }}
              >
                <span>حفظ واختيار السمة</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PLATFORM BADGE & ACCREDITATION INFO */}
      {/* ======================================================== */}
      <div
        className={`p-3.5 rounded-3xl border text-center space-y-1.5 transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold" style={{ color: theme.colors.primary }}>
          <ShieldCheck className="w-4 h-4" />
          <span>منصة نحن معك التعليمية • المنهج العراقي المعتمد</span>
        </div>
        <p className={`text-[10px] ${theme.classes.textMuted}`}>
          الإصدار التفاعلي 3.2.0 • تم التحديث ليتطابق مع الامتحانات الوزارية 2026
        </p>
      </div>
    </div>
  );
};
