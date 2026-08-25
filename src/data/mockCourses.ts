export type CourseStatus = 'upcoming' | 'open' | 'full' | 'closed';

export interface MockCourse {
  id: string;
  title: string;
  description: string;
  teachers: string[];
  oldPrice?: string;
  currentPrice?: string;
  status: CourseStatus;
  registrationMonth?: string;
  includesExam?: boolean;
  badge?: string;
  featured?: boolean;
}

/**
 * Temporary course catalog for the subscriptions section.
 * The shape is intentionally ready to be replaced by Supabase data later.
 */
export const MOCK_COURSES: MockCourse[] = [
  {
    id: 'all-subjects',
    title: 'الدورة الشاملة — جميع المواد',
    description: 'برنامج متكامل يشمل جميع المواد الدراسية للسادس الإعدادي',
    teachers: [
      'أ. حيدر وليد — الرياضيات',
      'أ. حسين محمد — الفيزياء',
      'أ. حسين الهاشمي — الكيمياء',
      'أ. سالم آل منصور — الأحياء',
      'أ. حمزة الجابري — العربي',
      'أ. محمد العبيدي — الإنجليزي',
      'أ. ساجد العكيلي — التربية الإسلامية',
    ],
    oldPrice: '750,000 د.ع',
    currentPrice: '180,000 د.ع',
    status: 'full',
    registrationMonth: 'الشهر العاشر',
    badge: 'خصم خاص',
    featured: true,
  },
  {
    id: 'all-subjects-with-exam',
    title: 'الدورة الشاملة + الامتحان الحضوري',
    description: 'الدورة الكاملة لجميع المواد مع اختبار حضوري شامل',
    teachers: [
      'أ. حيدر وليد — الرياضيات',
      'أ. حسين محمد — الفيزياء',
      'أ. حسين الهاشمي — الكيمياء',
      'أ. سالم آل منصور — الأحياء',
    ],
    oldPrice: '1,000,000 د.ع',
    currentPrice: '220,000 د.ع',
    status: 'full',
    registrationMonth: 'الشهر العاشر',
    includesExam: true,
    badge: 'يشمل امتحان حضوري',
  },
  {
    id: 'intensive-review',
    title: 'الدورة المكثفة',
    description: 'مراجعة مكثفة ومتابعة شاملة استعدادًا للامتحانات',
    teachers: ['فريق مراجعة السادس الإعدادي'],
    status: 'upcoming',
  },
];

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  upcoming: 'التسجيل قريبًا',
  open: 'متاح للتسجيل',
  full: 'ممتلئة حاليًا',
  closed: 'التسجيل مغلق',
};
