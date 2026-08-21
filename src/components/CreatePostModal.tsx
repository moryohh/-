import React, { useState } from 'react';
import { X, Image, Paperclip, HelpCircle, Send, Sparkles } from 'lucide-react';
import { CommunityPost } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (post: Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount' | 'isLiked' | 'comments'>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
}) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'question' | 'discussion' | 'summary' | 'general'>('general');
  const [hasImage, setHasImage] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmitPost({
      userName: 'أنت (طالب منصة نحن معك)',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'الآن',
      type: postType,
      content: content.trim(),
      image: hasImage ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' : undefined,
      attachmentName: hasAttachment ? 'ملخص_دراسي_مرفق.pdf' : undefined,
      isOwnPost: true,
    });

    setContent('');
    setHasImage(false);
    setHasAttachment(false);
    setPostType('general');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-[#1A1A24] border border-white/10 w-full max-w-md rounded-3xl p-5 shadow-2xl text-right relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00A3FF]/10 border border-[#00A3FF]/30 flex items-center justify-center text-[#00A3FF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">بماذا تفكر؟</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1E1E2C] text-gray-300 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Profile snippet */}
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
              alt="طالب"
              className="w-10 h-10 rounded-full border border-[#00A3FF] object-cover"
            />
            <div>
              <h4 className="text-xs font-bold text-white">طالب منصة نحن معك</h4>
              <span className="text-[10px] text-gray-400">نشر في المجتمع الطلابي العام</span>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب سؤالك، ملخصك، أو فكرتك الدراسية هنا..."
            rows={4}
            className="w-full bg-[#0D0D12] text-white border border-white/10 rounded-2xl p-3.5 text-xs focus:outline-none focus:border-[#00A3FF] placeholder:text-gray-500 resize-none leading-relaxed"
            autoFocus
          />

          {/* Quick attachment & type options */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-400 block">
              نوع المنشور والوسائط:
            </label>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Question button */}
              <button
                type="button"
                onClick={() => setPostType(postType === 'question' ? 'general' : 'question')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  postType === 'question'
                    ? 'bg-[#00A3FF]/20 border-[#00A3FF] text-[#00A3FF]'
                    : 'bg-[#1E1E2C] border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>طرح سؤال</span>
              </button>

              {/* Add image toggle */}
              <button
                type="button"
                onClick={() => setHasImage(!hasImage)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  hasImage
                    ? 'bg-[#00A3FF]/20 border-[#00A3FF] text-[#00A3FF]'
                    : 'bg-[#1E1E2C] border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>إضافة صورة</span>
              </button>

              {/* Add attachment toggle */}
              <button
                type="button"
                onClick={() => setHasAttachment(!hasAttachment)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  hasAttachment
                    ? 'bg-[#00A3FF]/20 border-[#00A3FF] text-[#00A3FF]'
                    : 'bg-[#1E1E2C] border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>مرفق تعليمي</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!content.trim()}
            className="w-full mt-2 bg-[#00A3FF] hover:bg-[#0092E6] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <Send className="w-4 h-4 rotate-180" />
            <span>نشر في المجتمع</span>
          </button>
        </form>
      </div>
    </div>
  );
};
