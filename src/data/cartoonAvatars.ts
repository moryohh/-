export interface CartoonAvatarOption {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  unlockLevel: number;
  isFree: boolean;
}

const avatarUrl = (fileName: string) => `${import.meta.env.BASE_URL}avatars/${fileName}.png`;

/**
 * Local avatar catalogue. Level 1 contains the fruit mascots, while level 3
 * unlocks the study mascots. Future avatars can be added with a new unlockLevel.
 */
export const DEFAULT_CARTOON_AVATARS: CartoonAvatarOption[] = [
  {
    id: 'avatar-strawberry',
    name: 'الفراولة المرحة',
    category: 'شخصيات الفواكه',
    description: 'ابتسامة وطاقة جميلة لبداية الرحلة التعليمية',
    emoji: '🍓',
    bgColor: '#FEE2E2',
    borderColor: '#F43F5E',
    url: avatarUrl('avatar-strawberry'),
    unlockLevel: 1,
    isFree: true,
  },
  {
    id: 'avatar-apple',
    name: 'التفاحة النشيطة',
    category: 'شخصيات الفواكه',
    description: 'رفيقة صغيرة تحب المراجعة وحل الأسئلة',
    emoji: '🍎',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    url: avatarUrl('avatar-apple'),
    unlockLevel: 1,
    isFree: true,
  },
  {
    id: 'avatar-orange',
    name: 'البرتقالة المتفائلة',
    category: 'شخصيات الفواكه',
    description: 'حماس دافئ لكل درس وتحدٍّ جديد',
    emoji: '🍊',
    bgColor: '#FFEDD5',
    borderColor: '#F97316',
    url: avatarUrl('avatar-orange'),
    unlockLevel: 1,
    isFree: true,
  },
  {
    id: 'avatar-banana',
    name: 'الموزة المستكشفة',
    category: 'شخصيات الفواكه',
    description: 'حقيبة صغيرة وروح تحب اكتشاف المفاهيم',
    emoji: '🍌',
    bgColor: '#FEF3C7',
    borderColor: '#EAB308',
    url: avatarUrl('avatar-banana'),
    unlockLevel: 1,
    isFree: true,
  },
  {
    id: 'avatar-blueberry',
    name: 'التوتة المفكرة',
    category: 'شخصيات الفواكه',
    description: 'نظارة وقلم لتسجيل كل فكرة مهمة',
    emoji: '🫐',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
    url: avatarUrl('avatar-blueberry'),
    unlockLevel: 1,
    isFree: true,
  },
  {
    id: 'avatar-owl-scholar',
    name: 'البومة الباحثة',
    category: 'رفاق الدراسة',
    description: 'رفيقة كتب تساعدك على التركيز في الرحلة',
    emoji: '🦉',
    bgColor: '#CCFBF1',
    borderColor: '#14B8A6',
    url: avatarUrl('avatar-owl-scholar'),
    unlockLevel: 3,
    isFree: true,
  },
  {
    id: 'avatar-fox-explorer',
    name: 'الثعلب المستكشف',
    category: 'رفاق الدراسة',
    description: 'فضول وشجاعة في كل موضوع جديد',
    emoji: '🦊',
    bgColor: '#FFEDD5',
    borderColor: '#F97316',
    url: avatarUrl('avatar-fox-explorer'),
    unlockLevel: 3,
    isFree: true,
  },
  {
    id: 'avatar-panda-reader',
    name: 'الباندا القارئة',
    category: 'رفاق الدراسة',
    description: 'تحب الدفاتر والملخصات والملاحظات',
    emoji: '🐼',
    bgColor: '#CCFBF1',
    borderColor: '#0D9488',
    url: avatarUrl('avatar-panda-reader'),
    unlockLevel: 3,
    isFree: true,
  },
  {
    id: 'avatar-cat-scientist',
    name: 'القطة العالمة',
    category: 'رفاق الدراسة',
    description: 'تجارب وأسئلة علمية بروح مرحة',
    emoji: '🐱',
    bgColor: '#F3E8FF',
    borderColor: '#A855F7',
    url: avatarUrl('avatar-cat-scientist'),
    unlockLevel: 3,
    isFree: true,
  },
  {
    id: 'avatar-lion-captain',
    name: 'الأسد القائد',
    category: 'رفاق الدراسة',
    description: 'قائد شجاع يواصل حتى أصعب سؤال',
    emoji: '🦁',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    url: avatarUrl('avatar-lion-captain'),
    unlockLevel: 3,
    isFree: true,
  },
];

export const FALLBACK_DEFAULT_AVATAR = DEFAULT_CARTOON_AVATARS[0].url;
