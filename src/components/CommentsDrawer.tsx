import React, { useState } from 'react';
import { CommentItem } from '../types';
import { X, Send, ThumbsUp, MessageSquare } from 'lucide-react';
import { useAppTheme } from '../services/themeService';

interface CommentsDrawerProps {
  comments: CommentItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (text: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  comments,
  isOpen,
  onClose,
  onAddComment,
}) => {
  const { theme } = useAppTheme();
  const [newText, setNewText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddComment(newText.trim());
    setNewText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-t-3xl p-4 sm:p-5 shadow-2xl text-right max-h-[80vh] flex flex-col border-t transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 -10px 40px ${theme.colors.glow}`,
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${theme.classes.cardBorder}`}>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: theme.colors.primary }} />
            <h3 className={`text-base font-bold ${theme.classes.textMain}`}>
              التعليقات والمناقشات ({comments.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar my-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-2xl border flex gap-3 text-right ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
            >
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className="w-9 h-9 rounded-full object-cover shrink-0 border"
                style={{ borderColor: theme.colors.primary }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold ${theme.classes.textMain}`}>
                    {comment.userName}
                  </h4>
                  <span className={`text-[10px] ${theme.classes.textMuted}`}>{comment.timeAgo}</span>
                </div>
                <p className={`text-xs leading-relaxed mt-1 ${theme.classes.textMain}`}>
                  {comment.text}
                </p>

                <div className={`flex items-center gap-1 mt-2 text-[11px] ${theme.classes.textMuted}`}>
                  <button className="flex items-center gap-1 cursor-pointer" style={{ color: theme.colors.primary }}>
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Input Form */}
        <form onSubmit={handleSubmit} className={`pt-2 border-t flex gap-2 ${theme.classes.cardBorder}`}>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="اكتب تعليقك أو سؤالك للأستاذ..."
            className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
            style={{
              borderColor: theme.colors.primary,
            }}
          />
          <button
            type="submit"
            disabled={!newText.trim()}
            className="text-white font-bold px-4 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: `0 4px 15px ${theme.colors.glow}`,
            }}
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
