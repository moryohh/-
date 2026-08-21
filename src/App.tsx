import React, { useState } from 'react';
import {
  INITIAL_STORIES,
  FEATURED_LESSON,
  NOTIFICATIONS_DATA,
  INITIAL_COMMUNITY_POSTS,
  COMMUNITY_STORIES,
} from './data/mockData';
import { getGamesForLesson } from './data/mockGames';
import {
  TeacherStory,
  EducationalLesson,
  LessonAttachment,
  AppNotification,
  CommentItem,
  CommunityPost,
  CommunityStory,
  CommunityComment,
} from './types';
import { Header } from './components/Header';
import { StoriesSection } from './components/StoriesSection';
import { StoryViewerModal } from './components/StoryViewerModal';
import { VideoPlayerCard } from './components/VideoPlayerCard';
import { AttachmentModal } from './components/AttachmentModal';
import { CommentsDrawer } from './components/CommentsDrawer';
import { NotificationsModal } from './components/NotificationsModal';
import { TeacherInfoModal } from './components/TeacherInfoModal';
import { BottomNav, NavTab } from './components/BottomNav';
import { SubscriptionsView } from './components/SubscriptionsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { CommunityView } from './components/CommunityView';
import { CreatePostModal } from './components/CreatePostModal';
import { CommunityCommentsModal } from './components/CommunityCommentsModal';
import { MainHomeView } from './components/MainHomeView';
import { SubjectLearningPathView } from './components/SubjectLearningPathView';
import { LessonGamesModal } from './components/LessonGamesModal';
import { GRADE_6_SUBJECTS } from './data/mockSubjects';
import { Toast } from './components/Toast';
import { cleanTeacherName } from './utils/cleanTeacherName';
import { ThemeProvider, useAppTheme } from './services/themeService';
import {
  clearLessonsCache,
  getSubjectChapters,
  getChapterLessons,
  getLessonDetails,
  createTeacherStoryFromLesson,
  extractYoutubeId,
} from './services/lessonsService';

function AppContent() {
  const { theme } = useAppTheme();

  // Main app state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [homeSubView, setHomeSubView] = useState<'main_home' | 'learning_path' | 'lesson_player'>('main_home');
  const [selectedSubject, setSelectedSubject] = useState<(typeof GRADE_6_SUBJECTS)[0] | null>(GRADE_6_SUBJECTS[0]);
  const [stories, setStories] = useState<TeacherStory[]>(INITIAL_STORIES);
  const [lesson, setLesson] = useState<EducationalLesson>(FEATURED_LESSON);
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS_DATA);

  // Community state
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [communityStories, setCommunityStories] = useState<CommunityStory[]>(COMMUNITY_STORIES);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [activeCommunityPostForComments, setActiveCommunityPostForComments] = useState<CommunityPost | null>(null);

  // Modals & Drawers state
  const [selectedStory, setSelectedStory] = useState<TeacherStory | null>(null);
  const [activeAttachment, setActiveAttachment] = useState<LessonAttachment | null>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTeacherInfoOpen, setIsTeacherInfoOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);


  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    clearLessonsCache();
  }, []);

  // Sync stories whenever the active lesson changes (showing the teachers who teach this exact lesson)
  React.useEffect(() => {
    if (lesson && (lesson as any).teacherStories && (lesson as any).teacherStories.length > 0) {
      setStories((lesson as any).teacherStories);
    }
  }, [lesson]);

  // Dynamic Stories: Update stories based on selected subject and chapters from Supabase Storage
  React.useEffect(() => {
    let isMounted = true;
    async function loadDynamicStories() {
      if (!selectedSubject) return;

      // If the current lesson already has teachers for this subject, don't overwrite
      if (lesson && (lesson as any).teacherStories && (lesson as any).teacherStories.length > 0) {
        return;
      }

      try {
        const chaptersRes = await getSubjectChapters(selectedSubject.id, selectedSubject.name);
        if (!isMounted) return;

        const chapters = chaptersRes.data || [];
        if (chapters.length > 0) {
          // Fetch lessons from the first chapter
          const firstChapter = chapters[0];
          const lessonsRes = await getChapterLessons(
            selectedSubject.id,
            firstChapter.title,
            1,
            selectedSubject.name
          );
          if (!isMounted) return;

          const chapterLessons = lessonsRes.data || [];
          if (chapterLessons.length > 0) {
            const dynamicStories: TeacherStory[] = chapterLessons
              .filter((cl) => {
                const testId = extractYoutubeId(
                  cl.lessonData?.youtubeId,
                  cl.title,
                  cl.lessonData?.teacherName || selectedSubject.teacher,
                  cl.subtitle
                );
                return Boolean(testId);
              })
              .map((cl, idx) => {
                const rawName = cl.lessonData?.teacherName || selectedSubject.teacher || `مدرس ${idx + 1}`;
                const tName = cleanTeacherName(rawName) || rawName;
                const rawRole = cl.lessonData?.teacherRole || `الدرس ${idx + 1}`;
                const cName = cleanTeacherName(rawRole) || rawRole;
                const yId = extractYoutubeId(
                  cl.lessonData?.youtubeId,
                  cl.title,
                  tName,
                  cl.subtitle
                );
                const yThumb = `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;

                return {
                  id: `story-${selectedSubject.id}-${cl.id}`,
                  teacherName: tName,
                  channelName: cName,
                  subject: selectedSubject.name,
                  title: cl.title,
                  avatar: cl.lessonData?.teacherAvatar && !cl.lessonData.teacherAvatar.includes('unsplash.com/photo-1573496359142') ? cl.lessonData.teacherAvatar : yThumb,
                  hasUnseen: true,
                  duration: '15:20',
                  youtubeId: yId,
                  videoUrl: `https://www.youtube.com/watch?v=${yId}`,
                  storyImage: yThumb,
                  textNotes: cl.subtitle || `شرح ${cl.title} لمادة ${selectedSubject.name}`,
                  lessonData: cl.lessonData,
                };
              });

            setStories(dynamicStories);
          }
        }
      } catch (err) {
        console.error('Error loading dynamic stories:', err);
      }
    }

    loadDynamicStories();
    return () => {
      isMounted = false;
    };
  }, [selectedSubject]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Handlers - Direct Teacher Switching without Story Modals
  const handleSelectStory = async (story: TeacherStory) => {
    // Switch the main video player directly to this teacher's YouTube video from JSON/Curriculum
    if (story.lessonData) {
      setLesson(story.lessonData);
    } else if (selectedSubject) {
      try {
        const res = await getLessonDetails(
          selectedSubject.id,
          'الفصل الأول',
          story.title,
          selectedSubject.name
        );
        if (res.data) {
          setLesson(res.data);
        } else if (story.youtubeId) {
          setLesson((prev) => ({
            ...prev,
            id: story.id,
            title: story.title || prev.title,
            subtitle: story.subject || prev.subtitle,
            category: story.subject || prev.category,
            teacherName: story.teacherName,
            teacherAvatar: story.avatar,
            teacherRole: story.channelName || story.teacherName,
            youtubeId: story.youtubeId!,
            duration: story.duration || prev.duration,
            description: story.textNotes || prev.description,
          }));
        }
      } catch {
        if (story.youtubeId) {
          setLesson((prev) => ({
            ...prev,
            id: story.id,
            title: story.title || prev.title,
            subtitle: story.subject || prev.subtitle,
            category: story.subject || prev.category,
            teacherName: story.teacherName,
            teacherAvatar: story.avatar,
            teacherRole: story.channelName || story.teacherName,
            youtubeId: story.youtubeId!,
            duration: story.duration || prev.duration,
            description: story.textNotes || prev.description,
          }));
        }
      }
    } else if (story.youtubeId) {
      setLesson((prev) => ({
        ...prev,
        id: story.id,
        title: story.title || prev.title,
        subtitle: story.subject || prev.subtitle,
        category: story.subject || prev.category,
        teacherName: story.teacherName,
        teacherAvatar: story.avatar,
        teacherRole: story.channelName || story.teacherName,
        youtubeId: story.youtubeId!,
        duration: story.duration || prev.duration,
        description: story.textNotes || prev.description,
      }));
    }

    // Match subject if possible
    const matchedSubject = GRADE_6_SUBJECTS.find(
      (s) => s.name === story.subject || s.id === story.id.replace('story-', '')
    );
    if (matchedSubject) {
      setSelectedSubject(matchedSubject);
    }

    // Ensure the video player view is shown immediately
    setActiveTab('home');
    setHomeSubView('lesson_player');

    // DO NOT open any full-screen story modal!
    setSelectedStory(null);

    showToast(`▶ تم اختيار شرح ${story.teacherName}`);

    // Mark story as seen
    setStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, hasUnseen: false } : s))
    );
  };

  const handleNextStory = () => {
    if (!selectedStory) return;
    const currentIndex = stories.findIndex((s) => s.id === selectedStory.id);
    if (currentIndex < stories.length - 1) {
      handleSelectStory(stories[currentIndex + 1]);
    } else {
      setSelectedStory(null);
    }
  };

  const handlePrevStory = () => {
    if (!selectedStory) return;
    const currentIndex = stories.findIndex((s) => s.id === selectedStory.id);
    if (currentIndex > 0) {
      handleSelectStory(stories[currentIndex - 1]);
    }
  };

  const handleToggleBookmark = () => {
    setLesson((prev) => {
      const nextState = !prev.isBookmarked;
      showToast(nextState ? 'تم حفظ الدرس 📌' : 'تم إزالة الدرس من المحفوظات');
      return { ...prev, isBookmarked: nextState };
    });
  };

  const handleToggleLike = () => {
    setLesson((prev) => {
      const nextLiked = !prev.isLiked;
      showToast(nextLiked ? 'شكراً لإعجابك بالدرس! 👍' : 'تم إلغاء الإعجاب');
      return {
        ...prev,
        isLiked: nextLiked,
      };
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('تم نسخ رابط الدرس بنجاح! 🔗');
  };

  const handleDownloadAttachment = (title: string) => {
    showToast(`جاري تحميل "${title}"... 📥`);
  };

  const handleAddComment = (text: string) => {
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      userName: 'أنت (طالب منصة نحن معك)',
      userAvatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'الآن',
      text,
      likes: 0,
      isLiked: false,
    };

    setLesson((prev) => ({
      ...prev,
      comments: [newComment, ...prev.comments],
    }));

    showToast('تم إضافة تعليقك بنجاح! 💬');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('تم تحديد جميع الإشعارات كأنها قُرئت');
  };

  // Community Handlers
  const handleCreatePost = (newPostData: Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount' | 'isLiked' | 'comments'>) => {
    const newPost: CommunityPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      comments: [],
    };

    setCommunityPosts((prev) => [newPost, ...prev]);
    showToast('تم نشر منشورك في المجتمع الطلابي بنجاح! 🎉');
  };

  const handleToggleLikeCommunityPost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );
  };

  const handleShareCommunityPost = (post: CommunityPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast(`تم نسخ رابط منشور ${post.userName}! 🔗`);
  };

  const handleDeleteCommunityPost = (postId: string) => {
    setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('تم حذف المنشور بنجاح');
  };

  const handleReportCommunityPost = (postId: string) => {
    showToast('تم إرسال البلاغ للإدارة للتأكد من السلامة. شكراً لك! 🛡️');
  };

  const handleAddCommunityComment = (postId: string, text: string) => {
    const newComment: CommunityComment = {
      id: `cc-${Date.now()}`,
      userName: 'أنت (طالب منصة نحن معك)',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'الآن',
      text,
      likes: 0,
      isLiked: false,
    };

    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = [newComment, ...p.comments];
          const updatedPost = {
            ...p,
            comments: updatedComments,
            commentsCount: updatedComments.length,
          };
          if (activeCommunityPostForComments?.id === postId) {
            setActiveCommunityPostForComments(updatedPost);
          }
          return updatedPost;
        }
        return p;
      })
    );

    showToast('تم إضافة تعليقك على المنشور! 💬');
  };

  const handleLikeCommunityComment = (postId: string, commentId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments.map((c) => {
            if (c.id === commentId) {
              const nextLiked = !c.isLiked;
              return {
                ...c,
                isLiked: nextLiked,
                likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
              };
            }
            return c;
          });
          const updatedPost = { ...p, comments: updatedComments };
          if (activeCommunityPostForComments?.id === postId) {
            setActiveCommunityPostForComments(updatedPost);
          }
          return updatedPost;
        }
        return p;
      })
    );
  };

  const handleDeleteCommunityComment = (postId: string, commentId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments.filter((c) => c.id !== commentId);
          const updatedPost = {
            ...p,
            comments: updatedComments,
            commentsCount: updatedComments.length,
          };
          if (activeCommunityPostForComments?.id === postId) {
            setActiveCommunityPostForComments(updatedPost);
          }
          return updatedPost;
        }
        return p;
      })
    );
    showToast('تم حذف التعليق');
  };

  const handleSelectCommunityStory = (story: CommunityStory) => {
    // Transform community story to teacher story structure to reuse the viewer modal smoothly
    const storyToView: TeacherStory = {
      id: story.id,
      teacherName: story.userName,
      avatar: story.userAvatar,
      subject: 'قصة طلابية',
      title: story.title,
      hasUnseen: false,
      textNotes: story.textNotes,
      storyImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    };

    setCommunityStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, hasUnseen: false } : s))
    );
    setSelectedStory(storyToView);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className={`min-h-screen ${theme.classes.outerBg} ${theme.classes.textMain} flex flex-col items-center justify-start antialiased font-cairo transition-colors duration-300`}
    >
      {/* Toast Feedback Notification */}
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />

      {/* Outer Shell for Mobile-first responsive wrapper */}
      <div
        className={`w-full max-w-md min-h-screen ${theme.classes.wrapperBg} shadow-2xl relative border-x ${theme.classes.cardBorder} pb-16 flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* Dynamic Ambient Theme Glows */}
        <div
          className="absolute top-1/4 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-30 transition-all duration-500"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div
          className="absolute top-2/3 -left-20 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-25 transition-all duration-500"
          style={{ backgroundColor: theme.colors.accent }}
        />

        {/* Header */}
        <Header
          title={
            activeTab === 'home'
              ? homeSubView === 'lesson_player'
                ? lesson.title
                : homeSubView === 'learning_path'
                ? selectedSubject
                  ? `خارطة ${selectedSubject.name}`
                  : 'خارطة المنهج'
                : 'الصفحة الرئيسية - السادس'
              : activeTab === 'community'
              ? 'المجتمع الطلابي'
              : activeTab === 'subscriptions'
              ? 'الاشتراكات والدروس'
              : activeTab === 'profile'
              ? 'الملف الشخصي'
              : 'الإعدادات'
          }
          unreadCount={unreadCount}
          showBackButton={activeTab !== 'home' || (activeTab === 'home' && homeSubView !== 'main_home')}
          onBack={() => {
            if (activeTab === 'home') {
              if (homeSubView === 'lesson_player') {
                setHomeSubView(selectedSubject ? 'learning_path' : 'main_home');
              } else if (homeSubView === 'learning_path') {
                setHomeSubView('main_home');
              }
            } else {
              setActiveTab('home');
              setHomeSubView('main_home');
            }
          }}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenGames={() => setIsGamesOpen(true)}
        />

        {/* Tab Content Router */}
        <main className="flex-1">
          {/* 1. Main Home Subject Grid */}
          {activeTab === 'home' && homeSubView === 'main_home' && (
            <MainHomeView
              onSelectSubject={(subject) => {
                setSelectedSubject(subject);
                setHomeSubView('learning_path');
              }}
              onSelectLesson={(selectedLesson) => {
                setLesson(selectedLesson);
                setHomeSubView('lesson_player');
              }}
              onOpenGames={() => setIsGamesOpen(true)}
            />
          )}

          {/* 2. Intermediate Subject Learning Path (خارطة المادة والتقدم) */}
          {activeTab === 'home' && homeSubView === 'learning_path' && selectedSubject && (
            <SubjectLearningPathView
              subject={selectedSubject}
              onSelectLesson={(selectedLesson) => {
                setLesson(selectedLesson);
                if ((selectedLesson as any).teacherStories && (selectedLesson as any).teacherStories.length > 0) {
                  setStories((selectedLesson as any).teacherStories);
                }
                setHomeSubView('lesson_player');
              }}
              onBack={() => {
                setHomeSubView('main_home');
              }}
              onOpenGames={() => setIsGamesOpen(true)}
            />
          )}

          {/* 3. Lesson Player View */}
          {activeTab === 'home' && homeSubView === 'lesson_player' && (
            <div className="space-y-3 animate-in fade-in duration-300">
              {/* Stories / Teacher Channels Selector Section */}
              <StoriesSection
                stories={stories}
                currentPlayingYoutubeId={lesson.youtubeId}
                currentPlayingTeacher={lesson.teacherName}
                onSelectStory={handleSelectStory}
                onOpenQuiz={() => setIsGamesOpen(true)}
              />

              {/* Main Educational Video & Content Card */}
              <div className="px-3">
                <VideoPlayerCard
                  lesson={lesson}
                  onOpenTeacherInfo={() => setIsTeacherInfoOpen(true)}
                  isPaused={isGamesOpen || isAttachmentOpen || isTeacherInfoOpen || isNotificationsOpen}
                  onBackToMap={() => setHomeSubView('learning_path')}
                  onOpenGames={() => setIsGamesOpen(true)}
                />
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsView
              onSelectLesson={(selectedLesson) => {
                setLesson(selectedLesson);
                setActiveTab('home');
                setHomeSubView('lesson_player');
              }}
              onBack={() => {
                setActiveTab('home');
                setHomeSubView('main_home');
              }}
            />
          )}

          {activeTab === 'community' && (
            <CommunityView
              posts={communityPosts}
              stories={communityStories}
              onOpenCreatePost={() => setIsCreatePostOpen(false)}
              onOpenComments={(post) => setActiveCommunityPostForComments(post)}
              onToggleLikePost={handleToggleLikeCommunityPost}
              onSharePost={handleShareCommunityPost}
              onDeletePost={handleDeleteCommunityPost}
              onReportPost={handleReportCommunityPost}
              onSelectCommunityStory={handleSelectCommunityStory}
              onBack={() => {
                setActiveTab('home');
                setHomeSubView('main_home');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenProfile={() => setActiveTab('profile')}
              onBack={() => {
                setActiveTab('home');
                setHomeSubView('main_home');
              }}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              onBack={() => {
                setActiveTab('home');
                setHomeSubView('main_home');
              }}
            />
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'home') {
              setActiveTab('home');
              setHomeSubView('main_home');
            } else {
              setActiveTab(tab);
            }
          }}
          communityUnreadCount={0}
        />
      </div>

      {/* Modals & Drawers */}
      <StoryViewerModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onNext={handleNextStory}
        onPrev={handlePrevStory}
        onPlayLesson={handleSelectStory}
      />

      <AttachmentModal
        attachment={activeAttachment}
        isOpen={isAttachmentOpen}
        onClose={() => setIsAttachmentOpen(false)}
        onDownload={handleDownloadAttachment}
      />

      <CommentsDrawer
        comments={lesson.comments}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onAddComment={handleAddComment}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmitPost={handleCreatePost}
      />

      <CommunityCommentsModal
        post={activeCommunityPostForComments}
        isOpen={!!activeCommunityPostForComments}
        onClose={() => setActiveCommunityPostForComments(null)}
        onAddComment={handleAddCommunityComment}
        onLikeComment={handleLikeCommunityComment}
        onDeleteComment={handleDeleteCommunityComment}
        onReportComment={(id) => showToast('تم إرسال البلاغ للإدارة')}
      />

      <NotificationsModal
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />

      <TeacherInfoModal
        isOpen={isTeacherInfoOpen}
        onClose={() => setIsTeacherInfoOpen(false)}
        teacherName={lesson.teacherName}
        teacherAvatar={lesson.teacherAvatar}
        teacherRole={lesson.teacherRole}
      />

      <LessonGamesModal
        isOpen={isGamesOpen}
        onClose={() => setIsGamesOpen(false)}
        games={getGamesForLesson(lesson.id)}
        lessonTitle={lesson.title}
        lessonId={lesson.id}
        category={lesson.category}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}



