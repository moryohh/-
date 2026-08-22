import { getSupabaseClient } from '../lib/supabase';
import { CommunityPost, CommunityComment, CommunityStory, UserProfile } from '../types';
import { INITIAL_COMMUNITY_POSTS, COMMUNITY_STORIES } from '../data/mockData';

const LOCAL_STORAGE_POSTS_KEY = 'nahn_maak_community_posts_v2';
const LOCAL_STORAGE_STORIES_KEY = 'nahn_maak_community_stories_v2';
const LOCAL_STORAGE_LIKES_KEY = 'nahn_maak_user_liked_posts_v2';

/**
 * Helper to get locally cached or fallback posts
 */
function getLocalPosts(): CommunityPost[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.debug('Failed to read local posts cache:', e);
  }
  return INITIAL_COMMUNITY_POSTS;
}

function saveLocalPosts(posts: CommunityPost[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.debug('Failed to save local posts:', e);
  }
}

function getLocalStories(): CommunityStory[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.debug('Failed to read local stories cache:', e);
  }
  return COMMUNITY_STORIES;
}

function saveLocalStories(stories: CommunityStory[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(stories));
  } catch (e) {
    console.debug('Failed to save local stories:', e);
  }
}

function getLikedPostIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LIKES_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {}
  return new Set();
}

function setLikedPostIds(likedSet: Set<string>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_LIKES_KEY, JSON.stringify(Array.from(likedSet)));
  } catch {}
}

/**
 * Ranking Algorithm:
 * 1. Calculate engagement score for each post: (likes * 2 + comments * 3)
 * 2. Pin the single highest engagement post that has >= 10 interactions to the top (marked with isPinned: true).
 * 3. Order all remaining posts strictly from Newest to Oldest (created_at DESC).
 */
export function rankCommunityPosts(posts: CommunityPost[]): CommunityPost[] {
  if (!posts || posts.length === 0) return [];

  // Clone posts to avoid mutating source
  const cloned = posts.map((p) => ({
    ...p,
    engagementScore: (p.likesCount || 0) * 2 + (p.commentsCount || 0) * 3,
  }));

  // Identify the top engaged candidate (with meaningful engagement >= 10)
  let topEngagedIndex = -1;
  let maxScore = 9; // threshold for engagement pin

  cloned.forEach((p, idx) => {
    if ((p.engagementScore || 0) > maxScore) {
      maxScore = p.engagementScore || 0;
      topEngagedIndex = idx;
    }
  });

  // Sort remainder by newest first (handling ISO strings, 'الآن', or ID timestamps)
  const parsePostTime = (p: CommunityPost): number => {
    if (p.createdAt) {
      const t = new Date(p.createdAt).getTime();
      if (!isNaN(t)) return t;
    }
    if (p.id.startsWith('post-')) {
      const num = parseInt(p.id.replace('post-', ''), 10);
      if (!isNaN(num) && num > 1000000) return num;
    }
    if (p.timeAgo === 'الآن') return Date.now() + 100000;
    if (p.timeAgo?.includes('دقيقة')) return Date.now() - 30 * 60 * 1000;
    if (p.timeAgo?.includes('ساعة')) return Date.now() - 2 * 3600 * 1000;
    return 0;
  };

  if (topEngagedIndex !== -1) {
    const topPost = { ...cloned[topEngagedIndex], isPinned: true };
    const remaining = cloned.filter((_, idx) => idx !== topEngagedIndex);
    remaining.sort((a, b) => parsePostTime(b) - parsePostTime(a));
    return [topPost, ...remaining];
  }

  cloned.sort((a, b) => parsePostTime(b) - parsePostTime(a));
  return cloned;
}

/**
 * 1. Fetch all community posts from Supabase (with fallback & local cache)
 */
export async function fetchCommunityPosts(currentUserId?: string): Promise<CommunityPost[]> {
  const client = getSupabaseClient();
  const likedSet = getLikedPostIds();

  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Transform Supabase rows to CommunityPost objects
        const remotePosts: CommunityPost[] = data.map((row: any) => {
          let parsedImages: string[] = [];
          if (Array.isArray(row.images)) {
            parsedImages = row.images;
          } else if (typeof row.images === 'string') {
            try {
              parsedImages = JSON.parse(row.images);
            } catch {
              if (row.images) parsedImages = [row.images];
            }
          } else if (row.image) {
            parsedImages = [row.image];
          }

          let commentsArr: CommunityComment[] = [];
          if (Array.isArray(row.comments)) {
            commentsArr = row.comments;
          } else if (typeof row.comments === 'string') {
            try {
              commentsArr = JSON.parse(row.comments);
            } catch {}
          }

          const isLiked = likedSet.has(row.id) || (currentUserId && row.user_id === currentUserId && row.is_liked);
          const isOwn = currentUserId ? row.user_id === currentUserId : false;

          return {
            id: row.id,
            userId: row.user_id,
            userName: row.user_name || 'طالب المنصة',
            userAvatar:
              row.user_avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            timeAgo: calculateTimeAgo(row.created_at),
            content: row.content || '',
            type: row.type || 'general',
            image: parsedImages[0] || row.image || undefined,
            images: parsedImages,
            attachmentName: row.attachment_name || undefined,
            likesCount: row.likes_count || 0,
            commentsCount: row.comments_count || commentsArr.length || 0,
            isLiked: Boolean(isLiked),
            isOwnPost: Boolean(isOwn),
            createdAt: row.created_at,
            comments: commentsArr,
          };
        });

        // Merge any local user posts if table is fresh
        const local = getLocalPosts();
        const localUserPosts = local.filter((lp) => lp.isOwnPost && !remotePosts.some((rp) => rp.id === lp.id));
        const combined = [...localUserPosts, ...remotePosts];
        saveLocalPosts(combined);
        return rankCommunityPosts(combined);
      }
    } catch (err) {
      console.warn('Could not query Supabase posts table, falling back gracefully:', err);
    }
  }

  // Local fallback
  const local = getLocalPosts();
  return rankCommunityPosts(local);
}

/**
 * 2. Create a new community post (supporting text & up to 4 images)
 */
export async function createCommunityPost(
  paramsOrPost:
    | {
        userId?: string;
        userName: string;
        userAvatar: string;
        content: string;
        type?: 'question' | 'discussion' | 'summary' | 'general';
        images?: string[];
        image?: string;
        attachmentName?: string;
      }
    | Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount' | 'isLiked' | 'comments'>,
  optionalUserId?: string
): Promise<CommunityPost> {
  const newId = `post-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const rawImages = (paramsOrPost as any).images || ((paramsOrPost as any).image ? [(paramsOrPost as any).image] : []);
  const validImages = rawImages.slice(0, 4);

  const userId = paramsOrPost.userId || optionalUserId;
  const userName = paramsOrPost.userName || 'طالب المنصة';
  const userAvatar =
    paramsOrPost.userAvatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  const newPost: CommunityPost = {
    id: newId,
    userId: userId,
    userName: userName,
    userAvatar: userAvatar,
    timeAgo: 'الآن',
    content: paramsOrPost.content,
    type: paramsOrPost.type || 'general',
    image: validImages[0] || undefined,
    images: validImages,
    attachmentName: paramsOrPost.attachmentName,
    likesCount: 0,
    commentsCount: 0,
    isLiked: false,
    isOwnPost: true,
    createdAt: nowIso,
    comments: [],
  };

  // 1. Save to local storage for immediate responsiveness
  const current = getLocalPosts();
  const updated = [newPost, ...current];
  saveLocalPosts(updated);

  // 2. Insert into Supabase if client is available
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('posts').insert({
        id: newId,
        user_id: userId || 'anonymous-student',
        user_name: userName,
        user_avatar: userAvatar,
        content: paramsOrPost.content,
        type: paramsOrPost.type || 'general',
        images: validImages,
        image: validImages[0] || null,
        attachment_name: paramsOrPost.attachmentName || null,
        likes_count: 0,
        comments_count: 0,
        created_at: nowIso,
      });
    } catch (err) {
      console.warn('Could not insert post to Supabase:', err);
    }
  }

  return newPost;
}

/**
 * 3. Delete a community post
 */
export async function deleteCommunityPost(postId: string, userId?: string): Promise<boolean> {
  // 1. Remove from local storage
  const current = getLocalPosts();
  const filtered = current.filter((p) => p.id !== postId);
  saveLocalPosts(filtered);

  // 2. Remove from Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      let query = client.from('posts').delete().eq('id', postId);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      await query;
    } catch (err) {
      console.warn('Error deleting post from Supabase:', err);
    }
  }

  return true;
}

/**
 * 4. Toggle Like on a Post
 */
export async function toggleLikeCommunityPost(postId: string, userId?: string): Promise<{ isLiked: boolean; likesCount: number }> {
  const current = getLocalPosts();
  const target = current.find((p) => p.id === postId);
  const currentLiked = target?.isLiked || false;
  const nextLiked = !currentLiked;

  const likedSet = getLikedPostIds();
  if (nextLiked) {
    likedSet.add(postId);
  } else {
    likedSet.delete(postId);
  }
  setLikedPostIds(likedSet);

  let newCount = 0;
  const updated = current.map((p) => {
    if (p.id === postId) {
      newCount = nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
      return {
        ...p,
        isLiked: nextLiked,
        likesCount: newCount,
      };
    }
    return p;
  });
  saveLocalPosts(updated);

  // Sync to Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('posts')
        .update({ likes_count: newCount })
        .eq('id', postId);
    } catch (err) {
      console.warn('Error updating like in Supabase:', err);
    }
  }

  return { isLiked: nextLiked, likesCount: newCount };
}

export const togglePostLike = async (postId: string, currentLiked: boolean) => {
  const res = await toggleLikeCommunityPost(postId);
  return res.isLiked;
};

/**
 * 5. Add a comment to a post
 */
export async function addCommunityComment(
  postIdOrParams:
    | string
    | {
        postId: string;
        userId?: string;
        userName: string;
        userAvatar: string;
        text: string;
      },
  textOrUser?: string | UserProfile | null,
  optionalUser?: UserProfile | null
): Promise<CommunityComment> {
  let postId: string;
  let text: string;
  let userId: string | undefined;
  let userName: string;
  let userAvatar: string;

  if (typeof postIdOrParams === 'object') {
    postId = postIdOrParams.postId;
    text = postIdOrParams.text;
    userId = postIdOrParams.userId;
    userName = postIdOrParams.userName;
    userAvatar = postIdOrParams.userAvatar;
  } else {
    postId = postIdOrParams;
    text = typeof textOrUser === 'string' ? textOrUser : '';
    const user = optionalUser || (typeof textOrUser === 'object' ? textOrUser : null);
    userId = user?.id;
    userName = user?.name || 'طالب منصة نحن معك';
    userAvatar = user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  }

  const commentId = `cc-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newComment: CommunityComment = {
    id: commentId,
    postId: postId,
    userId: userId,
    userName: userName,
    userAvatar: userAvatar,
    timeAgo: 'الآن',
    text: text,
    likes: 0,
    isLiked: false,
    createdAt: nowIso,
  };

  // Update local posts cache
  const posts = getLocalPosts();
  const updated = posts.map((p) => {
    if (p.id === postId) {
      const updatedComments = [newComment, ...p.comments];
      return {
        ...p,
        comments: updatedComments,
        commentsCount: updatedComments.length,
      };
    }
    return p;
  });
  saveLocalPosts(updated);

  // Sync to Supabase comments table & update post comments_count
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('comments').insert({
        id: commentId,
        post_id: postId,
        user_id: userId || 'anonymous-student',
        user_name: userName,
        user_avatar: userAvatar,
        text: text,
        likes_count: 0,
        created_at: nowIso,
      });

      const targetPost = updated.find((p) => p.id === postId);
      if (targetPost) {
        await client
          .from('posts')
          .update({ comments_count: targetPost.commentsCount })
          .eq('id', postId);
      }
    } catch (err) {
      console.warn('Error saving comment in Supabase:', err);
    }
  }

  return newComment;
}

/**
 * Delete a comment from a post
 */
export async function deleteCommunityComment(postId: string, commentId: string): Promise<boolean> {
  const posts = getLocalPosts();
  const updated = posts.map((p) => {
    if (p.id === postId) {
      const updatedComments = p.comments.filter((c) => c.id !== commentId);
      return {
        ...p,
        comments: updatedComments,
        commentsCount: updatedComments.length,
      };
    }
    return p;
  });
  saveLocalPosts(updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('comments').delete().eq('id', commentId);
      const targetPost = updated.find((p) => p.id === postId);
      if (targetPost) {
        await client
          .from('posts')
          .update({ comments_count: targetPost.commentsCount })
          .eq('id', postId);
      }
    } catch (err) {
      console.warn('Error deleting comment from Supabase:', err);
    }
  }

  return true;
}

/**
 * 6. Fetch Stories for the top bar
 */
export async function fetchCommunityStories(): Promise<CommunityStory[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('community_stories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        const remoteStories: CommunityStory[] = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          userName: row.user_name || 'طالب المنصة',
          userAvatar: row.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          title: row.title || 'قصة دراسية',
          hasUnseen: true,
          storyImage: row.story_image || undefined,
          textNotes: row.text_notes || undefined,
          createdAt: row.created_at,
        }));
        return remoteStories;
      }
    } catch (err) {
      console.warn('Error fetching stories from Supabase:', err);
    }
  }

  return getLocalStories();
}

/**
 * 7. Create a new Community Story
 */
export async function createCommunityStory(params: {
  userId?: string;
  userName: string;
  userAvatar: string;
  title: string;
  storyImage?: string;
  textNotes?: string;
}): Promise<CommunityStory> {
  const storyId = `cs-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newStory: CommunityStory = {
    id: storyId,
    userId: params.userId,
    userName: params.userName,
    userAvatar: params.userAvatar,
    title: params.title,
    hasUnseen: true,
    storyImage: params.storyImage,
    textNotes: params.textNotes,
    createdAt: nowIso,
  };

  const current = getLocalStories();
  const updated = [newStory, ...current];
  saveLocalStories(updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('community_stories').insert({
        id: storyId,
        user_id: params.userId || 'anonymous-student',
        user_name: params.userName,
        user_avatar: params.userAvatar,
        title: params.title,
        story_image: params.storyImage || null,
        text_notes: params.textNotes || null,
        created_at: nowIso,
      });
    } catch (err) {
      console.warn('Error adding story to Supabase:', err);
    }
  }

  return newStory;
}

/**
 * 8. Update User Profile in Supabase profiles table
 */
export async function updateUserProfileData(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client || !userId) return null;

  try {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name) payload.full_name = updates.name;
    if (updates.avatarUrl) payload.avatar_url = updates.avatarUrl;
    if (updates.grade) payload.grade = updates.grade;
    if (updates.branch) payload.branch = updates.branch;
    if (updates.points !== undefined) payload.points = updates.points;
    if (updates.studyHours !== undefined) payload.study_hours = updates.studyHours;
    if (updates.streakDays !== undefined) payload.streak_days = updates.streakDays;

    const { data, error } = await client
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (!error && data) {
      return {
        id: userId,
        email: data.email,
        name: data.full_name || updates.name || 'طالب',
        avatarUrl: data.avatar_url || updates.avatarUrl,
        grade: data.grade || updates.grade,
        branch: data.branch || updates.branch,
        level: data.level || updates.level || 1,
        points: data.points ?? updates.points ?? 100,
        studyHours: data.study_hours ?? updates.studyHours ?? 0.5,
        streakDays: data.streak_days ?? updates.streakDays ?? 1,
      };
    }
  } catch (err) {
    console.warn('Error updating user profile in Supabase:', err);
  }
  return null;
}

/**
 * Helper to calculate Arabic time ago
 */
function calculateTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'الآن';
  try {
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 'الآن';
    const diffSec = Math.floor((Date.now() - time) / 1000);

    if (diffSec < 60) return 'الآن';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    return 'منذ فترة';
  } catch {
    return 'الآن';
  }
}
