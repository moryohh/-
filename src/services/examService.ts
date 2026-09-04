import { LessonBookletData } from '../data/lessonBooklet';
import { OpenLessonContext, SubjectChapter, SubjectChapterLesson } from '../types';
import { fetchLessonCurriculum } from './curriculumService';
import { getSubjectChapters, getChapterLessons } from './lessonsService';

export type ExamMode = 'monthly' | 'comprehensive';
export type ExamQuestionType = 'define' | 'explain' | 'count' | 'number' | 'compare' | 'fill' | 'mention' | 'general';

export interface ModeExamQuestion {
  id: string;
  type: ExamQuestionType;
  typeLabel: string;
  prompt: string;
  modelAnswer: string;
  points: number;
  sourceLesson: string;
  sourceChapter: number;
}

export interface ModeExamConfig {
  id: string;
  mode: ExamMode;
  modeLabel: string;
  lessonTitle: string;
  subject: string;
  grade: string;
  sourceLabel: string;
  durationMinutes: number;
  totalPoints: number;
  questions: ModeExamQuestion[];
  source: 'curriculum_json' | 'fallback';
  isAvailable: boolean;
}

interface PoolItem {
  q: string;
  a: string;
  type: ExamQuestionType;
  sourceLesson: string;
  sourceChapter: number;
}

const TYPE_LABELS: Record<ExamQuestionType, string> = {
  define: 'تعريف',
  explain: 'تعليل / تفسير',
  count: 'تعداد',
  number: 'مسألة / تطبيق',
  compare: 'مقارنة',
  fill: 'فراغ',
  mention: 'اذكر',
  general: 'سؤال منهجي',
};

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join('\n• ');
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return cleanText(record.text || record.content || record.answer || record.description || JSON.stringify(value));
  }
  return String(value).trim();
}

function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function classifyQuestion(question: string, rawType: string): ExamQuestionType {
  const text = `${rawType} ${question}`.toLowerCase();
  if (text.includes('تعريف') || text.includes('عرف') || text.includes('ما المقصود') || text.includes('define')) return 'define';
  if (text.includes('علل') || text.includes('فسر') || text.includes('لماذا') || text.includes('ما سبب') || text.includes('explain')) return 'explain';
  if (text.includes('قارن') || text.includes('فرق بين') || text.includes('compare')) return 'compare';
  if (text.includes('فراغ') || text.includes('أكمل') || text.includes('املأ') || text.includes('fill')) return 'fill';
  if (text.startsWith('عدّد') || text.startsWith('عدد') || text.includes('ما هي أنواع') || text.includes('ما هي أقسام') || text.includes('count')) return 'count';
  if (text.startsWith('احسب') || text.startsWith('حل') || text.startsWith('جد') || text.includes('مسألة') || text.includes('تطبيق') || text.includes('calculate')) return 'number';
  if (text.startsWith('اذكر') || text.includes('ما وظيفة') || text.includes('ما أهمية') || text.includes('ما موقع') || text.includes('mention')) return 'mention';
  return 'general';
}

function extractPool(curriculum: LessonBookletData | null, lessonTitle: string, chapterNumber: number): PoolItem[] {
  if (!curriculum?.pages?.length) return [];
  const items = curriculum.pages.flatMap((page: any) => page.items || []);
  const pool: PoolItem[] = [];

  for (const item of items) {
    if (item?.type !== 'question' && !item?.question && !item?.prompt) continue;
    const q = cleanText(item.question || item.prompt || item.title);
    const a = cleanText(item.answer || item.model_answer || item.content || item.description);
    if (!q || !a) continue;
    pool.push({
      q: q.replace(/\s+/g, ' ').trim(),
      a,
      type: classifyQuestion(q, cleanText(item.question_type || item.type)),
      sourceLesson: lessonTitle,
      sourceChapter: chapterNumber,
    });
  }

  for (const item of items) {
    if (item?.type === 'comparison' && Array.isArray(item.items) && item.items.length >= 2) {
      const names = item.items.map((entry: any) => cleanText(entry.name)).filter(Boolean);
      const answer = item.items
        .map((entry: any) => `${cleanText(entry.name)}: ${cleanText(entry.points)}`)
        .filter(Boolean)
        .join('\n');
      if (names.length >= 2 && answer) {
        pool.push({
          q: `قارن بين: ${names.join(' و ')}`,
          a: answer,
          type: 'compare',
          sourceLesson: lessonTitle,
          sourceChapter: chapterNumber,
        });
      }
    }
    if (item?.type === 'list' && Array.isArray(item.items) && item.items.length > 0) {
      const title = cleanText(item.title) || lessonTitle;
      const answer = item.items.map(cleanText).filter(Boolean).join('\n• ');
      if (answer) {
        pool.push({
          q: `عدّد أهم النقاط المتعلقة بـ: ${title}`,
          a: answer,
          type: 'count',
          sourceLesson: lessonTitle,
          sourceChapter: chapterNumber,
        });
      }
    }
  }

  if (pool.length === 0) {
    const paragraph = items.find((item: any) => item?.type === 'paragraph' && cleanText(item.content));
    const answer = cleanText(paragraph?.content);
    if (answer) {
      pool.push({
        q: `اشرح الفكرة العلمية الأساسية في درس ${lessonTitle}.`,
        a: answer,
        type: 'explain',
        sourceLesson: lessonTitle,
        sourceChapter: chapterNumber,
      });
    }
  }

  return pool;
}

function uniquePool(pool: PoolItem[]): PoolItem[] {
  return Array.from(new Map(pool.map((item) => [item.q.replace(/\s+/g, ' ').trim(), item])).values());
}

function chooseDiverse(pool: PoolItem[], target: number): PoolItem[] {
  const unique = uniquePool(pool);
  if (!unique.length) return [];
  const groups = new Map<ExamQuestionType, PoolItem[]>();
  for (const item of shuffle(unique)) {
    const group = groups.get(item.type) || [];
    group.push(item);
    groups.set(item.type, group);
  }

  const typeOrder: ExamQuestionType[] = ['define', 'explain', 'count', 'number', 'compare', 'fill', 'mention', 'general'];
  const selected: PoolItem[] = [];
  let lastType: ExamQuestionType | null = null;

  while (selected.length < target) {
    const candidates = typeOrder
      .filter((type) => (groups.get(type)?.length || 0) > 0 && type !== lastType)
      .map((type) => groups.get(type)![0]);
    const fallbackCandidates = typeOrder
      .filter((type) => (groups.get(type)?.length || 0) > 0)
      .map((type) => groups.get(type)![0]);
    const item = candidates[0] || fallbackCandidates[0];
    if (!item) break;
    selected.push(item);
    lastType = item.type;
    const group = groups.get(item.type)!;
    group.shift();
  }

  if (selected.length < target) {
    const reusable = shuffle(unique);
    let index = 0;
    while (selected.length < target) {
      selected.push(reusable[index % reusable.length]);
      index += 1;
    }
  }
  return selected;
}

function createUnavailable(mode: ExamMode, ctx: OpenLessonContext): ModeExamConfig {
  return {
    id: `exam-${mode}-unavailable-${ctx.subjectId}-${ctx.chapterNumber}`,
    mode,
    modeLabel: mode === 'monthly' ? 'الامتحان الشهري' : 'الامتحان الشامل',
    lessonTitle: ctx.title || ctx.lessonTitle || `الفصل ${ctx.chapterNumber}`,
    subject: ctx.subjectId,
    grade: 'السادس الإعدادي',
    sourceLabel: mode === 'monthly' ? `الفصل ${ctx.chapterNumber}` : 'جميع الفصول',
    durationMinutes: mode === 'monthly' ? 20 : 30,
    totalPoints: 0,
    questions: [],
    source: 'fallback',
    isAvailable: false,
  };
}

function lessonContext(ctx: OpenLessonContext, chapterNumber: number, lesson: SubjectChapterLesson): OpenLessonContext {
  return {
    subjectId: ctx.subjectId,
    chapterNumber,
    lessonNumber: lesson.number,
    lessonId: lesson.id,
    lessonKey: `${ctx.subjectId}_ch${chapterNumber}_les${lesson.number}`,
    title: lesson.title,
    lessonTitle: lesson.title,
  };
}

async function mapWithConcurrency<T, R>(values: T[], worker: (value: T) => Promise<R>, concurrency = 6): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(values[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

function buildConfig(mode: ExamMode, ctx: OpenLessonContext, pool: PoolItem[], subject: string, grade: string): ModeExamConfig {
  const target = mode === 'monthly' ? 4 : 5;
  const points = mode === 'monthly' ? 25 : 20;
  const selected = chooseDiverse(pool, target);
  return {
    id: `exam-${mode}-${ctx.subjectId}-${ctx.chapterNumber}-${Date.now()}`,
    mode,
    modeLabel: mode === 'monthly' ? 'الامتحان الشهري' : 'الامتحان الشامل',
    lessonTitle: ctx.title || ctx.lessonTitle || `الفصل ${ctx.chapterNumber}`,
    subject,
    grade,
    sourceLabel: mode === 'monthly' ? `الفصل ${ctx.chapterNumber}` : 'جميع الفصول',
    durationMinutes: mode === 'monthly' ? 20 : 30,
    totalPoints: selected.length * points,
    questions: selected.map((item, index) => ({
      id: `${mode}-q${index + 1}-${item.sourceChapter}-${index}`,
      type: item.type,
      typeLabel: TYPE_LABELS[item.type],
      prompt: item.q,
      modelAnswer: item.a,
      points,
      sourceLesson: item.sourceLesson,
      sourceChapter: item.sourceChapter,
    })),
    source: 'curriculum_json',
    isAvailable: selected.length === target,
  };
}

export async function fetchExamForMode(ctx: OpenLessonContext, mode: ExamMode): Promise<ModeExamConfig> {
  try {
    const chaptersResponse = await getSubjectChapters(ctx.subjectId, ctx.subjectId);
    const chapters = chaptersResponse.data || [];
    const selectedChapters: SubjectChapter[] = mode === 'monthly'
      ? chapters.filter((chapter) => chapter.number === ctx.chapterNumber)
      : chapters;
    const chaptersToUse = selectedChapters.length ? selectedChapters : [{
      id: `chapter-${ctx.chapterNumber}`,
      number: ctx.chapterNumber,
      title: `الفصل ${ctx.chapterNumber}`,
      lessonsCount: 1,
      completedLessonsCount: 0,
      lessons: [{ id: ctx.lessonId, number: ctx.lessonNumber, title: ctx.title || ctx.lessonTitle || `الدرس ${ctx.lessonNumber}`, duration: '20:00', status: 'available', progressPercentage: 0 }],
    } as SubjectChapter];

    const contexts: OpenLessonContext[] = [];
    for (const chapter of chaptersToUse) {
      const lessonsResponse = await getChapterLessons(ctx.subjectId, chapter.title, chapter.number, ctx.subjectId);
      const lessons = lessonsResponse.data?.length ? lessonsResponse.data : chapter.lessons;
      for (const lesson of lessons) contexts.push(lessonContext(ctx, chapter.number, lesson));
    }
    if (!contexts.length) contexts.push(ctx);

    const curriculumResults = await mapWithConcurrency(contexts, async (lessonCtx) => ({
      lessonCtx,
      result: await fetchLessonCurriculum(lessonCtx),
    }));
    const pool = curriculumResults.flatMap(({ lessonCtx, result }) => extractPool(
      result.data,
      lessonCtx.title || lessonCtx.lessonTitle || `الدرس ${lessonCtx.lessonNumber}`,
      lessonCtx.chapterNumber,
    ));
    const firstResult = curriculumResults.find(({ result }) => result.data)?.result.data;
    const subject = firstResult?.lesson_info?.subject || ctx.subjectId;
    const grade = firstResult?.lesson_info?.grade || 'السادس الإعدادي';
    const config = buildConfig(mode, ctx, pool, subject, grade);
    return config.isAvailable ? config : createUnavailable(mode, ctx);
  } catch (error) {
    console.error(`Failed to create ${mode} exam:`, error);
    return createUnavailable(mode, ctx);
  }
}

export { TYPE_LABELS };
