import React from 'react';
import { X, Star, Sparkles } from 'lucide-react';
import { cleanTeacherName } from '../utils/cleanTeacherName';
import { useAppTheme } from '../services/themeService';

interface TeacherInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  teacherAvatar: string;
  teacherRole: string;
}

export const TeacherInfoModal: React.FC<TeacherInfoModalProps> = ({
  isOpen,
  onClose,
  teacherName,
  teacherAvatar,
  teacherRole,
}) => {
  const { theme } = useAppTheme();
  if (!isOpen) return null;

  const cleanedName = cleanTeacherName(teacherName) || 'مدرس المادة';
  const cleanedRole = cleanTeacherName(teacherRole) || 'مدرس المادة';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl text-right relative border transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 8px 30px ${theme.colors.glow}`,
        }}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 left-4 p-2 rounded-full border transition-colors cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Teacher Card Profile */}
        <div className="flex flex-col items-center text-center mt-2">
          <div
            className={`w-20 h-20 rounded-full border-2 p-1 shadow-xl mb-3 ${theme.classes.cardSubtleBg}`}
            style={{ borderColor: theme.colors.primary }}
          >
            <img
              src={teacherAvatar}
              alt={cleanedName}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h3 className={`text-lg font-bold leading-tight ${theme.classes.textMain}`}>{cleanedName}</h3>
          <p className="text-xs font-semibold mt-1" style={{ color: theme.colors.primary }}>
            {cleanedRole}
          </p>

          <div
            className={`grid grid-cols-3 gap-2 w-full mt-4 p-3 rounded-2xl border text-center text-xs ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
          >
            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>الدروس</span>
              <span className={`font-bold ${theme.classes.textMain}`}>42</span>
            </div>
            <div className={`border-x ${theme.isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>التقييم</span>
              <span className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                4.9 <Star className="w-3 h-3 fill-amber-400" />
              </span>
            </div>
            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>الطلاب</span>
              <span className={`font-bold ${theme.classes.textMain}`}>18.5K</span>
            </div>
          </div>

          <p
            className={`text-xs leading-relaxed mt-3 p-3 rounded-2xl text-right border ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}
          >
            أستاذ ومتخصص في تبسيط المفاهيم العلمية وشرح المنهج العراقي لطلاب السادس الإعدادي بأسلوب تفاعلي شائق.
          </p>

          <button
            onClick={onClose}
            className="w-full mt-4 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: `0 4px 15px ${theme.colors.glow}`,
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>متابعة دروس الأستاذ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
