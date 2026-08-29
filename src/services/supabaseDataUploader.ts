import { getSupabaseClient, supabase } from '../lib/supabase';

export interface EducationalDataRecord {
  id?: string;
  subject_id: string;
  section_id: string; // e.g. 'lessons', 'curriculum', 'exams', 'questions'
  file_name: string;  // e.g. 'biology/ch1/lesson1.json'
  content: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface JsonWarehouseRecord {
  id?: string;
  subject: string;
  chapter?: string;
  lesson_title?: string;
  file_name: string;
  payload: Record<string, any>;
  uploaded_at?: string;
}

export interface UploadResult {
  success: boolean;
  insertedCount: number;
  error?: string | null;
  details?: any;
}

/**
 * 1. Upload or Upsert Educational JSON Data into `educational_data` table
 * Compatible with Supabase Anon Key (Requires RLS Insert/Upsert permission for anon or authenticated)
 */
export async function uploadEducationalData(
  records: EducationalDataRecord | EducationalDataRecord[],
  tableName = 'educational_data'
): Promise<UploadResult> {
  const allowedTables = new Set(['educational_data', 'lessons_warehouse']);
  if (!allowedTables.has(tableName)) {
    return {
      success: false,
      insertedCount: 0,
      error: 'اسم الجدول غير مسموح به.',
    };
  }
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      insertedCount: 0,
      error: 'لم يتم العثور على عميل Supabase مهيأ.',
    };
  }

  const items = Array.isArray(records) ? records : [records];
  if (items.length === 0) {
    return { success: true, insertedCount: 0 };
  }

  try {
    // Process and normalize records
    const sanitizedItems = items.map((item) => ({
      ...item,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await client
      .from(tableName)
      .upsert(sanitizedItems, {
        onConflict: 'subject_id,section_id,file_name', // or 'id' if primary key
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error(`[Supabase Upload] Error upserting to ${tableName}:`, error);
      return {
        success: false,
        insertedCount: 0,
        error: error.message,
        details: error,
      };
    }

    return {
      success: true,
      insertedCount: data ? data.length : items.length,
      details: data,
    };
  } catch (err: any) {
    console.error(`[Supabase Upload Exception]`, err);
    return {
      success: false,
      insertedCount: 0,
      error: err?.message || 'حدث خطأ غير متوقع أثناء إرسال البيانات.',
    };
  }
}

/**
 * 2. Upload JSON to `json_files` or `lessons_warehouse`
 */
export async function uploadToWarehouse(
  records: JsonWarehouseRecord | JsonWarehouseRecord[],
  targetTable: 'json_files' | 'lessons_warehouse' = 'lessons_warehouse'
): Promise<UploadResult> {
  const allowedTables = new Set(['json_files', 'lessons_warehouse']);
  if (!allowedTables.has(targetTable)) {
    return {
      success: false,
      insertedCount: 0,
      error: 'اسم الجدول غير مسموح به.',
    };
  }
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      insertedCount: 0,
      error: 'Supabase client is not initialized.',
    };
  }

  const items = Array.isArray(records) ? records : [records];

  try {
    const formatted = items.map((it) => ({
      ...it,
      uploaded_at: new Date().toISOString(),
    }));

    const { data, error } = await client
      .from(targetTable)
      .insert(formatted)
      .select();

    if (error) {
      return {
        success: false,
        insertedCount: 0,
        error: error.message,
        details: error,
      };
    }

    return {
      success: true,
      insertedCount: data?.length || items.length,
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      insertedCount: 0,
      error: err?.message || 'فشل في حفظ السجلات في المستودع',
    };
  }
}

/**
 * 3. Helper to process local JSON files or data objects and prepare them for Supabase ingestion
 */
export function prepareLessonPayload(
  subjectId: string,
  chapterName: string,
  lessonNumber: number,
  lessonTitle: string,
  rawJson: Record<string, any>
): EducationalDataRecord {
  const fileName = `${subjectId}/${chapterName}/lesson_${lessonNumber}.json`;
  const recordId = `${subjectId}-${chapterName.replace(/\s+/g, '_')}-les${lessonNumber}`;

  return {
    id: recordId,
    subject_id: subjectId,
    section_id: 'lessons',
    file_name: fileName,
    content: {
      ...rawJson,
      lesson_id: rawJson.lesson_id || rawJson.id || recordId,
      title: rawJson.title || lessonTitle,
      subject: rawJson.subject || subjectId,
      chapter: rawJson.chapter || chapterName,
      lesson_number: lessonNumber,
    },
  };
}
