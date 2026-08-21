import { supabase } from '../lib/supabase';
import { getDbSubjectIds } from './lessonsService';
import { MillionaireGameConfig, MillionaireQuestion } from '../types';
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

  if (validQuestions.length === 0) {
    return getMillionaireGameForLesson(lessonId, lessonTitle, category);
  }

  const ladderPoints = [
    5000, 10000, 25000, 50000, 100000, 150000, 250000, 400000, 500000, 650000, 800000, 900000, 1000000,
  ];

  const parsedQuestions: MillionaireQuestion[] = validQuestions.slice(0, 15).map((item, idx) => {
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

  if (validQuestions.length === 0) {
    return getTrueFalseGameForLesson(lessonId, lessonTitle, category);
  }

  const parsedQuestions: TrueFalseQuestion[] = validQuestions.slice(0, 12).map((item, idx) => {
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

  if (rawRounds.length === 0) {
    return getGibhaSahGameForLesson(lessonId, lessonTitle, category);
  }

  // Extract up to 12 distinct answers to form the 12 grid cards
  const uniqueAnswers = Array.from(
    new Set(rawRounds.map((r: any) => (r.correct_answer || r.answer || '').trim()).filter((a: string) => a.length > 0))
  );

  const cardsCount = Math.min(12, Math.max(4, uniqueAnswers.length));
  const activeAnswers = uniqueAnswers.slice(0, cardsCount);

  // If we have fewer than 12, pad with meaningful terms or fallback
  const cards: GibhaSahCard[] = activeAnswers.map((ans, idx) => ({
    id: idx + 1,
    number: idx + 1,
    label: ans,
    sublabel: `المصطلح رقم ${idx + 1}`,
    badge: 'بطاقة علمية',
  }));

  while (cards.length < 12) {
    const extraIdx = cards.length + 1;
    cards.push({
      id: extraIdx,
      number: extraIdx,
      label: `بطاقة إضافية ${extraIdx}`,
      sublabel: 'مفهوم منهجي',
      badge: 'تحدي إضافي',
    });
  }

  // Map questions to the respective card number
  const questions: GibhaSahQuestion[] = rawRounds.slice(0, 12).map((r, idx) => {
    const correctAns = (r.correct_answer || r.answer || '').trim();
    const cardMatchIndex = cards.findIndex((c) => c.label === correctAns);
    const correctCardNumber = cardMatchIndex !== -1 ? cardMatchIndex + 1 : (idx % cards.length) + 1;

    return {
      id: `gs-${idx + 1}`,
      questionNumber: idx + 1,
      question: r.question,
      correctCardNumber,
      explanation: `الإجابة الصحيحة هي بطاقة (${correctCardNumber}): ${cards[correctCardNumber - 1]?.label || correctAns}`,
      points: 100,
    };
  });

  return {
    lessonId,
    subject: rawContent.lesson_info?.subject || category,
    title: `لعبة جِيبْهَا صَح 🎯 - ${lessonTitle}`,
    subtitle: 'شبكة الـ 12 بطاقة علمية التنافسية',
    mode: 'cards_12',
    cards,
    questions,
  };
}

/**
 * Main On-Demand Loader for Interactive Games
 * ONLY downloads data when the user opens the games modal.
 */
export async function fetchLessonGamesData(
  subjectId: string,
  lessonId: string,
  lessonTitle: string = 'الدرس التعليمي',
  category: string = 'المادة التعليمية',
  chapterIndex?: number,
  lessonIndex?: number
): Promise<LessonGamesBundle> {
  const normKey = getSubjectNormalizedKey(subjectId || category);
  const cacheKey = `${normKey}_${lessonId}`;

  // Return cached result if already fetched
  if (gamesCache[cacheKey]) {
    return gamesCache[cacheKey];
  }

  const dbSubjects = getDbSubjectIds(normKey);
  const { chapter: extractedCh, segment: extractedSeg } = extractChapterAndSegment(lessonId);
  const targetChapter = chapterIndex !== undefined ? chapterIndex + 1 : extractedCh;
  const targetSegment = lessonIndex !== undefined ? lessonIndex + 1 : extractedSeg;

  try {
    // Concurrently fetch MCQ, True/False, and PH from Supabase educational_data
    const [mcqRes, tfRes, phRes] = await Promise.all([
      // 1. Fetch MCQ
      (async () => {
        if (targetChapter !== undefined) {
          let query = supabase
            .from('educational_data')
            .select('id, file_name, subject_id, section_id, content')
            .in('subject_id', dbSubjects)
            .eq('section_id', 'mcq')
            .ilike('file_name', `%ch${targetChapter}%`);

          if (targetSegment !== undefined) {
            query = query.or(`file_name.ilike.%segment${targetSegment}%,file_name.ilike.%lesson${targetSegment}%,file_name.ilike.%les${targetSegment}%`);
          }

          const { data } = await query.limit(1);
          if (data && data.length > 0 && data[0].content) return data[0].content;
        }

        // Fallback MCQ for subject
        const { data: fallbackMcq } = await supabase
          .from('educational_data')
          .select('id, file_name, subject_id, section_id, content')
          .in('subject_id', dbSubjects)
          .eq('section_id', 'mcq')
          .limit(1);

        return fallbackMcq?.[0]?.content || null;
      })(),

      // 2. Fetch True/False
      (async () => {
        if (targetChapter !== undefined) {
          let query = supabase
            .from('educational_data')
            .select('id, file_name, subject_id, section_id, content')
            .in('subject_id', dbSubjects)
            .eq('section_id', 'true_false')
            .ilike('file_name', `%ch${targetChapter}%`);

          if (targetSegment !== undefined) {
            query = query.or(`file_name.ilike.%segment${targetSegment}%,file_name.ilike.%lesson${targetSegment}%,file_name.ilike.%les${targetSegment}%`);
          }

          const { data } = await query.limit(1);
          if (data && data.length > 0 && data[0].content) return data[0].content;
        }

        // Fallback True/False for subject
        const { data: fallbackTf } = await supabase
          .from('educational_data')
          .select('id, file_name, subject_id, section_id, content')
          .in('subject_id', dbSubjects)
          .eq('section_id', 'true_false')
          .limit(1);

        return fallbackTf?.[0]?.content || null;
      })(),

      // 3. Fetch PH (Gibha Sah)
      (async () => {
        if (targetChapter !== undefined) {
          let query = supabase
            .from('educational_data')
            .select('id, file_name, subject_id, section_id, content')
            .in('subject_id', dbSubjects)
            .eq('section_id', 'ph')
            .ilike('file_name', `%ch${targetChapter}%`);

          if (targetSegment !== undefined) {
            query = query.or(`file_name.ilike.%segment${targetSegment}%,file_name.ilike.%lesson${targetSegment}%,file_name.ilike.%les${targetSegment}%`);
          }

          const { data } = await query.limit(1);
          if (data && data.length > 0 && data[0].content) return data[0].content;
        }

        // Fallback PH for subject
        const { data: fallbackPh } = await supabase
          .from('educational_data')
          .select('id, file_name, subject_id, section_id, content')
          .in('subject_id', dbSubjects)
          .eq('section_id', 'ph')
          .limit(1);

        return fallbackPh?.[0]?.content || null;
      })(),
    ]);

    // Parse configs
    const mcqConfig = mcqRes
      ? parseMcqToMillionaire(mcqRes, lessonId, lessonTitle, category)
      : getMillionaireGameForLesson(lessonId, lessonTitle, category);

    const trueFalseConfig = tfRes
      ? parseTrueFalseConfig(tfRes, lessonId, lessonTitle, category)
      : getTrueFalseGameForLesson(lessonId, lessonTitle, category);

    const gibhaSahConfig = phRes
      ? parsePhToGibhaSah(phRes, lessonId, lessonTitle, category)
      : getGibhaSahGameForLesson(lessonId, lessonTitle, category);

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
      mcqConfig: getMillionaireGameForLesson(lessonId, lessonTitle, category),
      trueFalseConfig: getTrueFalseGameForLesson(lessonId, lessonTitle, category),
      gibhaSahConfig: getGibhaSahGameForLesson(lessonId, lessonTitle, category),
      source: 'fallback',
      loadedAt: Date.now(),
    };
    gamesCache[cacheKey] = fallbackBundle;
    return fallbackBundle;
  }
}
