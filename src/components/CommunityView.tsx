import React, { useEffect, useRef, useState } from 'react';
import {
  Users,
  Plus,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  HelpCircle,
  FileText,
  Sparkles,
  Flag,
  Paperclip,
  ArrowRight,
  Check,
  Eye,
  X,
} from 'lucide-react';
import { CommunityPost } from '../types';
import { useAppTheme } from '../services/themeService';

interface CommunityViewProps {
  posts: CommunityPost[];
  onOpenCreatePost: () => void;
  onOpenComments: (post: CommunityPost) => void;
  onToggleLikePost: (postId: string) => void;
  onSharePost: (post: CommunityPost) => void;
  onReportPost: (postId: string) => void;
  onBack?: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  onOpenCreatePost,
  onOpenComments,
  onToggleLikePost,
  onSharePost,
  onReportPost,
  onBack,
}) => {
  const { theme } = useAppTheme();
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'questions' | 'summaries' | 'discussions'>('all');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [visiblePostCount, setVisiblePostCount] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'questions') return post.type === 'question';
    if (activeFilter === 'summaries') return post.type === 'summary';
    if (activeFilter === 'discussions') return post.type === 'discussion';
    return true;
  });

  useEffect(() => {
    setVisiblePostCount(10);
  }, [activeFilter, posts.length]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || visiblePostCount >= filteredPosts.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisiblePostCount((count) => Math.min(count + 10, filteredPosts.length));
        }
      },
      { rootMargin: '240px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPosts.length, visiblePostCount]);

  const visiblePosts = filteredPosts.slice(0, visiblePostCount);

  const handleShare = (post: CommunityPost) => {
    onSharePost(post);
    setCopiedPostId(post.id);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  return (
    <div className="p-3 sm:p-4 space-y-4 text-right select-none animate-in fade-in duration-200">
      {/* Lightbox / Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={expandedImage}
            alt="صورة مكبرة"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
          />
        </div>
      )}

      {/* Header Banner Section */}
      <div
        className={`border rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 8px 30px ${theme.colors.glow}`,
        }}
      >
        <div
          className="absolute top-0 inset-x-0 h-1.5 transition-colors"
          style={{
            background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.primary})`,
          }}
        />

        <div className="flex items-start justify-between gap-3 relative pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-2xl border flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  borderColor: `${theme.colors.primary}40`,
                  color: theme.colors.primary,
                }}
              >
                <Users className="w-5 h-5" />
              </div>
              <h1 className={`text-lg font-black ${theme.classes.textMain}`}>المجتمع الطلابي</h1>
            </div>
            <p className={`text-xs ${theme.classes.textMuted} leading-relaxed max-w-xs mt-1`}>
              مساحة تفاعلية للطلاب لمناقشة الأسئلة الوزارية، تبادل الملخصات، ومشاركة المعرفة.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBack && (
              <button
                onClick={onBack}
                className={`border font-bold py-2 px-3 rounded-2xl text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMain}`}
                aria-label="رجوع"
              >
                <ArrowRight className="w-4 h-4" style={{ color: theme.colors.primary }} />
                <span>رجوع</span>
              </button>
            )}

            <button
              onClick={onOpenCreatePost}
              className="text-white font-black py-2.5 px-4 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: theme.colors.primary,
                boxShadow: `0 4px 15px ${theme.colors.glow}`,
              }}
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء منشور</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className={`flex items-center gap-2 mt-4 pt-3 border-t overflow-x-auto no-scrollbar text-xs ${theme.classes.cardBorder}`}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'text-white shadow-md'
                : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`
            }`}
            style={activeFilter === 'all' ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}
          >
            الكل ({posts.length})
          </button>
          <button
            onClick={() => setActiveFilter('questions')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'questions'
                ? 'text-white shadow-md'
                : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`
            }`}
            style={activeFilter === 'questions' ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}
          >
            ❓ أسئلة وزارية
          </button>
          <button
            onClick={() => setActiveFilter('summaries')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'summaries'
                ? 'text-white shadow-md'
                : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`
            }`}
            style={activeFilter === 'summaries' ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}
          >
            📚 ملخصات وملازم
          </button>
          <button
            onClick={() => setActiveFilter('discussions')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'discussions'
                ? 'text-white shadow-md'
                : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`
            }`}
            style={activeFilter === 'discussions' ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}
          >
            💬 نقاشات دراسية
          </button>
        </div>
      </div>

      {/* Community Feed Posts */}
      <div className="space-y-3.5">
        {filteredPosts.length === 0 ? (
          <div className={`border rounded-3xl p-8 text-center space-y-2 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}>
            <Users className="w-10 h-10 mx-auto opacity-40" style={{ color: theme.colors.primary }} />
            <h3 className={`text-sm font-bold ${theme.classes.textMain}`}>لا توجد منشورات في هذه الفئة</h3>
            <p className={`text-xs ${theme.classes.textMuted}`}>كن أول من يشارك بسؤال أو ملخص دراسي في المجتمع الطلابي!</p>
          </div>
        ) : (
          visiblePosts.map((post) => {
            const isMenuOpen = activeMenuPostId === post.id;
            const postImages: string[] = post.images && post.images.length > 0 
              ? post.images 
              : (post.image ? [post.image] : []);
            
            return (
              <div
                key={post.id}
                className={`border rounded-3xl p-4 sm:p-5 shadow-xl space-y-3 text-right relative transition-all duration-300 ${theme.classes.cardBorder} ${theme.classes.cardBg}`}
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              >

                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-10 h-10 rounded-full border-2 object-cover bg-slate-800"
                      style={{ borderColor: theme.colors.primary }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className={`text-xs font-black ${theme.classes.textMain}`}>{post.userName}</h3>
                        {post.type === 'question' && (
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border"
                            style={{
                              backgroundColor: `${theme.colors.primary}20`,
                              borderColor: `${theme.colors.primary}40`,
                              color: theme.colors.primary,
                            }}
                          >
                            <HelpCircle className="w-2.5 h-2.5" />
                            سؤال وزاري
                          </span>
                        )}
                        {post.type === 'summary' && (
                          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" />
                            ملخص دراسي
                          </span>
                        )}
                        {post.type === 'discussion' && (
                          <span className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            مناقشة
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${theme.classes.textMuted}`}>
                        {post.timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Options Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuPostId(isMenuOpen ? null : post.id)}
                      className={`p-1.5 rounded-full border transition-colors cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className={`absolute top-8 left-0 border rounded-2xl shadow-2xl z-30 py-1.5 text-xs w-44 animate-in fade-in ${theme.classes.cardBg} ${theme.classes.cardBorder}`}>
                        <button
                          onClick={() => {
                            handleShare(post);
                            setActiveMenuPostId(null);
                          }}
                          className="w-full px-3.5 py-2 text-right hover:opacity-80 flex items-center gap-2 text-sky-400 font-medium cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>نسخ رابط المنشور</span>
                        </button>

                        <button
                          onClick={() => {
                            onReportPost(post.id);
                            setActiveMenuPostId(null);
                          }}
                          className="w-full px-3.5 py-2 text-right hover:opacity-80 flex items-center gap-2 text-amber-500 font-medium cursor-pointer border-t border-white/5"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span>الإبلاغ عن المنشور</span>
                        </button>


                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <p className={`text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-wrap ${theme.classes.textMain}`}>
                  {post.content}
                </p>

                {/* Multi-Images Grid (Supports up to 4 images per post) */}
                {postImages.length > 0 && (
                  <div
                    className={`rounded-2xl overflow-hidden border gap-1.5 p-1 ${theme.classes.cardBorder} ${theme.classes.cardSubtleBg} ${
                      postImages.length === 1
                        ? 'grid grid-cols-1'
                        : postImages.length === 2
                        ? 'grid grid-cols-2'
                        : postImages.length === 3
                        ? 'grid grid-cols-3'
                        : 'grid grid-cols-2'
                    }`}
                  >
                    {postImages.slice(0, 4).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setExpandedImage(imgUrl)}
                        className="relative rounded-xl overflow-hidden group cursor-pointer bg-black/40 aspect-video"
                      >
                        <img
                          src={imgUrl}
                          alt={`مرفق منشور ${idx + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Attachment Card */}
                {post.attachmentName && (
                  <div className={`rounded-2xl p-3 border flex items-center justify-between text-xs ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          backgroundColor: `${theme.colors.primary}20`,
                          color: theme.colors.primary,
                        }}
                      >
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`font-bold block text-[11px] ${theme.classes.textMain}`}>
                          {post.attachmentName}
                        </span>
                        <span className={`text-[9px] ${theme.classes.textMuted}`}>ملف دراسي جاهز للمطالعة</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-black px-2.5 py-1 rounded-lg border"
                      style={{
                        backgroundColor: `${theme.colors.primary}20`,
                        borderColor: `${theme.colors.primary}40`,
                        color: theme.colors.primary,
                      }}
                    >
                      PDF
                    </span>
                  </div>
                )}

                {/* Share copied toast */}
                {copiedPostId === post.id && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>تم نسخ رابط ومحتوى المنشور للمشاركة!</span>
                  </div>
                )}

                {/* Stats line */}
                <div className={`flex items-center justify-between pt-2 text-[11px] border-t ${theme.classes.textMuted} ${theme.classes.cardBorder}`}>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{post.likesCount} إعجاب</span>
                  </div>
                  <button
                    onClick={() => onOpenComments(post)}
                    className="hover:opacity-80 cursor-pointer font-bold"
                  >
                    {post.commentsCount} تعليق
                  </button>
                </div>

                {/* Interaction Action Buttons */}
                <div className={`grid grid-cols-3 gap-1 pt-1 border-t text-xs font-bold ${theme.classes.cardBorder}`}>
                  {/* Like Button */}
                  <button
                    onClick={() => onToggleLikePost(post.id)}
                    className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      post.isLiked
                        ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                        : `${theme.classes.cardSubtleBg} ${theme.classes.textMuted} border ${theme.classes.cardBorder}`
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.isLiked ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span>{post.isLiked ? 'أعجبني' : 'إعجاب'}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => onOpenComments(post)}
                    className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}
                  >
                    <MessageSquare className="w-4 h-4" style={{ color: theme.colors.primary }} />
                    <span>تعليق ({post.commentsCount})</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(post)}
                    className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
        {visiblePostCount < filteredPosts.length && (
          <div ref={loadMoreRef} className={`py-3 text-center text-[11px] ${theme.classes.textMuted}`}>
            مرّر للأسفل لعرض منشورات أقدم…
          </div>
        )}
      </div>
    </div>
  );
};
