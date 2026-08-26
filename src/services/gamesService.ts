import { supabase } from '../lib/supabase';
import { buildLessonKey, fileNameMatchesLesson, getDbSubjectIds, getLessonContentBundle } from './lessonsService';
import { MillionaireGameConfig, MillionaireQuestion, OpenLessonContext } from '../types';
import { TrueFalseGameConfig, TrueFalseQuestion, getTrueFalseGameForLesson } from '../data/mockTrueFalse';
import { GibhaSahGameConfig, GibhaSahQuestion, GibhaSahCard, getGibhaSahGameForLesson } from '../data/mockGibhaSah';
import { getMillionaireGameForLesson } from '../data/mockMillionaire';
import { extractChapterAndSegment } from './curriculumService';

export interface LessonGamesBundle {
  mcqConfig: MillionaireGameConfig;
  trueFalseConfig: TrueFalseGameConfig;
  gibhaSahConfig: GibhaSahGameConfig;
  source: 'database' | 'fallback';
  loadedAt: number;
}

// In-memory cache for game bundles by key (subject_lessonId)
const gamesCache: Record<string, LessonGamesBundle> = {};

function getSubjectNormalizedKey(subjectId: string): string {
  const s = subjectId.toLowerCase().trim();
  if (s.includes('chem') || s.includes('كيمياء')) return 'chemistry';
  if (s.includes('bio') || s.includes('أحياء') || s.includes('احياء')) return 'biology';
  if (s.includes('phys') || s.includes('فيزياء')) return 'physics';
  if (s.includes('math') || s.includes('رياضيات')) return 'mathematics';
  if (s.includes('islam') || s.includes('اسلامية') || s.includes('إسلامية')) return 'islamic';
  if (s.includes('arab') || s.includes('عربي')) {
    if (s.includes('2') || s.includes('part2') || s.includes('ج2')) return 'arabic_part2';
    return 'arabic_part1';
  }
  return subjectId;
}

/**
 * Fetch one section only when the filename proves the exact chapter + lesson.
 * A broad chapter/lesson OR query is intentionally not used because it can
 * return an arbitrary neighboring file and silently generalize its questions.
 */
async function fetchExactSectionContent(
  sectionId: 'mcq' | 'true_false' | 'ph',
  dbSubjects: string[],
  chapterNumber: number | undefined,
  lessonNumber: number | undefined,
  lessonId: string
): Promise<any | null> {
  if (chapterNumber === undefined || lessonNumber === undefined) return null;

  const sectionAliases = sectionId === 'true_false'
    ? ['true_false', 'tf', 'صح_خطأ', 'صح_ام_خطا']
    : sectionId === 'ph'
      ? ['ph', 'فلاش_كاردز', 'بطاقات']
      : [sectionId];
  const baseQuery = () =>
    supabase
      .from('educational_data')
      .select('id, file_name, subject_id, section_id, content')
      .in('subject_id', dbSubjects)
      .in('section_id', sectionAliases);

  // An exact lesson id is safer than a chapter-only search when the database has it.
  const cleanLessonId = lessonId.replace(/\.json$/i, '').trim();
  if (cleanLessonId.length > 3) {
    const { data: directRows } = await baseQuery()
      .ilike('file_name', `%${cleanLessonId}%`)
      .limit(20);
    const directMatch = directRows?.find(
      (row) => fileNameMatchesLesson(row.file_name, chapterNumber, lessonNumber) && row.content
    );
    if (directMatch) return directMatch.content;
  }

  const { data: chapterRows } = await baseQuery()
    .or(
      `file_name.ilike.%ch${chapterNumber}%,file_name.ilike.%chapter${chapterNumber}%,file_name.ilike.%فصل%${chapterNumber}%`
    )
    .limit(100);

  const exactMatch = chapterRows?.find(
    (row) => fileNameMatchesLesson(row.file_name, chapterNumber, lessonNumber) && row.content
  );
  return exactMatch?.content || null;
}

async function getPreviousLessonGibhaSahConfig(
  context: OpenLessonContext,
  currentConfig: GibhaSahGameConfig
): Promise<GibhaSahGameConfig> {
  if (currentConfig.questions.length > 0 || context.lessonNumber <= 1) return currentConfig;

  try {
    const previousLessonNumber = context.lessonNumber - 1;
    const previousContext: OpenLessonContext = {
      ...context,
      lessonNumber: previousLessonNumber,
      lessonId: `${context.subjectId}-ch${context.chapterNumber}-les${previousLessonNumber}`,
      lessonKey: buildLessonKey(context.subjectId, context.chapterNumber, previousLessonNumber),
      title: `الدرس ${previousLessonNumber}`,
      lessonTitle: `الدرس ${previousLessonNumber}`,
    };
    const previousDbSubjects = getDbSubjectIds(getSubjectNormalizedKey(context.subjectId));
    const directPreviousPh = await fetchExactSectionContent(
      'ph',
      previousDbSubjects,
      context.chapterNumber,
      previousLessonNumber,
      previousContext.lessonId
    );
    const previousBundle = directPreviousPh ? null : await getLessonContentBundle(previousContext);
    const previousPhData = directPreviousPh || previousBundle?.phData;
    if (previousPhData) {
      const previousConfig = parsePhToGibhaSah(
        previousPhData,
        previousContext.lessonId,
        previousContext.title || previousContext.lessonTitle || `الدرس ${previousLessonNumber}`,
        context.subjectId
      );
      if (previousConfig.questions.length > 0) {
        return {
          ...previousConfig,
          lessonId: context.lessonId,
          title: `لعبة جِيبْهَا صَح 🎯 - ${context.title || context.lessonTitle || `الدرس ${context.lessonNumber}`}`,
          subtitle: `أسئلة الدرس السابق (${previousLessonNumber}) لعدم كفاية بنك هذا الدرس`,
        };
      }
    }
  } catch (error) {
    console.warn('[gamesService] Previous lesson PH fallback failed:', error);
  }

  return currentConfig;
}

/**
 * Parses raw Supabase MCQ JSON into MillionaireGameConfig
 */
function parseMcqToMillionaire(
  rawContent: any,
  lessonId: string,
  lessonTitle: string,
  category: string
): MillionaireGameConfig {
  const items: any[] = rawContent.pages?.flatMap((p: any) => p.items || []) || [];
  const validQuestions = items.filter((it: any) => it && it.question && Array.isArray(it.options) && it.options.length >= 2);

  if (validQuestions.length < 4) {
    return getMillionaireGameForLesson(lessonId, lessonTitle, category);
  }

  const ladderPoints = [
    5000, 10000, 25000, 50000, 100000, 150000, 250000, 400000, 500000, 650000, 800000,
  ];
  const targetQuestionCount = 11;
  const questionsForGame = Array.from({ length: targetQuestionCount }, (_, idx) => validQuestions[idx % validQuestions.length]);

  const parsedQuestions: MillionaireQuestion[] = questionsForGame.map((item, idx) => {
    // Standardize 4 options
    const rawOpts = item.options.map((opt: string) => opt.replace(/^[A-D]\)\s*/i, '').trim());
    while (rawOpts.length < 4) {
      rawOpts.push(`خيار إضافي ${rawOpts.length + 1}`);
    }
    const cleanOpts = rawOpts.slice(0, 4) as [string, string, string, string];

    // Determine correct option index
    let correctIdx = 0;
    if (item.correct_option) {
      const optLetter = String(item.correct_option).toUpperCase().trim();
      if (optLetter === 'A' || optLetter === 'أ') correctIdx = 0;
      else if (optLetter === 'B' || optLetter === 'ب') correctIdx = 1;
      else if (optLetter === 'C' || optLetter === 'ج') correctIdx = 2;
      else if (optLetter === 'D' || optLetter === 'د') correctIdx = 3;
    } else if (item.answer) {
      const cleanAns = String(item.answer).trim();
      const matchIdx = cleanOpts.findIndex((o) => o === cleanAns || cleanAns.includes(o) || o.includes(cleanAns));
      if (matchIdx !== -1) correctIdx = matchIdx;
    }

    const questionPoints = ladderPoints[idx] || 1000000;
    const diff: 'easy' | 'medium' | 'hard' = idx < 4 ? 'easy' : idx < 9 ? 'medium' : 'hard';

    return {
      id: String(item.item_id || `mcq-${idx + 1}`),
      difficulty: diff,
      points: questionPoints,
      question: item.question,
      options: cleanOpts,
      correctAnswer: correctIdx,
      explanation: typeof item.answer === 'string' ? item.answer : `الإجابة النموذجية هي: ${cleanOpts[correctIdx]}`,
      hint: `فكر في محور الدرس المنهجي المرتبط بالسؤال`,
    };
  });

  return {
    gameId: `game-mcq-${lessonId}`,
    gameType: 'millionaire',
    lessonId,
    subject: rawContent.lesson_info?.subject || category,
    grade: rawContent.lesson_info?.grade || 'السادس الإعدادي المنهج الوزاري',
    title: `من سيربح المليون - ${lessonTitle}`,
    subtitle: rawContent.lesson_info?.grade || 'السادس الإعدادي المنهج الوزاري',
    questions: parsedQuestions,
  };
}

/**
 * Parses raw Supabase True/False JSON into TrueFalseGameConfig
 */
function parseTrueFalseConfig(
  rawContent: any,
  lessonId: string,
  lessonTitle: string,
  category: string
): TrueFalseGameConfig {
  const items: any[] = rawContent.pages?.flatMap((p: any) => p.items || []) || [];
  const validQuestions = items.filter((it: any) => it && it.question && it.type === 'question');

  if (validQuestions.length < 4) {
    return getTrueFalseGameForLesson(lessonId, lessonTitle, category);
  }

  const targetQuestionCount = 12;
  const questionsForGame = Array.from({ length: targetQuestionCount }, (_, idx) => validQuestions[idx % validQuestions.length]);
  const parsedQuestions: TrueFalseQuestion[] = questionsForGame.map((item, idx) => {
    let isCorrectVal = true;
    if (item.correct_option !== undefined) {
      const opt = String(item.correct_option).toLowerCase().trim();
      isCorrectVal = opt === 'true' || opt === 'صح' || opt === 'صحيح' || opt === 'نعم';
    } else if (item.answer) {
      const ansStr = String(item.answer).trim();
      if (ansStr.startsWith('خطأ') || ansStr.startsWith('كلا') || ansStr.startsWith('لا') || ansStr.includes('غير صحيح')) {
        isCorrectVal = false;
      }
    }

    const diff: 'سهل' | 'متوسط' | 'متقدم' = idx < 4 ? 'سهل' : idx < 8 ? 'متوسط' : 'متقدم';

    return {
      id: String(item.item_id || `tf-${idx + 1}`),
      question: item.question,
      isCorrect: isCorrectVal,
      difficulty: diff,
      points: 100,
      explanation: typeof item.answer === 'string' ? item.answer : (isCorrectVal ? 'العبارة صحيحة منهجياً وفق الكتاب الوزاري.' : 'العبارة خاطئة منهجياً.'),
      category: rawContent.lesson_info?.subject || category,
    };
  });

  return {
    lessonId,
    subject: rawContent.lesson_info?.subject || category,
    title: `تحدي صح أم خطأ - ${lessonTitle}`,
    subtitle: '12 سؤالاً تفاعلياً لتقييم الاستيعاب والسرعة',
    totalQuestions: parsedQuestions.length,
    totalPoints: parsedQuestions.length * 100,
    questions: parsedQuestions,
  };
}

/**
 * Parses raw Supabase PH JSON into GibhaSahGameConfig (12 cards)
 */
function parsePhToGibhaSah(
  rawContent: any,
  lessonId: string,
  lessonTitle: string,
  category: string
): GibhaSahGameConfig {
  let rawRounds: any[] = [];
  if (Array.isArray(rawContent.pages)) {
    for (const page of rawContent.pages) {
      if (Array.isArray(page.rounds)) {
        rawRounds.push(...page.rounds);
      } else if (Array.isArray(page.items)) {
        rawRounds.push(...page.items);
      }
    }
  }

  const getRoundAnswer = (round: any): string => String(round?.correct_answer ?? round?.answer ?? '').trim();
  const validRounds = rawRounds.filter(
    (round: any) => round && typeof round.question === 'string' && round.question.trim() && getRoundAnswer(round)
  );
  const uniqueAnswers = Array.from(new Set(validRounds.map(getRoundAnswer)));

  // Fewer than four valid rounds/answers means this lesson cannot form a valid game.
  if (validRounds.length < 4 || uniqueAnswers.length < 4) {
    return getGibhaSahGameForLesson(lessonId, lessonTitle, category);
  }

  const cardsCount = 10;
  // Repeat only rounds from this same PH file until ten question/card slots exist.
  // Each question owns its numbered slot, so duplicate labels never point to the first duplicate.
  const roundsForGame = Array.from({ length: cardsCount }, (_, idx) => validRounds[idx % validRounds.length]);
  const cards: GibhaSahCard[] = roundsForGame.map((round, idx) => ({
    id: idx + 1,
    number: idx + 1,
    label: getRoundAnswer(round),
    sublabel: `المصطلح رقم ${idx + 1}`,
    badge: 'بطاقة علمية',
  }));

  const questions: GibhaSahQuestion[] = roundsForGame.map((round, idx) => {
    const correctCardNumber = idx + 1;
    const correctAns = getRoundAnswer(round);

    return {
      id: `gs-${idx + 1}`,
      questionNumber: idx + 1,
      question: round.question,
      correctCardNumber,
      explanation: `الإجابة الصحيحة هي بطاقة (${correctCardNumber}): ${cards[idx]?.label || correctAns}`,
      points: 100,
    };
  });

  return {
    lessonId,
    subject: rawContent.lesson_info?.subject || category,
    title: `لعبة جِيبْهَا صَح 🎯 - ${lessonTitle}`,
    subtitle: 'شبكة 10 بطاقات من بنك هذا الدرس',
    mode: 'cards_10',
    cards,
    questions,
  };
}

/**
 * Main On-Demand Loader for Interactive Games
 * ONLY downloads data when the user opens the games modal.
 * Accepts either OpenLessonContext or legacy parameters.
 */
export async function fetchLessonGamesData(
  contextOrSubjectId: OpenLessonContext | string,
  lessonId?: string,
  lessonTitle: string = 'الدرس التعليمي',
  category: string = 'المادة التعليمية',
  chapterNumber?: number,
  lessonNumber?: number
): Promise<LessonGamesBundle> {
  let subjectId: string;
  let actualLessonId: string;
  let actualLessonTitle: string;
  let actualCategory: string;
  let actualChapterNumber: number | undefined;
  let actualLessonNumber: number | undefined;

  if (typeof contextOrSubjectId === 'object' && contextOrSubjectId !== null) {
    const ctx = contextOrSubjectId as OpenLessonContext;
    subjectId = ctx.subjectId;
    actualLessonId = ctx.lessonId;
    actualLessonTitle = ctx.title || ctx.lessonTitle || `الدرس ${ctx.lessonNumber}`;
    actualCategory = ctx.subjectId;
    actualChapterNumber = ctx.chapterNumber;
    actualLessonNumber = ctx.lessonNumber;

    // Check if we can get data directly from bundle
    try {
      const bundle = await getLessonContentBundle(ctx);
      if (bundle && (bundle.mcqData || bundle.trueFalseData || bundle.phData)) {
        const exactDbSubjects = getDbSubjectIds(getSubjectNormalizedKey(ctx.subjectId));
        const [exactMcqData, exactTrueFalseData, exactPhData] = await Promise.all([
          bundle.mcqData || fetchExactSectionContent('mcq', exactDbSubjects, ctx.chapterNumber, ctx.lessonNumber, ctx.lessonId),
          bundle.trueFalseData || fetchExactSectionContent('true_false', exactDbSubjects, ctx.chapterNumber, ctx.lessonNumber, ctx.lessonId),
          bundle.phData || fetchExactSectionContent('ph', exactDbSubjects, ctx.chapterNumber, ctx.lessonNumber, ctx.lessonId),
        ]);

        const mcqConfig = exactMcqData
          ? parseMcqToMillionaire(exactMcqData, actualLessonId, actualLessonTitle, actualCategory)
          : getMillionaireGameForLesson(actualLessonId, actualLessonTitle, actualCategory);

        const trueFalseConfig = exactTrueFalseData
          ? parseTrueFalseConfig(exactTrueFalseData, actualLessonId, actualLessonTitle, actualCategory)
          : getTrueFalseGameForLesson(actualLessonId, actualLessonTitle, actualCategory);

        const currentGibhaSahConfig = exactPhData
          ? parsePhToGibhaSah(exactPhData, actualLessonId, actualLessonTitle, actualCategory)
          : getGibhaSahGameForLesson(actualLessonId, actualLessonTitle, actualCategory);
        const gibhaSahConfig = await getPreviousLessonGibhaSahConfig(
          ctx,
          currentGibhaSahConfig
        );

        return {
          mcqConfig,
          trueFalseConfig,
          gibhaSahConfig,
          source: 'database',
          loadedAt: Date.now(),
        };
      }
    } catch (e) {
      // fallback to standard querying
    }
  } else {
    subjectId = String(contextOrSubjectId);
    actualLessonId = lessonId || 'les-1';
    actualLessonTitle = lessonTitle;
    actualCategory = category;
    actualChapterNumber = chapterNumber;
    actualLessonNumber = lessonNumber;
  }

  const normKey = getSubjectNormalizedKey(subjectId || actualCategory);
  const { chapter: extractedCh, segment: extractedSeg } = extractChapterAndSegment(actualLessonId);
  const targetChapter = actualChapterNumber !== undefined && actualChapterNumber > 0 ? actualChapterNumber : extractedCh;
  const targetSegment = actualLessonNumber !== undefined && actualLessonNumber > 0 ? actualLessonNumber : extractedSeg;

  const cacheKey = `${normKey}_ch${targetChapter || 'all'}_les${targetSegment || 'all'}_${actualLessonId}`;

  // Return cached result if already fetched
  if (gamesCache[cacheKey]) {
    return gamesCache[cacheKey];
  }

  const dbSubjects = getDbSubjectIds(normKey);

  try {
    // Concurrently fetch MCQ, True/False, and PH from Supabase educational_data
    const [mcqRes, tfRes, phRes] = await Promise.all([
      // 1. Fetch MCQ from the exact lesson file only.
      fetchExactSectionContent('mcq', dbSubjects, targetChapter, targetSegment, actualLessonId),

      // 2. Fetch True/False from the exact lesson file only.
      fetchExactSectionContent('true_false', dbSubjects, targetChapter, targetSegment, actualLessonId),

      // 3. Fetch PH/Gibha Sah from the exact lesson file only.
      fetchExactSectionContent('ph', dbSubjects, targetChapter, targetSegment, actualLessonId),
    ]);

    // Parse configs
    const mcqConfig = mcqRes
      ? parseMcqToMillionaire(mcqRes, actualLessonId, actualLessonTitle, actualCategory)
      : getMillionaireGameForLesson(actualLessonId, actualLessonTitle, actualCategory);

    const trueFalseConfig = tfRes
      ? parseTrueFalseConfig(tfRes, actualLessonId, actualLessonTitle, actualCategory)
      : getTrueFalseGameForLesson(actualLessonId, actualLessonTitle, actualCategory);

    const currentGibhaSahConfig = phRes
      ? parsePhToGibhaSah(phRes, actualLessonId, actualLessonTitle, actualCategory)
      : getGibhaSahGameForLesson(actualLessonId, actualLessonTitle, actualCategory);
    const standardContext: OpenLessonContext | null =
      targetChapter !== undefined && targetSegment !== undefined
        ? {
            subjectId,
            chapterNumber: targetChapter,
            lessonNumber: targetSegment,
            lessonId: actualLessonId,
            lessonKey: buildLessonKey(subjectId, targetChapter, targetSegment),
            title: actualLessonTitle,
            lessonTitle: actualLessonTitle,
          }
        : null;
    const gibhaSahConfig = standardContext
      ? await getPreviousLessonGibhaSahConfig(standardContext, currentGibhaSahConfig)
      : currentGibhaSahConfig;

    const bundle: LessonGamesBundle = {
      mcqConfig,
      trueFalseConfig,
      gibhaSahConfig,
      source: mcqRes || tfRes || phRes ? 'database' : 'fallback',
      loadedAt: Date.now(),
    };

    gamesCache[cacheKey] = bundle;
    return bundle;
  } catch (err) {
    console.error('Error fetching games bundle on-demand:', err);
    const fallbackBundle: LessonGamesBundle = {
      mcqConfig: getMillionaireGameForLesson(actualLessonId, actualLessonTitle, actualCategory),
      trueFalseConfig: getTrueFalseGameForLesson(actualLessonId, actualLessonTitle, actualCategory),
      gibhaSahConfig: getGibhaSahGameForLesson(actualLessonId, actualLessonTitle, actualCategory),
      source: 'fallback',
      loadedAt: Date.now(),
    };
    gamesCache[cacheKey] = fallbackBundle;
    return fallbackBundle;
  }
}
