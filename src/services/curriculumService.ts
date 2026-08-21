import { supabase } from '../lib/supabase';
import { LessonBookletData } from '../data/lessonBooklet';
import { getDbSubjectIds } from './lessonsService';

// In-memory cache for curriculum files
const curriculumCache: Record<string, LessonBookletData> = {};

/**
 * Normalizes subject ID to standard key
 */
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
 * Extracts chapter and segment numbers from lesson identifiers or strings
 */
export function extractChapterAndSegment(input: string): { chapter?: number; segment?: number } {
  const chMatch = input.match(/ch(?:apter)?[\s_]*(\d+)/i) || input.match(/الفصل[\s_]*(\d+)/i);
  const segMatch = input.match(/(?:segment|lesson|les)[\s_]*(\d+)/i) || input.match(/الدرس[\s_]*(\d+)/i);

  return {
    chapter: chMatch ? parseInt(chMatch[1], 10) : undefined,
    segment: segMatch ? parseInt(segMatch[1], 10) : undefined,
  };
}

/**
 * Fetches the official curriculum booklet JSON for a specific lesson from Supabase.
 * Query: section_id = 'curriculum' and subject_id = matching subject.
 */
export async function fetchLessonCurriculum(
  subjectId: string,
  lessonId: string,
  chapterIndex?: number,
  lessonIndex?: number
): Promise<{ data: LessonBookletData | null; error?: string }> {
  try {
    const normKey = getSubjectNormalizedKey(subjectId);
    const dbSubjects = getDbSubjectIds(normKey);
    const cacheKey = `${normKey}_${lessonId}_ch${chapterIndex ?? 'x'}_les${lessonIndex ?? 'x'}`;

    if (curriculumCache[cacheKey]) {
      return { data: curriculumCache[cacheKey] };
    }

    const { chapter: extractedCh, segment: extractedSeg } = extractChapterAndSegment(lessonId);
    const targetChapter = chapterIndex !== undefined ? chapterIndex + 1 : extractedCh;
    const targetSegment = lessonIndex !== undefined ? lessonIndex + 1 : extractedSeg;

    // 1. Direct query by lesson_id or file_name match
    if (lessonId && lessonId.length > 3) {
      const cleanId = lessonId.replace(/\.json$/i, '');
      const { data: directRows } = await supabase
        .from('educational_data')
        .select('id, file_name, subject_id, section_id, content')
        .in('subject_id', dbSubjects)
        .eq('section_id', 'curriculum')
        .ilike('file_name', `%${cleanId}%`)
        .limit(1);

      if (directRows && directRows.length > 0 && directRows[0].content?.pages) {
        const result = directRows[0].content as LessonBookletData;
        curriculumCache[cacheKey] = result;
        return { data: result };
      }
    }

    // 2. Query by Chapter + Segment / Lesson pattern
    if (targetChapter !== undefined) {
      let query = supabase
        .from('educational_data')
        .select('id, file_name, subject_id, section_id, content')
        .in('subject_id', dbSubjects)
        .eq('section_id', 'curriculum')
        .ilike('file_name', `%ch${targetChapter}%`);

      if (targetSegment !== undefined) {
        query = query.or(`file_name.ilike.%segment${targetSegment}%,file_name.ilike.%lesson${targetSegment}%,file_name.ilike.%les${targetSegment}%`);
      }

      const { data: matchedRows } = await query.limit(1);
      if (matchedRows && matchedRows.length > 0 && matchedRows[0].content?.pages) {
        const result = matchedRows[0].content as LessonBookletData;
        curriculumCache[cacheKey] = result;
        return { data: result };
      }

      // 3. Fallback: Any curriculum item for this chapter
      const { data: chapterRows } = await supabase
        .from('educational_data')
        .select('id, file_name, subject_id, section_id, content')
        .in('subject_id', dbSubjects)
        .eq('section_id', 'curriculum')
        .ilike('file_name', `%ch${targetChapter}%`)
        .limit(1);

      if (chapterRows && chapterRows.length > 0 && chapterRows[0].content?.pages) {
        const result = chapterRows[0].content as LessonBookletData;
        curriculumCache[cacheKey] = result;
        return { data: result };
      }
    }

    // 4. Fallback: First available curriculum for the subject
    const { data: defaultRows } = await supabase
      .from('educational_data')
      .select('id, file_name, subject_id, section_id, content')
      .in('subject_id', dbSubjects)
      .eq('section_id', 'curriculum')
      .limit(1);

    if (defaultRows && defaultRows.length > 0 && defaultRows[0].content?.pages) {
      const result = defaultRows[0].content as LessonBookletData;
      curriculumCache[cacheKey] = result;
      return { data: result };
    }

    return { data: null, error: 'لم يتم العثور على مفردات منهجية لهذا الدرس' };
  } catch (err: any) {
    console.error('Error fetching curriculum:', err);
    return { data: null, error: err.message || 'خطأ أثناء جلب المنهج' };
  }
}
