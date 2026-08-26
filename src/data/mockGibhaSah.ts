export interface GibhaSahCard {
  id: number;
  number: number;
  label: string;
  sublabel?: string;
  badge?: string;
  iconType?: string;
  image?: string;
}

export interface GibhaSahQuestion {
  id: string;
  questionNumber: number;
  question: string;
  correctCardNumber: number; // 1 to 10
  explanation: string;
  points: number;
  hint?: string;
  /** Internal answer label used when rebuilding a fresh round. */
  answerLabel?: string;
}

export interface GibhaSahGameConfig {
  lessonId: string;
  subject: string;
  title: string;
  subtitle: string;
  mode: 'cards_10' | 'visual_4';
  cards: GibhaSahCard[];
  questions: GibhaSahQuestion[];
  /** Full lesson-file pool used to build a fresh non-repeating round. */
  questionPool?: GibhaSahQuestion[];
}

export const GIBHA_SAH_GAMES: Record<string, GibhaSahGameConfig> = {
  // 1. البيولوجيا والأحياء - شبكة البطاقات العلمية الـ 12
  'lesson-bio-ch3': {
    lessonId: 'lesson-bio-ch3',
    subject: 'البيولوجيا والأحياء',
    title: 'جيبها صح - التكاثر والأحياء التفاعلية',
    subtitle: 'تحدي تفريغ وإسقاط البطاقات العلمية الـ 12',
    mode: 'cards_10',
    cards: [
      { id: 1, number: 1, label: 'مملكة الطليعيات', sublabel: 'كائنات حقيقية النواة بسيطة', badge: 'تصنيف علمي' },
      { id: 2, number: 2, label: 'الخميرة', sublabel: 'فطريات وحيدة الخلية', badge: 'فطريات' },
      { id: 3, number: 3, label: 'الجهاز العصبي العُقدي', sublabel: 'حبال عصبية وعقد متسلسلة', badge: 'أجهزة حيوية' },
      { id: 4, number: 4, label: 'التكاثر العذري', sublabel: 'نمو بويضة بدون إخصاب', badge: 'تكاثر لاجنسي' },
      { id: 5, number: 5, label: 'الاسم العلمي ذو الشقين', sublabel: 'جنس + نوع بالحروف اللاتينية', badge: 'تسمية ثنائية' },
      { id: 6, number: 6, label: 'شعبة عاريات البذور', sublabel: 'مخاريط بدون غلاف ثمري', badge: 'نباتات وعائية' },
      { id: 7, number: 7, label: 'ذات فلقتين', sublabel: 'أوراق معرقة شبكياً وحزمتين', badge: 'مغطاة البذور' },
      { id: 8, number: 8, label: 'شعبة الحلقيات', sublabel: 'ديدان مقسمة لجسم حلقي', badge: 'شعبة حيوانية' },
      { id: 9, number: 9, label: 'التماثل الشعاعي', sublabel: 'تقسيم الجسم عبر محاور متعددة', badge: 'خصائص الجسم' },
      { id: 10, number: 10, label: 'الإسفنجيات', sublabel: 'أبسط الحيوانات عديمة الأنسجة', badge: 'حيوانات بدائية' },
      { id: 11, number: 11, label: 'الخلايا البيضية الثانوية', sublabel: 'ناتج الانقسام الاختزالي الأول', badge: 'أمشاج أنثوية' },
      { id: 12, number: 12, label: 'خلايا لايدج البينية', sublabel: 'إفراز هرمون التستوستيرون', badge: 'غدد وأنسجة' }
    ],
    questions: [
      {
        id: 'gs-bio-1',
        questionNumber: 1,
        question: 'كائنات حقيقية النواة وحيدة الخلية أو بسيطة التركيب كالأميبا والبراميسيوم؟',
        correctCardNumber: 1,
        explanation: 'الإجابة هي بطاقة (1): مملكة الطليعيات (Protista).',
        points: 100
      },
      {
        id: 'gs-bio-2',
        questionNumber: 2,
        question: 'فطر وحيد الخلية له أهمية اقتصادية بالغة في صناعة الخبز وتخمير السكريات؟',
        correctCardNumber: 2,
        explanation: 'الإجابة هي بطاقة (2): الخميرة.',
        points: 100
      },
      {
        id: 'gs-bio-3',
        questionNumber: 3,
        question: 'جهاز عصبي مكون من حبلين بطنيين وعقد متصلة يظهر في ديدان الأرض والمفصليات؟',
        correctCardNumber: 3,
        explanation: 'الإجابة هي بطاقة (3): الجهاز العصبي العُقدي.',
        points: 100
      },
      {
        id: 'gs-bio-4',
        questionNumber: 4,
        question: 'إنتاج أفراد جديدة من بيوض غير مخصبة تماماً كما يحدث في ذكور نحل العسل؟',
        correctCardNumber: 4,
        explanation: 'الإجابة هي بطاقة (4): التكاثر العذري.',
        points: 100
      },
      {
        id: 'gs-bio-5',
        questionNumber: 5,
        question: 'نظام وضعه العالم كارل لينيوس يتألف من اسم الجنس يليه اسم النوع باللاتينية؟',
        correctCardNumber: 5,
        explanation: 'الإجابة هي بطاقة (5): الاسم العلمي ذو الشقين (Binomial Nomenclature).',
        points: 100
      },
      {
        id: 'gs-bio-6',
        questionNumber: 6,
        question: 'نباتات بذرية لا تكون أزهاراً وتوجد بذورها مكشوفة داخل مخاريط كالصنوبر؟',
        correctCardNumber: 6,
        explanation: 'الإجابة هي بطاقة (6): شعبة عاريات البذور (Gymnosperms).',
        points: 100
      },
      {
        id: 'gs-bio-7',
        questionNumber: 7,
        question: 'نباتات زهرية تحتوي بذرتها على فلقتين وتتميز أوراقها بتعرق شبكي وجذور وتدية؟',
        correctCardNumber: 7,
        explanation: 'الإجابة هي بطاقة (7): نباتات ذات فلقتين (Dicotyledons).',
        points: 100
      },
      {
        id: 'gs-bio-8',
        questionNumber: 8,
        question: 'شعبة حيوانية تمتاز أجسامها بأنها مقسمة إلى حلقات متتالية متماثلة كدودة الأرض والعلق؟',
        correctCardNumber: 8,
        explanation: 'الإجابة هي بطاقة (8): شعبة الحلقيات (Annelida).',
        points: 100
      },
      {
        id: 'gs-bio-9',
        questionNumber: 9,
        question: 'نوع من تماثل الجسم يتيح تقسيمه إلى نصفين متطابقين عبر أي محور يمر بالمركز كقنديل البحر؟',
        correctCardNumber: 9,
        explanation: 'الإجابة هي بطاقة (9): التماثل الشعاعي (Radial Symmetry).',
        points: 100
      },
      {
        id: 'gs-bio-10',
        questionNumber: 10,
        question: 'أبسط الكائنات الحيوانية، عديمة الأنسجة الحقيقية وتعتمد على الترشيح والتغذية الجوفية؟',
        correctCardNumber: 10,
        explanation: 'الإجابة هي بطاقة (10): الإسفنجيات (Porifera).',
        points: 100
      },
      {
        id: 'gs-bio-11',
        questionNumber: 11,
        question: 'الخلية الناتجة عن الانقسام الاختزالي الأول في عملية تكوين البيوض وتحتوي على مجموعة (1N)؟',
        correctCardNumber: 11,
        explanation: 'الإجابة هي بطاقة (11): الخلايا البيضية الثانوية.',
        points: 100
      },
      {
        id: 'gs-bio-12',
        questionNumber: 12,
        question: 'خلايا متخصصة تقع في النسيج البيني للخصية تفرز الهرمونات الذكرية (التستوستيرون)؟',
        correctCardNumber: 12,
        explanation: 'الإجابة هي بطاقة (12): خلايا لايدج البينية (Leydig Cells).',
        points: 100
      }
    ]
  },

  // 2. الفيزياء - الحث الكهرومغناطيسي
  'lesson-phys-ch2': {
    lessonId: 'lesson-phys-ch2',
    subject: 'الفيزياء',
    title: 'جيبها صح - فيزياء الحث الكهرومغناطيسي',
    subtitle: 'تحدي تفريغ شبكة المفاهيم والوحدات الفيزيائية',
    mode: 'cards_10',
    cards: [
      { id: 1, number: 1, label: 'قانون لنز', sublabel: 'معاكسة السبب المولد للتيار المحتث', badge: 'قانون' },
      { id: 2, number: 2, label: 'الويبر (Weber)', sublabel: 'وحدة قياس الفيض المغناطيسي', badge: 'وحدة قياس' },
      { id: 3, number: 3, label: 'التيارات الدوامة', sublabel: 'تيارات محتثة في الصفائح الموصلة', badge: 'ظاهرة حث' },
      { id: 4, number: 4, label: 'الهنري (Henry)', sublabel: 'وحدة معامل الحث الذاتي', badge: 'وحدة قياس' },
      { id: 5, number: 5, label: 'قانون فرداي', sublabel: 'القوة الدافعة الكهربائية الحركية', badge: 'قانون رئيسي' },
      { id: 6, number: 6, label: 'التسلا (Tesla)', sublabel: 'وحدة كثافة الفيض المغناطيسي', badge: 'وحدة قياس' },
      { id: 7, number: 7, label: 'الحث المتبادل', sublabel: 'تأثير ملفين متجاورين أو متداخلين', badge: 'ظاهرة حث' },
      { id: 8, number: 8, label: 'الطاقة المغناطيسية المختزنة', sublabel: 'تتناسب مع مربع التيار (1/2 L I²)', badge: 'معادلة طاقة' },
      { id: 9, number: 9, label: 'المولد الكهربائي', sublabel: 'تحويل الطاقة الحركية إلى كهربائية', badge: 'جهاز تطبيقي' },
      { id: 10, number: 10, label: 'المحول الكهربائي', sublabel: 'رفع أو خفض الفولتية المتناوبة', badge: 'جهاز تطبيقي' },
      { id: 11, number: 11, label: 'الفولت (Volt)', sublabel: 'وحدة القوة الدافعة الكهربائية المحتثة', badge: 'وحدة قياس' },
      { id: 12, number: 12, label: 'ظاهرة الحث الذاتي', sublabel: 'توليد قوة دافعة في نفس الملف', badge: 'ظاهرة حث' }
    ],
    questions: [
      {
        id: 'gs-phys-1',
        questionNumber: 1,
        question: 'قانون ينص على أن اتجاه التيار المحتث يولد مجالاً يعاكس الفيض المغناطيسي المسبب له؟',
        correctCardNumber: 1,
        explanation: 'الإجابة هي بطاقة (1): قانون لنز.',
        points: 100
      },
      {
        id: 'gs-phys-2',
        questionNumber: 2,
        question: 'ما هي وحدة قياس الفيض المغناطيسي (ΦB) في النظام الدولي للوحدات؟',
        correctCardNumber: 2,
        explanation: 'الإجابة هي بطاقة (2): الويبر (Weber).',
        points: 100
      },
      {
        id: 'gs-phys-3',
        questionNumber: 3,
        question: 'تيارات كهربائية دائرية مغلقة تتولد داخل الصفائح الموصلة وتستخدم في مكابح القطارات؟',
        correctCardNumber: 3,
        explanation: 'الإجابة هي بطاقة (3): التيارات الدوامة (Eddy Currents).',
        points: 100
      },
      {
        id: 'gs-phys-4',
        questionNumber: 4,
        question: 'ما هي الوحدة المستخدمة لقياس معامل الحث الذاتي (L) والحث المتبادل (M)؟',
        correctCardNumber: 4,
        explanation: 'الإجابة هي بطاقة (4): الهنري (Henry).',
        points: 100
      },
      {
        id: 'gs-phys-5',
        questionNumber: 5,
        question: 'ينص على أن مقدار القوة الدافعة الكهربائية المحتثة يتناسب طردياً مع المعدل الزمني لتغير الفيض؟',
        correctCardNumber: 5,
        explanation: 'الإجابة هي بطاقة (5): قانون فرداي في الحث الكهرومغناطيسي.',
        points: 100
      },
      {
        id: 'gs-phys-6',
        questionNumber: 6,
        question: 'وحدة قياس شدة أو كثافة الفيض المغناطيسي (B) وتساوي ويبر لكل متر مربع؟',
        correctCardNumber: 6,
        explanation: 'الإجابة هي بطاقة (6): التسلا (Tesla).',
        points: 100
      },
      {
        id: 'gs-phys-7',
        questionNumber: 7,
        question: 'توليد قوة دافعة كهربائية محتثة في ملف ثانوي نتيجة تغير التيار المنساب في ملف ابتدائي مجاور؟',
        correctCardNumber: 7,
        explanation: 'الإجابة هي بطاقة (7): الحث المتبادل.',
        points: 100
      },
      {
        id: 'gs-phys-8',
        questionNumber: 8,
        question: 'كمية فيزيائية تقاس بالجول وتختزن في المجال المغناطيسي للمحث وفق العلاقة 1/2 L I²؟',
        correctCardNumber: 8,
        explanation: 'الإجابة هي بطاقة (8): الطاقة المغناطيسية المختزنة.',
        points: 100
      },
      {
        id: 'gs-phys-9',
        questionNumber: 9,
        question: 'جهاز كهروميكانيكي يحول الطاقة الميكانيكية الحركية إلى طاقة كهربائية بتدوير ملف في مجال مغناطيسي؟',
        correctCardNumber: 9,
        explanation: 'الإجابة هي بطاقة (9): المولد الكهربائي (Dynamo).',
        points: 100
      },
      {
        id: 'gs-phys-10',
        questionNumber: 10,
        question: 'جهاز كهرومغناطيسي ساكن يعمل على رفع أو خفض الجهد المتناوب بكفاءة عالية؟',
        correctCardNumber: 10,
        explanation: 'الإجابة هي بطاقة (10): المحول الكهربائي.',
        points: 100
      },
      {
        id: 'gs-phys-11',
        questionNumber: 11,
        question: 'وحدة قياس فرق الجهد والقوة الدافعة الكهربائية المحتثة (emf)؟',
        correctCardNumber: 11,
        explanation: 'الإجابة هي بطاقة (11): الفولت (Volt).',
        points: 100
      },
      {
        id: 'gs-phys-12',
        questionNumber: 12,
        question: 'عملية توليد قوة دافعة كهربائية محتثة في نفس الدائرة الكهربائية أو الملف عند تغير تياره؟',
        correctCardNumber: 12,
        explanation: 'الإجابة هي بطاقة (12): ظاهرة الحث الذاتي.',
        points: 100
      }
    ]
  },

  // 3. اللغة العربية - إعراب وأدوات الاستفهام
  'lesson-ar-g1': {
    lessonId: 'lesson-ar-g1',
    subject: 'اللغة العربية',
    title: 'جيبها صح - قواعد واستفهام اللغة العربية',
    subtitle: 'تحدي تفريغ شبكة أدوات الاستفهام ودلالاتها',
    mode: 'cards_10',
    cards: [
      { id: 1, number: 1, label: 'مَنْ / مَنْ ذا', sublabel: 'للعاقل وتُعرب بحسب ما يليها', badge: 'أداة استفهام' },
      { id: 2, number: 2, label: 'ما / ماذا', sublabel: 'لغير العاقل وتُحذف ألفها مع الجر', badge: 'أداة استفهام' },
      { id: 3, number: 3, label: 'متى', sublabel: 'للزمان الماضي والمستقبل', badge: 'أداة استفهام' },
      { id: 4, number: 4, label: 'أيّانَ', sublabel: 'للزمان المستقبل فقط وتفيد التهويل', badge: 'أداة استفهام' },
      { id: 5, number: 5, label: 'أيْنَ', sublabel: 'للمكان وتُعرب مفعولاً فيه ظرف مكان', badge: 'أداة استفهام' },
      { id: 6, number: 6, label: 'أنّى', sublabel: 'بمعنى (من أين) أو (كيف) أو (متى)', badge: 'أداة استفهام' },
      { id: 7, number: 7, label: 'كَيْفَ', sublabel: 'للحال وتُعرب حالاً أو خبراً مقدماً', badge: 'أداة استفهام' },
      { id: 8, number: 8, label: 'كَمْ الاستفهامية', sublabel: 'للعدد وتمييزها مفرد منصوب', badge: 'أداة استفهام' },
      { id: 9, number: 9, label: 'أيّ', sublabel: 'الاسم الوحيد المعرب بحركات ظاهرة', badge: 'أداة استفهام' },
      { id: 10, number: 10, label: 'الهمزة وهل', sublabel: 'حرفان لا محل لهما من الإعراب', badge: 'حرفا استفهام' },
      { id: 11, number: 11, label: 'الاستفهام المجازي', sublabel: 'يخرج للنفي الضمني أو التعجب', badge: 'نوع بلاغي' },
      { id: 12, number: 12, label: 'إعراب مبتدأ', sublabel: 'إذا تلا اسم الذات فعل لازم أو متعدٍّ استوفى', badge: 'موقع إعرابي' }
    ],
    questions: [
      {
        id: 'gs-ar-1',
        questionNumber: 1,
        question: 'اسم استفهام يستفهم به عن الذات العاقلة ويُعرب مبتدأ أو مفعولاً به بحسب ما يليه؟',
        correctCardNumber: 1,
        explanation: 'الإجابة هي بطاقة (1): "مَنْ / مَنْ ذا".',
        points: 100
      },
      {
        id: 'gs-ar-2',
        questionNumber: 2,
        question: 'اسم استفهام يستفهم به عن غير العاقل وتُحذف ألفه وجوباً إذا سُبق بحرف جر (مثل: عَمَّ، لِمَ)؟',
        correctCardNumber: 2,
        explanation: 'الإجابة هي بطاقة (2): "ما / ماذا".',
        points: 100
      },
      {
        id: 'gs-ar-3',
        questionNumber: 3,
        question: 'اسم استفهام يدل على الزمان الماضي والمستقبل على حد سواء؟',
        correctCardNumber: 3,
        explanation: 'الإجابة هي بطاقة (3): "متى".',
        points: 100
      },
      {
        id: 'gs-ar-4',
        questionNumber: 4,
        question: 'اسم استفهام يفيد الزمان المستقبل حصراً ويأتي في مواضع التهويل والتعظيم في القرآن؟',
        correctCardNumber: 4,
        explanation: 'الإجابة هي بطاقة (4): "أيّانَ".',
        points: 100
      },
      {
        id: 'gs-ar-5',
        questionNumber: 5,
        question: 'اسم استفهام يدل على المكان ويُعرب مفعولاً فيه ظرف مكان إذا تلاه فعل تام؟',
        correctCardNumber: 5,
        explanation: 'الإجابة هي بطاقة (5): "أيْنَ".',
        points: 100
      },
      {
        id: 'gs-ar-6',
        questionNumber: 6,
        question: 'أداة استفهام تأتي بعدة معانٍ بحسب سياق الجملة: بمعنى (من أين) أو (كيف) أو (متى)؟',
        correctCardNumber: 6,
        explanation: 'الإجابة هي بطاقة (6): "أنّى".',
        points: 100
      },
      {
        id: 'gs-ar-7',
        questionNumber: 7,
        question: 'اسم استفهام مبني يدل على الحال ويُعرب في محل نصب حال إذا تلاه فعل تام؟',
        correctCardNumber: 7,
        explanation: 'الإجابة هي بطاقة (7): "كَيْفَ".',
        points: 100
      },
      {
        id: 'gs-ar-8',
        questionNumber: 8,
        question: 'أداة تدل على العدد ويشترط في تمييزها أن يكون مفرداً منصوباً دائماً؟',
        correctCardNumber: 8,
        explanation: 'الإجابة هي بطاقة (8): "كَمْ الاستفهامية".',
        points: 100
      },
      {
        id: 'gs-ar-9',
        questionNumber: 9,
        question: 'الأداة الوحيدة بين أسماء الاستفهام التي تكون مُعربة وتظهر عليها علامات الإعراب الثلاث؟',
        correctCardNumber: 9,
        explanation: 'الإجابة هي بطاقة (9): "أيّ".',
        points: 100
      },
      {
        id: 'gs-ar-10',
        questionNumber: 10,
        question: 'أداتان من أدوات الاستفهام تُصنفان على أنهما حرفان لا محل لهما من الإعراب؟',
        correctCardNumber: 10,
        explanation: 'الإجابة هي بطاقة (10): "الهمزة وهل".',
        points: 100
      },
      {
        id: 'gs-ar-11',
        questionNumber: 11,
        question: 'استفهام لا يُراد به جواب لمعرفة شيء مجهول وإنما يخرج لمعاني بلاغية كالنفي والتعجب؟',
        correctCardNumber: 11,
        explanation: 'الإجابة هي بطاقة (11): الاستفهام المجازي.',
        points: 100
      },
      {
        id: 'gs-ar-12',
        questionNumber: 12,
        question: 'الموقع الإعرابي لأسماء الذات (من، ما) إذا تلاها اسم نكرة أو شبه جملة أو فعل لازم؟',
        correctCardNumber: 12,
        explanation: 'الإجابة هي بطاقة (12): إعراب مبتدأ.',
        points: 100
      }
    ]
  },

  // 4. الرياضيات - مبرهنة ديموافر والأعداد المركبة
  'lesson-math-ch1': {
    lessonId: 'lesson-math-ch1',
    subject: 'الرياضيات',
    title: 'جيبها صح - مبرهنة ديموافر والأعداد المركبة',
    subtitle: 'تحدي تفريغ بطاقات الأعداد المركبة والتحليل الرياضي',
    mode: 'cards_10',
    cards: [
      { id: 1, number: 1, label: 'مبرهنة ديموافر', sublabel: '[cos θ + i sin θ]ⁿ = cos(nθ) + i sin(nθ)', badge: 'مبرهنة رياضية' },
      { id: 2, number: 2, label: 'الوحدة التخيلية (i)', sublabel: 'i² = -1 , i⁴ = 1', badge: 'عنصر أساسي' },
      { id: 3, number: 3, label: 'المقياس r = |z|', sublabel: '√(x² + y²)', badge: 'صيغة قياس' },
      { id: 4, number: 4, label: 'السعة الأساسية arg(z)', sublabel: 'الزاوية θ في النطاق [0, 2π)', badge: 'صيغة زاوية' },
      { id: 5, number: 5, label: 'مرافق العدد المركب (z̄)', sublabel: 'تغيير إشارة الجزء التخيلي فقط', badge: 'علاقة جبرية' },
      { id: 6, number: 6, label: 'الصيغة القطبية', sublabel: 'z = r (cos θ + i sin θ)', badge: 'صيغة تمثيل' },
      { id: 7, number: 7, label: 'الجذور التكعيبية للواحد', sublabel: '1 + ω + ω² = 0', badge: 'خواص أوميغا' },
      { id: 8, number: 8, label: 'النظير الضربي (1/z)', sublabel: 'z̄ / |z|²', badge: 'عملية عكسية' },
      { id: 9, number: 9, label: 'نتيجة ديموافر', sublabel: 'حساب الجذور النونية z^(1/n)', badge: 'قانون جذور' },
      { id: 10, number: 10, label: 'شكل آرجاند', sublabel: 'تمثيل الأعداد المركبة بالمستوى الإحداثي', badge: 'تمثيل بياني' },
      { id: 11, number: 11, label: 'الصيغة الديكارتية', sublabel: 'z = a + b i', badge: 'صيغة قياسية' },
      { id: 12, number: 12, label: 'تكوين المعادلة التربيعية', sublabel: 'x² - (مجموع الجذرين)x + (حاصل ضربهما) = 0', badge: 'معادلات جبرية' }
    ],
    questions: [
      {
        id: 'gs-math-1',
        questionNumber: 1,
        question: 'المبرهنة التي تنص على أن: [cos θ + i sin θ]ⁿ = cos(nθ) + i sin(nθ)؟',
        correctCardNumber: 1,
        explanation: 'الإجابة هي بطاقة (1): مبرهنة ديموافر.',
        points: 100
      },
      {
        id: 'gs-math-2',
        questionNumber: 2,
        question: 'قيمة رياضية ينص تعريفها على أن مربعها يساوي (-1) وقوتها الرابعة تساوي 1؟',
        correctCardNumber: 2,
        explanation: 'الإجابة هي بطاقة (2): الوحدة التخيلية (i).',
        points: 100
      },
      {
        id: 'gs-math-3',
        questionNumber: 3,
        question: 'المسافة بين نقطة العدد المركب ونقطة الأصل وتُحسب بالعلاقة √(x² + y²)؟',
        correctCardNumber: 3,
        explanation: 'الإجابة هي بطاقة (3): المقياس r = |z|.',
        points: 100
      },
      {
        id: 'gs-math-4',
        questionNumber: 4,
        question: 'الزاوية الأساسية θ التي يصنعها المتجه مع الاتجاه الموجب لمحور السينات [0, 2π)؟',
        correctCardNumber: 4,
        explanation: 'الإجابة هي بطاقة (4): السعة الأساسية arg(z).',
        points: 100
      },
      {
        id: 'gs-math-5',
        questionNumber: 5,
        question: 'ينتج بتغيير إشارة الجزء التخيلي فقط للعدد المركب a+bi ليكون a-bi؟',
        correctCardNumber: 5,
        explanation: 'الإجابة هي بطاقة (5): مرافق العدد المركب (z̄).',
        points: 100
      },
      {
        id: 'gs-math-6',
        questionNumber: 6,
        question: 'تمثيل العدد المركب بدلالة مقياسه وسعته z = r(cos θ + i sin θ)؟',
        correctCardNumber: 6,
        explanation: 'الإجابة هي بطاقة (6): الصيغة القطبية.',
        points: 100
      },
      {
        id: 'gs-math-7',
        questionNumber: 7,
        question: 'قيم مركبة تحقق العلاقة الهامة 1 + ω + ω² = 0 و ω³ = 1؟',
        correctCardNumber: 7,
        explanation: 'الإجابة هي بطاقة (7): الجذور التكعيبية للواحد الصحيح (أوميغا).',
        points: 100
      },
      {
        id: 'gs-math-8',
        questionNumber: 8,
        question: 'مقلوب العدد المركب (1/z) الذي يحقق ضربه بالعدد الأصلي ليعطي المحايد الضربي 1؟',
        correctCardNumber: 8,
        explanation: 'الإجابة هي بطاقة (8): النظير الضربي (1/z).',
        points: 100
      },
      {
        id: 'gs-math-9',
        questionNumber: 9,
        question: 'صيغة تستخدم خصيصاً لإيجاد الجذور النونية المختلفة z^(1/n) للأعداد المركبة؟',
        correctCardNumber: 9,
        explanation: 'الإجابة هي بطاقة (9): نتيجة مبرهنة ديموافر.',
        points: 100
      },
      {
        id: 'gs-math-10',
        questionNumber: 10,
        question: 'المخطط الهندسي لتمثيل الأعداد المركبة كنقاط (x, y) في المستوى الإحداثي؟',
        correctCardNumber: 10,
        explanation: 'الإجابة هي بطاقة (10): شكل آرجاند.',
        points: 100
      },
      {
        id: 'gs-math-11',
        questionNumber: 11,
        question: 'الشكل الجبري القياسي لكتابة أي عدد مركب في صورة z = a + bi؟',
        correctCardNumber: 11,
        explanation: 'الإجابة هي بطاقة (11): الصيغة الديكارتية (العادية).',
        points: 100
      },
      {
        id: 'gs-math-12',
        questionNumber: 12,
        question: 'قانون إيجاد المعادلة: x² - (مجموع الجذرين)x + (حاصل ضربهما) = 0؟',
        correctCardNumber: 12,
        explanation: 'الإجابة هي بطاقة (12): تكوين المعادلة التربيعية.',
        points: 100
      }
    ]
  },

  // 5. الوضع الثقافي العام / العواصم والمعلومات التفاعلية
  'general-culture': {
    lessonId: 'general-culture',
    subject: 'الثقافة العامة والتحديات',
    title: 'جيبها صح - تحدي العواصم والمدن العالمية',
    subtitle: 'تحدي تفريغ شبكة العواصم الـ 12',
    mode: 'cards_10',
    cards: [
      { id: 1, number: 1, label: 'طوكيو', sublabel: 'اليابان - برج طوكيو', badge: 'عاصمة آسيوية' },
      { id: 2, number: 2, label: 'باريس', sublabel: 'فرنسا - برج إيفل', badge: 'عاصمة أوروبية' },
      { id: 3, number: 3, label: 'لندن', sublabel: 'بريطانيا - ساعة بيغ بن', badge: 'عاصمة أوروبية' },
      { id: 4, number: 4, label: 'بكين', sublabel: 'الصين - المدينة المحرمة', badge: 'عاصمة آسيوية' },
      { id: 5, number: 5, label: 'بغداد', sublabel: 'العراق - نصب الحرية والملوية', badge: 'عاصمة عربية' },
      { id: 6, number: 6, label: 'القاهرة', sublabel: 'مصر - الأهرامات ونهر النيل', badge: 'عاصمة عربية' },
      { id: 7, number: 7, label: 'روما', sublabel: 'إيطاليا - مدرج الكولوسيوم', badge: 'عاصمة أوروبية' },
      { id: 8, number: 8, label: 'واشنطن', sublabel: 'الولايات المتحدة - البيت الأبيض', badge: 'عاصمة أمريكية' },
      { id: 9, number: 9, label: 'مدريد', sublabel: 'إسبانيا - قصر المورق والمتاحف', badge: 'عاصمة أوروبية' },
      { id: 10, number: 10, label: 'الرياض', sublabel: 'المملكة العربية السعودية - برج المملكة', badge: 'عاصمة عربية' },
      { id: 11, number: 11, label: 'دمشق', sublabel: 'سوريا - الجامع الأموي وأقدم عاصمة', badge: 'عاصمة عربية' },
      { id: 12, number: 12, label: 'إسطنبول', sublabel: 'تركيا - جسر البوسفور وآيا صوفيا', badge: 'مدينة تاريخية' }
    ],
    questions: [
      {
        id: 'gs-gen-1',
        questionNumber: 1,
        question: 'ما هي عاصمة اليابان وتعتبر أكبر منطقة حضرية في العالم؟',
        correctCardNumber: 1,
        explanation: 'الإجابة هي بطاقة (1): طوكيو (Tokyo).',
        points: 100
      },
      {
        id: 'gs-gen-2',
        questionNumber: 2,
        question: 'ما هي عاصمة النور والموضة التي يقع فيها برج إيفل ومتحف اللوفر الشهير؟',
        correctCardNumber: 2,
        explanation: 'الإجابة هي بطاقة (2): باريس (Paris).',
        points: 100
      },
      {
        id: 'gs-gen-3',
        questionNumber: 3,
        question: 'ما هي عاصمة المملكة المتحدة ومقر ساعة بيغ بن ونهر التايمز؟',
        correctCardNumber: 3,
        explanation: 'الإجابة هي بطاقة (3): لندن (London).',
        points: 100
      },
      {
        id: 'gs-gen-4',
        questionNumber: 4,
        question: 'عاصمة الصين التاريخية ومقر المدينة المحرمة وساحة تيانانمن؟',
        correctCardNumber: 4,
        explanation: 'الإجابة هي بطاقة (4): بكين (Beijing).',
        points: 100
      },
      {
        id: 'gs-gen-5',
        questionNumber: 5,
        question: 'عاصمة الرشيد وبلاد الرافدين التي يزينها نصب الحرية ونهر دجلة؟',
        correctCardNumber: 5,
        explanation: 'الإجابة هي بطاقة (5): بغداد.',
        points: 100
      },
      {
        id: 'gs-gen-6',
        questionNumber: 6,
        question: 'كبرى العواصم العربية والأفريقية وتضم الأهرامات التاريخية ونهر النيل الخالد؟',
        correctCardNumber: 6,
        explanation: 'الإجابة هي بطاقة (6): القاهرة.',
        points: 100
      },
      {
        id: 'gs-gen-7',
        questionNumber: 7,
        question: 'عاصمة إيطاليا والملقبة بالمدينة الخالدة وتضم مدرج الكولوسيوم العريق؟',
        correctCardNumber: 7,
        explanation: 'الإجابة هي بطاقة (7): روما (Rome).',
        points: 100
      },
      {
        id: 'gs-gen-8',
        questionNumber: 8,
        question: 'العاصمة الفيدرالية للولايات المتحدة الأمريكية ومقر البيت الأبيض والكونغرس؟',
        correctCardNumber: 8,
        explanation: 'الإجابة هي بطاقة (8): واشنطن العاصمة (Washington D.C).',
        points: 100
      },
      {
        id: 'gs-gen-9',
        questionNumber: 9,
        question: 'عاصمة إسبانيا الشهيرة ومقر القصر الملكي وفريق ريال مدريد؟',
        correctCardNumber: 9,
        explanation: 'الإجابة هي بطاقة (9): مدريد (Madrid).',
        points: 100
      },
      {
        id: 'gs-gen-10',
        questionNumber: 10,
        question: 'عاصمة المملكة العربية السعودية وعروس الصحراء التي تحتضن برج المملكة وبرج الفيصلية؟',
        correctCardNumber: 10,
        explanation: 'الإجابة هي بطاقة (10): الرياض.',
        points: 100
      },
      {
        id: 'gs-gen-11',
        questionNumber: 11,
        question: 'أقدم عاصمة مأهولة في التاريخ والجامع الأموي وقلب بلاد الشام؟',
        correctCardNumber: 11,
        explanation: 'الإجابة هي بطاقة (11): دمشق.',
        points: 100
      },
      {
        id: 'gs-gen-12',
        questionNumber: 12,
        question: 'المدينة التاريخية العريقة التي تصل بين قارتي آسيا وأوروبا عبر مضيق البوسفور؟',
        correctCardNumber: 12,
        explanation: 'الإجابة هي بطاقة (12): إسطنبول (Istanbul).',
        points: 100
      }
    ]
  }
};

const normalizeStaticGibhaSahConfig = (config: GibhaSahGameConfig): GibhaSahGameConfig => ({
  ...config,
  mode: 'cards_10',
  subtitle: config.subtitle.replace(/12/g, '10'),
  cards: config.cards.slice(0, 10).map((card, index) => ({
    ...card,
    id: index + 1,
    number: index + 1,
  })),
  questions: config.questions.slice(0, 10).map((question, index) => ({
    ...question,
    questionNumber: index + 1,
    correctCardNumber: question.correctCardNumber >= 1 && question.correctCardNumber <= 10
      ? question.correctCardNumber
      : (index % 10) + 1,
  })),
});

export const getGibhaSahGameForLesson = (
  lessonId: string,
  lessonTitle: string,
  category: string
): GibhaSahGameConfig => {
  // Direct match, normalized to the current ten-card format.
  if (GIBHA_SAH_GAMES[lessonId]) {
    return normalizeStaticGibhaSahConfig(GIBHA_SAH_GAMES[lessonId]);
  }
  // Do not borrow another subject or the old general-culture/biology set.
  // The database loader handles the mandatory previous-lesson policy for this game.
  return {
    lessonId,
    subject: category || 'المادة التعليمية',
    title: `لعبة جِيبْهَا صَح - ${lessonTitle}`,
    subtitle: 'لا تتوفر أسئلة مرتبطة بهذا الدرس حاليًا',
    mode: 'cards_10',
    cards: [],
    questions: [],
  };
};
