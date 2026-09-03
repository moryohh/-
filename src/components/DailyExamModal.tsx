import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ArrowRight,
  Clock,
  CheckCircle2,
  RotateCcw,
  Award,
  PenTool,
  Camera,
  Trash2,
  Loader2,
  FileCheck2,
  ImageIcon,
  MessageSquareText,
} from 'lucide-react';
import { DailyExamConfig, fetchDailyExamForLesson } from '../services/dailyExamService';
import { DailyExamAuthenticIcon } from './GameIcons';
import { gameAudio } from '../utils/gameAudio';
import {
  submitSolutionImageForEvaluation,
  ImageEvaluationResult,
} from '../services/imageEvaluationService';
import { useAppTheme } from '../services/themeService';
import { OpenLessonContext } from '../types';
import { getDailyExamReward } from '../services/pointsService';

interface DailyExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  category?: string;
  customExam?: DailyExamConfig;
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

export const DailyExamModal: React.FC<DailyExamModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  category = 'المادة التعليمية',
  customExam,
  openLessonContext,
  onScoreUpdate,
  onAssessmentResult,
  onDailyExamCompleted,
}) => {
  const { theme } = useAppTheme();
  const [exam, setExam] = useState<DailyExamConfig | null>(customExam || null);
  const [isLoading, setIsLoading] = useState(false);
  const [examRound, setExamRound] = useState(0);

  // Student Drafts (textual notes per branch)
  const [studentDrafts, setStudentDrafts] = useState<Record<string, string>>({});

  // Question-Level Image Attachments & Evaluation (One image for Q1 covering both definitions, One for Q2)
  const [questionImages, setQuestionImages] = useState<
    Record<'q1' | 'q2', { file: File; previewUrl: string } | null>
  >({
    q1: null,
    q2: null,
  });
  const [evaluatedQuestions, setEvaluatedQuestions] = useState<
    Record<'q1' | 'q2', ImageEvaluationResult | null>
  >({
    q1: null,
    q2: null,
  });
  const [questionErrors, setQuestionErrors] = useState<Record<'q1' | 'q2', string>>({
    q1: '',
    q2: '',
  });

  // Hidden camera/file input refs
  const q1FileInputRef = useRef<HTMLInputElement | null>(null);
  const q2FileInputRef = useRef<HTMLInputElement | null>(null);

  // Timer State (15 min default = 900 sec)
  const [timeLeft, setTimeLeft] = useState(900);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'confirming' | 'processing' | 'completed'>('idle');
  const [processingPhase, setProcessingPhase] = useState(0);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const submissionLockRef = useRef(false);
  const rewardIssuedRef = useRef(false);
  const assessmentReportedRef = useRef(false);
  const submissionIdRef = useRef<string | null>(null);

  // Load exam data on mount / open
  useEffect(() => {
    if (!isOpen) return;

    // Each opening starts a clean submission state. This prevents a result
    // from a previous round from being attached to an empty question.
    submissionLockRef.current = false;
    rewardIssuedRef.current = false;
    assessmentReportedRef.current = false;
    submissionIdRef.current = null;
    setEvaluatedQuestions({ q1: null, q2: null });
    setQuestionErrors({ q1: '', q2: '' });
    setQuestionImages({ q1: null, q2: null });
    setStudentDrafts({});
    setIsSubmitted(false);
    setSubmitState('idle');
    setCompletedAt(null);
    setTimeLeft(900);
    setIsTimerRunning(true);
    setProcessingPhase(0);

    if (customExam) {
      setExam(customExam);
      setIsLoading(false);
      return;
    }

    setExam(null);
      setIsLoading(true);
      if (openLessonContext) {
        fetchDailyExamForLesson(openLessonContext)
          .then((res) => {
            setExam(res);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      } else {
        const subjectId = category;
        fetchDailyExamForLesson(
          subjectId,
          lessonId,
          lessonTitle,
          subjectId
        )
          .then((res) => {
            setExam(res);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
  }, [isOpen, customExam, examRound, category, lessonId, lessonTitle, openLessonContext?.subjectId, openLessonContext?.chapterNumber, openLessonContext?.lessonNumber, openLessonContext?.lessonId]);

  useEffect(() => {
    if (submitState !== 'processing') return;
    setProcessingPhase(0);
    const phaseTimer = setInterval(() => {
      setProcessingPhase((previous) => (previous + 1) % 3);
    }, 1400);
    return () => clearInterval(phaseTimer);
  }, [submitState]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !isTimerRunning || isSubmitted || !exam?.isAvailable) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
            if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          setSubmitState('confirming');
          gameAudio.playClick();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isTimerRunning, isSubmitted]);

  if (!isOpen) return null;

  const handleDraftChange = (branchId: string, value: string) => {
    setStudentDrafts((prev) => ({
      ...prev,
      [branchId]: value,
    }));
  };

  const handleImageSelected = (qKey: 'q1' | 'q2', file: File) => {
    if (submitState !== 'idle' || isSubmitted) return;
    if (!file.type.startsWith('image/')) {
      setQuestionErrors((prev) => ({
        ...prev,
        [qKey]: 'يُسمح فقط بملفات الصور (PNG, JPEG, WEBP).',
      }));
      return;
    }

    setQuestionErrors((prev) => ({ ...prev, [qKey]: '' }));
    setEvaluatedQuestions((prev) => ({ ...prev, [qKey]: null }));
    const objectUrl = URL.createObjectURL(file);
    setQuestionImages((prev) => ({
      ...prev,
      [qKey]: { file, previewUrl: objectUrl },
    }));
    gameAudio.playClick();
  };

  const handleRemoveImage = (qKey: 'q1' | 'q2') => {
    if (submitState !== 'idle') return;
    gameAudio.playClick();
    setQuestionImages((prev) => ({
      ...prev,
      [qKey]: null,
    }));
    setEvaluatedQuestions((prev) => ({
      ...prev,
      [qKey]: null,
    }));
    setQuestionErrors((prev) => ({ ...prev, [qKey]: '' }));
  };

  const evaluateUploadedImage = async (qKey: 'q1' | 'q2', submissionId: string): Promise<ImageEvaluationResult | null> => {
    if (!exam || !questionImages[qKey]) return null;

    if (qKey === 'q1') {
      const q1TotalPoints = exam.question1.branches.reduce((acc, b) => acc + b.points, 0);
      const combinedPrompt = exam.question1.branches
        .map((b, idx) => `الفرع ${idx + 1} (${b.label}): ${b.prompt}`)
        .join('\n');
      const combinedModelAnswer = exam.question1.branches
        .map((b, idx) => `جواب الفرع ${idx + 1} (${b.label}):\n${b.modelAnswer}`)
        .join('\n\n');

      return submitSolutionImageForEvaluation({
        imageFile: questionImages.q1.file,
        branchId: 'q1_unified',
        source: 'daily_exam',
        questionPrompt: combinedPrompt,
        modelAnswer: combinedModelAnswer,
        branchPoints: q1TotalPoints,
        subject: exam.subject,
        lessonTitle: exam.lessonTitle,
        submissionId,
        questionId: 'q1',
      });
    }

    const branch = exam.question2.branches[0];
    if (!branch) return null;

    return submitSolutionImageForEvaluation({
      imageFile: questionImages.q2.file,
      branchId: branch.id,
      source: 'daily_exam',
      questionPrompt: branch.prompt,
      modelAnswer: branch.modelAnswer,
      branchPoints: branch.points,
      subject: exam.subject,
      lessonTitle: exam.lessonTitle,
      submissionId,
      questionId: 'q2',
    });
  };

  const handleSubmitExam = () => {
    if (submissionLockRef.current || submitState !== 'idle' || isSubmitted) return;
    setSubmitState('confirming');
  };

  const getResultsTotal = (results: Record<'q1' | 'q2', ImageEvaluationResult | null>) =>
    ([results.q1, results.q2].filter((result): result is ImageEvaluationResult => Boolean(result?.success)))
      .reduce((sum, result) => sum + (result.score || 0), 0);

  const confirmSubmitExam = async () => {
    if (submissionLockRef.current || submitState !== 'confirming' || !exam) return;

    submissionLockRef.current = true;
    const submissionId = `submission_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    submissionIdRef.current = submissionId;
    setProcessingPhase(0);
    setSubmitState('processing');
    setQuestionErrors({ q1: '', q2: '' });
    setIsTimerRunning(false);

    const nextEvaluations: Record<'q1' | 'q2', ImageEvaluationResult | null> = {
      // Never carry a previous evaluation into a submission where that image
      // is absent. Text-only or unanswered branches remain ungraded.
      q1: questionImages.q1 ? evaluatedQuestions.q1 : null,
      q2: questionImages.q2 ? evaluatedQuestions.q2 : null,
    };

    try {
      for (const qKey of ['q1', 'q2'] as const) {
        if (questionImages[qKey] && !nextEvaluations[qKey]) {
          const result = await evaluateUploadedImage(qKey, submissionId);
          if (!result?.success) {
            setQuestionErrors((prev) => ({
              ...prev,
              [qKey]: result?.error || result?.feedback || 'تعذر تصحيح الصورة. ستُسجل الإجابة دون درجة لهذا السؤال.',
            }));
            nextEvaluations[qKey] = result;
            continue;
          }
          nextEvaluations[qKey] = result;
        }
      }

      setEvaluatedQuestions(nextEvaluations);
      const score = getResultsTotal(nextEvaluations);
      const totalScore = Number(exam.totalPoints) || 1;
      const finishedAt = new Date().toISOString();
      setCompletedAt(finishedAt);
      setIsSubmitted(true);
      setSubmitState('completed');
      onDailyExamCompleted?.({
        score,
        totalScore,
        percentage: Math.round((score / totalScore) * 100),
        subject: exam.subject,
        lessonTitle: exam.lessonTitle,
        completedAt: finishedAt,
      });
      if (!rewardIssuedRef.current && [nextEvaluations.q1, nextEvaluations.q2].every((result) => result?.success)) {
        rewardIssuedRef.current = true;
        onScoreUpdate?.(getDailyExamReward((score / totalScore) * 100));
        if (!assessmentReportedRef.current) {
          assessmentReportedRef.current = true;
          onAssessmentResult?.(score, totalScore);
        }
      }
      gameAudio.playVictoryFanfare();
    } catch {
      submissionLockRef.current = false;
      setSubmitState('idle');
      setIsTimerRunning(true);
      setQuestionErrors({
        q1: questionImages.q1 ? 'تعذر إكمال معالجة صورة السؤال الأول.' : '',
        q2: questionImages.q2 ? 'تعذر إكمال معالجة صورة السؤال الثاني.' : '',
      });
    }
  };

  const handleRestartExam = () => {
    gameAudio.playClick();
    submissionLockRef.current = false;
    rewardIssuedRef.current = false;
    assessmentReportedRef.current = false;
    submissionIdRef.current = null;
    setTimeLeft(900);
    setIsTimerRunning(true);
    setIsSubmitted(false);
    setSubmitState('idle');
    setCompletedAt(null);
    setExamRound((prev) => prev + 1);
    setStudentDrafts({});
    setQuestionImages({ q1: null, q2: null });
    setEvaluatedQuestions({ q1: null, q2: null });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Evaluated summary
  const validEvaluations = [evaluatedQuestions.q1, evaluatedQuestions.q2].filter(
    (ev): ev is ImageEvaluationResult => ev !== null
  );
  const totalEarnedPoints = validEvaluations.reduce((sum, res) => sum + (res.score || 0), 0);
  const totalEvaluatedCount = validEvaluations.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#272631]/70 backdrop-blur-md flex items-end sm:items-center justify-center p-1.5 sm:p-4 animate-in fade-in duration-200 font-cairo select-none">
      <div
        className="w-full max-w-2xl rounded-[1.75rem] overflow-hidden shadow-2xl text-right relative max-h-[95vh] flex flex-col transition-all duration-300 border"
        style={{
          backgroundColor: '#F8F7F2',
          borderColor: '#E2DDD2',
          boxShadow: '0 22px 70px rgba(28, 27, 36, 0.32)',
          color: '#29272E',
        }}
      >
        {/* ======================================================== */}
        {/* MODAL TOP BAR */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E2DDD2] bg-[#F8F7F2] px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <DailyExamAuthenticIcon className="w-11 h-11" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#29272E]">
                  الامتحان اليومي الوزاري ✍️
                </h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${theme.colors.primary}20`,
                    borderColor: `${theme.colors.primary}40`,
                    color: theme.colors.primary,
                  }}
                >
                  سؤالان منهجيان
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-[#77727C]">
                {category} • {lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Timer Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                timeLeft < 180
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'text-white'
              }`}
              style={
                timeLeft >= 180
                  ? {
                      backgroundColor: `${theme.colors.primary}25`,
                      borderColor: `${theme.colors.primary}50`,
                      color: theme.colors.primary,
                    }
                  : {}
              }
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={onClose}
              disabled={submitState === 'processing'}
              className="rounded-full border border-[#DAD4C8] bg-[#ECE9E2] p-2 text-[#625D66] transition-colors hover:bg-[#E3DED4] hover:text-[#29272E] disabled:pointer-events-none disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUBMISSION STATES */}
        {/* ======================================================== */}
        {submitState === 'confirming' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center rounded-3xl bg-slate-950/90 p-5 text-center backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-amber-300/40 bg-slate-900 p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                <FileCheck2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-white">تأكيد تسليم الامتحان</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                بعد التأكيد ستبدأ معالجة صور الإجابات، ولن تستطيع إرسال الامتحان مرة أخرى أثناء المعالجة.
              </p>
              <p className="mt-2 text-xs font-bold text-amber-200">
                الصور المختارة: {[questionImages.q1, questionImages.q2].filter(Boolean).length}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitState('idle');
                    setIsTimerRunning(true);
                  }}
                  className="rounded-2xl border border-slate-500/60 bg-slate-800 px-3 py-3 text-xs font-black text-slate-200 transition hover:bg-slate-700"
                >
                  مراجعة الإجابات
                </button>
                <button
                  type="button"
                  onClick={confirmSubmitExam}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-3 text-xs font-black text-slate-950 transition hover:brightness-110"
                >
                  تأكيد وإرسال
                </button>
              </div>
            </div>
          </div>
        )}

        {submitState === 'processing' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center rounded-3xl bg-slate-950/95 p-5 text-center backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-cyan-300/30 bg-slate-900 p-7 shadow-2xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <h3 className="text-xl font-black text-white">{['جارٍ جلب النتيجة', 'جارٍ التدقيق في الصور', 'جارٍ التصحيح وحساب الدرجة'][processingPhase]}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                تم استلام إجابتك. يرجى الانتظار وعدم إغلاق الاختبار حتى تكتمل المراحل الثلاث.
              </p>
              <div className="mt-5 space-y-2 text-right">
                {['جلب النتيجة', 'التدقيق في الصور', 'التصحيح وحساب الدرجة'].map((phase, index) => (
                  <div key={phase} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${index === processingPhase ? 'bg-cyan-300/20 text-cyan-100' : index < processingPhase ? 'bg-emerald-300/10 text-emerald-200' : 'bg-white/5 text-slate-500'}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${index <= processingPhase ? 'bg-cyan-300 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                      {index < processingPhase ? '✓' : index + 1}
                    </span>
                    {index === processingPhase ? `جارٍ ${phase}` : index < processingPhase ? `اكتمل ${phase}` : phase}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {submitState === 'completed' && exam && (
          <div className="absolute inset-0 z-50 flex flex-col rounded-3xl bg-slate-950/98 p-4 sm:p-6 text-right text-white backdrop-blur-md">
            {(() => {
              // Only an evaluation tied to an image from this submission is
              // allowed to affect the result screen. This is a final guard
              // against displaying stale authentication/OCR errors.
              const q1Evaluation = questionImages.q1 ? evaluatedQuestions.q1 : null;
              const q2Evaluation = questionImages.q2 ? evaluatedQuestions.q2 : null;
              const visibleEvaluations: Record<'q1' | 'q2', ImageEvaluationResult | null> = {
                q1: q1Evaluation,
                q2: q2Evaluation,
              };
              const finalScore = getResultsTotal(visibleEvaluations);
              const finalTotal = Number(exam.totalPoints) || 1;
              const finalPercentage = Math.round((finalScore / finalTotal) * 100);
              const q1Max = exam.question1.branches.reduce((acc, branch) => acc + branch.points, 0);
              const q2Max = exam.question2.branches.reduce((acc, branch) => acc + branch.points, 0);
              const cleanAnswerText = (value: string) => value
                .replace(/--- OCR Start ---|--- OCR End ---/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 1800);
              const formatStudentAnswer = (branchId: string, evaluation: ImageEvaluationResult | null) => {
                const draft = studentDrafts[branchId]?.trim();
                if (draft) return draft;
                if (evaluation?.identifiedTextOrSteps?.length) return cleanAnswerText(evaluation.identifiedTextOrSteps.join(' '));
                if (evaluation?.extractedText?.trim()) return cleanAnswerText(evaluation.extractedText);
                if (evaluation && !evaluation.success) return 'تم رفع الصورة، لكن لم يُستخرج منها نص قابل للتقييم.';
                return 'لم تُرفع صورة أو إجابة لهذا السؤال.';
              };
              const getEvaluationPercentage = (evaluation: ImageEvaluationResult | null, max: number) => {
                if (!evaluation) return 0;
                if (Number.isFinite(evaluation.percentage)) return Math.max(0, Math.min(100, Math.round(evaluation.percentage)));
                return Math.max(0, Math.min(100, Math.round(((evaluation.score || 0) / Math.max(1, max)) * 100)));
              };
              const getScoreTone = (percentage: number) => {
                if (percentage < 50) {
                  return {
                    border: '#fb7185',
                    background: 'rgba(127, 29, 29, 0.28)',
                    accent: '#fecdd3',
                    iconBackground: 'rgba(244, 63, 94, 0.2)',
                    label: 'يحتاج مراجعة',
                  };
                }
                if (percentage <= 75) {
                  return {
                    border: '#facc15',
                    background: 'rgba(113, 63, 18, 0.28)',
                    accent: '#fef08a',
                    iconBackground: 'rgba(234, 179, 8, 0.2)',
                    label: 'متوسط',
                  };
                }
                return {
                  border: '#4ade80',
                  background: 'rgba(20, 83, 45, 0.3)',
                  accent: '#bbf7d0',
                  iconBackground: 'rgba(34, 197, 94, 0.2)',
                  label: 'جيد',
                };
              };
              const finalTone = getScoreTone(finalPercentage);
              const q1Tone = getScoreTone(getEvaluationPercentage(q1Evaluation, q1Max));
              const q2Tone = getScoreTone(getEvaluationPercentage(q2Evaluation, q2Max));
              const getProviderLabel = (evaluation: ImageEvaluationResult | null) => {
                if (!evaluation?.providerSlot) return '';
                if (evaluation.providerSlot.includes('vercel')) return 'المسار: Vercel';
                if (evaluation.providerSlot.includes('cloudflare')) return 'المسار: Cloudflare';
                return `المسار: ${evaluation.providerSlot}`;
              };
              const getEvaluationDiagnosis = (evaluation: ImageEvaluationResult | null) => {
                if (!evaluation) return 'لم تُرفع صورة لهذا السؤال؛ لا توجد قراءة OCR.';
                if (!evaluation.success) {
                  const details = [
                    evaluation.feedback || 'تم رفع الصورة، لكن لم تبدأ قراءة OCR.',
                    getProviderLabel(evaluation),
                    evaluation.failureCode ? `رمز التشخيص: ${evaluation.failureCode}` : '',
                    evaluation.failureReasons?.length ? `المحاولات: ${evaluation.failureReasons.join(' | ')}` : '',
                  ].filter(Boolean);
                  return details.join(' — ');
                }
                return `${evaluation.feedback || 'تمت قراءة الصورة وتقييمها.'}${getProviderLabel(evaluation) ? ` — ${getProviderLabel(evaluation)}` : ''}`;
              };
              return (
                <>
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs font-bold text-cyan-300">النتيجة النهائية للاختبار اليومي</p>
                      <h2 className="mt-1 text-xl font-black">{exam.subject} — {exam.lessonTitle}</h2>
                      <p className="mt-1 text-xs text-slate-400">
                        تاريخ التسليم: {completedAt ? new Date(completedAt).toLocaleString('ar-IQ') : 'الآن'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-1.5 rounded-2xl border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/20"
                      >
                        <ArrowRight className="h-4 w-4" />
                        <span>العودة</span>
                      </button>
                      <div
                        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 text-center shadow-lg"
                        style={{ borderColor: finalTone.border, backgroundColor: finalTone.background, boxShadow: `0 0 18px ${finalTone.border}55` }}
                      >
                        <span className="text-xl font-black" style={{ color: finalTone.accent }}>{finalPercentage}</span>
                        <span className="text-[10px] font-bold" style={{ color: finalTone.accent }}>من 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-center">
                      <p className="text-[11px] font-bold text-amber-200">درجتك في الامتحان</p>
                      <p className="mt-1 text-xl font-black text-white">{finalScore} / {finalTotal}</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-3 text-center">
                      <p className="text-[11px] font-bold text-cyan-200">نسبة الإنجاز</p>
                      <p className="mt-1 text-xl font-black text-white">{finalPercentage}%</p>
                    </div>
                  </div>

                  <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                      <div className="rounded-3xl border-2 p-4 transition-colors" style={{ borderColor: q1Tone.border, backgroundColor: q1Tone.background }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-300/20 text-sm font-black text-indigo-100">س1</div>
                          <div>
                            <h3 className="text-base font-black">{exam.question1.title}</h3>
                            <p className="text-[11px]" style={{ color: q1Tone.accent }}>السؤال والجواب {getProviderLabel(q1Evaluation) ? `• ${getProviderLabel(q1Evaluation)}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 text-center" style={{ borderColor: q1Tone.border, backgroundColor: q1Tone.iconBackground }}>
                          <span className="text-sm font-black" style={{ color: q1Tone.accent }}>{q1Evaluation?.success ? q1Evaluation.score : 0}</span>
                          <span className="text-[9px]" style={{ color: q1Tone.accent }}>/{q1Max}</span>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {exam.question1.branches.map((branch) => (
                          <div key={branch.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 text-xs font-black text-indigo-100">
                                <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-200" />
                                <span>السؤال: {branch.prompt}</span>
                              </div>
                              <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-amber-200">{branch.points} درجات</span>
                            </div>
                            <div className="mt-2 flex items-start gap-2 text-xs leading-6" style={{ color: q1Tone.accent }}>
                              <MessageSquareText className="mt-1 h-4 w-4 shrink-0" />
                              <span>جواب الطالب: {formatStudentAnswer(branch.id, q1Evaluation)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 rounded-2xl bg-black/20 p-3 text-xs leading-6 text-slate-300">التشخيص: {getEvaluationDiagnosis(q1Evaluation)}</p>
                    </div>

                      <div className="rounded-3xl border-2 p-4 transition-colors" style={{ borderColor: q2Tone.border, backgroundColor: q2Tone.background }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-cyan-200 bg-cyan-300/20 text-sm font-black text-cyan-100">س2</div>
                          <div>
                            <h3 className="text-base font-black">{exam.question2.title}</h3>
                            <p className="text-[11px]" style={{ color: q2Tone.accent }}>السؤال والجواب {getProviderLabel(q2Evaluation) ? `• ${getProviderLabel(q2Evaluation)}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 text-center" style={{ borderColor: q2Tone.border, backgroundColor: q2Tone.iconBackground }}>
                          <span className="text-sm font-black" style={{ color: q2Tone.accent }}>{q2Evaluation?.success ? q2Evaluation.score : 0}</span>
                          <span className="text-[9px]" style={{ color: q2Tone.accent }}>/{q2Max}</span>
                        </div>
                      </div>
                      {exam.question2.branches.map((branch) => (
                          <div key={branch.id} className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 text-xs font-black text-cyan-100">
                              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                              <span>السؤال: {branch.prompt}</span>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-amber-200">{branch.points} درجات</span>
                          </div>
                          <div className="mt-2 flex items-start gap-2 text-xs leading-6" style={{ color: q2Tone.accent }}>
                            <MessageSquareText className="mt-1 h-4 w-4 shrink-0" />
                            <span>جواب الطالب: {formatStudentAnswer(branch.id, q2Evaluation)}</span>
                          </div>
                        </div>
                      ))}
                      <p className="mt-3 rounded-2xl bg-black/20 p-3 text-xs leading-6 text-slate-300">التشخيص: {getEvaluationDiagnosis(q2Evaluation)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="text-xs font-bold text-emerald-200">تم تسجيل النتيجة في إشعارات الحساب.</p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-5 py-3 text-xs font-black text-slate-950 transition hover:brightness-110"
                    >
                      إغلاق والعودة
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL MAIN CONTENT BODY */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto bg-[#F1F2F5] px-3 py-4 sm:px-5 space-y-4 pr-1 no-scrollbar">


          {isLoading || !exam ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#6A568D]">
                جاري إعداد وتجهيز سبورة الامتحان اليومي...
              </p>
            </div>
          ) : !exam.isAvailable ? (
            <div className="py-20 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-400/10 text-amber-300">
                <FileCheck2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-[#2E2B34]">الاختبار اليومي غير متوفر</h3>
              <p className="mx-auto max-w-md text-sm leading-7 text-[#6F6A73]">
                لا يوجد ملف منهج أو أسئلة اختبارية لهذا الدرس حاليًا. يرجى رفع ملف JSON الخاص بالدرس أولًا.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 text-xs font-black text-white transition-transform active:scale-95"
              >
                حسنًا
              </button>
            </div>
          ) : (
            <>
              {/* Exam Info Strip */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E4DFD5] bg-white px-4 py-3 text-xs font-semibold text-[#67636B] shadow-sm">
                <div className="flex items-center gap-3">
                  <span>
                    المادة: <b className="text-[#65478E]">{exam.subject}</b>
                  </span>
                  <span>•</span>
                  <span>
                    الدرجة الكلية: <b className="text-[#9A6A16]">{exam.totalPoints} درجة</b>
                  </span>
                </div>
                <div className="rounded-lg border border-[#D9DFEC] bg-[#F1F3F8] px-2.5 py-1 text-[11px] text-[#5B6276]">
                  الزمن المقرر: {exam.durationMinutes} دقيقة
                </div>
              </div>

              {/* Status Alert when Finished */}
              {isSubmitted && (
                <div className="flex items-center justify-between rounded-2xl border border-[#BFE1C8] bg-[#F0FAF2] p-3.5 text-xs text-[#3F7A50] animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#3D9A58]" />
                    <div>
                      <p className="text-sm font-black text-[#27653A]">تم تسليم الامتحان بنجاح!</p>
                      <p className="mt-0.5 text-[11px] text-[#568466]">
                        تم كشف دليل الأجوبة النموذجية للمراجعة والتصحيح الذاتي بالأسفل.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRestartExam}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#BFE1C8] bg-[#E1F3E5] px-3 py-1.5 text-xs font-bold text-[#357448] transition-all hover:bg-[#D4EDDA]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة الاختبار</span>
                  </button>
                </div>
              )}

              {/* Evaluated Images Score Bar */}
              {totalEvaluatedCount > 0 && (
                <div className="flex items-center justify-between rounded-2xl border border-[#E8D5A8] bg-[#FFF9EA] p-3 text-xs text-[#8B681F] animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <Award className="h-4 w-4 shrink-0 text-[#B4872C]" />
                    <span>
                      تم تصحيح {totalEvaluatedCount} سؤال ورقي • درجاتك المحصلة:{' '}
                      <b className="font-black text-[#4B3B20] underline">{totalEarnedPoints}</b> من {exam.totalPoints} درجة
                    </span>
                  </div>
                  <span className="rounded-lg bg-[#E8C56B] px-2 py-0.5 text-[10px] font-black text-[#4B3B20]">
                    {Math.round((totalEarnedPoints / (Number(exam.totalPoints) || 1)) * 100)}%
                  </span>
                </div>
              )}

              {/* ======================================================== */}
              {/* 1. FIRST WHITEBOARD / السبورة الأولى (السؤال الأول) */}
              {/* ONE SHARED CAMERA / PHOTO UPLOAD FOR BOTH DEFINITIONS */}
              {/* ======================================================== */}
              <div className="overflow-hidden rounded-[1.35rem] border border-[#DED5C3] bg-[#FAF6E8] text-slate-900 shadow-[0_8px_24px_rgba(93,77,46,0.12)] transition-all">
                {/* Hidden Camera Input for Q1 */}
                <input
                  type="file"
                  ref={q1FileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageSelected('q1', e.target.files[0]);
                    }
                  }}
                />

                {/* Whiteboard Top Header Bar with Sleek Unified Camera Button */}
                <div className="bg-[#EFE9D5] border-b-2 border-[#DDD3BC] px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3A3833] border border-[#24221E]/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3A3833] border border-[#24221E]/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3A3833] border border-[#24221E]/30" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#3A3428] text-[#FAF6E8] text-[11px] font-black px-2 py-0.5 rounded-md">
                          س1
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-[#3A3428]">
                          {exam.question1.title}
                        </h4>
                      </div>
                      <p className="text-[11px] font-bold text-[#7A6C54] mt-0.5">
                        {exam.question1.instruction}
                      </p>
                    </div>
                  </div>

                  {/* Sleek Elegant Camera Button (Serves both definitions in Q1) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => q1FileInputRef.current?.click()}
                      className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-[#76539E] bg-[#65478E] px-3.5 py-1.5 text-xs font-black text-white shadow-md transition-all hover:bg-[#563A7D] hover:border-[#B391D3] active:scale-95"
                      title="تصوير ورقة إجابة السؤال الأول بالكامل بكاميرا الهاتف"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15 transition-transform group-hover:scale-110">
                        <Camera className="h-3 w-3 text-white" />
                      </div>
                      <span>
                        {questionImages.q1 ? 'تغيير صورة الحل' : 'تصوير ورقة الحل'}
                      </span>
                    </button>

                    <span className="text-[11px] bg-[#E3D9C0] text-[#423927] border border-[#C5B99B] font-black px-2.5 py-1 rounded-xl shrink-0 hidden sm:inline-block">
                      {exam.question1.branches.reduce((acc, b) => acc + b.points, 0)} درجات
                    </span>
                  </div>
                </div>

                {/* Whiteboard Canvas Paper Body (Lined) */}
                <div
                  className="p-4 sm:p-5 space-y-5 relative"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 29px, #E6DEC8 30px)',
                    backgroundPosition: '0 10px',
                  }}
                >
                  {/* Notebook Red Margin Line on the right */}
                  <div className="absolute top-0 bottom-0 right-10 sm:right-12 w-[1.5px] bg-rose-400/40 pointer-events-none" />

                  {/* Branches / Definitions of Question 1 */}
                  {exam.question1.branches.map((branch, bIdx) => {
                    const draft = studentDrafts[branch.id] || '';

                    return (
                      <div key={branch.id} className="space-y-2 relative z-10">
                        {/* Branch Sub-Header inside Notebook */}
                        <div className="bg-[#EAE2CE]/90 border border-[#D5CABB] rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#3A3428] text-white flex items-center justify-center text-xs font-black shrink-0">
                              {branch.label}
                            </span>
                            <span className="text-xs sm:text-sm font-black text-[#2B271E]">
                              {branch.prompt}
                            </span>
                          </div>

                          <span className="text-[10px] text-[#6E5B3D] font-bold bg-[#DFD4BC] px-2 py-0.5 rounded-md">
                            {branch.points} درجات
                          </span>
                        </div>

                        {/* Text Draft Area on notebook lines */}
                        <div className="pr-6 sm:pr-8">
                          <textarea
                            value={draft}
                            onChange={(e) => handleDraftChange(branch.id, e.target.value)}
                            placeholder="الإجابة:"
                            rows={2}
                            className="w-full bg-transparent text-slate-900 placeholder-[#8C8370] font-semibold text-xs sm:text-sm leading-[30px] focus:outline-none resize-y"
                          />
                        </div>

                        {/* Model answer revealed ONLY after submission */}
                        {isSubmitted && (
                          <div className="bg-[#E4D9BD] border border-[#CBBDA0] p-3 rounded-xl space-y-1 text-xs mr-6 sm:mr-8 animate-in fade-in">
                            <span className="text-[11px] font-black text-[#4A3D2A] flex items-center gap-1">
                              <FileCheck2 className="w-3.5 h-3.5 text-[#4A3D2A]" />
                              الإجابة النموذجية للفرع ({branch.label}):
                            </span>
                            <p className="text-[#2B2317] text-xs leading-relaxed whitespace-pre-line font-bold">
                              {branch.modelAnswer}
                            </p>
                          </div>
                        )}

                        {bIdx < exam.question1.branches.length - 1 && (
                          <div className="border-b border-[#DDD3BC] pt-1" />
                        )}
                      </div>
                    );
                  })}

                  {/* Error in Q1 */}
                  {questionErrors.q1 && (
                    <div className="text-xs text-rose-700 bg-rose-100 border border-rose-300 p-2 rounded-lg mr-6 sm:mr-8 relative z-10">
                      {questionErrors.q1}
                    </div>
                  )}

                  {/* Shared Attached Image Card for Question 1 */}
                  {questionImages.q1 && (
                    <div className="bg-white/95 border-2 border-[#D9CEB4] rounded-xl p-3 shadow-md space-y-2 mr-6 sm:mr-8 relative z-10 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          <span>
                            ورقة حل السؤال الأول بالكامل (
                            {exam.question1.branches.reduce((acc, b) => acc + b.points, 0)} درجات)
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('q1')}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف الصورة</span>
                        </button>
                      </div>

                      <div className="relative rounded-lg overflow-hidden border border-slate-200 max-h-52 bg-black/5 flex items-center justify-center">
                        <img
                          src={questionImages.q1.previewUrl}
                          alt="Captured solution Q1"
                          className="max-h-52 w-auto object-contain rounded"
                        />
                      </div>

                      <p className="text-center text-[11px] font-bold text-slate-500">
                        تم حفظ الصورة. سيتم تصحيحها مع بقية الإجابات عند تسليم الامتحان.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ======================================================== */}
              {/* 2. SECOND WHITEBOARD / السبورة الثانية (السؤال الثاني) */}
              {/* HAS ITS OWN SEPARATE CAMERA / PHOTO UPLOAD */}
              {/* ======================================================== */}
              {exam.question2.branches.map((branch) => {
                const draft = studentDrafts[branch.id] || '';

                return (
                  <div
                    key={branch.id}
                    className="overflow-hidden rounded-[1.35rem] border border-[#DED5C3] bg-[#FAF6E8] text-slate-900 shadow-[0_8px_24px_rgba(93,77,46,0.12)] transition-all"
                  >
                    {/* Hidden Camera Input for Q2 */}
                    <input
                      type="file"
                      ref={q2FileInputRef}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageSelected('q2', e.target.files[0]);
                        }
                      }}
                    />

                    {/* Whiteboard Top Header Bar with Sleek Camera Button for Q2 */}
                    <div className="bg-[#EFE9D5] border-b-2 border-[#DDD3BC] px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3A3833] border border-[#24221E]/30" />
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3A3833] border border-[#24221E]/30" />
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3A3833] border border-[#24221E]/30" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-[#24293D] text-[#FAF6E8] text-[11px] font-black px-2 py-0.5 rounded-md">
                              س2
                            </span>
                            <h4 className="text-xs sm:text-sm font-black text-[#24293D]">
                              {exam.question2.title}
                            </h4>
                          </div>
                          <p className="text-[11px] font-bold text-[#57607C] mt-0.5">
                            {exam.question2.instruction}
                          </p>
                        </div>
                      </div>

                      {/* Sleek Camera Button for Q2 */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => q2FileInputRef.current?.click()}
                          className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-[#76539E] bg-[#65478E] px-3.5 py-1.5 text-xs font-black text-white shadow-md transition-all hover:bg-[#563A7D] hover:border-[#B391D3] active:scale-95"
                          title="تصوير ورقة إجابة السؤال الثاني بكاميرا الهاتف"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15 transition-transform group-hover:scale-110">
                            <Camera className="h-3 w-3 text-white" />
                          </div>
                          <span>
                            {questionImages.q2 ? 'تغيير صورة الحل' : 'تصوير ورقة الحل'}
                          </span>
                        </button>

                        <span className="text-[11px] bg-[#E3D9C0] text-[#343A4F] border border-[#C5B99B] font-black px-2.5 py-1 rounded-xl shrink-0 hidden sm:inline-block">
                          {branch.points} درجات
                        </span>
                      </div>
                    </div>

                    {/* Whiteboard Canvas Paper Body */}
                    <div
                      className="p-4 sm:p-5 space-y-4 relative"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(transparent, transparent 29px, #E6DEC8 30px)',
                        backgroundPosition: '0 10px',
                      }}
                    >
                      {/* Red Margin Line */}
                      <div className="absolute top-0 bottom-0 right-10 sm:right-12 w-[1.5px] bg-rose-400/40 pointer-events-none" />

                      {/* Question Comprehensive Prompt Header */}
                      <div className="bg-[#E8E1CE] border border-[#D5CABB] rounded-xl p-3 flex items-start justify-between gap-3 shadow-sm relative z-10">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-[#24293D] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                            {branch.label}
                          </span>
                          <span className="text-xs sm:text-base font-black text-[#1F2436] leading-relaxed">
                            {branch.prompt}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#554731] font-bold bg-[#DCD1BA] px-2 py-0.5 rounded-md shrink-0">
                          {branch.points} درجات
                        </span>
                      </div>

                      {/* Large Lined Text Area */}
                      <div className="pr-6 sm:pr-8 relative z-10">
                        <textarea
                          value={draft}
                          onChange={(e) => handleDraftChange(branch.id, e.target.value)}
                          placeholder="الإجابة:"
                          rows={6}
                          className="w-full bg-transparent text-slate-900 placeholder-[#8C8370] font-semibold text-xs sm:text-sm leading-[30px] focus:outline-none resize-y"
                        />
                      </div>

                      {/* Error */}
                      {questionErrors.q2 && (
                        <div className="text-xs text-rose-700 bg-rose-100 border border-rose-300 p-2 rounded-lg mr-6 sm:mr-8 relative z-10">
                          {questionErrors.q2}
                        </div>
                      )}

                      {/* Captured Camera Photo Container in Q2 */}
                      {questionImages.q2 && (
                        <div className="bg-white/95 border-2 border-[#D9CEB4] rounded-xl p-3 shadow-md space-y-2 mr-6 sm:mr-8 relative z-10 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-indigo-600" />
                              <span>صورة الحل والشرح للسؤال الثاني ({branch.points} درجات)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage('q2')}
                              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف الصورة</span>
                            </button>
                          </div>

                          <div className="relative rounded-lg overflow-hidden border border-slate-200 max-h-60 bg-black/5 flex items-center justify-center">
                            <img
                              src={questionImages.q2.previewUrl}
                              alt="Captured solution Q2"
                              className="max-h-60 w-auto object-contain rounded"
                            />
                          </div>

                          <p className="text-center text-[11px] font-bold text-slate-500">
                            تم حفظ الصورة. سيتم تصحيحها مع بقية الإجابات عند تسليم الامتحان.
                          </p>
                        </div>
                      )}

                      {/* Model Answer revealed ONLY after submission */}
                      {isSubmitted && (
                        <div className="bg-[#E4D9BD] border border-[#CBBDA0] p-3.5 rounded-xl space-y-1.5 text-xs mr-6 sm:mr-8 relative z-10 animate-in fade-in">
                          <span className="text-[11px] font-black text-[#2D3347] flex items-center gap-1">
                            <FileCheck2 className="w-4 h-4 text-[#2D3347]" />
                            الإجابة والشرح النموذجي المعتمد في مركز الفحص:
                          </span>
                          <p className="text-[#1A1E2D] text-xs leading-relaxed whitespace-pre-line font-bold">
                            {branch.modelAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODAL FOOTER ACTIONS */}
        {/* ======================================================== */}
        {exam?.isAvailable && (
          <div className="flex items-center justify-between gap-3 border-t border-[#E2DDD2] bg-[#F8F7F2] px-4 pb-4 pt-3 sm:px-6">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-[#DAD4C8] bg-[#ECE9E2] px-4 py-2.5 text-xs font-bold text-[#625D66] transition-all hover:bg-[#E3DED4]"
            >
              إغلاق
            </button>

            <button
              onClick={handleSubmitExam}
              disabled={submitState !== 'idle' || isSubmitted}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#65478E] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[#65478E]/25 transition-all hover:bg-[#563A7D] active:scale-98 disabled:pointer-events-none disabled:opacity-50"
            >
              {submitState === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              <span>
                {submitState === 'completed'
                  ? 'تم تسليم الامتحان وإنهاء الاختبار ✍️'
                  : 'تسليم الامتحان وإنهاء الاختبار ✍️'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
