import React, { useState, useRef } from 'react';
import {
  Award,
  Flame,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Zap,
  Target,
  LogOut,
  User,
  Sparkles,
  Camera,
  Upload,
  Check,
  Edit3,
  MessageSquare,
  ThumbsUp,
  Trash2,
  Share2,
  Calendar,
  LockKeyhole,
} from 'lucide-react';
import { useAppTheme } from '../services/themeService';
import { UserProfile, CommunityPost } from '../types';
import { DEFAULT_CARTOON_AVATARS, CartoonAvatarOption } from '../data/cartoonAvatars';
import { updateUserProfileData } from '../services/communityService';
import { getLevelSnapshot } from '../services/pointsService';

interface ProfileViewProps {
  user?: UserProfile | null;
  userPosts?: CommunityPost[];
  onUpdateUser?: (updated: UserProfile) => void;
  onDeletePost?: (postId: string) => void;
  onOpenComments?: (post: CommunityPost) => void;
  onBack?: () => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  userPosts = [],
  onUpdateUser,
  onDeletePost,
  onOpenComments,
  onBack,
  onSignOut,
}) => {
  const { theme } = useAppTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'posts' | 'achievements' | 'details'>('posts');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const userName = user?.name || 'طالب منصة نحن معك';
  const userGrade = user?.grade || 'السادس الإعدادي';
  const userBranch = user?.branch || 'الفرع العلمي';
  const userAvatar =
    user?.avatarUrl ||
    DEFAULT_CARTOON_AVATARS[0].url;
  const studyHours = user?.studyHours ?? 0;
  const streakDays = user?.streakDays ?? 0;
  const totalPoints = user?.points ?? 0;
  const userLevel = getLevelSnapshot(totalPoints).level;

  // Filter posts created by this user
  const authoredPosts = userPosts.filter(
    (p) => p.isOwnPost || (user?.id && p.userId === user.id) || p.userName === userName
  );

  // Handle choosing one of the free avatars, respecting the user's current level.
  const handleSelectCartoonAvatar = async (avatarOption: CartoonAvatarOption) => {
    if (!user) return;
    if (userLevel < avatarOption.unlockLevel) {
      showTempMsg(`تُفتح هذه الشخصية عند الوصول إلى المستوى ${avatarOption.unlockLevel}`);
      return;
    }
    const updated: UserProfile = {
      ...user,
      avatarUrl: avatarOption.url,
    };
    onUpdateUser?.(updated);
    setShowAvatarPicker(false);
    showTempMsg(`تم اختيار الشخصية الكرتونية: ${avatarOption.name}`);

    if (user.id) {
      const savedUser = await updateUserProfileData(user.id, { avatarUrl: avatarOption.url });
      if (savedUser) onUpdateUser?.(savedUser);
    }
  };

  // Handle custom photo upload
  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const photoUrl = event.target.result as string;
        const updated: UserProfile = {
          ...user,
          avatarUrl: photoUrl,
        };
        onUpdateUser?.(updated);
        setShowAvatarPicker(false);
        showTempMsg('تم تحديث صورتك الشخصية بنجاح 📸');

        if (user.id) {
          const savedUser = await updateUserProfileData(user.id, { avatarUrl: photoUrl });
          if (savedUser) onUpdateUser?.(savedUser);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const showTempMsg = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="p-3 space-y-4 text-right select-none animate-in fade-in duration-200">
      {/* Hidden File Input for Custom Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomPhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header Card */}
      <div
        className={`border rounded-3xl p-5 shadow-2xl text-center relative overflow-hidden transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        style={{
          boxShadow: `0 8px 30px ${theme.colors.glow}`,
        }}
      >
        {/* Banner with Top Actions */}
        <div
          className="absolute top-0 inset-x-0 h-16 flex justify-between items-start p-3 transition-colors"
          style={{
            background: `linear-gradient(to right, ${theme.colors.primary}30, ${theme.colors.secondary}20, ${theme.colors.primary}30)`,
          }}
        >
          {onSignOut ? (
            <button
              onClick={onSignOut}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 z-10 transition-all cursor-pointer text-rose-500 hover:bg-rose-500/10 ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          ) : (
            <div />
          )}

          {onBack && (
            <button
              onClick={onBack}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 z-10 transition-all cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
              style={{ color: theme.colors.primary }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </button>
          )}
        </div>

        <div className="relative pt-4">
          {/* Avatar with Interactive Edit Badge */}
          <div className="relative inline-block mx-auto group">
            <div
              className="w-24 h-24 rounded-full border-3 p-1 shadow-2xl relative overflow-hidden transition-all"
              style={{
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.bgCardSubtle,
                boxShadow: `0 0 20px ${theme.colors.glow}`,
              }}
            >
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover rounded-full bg-slate-800"
              />
            </div>

            {/* Quick Change Avatar Button */}
            <button
              type="button"
              onClick={() => setShowAvatarPicker(true)}
              className="absolute bottom-0 right-0 p-2 rounded-full text-white shadow-lg transition-all active:scale-95 cursor-pointer ring-2 ring-slate-900"
              style={{ backgroundColor: theme.colors.primary }}
              title="تغيير الصورة أو اختيار شخصية كرتونية"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className={`text-lg font-black mt-2.5 ${theme.classes.textMain}`}>{userName}</h2>
          <p className="text-xs font-bold mt-0.5" style={{ color: theme.colors.primary }}>
            {userGrade} • {userBranch}
          </p>

          {user?.email && (
            <p className={`text-[11px] mt-0.5 ${theme.classes.textMuted}`}>{user.email}</p>
          )}

          {/* Quick Avatar Picker CTA */}
          <div className="mt-2.5 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowAvatarPicker(true)}
              className={`px-3.5 py-1.5 rounded-full border text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} hover:border-sky-400`}
              style={{ color: theme.colors.primary }}
            >
              <Sparkles className="w-3 h-3" />
              <span>تغيير الأفاتار (شخصيات كرتونية أو صورتك)</span>
            </button>
          </div>

          {/* Success toast feedback inside profile */}
          {saveSuccessMsg && (
            <div className="mt-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Stats Bar */}
          <div
            className={`grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl border text-center text-xs transition-colors ${
              theme.isLight ? 'bg-slate-50 border-slate-200' : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`
            }`}
          >
            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>ساعات المشاهدة</span>
              <span className={`font-bold flex items-center justify-center gap-1 mt-0.5 ${theme.classes.textMain}`}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
                {studyHours} س
              </span>
            </div>
            <div className={`border-x ${theme.isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>أيام التفاعل</span>
              <span className="font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {streakDays} يوم
              </span>
            </div>
            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>مجموع النقاط</span>
              <span className={`font-bold flex items-center justify-center gap-1 mt-0.5 ${theme.classes.textMain}`}>
                <Award className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
                {totalPoints.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* AVATAR SELECTOR MODAL / SHEET */}
      {/* ======================================================== */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-5 border shadow-2xl text-right space-y-4 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <h3 className={`text-base font-black ${theme.classes.textMain} flex items-center gap-2`}>
                <Sparkles className="w-4 h-4" style={{ color: theme.colors.primary }} />
                <span>اختر صورتك الرمزية أو ارفع صورة</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Image Upload Button */}
            <div className="space-y-2">
              <label className={`text-xs font-black block ${theme.classes.textMain}`}>
                1. رفع صورة مخصصة من جهازك:
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3 px-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  theme.isLight
                    ? 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
                    : 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>اختر صورة من الاستوديو أو التقط صورة</span>
              </button>
            </div>

            {/* 4 Default Cartoon Avatars (Duolingo-style fruits & mascots) */}
            <div className="space-y-2.5 pt-2">
              <label className={`text-xs font-black block ${theme.classes.textMain}`}>
                2. اختر شخصية مجانية من مكتبة الأفاتارات:
              </label>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[10px]">
                <span className={theme.classes.textMuted}>مستواك الحالي: <strong className="text-sky-400">{userLevel}</strong></span>
                <span className="text-emerald-400 font-bold">الفواكه من المستوى 1</span>
                <span className="text-amber-400 font-bold">رفاق الدراسة من المستوى 3</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_CARTOON_AVATARS.map((avatar) => {
                  const isSelected = userAvatar === avatar.url;
                  const isUnlocked = userLevel >= avatar.unlockLevel;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectCartoonAvatar(avatar)}
                      disabled={!isUnlocked}
                      aria-label={isUnlocked ? `اختيار ${avatar.name}` : `${avatar.name} مقفلة حتى المستوى ${avatar.unlockLevel}`}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col items-center gap-2 relative overflow-hidden ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/20 shadow-lg shadow-sky-500/15'
                          : isUnlocked
                          ? `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder} hover:border-sky-400/70 hover:-translate-y-0.5 cursor-pointer`
                          : 'border-white/5 bg-black/10 opacity-55 cursor-not-allowed'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] z-10">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      {!isUnlocked && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900/80 text-amber-300 flex items-center justify-center text-[10px] z-10" title={`يفتح في المستوى ${avatar.unlockLevel}`}>
                          <LockKeyhole className="w-3 h-3" />
                        </span>
                      )}

                      <div
                        className="w-16 h-16 rounded-2xl p-1 shadow-md border transition-transform duration-200"
                        style={{
                          backgroundColor: avatar.bgColor,
                          borderColor: avatar.borderColor,
                        }}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-contain" loading="lazy" />
                      </div>

                      <div className="text-center w-full">
                        <div className={`text-xs font-black ${theme.classes.textMain}`}>{avatar.name}</div>
                        <div className={`text-[10px] mt-0.5 line-clamp-1 ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isUnlocked ? `متاح مجاناً • المستوى ${avatar.unlockLevel}` : `يفتح في المستوى ${avatar.unlockLevel}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs text-center"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PROFILE TABS: MY POSTS / ACHIEVEMENTS / DETAILS */}
      {/* ======================================================== */}
      <div
        className={`grid grid-cols-3 p-1 rounded-2xl border ${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'posts'
              ? 'text-white shadow-md'
              : `${theme.classes.textMuted} hover:${theme.classes.textMain}`
          }`}
          style={
            activeTab === 'posts'
              ? {
                  backgroundColor: theme.colors.primary,
                  boxShadow: `0 2px 10px ${theme.colors.glow}`,
                }
              : {}
          }
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>منشوراتي ({authoredPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'achievements'
              ? 'text-white shadow-md'
              : `${theme.classes.textMuted} hover:${theme.classes.textMain}`
          }`}
          style={
            activeTab === 'achievements'
              ? {
                  backgroundColor: theme.colors.primary,
                  boxShadow: `0 2px 10px ${theme.colors.glow}`,
                }
              : {}
          }
        >
          <Target className="w-3.5 h-3.5" />
          <span>الإنجازات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'details'
              ? 'text-white shadow-md'
              : `${theme.classes.textMuted} hover:${theme.classes.textMain}`
          }`}
          style={
            activeTab === 'details'
              ? {
                  backgroundColor: theme.colors.primary,
                  boxShadow: `0 2px 10px ${theme.colors.glow}`,
                }
              : {}
          }
        >
          <User className="w-3.5 h-3.5" />
          <span>البيانات</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB CONTENT 1: MY POSTS */}
      {/* ======================================================== */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {authoredPosts.length === 0 ? (
            <div
              className={`p-8 rounded-3xl border text-center space-y-2 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
            >
              <MessageSquare className="w-8 h-8 mx-auto text-gray-500" />
              <h4 className={`text-xs font-bold ${theme.classes.textMain}`}>لم تنشر أي مشاركة بعد</h4>
              <p className={`text-[11px] ${theme.classes.textMuted}`}>
                انتقل إلى المجتمع الطلابي واطرح سؤالاً أو شارك ملخصاً مع زملائك!
              </p>
            </div>
          ) : (
            authoredPosts.map((post) => (
              <div
                key={post.id}
                className={`p-4 rounded-3xl border space-y-3 shadow-md relative transition-all ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.userAvatar || userAvatar}
                      alt={post.userName}
                      className="w-8 h-8 rounded-full object-cover border"
                      style={{ borderColor: theme.colors.primary }}
                    />
                    <div>
                      <h4 className={`text-xs font-black ${theme.classes.textMain}`}>{post.userName}</h4>
                      <span className={`text-[10px] ${theme.classes.textMuted}`}>{post.timeAgo}</span>
                    </div>
                  </div>

                  {onDeletePost && (
                    <button
                      type="button"
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="حذف هذا المنشور"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className={`text-xs leading-relaxed ${theme.classes.textMain}`}>{post.content}</p>

                {/* Images Preview in Post */}
                {post.images && post.images.length > 0 && (
                  <div
                    className={`grid gap-1.5 rounded-2xl overflow-hidden ${
                      post.images.length === 1
                        ? 'grid-cols-1'
                        : post.images.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-2'
                    }`}
                  >
                    {post.images.slice(0, 4).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`صورة ${i + 1}`}
                        className="w-full h-28 object-cover rounded-xl border border-white/10"
                      />
                    ))}
                  </div>
                )}

                {/* Footer counters */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sky-400 font-bold">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likesCount} إعجاب</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenComments?.(post)}
                      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentsCount} تعليق</span>
                    </button>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    منشور نشط
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT 2: ACHIEVEMENTS */}
      {/* ======================================================== */}
      {activeTab === 'achievements' && (
        <div
          className={`border rounded-3xl p-4 shadow-xl space-y-3 text-xs transition-all duration-300 ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        >
          <h3 className={`font-black border-b pb-2 flex items-center gap-1.5 ${theme.classes.textMain} ${theme.classes.cardBorder}`}>
            <Target className="w-4 h-4" style={{ color: theme.colors.primary }} />
            الإنجازات والتقدم الدراسي
          </h3>

          <div className="space-y-2">
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                theme.isLight ? 'bg-slate-50 border-slate-200' : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: `${theme.colors.primary}20`,
                    borderColor: `${theme.colors.primary}40`,
                    color: theme.colors.primary,
                  }}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className={`font-bold ${theme.classes.textMain}`}>المستوى الأكاديمي {userLevel}</div>
                  <div className={`text-[10px] ${theme.classes.textMuted}`}>{totalPoints} نقطة • التقدم {getLevelSnapshot(totalPoints).progressPercent}% نحو المستوى التالي</div>
                </div>
              </div>
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  borderColor: `${theme.colors.primary}40`,
                  color: theme.colors.primary,
                }}
              >
                المستوى {userLevel}
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                theme.isLight ? 'bg-slate-50 border-slate-200' : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className={`font-bold ${theme.classes.textMain}`}>سلسلة المذاكرة المتواصلة</div>
                  <div className={`text-[10px] ${theme.classes.textMuted}`}>التزام يومي لمدة {streakDays} يوماً</div>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
                مشتعل 🔥
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                theme.isLight ? 'bg-slate-50 border-slate-200' : `${theme.classes.cardSubtleBg} ${theme.classes.cardBorder}`
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className={`font-bold ${theme.classes.textMain}`}>طالب متميز في الوزاريات</div>
                  <div className={`text-[10px] ${theme.classes.textMuted}`}>حل أكثر من 150 سؤال وزاري</div>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                معتمد ✓
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB CONTENT 3: DETAILS */}
      {/* ======================================================== */}
      {activeTab === 'details' && (
        <div
          className={`border rounded-3xl p-4 shadow-xl space-y-3 text-xs ${theme.classes.cardBg} ${theme.classes.cardBorder}`}
        >
          <h3 className={`font-black border-b pb-2 flex items-center gap-1.5 ${theme.classes.textMain} ${theme.classes.cardBorder}`}>
            <User className="w-4 h-4" style={{ color: theme.colors.primary }} />
            المعلومات الدراسية والحساب
          </h3>

          <div className="space-y-2.5">
            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>الاسم الكامل:</span>
              <span className={`font-bold text-xs ${theme.classes.textMain}`}>{userName}</span>
            </div>

            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>البريد الإلكتروني المعتمد:</span>
              <span className="font-mono text-xs font-bold text-sky-400">{user?.email || 'طالب المنصة'}</span>
            </div>

            <div>
              <span className={`text-[10px] block ${theme.classes.textMuted}`}>المرحلة والفرع:</span>
              <span className={`font-bold text-xs ${theme.classes.textMain}`}>{userGrade} - {userBranch}</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="w-full py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>تعديل الصورة الرمزية والأفاتار</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
