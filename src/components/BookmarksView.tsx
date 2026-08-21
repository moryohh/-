import React from 'react';
import { EducationalLesson, LessonAttachment } from '../types';
import { Bookmark, FileText, Download, Play, Trash2 } from 'lucide-react';

interface BookmarksViewProps {
  lesson: EducationalLesson;
  onOpenAids: () => void;
  onOpenPsh: () => void;
  onRemoveBookmark: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  lesson,
  onOpenAids,
  onOpenPsh,
  onRemoveBookmark,
}) => {
  return (
    <div className="p-4 space-y-4 text-right">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <div className="w-8 h-8 rounded-lg bg-[#1A1A24] border border-white/10 flex items-center justify-center text-[#00A3FF]">
          <Bookmark className="w-4 h-4 fill-[#00A3FF]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">المحفوظات والملفات المنزلة</h2>
          <p className="text-xs text-gray-400">الدروس والملخصات المعينة التي قمت بحفظها</p>
        </div>
      </div>

      {lesson.isBookmarked ? (
        <div className="bg-[#1A1A24] border border-white/5 rounded-2xl p-4 shadow-xl relative space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#00A3FF]/10 border border-[#00A3FF]/30 flex items-center justify-center text-[#00A3FF] shrink-0">
                <Play className="w-5 h-5 fill-[#00A3FF]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#00A3FF] bg-[#00A3FF]/10 px-2 py-0.5 rounded">
                  {lesson.category}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">{lesson.title}</h3>
                <p className="text-xs text-gray-400">{lesson.teacherName}</p>
              </div>
            </div>

            <button
              onClick={onRemoveBookmark}
              className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#252535]"
              title="إزالة من المحفوظات"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
            <button
              onClick={onOpenAids}
              className="bg-[#1E1E2C] hover:bg-[#252535] text-gray-200 border border-white/10 rounded-xl py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-semibold"
            >
              <FileText className="w-3.5 h-3.5 text-[#00A3FF]" />
              <span>عامل المعينات</span>
            </button>
            <button
              onClick={onOpenPsh}
              className="bg-[#1E1E2C] hover:bg-[#252535] text-gray-200 border border-white/10 rounded-xl py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-semibold"
            >
              <Download className="w-3.5 h-3.5 text-[#00A3FF]" />
              <span>تحميل PSH</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-[#1A1A24] rounded-2xl border border-white/5 p-6 space-y-2">
          <Bookmark className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">لا يوجد دروس محفوظة حالياً</h3>
          <p className="text-xs text-gray-500">
            اضغط على أيقونة الحفظ في أي درس لتتمكن من الوصول إليه وملخصاته هنا بسهولة.
          </p>
        </div>
      )}
    </div>
  );
};
