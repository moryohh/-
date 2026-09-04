import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, CheckCircle2, Clock, FileCheck2, ImageIcon, Loader2, PenTool, Trash2, X } from 'lucide-react';
import { OpenLessonContext } from '../types';
import { ImageEvaluationResult, submitSolutionImageForEvaluation } from '../services/imageEvaluationService';
import { ExamMode, ModeExamConfig, ModeExamQuestion, fetchExamForMode } from '../services/examService';
import { gameAudio } from '../utils/gameAudio';

interface ExamModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ExamMode;
  lessonId: string;
  lessonTitle: string;
  category?: string;
  openLessonContext?: OpenLessonContext | null;
  onScoreUpdate?: (points: number) => void;
  onAssessmentResult?: (correctPoints: number, totalPoints: number) => void;
  onDailyExamCompleted?: (result: {
    score: number;
    totalScore: number;
    percentage: number;
    subject: string;
    lessonTitle: string;
    completedAt: string;
  }) => void;
}

type ExamStatus = 'idle' | 'confirming' | 'processing' | 'completed';
type UploadedImage = { file: File; previewUrl: string };

const processingLabels = ['جارٍ جلب النتيجة', 'جارٍ التدقيق في الصور', 'جارٍ التصحيح وحساب الدرجة'];

export const ExamModeModal: React.FC<ExamModeModalProps> = ({
  isOpen,
  onClose,
  mode,
  lessonId,
  lessonTitle,
  category = 'المادة التعليمية',
  openLessonContext,
  onScoreUpdate,
  onAssessmentResult,
  onDailyExamCompleted,
}) => {
  const [config, setConfig] = useState<ModeExamConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [images, setImages] = useState<Record<string, UploadedImage | null>>({});
  const [results, setResults] = useState<Record<string, ImageEvaluationResult | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ExamStatus>('idle');
  const [processingPhase, setProcessingPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const submissionLockRef = useRef(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoading(true);
    setConfig(null);
    setAnswers({});
    setImages({});
    setResults({});
    setErrors({});
    setStatus('idle');
    setCompletedAt(null);
    setProcessingPhase(0);
    submissionLockRef.current = false;

    const context: OpenLessonContext = openLessonContext || {
      subjectId: category,
      chapterNumber: 1,
      lessonNumber: 1,
      lessonId,
      title: lessonTitle,
      lessonTitle,
    };
    fetchExamForMode(context, mode)
      .then((nextConfig) => {
        if (!cancelled) {
          setConfig(nextConfig);
          setTimeLeft(nextConfig.durationMinutes * 60);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, category, lessonId, lessonTitle, openLessonContext?.subjectId, openLessonContext?.chapterNumber, openLessonContext?.lessonNumber, openLessonContext?.lessonId]);

  useEffect(() => {
    if (!isOpen || status !== 'idle' || !config?.isAvailable) return;
    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          setStatus('confirming');
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, status, config?.isAvailable]);

  useEffect(() => {
    if (status !== 'processing') return;
    setProcessingPhase(0);
    const timer = window.setInterval(() => setProcessingPhase((previous) => (previous + 1) % 3), 1400);
    return () => window.clearInterval(timer);
  }, [status]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const setAnswer = (questionId: string, value: string) => {
    if (status !== 'idle') return;
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  };

  const selectImage = (questionId: string, file: File) => {
    if (status !== 'idle') return;
    if (!file.type.startsWith('image/')) {
      setErrors((previous) => ({ ...previous, [questionId]: 'يُسمح فقط بملفات الصور.' }));
      return;
    }
    const previous = images[questionId];
    if (previous) URL.revokeObjectURL(previous.previewUrl);
    setImages((current) => ({ ...current, [questionId]: { file, previewUrl: URL.createObjectURL(file) } }));
    setErrors((current) => ({ ...current, [questionId]: '' }));
    gameAudio.playClick();
  };

  const removeImage = (questionId: string) => {
    const previous = images[questionId];
    if (previous) URL.revokeObjectURL(previous.previewUrl);
    setImages((current) => ({ ...current, [questionId]: null }));
    setResults((current) => ({ ...current, [questionId]: null }));
  };

  const questionPrompt = (question: ModeExamQuestion) => `${question.typeLabel}: ${question.prompt}`;

  const submitExam = async () => {
    if (!config || submissionLockRef.current || status !== 'confirming') return;
    submissionLockRef.current = true;
    setStatus('processing');
    setErrors({});
    const nextResults: Record<string, ImageEvaluationResult | null> = {};
    try {
      for (const question of config.questions) {
        const uploaded = images[question.id];
        if (!uploaded) {
          nextResults[question.id] = null;
          continue;
        }
        const result = await submitSolutionImageForEvaluation({
          imageFile: uploaded.file,
          branchId: question.id,
          source: 'daily_exam',
          questionPrompt: questionPrompt(question),
          modelAnswer: question.modelAnswer,
          branchPoints: question.points,
          subject: config.subject,
          lessonTitle: config.lessonTitle,
          submissionId: `exam_${config.id}_${Date.now().toString(36)}`,
          questionId: question.id,
        });
        nextResults[question.id] = result;
        if (!result?.success) {
          setErrors((previous) => ({ ...previous, [question.id]: result?.error || result?.feedback || 'تعذر تصحيح صورة هذا السؤال.' }));
        }
      }
      setResults(nextResults);
      const score = config.questions.reduce((sum, question) => sum + (nextResults[question.id]?.success ? Number(nextResults[question.id]?.score || 0) : 0), 0);
      const completed = new Date().toISOString();
      setCompletedAt(completed);
      setStatus('completed');
      onDailyExamCompleted?.({
        score,
        totalScore: config.totalPoints,
        percentage: Math.round((score / Math.max(1, config.totalPoints)) * 100),
        subject: config.subject,
        lessonTitle: config.lessonTitle,
        completedAt: completed,
      });
      if (config.questions.length > 0 && config.questions.every((question) => nextResults[question.id]?.success)) {
        onScoreUpdate?.(Math.max(0, Math.round((score / Math.max(1, config.totalPoints)) * 10)));
        onAssessmentResult?.(score, config.totalPoints);
      }
      gameAudio.playVictoryFanfare();
    } catch {
      submissionLockRef.current = false;
      setStatus('idle');
      setErrors({ general: 'تعذر إكمال معالجة الامتحان. حاول مرة أخرى.' });
    }
  };

  const scoreFor = (question: ModeExamQuestion) => results[question.id]?.success ? Number(results[question.id]?.score || 0) : 0;
  const totalScore = config?.questions.reduce((sum, question) => sum + scoreFor(question), 0) || 0;
  const percentage = config ? Math.round((totalScore / Math.max(1, config.totalPoints)) * 100) : 0;
  const tone = (value: number) => value < 50
    ? { border: '#c95c68', bg: '#512f38', text: '#ffd7dc' }
    : value <= 75
      ? { border: '#c59c36', bg: '#534528', text: '#ffeeb0' }
      : { border: '#58a66b', bg: '#284934', text: '#d6f6dc' };

  return (
    <div className="fixed inset-0 z-[60] bg-[#302f3f] font-cairo" dir="rtl">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f8f7f1] text-[#29282b]">
        <div className="pointer-events-none absolute inset-y-0 right-[11%] z-0 w-px bg-[#d87878]/45" />
        <header className="relative z-10 shrink-0 border-b border-[#dedbd0] bg-[#f8f7f1]/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm backdrop-blur">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
            <button type="button" onClick={onClose} disabled={status === 'processing'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#cfcac0] bg-[#efede4] text-[#403d42] active:scale-95 disabled:opacity-40" aria-label="إغلاق الامتحان"><X className="h-5 w-5" /></button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[11px] font-bold text-[#766f68]">{config?.modeLabel || 'الامتحان'}</p>
              <h1 className="truncate text-base font-black text-[#2f2d31] sm:text-lg">{config?.sourceLabel || lessonTitle}</h1>
            </div>
            <div className="flex h-10 min-w-[76px] items-center justify-center gap-1 rounded-full border border-[#cfc7bd] bg-[#efede4] px-2 text-sm font-black text-[#3d3940]"><Clock className="h-4 w-4 text-[#6c4b88]" /><span>{formatTime(timeLeft)}</span></div>
          </div>
        </header>

        {status === 'confirming' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#302f3f]/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm border border-[#d8d2c7] bg-[#fbfaf4] p-6 text-center shadow-2xl">
              <FileCheck2 className="mx-auto mb-3 h-9 w-9 text-[#6c4b88]" />
              <h2 className="text-lg font-black text-[#302d34]">تأكيد تسليم الامتحان</h2>
              <p className="mt-2 text-sm leading-7 text-[#6f6963]">بعد التأكيد ستبدأ معالجة الصور ولن تستطيع إرسال الامتحان مرة أخرى أثناء المعالجة.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setStatus('idle')} className="border border-[#cfcac0] bg-[#efede4] px-3 py-3 text-xs font-black text-[#4b474b]">مراجعة الإجابات</button>
                <button type="button" onClick={submitExam} className="bg-[#6c4b88] px-3 py-3 text-xs font-black text-white">تأكيد وإرسال</button>
              </div>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#302f3f]/65 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm border border-[#d8d2c7] bg-[#fbfaf4] p-7 text-center shadow-2xl">
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#6c4b88]" />
              <h2 className="text-xl font-black text-[#302d34]">{processingLabels[processingPhase]}</h2>
              <p className="mt-2 text-sm leading-7 text-[#6f6963]">تم استلام إجابتك. يرجى الانتظار حتى تكتمل المعالجة.</p>
            </div>
          </div>
        )}

        {status === 'completed' && config && (
          <div className="absolute inset-0 z-50 flex min-h-0 flex-col bg-[#302f3f] text-white">
            <div className="shrink-0 border-b border-white/10 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                <button type="button" onClick={onClose} className="flex items-center gap-1.5 border border-white/20 bg-white/10 px-3 py-2 text-xs font-black"><ArrowRight className="h-4 w-4" /> العودة</button>
                <div className="text-center"><p className="text-xs font-bold text-white/65">نتيجة {config.modeLabel}</p><p className="mt-1 text-sm font-black">{config.subject} — {config.sourceLabel}</p></div>
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border-2" style={{ borderColor: tone(percentage).border, backgroundColor: tone(percentage).bg, color: tone(percentage).text }}><span className="text-lg font-black">{percentage}</span><span className="text-[9px]">من 100</span></div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="mx-auto max-w-2xl space-y-3">
                <div className="border border-white/10 bg-white/10 p-3 text-center"><p className="text-xs font-bold text-white/65">درجتك في هذا الامتحان</p><p className="mt-1 text-2xl font-black">{totalScore} / {config.totalPoints}</p><p className="mt-1 text-[10px] text-white/55">{completedAt ? new Date(completedAt).toLocaleString('ar-IQ') : ''}</p></div>
                {config.questions.map((question, index) => {
                  const questionPercentage = Math.round((scoreFor(question) / Math.max(1, question.points)) * 100);
                  const questionTone = tone(questionPercentage);
                  const answer = answers[question.id]?.trim() || results[question.id]?.extractedText?.trim() || results[question.id]?.identifiedTextOrSteps?.join(' ') || (images[question.id] ? 'تم رفع الصورة، لكن لم يُستخرج منها نص قابل للتقييم.' : 'لم تُرفع إجابة.');
                  return <section key={question.id} className="border p-4" style={{ borderColor: questionTone.border, backgroundColor: questionTone.bg }}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold" style={{ color: questionTone.text }}>السؤال {index + 1} — {question.typeLabel}</p><p className="mt-1 text-sm font-black text-white">{question.prompt}</p></div><div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2 text-xs font-black" style={{ borderColor: questionTone.border, color: questionTone.text }}>{scoreFor(question)}<span className="text-[9px]">/{question.points}</span></div></div><p className="mt-3 text-xs leading-6 text-white/85">جواب الطالب: {answer}</p></section>;
                })}
                <p className="pb-4 text-center text-xs font-bold text-emerald-200">تم تسجيل النتيجة في إشعارات الحساب.</p>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
          {isLoading || !config ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center"><Loader2 className="h-9 w-9 animate-spin text-[#6c4b88]" /><p className="text-sm font-bold text-[#6f6963]">جاري إعداد {mode === 'monthly' ? 'الامتحان الشهري' : 'الامتحان الشامل'}...</p></div>
          ) : !config.isAvailable ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"><FileCheck2 className="h-10 w-10 text-[#6c4b88]" /><h2 className="text-lg font-black text-[#302d34]">الامتحان غير متوفر</h2><p className="max-w-sm text-sm leading-7 text-[#6f6963]">لم نجد عددًا كافيًا من الأسئلة المتنوعة في الملفات المحددة.</p><button type="button" onClick={onClose} className="bg-[#6c4b88] px-6 py-3 text-xs font-black text-white">حسنًا</button></div>
          ) : (
            <main className="mx-auto max-w-2xl space-y-4 px-4 pb-28 pt-4">
              <div className="flex items-center justify-between border-b border-[#dedbd0] pb-3 text-xs font-bold text-[#716b65]"><span>{config.subject}</span><span className="text-[#6c4b88]">{config.questions.length} أسئلة متنوعة · {config.totalPoints} درجة</span></div>
              {errors.general && <p className="border border-[#e3a1a8] bg-[#fff0f1] p-3 text-xs font-bold text-[#a33846]">{errors.general}</p>}
              {config.questions.map((question, index) => (
                <section key={question.id} className="relative overflow-hidden border border-[#ddd9ce] bg-[#fbfaf4] shadow-[0_8px_24px_rgba(63,52,38,0.12)]" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(181,191,194,0.42) 34px)' }}>
                  <div className="relative z-10 px-5 pb-5 pt-7 sm:px-8">
                    <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black leading-8 text-[#2f2d31]">س{index + 1}: {question.prompt}</h2><p className="mt-1 text-xs font-black text-[#6c4b88]">نوع السؤال: {question.typeLabel} · {question.points} درجة</p></div><span className="shrink-0 rounded-full border border-[#d8cce1] bg-[#f0e9f5] px-2 py-1 text-[10px] font-black text-[#6c4b88]">ف{question.sourceChapter}</span></div>
                    <textarea value={answers[question.id] || ''} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder="الإجابة: اكتب إجابتك هنا..." rows={4} disabled={status !== 'idle'} className="mt-4 w-full resize-y bg-transparent text-sm font-semibold leading-[34px] text-[#343238] placeholder-[#9a9188] outline-none disabled:opacity-70" />
                    {errors[question.id] && <p className="mt-2 border border-[#e3a1a8] bg-[#fff0f1] p-2 text-xs font-bold text-[#a33846]">{errors[question.id]}</p>}
                    {images[question.id] && <div className="mt-3 border border-[#d4ccb9] bg-white/80 p-3"><div className="flex items-center justify-between gap-2 text-xs font-black text-[#514a42]"><span className="flex items-center gap-1.5"><ImageIcon className="h-4 w-4 text-[#6c4b88]" /> تم حفظ صورة الإجابة</span><button type="button" onClick={() => removeImage(question.id)} className="flex items-center gap-1 text-[#a33846]" disabled={status !== 'idle'}><Trash2 className="h-3.5 w-3.5" /> حذف</button></div><img src={images[question.id]!.previewUrl} alt={`صورة إجابة السؤال ${index + 1}`} className="mt-2 max-h-48 w-full object-contain" /></div>}
                    <input ref={(element) => { inputRefs.current[question.id] = element; }} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => { if (event.target.files?.[0]) selectImage(question.id, event.target.files[0]); event.currentTarget.value = ''; }} />
                    <button type="button" onClick={() => inputRefs.current[question.id]?.click()} disabled={status !== 'idle'} className="mt-4 flex w-full items-center justify-center gap-2 bg-[#6c4b88] px-4 py-3 text-sm font-black text-white transition hover:bg-[#5b3d76] disabled:pointer-events-none disabled:opacity-45"><Camera className="h-5 w-5" />{images[question.id] ? 'تغيير صورة الحل' : 'تصوير ورقة الحل'}</button>
                  </div>
                </section>
              ))}
            </main>
          )}
        </div>

        {config?.isAvailable && status !== 'completed' && <div className="relative z-20 border-t border-[#d7d3ca] bg-[#f8f7f1]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_18px_rgba(63,52,38,0.10)] backdrop-blur"><div className="mx-auto flex max-w-2xl items-center gap-3 px-4"><div className="flex min-w-[76px] flex-col items-center justify-center text-[#5d5650]"><span className="text-[10px] font-bold">الوقت المتبقي</span><span className={`text-lg font-black ${timeLeft < 180 ? 'text-[#b14450]' : 'text-[#6c4b88]'}`}>{formatTime(timeLeft)}</span></div><button type="button" onClick={() => setStatus('confirming')} disabled={status !== 'idle'} className="flex flex-1 items-center justify-center gap-2 bg-[#6c4b88] px-4 py-3.5 text-sm font-black text-white transition hover:bg-[#5b3d76] disabled:pointer-events-none disabled:opacity-45"><PenTool className="h-4 w-4" /> تسليم الامتحان</button></div></div>}
      </div>
    </div>
  );
};
