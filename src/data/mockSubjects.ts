import { EducationalLesson } from '../types';

export interface SubjectCategory {
  id: string;
  name: string;
  grade: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  teachersCount: number;
  lessonsCount: number;
  completedLessons: number;
  featuredLesson: EducationalLesson;
  description: string;
}

export interface EducationalGrade {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  level: string;
  description: string;
  subjectsCount: number;
  totalStudents: string;
  isPopular?: boolean;
}

export const EDUCATIONAL_GRADES: EducationalGrade[] = [
  {
    id: 'grade-6',
    name: 'الصف السادس الإعدادي',
    shortName: 'السادس',
    badge: 'المنهاج الوزاري المعتمد',
    level: 'المرحلة الإعدادية (العلمي / الأدبي)',
    description: 'شامل الفرع العلمي (الأحيائي والتطبيقي) والفرع الأدبي مع أسئلة وزارية واختبارات تفاعلية.',
    subjectsCount: 7,
    totalStudents: '45.2K',
    isPopular: true,
  },
  {
    id: 'grade-3-mid',
    name: 'الصف الثالث متوسط',
    shortName: 'الثالث',
    badge: 'مرحلة وزارية',
    level: 'المرحلة المتوسطة',
    description: 'دروس وتمارين وشروحات نموذجية لجميع مواد الصف الثالث متوسط مع المراجعات المركزة.',
    subjectsCount: 6,
    totalStudents: '32.1K',
  },
  {
    id: 'grade-5',
    name: 'الصف الخامس الإعدادي',
    shortName: 'الخامس',
    badge: 'العلمي والأدبي',
    level: 'المرحلة الإعدادية',
    description: 'الأساس المتين لمرحلة السادس، شروحات مفصلة لمواد الفيزياء والكيمياء والرياضيات.',
    subjectsCount: 6,
    totalStudents: '18.4K',
  },
  {
    id: 'grade-4',
    name: 'الصف الرابع الإعدادي',
    shortName: 'الرابع',
    badge: 'العام',
    level: 'المرحلة الإعدادية',
    description: 'بداية المرحلة الإعدادية ومقدمات المفاهيم العلمية والأدبية.',
    subjectsCount: 5,
    totalStudents: '12.6K',
  },
];

export const GRADE_6_SUBJECTS = [
  {
    id: 'biology',
    name: 'البيولوجيا',
    enName: 'Biology',
    teacher: 'أستاذ الأحياء',
    teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    iconType: 'microscope',
    color: '#00F2FE',
    glowColor: 'rgba(0, 242, 254, 0.35)',
    bgGradient: 'from-[#0d343a]/90 via-[#071f24]/90 to-[#041215]/95',
    borderColor: 'border-[#00e5ff]/50 hover:border-[#00f2fe]',
    badgeColor: 'border-[#00f2fe]/60 bg-[#00f2fe]/15 text-[#00f2fe]',
    badge: 'الفصل الثالث - التكاثر',
    currentLessonTitle: 'البيولوجيا - التكاثر في الكائنات الحية والإنسان',
    duration: '15:20 دقيقة',
    completed: 45,
    totalLessons: 24,
    lessonCountText: '24 درسًا',
    lessonData: {
      id: 'lesson-bio-ch3',
      title: 'البيولوجيا - التكاثر في الكائنات الحية والإنسان',
      subtitle: 'السادس الإعدادي - علم الأحياء',
      category: 'البيولوجيا',
      teacherName: 'أستاذ الأحياء',
      teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      teacherRole: 'مدرس المادة',
      youtubeId: '',
      duration: '15:20',
      currentTime: '03:40',
      progressPercentage: 45,
      description: 'درس تفصيلي حول التكاثر في عالم الأحياء والضفدع والإنسان، مع حل الأسئلة الوزارية والتعاليل والمقارنات النموذجية.',
      viewsCount: '15.4K',
      likesCount: 1240,
      isLiked: false,
      isBookmarked: false,
      attachments: {
        aids: {
          id: 'att-01',
          title: 'ملف عامل المعينات - ملخص البيولوجيا',
          type: 'pdf' as const,
          size: '2.4 ميجابايت',
          downloadUrl: '#',
          description: 'ملف شامل يحتوي على جميع الخرائط الذهنية والملاحظات الهامة الواردة في هذا الدرس بصيغة PDF عالية الجودة.'
        },
        psh: {
          id: 'att-02',
          title: 'حزمة التحميل الخاص (PSH) للأسئلة الوزارية',
          type: 'psh' as const,
          size: '5.8 ميجابايت',
          downloadUrl: '#',
          description: 'ملف الموارد المتقدمة (PSH) يتضمن أوراق العمل التفاعلية والتمارين التطبيقية والوزارية.'
        }
      },
      comments: []
    }
  },
  {
    id: 'physics',
    name: 'الفيزياء',
    enName: 'Physics',
    teacher: 'خالد المطيري',
    teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    iconType: 'atom',
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    bgGradient: 'from-[#11244d]/90 via-[#0a1633]/90 to-[#050c1e]/95',
    borderColor: 'border-[#3B82F6]/50 hover:border-[#60a5fa]',
    badgeColor: 'border-[#3B82F6]/60 bg-[#3B82F6]/15 text-[#60a5fa]',
    badge: 'الفصل الثاني - الحث الكهرومغناطيسي',
    currentLessonTitle: 'الفيزياء - قانون فرداي وقانون لنز',
    duration: '20:10 دقيقة',
    completed: 20,
    totalLessons: 30,
    lessonCountText: '30 درسًا',
    lessonData: {
      id: 'lesson-phys-ch2',
      title: 'الفيزياء - قانون فرداي وقانون لنز',
      subtitle: 'السادس الإعدادي - الفيزياء',
      category: 'الفيزياء',
      teacherName: 'خالد المطيري',
      teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      teacherRole: 'مدرس أول فيزياء',
      youtubeId: '',
      duration: '20:10',
      currentTime: '00:00',
      progressPercentage: 20,
      description: 'شرح تجارب فرداي وتفسير اتجاه التيار المحتث وفق قانون لنز مع حل المسائل الحسابية.',
      viewsCount: '21.5K',
      likesCount: 1680,
      isLiked: false,
      isBookmarked: false,
      attachments: {
        aids: {
          id: 'att-p1',
          title: 'ملخص التجارب والقوانين - الفصل 2',
          type: 'pdf' as const,
          size: '2.8 ميجابايت',
          downloadUrl: '#',
          description: 'رسومات التجارب الوزارية مع الأسئلة الاستنتاجية.'
        },
        psh: {
          id: 'att-p2',
          title: 'حقيبة الأسئلة الفكرية والرياضية',
          type: 'psh' as const,
          size: '5.1 ميجابايت',
          downloadUrl: '#',
          description: 'تجميع لكل الأفكار والأنشطة الفيزيائية.'
        }
      },
      comments: []
    }
  },
  {
    id: 'chemistry',
    name: 'الكيمياء',
    enName: 'Chemistry',
    teacher: 'د. أحمد العتيبي',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    iconType: 'flasks',
    color: '#D946EF',
    glowColor: 'rgba(217, 70, 239, 0.35)',
    bgGradient: 'from-[#38103c]/90 via-[#230926]/90 to-[#120414]/95',
    borderColor: 'border-[#D946EF]/50 hover:border-[#f472b6]',
    badgeColor: 'border-[#D946EF]/60 bg-[#D946EF]/15 text-[#f472b6]',
    badge: 'الفصل الثالث - الاتزان الأيوني',
    currentLessonTitle: 'الكيمياء - المحاليل المنظمة (بفر)',
    duration: '18:40 دقيقة',
    completed: 30,
    totalLessons: 28,
    lessonCountText: '28 درسًا',
    lessonData: {
      id: 'lesson-chem-ch3',
      title: 'الكيمياء - المحاليل المنظمة (بفر)',
      subtitle: 'السادس الإعدادي - الكيمياء',
      category: 'الكيمياء',
      teacherName: 'د. أحمد العتيبي',
      teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      teacherRole: 'أستاذ الكيمياء',
      youtubeId: '',
      duration: '18:40',
      currentTime: '00:00',
      progressPercentage: 30,
      description: 'فهم وتطبيق قوانين بفر المكون من مادتين وثلاث مواد وكيفية حساب مقدار التغير في الرقم الهيدروجيني.',
      viewsCount: '19.2K',
      likesCount: 1420,
      isLiked: false,
      isBookmarked: false,
      attachments: {
        aids: {
          id: 'att-c1',
          title: 'مخطط قوانين بفر والذوبانية',
          type: 'pdf' as const,
          size: '1.9 ميجابايت',
          downloadUrl: '#',
          description: 'مخطط ملون وسهل للمقارنة بين بفر الحامضي والقاعدي.'
        },
        psh: {
          id: 'att-c2',
          title: 'ملف بنك المسائل الوزارية',
          type: 'psh' as const,
          size: '4.2 ميجابايت',
          downloadUrl: '#',
          description: 'حلول نموذجية لكافة مسائل الاتزان الأيوني.'
        }
      },
      comments: []
    }
  },
  {
    id: 'mathematics',
    name: 'الرياضيات',
    enName: 'Mathematics',
    teacher: 'أ. محمود الخالدي',
    teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    iconType: 'math',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    bgGradient: 'from-[#0b283d]/90 via-[#071927]/90 to-[#030d14]/95',
    borderColor: 'border-[#06B6D4]/50 hover:border-[#22d3ee]',
    badgeColor: 'border-[#06B6D4]/60 bg-[#06B6D4]/15 text-[#22d3ee]',
    badge: 'الفصل الأول - الأعداد المركبة',
    currentLessonTitle: 'الرياضيات - مبرهنة ديموافر وتطبيقاتها',
    duration: '22:15 دقيقة',
    completed: 60,
    totalLessons: 32,
    lessonCountText: '32 درسًا',
    lessonData: {
      id: 'lesson-math-ch1',
      title: 'الرياضيات - مبرهنة ديموافر وتطبيقاتها',
      subtitle: 'السادس الإعدادي - الرياضيات',
      category: 'الرياضيات',
      teacherName: 'أ. محمود الخالدي',
      teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      teacherRole: 'مدرس أول رياضيات',
      youtubeId: '',
      duration: '22:15',
      currentTime: '05:10',
      progressPercentage: 60,
      description: 'شرح مفصل لمبرهنة ديموافر والنتيجة الخاصة بها مع حلول جميع الأسئلة الوزارية من سنة 2015 إلى 2024.',
      viewsCount: '28.9K',
      likesCount: 2150,
      isLiked: true,
      isBookmarked: true,
      attachments: {
        aids: {
          id: 'att-m1',
          title: 'ملخص قوانين الأعداد المركبة وديموافر',
          type: 'pdf' as const,
          size: '3.1 ميجابايت',
          downloadUrl: '#',
          description: 'جدول القوانين والملاحظات المهمة لحل أي مسألة في مبرهنة ديموافر.'
        },
        psh: {
          id: 'att-m2',
          title: 'دفتر الواجبات الوزارية والحلول',
          type: 'psh' as const,
          size: '6.4 ميجابايت',
          downloadUrl: '#',
          description: 'تمارين مع الحلول النموذجية خطوة بخطوة.'
        }
      },
      comments: []
    }
  },
  {
    id: 'arabic-1',
    name: 'اللغة العربية ج1',
    enName: 'Arabic Part 1',
    teacher: 'د. فاطمة الزهراء',
    teacherAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    iconType: 'bookQuill',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    bgGradient: 'from-[#3d240d]/90 via-[#271607]/90 to-[#140b03]/95',
    borderColor: 'border-[#F59E0B]/50 hover:border-[#fbbf24]',
    badgeColor: 'border-[#F59E0B]/60 bg-[#F59E0B]/15 text-[#fbbf24]',
    badge: 'قواعد اللغة - أسلوب الاستفهام والنفي',
    currentLessonTitle: 'اللغة العربية ج1 - إعراب أسماء الاستفهام',
    duration: '16:45 دقيقة',
    completed: 75,
    totalLessons: 20,
    lessonCountText: '20 درسًا',
    lessonData: {
      id: 'lesson-arabic-istifham',
      title: 'اللغة العربية ج1 - إعراب أسماء الاستفهام',
      subtitle: 'السادس الإعدادي - قواعد اللغة العربية',
      category: 'اللغة العربية ج1',
      teacherName: 'د. فاطمة الزهراء',
      teacherAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      teacherRole: 'دكتوراه في النحو واللغة',
      youtubeId: '',
      duration: '16:45',
      currentTime: '02:10',
      progressPercentage: 75,
      description: 'شرح دقيق لإعراب (مَن، ما، أي، كم) مع الشواهد القرآنية والأبيات الشعرية الوزارية.',
      viewsCount: '34.1K',
      likesCount: 2900,
      isLiked: true,
      isBookmarked: false,
      attachments: {
        aids: {
          id: 'att-ar1',
          title: 'جدول إعراب أسماء الاستفهام الشامل',
          type: 'pdf' as const,
          size: '1.7 ميجابايت',
          downloadUrl: '#',
          description: 'جدول استخراج الحالات الإعرابية السبعة بسهولة.'
        },
        psh: {
          id: 'att-ar2',
          title: 'الشواهد الوزارية والوزاريات المحلولة',
          type: 'psh' as const,
          size: '4.8 ميجابايت',
          downloadUrl: '#',
          description: 'جميع الأسئلة والأبيات الشعرية الواردة بالوزاري.'
        }
      },
      comments: []
    }
  },
  {
    id: 'arabic-2',
    name: 'اللغة العربية ج2',
    enName: 'Arabic Part 2',
    teacher: 'د. مصطفى الشمري',
    teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    iconType: 'quranBookQuill',
    color: '#EAB308',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    bgGradient: 'from-[#3a2c0c]/90 via-[#251b06]/90 to-[#120e02]/95',
    borderColor: 'border-[#EAB308]/50 hover:border-[#fde047]',
    badgeColor: 'border-[#EAB308]/60 bg-[#EAB308]/15 text-[#fde047]',
    badge: 'الأدب والنصوص والنقد',
    currentLessonTitle: 'اللغة العربية ج2 - مدرسة الإحياء والشعر الحديث',
    duration: '15:10 دقيقة',
    completed: 50,
    totalLessons: 20,
    lessonCountText: '20 درسًا',
    lessonData: {
      id: 'lesson-arabic-lit',
      title: 'اللغة العربية ج2 - مدرسة الإحياء والشعر الحديث',
      subtitle: 'السادس الإعدادي - الأدب والنصوص',
      category: 'اللغة العربية ج2',
      teacherName: 'د. مصطفى الشمري',
      teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      teacherRole: 'أستاذ الأدب العربي والبلاغة',
      youtubeId: '',
      duration: '15:10',
      currentTime: '00:00',
      progressPercentage: 50,
      description: 'شرح قصائد الشعراء والمفاهيم النقدية وأسئلة المناقشة الوزارية بدقة.',
      viewsCount: '26.4K',
      likesCount: 2100,
      isLiked: false,
      isBookmarked: false,
      attachments: {
        aids: {
          id: 'att-ar2-1',
          title: 'ملزمة الأدب والنصوص الوزارية',
          type: 'pdf' as const,
          size: '2.5 ميجابايت',
          downloadUrl: '#',
          description: 'حفظ القصائد وأسئلة حياة الشاعر والمناقشة.'
        },
        psh: {
          id: 'att-ar2-2',
          title: 'حقيبة الاختبارات الوزارية',
          type: 'psh' as const,
          size: '3.6 ميجابايت',
          downloadUrl: '#',
          description: 'اختبارات شاملة على الجزء الثاني.'
        }
      },
      comments: []
    }
  },
  {
    id: 'islamic',
    name: 'التربية الإسلامية',
    enName: 'Islamic Studies',
    teacher: 'فضيلة الشيخ أ.د. عادل النعيمي',
    teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    iconType: 'mosque',
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    bgGradient: 'from-[#0e2742]/90 via-[#091829]/90 to-[#040c14]/95',
    borderColor: 'border-[#38BDF8]/50 hover:border-[#7dd3fc]',
    badgeColor: 'border-[#38BDF8]/60 bg-[#38BDF8]/15 text-[#7dd3fc]',
    badge: 'أحكام التلاوة والآيات القرآنية',
    currentLessonTitle: 'التربية الإسلامية - أحكام النون الساكنة والتنوين',
    duration: '14:00 دقيقة',
    completed: 80,
    totalLessons: 18,
    lessonCountText: '18 درسًا',
    lessonData: {
      id: 'lesson-islamic-unit1',
      title: 'التربية الإسلامية - أحكام النون الساكنة والتنوين',
      subtitle: 'السادس الإعدادي - التربية الإسلامية',
      category: 'التربية الإسلامية',
      teacherName: 'أ.د. عادل النعيمي',
      teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      teacherRole: 'أستاذ العلوم الإسلامية والتجويد',
      youtubeId: '',
      duration: '14:00',
      currentTime: '00:00',
      progressPercentage: 80,
      description: 'شرح أحكام الإظهار، الإدغام، الإقلاب، والإخفاء مع التطبيقات العملية من الآيات القرآنية المقررة.',
      viewsCount: '31.2K',
      likesCount: 2600,
      isLiked: true,
      isBookmarked: true,
      attachments: {
        aids: {
          id: 'att-is1',
          title: 'جدول أحكام التلاوة والآيات الحفظ',
          type: 'pdf' as const,
          size: '1.5 ميجابايت',
          downloadUrl: '#',
          description: 'ملخص شامل لأحكام التلاوة والآيات والأحاديث النبوية المقررة.'
        },
        psh: {
          id: 'att-is2',
          title: 'بنك الأسئلة الوزارية وأجوبتها النموذجية',
          type: 'psh' as const,
          size: '3.9 ميجابايت',
          downloadUrl: '#',
          description: 'شروحات الأحاديث والأبحاث والتهذيب.'
        }
      },
      comments: []
    }
  },
  {
    id: 'english',
    name: 'اللغة الإنجليزية',
    enName: 'English',
    teacher: 'ليث العزاوي',
    teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    iconType: 'englishBlocks',
    color: '#FB923C',
    glowColor: 'rgba(251, 146, 60, 0.35)',
    bgGradient: 'from-[#3a1d0d]/90 via-[#261208]/90 to-[#140803]/95',
    borderColor: 'border-[#FB923C]/50 hover:border-[#fdba74]',
    badgeColor: 'border-[#FB923C]/60 bg-[#FB923C]/15 text-[#fdba74]',
    badge: 'الوحدة الأولى - Grammar & Vocab',
    currentLessonTitle: 'اللغة الإنجليزية - Past Simple vs Past Continuous',
    duration: '17:30 دقيقة',
    completed: 40,
    totalLessons: 22,
    lessonCountText: '22 درسًا',
    lessonData: {
      id: 'lesson-english-unit1',
      title: 'اللغة الإنجليزية - Past Simple vs Past Continuous',
      subtitle: 'السادس الإعدادي - اللغة الإنكليزية',
      category: 'اللغة الإنجليزية',
      teacherName: 'ليث العزاوي',
      teacherAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      teacherRole: 'مدرس أول لغة إنكليزية',
      youtubeId: '',
      duration: '17:30',
      currentTime: '00:00',
      progressPercentage: 40,
      description: 'شرح أدوات الربط (While, As, When, And) واستخدامات الماضي البسيط والمستمر مع حل الأسئلة الوزارية.',
      viewsCount: '22.8K',
      likesCount: 1850,
      isLiked: false,
      isBookmarked: false,
      attachments: {
        aids: {
          id: 'att-en1',
          title: 'ملخص قواعد الوحدة الأولى Unit 1',
          type: 'pdf' as const,
          size: '2.1 ميجابايت',
          downloadUrl: '#',
          description: 'شرح مبسط لكافة القواعد والتمارين الوزارية.'
        },
        psh: {
          id: 'att-en2',
          title: 'حقيبة القطع الاستيعابية والإنشاءات',
          type: 'psh' as const,
          size: '4.5 ميجابايت',
          downloadUrl: '#',
          description: 'إنشاءات الوحدة والقطع مع الأسئلة المكررة وزارياً.'
        }
      },
      comments: []
    }
  }
];
