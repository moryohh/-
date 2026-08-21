import React from 'react';
import { EducationalLesson } from '../types';
import { Layers, Play, CheckCircle, ArrowRight } from 'lucide-react';
import { useAppTheme } from '../services/themeService';

interface SubscriptionsViewProps {
  onSelectLesson: (lesson: EducationalLesson) => void;
  onBack?: () => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ onSelectLesson, onBack }) => {
  const { theme } = useAppTheme();

  const teachersList = [
    {
      name: 'أ. سارة الشمري',
      subject: 'الذكاء الاصطناعي والتكنولوجيا',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      unreadVideos: 3,
      latestLessonTitle: 'ما هو الذكاء الاصطناعي؟',
    },
    {
      name: 'د. أحمد العتيبي',
      subject: 'أدوات وتطبيقات الذكاء الاصطناعي',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      unreadVideos: 1,
      latestLessonTitle: 'استخدام برامج التوليد الآلي للصور',
    },
    {
      name: 'أ. محمود الخالدي',
      subject: 'أساسيات التعلم الآلي والبرمجة',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      unreadVideos: 5,
      latestLessonTitle: 'مقدمة في خوارزميات التدريب',
    },
  ];

  return (
    <div className="p-4 space-y-4 text-right select-none animate-in fade-in duration-200">
      <div className={`flex items-center justify-between border-b ${theme.classes.cardBorder} pb-3`}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              borderColor: `${theme.colors.primary}40`,
              color: theme.colors.primary,
            }}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${theme.classes.textMain}`}>اشتراكاتك وقنوات الأساتذة</h2>
            <p className={`text-xs ${theme.classes.textMuted}`}>تصفح آخر الدروس المنشورة من أساتذتك المفضلين</p>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
            style={{ color: theme.colors.primary }}
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {teachersList.map((teacher, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md transition-all ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
            style={{
              boxShadow: `0 4px 15px ${theme.colors.glow}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-12 h-12 rounded-full object-cover border-2 shadow-sm"
                  style={{ borderColor: theme.colors.primary }}
                />
                <span
                  className="absolute -bottom-1 -right-1 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border shadow-sm"
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.bgMain,
                  }}
                >
                  {teacher.unreadVideos}
                </span>
              </div>
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-1 ${theme.classes.textMain}`}>
                  {teacher.name}
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
                </h3>
                <p className="text-xs font-semibold" style={{ color: theme.colors.primary }}>
                  {teacher.subject}
                </p>
                <p className={`text-[11px] ${theme.classes.textMuted} mt-1 line-clamp-1`}>
                  أحدث درس: {teacher.latestLessonTitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => {}}
              className="p-2.5 rounded-xl font-bold border transition-all text-xs flex items-center gap-1 shrink-0 cursor-pointer"
              style={{
                backgroundColor: `${theme.colors.primary}18`,
                borderColor: `${theme.colors.primary}40`,
                color: theme.colors.primary,
              }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>مشاهدة</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
