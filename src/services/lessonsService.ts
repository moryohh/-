import { getSupabaseClient, SUPABASE_STORAGE_BUCKET, isSupabaseConfigured } from '../lib/supabase';
import { EducationalLesson, SubjectChapter, SubjectChapterLesson } from '../types';
import { SUBJECTS_CURRICULUM_DATA } from '../data/mockCurriculums';
import { cleanTeacherName } from '../utils/cleanTeacherName';

// In-Memory Cache Store for Lazy-Loaded Data
const chaptersCache = new Map<string, SubjectChapter[]>();
const chapterLessonsCache = new Map<string, SubjectChapterLesson[]>();
const lessonJsonCache = new Map<string, EducationalLesson>();

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  isFallback: boolean;
}

/**
 * Blacklist of known dummy, test, music, and entertainment YouTube video IDs
 * that must NEVER be shown in an educational curriculum platform.
 */
export const BLACKLISTED_DUMMY_YOUTUBE_IDS = new Set([
  'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
  '9bZkp7q19f0', // Psy - Gangnam Style
  'kJQP7kiw5Fk', // Ray William Johnson
  '2ePf9rue1Ao', // Fireplace
  'Air0g9qgCgM', // Dummy placeholder
  'jNQXAC9IVRw', // Me at the zoo
  'M7lc1UVf-VE', // YouTube developer video
  'y6120QOlsfU', // Darude Sandstorm
  'C0DPdy98e4c',
  'ZbZSe6N_BXs',
  'RgKAFK5djSk',
  'kXYiU_JCYtU',
  'JGwWNGJdvx8',
  'OPf0YbXqDm0',
  'fJ9rUzIMcZQ',
  'L_LUpnjgPso',
  '3JZ_D3ELwOQ',
  'e-ORhEE9VVg',
  'V-_O7nl0Ii0',
  'oHg5SJYRHA0',
  'DLzxrzFCyOs',
  'YQHsXMglC9A',
]);

/**
 * Checks if a video title or channel or content summary contains non-educational/entertainment markers.
 */
export function isNonEducationalVideo(title = '', channel = '', summary = ''): boolean {
  const combined = `${title} ${channel} ${summary}`.toLowerCase();
  const bannedKeywords = [
    'rick astley',
    'never gonna give you up',
    'ray william johnson',
    'equals three',
    'gangnam style',
    'psy',
    'official music video',
    'vevo',
    'lyric video',
    'official video',
    'remastered music video',
    'flexin\' on ya',
    'rickroll',
    'fireplace',
    'burning fireplace',
  ];

  return bannedKeywords.some((keyword) => combined.includes(keyword));
}

/**
 * Extracts a YouTube Video ID from various URL formats or raw ID strings.
 * Returns empty string if missing, invalid, or fake/dummy placeholder.
 * Strictly NEVER returns a random fallback video.
 */
export function extractYoutubeId(urlOrId?: string, title = '', channel = '', summary = ''): string {
  if (!urlOrId || typeof urlOrId !== 'string') return '';
  const trimmed = urlOrId.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'none' ||
    trimmed.toLowerCase() === 'dummy' ||
    trimmed.toLowerCase() === 'test'
  ) {
    return '';
  }

  // Check if content metadata is obviously non-educational
  if (isNonEducationalVideo(title, channel, summary)) {
    return '';
  }

  let extractedId = '';

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    extractedId = trimmed;
  } else {
    // Handle standard youtube links
    const match = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    if (match && match[1]) {
      extractedId = match[1];
    }
  }

  // Check against blacklisted dummy/entertainment video IDs
  if (!extractedId || BLACKLISTED_DUMMY_YOUTUBE_IDS.has(extractedId)) {
    return '';
  }

  return extractedId;
}

/**
 * Maps subject IDs/keys to database subject_id values in educational_data table
 */
export function getDbSubjectIds(subjectKey: string): string[] {
  const s = (subjectKey || '').toLowerCase().trim();
  const map: Record<string, string[]> = {
    biology: [
      'biology',
      'biology_6',
      'bio',
      'bio_6',
      'biology-6',
      'bio-6',
      'biology_part1',
      'biology_part2',
      'احياء',
      'أحياء',
      'الاحياء',
      'الأحياء',
      'علم الأحياء',
      'علم_الاحياء',
      'al-ahyaa',
      'alahyaa',
      'al_ahyaa',
      'ahyaa',
      'ahya',
      'al-ahya',
      'biologie',
      'biology_curriculum',
    ],
    physics: [
      'physics',
      'physics_6',
      'phys',
      'phys_6',
      'physics-6',
      'فيزياء',
      'الفيزياء',
      'علم الفيزياء',
      'al-fizyaa',
      'alfizyaa',
      'fizyaa',
    ],
    chemistry: [
      'chemistry',
      'chemistry_6',
      'chem',
      'chem_6',
      'chemistry-6',
      'كيمياء',
      'الكيمياء',
      'علم الكيمياء',
      'al-keemyaa',
      'alkeemyaa',
      'keemyaa',
    ],
    mathematics: [
      'mathematics',
      'math',
      'maths',
      'mathematics_6',
      'math_6',
      'رياضيات',
      'الرياضيات',
      'al-reyadhyat',
      'reyadhyat',
    ],
    'arabic-1': [
      'arabic_part1',
      'arabic-1',
      'arabic1',
      'arabic_1',
      'arabic',
      'قواعد',
      'قواعد اللغة العربية',
      'عربي1',
      'عربي_1',
      'اللغة العربية ج1',
      'اللغة العربية 1',
    ],
    'arabic-2': [
      'arabic_part2',
      'arabic-2',
      'arabic2',
      'arabic_2',
      'arabic',
      'ادب',
      'أدب',
      'الأدب والنصوص',
      'عربي2',
      'عربي_2',
      'اللغة العربية ج2',
      'اللغة العربية 2',
    ],
    arabic: [
      'arabic_part1',
      'arabic_part2',
      'arabic',
      'عربي',
      'اللغة العربية',
      'قواعد',
      'أدب',
      'ادب',
    ],
    islamic: [
      'islamic',
      'islamic_studies',
      'islam',
      'إسلامية',
      'اسلامية',
      'التربية الإسلامية',
      'الاسلامية',
      'الإسلامية',
    ],
    english: [
      'english',
      'english_6',
      'eng',
      'eng_6',
      'انكليزي',
      'إنكليزي',
      'انجليزي',
      'إنجليزي',
      'اللغة الإنجليزية',
      'اللغة الإنكليزية',
    ],
  };

  const list = map[s] || [s];
  const allVariants = new Set<string>();
  list.forEach((id) => {
    allVariants.add(id);
    allVariants.add(id.toLowerCase());
    allVariants.add(id.toUpperCase());
    allVariants.add(id.charAt(0).toUpperCase() + id.slice(1).toLowerCase());
  });
  return Array.from(allVariants);
}

/**
 * Maps subject IDs/keys to potential folder names in Supabase Storage (if used)
 */
export function getSubjectFolderNames(subjectKey: string): string[] {
  const map: Record<string, string[]> = {
    biology: ['أحياء', 'احياء', 'البيولوجيا', 'علم الأحياء', 'biology', 'Biology', 'bio'],
    physics: ['فيزياء', 'الفيزياء', 'physics', 'Physics', 'phys'],
    chemistry: ['كيمياء', 'الكيمياء', 'chemistry', 'Chemistry', 'chem'],
    mathematics: ['رياضيات', 'الرياضيات', 'mathematics', 'math', 'Math'],
    'arabic-1': ['اللغة العربية ج1', 'عربي 1', 'قواعد اللغة العربية', 'arabic_part1', 'arabic-1'],
    'arabic-2': ['اللغة العربية ج2', 'عربي 2', 'الأدب والنصوص', 'arabic_part2', 'arabic-2'],
    islamic: ['التربية الإسلامية', 'إسلامية', 'اسلامية', 'الاسلامية', 'islamic', 'Islamic'],
    english: ['اللغة الإنجليزية', 'إنكليزي', 'انكليزي', 'انجليزي', 'english', 'English'],
  };

  return map[subjectKey] || [subjectKey];
}

/**
 * Formats any lesson title into clean Arabic, completely stripping "السجمنت" or "segment"
 * Example: "الدرس / السجمنت 31" -> "الدرس 31"
 * Example: "السجمنت 2" -> "الدرس 2"
 * Example: "segment_31" -> "الدرس 31"
 */
export function formatArabicLessonTitle(title: string | undefined | null): string {
  if (!title) return 'الدرس';
  let t = String(title).trim();

  // Strip .json suffix if present
  t = t.replace(/\.json$/i, '');

  // Strip file path if present
  if (t.includes('/')) {
    const parts = t.split('/');
    t = parts[parts.length - 1];
  }

  // Replace "الدرس / السجمنت 31" or "الدرس / سجمنت 31" or "الدرس/السجمنت 31" -> "الدرس 31"
  t = t.replace(/الدرس\s*[\/\-:]\s*(?:ال)?سجمنت\s*(\d+|[٠-٩]+)/gi, 'الدرس $1');
  t = t.replace(/الدرس\s*[\/\-:]\s*(?:ال)?سجمنت/gi, 'الدرس');

  // Replace "السجمنت 31" or "سجمنت 31" -> "الدرس 31"
  t = t.replace(/(?:ال)?سجمنت\s*(\d+|[٠-٩]+)/gi, 'الدرس $1');
  t = t.replace(/(?:ال)?سجمنت/gi, 'الدرس');

  // Replace "segment_31" or "segment 31" or "seg_31" or "seg31" -> "الدرس 31"
  t = t.replace(/(?:segment|seg)[\s_-]*(\d+)/gi, 'الدرس $1');

  // Replace "lesson_31" or "les_31" -> "الدرس 31"
  t = t.replace(/(?:lesson|les)[\s_-]*(\d+)/gi, 'الدرس $1');

  // Clean any multiple spaces or stray slashes
  t = t.replace(/\s+/g, ' ').replace(/^[\/\-:]\s*/, '').trim();
  return t;
}

/**
 * Converts a raw JSON object from Supabase into our application's EducationalLesson model.
 * Preserves the exact `lesson_id` from JSON.
 * Completely omits fake/random videos.
 */
export function transformJsonToLesson(
  rawJson: any,
  fallbackId: string,
  subjectName = 'المادة'
): EducationalLesson {
  // Handle root 'lessons' array structure (curriculum schema)
  let lessonObj: any = rawJson;
  let segmentTopics: string[] = [];

  if (rawJson && Array.isArray(rawJson.lessons) && rawJson.lessons.length > 0) {
    lessonObj = rawJson.lessons[0];
    segmentTopics = rawJson.segment_topics || [];
  }

  const actualLessonId = lessonObj.lesson_id || lessonObj.lessonId || lessonObj.id || fallbackId;
  const teachersList = Array.isArray(lessonObj.teachers) ? lessonObj.teachers : [];

  // Find first teacher with a verified valid video
  let firstValidVideo: any = null;
  let firstTeacher: any = null;

  for (const t of teachersList) {
    if (t && Array.isArray(t.videos) && t.videos.length > 0) {
      const v = t.videos.find((vid: any) => {
        if (!vid) return false;
        const testId = extractYoutubeId(
          vid.url || vid.youtubeId || vid.youtube_url || vid.youtube_id || '',
          vid.title || '',
          t.channel_title || t.channelTitle || t.teacher_name || '',
          vid.content_summary || ''
        );
        return Boolean(testId);
      });
      if (v) {
        firstValidVideo = v;
        firstTeacher = t;
        break;
      }
    }
  }

  const activeVideo = firstValidVideo || {};
  const activeTeacher = firstTeacher || teachersList[0] || {};

  const videoUrlOrId =
    activeVideo.url ||
    activeVideo.youtube_url ||
    activeVideo.youtubeUrl ||
    activeVideo.youtube_id ||
    lessonObj.youtube_id ||
    lessonObj.youtubeId ||
    lessonObj.youtube_url ||
    '';

  const youtubeId = extractYoutubeId(
    videoUrlOrId,
    activeVideo.title || lessonObj.title || '',
    activeTeacher.channel_title || activeTeacher.teacher_name || '',
    activeVideo.content_summary || lessonObj.description || ''
  );

  // Generate dynamic teacher stories list for this lesson (ONLY teachers with valid, non-dummy videos)
  const teacherStories: import('../types').TeacherStory[] = teachersList
    .map((t: any, idx: number) => {
      const rawTName = t.teacher_name || t.name || `أستاذ ${idx + 1}`;
      const tName = cleanTeacherName(rawTName) || rawTName;
      const channelTitle = t.channel_title || t.channelTitle || t.channel_name || tName;

      const vid = t.videos?.find((v: any) => {
        if (!v) return false;
        return Boolean(
          extractYoutubeId(
            v.url || v.youtube_url || v.youtubeId || v.youtube_id || '',
            v.title || '',
            channelTitle,
            v.content_summary || ''
          )
        );
      }) || t.videos?.[0] || {};

      const tYoutubeId = extractYoutubeId(
        vid.url || vid.youtube_url || vid.youtubeId || vid.youtube_id || '',
        vid.title || '',
        channelTitle,
        vid.content_summary || ''
      );
      if (!tYoutubeId) return null; // Omit completely if video is missing or fake
      const ytThumbnail = `https://img.youtube.com/vi/${tYoutubeId}/hqdefault.jpg`;

      return {
        id: `teacher-${actualLessonId}-${idx}`,
        teacherName: tName,
        channelName: channelTitle,
        subject: lessonObj.subject || subjectName,
        title: formatArabicLessonTitle(vid.title || tName),
        avatar: t.avatar || ytThumbnail,
        hasUnseen: true,
        youtubeId: tYoutubeId,
        videoUrl: `https://www.youtube.com/watch?v=${tYoutubeId}`,
        duration: '20:00',
        storyImage: ytThumbnail,
        textNotes:
          vid.content_summary ||
          `شرح ${tName} للدرس من قناة (${channelTitle}).`,
        lessonData: {
          id: `${actualLessonId}-${idx}`,
          title: formatArabicLessonTitle(vid.title || `${lessonObj.subject || subjectName} - ${tName}`),
          subtitle: `${lessonObj.grade || 'السادس الإعدادي'} - ${lessonObj.subject || subjectName}`,
          category: lessonObj.subject || subjectName,
          teacherName: tName,
          teacherAvatar: t.avatar || ytThumbnail,
          teacherRole: channelTitle,
          youtubeId: tYoutubeId,
          duration: '20:00',
          currentTime: '00:00',
          progressPercentage: 0,
          description:
            vid.content_summary ||
            `شرح ${tName}. المطابقة المنهجية: ${vid.semantic_overlap || 95}%. المواضيع: ${
              segmentTopics.join('، ') || 'مقدمة المنهج'
            }`,
          viewsCount: vid.view_count
            ? `${(Number(vid.view_count) / 1000).toFixed(0)}K`
            : '15.2K',
          likesCount: 1200,
          isLiked: false,
          isBookmarked: false,
          attachments: {
            aids: {
              id: `att-aid-${actualLessonId}-${idx}`,
              title: `ملف المعينات والملخصات - ${tName}`,
              type: 'pdf',
              size: '2.4 ميجابايت',
              downloadUrl: '#',
              description: `ملخص شامل وملاحظات الدرس للمدرس ${tName}.`,
            },
            psh: {
              id: `att-psh-${actualLessonId}-${idx}`,
              title: `حزمة التحميل الخاص (PSH) - ${tName}`,
              type: 'psh',
              size: '4.8 ميجابايت',
              downloadUrl: '#',
              description: 'أوراق عمل تفاعلية وتمارين وزارية تطبيقية.',
            },
          },
          comments: [],
        },
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null && Boolean(s.youtubeId));

  // Propagate all teacher stories to each teacher's lessonData
  teacherStories.forEach((ts) => {
    if (ts.lessonData) {
      ts.lessonData.teacherStories = teacherStories;
    }
  });

  const rawTitle =
    activeVideo.title ||
    lessonObj.title ||
    rawJson.file_name ||
    (segmentTopics.length > 0 ? segmentTopics[0] : 'الدرس');

  const resolvedTitle = formatArabicLessonTitle(rawTitle);

  const resolvedDesc =
    activeVideo.content_summary ||
    lessonObj.description ||
    (segmentTopics.length > 0 ? `المواضيع المغطاة: ${segmentTopics.join(' | ')}` : 'شرح تفصيلي للمنهج مع الأسئلة والتمارين الوزارية.');

  const rawResolvedName = activeTeacher.teacher_name || lessonObj.teacher_name || 'مدرس المادة';
  const resolvedTeacherName = cleanTeacherName(rawResolvedName) || rawResolvedName;

  const defaultAvatar = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : (activeTeacher.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');

  return {
    id: actualLessonId,
    title: resolvedTitle,
    subtitle: `${lessonObj.grade || 'السادس الإعدادي'} - ${lessonObj.subject || subjectName}`,
    category: lessonObj.subject || subjectName,
    teacherName: resolvedTeacherName,
    teacherAvatar: activeTeacher.avatar || defaultAvatar,
    teacherRole: activeTeacher.channel_title || activeTeacher.affiliation ? `قناة ${activeTeacher.channel_title || activeTeacher.affiliation}` : 'مدرس المادة',
    youtubeId, // Empty string if no valid video exists
    duration: '20:00',
    currentTime: '00:00',
    progressPercentage: 0,
    description: resolvedDesc,
    viewsCount: activeVideo.view_count
      ? `${(Number(activeVideo.view_count) / 1000).toFixed(0)}K`
      : '15.2K',
    likesCount: 1200,
    isLiked: false,
    isBookmarked: false,
    attachments: {
      aids: {
        id: `att-aid-${actualLessonId}`,
        title: `ملف المعينات والملخصات`,
        type: 'pdf',
        size: '2.4 ميجابايت',
        downloadUrl: '#',
        description: 'ملخص شامل وملاحظات وخرائط ذهنية للدرس بصيغة PDF.',
      },
      psh: {
        id: `att-psh-${actualLessonId}`,
        title: `حزمة التحميل الخاص (PSH)`,
        type: 'psh',
        size: '5.2 ميجابايت',
        downloadUrl: '#',
        description: 'أوراق عمل تفاعلية وتمارين وزارية تطبيقية.',
      },
    },
    comments: [],
    teacherStories: teacherStories.length > 0 ? teacherStories : undefined,
  };
}

/**
 * Converts ordinal number to Arabic ordinal word
 */
const ARABIC_ORDINALS = [
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر',
];

function getArabicChapterTitle(num: number, rawTitle?: string): string {
  const ordinal = ARABIC_ORDINALS[num - 1] || `${num}`;
  if (rawTitle && rawTitle.includes('الفصل')) {
    return rawTitle;
  }
  return `الفصل ${ordinal}`;
}

/**
 * 1. Get Chapters for a Subject (Lazy Loading Step 1)
 * Queries the Supabase `educational_data` database table specifically for `section_id = 'lessons'`.
 */
export async function getSubjectChapters(
  subjectKey: string,
  subjectName = 'المادة'
): Promise<ServiceResponse<SubjectChapter[]>> {
  // 1. Check in-memory cache
  const cacheKey = `chapters_${subjectKey}`;
  if (chaptersCache.has(cacheKey)) {
    return {
      data: chaptersCache.get(cacheKey)!,
      error: null,
      isFallback: false,
    };
  }

  const supabase = getSupabaseClient();

  // If Supabase is not configured, return local mock curriculum
  if (!supabase || !isSupabaseConfigured()) {
    const fallbackData = SUBJECTS_CURRICULUM_DATA[subjectKey] || [];
    chaptersCache.set(cacheKey, fallbackData);
    return {
      data: fallbackData,
      error: null,
      isFallback: true,
    };
  }

  try {
    const dbSubjectIds = getDbSubjectIds(subjectKey);

    // 1. Query Supabase educational_data table for matching subject_id
    let dbRows: any[] = [];
    const { data: directRows, error: dbError } = await supabase
      .from('educational_data')
      .select('id, subject_id, section_id, file_name, content')
      .in('subject_id', dbSubjectIds)
      .limit(2000);

    if (dbError) {
      console.warn('[Supabase DB] Error querying educational_data:', dbError);
    } else if (directRows && directRows.length > 0) {
      dbRows = directRows;
    }

    // 1.1 If no rows found with exact IN, search by partial ILIKE matches (e.g. for bio, احياء, etc.)
    if (dbRows.length === 0) {
      let filterStr = `subject_id.ilike.%${subjectKey}%,file_name.ilike.%${subjectKey}%`;
      if (subjectKey === 'biology') {
        filterStr += ',subject_id.ilike.%bio%,subject_id.ilike.%احياء%,subject_id.ilike.%أحياء%,file_name.ilike.%bio%,file_name.ilike.%احياء%,file_name.ilike.%أحياء%';
      }
      const { data: ilikeRows } = await supabase
        .from('educational_data')
        .select('id, subject_id, section_id, file_name, content')
        .or(filterStr)
        .limit(1000);

      if (ilikeRows && ilikeRows.length > 0) {
        dbRows = ilikeRows;
      }
    }

    // 1.2 If still empty, check lessons_warehouse table
    if (dbRows.length === 0) {
      const { data: warehouseRows } = await supabase
        .from('lessons_warehouse')
        .select('*')
        .limit(500);

      if (warehouseRows && warehouseRows.length > 0) {
        dbRows = warehouseRows.filter((r) =>
          dbSubjectIds.some(
            (sId) =>
              r.subject_id?.toLowerCase()?.includes(sId.toLowerCase()) ||
              r.subject?.toLowerCase()?.includes(sId.toLowerCase()) ||
              r.title?.toLowerCase()?.includes(sId.toLowerCase()) ||
              r.file_name?.toLowerCase()?.includes(sId.toLowerCase())
          )
        );
      }
    }

    // 1.3 If still empty, inspect all rows in educational_data with JavaScript fuzzy match
    if (dbRows.length === 0) {
      const { data: anyRows } = await supabase
        .from('educational_data')
        .select('id, subject_id, section_id, file_name, content')
        .limit(1000);
      if (anyRows && anyRows.length > 0) {
        dbRows = anyRows.filter((r) =>
          dbSubjectIds.some(
            (sId) =>
              r.subject_id?.toLowerCase()?.includes(sId.toLowerCase()) ||
              r.file_name?.toLowerCase()?.includes(sId.toLowerCase())
          )
        );
      }
    }

    // 2. Find all organized tree records and pick the most complete one (highest chapter count)
    const treeRows = (dbRows || []).filter(
      (r) =>
        r.file_name?.includes('organized_tree') ||
        (r.content && Array.isArray(r.content.chapters) && r.content.chapters.length > 0)
    );

    treeRows.sort((a, b) => {
      const lenA = a.content?.chapters?.length || 0;
      const lenB = b.content?.chapters?.length || 0;
      return lenB - lenA;
    });

    const treeRow = treeRows[0];

    let parsedChapters: SubjectChapter[] = [];

    if (treeRow && treeRow.content && Array.isArray(treeRow.content.chapters)) {
      const treeChapters = treeRow.content.chapters;

      parsedChapters = treeChapters.map((ch: any, idx: number) => {
        const chNum = ch.chapterNumber || idx + 1;
        const rawTitle = ch.chapterTitle || `الفصل ${chNum}`;
        const chapterTitle = getArabicChapterTitle(chNum, rawTitle);
        const rawLessons = Array.isArray(ch.lessons) ? ch.lessons : [];

        const lessons: SubjectChapterLesson[] = rawLessons.map((l: any, lIdx: number) => {
          const lNum = l.lessonNumber || lIdx + 1;
          const lTitle = formatArabicLessonTitle(l.lessonTitle || `الدرس ${lNum}`);
          const rawLessonData = l.files?.[0]?.data || l.files?.[0] || l;
          const lessonId =
            l.files?.[0]?.lesson_id ||
            l.files?.[0]?.id ||
            `${subjectKey}-ch${chNum}-les${lNum}`;

          return {
            id: lessonId,
            number: lNum,
            title: lTitle,
            duration: '20:00',
            status: lIdx === 0 ? 'in_progress' : 'available',
            progressPercentage: 0,
            lessonData: transformJsonToLesson(rawLessonData, lessonId, subjectName),
          };
        });

        return {
          id: `ch-${subjectKey}-${chNum}`,
          number: chNum,
          title: chapterTitle,
          subtitle: `${subjectName} - السادس العلمي`,
          description: `الفصل الدراسي مع شرح الدروس والمدرسين المعتمدين.`,
          lessonsCount: lessons.length,
          completedLessonsCount: 0,
          lessons,
        };
      });

      // Sort chapters ascending by chapter number (1, 2, 3...)
      parsedChapters.sort((a, b) => a.number - b.number);
    }

    // 3. If no tree row or chapters need augmentation, parse individual lesson files in section_id = 'lessons'
    if (parsedChapters.length === 0 && dbRows && dbRows.length > 0) {
      const chapterGroups: Record<number, { title: string; rows: any[] }> = {};

      dbRows.forEach((r) => {
        if (r.file_name?.includes('organized_tree')) return;
        const fn = r.file_name || '';

        // Extract chapter number from file_name or content
        let chNum = 1;
        const matchSlash = fn.match(/\/(\d+|[٠-٩]+)\//);
        const matchFasl = fn.match(/فصل\s*(\d+|[٠-٩]+)/i);
        const matchCh = fn.match(/ch(\d+)/i);
        const matchPart = fn.match(/ج\s*(\d+)/i);

        if (matchSlash) {
          chNum = parseInt(matchSlash[1], 10) || 1;
        } else if (matchFasl) {
          chNum = parseInt(matchFasl[1], 10) || 1;
        } else if (matchCh) {
          chNum = parseInt(matchCh[1], 10) || 1;
        } else if (matchPart) {
          chNum = parseInt(matchPart[1], 10) || 1;
        }

        if (!chapterGroups[chNum]) {
          chapterGroups[chNum] = {
            title: getArabicChapterTitle(chNum),
            rows: [],
          };
        }
        chapterGroups[chNum].rows.push(r);
      });

      parsedChapters = Object.entries(chapterGroups).map(([numStr, group]) => {
        const chNum = parseInt(numStr, 10);
        const lessons: SubjectChapterLesson[] = group.rows.map((row, idx) => {
          const lNum = idx + 1;
          const lessonContent = row.content || {};
          const fallbackId = `les-${row.id || chNum + '-' + lNum}`;
          const parsedLesson = transformJsonToLesson(lessonContent, fallbackId, subjectName);

          const rawTitle =
            parsedLesson.title ||
            row.file_name?.split('/').pop()?.replace('.json', '') ||
            `الدرس ${lNum}`;
          const lTitle = formatArabicLessonTitle(rawTitle);

          return {
            id: parsedLesson.id || fallbackId,
            number: lNum,
            title: lTitle,
            duration: parsedLesson.duration || '20:00',
            status: lNum === 1 ? 'in_progress' : 'available',
            progressPercentage: lNum === 1 ? 25 : 0,
            lessonData: parsedLesson,
          };
        });

        return {
          id: `ch-${subjectKey}-${chNum}`,
          number: chNum,
          title: group.title,
          subtitle: `${subjectName} - السادس العلمي`,
          description: `شروحات وفصول ${subjectName} من قاعدة البيانات.`,
          lessonsCount: lessons.length,
          completedLessonsCount: 0,
          lessons,
        };
      });

      parsedChapters.sort((a, b) => a.number - b.number);
    }

    // 4. If chapters still empty, try parsing mock fallback
    if (parsedChapters.length === 0) {
      parsedChapters = SUBJECTS_CURRICULUM_DATA[subjectKey] || [];
    }

    chaptersCache.set(cacheKey, parsedChapters);
    return {
      data: parsedChapters,
      error: null,
      isFallback: false,
    };
  } catch (err: any) {
    console.error('Error fetching subject chapters from Supabase:', err);
    const fallbackData = SUBJECTS_CURRICULUM_DATA[subjectKey] || [];
    chaptersCache.set(cacheKey, fallbackData);
    return {
      data: fallbackData,
      error: err?.message || 'تعذر تحميل الفصول من Supabase',
      isFallback: true,
    };
  }
}

/**
 * 2. Get Lessons for a Specific Chapter (Lazy Loading Step 2)
 */
export async function getChapterLessons(
  subjectKey: string,
  chapterFolderName: string,
  chapterNumber = 1,
  subjectName = 'المادة'
): Promise<ServiceResponse<SubjectChapterLesson[]>> {
  const cacheKey = `lessons_${subjectKey}_${chapterFolderName}`;
  if (chapterLessonsCache.has(cacheKey)) {
    return {
      data: chapterLessonsCache.get(cacheKey)!,
      error: null,
      isFallback: false,
    };
  }

  // 1. Check if already loaded in chapters cache
  const cachedChapters = chaptersCache.get(`chapters_${subjectKey}`);
  if (cachedChapters) {
    const matchingChapter = cachedChapters.find(
      (c) =>
        c.number === chapterNumber ||
        c.title.includes(chapterFolderName) ||
        chapterFolderName.includes(c.title)
    );
    if (matchingChapter && matchingChapter.lessons.length > 0) {
      chapterLessonsCache.set(cacheKey, matchingChapter.lessons);
      return {
        data: matchingChapter.lessons,
        error: null,
        isFallback: false,
      };
    }
  }

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    const fallbackChapters = SUBJECTS_CURRICULUM_DATA[subjectKey] || [];
    const fallbackChapter = fallbackChapters.find((c) => c.number === chapterNumber) || fallbackChapters[0];
    const fallbackLessons = fallbackChapter ? fallbackChapter.lessons : [];
    chapterLessonsCache.set(cacheKey, fallbackLessons);
    return {
      data: fallbackLessons,
      error: null,
      isFallback: true,
    };
  }

  try {
    const dbSubjectIds = getDbSubjectIds(subjectKey);

    // Query with resilient fallback for section_id
    let dbRows: any[] = [];
    const { data: sectionRows, error: dbError } = await supabase
      .from('educational_data')
      .select('id, subject_id, section_id, file_name, content')
      .in('subject_id', dbSubjectIds)
      .limit(1000);

    if (dbError) {
      console.warn('[Supabase DB] Error in fetchSubjectLessons:', dbError);
    } else if (sectionRows && sectionRows.length > 0) {
      dbRows = sectionRows;
    }

    if (dbRows.length === 0) {
      let filterStr = `subject_id.ilike.%${subjectKey}%,file_name.ilike.%${subjectKey}%`;
      if (subjectKey === 'biology') {
        filterStr += ',subject_id.ilike.%bio%,subject_id.ilike.%احياء%,subject_id.ilike.%أحياء%,file_name.ilike.%bio%,file_name.ilike.%احياء%,file_name.ilike.%أحياء%';
      }
      const { data: ilikeRows } = await supabase
        .from('educational_data')
        .select('id, subject_id, section_id, file_name, content')
        .or(filterStr)
        .limit(1000);

      if (ilikeRows && ilikeRows.length > 0) {
        dbRows = ilikeRows;
      }
    }

    const lessons: SubjectChapterLesson[] = [];

    (dbRows || []).forEach((row, idx) => {
      if (row.file_name?.includes('organized_tree')) return;
      const fn = row.file_name || '';

      const matchSlash = fn.match(/\/(\d+|[٠-٩]+)\//);
      const matchFasl = fn.match(/فصل\s*(\d+|[٠-٩]+)/i);
      const matchCh = fn.match(/ch(\d+)/i);
      const rowChNum =
        (matchSlash && parseInt(matchSlash[1], 10)) ||
        (matchFasl && parseInt(matchFasl[1], 10)) ||
        (matchCh && parseInt(matchCh[1], 10)) ||
        1;

      if (rowChNum === chapterNumber || fn.includes(chapterFolderName)) {
        const lNum = lessons.length + 1;
        const lessonContent = row.content || {};
        const fallbackId = `les-${row.id || chapterNumber + '-' + lNum}`;
        const parsedLesson = transformJsonToLesson(lessonContent, fallbackId, subjectName);

        const rawTitle =
          parsedLesson.title ||
          fn.split('/').pop()?.replace('.json', '') ||
          `الدرس ${lNum}`;
        const lTitle = formatArabicLessonTitle(rawTitle);

        lessons.push({
          id: parsedLesson.id || fallbackId,
          number: lNum,
          title: lTitle,
          duration: parsedLesson.duration || '20:00',
          status: lNum === 1 ? 'in_progress' : 'available',
          progressPercentage: lNum === 1 ? 25 : 0,
          lessonData: parsedLesson,
        });
      }
    });

    if (lessons.length === 0) {
      const fallbackChapters = SUBJECTS_CURRICULUM_DATA[subjectKey] || [];
      const fallbackChapter = fallbackChapters.find((c) => c.number === chapterNumber) || fallbackChapters[0];
      const fallbackLessons = fallbackChapter ? fallbackChapter.lessons : [];
      chapterLessonsCache.set(cacheKey, fallbackLessons);
      return {
        data: fallbackLessons,
        error: null,
        isFallback: true,
      };
    }

    chapterLessonsCache.set(cacheKey, lessons);
    return {
      data: lessons,
      error: null,
      isFallback: false,
    };
  } catch (err: any) {
    console.error('Error fetching chapter lessons:', err);
    const fallbackChapters = SUBJECTS_CURRICULUM_DATA[subjectKey] || [];
    const fallbackChapter = fallbackChapters.find((c) => c.number === chapterNumber) || fallbackChapters[0];
    const fallbackLessons = fallbackChapter ? fallbackChapter.lessons : [];
    chapterLessonsCache.set(cacheKey, fallbackLessons);
    return {
      data: fallbackLessons,
      error: err?.message || 'تعذر تحميل الدروس من قاعدة البيانات',
      isFallback: true,
    };
  }
}

/**
 * 3. Get Lesson JSON Details (Lazy Loading Step 3)
 * Retrieves and formats full EducationalLesson with videos and teachers.
 */
export async function getLessonDetails(
  subjectKey: string,
  chapterFolderName: string,
  lessonFolderName: string,
  subjectName = 'المادة'
): Promise<ServiceResponse<EducationalLesson>> {
  const cacheKey = `lesson_json_${subjectKey}_${chapterFolderName}_${lessonFolderName}`;
  if (lessonJsonCache.has(cacheKey)) {
    return {
      data: lessonJsonCache.get(cacheKey)!,
      error: null,
      isFallback: false,
    };
  }

  // Look in chapter lessons cache first
  const cachedLessons = chapterLessonsCache.get(`lessons_${subjectKey}_${chapterFolderName}`);
  const matchingLesson = cachedLessons?.find(
    (l) => l.title === lessonFolderName || l.id === lessonFolderName
  );

  if (matchingLesson && matchingLesson.lessonData) {
    lessonJsonCache.set(cacheKey, matchingLesson.lessonData);
    return {
      data: matchingLesson.lessonData,
      error: null,
      isFallback: false,
    };
  }

  const fallbackLesson = transformJsonToLesson(
    {
      lesson_id: `${subjectKey}-${lessonFolderName}`,
      title: lessonFolderName,
      subtitle: `${subjectName} - ${chapterFolderName}`,
      description: 'شرح تفصيلي للدرس مع إمكانية مشاهدة الفيديو وحل الألعاب التعليمية.',
    },
    `${subjectKey}-${lessonFolderName}`,
    subjectName
  );

  lessonJsonCache.set(cacheKey, fallbackLesson);
  return {
    data: fallbackLesson,
    error: null,
    isFallback: false,
  };
}

/**
 * Creates a TeacherStory directly from an EducationalLesson.
 * If no valid video exists, returns null.
 */
export function createTeacherStoryFromLesson(lesson: EducationalLesson): import('../types').TeacherStory | null {
  const validYtId = extractYoutubeId(lesson.youtubeId);
  if (!validYtId) return null; // No random video fallback

  const ytThumb = `https://img.youtube.com/vi/${validYtId}/hqdefault.jpg`;

  return {
    id: `story-${lesson.id}`,
    teacherName: cleanTeacherName(lesson.teacherName) || 'مدرس المادة',
    channelName: cleanTeacherName(lesson.teacherRole) || cleanTeacherName(lesson.teacherName) || 'القناة التعليمية',
    avatar: lesson.teacherAvatar && !lesson.teacherAvatar.includes('unsplash.com/photo-1573496359142') ? lesson.teacherAvatar : ytThumb,
    subject: lesson.category || lesson.subtitle || 'المنهاج',
    title: lesson.title,
    hasUnseen: true,
    youtubeId: validYtId,
    videoUrl: `https://www.youtube.com/watch?v=${validYtId}`,
    duration: lesson.duration || '15:00',
    storyImage: ytThumb,
    textNotes:
      lesson.description ||
      `شرح المدرس لدرس "${lesson.title}". اضغط لعرض وتغيير شاشة الفيديو فوراً.`,
    lessonData: lesson,
  };
}

/**
 * Clears the in-memory cache (e.g. for refresh/reload)
 */
export function clearLessonsCache(): void {
  chaptersCache.clear();
  chapterLessonsCache.clear();
  lessonJsonCache.clear();
}
