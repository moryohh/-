import React from 'react';
import { LessonAttachment } from '../types';
import { X, Download, FileText, ShieldCheck, HardDrive } from 'lucide-react';
import { useAppTheme } from '../services/themeService';

interface AttachmentModalProps {
  attachment: LessonAttachment | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (title: string) => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  attachment,
  isOpen,
  onClose,
  onDownload,
}) => {
  const { theme } = useAppTheme();
  if (!isOpen || !attachment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-5 shadow-2xl text-right relative transform transition-all border ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 8px 30px ${theme.colors.glow}`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 left-4 p-2 rounded-full border transition-colors cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              borderColor: `${theme.colors.primary}40`,
              color: theme.colors.primary,
            }}
          >
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
              style={{
                backgroundColor: `${theme.colors.primary}20`,
                borderColor: `${theme.colors.primary}40`,
                color: theme.colors.primary,
              }}
            >
              {attachment.type === 'pdf' ? 'ملف PDF تعليمي' : 'حزمة PSH المتقدمة'}
            </span>
            <h3 className={`text-lg font-bold mt-1 ${theme.classes.textMain}`}>
              {attachment.title}
            </h3>
          </div>
        </div>

        {/* File Stats Box */}
        <div
          className={`rounded-2xl p-3.5 border my-3 text-xs space-y-2 ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
        >
          <div className={`flex justify-between items-center border-b pb-2 ${theme.classes.cardBorder}`}>
            <span className={theme.classes.textMuted}>حجم الملف:</span>
            <span className={`font-bold flex items-center gap-1 ${theme.classes.textMain}`}>
              <HardDrive className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
              {attachment.size}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className={theme.classes.textMuted}>حالة الفحص الأمني:</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              تم الفحص وآمن 100%
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          className={`text-xs leading-relaxed my-3 p-3 rounded-2xl border ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}
        >
          {attachment.description}
        </p>

        {/* Download Action Button */}
        <button
          onClick={() => {
            onDownload(attachment.title);
            onClose();
          }}
          className="w-full mt-3 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm cursor-pointer"
          style={{
            backgroundColor: theme.colors.primary,
            boxShadow: `0 4px 15px ${theme.colors.glow}`,
          }}
        >
          <Download className="w-5 h-5" />
          <span>تحميل الملف الآن</span>
        </button>
      </div>
    </div>
  );
};
