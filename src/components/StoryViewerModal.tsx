import React, { useEffect, useState } from 'react';
import { TeacherStory } from '../types';
import { X, ChevronRight, ChevronLeft, Sparkles, Play, Tv } from 'lucide-react';
import { cleanTeacherName } from '../utils/cleanTeacherName';

interface StoryViewerModalProps {
  story: TeacherStory | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onPlayLesson?: (story: TeacherStory) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  onClose,
  onNext,
  onPrev,
  onPlayLesson,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!story) return;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onNext) onNext();
          else onClose();
          return 100;
        }
        return prev + 1.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [story, onNext, onClose]);

  if (!story) return null;

  const cleanedTeacher = cleanTeacherName(story.teacherName) || 'مدرس المادة';
  const cleanedChannel = cleanTeacherName(story.channelName) || cleanedTeacher;

  const handlePlayNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayLesson) {
      onPlayLesson(story);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between items-center p-2 sm:p-4 animate-in fade-in duration-200 font-cairo">
      {/* Top Bar with Progress Line and Channel info */}
      <div className="w-full max-w-md pt-2 px-2 z-10">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#00A3FF] transition-all duration-100 ease-linear rounded-full shadow-[0_0_8px_rgba(0,163,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Channel / Teacher Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-[#00A3FF] overflow-hidden p-0.5 bg-[#0D0D12]">
              <img
                src={story.avatar}
                alt={cleanedTeacher}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">
                {cleanedChannel}
              </h3>
              <p className="text-xs text-[#00A3FF] font-medium mt-0.5">
                {story.subject} • {cleanedTeacher}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#1E1E2C] text-gray-300 hover:text-white border border-white/10"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Story Content Container */}
      <div className="relative w-full max-w-md h-[72vh] my-auto rounded-3xl overflow-hidden border border-white/10 bg-[#1A1A24] flex flex-col justify-end p-5 shadow-2xl">
        {story.storyImage && (
          <img
            src={story.storyImage}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* Story Details Box */}
        <div className="relative z-10 bg-[#0D0D12]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#00A3FF] text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{story.title}</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed font-medium">
              {story.textNotes || 'شرح المدرس لهذا الدرس متوفر الآن على شاشة الفيديو.'}
            </p>
          </div>

          {/* Action Button: Play Video on Main Screen */}
          <button
            onClick={handlePlayNow}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00A3FF] to-blue-600 hover:from-[#0090e0] hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Tv className="w-4 h-4" />
            <span>تشغيل شرح هذا المدرس على شاشة الفيديو</span>
          </button>
        </div>

        {/* Tap areas for next / prev */}
        <button
          onClick={onPrev}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-2/3 w-1/4 z-20 focus:outline-none flex items-center justify-start pr-2 opacity-30 hover:opacity-100 text-white"
          aria-label="القصة السابقة"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <button
          onClick={onNext}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1/4 z-20 focus:outline-none flex items-center justify-end pl-2 opacity-30 hover:opacity-100 text-white"
          aria-label="القصة التالية"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>

      <div className="w-full max-w-md pb-2 text-center text-xs text-gray-500">
        انقر على الشاشة للتنقل أو اضغط تشغيل لمشاهدة الفيديو فوراً
      </div>
    </div>
  );
};

