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
  statusLabel?: string;
  isFree?: boolean;
  applicationDeadline?: string;
  requiredLevel?: number;
  requiredRating?: 'gold';
  seatsPerGovernorate?: number;
  sponsorNote?: string;
}

/**
 * Temporary course catalog for the subscriptions section.
 * The shape is intentionally ready to be replaced by Supabase data later.
 */
export const MOCK_COURSES: MockCourse[] = [
  {
    id: 'november-comprehensive',
    title: 'دورة شهر تشرين الثاني',
    description: 'جميع المواد الدراسية مع امتحان إلكتروني شامل ومتابعة منظمة',
    subjects: ['التربية الإسلامية', 'العربي', 'الإنجليزي', 'الرياضيات', 'الأحياء', 'الفيزياء', 'الكيمياء'],
    oldPrice: 900000,
    currentPrice: 200000,
    status: 'upcoming',
    registrationMonth: 'الشهر الحادي عشر',
    includesOnlineExam: true,
    includesInPersonExam: true,
    badge: 'تشمل الامتحان الإلكتروني والحضوري',
    featured: true,
  },
  {
    id: 'august-comprehensive',
    title: 'دورة شهر 8',
    description: 'برنامج متكامل يشمل جميع المواد الدراسية للسادس الإعدادي',
    subjects: ['التربية الإسلامية', 'العربي', 'الإنجليزي', 'الرياضيات', 'الأحياء', 'الفيزياء', 'الكيمياء'],
    oldPrice: 800000,
    currentPrice: 180000,
    status: 'full',
    includesOnlineExam: true,
    includesInPersonExam: false,
    badge: 'تشمل الامتحان الإلكتروني',
  },
  {
    id: 'december-free-comprehensive',
    title: 'دورة شهر 12',
    description: 'دورة مجانية تشمل جميع المواد الدراسية مع امتحان إلكتروني وحضوري شامل',
    subjects: ['التربية الإسلامية', 'العربي', 'الإنجليزي', 'الرياضيات', 'الأحياء', 'الفيزياء', 'الكيمياء'],
    status: 'open',
    statusLabel: 'دورة مجانية — ابدأ الآن',
    isFree: true,
    registrationMonth: '1/12',
    applicationDeadline: '25 نوفمبر',
    requiredLevel: 80,
    requiredRating: 'gold',
    seatsPerGovernorate: 400,
    sponsorNote: 'هذه الدورة مدفوعة من قبل المجلس الثقافي البريطاني ومنظمة معًا وجمعية Thomson للتنمية الدولية في الشرق الأوسط.',
    includesOnlineExam: true,
    includesInPersonExam: true,
    badge: 'مجانية — إلكتروني وحضوري',
  },
];

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  upcoming: 'التقديم في الشهر الحادي عشر',
  open: 'متاح للتسجيل',
  full: 'المقاعد ممتلئة',
  closed: 'التسجيل مغلق',
};
