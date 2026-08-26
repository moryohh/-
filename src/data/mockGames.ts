import { EducationalGame } from '../types';

export const MOCK_EDUCATIONAL_GAMES: Record<string, EducationalGame[]> = {
  'lesson-ai-01': [
    {
      id: 'game-1',
      lessonId: 'lesson-ai-01',
      type: 'mcq',
      title: 'تحدي المفاهيم الذكية',
      question: 'ما هو التعريف الأساسي للذكاء الاصطناعي (Artificial Intelligence)؟',
      options: [
        'أنظمة وبرامج حاسوبية تحاكي القدرات الذهنية البشرية كالتفكير والتعلم',
        'شاشة متطورة تعرض الفيديو بدقة فائقة بدون الحاجة للكهرباء',
        'تطبيق آلة حاسبة عادي ينفذ المعادلات الحسابية البسيطة',
        'سلسلة من التوصيلات الكهربائية السريعة لنقل البيانات'
      ],
      correctAnswer: 0,
      difficulty: 'سهل',
      points: 50,
      explanation: 'الذكاء الاصطناعي هو فرع من علوم الحاسوب يهتم بإنشاء أنظمة قادرة على أداء مهام تتطلب عادتاً ذكاءً بشرياً مثل التعلم والاستنتاج والتكيف.'
    },
    {
      id: 'game-2',
      lessonId: 'lesson-ai-01',
      type: 'true_false',
      title: 'اختبار صح أو خطأ',
      question: 'تعتمد الشبكات العصبية الاصطناعية (Neural Networks) في فكرتها الأساسية على محاكاة طريقة عمل الخلايا العصبية في الدماغ البشري.',
      options: ['صح (صحيحة)', 'خطأ (غير صحيحة)'],
      correctAnswer: 0,
      difficulty: 'متوسط',
      points: 50,
      explanation: 'نعم صواب! تم استلهام بنية الشبكات العصبية الاصطناعية من الخلايا العصبية في الدماغ لمعالجة البيانات المعقدة والاستنتاج.'
    },
    {
      id: 'game-3',
      lessonId: 'lesson-ai-01',
      type: 'image_choice',
      title: 'اختبار التمييز البصري',
      question: 'أي من التطبيقات التكنولوجية التالية تعتمد بشكل جوهري على نماذج الذكاء الاصطناعي والتوليد الذكي؟',
      options: [
        'توليد الفنون وتحليل الصور بالذكاء الاصطناعي',
        'الآلة الحاسبة التقليدية',
        'مكبر الصوت اليدوي',
        'ساعة الحائط الميكانيكية'
      ],
      images: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80'
      ],
      correctAnswer: 0,
      difficulty: 'متقدم',
      points: 100,
      explanation: 'توليد الصور والرؤية الحاسوبية يعدان من أبرز تطبيقات الذكاء الاصطناعي الحديثة.'
    }
  ]
};

// Return only games explicitly associated with this lesson; never show another lesson's preview.
export const getGamesForLesson = (lessonId: string): EducationalGame[] => {
  return MOCK_EDUCATIONAL_GAMES[lessonId] || [];
};
