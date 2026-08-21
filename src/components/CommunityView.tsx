import React, { useState } from 'react';
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
  Trash2,
  Paperclip,
  ArrowRight,
} from 'lucide-react';
import { CommunityPost, CommunityStory } from '../types';
import { useAppTheme } from '../services/themeService';

interface CommunityViewProps {
  posts: CommunityPost[];
  stories: CommunityStory[];
  onOpenCreatePost: () => void;
  onOpenComments: (post: CommunityPost) => void;
  onToggleLikePost: (postId: string) => void;
  onSharePost: (post: CommunityPost) => void;
  onDeletePost: (postId: string) => void;
  onReportPost: (postId: string) => void;
  onSelectCommunityStory: (story: CommunityStory) => void;
  onBack?: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  stories,
  onOpenCreatePost,
  onOpenComments,
  onToggleLikePost,
  onSharePost,
  onDeletePost,
  onReportPost,
  onSelectCommunityStory,
  onBack,
}) => {
  const { theme } = useAppTheme();
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'questions' | 'summaries' | 'discussions'>('all');

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'questions') return post.type === 'question';
    if (activeFilter === 'summaries') return post.type === 'summary';
    if (activeFilter === 'discussions') return post.type === 'discussion';
    return true;
  });

  return (
    <div className="p-3 sm:p-4 space-y-4 text-right select-none animate-in fade-in duration-200">
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
              <h1 className={`text-lg font-bold ${theme.classes.textMain}`}>المجتمع الطلابي</h1>
            </div>
            <p className={`text-xs ${theme.classes.textMuted} leading-relaxed max-w-xs mt-1`}>
              مساحة للطلاب لتبادل الأسئلة والأفكار والخبرات التعليمية.
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
              className="text-white font-bold py-2.5 px-3.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: theme.colors.primary,
                boxShadow: `0 4px 15px ${theme.colors.glow}`,
              }}
            >
              <Plus className="w-4 h-4" />
              <span>منشور</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className={`flex items-center gap-2 mt-4 pt-3 border-t overflow-x-auto no-scrollbar text-xs ${theme.classes.cardBorder}`}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'questions'
                ? 'text-white shadow-md'
                : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`
            }`}
            style={activeFilter === 'questions' ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}
          >
            أسئلة وإجابات ❓
          </button>
          <button
            onClick={() => setActiveFilter('summaries')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'summaries'
                ? 'text-white shadow-md'
                : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`
            }`}
            style={activeFilter === 'summaries' ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}
          >
            ملخصات دراسية 📚
          </button>
          <button
            onClick={() => setActiveFilter('discussions')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'discussions'
                ? 'text-white shadow-md'
                : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} ${theme.classes.textMuted}`
            }`}
            style={activeFilter === 'discussions' ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}
          >
            مناقشة الشروحات 💬
          </button>
        </div>
      </div>

      {/* Community Stories Horizontal Section */}
      <div className={`border rounded-3xl p-3.5 shadow-xl transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}>
        <div className="flex items-center justify-between px-1 mb-2.5">
          <span className={`text-xs font-bold flex items-center gap-1.5 ${theme.classes.textMain}`}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
            قصص وتجارب الطلاب
          </span>
          <span className={`text-[10px] ${theme.classes.textMuted}`}>تحديثات تعليمية قصيرة</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 pr-1">
          {/* Add story button */}
          <button
            onClick={onOpenCreatePost}
            className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
          >
            <div
              className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center group-hover:scale-105 transition-transform ${theme.classes.cardSubtleBg}`}
              style={{
                borderColor: theme.colors.primary,
                color: theme.colors.primary,
              }}
            >
              <Plus className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-medium ${theme.classes.textMuted}`}>أضف القصة</span>
          </button>

          {/* Student stories list */}
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => onSelectCommunityStory(story)}
              className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
            >
              <div
                className={`w-14 h-14 rounded-full p-0.5 border-2 transition-transform group-hover:scale-105 ${
                  story.hasUnseen ? 'shadow-lg' : ''
                }`}
                style={{
                  borderColor: story.hasUnseen ? theme.colors.primary : 'rgba(0,0,0,0.1)',
                  boxShadow: story.hasUnseen ? `0 0 10px ${theme.colors.glow}` : undefined,
                }}
              >
                <img
                  src={story.userAvatar}
                  alt={story.userName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className={`text-[10px] font-medium max-w-[60px] truncate text-center ${theme.classes.textMain}`}>
                {story.userName.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Community Feed Posts */}
      <div className="space-y-3.5">
        {filteredPosts.length === 0 ? (
          <div className={`border rounded-3xl p-8 text-center space-y-2 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}>
            <Users className="w-10 h-10 mx-auto opacity-40" style={{ color: theme.colors.primary }} />
            <h3 className={`text-sm font-bold ${theme.classes.textMain}`}>لا توجد منشورات في هذه الفئة</h3>
            <p className={`text-xs ${theme.classes.textMuted}`}>كن أول من يشارك بسؤال أو فكرة في المجتمع الطلابي!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isMenuOpen = activeMenuPostId === post.id;

            return (
              <div
                key={post.id}
                className={`border rounded-3xl p-4 sm:p-5 shadow-xl space-y-3 text-right relative transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
                style={{
                  boxShadow: `0 4px 20px ${theme.colors.glow}`,
                }}
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-10 h-10 rounded-full border object-cover"
                      style={{ borderColor: theme.colors.primary }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className={`text-xs font-bold ${theme.classes.textMain}`}>{post.userName}</h3>
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
                            سؤال
                          </span>
                        )}
                        {post.type === 'summary' && (
                          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" />
                            ملخص
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
                      <div className={`absolute top-8 left-0 border rounded-2xl shadow-2xl z-30 py-1.5 text-xs w-40 animate-in fade-in ${theme.classes.cardBg} ${theme.classes.cardBorder}`}>
                        <button
                          onClick={() => {
                            onReportPost(post.id);
                            setActiveMenuPostId(null);
                          }}
                          className="w-full px-3.5 py-2 text-right hover:opacity-80 flex items-center gap-2 text-amber-500 font-medium cursor-pointer"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span>الإبلاغ عن المنشور</span>
                        </button>
                        {post.isOwnPost && (
                          <button
                            onClick={() => {
                              onDeletePost(post.id);
                              setActiveMenuPostId(null);
                            }}
                            className={`w-full px-3.5 py-2 text-right hover:opacity-80 flex items-center gap-2 text-rose-500 font-medium border-t cursor-pointer ${theme.classes.cardBorder}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف المنشور</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <p className={`text-xs sm:text-sm leading-relaxed font-normal ${theme.classes.textMain}`}>
                  {post.content}
                </p>

                {/* Optional Image */}
                {post.image && (
                  <div className={`rounded-2xl overflow-hidden border max-h-56 ${theme.classes.cardBorder} ${theme.classes.cardSubtleBg}`}>
                    <img
                      src={post.image}
                      alt="مرفق منشور"
                      className="w-full h-full object-cover"
                    />
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
                        <span className={`text-[9px] ${theme.classes.textMuted}`}>مرفق تعليمي جاهز للتحميل</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-lg border"
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

                {/* Stats line */}
                <div className={`flex items-center justify-between pt-2 text-[11px] border-t ${theme.classes.textMuted} ${theme.classes.cardBorder}`}>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{post.likesCount} إعجاب</span>
                  </div>
                  <button
                    onClick={() => onOpenComments(post)}
                    className="hover:opacity-80 cursor-pointer"
                  >
                    {post.commentsCount} تعليق
                  </button>
                </div>

                {/* Interaction Action Buttons */}
                <div className={`grid grid-cols-3 gap-1 pt-1 border-t text-xs font-semibold ${theme.classes.cardBorder}`}>
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
                    <span>تعليق</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => onSharePost(post)}
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
      </div>
    </div>
  );
};
