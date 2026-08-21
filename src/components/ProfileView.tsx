import React from 'react';
import { Award, Flame, BookOpen, ShieldCheck, ArrowRight, Zap, Target } from 'lucide-react';
import { useAppTheme } from '../services/themeService';

interface ProfileViewProps {
  onBack?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
  const { theme } = useAppTheme();

  return (
    <div className="p-3 space-y-4 text-right select-none animate-in fade-in duration-200">
      {/* Student Profile Card */}
      <div
        className={`border rounded-3xl p-5 shadow-2xl text-center relative overflow-hidden transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 8px 30px ${theme.colors.glow}`,
        }}
      >
        <div
          className="absolute top-0 inset-x-0 h-16 flex justify-end p-3 transition-colors"
          style={{
            background: `linear-gradient(to right, ${theme.colors.primary}30, ${theme.colors.secondary}20, ${theme.colors.primary}30)`,
          }}
        >
          {onBack && (
            <button
              onClick={onBack}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 z-10 transition-all cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
              style={{ color: theme.colors.primary }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
          )}
        </div>

        <div className="relative pt-4">
          <div
            className="w-20 h-20 rounded-full border-2 p-1 mx-auto shadow-xl relative"
            style={{
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.bgCardSubtle,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
              alt="صورة الطالب"
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-black">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <h2 className={`text-lg font-black mt-2 ${theme.classes.textMain}`}>أحمد حيدر</h2>
          <p className="text-xs font-bold mt-0.5" style={{ color: theme.colors.primary }}>
            السادس الإعدادي • الفرع العلمي
          </p>

          <div
            className={`grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl border text-center text-xs transition-colors ${
              theme.isLight ? 'bg-slate-50 border-slate-200' : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`
            }`}
          >
            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>ساعات المشاهدة</span>
              <span className={`font-bold flex items-center justify-center gap-1 mt-0.5 ${theme.classes.textMain}`}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
                14.2 س
              </span>
            </div>
            <div className={`border-x ${theme.isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>أيام التفاعل</span>
              <span className="font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                12 يوم
              </span>
            </div>
            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>مجموع النقاط</span>
              <span className={`font-bold flex items-center justify-center gap-1 mt-0.5 ${theme.classes.textMain}`}>
                <Award className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
                2,250
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges and Academic Progress Summary */}
      <div
        className={`border rounded-3xl p-4 shadow-xl space-y-3 text-xs transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
      >
        <h3 className={`font-black border-b pb-2 flex items-center gap-1.5 ${theme.classes.textMain} ${theme.classes.cardBorder}`}>
          <Target className="w-4 h-4" style={{ color: theme.colors.primary }} />
          الإنجازات والتقدم الدراسي
        </h3>

        <div className="space-y-2">
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              theme.isLight ? 'bg-slate-50 border-slate-200' : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl border flex items-center justify-center"
                style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  borderColor: `${theme.colors.primary}40`,
                  color: theme.colors.primary,
                }}
              >
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className={`font-bold ${theme.classes.textMain}`}>المستوى الأكاديمي 22</div>
                <div className={`text-[10px] ${theme.classes.textMuted}`}>إنجاز 18 من أصل 24 درساً</div>
              </div>
            </div>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${theme.colors.primary}20`,
                borderColor: `${theme.colors.primary}40`,
                color: theme.colors.primary,
              }}
            >
              75% مكتمل
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
