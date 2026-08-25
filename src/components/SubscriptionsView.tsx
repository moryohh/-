import React, { useState } from 'react';
import {
  ArrowRight,
  BadgePercent,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  GraduationCap,
  Layers,
  MapPin,
  UsersRound,
  X,
} from 'lucide-react';
import { useAppTheme } from '../services/themeService';
import {
  COURSE_STATUS_LABELS,
  CourseStatus,
  MOCK_COURSES,
  MockCourse,
} from '../data/mockCourses';
import { EducationalLesson } from '../types';

interface SubscriptionsViewProps {
  onSelectLesson: (lesson: EducationalLesson) => void;
  onBack?: () => void;
}

const STATUS_STYLES: Record<CourseStatus, { text: string; background: string; border: string }> = {
  full: {
    text: '#fbbf24',
    background: 'rgba(245,158,11,0.13)',
    border: 'rgba(245,158,11,0.35)',
  },
  upcoming: {
    text: '#86efac',
    background: 'rgba(34,197,94,0.13)',
    border: 'rgba(34,197,94,0.35)',
  },
  open: {
    text: '#7dd3fc',
    background: 'rgba(14,165,233,0.13)',
    border: 'rgba(14,165,233,0.35)',
  },
  closed: {
    text: '#cbd5e1',
    background: 'rgba(148,163,184,0.13)',
    border: 'rgba(148,163,184,0.35)',
  },
};

const getStatusMessage = (course: MockCourse) => {
  if (course.status === 'upcoming') {
    return {
      title: 'التسجيل قريبًا',
      description: 'سيتم فتح التقديم على هذه الدورة قريبًا.',
    };
  }

  if (course.status === 'full') {
    return {
      title: course.id === 'all-subjects' ? 'التسجيل ممتلئ حاليًا' : 'الدورة ممتلئة',
      description:
        course.id === 'all-subjects'
          ? 'تم اكتمال المقاعد لهذه الدورة.'
          : 'اكتملت المقاعد المتاحة حاليًا.',
    };
  }

  if (course.status === 'open') {
    return {
      title: 'التسجيل متاح',
      description: 'يمكنك الاطلاع على تفاصيل التسجيل عند تفعيل الدورة رسميًا.',
    };
  }

  return {
    title: 'التسجيل مغلق',
    description: 'التسجيل غير متاح لهذه الدورة حاليًا.',
  };
};

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ onBack }) => {
  const { theme } = useAppTheme();
  const [selectedCourse, setSelectedCourse] = useState<MockCourse | null>(null);

  const closeCourseDialog = () => setSelectedCourse(null);

  return (
    <div className="space-y-4 p-3 text-right select-none sm:p-4 animate-in fade-in duration-200">
      <section
        className={`relative overflow-hidden rounded-3xl border p-4 shadow-xl ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{ boxShadow: `0 8px 28px ${theme.colors.glow}` }}
      >
        <div
          className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.colors.primary}30` }}
        />
        <div className="relative flex items-start justify-between gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition-transform active:scale-95 ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
              style={{ color: theme.colors.primary }}
              aria-label="الرجوع"
            >
              <ArrowRight className="h-4 w-4" />
              <span>رجوع</span>
            </button>
          ) : (
            <span className="w-14" aria-hidden="true" />
          )}

          <div className="min-w-0">
            <div className="mb-1 flex items-center justify-end gap-2">
              <span className={`text-[10px] font-black ${theme.classes.textMuted}`}>مسارات تعليمية مختارة</span>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{
                  color: theme.colors.primary,
                  backgroundColor: `${theme.colors.primary}18`,
                  borderColor: `${theme.colors.primary}40`,
                }}
              >
                <Layers className="h-5 w-5" />
              </span>
            </div>
            <h1 className={`text-xl font-black tracking-tight sm:text-2xl ${theme.classes.textMain}`}>الدورات التعليمية</h1>
            <p className={`mt-1 text-xs leading-6 sm:text-sm ${theme.classes.textMuted}`}>
              اختر الدورة المناسبة لك وابدأ رحلتك نحو التفوق
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {MOCK_COURSES.map((course) => {
          const statusStyle = STATUS_STYLES[course.status];
          const visibleTeachers = course.teachers.slice(0, 4);
          const remainingTeachers = course.teachers.length - visibleTeachers.length;

          return (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourse(course)}
              className={`group relative w-full overflow-hidden rounded-3xl border p-4 text-right shadow-lg transition-[transform,box-shadow,border-color] duration-200 active:scale-[0.99] hover:-translate-y-0.5 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
              style={{
                boxShadow: course.featured ? `0 10px 32px ${theme.colors.glow}` : undefined,
                borderColor: course.featured ? `${theme.colors.primary}70` : undefined,
              }}
            >
              {course.featured && (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${theme.colors.secondary}, ${theme.colors.primary}, ${theme.colors.accent})` }}
                />
              )}

              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black"
                  style={{
                    color: statusStyle.text,
                    backgroundColor: statusStyle.background,
                    borderColor: statusStyle.border,
                  }}
                >
                  {course.status === 'full' ? <Clock3 className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                  {COURSE_STATUS_LABELS[course.status]}
                </span>

                <div className="min-w-0">
                  <div className="mb-1 flex items-center justify-end gap-1.5">
                    {course.featured && <BadgePercent className="h-4 w-4" style={{ color: theme.colors.secondary }} />}
                    <h2 className={`text-base font-black leading-7 sm:text-lg ${theme.classes.textMain}`}>{course.title}</h2>
                  </div>
                  <p className={`text-xs leading-5 ${theme.classes.textMuted}`}>{course.description}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-1.5">
                {visibleTeachers.map((teacher) => (
                  <span
                    key={teacher}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${theme.colors.primary}25`, color: theme.colors.primary }}
                    >
                      <GraduationCap className="h-2.5 w-2.5" />
                    </span>
                    <span className={theme.classes.textMuted}>{teacher}</span>
                  </span>
                ))}
                {remainingTeachers > 0 && (
                  <span className={`rounded-full border px-2 py-1 text-[9px] font-black ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}>
                    +{remainingTeachers} مدرسين
                  </span>
                )}
              </div>

              <div className={`mt-4 flex items-end justify-between gap-3 border-t pt-3 ${theme.classes.cardBorder}`}>
                <span
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-black transition-transform group-hover:translate-x-0.5"
                  style={{ color: theme.colors.primary, backgroundColor: `${theme.colors.primary}14` }}
                >
                  <span>عرض التفاصيل</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>

                {course.currentPrice ? (
                  <div>
                    <div className={`text-[10px] font-bold line-through ${theme.classes.textMuted}`}>{course.oldPrice}</div>
                    <div className="flex items-baseline justify-end gap-1.5">
                      <span className="text-[10px] font-bold" style={{ color: theme.colors.secondary }}>د.ع</span>
                      <span className={`text-2xl font-black ${theme.classes.textMain}`}>{course.currentPrice.replace(' د.ع', '')}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] font-black" style={{ color: theme.colors.secondary }}>
                      <BadgePercent className="h-3.5 w-3.5" />
                      {course.badge}
                    </div>
                  </div>
                ) : (
                  <div className="text-left">
                    <div className="flex items-center gap-1 text-xs font-black" style={{ color: theme.colors.secondary }}>
                      <Clock3 className="h-3.5 w-3.5" />
                      التسجيل قريبًا
                    </div>
                    <div className={`mt-1 text-[10px] ${theme.classes.textMuted}`}>لا يوجد شراء حاليًا</div>
                  </div>
                )}
              </div>

              {course.registrationMonth && (
                <div className="mt-2 flex items-center justify-end gap-1 text-[10px] font-bold" style={{ color: statusStyle.text }}>
                  <CalendarDays className="h-3.5 w-3.5" />
                  التسجيل الجديد في {course.registrationMonth}
                </div>
              )}
              {course.includesExam && (
                <div className="mt-2 flex items-center justify-end gap-1 text-[10px] font-black" style={{ color: theme.colors.primary }}>
                  <MapPin className="h-3.5 w-3.5" />
                  يشمل امتحان حضوري
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-center text-[10px] leading-5 ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}>
        <BookOpen className="h-4 w-4 shrink-0" style={{ color: theme.colors.primary }} />
        <span>هذه الدورات معروضة حاليًا كبيانات تجريبية للواجهة، ولا يوجد دفع إلكتروني أو تعاقد فعلي داخل المنصة.</span>
      </div>

      {selectedCourse && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="presentation"
          onClick={closeCourseDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-status-title"
            className={`w-full max-w-sm rounded-3xl border p-5 text-right shadow-2xl animate-in zoom-in-95 duration-150 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={closeCourseDialog}
                className={`rounded-xl border p-2 transition-transform active:scale-95 ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}
                aria-label="إغلاق النافذة"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                  style={{
                    color: STATUS_STYLES[selectedCourse.status].text,
                    backgroundColor: STATUS_STYLES[selectedCourse.status].background,
                    borderColor: STATUS_STYLES[selectedCourse.status].border,
                  }}
                >
                  {selectedCourse.status === 'upcoming' ? <Clock3 className="h-5 w-5" /> : <UsersRound className="h-5 w-5" />}
                </span>
                <div>
                  <h3 id="course-status-title" className={`text-base font-black ${theme.classes.textMain}`}>
                    {getStatusMessage(selectedCourse).title}
                  </h3>
                  <p className={`mt-0.5 text-[10px] ${theme.classes.textMuted}`}>{selectedCourse.title}</p>
                </div>
              </div>
            </div>

            <p className={`mt-5 rounded-2xl border p-3 text-xs leading-6 ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}>
              {getStatusMessage(selectedCourse).description}
            </p>

            {selectedCourse.status === 'full' && selectedCourse.registrationMonth && (
              <div className="mt-3 flex items-center justify-end gap-1.5 text-xs font-black" style={{ color: theme.colors.secondary }}>
                <CalendarDays className="h-4 w-4" />
                سيفتح التسجيل الجديد في {selectedCourse.registrationMonth
                }
              </div>
            )}

            <button
              type="button"
              onClick={closeCourseDialog}
              className="mt-5 w-full rounded-2xl px-4 py-3 text-xs font-black text-white transition-transform active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
            >
              حسنًا
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
