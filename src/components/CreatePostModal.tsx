import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Paperclip, HelpCircle, Send, Sparkles, Plus, Trash2, BookOpen, MessageCircle } from 'lucide-react';
import { CommunityPost, UserProfile } from '../types';
import { useAppTheme } from '../services/themeService';

interface CreatePostModalProps {
  isOpen: boolean;
  currentUser?: UserProfile | null;
  onClose: () => void;
  onSubmitPost: (post: Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount' | 'isLiked' | 'comments'>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSubmitPost,
}) => {
  const { theme } = useAppTheme();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'question' | 'discussion' | 'summary' | 'general'>('general');
  const [images, setImages] = useState<string[]>([]);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const authorName = currentUser?.name || 'طالب منصة نحن معك';
  const authorAvatar =
    currentUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  // Handle local image file upload (converts to data URL preview, up to 4 images)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - images.length;
    if (remainingSlots <= 0) return;

    const filesToRead = (Array.from(files).slice(0, remainingSlots) as unknown) as File[];

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => {
            if (prev.length >= 4) return prev;
            return [...prev, event.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    onSubmitPost({
      userId: currentUser?.id,
      userName: authorName,
      userAvatar: authorAvatar,
      timeAgo: 'الآن',
      type: postType,
      content: content.trim(),
      image: images[0] || undefined,
      images: images.length > 0 ? images : undefined,
      attachmentName: attachmentName.trim() ? attachmentName.trim() : undefined,
      isOwnPost: true,
    });

    // Reset state
    setContent('');
    setImages([]);
    setAttachmentName('');
    setShowAttachmentInput(false);
    setPostType('general');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-5 shadow-2xl text-right relative border transition-all ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 12px 40px ${theme.colors.glow}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4 border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center border"
              style={{
                backgroundColor: `${theme.colors.primary}20`,
                borderColor: `${theme.colors.primary}40`,
                color: theme.colors.primary,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className={`text-base font-black ${theme.classes.textMain}`}>إنشاء منشور جديد</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Profile snippet */}
          <div className="flex items-center gap-2.5">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full border-2 object-cover"
              style={{ borderColor: theme.colors.primary }}
            />
            <div>
              <h4 className={`text-xs font-black ${theme.classes.textMain}`}>{authorName}</h4>
              <span className={`text-[10px] ${theme.classes.textMuted}`}>نشر للجميع في المجتمع الطلابي العام</span>
            </div>
          </div>

          {/* Post Type Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setPostType('general')}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
                postType === 'general'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>عام</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType('question')}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
                postType === 'question'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <HelpCircle className="w-3 h-3" />
              <span>سؤال وزاري</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType('summary')}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
                postType === 'summary'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>ملخص دراسي</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType('discussion')}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
                postType === 'discussion'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <MessageCircle className="w-3 h-3" />
              <span>نقاش علمي</span>
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب سؤالك، ملخصك، أو فائدة دراسية للزملاء..."
            rows={4}
            className={`w-full rounded-2xl p-3.5 text-xs focus:outline-none border placeholder:text-gray-500 resize-none leading-relaxed ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
            style={{ borderColor: `${theme.colors.primary}60` }}
            autoFocus
          />

          {/* Uploaded Images Grid Preview (Supports up to 4 images) */}
          {images.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-400">الصور المرفقة ({images.length}/4)</span>
                {images.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة صورة أخرى</span>
                  </button>
                )}
              </div>

              <div
                className={`grid gap-2 ${
                  images.length === 1
                    ? 'grid-cols-1'
                    : images.length === 2
                    ? 'grid-cols-2'
                    : images.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-2'
                }`}
              >
                {images.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group aspect-video"
                  >
                    <img src={imgUrl} alt={`مرفق ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1.5 left-1.5 p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 shadow-md transition-all"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-white">
                      صورة {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Attachment Input */}
          {showAttachmentInput && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 animate-in fade-in">
              <label className="text-[11px] font-bold text-gray-300 block">عنوان الملف أو الملخص التعليمي:</label>
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="مثال: ملخص_الفصل_الثالث_فيزياء.pdf"
                className={`w-full px-3 py-2 rounded-xl text-xs border bg-black/30 text-white ${theme.classes.cardBorder}`}
              />
            </div>
          )}

          {/* Quick Actions toolbar */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              {/* Hidden File Input for Image Upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              {/* Add Image Button (up to 4) */}
              <button
                type="button"
                disabled={images.length >= 4}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  images.length > 0
                    ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                } disabled:opacity-40`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>إرفاق صور ({images.length}/4)</span>
              </button>

              {/* Attachment Toggle */}
              <button
                type="button"
                onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  showAttachmentInput
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>اسم ملف</span>
              </button>
            </div>

            {/* Submit Post Button */}
            <button
              type="submit"
              disabled={!content.trim() && images.length === 0}
              className="px-5 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40"
              style={{
                backgroundColor: theme.colors.primary,
                boxShadow: `0 4px 15px ${theme.colors.glow}`,
              }}
            >
              <span>نشر الآن</span>
              <Send className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
