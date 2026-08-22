export interface CartoonAvatarOption {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
}

// 4 Distinctive Duolingo-style Cartoon Avatars (Fruits & Animated Mascot Animals)
export const DEFAULT_CARTOON_AVATARS: CartoonAvatarOption[] = [
  {
    id: 'avatar-owl',
    name: 'الصقر الأكاديمي 🦉',
    category: 'شخصية قيادية',
    description: 'رمز الحكمة والتركيز العالي في الامتحانات',
    emoji: '🦉',
    bgColor: '#10B981',
    borderColor: '#059669',
    url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=AcademicHeroOwl&backgroundColor=b6e3f4,c0aede,d1d4f9',
  },
  {
    id: 'avatar-lemon',
    name: 'الليمونة الذكية 🍋',
    category: 'فاكهة دراسية نشيطة',
    description: 'طاقة حيوية وفهم سريع لكل المفاهيم الصعبة',
    emoji: '🍋',
    bgColor: '#F59E0B',
    borderColor: '#D97706',
    url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=SmartCitrusLemon&backgroundColor=ffd5dc,ffdfbf',
  },
  {
    id: 'avatar-apple',
    name: 'التفاحة العبقرية 🍎',
    category: 'فاكهة التفوق',
    description: 'شغف المعرفة وحل المسائل الوزارية بامتياز',
    emoji: '🍎',
    bgColor: '#EF4444',
    borderColor: '#DC2626',
    url: 'https://api.dicebear.com/7.x/shapes/svg?seed=GeniusAppleStudent&backgroundColor=ffadad,ffd6a5',
  },
  {
    id: 'avatar-fox',
    name: 'الثعلب الفضائي 🦊',
    category: 'مستكشف مبتكر',
    description: 'دهاء وسرعة بديهة في حل الألغاز والألعاب التعليمية',
    emoji: '🦊',
    bgColor: '#8B5CF6',
    borderColor: '#7C3AED',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AstroFoxGenius&backgroundColor=d1d4f9,ffd5dc',
  },
];

export const FALLBACK_DEFAULT_AVATAR = DEFAULT_CARTOON_AVATARS[0].url;
