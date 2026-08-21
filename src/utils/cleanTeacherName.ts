/**
 * Strips title prefixes like "الأستاذ", "الاستاذ", "الأستاذة", "الاستاذة", "الست", "أستاذ", "استاذ", "ست", "د.", "أ.", "م."
 * to display ONLY the teacher's clean personal/family name.
 */
export function cleanTeacherName(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .replace(/^(الأستاذة|الاستاذة|الأستاذ|الاستاذ|الست|أستاذة|استاذة|أستاذ|استاذ|الدكتورة|الدكتور|دكتورة|دكتور|المهندس|المهندسة|ست|م\.|د\.|أ\.)\s*/i, '')
    .trim();
}
