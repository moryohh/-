import { EducationalGame } from '../types';

export interface TrueFalseQuestion {
  id: string;
  question: string;
  isCorrect: boolean; // true = صح, false = خطأ
  difficulty: 'سهل' | 'متوسط' | 'متقدم';
  points: number;
  explanation: string;
  category?: string;
}

export interface TrueFalseGameConfig {
  lessonId: string;
  subject: string;
  title: string;
  subtitle: string;
  totalQuestions: number;
  totalPoints: number;
  questions: TrueFalseQuestion[];
  /** Full lesson-file pool used to build a fresh non-repeating round. */
  questionPool?: TrueFalseQuestion[];
}

export const TRUE_FALSE_GAMES: Record<string, TrueFalseGameConfig> = {
  // 1. اللغة العربية ج1 - القواعد وإعراب أسماء الاستفهام
  'lesson-ar-g1': {
    lessonId: 'lesson-ar-g1',
    subject: 'اللغة العربية ج1',
    title: 'تحدي صح أم خطأ - قواعد اللغة العربية',
    subtitle: '12 سؤالاً في إعراب أسماء الاستفهام والأساسيات النحوية',
    totalQuestions: 12,
    totalPoints: 1200,
    questions: [
      {
        id: 'tf-ar1-1',
        question: 'اسم الاستفهام "مَنْ" يُستفهم به عن العاقل دائماً.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، "مَنْ" موضوعة في أصل وضعها للاستفهام عن الذات العاقلة.'
      },
      {
        id: 'tf-ar1-2',
        question: 'تُعرب أسماء الاستفهام الدالة على الزمان والمكان مبتدأً إذا تلاها فعل تام.',
        isCorrect: false,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'خطأ، أسماء الزمان والمكان (متى، أين، أيّان) تُعرب مفعولاً فيه (ظرف زمان أو مكان) إذا تلاها فعل تام.'
      },
      {
        id: 'tf-ar1-3',
        question: 'جميع أسماء الاستفهام مبنية ما عدا "أيّ" فإنها معربة بحركات ظاهرة.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، كل أسماء الاستفهام مبنية على السكون أو الفتح ما عدا "أيّ" فهي معربة ترفع بالضمة وتنصب بالفتحة وتجر بالكسرة.'
      },
      {
        id: 'tf-ar1-4',
        question: 'تُعرب "ما" مفعولاً به مقدماً وجوباً إذا تلاها فعل متعدٍّ استوفى مفعوله.',
        isCorrect: false,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'خطأ، إذا استوفى الفعل المتعدي مفعوله تُعرب "ما" مبتدأً، وتُعرب مفعولاً به إذا لم يستوفِ مفعوله.'
      },
      {
        id: 'tf-ar1-5',
        question: 'يجوز دخول حرف الجر على أسماء الاستفهام فتُعرب في محل جر بحرف الجر.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، مثل: "بِمَ التعلل؟" و"عمّ يتساءلون؟" و"لمَنْ هذا الكتاب؟".'
      },
      {
        id: 'tf-ar1-6',
        question: 'تُحذف ألف "ما" الاستفهامية وجوباً عند اتصالها بحرف جر للتخفيف والتمييز.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، مثل: (فيمَ، عمَّ، حتّامَ، إلامَ، علامَ، بمَ، لِمَ).'
      },
      {
        id: 'tf-ar1-7',
        question: 'اسم الاستفهام "كيْفَ" يُعرب دائماً في محل نصب مفعول به.',
        isCorrect: false,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'خطأ، "كيف" يُعرب في محل نصب حال إذا تلاه فعل تام، أو في محل رفع/نصب خبر للفعل الناقص، ولا يُعرب مفعولاً به أبداً.'
      },
      {
        id: 'tf-ar1-8',
        question: 'الاستفهام المجازي يخرج لأغراض بلاغية مثل النفي الضمني والتعجب.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، الاستفهام لا يطلب جواباً لمعلومة مجهولة بل يخرج لمعانٍ بلاغية كالنفي والتعجب.'
      },
      {
        id: 'tf-ar1-9',
        question: 'الهمزة وهل حرفان لا محل لهما من الإعراب.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، الهمزة و"هل" هما حرفا استفهام لا محل لهما من الإعراب.'
      },
      {
        id: 'tf-ar1-10',
        question: 'يجوز استبدال "هل" بالهمزة في الاستفهام المنفي دائماً.',
        isCorrect: false,
        difficulty: 'متقدم',
        points: 100,
        explanation: 'خطأ، "هل" لا تدخل على الجملة المنفية إطلاقاً، بينما الهمزة تختص بالدخول على النفي (ألم، أليس، أما).'
      },
      {
        id: 'tf-ar1-11',
        question: 'إذا تلا "مَنْ" أو "ما" اسم نكرة فإنهما تُعربان مبتدأً.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، أسماء الذات (مَنْ، ما) إذا تلاها اسم نكرة تُعرب مبتدأً مثل: "مَنْ قادمٌ؟".'
      },
      {
        id: 'tf-ar1-12',
        question: '"أيّانَ" اسم استفهام يُستفهم به عن الزمان الماضي فقط.',
        isCorrect: false,
        difficulty: 'متقدم',
        points: 100,
        explanation: 'خطأ، "أيّانَ" تفيد الزمان المستقبل حصراً وتفيد التهويل والتعظيم (مثل: يسأل أيّان يوم القيامة).'
      }
    ]
  },

  // 2. البيولوجيا / الأحياء - التكاثر في الكائنات الحية والإنسان
  'lesson-bio-ch3': {
    lessonId: 'lesson-bio-ch3',
    subject: 'البيولوجيا',
    title: 'تحدي صح أم خطأ - علم الأحياء',
    subtitle: '12 سؤالاً في التكاثر والوراثة والأجهزة التناسلية',
    totalQuestions: 12,
    totalPoints: 1200,
    questions: [
      {
        id: 'tf-bio-1',
        question: 'تنتمي الضفادع إلى طائفة البرمائيات ويعد الإخصاب فيها إخصاباً خارجياً.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، الضفادع برمائيات وتطرح الأمشاج في الماء حيث يحدث الإخصاب خارج جسم الأنثى.'
      },
      {
        id: 'tf-bio-2',
        question: 'الأجسام الدهنية في الضفدع تقوم بضخ الدم وتنظيم ضربات القلب.',
        isCorrect: false,
        difficulty: 'سهل',
        points: 100,
        explanation: 'خطأ، الأجسام الدهنية تعمل كمخازن طاقة وغذاء لإنماء المناسل أثناء السبات الشتوي.'
      },
      {
        id: 'tf-bio-3',
        question: 'النطفة الناضجة في الإنسان تحتوي على 23 كروموسوماً (نصف العدد الكامل).',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، الأمشاج أحادية المجموعة الكروموسومية (1س = 23 كروموسوم).'
      },
      {
        id: 'tf-bio-4',
        question: 'تنشأ النطاف في الإنسان داخل الأنابيب المنوية في الخصية.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، النبيبات المنوية الملتوية هي موقع توليد وتمايز الحيوانات المنوية.'
      },
      {
        id: 'tf-bio-5',
        question: 'في ذكر الضفدع، تنفصل القناة البولية تماماً عن القناة التناسلية.',
        isCorrect: false,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'خطأ، القناة البولية والتناسلية مشتركة في ذكر الضفدع وتسمى القناة البولية التناسلية.'
      },
      {
        id: 'tf-bio-6',
        question: 'تفرز خلايا لايدج البينية في الخصية هرمون التستوستيرون الذكري.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، خلايا لايدج مسؤولة عن إفراز الهرمونات الجنسية الذكرية.'
      },
      {
        id: 'tf-bio-7',
        question: 'يحدث الانقسام الاختزالي الأول في الخلية البيضية الأولية ليعطي كرية قطبية أولى وخلية بيضية ثانوية.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، الانقسام السيتوبلازمي غير متساوٍ وينتج عنه جسم قطبي أول وخلية بيضية ثانوية.'
      },
      {
        id: 'tf-bio-8',
        question: 'الغشاء الألبيوجيني (Tunica albuginea) يحيط بالكلية في الضفدع.',
        isCorrect: false,
        difficulty: 'متقدم',
        points: 100,
        explanation: 'خطأ، الغلالة البيضاء تحيط بالخصية وليست بالكلية.'
      },
      {
        id: 'tf-bio-9',
        question: 'غدة البروستات وغدتا كوبر تفرزان سوائل قلوية تعادل حموضة مجرى البول في الإنسان.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، السائل المنوي قلوي لحماية النطاف وتغذيتها وتسهيل حركتها.'
      },
      {
        id: 'tf-bio-10',
        question: 'الوسادة الإبهامية في ذكر الضفدع توجد طوال العام بنفس الحجم.',
        isCorrect: false,
        difficulty: 'متقدم',
        points: 100,
        explanation: 'خطأ، تتضخم الوسادة الإبهامية تحديداً في موسم التزاوج لمسك الأنثى بإحكام.'
      },
      {
        id: 'tf-bio-11',
        question: 'الجسيم الطرفي (Acrosome) في رأس النطفة يفرز إنزيمات هاضمة لاختراق غشاء البويضة.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، يحتوي الجسيم الطرفي على إنزيمات مثل الهيالورونيداز لاختراق طبقات البويضة.'
      },
      {
        id: 'tf-bio-12',
        question: 'التكاثر العذري يعني نمو الجنين من بيضة غير مخصبة.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، التكاثر العذري يحدث بدون مشاركة النطفة كما في ذكور نحل العسل.'
      }
    ]
  },

  // 3. الفيزياء - قانون فرداي وقانون لنز
  'lesson-phys-ch2': {
    lessonId: 'lesson-phys-ch2',
    subject: 'الفيزياء',
    title: 'تحدي صح أم خطأ - الحث الكهرومغناطيسي',
    subtitle: '12 سؤالاً في قوانين فرداي ولنز والقوة الدافعة الكهربائية',
    totalQuestions: 12,
    totalPoints: 1200,
    questions: [
      {
        id: 'tf-phys-1',
        question: 'يتولد تيار محتث في حلقة موصلة مقفلة عند حدوث تغير في الفيض المغناطيسي الذي يخترقها.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، هذا هو نص اكتشاف فرداي في الحث الكهرومغناطيسي.'
      },
      {
        id: 'tf-phys-2',
        question: 'وحدة قياس الفيض المغناطيسي (ΦB) في النظام الدولي هي الويبر (Weber).',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، الويبر هو وحدة الفيض المغناطيسي، بينما التسلا هي وحدة كثافة الفيض.'
      },
      {
        id: 'tf-phys-3',
        question: 'ينص قانون لنز على أن التيار المحتث يولد مجالاً مغناطيسياً يعزز دائماً السبب الذي ولده.',
        isCorrect: false,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'خطأ، قانون لنز ينص على أن اتجاه التيار المحتث يولد مجالاً يعاكس بتأثيره التغير في الفيض المسبب له.'
      },
      {
        id: 'tf-phys-4',
        question: 'تعد التيارات الدوامة مرغوباً بها دائماً في المحولات الكهربائية لزيادة الكفاءة.',
        isCorrect: false,
        difficulty: 'سهل',
        points: 100,
        explanation: 'خطأ، التيارات الدوامة تسبب ضياعاً في الطاقة على شكل حرارة، لذا تُصنع النوى من صفائح معزولة لتقليلها.'
      },
      {
        id: 'tf-phys-5',
        question: 'تُقاس القوة الدافعة الكهربائية المحتثة (emf) بوحدة الفولت.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، القوة الدافعة الكهربائية هي فرق جهد كهربي وتقاس بالفولت.'
      },
      {
        id: 'tf-phys-6',
        question: 'معامل الحث الذاتي (L) لملف يعتمد على عدد لفاته وحجمه والنفوذية المغناطيسية لمادته.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، هذه العوامل الهندسية تحدد قيمة معامل الحث الذاتي للملف.'
      },
      {
        id: 'tf-phys-7',
        question: 'عند ثبوت الفيض المغناطيسي القاطع لملف، تتولد فيه أعلى قيمة للقوة الدافعة المحتثة.',
        isCorrect: false,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'خطأ، إذا كان الفيض ثابتاً فإن التغير فيه يساوي صفراً (ΔΦ/Δt = 0)، وبالتالي تكون emf = 0.'
      },
      {
        id: 'tf-phys-8',
        question: 'تطبيق قانون لنز يعد تطبيقاً مباشراً لقانون حفظ الطاقة.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، لأن الشغل المنجز للتغلب على القوة المعاكسة يتحول إلى طاقة كهربائية في الدائرة.'
      },
      {
        id: 'tf-phys-9',
        question: 'تُقاس محاثة الملف (معامل الحث الذاتي) بوحدة الهنري (Henry).',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، الهنري (H) هو وحدة الحث الذاتي والحث المتبادل.'
      },
      {
        id: 'tf-phys-10',
        question: 'تزداد الطاقة المغناطيسية المختزنة في المحث بزيادة مربع شدة التيار المار فيه.',
        isCorrect: true,
        difficulty: 'متقدم',
        points: 100,
        explanation: 'صحيح، وفق القانون: PE = 1/2 L I²، الطاقة تتناسب طردياً مع مربع التيار.'
      },
      {
        id: 'tf-phys-11',
        question: 'المجال الكهربائي المستقر هو مجال ينشأ عن شحنات كهربائية متحركة بسرعة متغيرة.',
        isCorrect: false,
        difficulty: 'متقدم',
        points: 100,
        explanation: 'خطأ، المجال الكهربائي المستقر ينشأ عن شحنات كهربائية ساكنة، بينما غير المستقر ينشأ عن تغيرات المجال المغناطيسي.'
      },
      {
        id: 'tf-phys-12',
        question: 'تعمل كوابح القطارات الحديثة وفق مبدأ التيارات الدوامة لتأمين توقف سلس.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، تولد التيارات الدوامة عزماً كهرومغناطيسياً معاكساً يوقف العجلات دون احتكاك ميكانيكي.'
      }
    ]
  },

  // 4. الرياضيات - مبرهنة ديموافر والأعداد المركبة
  'lesson-math-ch1': {
    lessonId: 'lesson-math-ch1',
    subject: 'الرياضيات',
    title: 'تحدي صح أم خطأ - مبرهنة ديموافر',
    subtitle: '12 سؤالاً في الأعداد المركبة والصيغة القطبية والجذور',
    totalQuestions: 12,
    totalPoints: 1200,
    questions: [
      {
        id: 'tf-math-1',
        question: 'قيمة الوحدة التخيلية i² تساوي (-1).',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، بتعريف الوحدة التخيلية فإن i = √(-1) وبالتالي i² = -1.'
      },
      {
        id: 'tf-math-2',
        question: 'مقياس العدد المركب z = 3 + 4i هو 5 وحدات.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، المقياس r = √(3² + 4²) = √(9 + 16) = √25 = 5.'
      },
      {
        id: 'tf-math-3',
        question: 'الصيغة القطبية لأي عدد مركب تعتمد فقط على الجزء الحقيقي وتهمل التخيلي.',
        isCorrect: false,
        difficulty: 'سهل',
        points: 100,
        explanation: 'خطأ، الصيغة القطبية z = r(cos θ + i sin θ) تعتمد على كل من المقياس r والقيمة الأساسية للسعة θ الناتجة عن الجزأين الحقيقي والتخيلي.'
      },
      {
        id: 'tf-math-4',
        question: 'مبرهنة ديموافر تنص على: [cos θ + i sin θ]ⁿ = cos(nθ) + i sin(nθ) لكل عدد صحيح n.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، هذا هو النص الأساسي لمبرهنة دي موافر للأسس الصحيحة.'
      },
      {
        id: 'tf-math-5',
        question: 'حاصل ضرب عدد مركب في مرافقه ينتج دائماً عدداً تخيلياً بحتاً.',
        isCorrect: false,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'خطأ، حاصل ضرب (a + bi)(a - bi) = a² + b² وهو دائماً عدد حقيقي موجب.'
      },
      {
        id: 'tf-math-6',
        question: 'الجذور التكعيبية للواحد الصحيح مجموعها الجبري يساوي صفراً (1 + ω + ω² = 0).',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، من خواص الجذور التكعيبية للواحد الصحيح (أوميغا) أن مجموعها يساوي صفراً.'
      },
      {
        id: 'tf-math-7',
        question: 'السعة الأساسية للعدد المركب z تقع دائماً في الفترة [0, 2π).',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، تعرف القيمة الأساسية للسعة arg(z) في هذا النطاق القياسي للزوايا.'
      },
      {
        id: 'tf-math-8',
        question: 'قيمة i⁴ تساوي 1.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، i⁴ = (i²)² = (-1)² = 1.'
      },
      {
        id: 'tf-math-9',
        question: 'نتيجة مبرهنة ديموافر تُستخدم لحساب الجذور النونية للأعداد المركبة.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، تستخدم صيغة النتيجة z^(1/n) لحساب الجذور المتعددة باستخدام التعويض عن k = 0, 1, ..., n-1.'
      },
      {
        id: 'tf-math-10',
        question: 'العدد المركب الواقع في الربع الثالث تكون إشارة جزأيه الحقيقي والتخيلي موجبتين.',
        isCorrect: false,
        difficulty: 'سهل',
        points: 100,
        explanation: 'خطأ، في الربع الثالث يكون الجزء الحقيقي سالباً والجزء التخيلي سالباً (x < 0, y < 0).'
      },
      {
        id: 'tf-math-11',
        question: 'مرافق العدد المركب z = 5 - 2i هو z̄ = 5 + 2i.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، المرافق ينتج بتغيير إشارة الجزء التخيلي فقط.'
      },
      {
        id: 'tf-math-12',
        question: 'النظير الضربي للعدد المركب z هو نفسه مرافقه z̄ دائماً بدون شروط.',
        isCorrect: false,
        difficulty: 'متقدم',
        points: 100,
        explanation: 'خطأ، النظير الضربي هو 1/z = z̄ / |z|²، ولا يتطابق مع المرافق إلا إذا كان المقياس |z| = 1.'
      }
    ]
  },

  // Default AI / General set for any other lesson
  'default': {
    lessonId: 'default',
    subject: 'المادة التعليمية',
    title: 'تحدي صح أم خطأ - التقييم التفاعلي',
    subtitle: '12 سؤالاً شاملاً لقياس الاستيعاب وسرعة البديهة',
    totalQuestions: 12,
    totalPoints: 1200,
    questions: [
      {
        id: 'tf-gen-1',
        question: 'تعتمد نماذج الذكاء الاصطناعي على تحليل البيانات والأنماط لاتخاذ القرارات والتنبؤ.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، يتعلم الذكاء الاصطناعي من مجموعات البيانات الضخمة لاستخراج الأنماط والقواعد.'
      },
      {
        id: 'tf-gen-2',
        question: 'التعلم الآلي (Machine Learning) فرع مستقل تماماً ولا علاقة له بالذكاء الاصطناعي.',
        isCorrect: false,
        difficulty: 'سهل',
        points: 100,
        explanation: 'خطأ، التعلم الآلي هو أحد الفروع الأساسية والجوهرية لعلوم الذكاء الاصطناعي.'
      },
      {
        id: 'tf-gen-3',
        question: 'الشبكات العصبية الاصطناعية مستوحاة من التركيب العصبي للدماغ البشري.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، صممت الخلايا والطبقات العصبية الاصطناعية لمحاكاة معالجة الإشارات في الدماغ.'
      },
      {
        id: 'tf-gen-4',
        question: 'تساعد الخرائط الذهنية في ترسيخ المعلومات وربط المفاهيم المعقدة بصرياً.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، تزيد الخرائط الذهنية من استرجاع الذاكرة وسرعة الاستيعاب بنسبة عالية.'
      },
      {
        id: 'tf-gen-5',
        question: 'الحفظ العشوائي بدون فهم هو الطريقة الأفضل للنجاح في الامتحانات الوزارية.',
        isCorrect: false,
        difficulty: 'سهل',
        points: 100,
        explanation: 'خطأ، الفهم والتطبيق وحل الأسئلة النموذجية هو الأساس المتين للتفوق الدراسي.'
      },
      {
        id: 'tf-gen-6',
        question: 'تقنية بومودورو تعتمد على تقسيم وقت الدراسة إلى جلسات تركيز مدتها 25 دقيقة.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، أثبتت الدراسات أن 25 دقيقة تركيز متبوعة بـ 5 دقائق راحة تزيد الإنتاجية بشكل ملحوظ.'
      },
      {
        id: 'tf-gen-7',
        question: 'المراجعة الدورية للمعلومات تساعد في نقلها من الذاكرة قصيرة المدى إلى الذاكرة طويلة المدى.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، التكرار المتباعد يقوي الوصلات العصبية في الدماغ ويثبت المعرفة.'
      },
      {
        id: 'tf-gen-8',
        question: 'حل النماذج الوزارية السابقة يساعد في إدارة وقت الامتحان والتعرف على نمط الأسئلة.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، التطبيق على الأسئلة الوزارية يزيل رهبة الامتحان ويطور مهارات السرعة والدقة.'
      },
      {
        id: 'tf-gen-9',
        question: 'قلة النوم في ليلة الامتحان تزيد من سرعة التركيز وقوة الاسترجاع الذهني.',
        isCorrect: false,
        difficulty: 'سهل',
        points: 100,
        explanation: 'خطأ، النوم الكافي ضروري جداً لترتيب المعلومات في الدماغ وتجنب التشتت والنسيان.'
      },
      {
        id: 'tf-gen-10',
        question: 'تدوين الملاحظات التلخيصية بيدك يعزز قدرة الدماغ على معالجة المعلومات.',
        isCorrect: true,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'صحيح، الكتابة اليدوية تشرك مراكز متعددة في الدماغ مما يزيد التثبيت بنسبة تفوق القراءة السلبية.'
      },
      {
        id: 'tf-gen-11',
        question: 'كلما زاد عدد ساعات الدراسة دون راحة، زادت نسبة استيعاب الدماغ للمعلومات.',
        isCorrect: false,
        difficulty: 'متوسط',
        points: 100,
        explanation: 'خطأ، يصاب الدماغ بالإجهاد بعد فترات طويلة متواصلة مما يقلل كفاءة الاستيعاب بشكل حاد.'
      },
      {
        id: 'tf-gen-12',
        question: 'اختبار نفسك بالأسئلة السريعة (صح وخطأ) يكتشف الثغرات المعرفية لديك فوراً.',
        isCorrect: true,
        difficulty: 'سهل',
        points: 100,
        explanation: 'صحيح، التقييم الذاتي الفوري يعد من أقوى استراتيجيات التعلم النشط والتفوق.'
      }
    ]
  }
};

export const getTrueFalseGameForLesson = (
  lessonId: string,
  lessonTitle: string,
  category: string
): TrueFalseGameConfig => {
  // Exact match
  if (TRUE_FALSE_GAMES[lessonId]) {
    return TRUE_FALSE_GAMES[lessonId];
  }

  // Do not borrow another subject or a generic AI/general set.
  // The database loader will show an unavailable state when this exact lesson has no bank.
  return {
    lessonId,
    subject: category || 'المادة التعليمية',
    title: `تحدي صح أم خطأ - ${lessonTitle}`,
    subtitle: 'لا تتوفر أسئلة مرتبطة بهذا الدرس حاليًا',
    totalQuestions: 0,
    totalPoints: 0,
    questions: [],
  };
};
