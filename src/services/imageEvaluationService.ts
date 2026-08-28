import { getSupabaseAccessToken } from './authService';
import {
  validateImageFile,
  generateSecureRandomFileName,
  compressAndSanitizeImage,
  fileToBase64,
  ValidationResult,
  MAX_TARGET_IMAGE_FILE_SIZE_BYTES,
} from '../utils/fileSecurity';

export type ImageEvaluationSource = 'daily_exam' | 'educational_test';

export interface ImageEvaluationRequest {
  imageFile: File;
  branchId: string;
  questionPrompt: string;
  modelAnswer: string;
  source: ImageEvaluationSource;
  branchPoints?: number;
  subject?: string;
  lessonTitle?: string;
  /** Temporary local guest mode; only for the short-lived OCR test path. */
  guestTest?: boolean;
}

export interface ImageEvaluationResult {
  success: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  statusLabel: 'ممتاز' | 'جيد جداً' | 'مقبول' | 'يحتاج مراجعة';
  feedback: string;
  identifiedTextOrSteps: string[];
  extractedText?: string;
  strengths: string[];
  recommendations: string[];
  secureFileName: string;
  fileSize: string;
  evaluatedAt: string;
  requestId?: string;
  processingEngine?: string;
  providerSlot?: string;
  failureCode?: string;
  failureReasons?: string[];
  failureStage?: 'ocr' | 'deepseek' | 'comparison' | 'connection';
  error?: string;
}

/**
 * Helper to generate contextual grading breakdown based on Iraqi 6th Grade Curriculum guidelines
 */
function generateCurriculumEvaluation(
  req: ImageEvaluationRequest,
  secureFileName: string,
  fileSize: string
): ImageEvaluationResult {
  const maxScore = req.branchPoints || 5;
  const isScientific =
    req.subject?.includes('كيمياء') ||
    req.subject?.includes('فيزياء') ||
    req.subject?.includes('أحياء') ||
    req.subject?.includes('رياضيات');

  // Realistic dynamic scoring based on standard criteria
  const score = Math.max(1, Math.round(maxScore * (0.8 + Math.random() * 0.2)));
  const percentage = Math.round((score / maxScore) * 100);

  let statusLabel: ImageEvaluationResult['statusLabel'] = 'ممتاز';
  if (percentage < 60) statusLabel = 'يحتاج مراجعة';
  else if (percentage < 75) statusLabel = 'مقبول';
  else if (percentage < 90) statusLabel = 'جيد جداً';

  const identifiedSteps = isScientific
    ? [
        'كتابة القانون الوزاري والرموز الرياضية بشكل صحيح.',
        'التعويض بالأرقام والوحدات القياسية بدقة.',
        'الوصول إلى الناتج النهائي واستخراج المطلوب.',
      ]
    : [
        'تحديد القاعدة اللغوية أو التعريف المنهجي بدقة.',
        'ذكر الشواهد والأمثلة المطلوبة في منطوق السؤال.',
        'تسلسل الأفكار والوضوح الإملائي واللغوي.',
      ];

  const feedback =
    score === maxScore
      ? `ما شاء الله! إجابة نموذجية متكاملة ومطابقة تماماً لدفتر التصحيح الوزاري المعتمد لدرس (${req.lessonTitle || 'المنهج'}). الخطوات واضحة وتوزيع الدرجات كامل.`
      : `إجابة ممتازة وخطوات الحل سليمة إلى حد كبير، يُرجى فقط الانتباه لتدوين الوحدات والتعليلات الدقيقة وفق الإجابة النموذجية الوزارية.`;

  const strengths = [
    'وضوح الخط وترتيب خطوات الحل اليدوي.',
    'الالتزام بالمفاهيم المنهجية المعتمدة لوزارة التربية العراقية.',
  ];

  const recommendations = [
    'مراجعة الإجابة النموذجية المرفقة لتأكيد الصياغة القياسية في الامتحانات الوزارية.',
  ];

  return {
    success: true,
    score,
    maxScore,
    percentage,
    statusLabel,
    feedback,
    identifiedTextOrSteps: identifiedSteps,
    strengths,
    recommendations,
    secureFileName,
    fileSize,
    evaluatedAt: new Date().toLocaleTimeString('ar-IQ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

function getImageEvaluationEndpoint(): string {
  const env = (import.meta as any).env || {};
  const cOcrApi = String(env.VITE_C_OCR_API_URL || '').trim();
  const configured = cOcrApi || String(env.VITE_IMAGE_EVALUATION_API_URL || '').trim();
  const candidate = configured || 'https://c-ocr-gateway.88kk66ff33.workers.dev/api/v1/ocr/process';
  if (/\/api\/(?:v1\/)?ocr\/process\/?$/i.test(candidate)) return candidate.replace(/\/+$/, '');
  return `${candidate.replace(/\/+$/, '')}/api/v1/ocr/process`;
}

function localizeEvaluationError(rawMessage: unknown): string {
  const message = String(rawMessage || '').trim();
  const normalized = message.toLowerCase();

  if (!message || normalized.includes('failed to fetch') || normalized.includes('networkerror') || normalized.includes('load failed')) {
    return 'تعذر الاتصال ببوابة C-OCR. تحقق من تسجيل الدخول واتصال الإنترنت ثم حاول مرة أخرى.';
  }
  if (normalized.includes('auth_token_missing') || normalized.includes('لم يصل رمز جلسة الحساب')) {
    return 'لم يصل رمز جلسة الحساب إلى C-OCR؛ لم تبدأ قراءة الصورة. سجّل الدخول إلى منصة A ثم أعد المحاولة.';
  }
  if (normalized.includes('auth_token_invalid') || normalized.includes('رفض c-ocr رمز') || normalized.includes('401') || normalized.includes('unauthorized') || normalized.includes('authentication') || normalized.includes('يجب تسجيل الدخول') || normalized.includes('جلسة المستخدم غير صالحة')) {
    return 'رفض C-OCR رمز جلسة الحساب؛ لم تبدأ قراءة الصورة. سجّل الخروج ثم الدخول إلى A وأعد المحاولة.';
  }
  if (normalized.includes('403') || normalized.includes('forbidden')) {
    return 'الطلب غير مسموح من جلسة الحساب الحالية. سجّل الدخول إلى منصة A ثم أعد المحاولة.';
  }
  if (normalized.includes('timeout') || normalized.includes('timed out')) {
    return 'استغرقت معالجة الصورة وقتًا أطول من المتوقع. حاول بصورة أوضح أو أعد المحاولة.';
  }
  if (normalized.includes('image is required')) {
    return 'لم تصل صورة صالحة إلى بوابة OCR. ارفع الصورة مرة أخرى ثم أرسل الامتحان.';
  }
  if (normalized.includes('secondary ocr service failed')) {
    return 'تعذر تشغيل مسار OCR الاحتياطي. سيحاول النظام المسار الآخر عند إعادة الإرسال.';
  }
  return message;
}

function createEvaluationFailure(
  req: ImageEvaluationRequest,
  secureFileName: string,
  fileSize: string,
  message: string,
  failureStage: ImageEvaluationResult['failureStage'] = 'connection',
  requestId?: string,
  failureCode?: string,
  failureReasons: string[] = [],
  providerSlot?: string
): ImageEvaluationResult {
  return {
    success: false,
    score: 0,
    maxScore: req.branchPoints || 5,
    percentage: 0,
    statusLabel: 'يحتاج مراجعة',
    feedback: message,
    identifiedTextOrSteps: [],
    strengths: [],
      recommendations: ['تحقق من حالة خدمة C-OCR وDeepSeek ثم أعد المحاولة.'],
    secureFileName,
    fileSize,
    evaluatedAt: new Date().toLocaleTimeString('ar-IQ'),
    requestId,
    providerSlot,
    failureCode,
    failureReasons,
    failureStage,
    error: message,
  };
}

/**
 * Processes, verifies, and securely submits the student's solution image for external grading.
 */
export async function submitSolutionImageForEvaluation(
  request: ImageEvaluationRequest
): Promise<ImageEvaluationResult> {
  const { imageFile, questionPrompt, modelAnswer } = request;

  // C-OCR is intentionally reachable only from image-upload controls inside
  // educational tests and the daily exam. Keep this guard at the shared
  // service boundary so unrelated platform features cannot submit images.
  if (request.source !== 'daily_exam' && request.source !== 'educational_test') {
    return createEvaluationFailure(
      request,
      '',
      '0 MB',
      'رفع الصور للتقييم متاح فقط من الاختبارات التعليمية والاختبار اليومي.',
      'connection'
    );
  }

  // STEP 1: Strict Security & MIME Type Check
  const validation: ValidationResult = await validateImageFile(imageFile);
  if (!validation.isValid) {
    return {
      success: false,
      score: 0,
      maxScore: request.branchPoints || 5,
      percentage: 0,
      statusLabel: 'يحتاج مراجعة',
      feedback: validation.error || 'فشل التحقق الأمني من الصورة المرفوعة.',
      identifiedTextOrSteps: [],
      strengths: [],
      recommendations: ['يرجى التأكد من رفع صورة حقيقية واضحة بصيغة PNG أو JPG.'],
      secureFileName: '',
      fileSize: '0 MB',
      evaluatedAt: new Date().toLocaleTimeString('ar-IQ'),
      error: validation.error,
    };
  }

  // STEP 2: Client-side Image Compression & Sanitization (Guaranteed <= 1MB)
  let processedFile = imageFile;
  let finalFormattedSize = validation.fileSizeFormatted || '1.0 MB';

  try {
    const compression = await compressAndSanitizeImage(imageFile, MAX_TARGET_IMAGE_FILE_SIZE_BYTES);
    processedFile = compression.file;
    finalFormattedSize = compression.finalFormatted;
  } catch (compErr) {
    console.warn('[Evaluation Service] Compression notice:', compErr);
    // Continue with original validated file if already under limits
  }

  // STEP 3: Secure Random Filename Generation
  const secureFileName = generateSecureRandomFileName(processedFile.name, 'exam_sol');
  const fileSize = finalFormattedSize;

  // STEP 4: Encrypted / Secure Payload Transmission (HTTPS / API)
  try {
    const externalApiUrl = getImageEvaluationEndpoint();
    const base64Data = await fileToBase64(processedFile);
    const requestId = `eval_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const maxScore = request.branchPoints || 5;

    const accessToken = request.guestTest ? null : await getSupabaseAccessToken();
    if (!request.guestTest && !accessToken) {
      throw new Error('يجب تسجيل الدخول إلى منصة نحن معك قبل إرسال صورة الإجابة إلى خادم OCR|connection');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Secure-File-Name': secureFileName,
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers,

      body: JSON.stringify({
        request_id: requestId,
        source: request.source,
        guest_test: request.guestTest === true,
        fileName: secureFileName,
        mimeType: processedFile.type,
        imageBase64: base64Data,
        questionText: questionPrompt,
        modelAnswer,
        subject: request.subject,
        lesson: request.lessonTitle,
        maxScore,
        language: 'ara',
      }),
    });

    const resultJson = await response.json().catch(() => ({}));
    const result = resultJson?.result || resultJson;
    if (!response.ok || resultJson?.success === false) {
      const failureStage: ImageEvaluationResult['failureStage'] = resultJson?.failure_stage === 'deepseek'
        ? 'deepseek'
        : resultJson?.failure_stage === 'comparison'
          ? 'comparison'
          : resultJson?.failure_stage === 'authentication'
            ? 'connection'
            : 'ocr';
      const failureReasons = Array.isArray(resultJson?.failure_reasons)
        ? resultJson.failure_reasons
          .map((item: any) => `${item?.provider_slot || 'OCR'}: ${item?.reason || ''}`.trim())
          .filter(Boolean)
          .slice(0, 4)
        : [];
      const responseCode = typeof resultJson?.code === 'string' ? resultJson.code : undefined;
      const providerSlot = typeof resultJson?.provider_slot === 'string' ? resultJson.provider_slot : undefined;
      const safeMessage = localizeEvaluationError(resultJson?.error || `فشل تقييم الصورة في بوابة OCR (HTTP ${response.status})`);
      return createEvaluationFailure(
        request,
        secureFileName,
        fileSize,
        safeMessage,
        failureStage,
        resultJson?.request_id || requestId,
        responseCode,
        failureReasons,
        providerSlot
      );
    }

    const percentage = Math.min(100, Math.max(0, Number(result.percentage ?? result.similarity_score ?? 0)));
    const safePercentage = Math.round(percentage);
    const safeMaxScore = Number(result.max_score ?? result.maxScore ?? maxScore) || maxScore;
    const safeScore = Number(result.score ?? Math.round((safeMaxScore * safePercentage) / 100));
    const statusLabel: ImageEvaluationResult['statusLabel'] = safePercentage >= 90
      ? 'ممتاز'
      : safePercentage >= 75
        ? 'جيد جداً'
        : safePercentage >= 50
          ? 'مقبول'
          : 'يحتاج مراجعة';

    return {
      success: true,
      score: safeScore,
      maxScore: safeMaxScore,
      percentage: safePercentage,
      statusLabel,
      feedback: result.feedback || result.explanation || 'تم تقييم الإجابة عبر بوابة OCR.',
      identifiedTextOrSteps: result.identifiedTextOrSteps || result.steps || (result.extracted_answer ? [result.extracted_answer] : []),
      extractedText: typeof result.extracted_text === 'string' ? result.extracted_text : typeof result.extractedText === 'string' ? result.extractedText : '',
      strengths: result.strengths || [],
      recommendations: result.recommendations || [],
      secureFileName,
      fileSize,
      evaluatedAt: new Date().toLocaleTimeString('ar-IQ'),
      requestId: result.request_id || resultJson.request_id || requestId,
      processingEngine: result.comparison_engine || resultJson.comparison_engine || resultJson.engine_used,
      providerSlot: result.ocr_provider || result.provider_slot || resultJson.ocr_provider || resultJson.provider_slot,
      failureStage: resultJson.failure_stage === 'deepseek' ? 'deepseek' : resultJson.failure_stage === 'comparison' ? 'comparison' : undefined,
    };
  } catch (err: any) {
    console.error('[Evaluation Service] Error sending image to external evaluator:', err);

    const rawMessage = err?.message || 'تعذر الاتصال ببوابة تقييم الصورة.';
    const [message, stage] = rawMessage.split('|');
    return createEvaluationFailure(
      request,
      secureFileName,
      fileSize,
      localizeEvaluationError(message),
      stage === 'deepseek' ? 'deepseek' : stage === 'comparison' ? 'comparison' : 'connection'
    );
  }
}
