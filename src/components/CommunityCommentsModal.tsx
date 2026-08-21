import React, { useState } from 'react';
import { X, Send, ThumbsUp, MessageSquare, MoreHorizontal, Flag, Trash2, ShieldCheck } from 'lucide-react';
import { CommunityComment, CommunityPost } from '../types';

interface CommunityCommentsModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (postId: string, text: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onReportComment?: (commentId: string) => void;
}

export const CommunityCommentsModal: React.FC<CommunityCommentsModalProps> = ({
  post,
  isOpen,
  onClose,
  onAddComment,
  onLikeComment,
  onDeleteComment,
  onReportComment,
}) => {
  const [newText, setNewText] = useState('');
  const [activeMenuCommentId, setActiveMenuCommentId] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddComment(post.id, newText.trim());
    setNewText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-200">
      <div className="bg-[#1A1A24] border-t border-white/10 w-full max-w-lg rounded-t-3xl p-4 sm:p-5 shadow-2xl text-right max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00A3FF]" />
            <h3 className="text-base font-bold text-white">
              التعليقات والمناقشات ({post.comments.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1E1E2C] text-gray-300 hover:text-white border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post snippet */}
        <div className="bg-[#0D0D12]/60 p-3 rounded-2xl border border-white/5 my-3 text-xs text-gray-300">
          <span className="text-gray-400 font-bold block mb-1">صاحب المنشور: {post.userName}</span>
          <p className="line-clamp-2 text-white">{post.content}</p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 pl-1">
          {post.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              لا توجد تعليقات بعد، كن أول من يشارك برأيه أو إجابته!
            </div>
          ) : (
            post.comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[#0D0D12]/80 p-3.5 rounded-2xl border border-white/5 flex gap-3 text-right relative"
              >
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">
                      {comment.userName}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">{comment.timeAgo}</span>
                      <button
                        onClick={() => setActiveMenuCommentId(activeMenuCommentId === comment.id ? null : comment.id)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mt-1">
                    {comment.text}
                  </p>

                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-gray-400">
                    <button
                      onClick={() => onLikeComment(post.id, comment.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        comment.isLiked ? 'text-[#00A3FF] font-bold' : 'hover:text-[#00A3FF]'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-[#00A3FF]' : ''}`} />
                      <span>{comment.likes} إعجاب</span>
                    </button>
                  </div>

                  {/* Comment options dropdown */}
                  {activeMenuCommentId === comment.id && (
                    <div className="absolute top-8 left-3 bg-[#1E1E2C] border border-white/10 rounded-xl shadow-xl z-20 py-1 text-xs w-36 animate-in fade-in">
                      <button
                        onClick={() => {
                          onReportComment?.(comment.id);
                          setActiveMenuCommentId(null);
                        }}
                        className="w-full px-3 py-2 text-right hover:bg-white/5 flex items-center gap-2 text-amber-400"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>إبلاغ عن تعليق</span>
                      </button>
                      {onDeleteComment && (
                        <button
                          onClick={() => {
                            onDeleteComment(post.id, comment.id);
                            setActiveMenuCommentId(null);
                          }}
                          className="w-full px-3 py-2 text-right hover:bg-white/5 flex items-center gap-2 text-rose-400 border-t border-white/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف التعليق</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Input Form */}
        <form onSubmit={handleSubmit} className="pt-3 border-t border-white/5 flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="اكتب تعليقك أو إجابتك للزملاء..."
            className="flex-1 bg-[#0D0D12] text-white border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00A3FF] placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!newText.trim()}
            className="bg-[#00A3FF] disabled:opacity-50 hover:bg-[#0092E6] text-white font-bold px-4 rounded-xl flex items-center justify-center transition-all active:scale-95"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
