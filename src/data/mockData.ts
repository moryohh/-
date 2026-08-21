import { TeacherStory, EducationalLesson, AppNotification, CommunityPost, CommunityStory } from '../types';
import { GRADE_6_SUBJECTS } from './mockSubjects';
import { cleanTeacherName } from '../utils/cleanTeacherName';

export const INITIAL_STORIES: TeacherStory[] = GRADE_6_SUBJECTS
  .filter((subj) => Boolean(subj.lessonData?.youtubeId && subj.lessonData.youtubeId !== '2ePf9rue1Ao'))
  .map((subj) => ({
    id: `story-${subj.id}`,
    teacherName: cleanTeacherName(subj.teacher) || subj.teacher,
    channelName: cleanTeacherName(subj.lessonData?.teacherRole) || `قناة ${subj.name}`,
    subject: subj.name,
    title: subj.lessonData?.title || subj.currentLessonTitle,
    avatar: subj.teacherAvatar,
    hasUnseen: true,
    duration: subj.duration || '15:20',
    youtubeId: subj.lessonData?.youtubeId || '',
    videoUrl: subj.lessonData?.youtubeId ? `https://www.youtube.com/watch?v=${subj.lessonData.youtubeId}` : '',
    storyImage: subj.teacherAvatar,
    textNotes: subj.lessonData?.description || `شرح درس ${subj.name} مع الأسئلة الوزارية المهمة.`,
    lessonData: subj.lessonData,
  }));

export const COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 'cs-1',
    userName: 'أحمد العتيبي',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    title: 'سؤال سريعات؟',
    hasUnseen: true,
    textNotes: 'من عنده نصيحة سريعة لتنظيم جدول المذاكرة اليومي مع الامتحانات القادمة؟'
  },
  {
    id: 'cs-2',
    userName: 'سارة الشمري',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    title: 'فكرة مراجعة💡',
    hasUnseen: true,
    textNotes: 'استخدام الخرائط الذهنية بالتقنية ساعدني جداً في حفظ المفاهيم الأساسية للفيزياء.'
  },
  {
    id: 'cs-3',
    userName: 'محمد خالد',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    title: 'تجربة دراسية',
    hasUnseen: false,
    textNotes: 'تطبيق تقنية بومودورو (25 دقيقة تركيز + 5 دقائق راحة) ضاعف تحصيلي الدراسي اليوم!'
  },
  {
    id: 'cs-4',
    userName: 'مريم القحطاني',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'ملاحظات الدرس',
    hasUnseen: false,
    textNotes: 'نشرت ملخص شامل لدرس الذكاء الاصطناعي في المنشورات، تفضلوا بتنزيله.'
  }
];

export const FEATURED_LESSON: EducationalLesson = {
  id: 'lesson-chem-ch3',
  title: 'الكيمياء - المحاليل المنظمة (بفر)',
  subtitle: 'السادس الإعدادي - العراق',
  category: 'الكيمياء',
  teacherName: 'أحمد العتيبي',
  teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  teacherRole: 'قناة الكيمياء',
  youtubeId: '',
  duration: '18:40',
  currentTime: '00:00',
  progressPercentage: 25,
  description: 'درس تفصيلي حول المحاليل المنظمة وتطبيقات بفر مع حل الأسئلة الوزارية والتعاليل والمقارنات النموذجية.',
  viewsCount: '19.2K',
  likesCount: 1420,
  isLiked: false,
  isBookmarked: false,
  attachments: {
    aids: {
      id: 'att-01',
      title: 'ملف عامل المعينات - ملخص الدرس',
      type: 'pdf',
      size: '2.4 ميجابايت',
      downloadUrl: '#',
      description: 'ملف شامل يحتوي على جميع الخرائط الذهنية والملاحظات الهامة الواردة في هذا الدرس بصيغة PDF عالية الجودة.'
    },
    psh: {
      id: 'att-02',
      title: 'حزمة التحميل الخاص (PSH)',
      type: 'psh',
      size: '5.8 ميجابايت',
      downloadUrl: '#',
      description: 'ملف الموارد المتقدمة (PSH) يتضمن أوراق العمل التفاعلية والتمارين التطبيقية الخاصة بهذا الفصل.'
    }
  },
  comments: [
    {
      id: 'c1',
      userName: 'عمر القحطاني',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'منذ ساعتين',
      text: 'شرح ممتااااز جداً يا أستاذة! أعجبني تبسيط مفهوم الشبكات العصبية في بداية الفيديو.',
      likes: 18,
      isLiked: true
    },
    {
      id: 'c2',
      userName: 'ريم الحارثي',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'منذ 4 ساعات',
      text: 'تم تحميل ملف المعينات وبدأت في دراسته، شكراً جزيلاً منصة نحن معك ❤️',
      likes: 9,
      isLiked: false
    },
    {
      id: 'c3',
      userName: 'عبدالعزيز العنزي',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      timeAgo: 'منذ يوم',
      text: 'هل يوجد جزء ثانٍ يتحدث عن النماذج التوليدية مثل ChatGPT؟',
      likes: 5,
      isLiked: false
    }
  ]
};

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    userName: 'أحمد العتيبي',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    timeAgo: 'منذ 30 دقيقة',
    type: 'question',
    content: 'يا شباب، شنو أفضل طريقة لحفظ قوانين الفيزياء؟ أحس بعض القوانين تتشابه وتلخبط أثناء حل المسائل!',
    likesCount: 24,
    commentsCount: 8,
    isLiked: false,
    comments: [
      {
        id: 'cc-1',
        userName: 'سارة الشمري',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        timeAgo: 'منذ 20 دقيقة',
        text: 'أنصحك برسم مثلث القوانين لكل صيغة رياضية، وتربط كل رمز بوحدة القياس الخاصة به في جدول مصغر.',
        likes: 12,
        isLiked: true
      },
      {
        id: 'cc-2',
        userName: 'محمد خالد',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
        timeAgo: 'منذ 15 دقيقة',
        text: 'حل التمارين مباشرة بعد حفظ القانون يثبت المعاني في الذهن أسرع بكثير من الحفظ التكراري.',
        likes: 7,
        isLiked: false
      }
    ]
  },
  {
    id: 'post-2',
    userName: 'سارة الشمري',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    timeAgo: 'منذ ساعتين',
    type: 'question',
    content: 'عندي سؤال بهذا الدرس، ممكن أحد يشرح لي الفرق بين التعلم الخاضع للإشراف والتعلم الذاتي في الذكاء الاصطناعي؟',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    likesCount: 18,
    commentsCount: 5,
    isLiked: true,
    comments: [
      {
        id: 'cc-3',
        userName: 'عبدالله العنزي',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        timeAgo: 'منذ ساعة',
        text: 'التعلم الخاضع للإشراف يستخدم بيانات مصنفة مسبقاً (Supervised Data)، بينما الذاتي يتعلم من الأنماط مباشرة بدون تسميات.',
        likes: 10,
        isLiked: true
      }
    ]
  },
  {
    id: 'post-3',
    userName: 'محمد خالد',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    timeAgo: 'منذ 5 ساعات',
    type: 'summary',
    content: 'هذا الشرح ساعدني أفهم الموضوع بشكل أسهل. عملت ملخصاً بخريطة ذهنية بسيطة وشاملة لفصل التقنية اليوم 📚',
    attachmentName: 'ملخص_مفاهيم_الذكاء_الاصطناعي.pdf',
    likesCount: 42,
    commentsCount: 12,
    isLiked: false,
    comments: [
      {
        id: 'cc-4',
        userName: 'نورة المطيري',
        userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        timeAgo: 'منذ 3 ساعات',
        text: 'جزاك الله خيراً يا محمد! الملخص مرتب ومفيد جداً.',
        likes: 15,
        isLiked: false
      }
    ]
  },
  {
    id: 'post-4',
    userName: 'مريم القحطاني',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    timeAgo: 'منذ يوم',
    type: 'discussion',
    content: 'منو جرب شرح الأستاذة سارة الشمري لهذا الفصل؟ شنو رأيكم في أسلوب التطبيق والتدرج بالشرح؟',
    likesCount: 31,
    commentsCount: 9,
    isLiked: false,
    comments: [
      {
        id: 'cc-5',
        userName: 'علي المري',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        timeAgo: 'منذ 18 ساعة',
        text: 'شرحها من أفضل الشروحات في المنصة بلا منازع، الأفكار مرتبة والأمثلة واقعية جداً.',
        likes: 14,
        isLiked: true
      }
    ]
  }
];

export const NOTIFICATIONS_DATA: AppNotification[] = [
  {
    id: 'n1',
    title: 'تفاعل جديد في المجتمع',
    message: 'أحمد أعجب بمنشورك حول طرق مراجعة الرياضيات.',
    time: 'منذ 10 دقائق',
    isRead: false,
    type: 'community'
  },
  {
    id: 'n2',
    title: 'تعليق جديد على سؤالك 💬',
    message: 'محمد علّق على سؤالك في الفيزياء: "أنصحك برسم مثلث القوانين..."',
    time: 'منذ 25 دقيقة',
    isRead: false,
    type: 'community'
  },
  {
    id: 'n3',
    title: 'رد على استفسارك 🌸',
    message: 'سارة ردت على استفسارك حول شرح الذكاء الاصطناعي.',
    time: 'منذ ساعة',
    isRead: false,
    type: 'community'
  },
  {
    id: 'n4',
    title: 'تم إضافة ملخص جديد!',
    message: 'قام أ. سارة الشمري بنشر ملف المعينات لدرس فهم الذكاء الاصطناعي.',
    time: 'منذ 3 ساعات',
    isRead: true,
    type: 'attachment'
  },
  {
    id: 'n5',
    title: 'قصة جديدة متاحة 🎥',
    message: 'شاهد استعراض د. أحمد العتيبي لأدوات الذكاء الاصطناعي التفاعلية.',
    time: 'منذ يوم',
    isRead: true,
    type: 'lesson'
  }
];

