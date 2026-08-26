export type CourseStatus = 'upcoming' | 'open' | 'full' | 'closed';

export interface MockCourse {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  oldPrice?: number;
  currentPrice?: number;
  status: CourseStatus;
  registrationMonth?: string;
  includesOnlineExam: boolean;
  includesInPersonExam: boolean;
  badge?: string;
  featured?: boolean;
}

/**
 * Temporary course catalog for the subscriptions section.
 * The shape is intentionally ready to be replaced by Supabase data later.
 */
export const MOCK_COURSES: MockCourse[] = [
  {
    id: 'comprehensive-online',
    title: 'الدورة الشاملة — جميع المواد',
    description: 'برنامج متكامل يشمل جميع المواد الدراسية للسادس الإعدادي',
    subjects: ['التربية الإسلامية', 'العربي', 'الإنجليزي', 'الرياضيات', 'الأحياء', 'الفيزياء', 'الكيمياء'],
    oldPrice: 750000,
    currentPrice: 108000,
    status: 'full',
    includesOnlineExam: true,
    includesInPersonExam: false,
    badge: 'تشمل الامتحان الإلكتروني',
    featured: true,
  },
  {
    id: 'comprehensive-online-upcoming',
    title: 'الدورة الشاملة — التقديم القادم',
    description: 'جميع المواد الدراسية مع امتحان إلكتروني شامل ومتابعة منظمة',
    subjects: ['التربية الإسلامية', 'العربي', 'الإنجليزي', 'الرياضيات', 'الأحياء', 'الفيزياء', 'الكيمياء'],
    oldPrice: 1000000,
    currentPrice: 200000,
    status: 'upcoming',
    registrationMonth: 'الشهر الحادي عشر',
    includesOnlineExam: true,
    includesInPersonExam: false,
    badge: 'تشمل الامتحان الإلكتروني فقط',
  },
  {
    id: 'comprehensive-with-exams',
    title: 'الدورة الشاملة + الامتحان الحضوري',
    description: 'جميع المواد الدراسية مع امتحان إلكتروني وامتحان حضوري شامل',
    subjects: ['التربية الإسلامية', 'العربي', 'الإنجليزي', 'الرياضيات', 'الأحياء', 'الفيزياء', 'الكيمياء'],
    currentPrice: 220000,
    status: 'full',
    includesOnlineExam: true,
    includesInPersonExam: true,
    badge: 'إلكتروني وحضوري',
  },
];

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  upcoming: 'التقديم في الشهر الحادي عشر',
  open: 'متاح للتسجيل',
  full: 'المقاعد ممتلئة',
  closed: 'التسجيل مغلق',
};
