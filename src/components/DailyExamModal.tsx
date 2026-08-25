import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Award,
  PenTool,
  Camera,
  Trash2,
  Loader2,
  FileCheck2,
  ImageIcon,
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
}) => {
  const { theme } = useAppTheme();
  const [exam, setExam] = useState<DailyExamConfig | null>(customExam || null);
  const [isLoading, setIsLoading] = useState(false);

  // Student Drafts (textual notes per branch)
  const [studentDrafts, setStudentDrafts] = useState<Record<string, string>>({});

  // Question-Level Image Attachments & Evaluation (One image for Q1 covering both definitions, One for Q2)
  const [questionImages, setQuestionImages] = useState<
    Record<'q1' | 'q2', { file: File; previewUrl: string } | null>
  >({
    q1: null,
    q2: null,
  });
  const [evaluatingQuestions, setEvaluatingQuestions] = useState<Record<'q1' | 'q2', boolean>>({
    q1: false,
    q2: false,
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
  const rewardIssuedRef = useRef(false);
  const assessmentReportedRef = useRef(false);

  // Load exam data on mount / open
  useEffect(() => {
    if (customExam) {
      setExam(customExam);
      return;
    }

    if (isOpen) {
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
    }
  }, [isOpen, customExam, category, lessonId, lessonTitle, openLessonContext?.subjectId, openLessonContext?.chapterNumber, openLessonContext?.lessonNumber, openLessonContext?.lessonId]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !isTimerRunning || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          awardDailyExamReward();
          setIsSubmitted(true);
          gameAudio.playVictoryFanfare();
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
    if (!file.type.startsWith('image/')) {
      setQuestionErrors((prev) => ({
        ...prev,
        [qKey]: 'يُسمح فقط بملفات الصور (PNG, JPEG, WEBP).',
      }));
      return;
    }

    setQuestionErrors((prev) => ({ ...prev, [qKey]: '' }));
    const objectUrl = URL.createObjectURL(file);
    setQuestionImages((prev) => ({
      ...prev,
      [qKey]: { file, previewUrl: objectUrl },
    }));
    gameAudio.playClick();
  };

  const handleRemoveImage = (qKey: 'q1' | 'q2') => {
    gameAudio.playClick();
    setQuestionImages((prev) => ({
      ...prev,
      [qKey]: null,
    }));
    setEvaluatedQuestions((prev) => ({
      ...prev,
      [qKey]: null,
    }));
  };

  const handleEvaluateQ1Image = async () => {
    if (!exam || !questionImages.q1) return;

    setEvaluatingQuestions((prev) => ({ ...prev, q1: true }));
    gameAudio.playClick();

    const q1TotalPoints = exam.question1.branches.reduce((acc, b) => acc + b.points, 0);
    const combinedPrompt = exam.question1.branches
      .map((b, idx) => `الفرع ${idx + 1} (${b.label}): ${b.prompt}`)
      .join('\n');
    const combinedModelAnswer = exam.question1.branches
      .map((b, idx) => `جواب الفرع ${idx + 1} (${b.label}):\n${b.modelAnswer}`)
      .join('\n\n');

    try {
      const result = await submitSolutionImageForEvaluation({
        imageFile: questionImages.q1.file,
        branchId: 'q1_unified',
        questionPrompt: combinedPrompt,
        modelAnswer: combinedModelAnswer,
        branchPoints: q1TotalPoints,
        subject: exam.subject,
        lessonTitle: exam.lessonTitle,
      });

      setEvaluatedQuestions((prev) => ({ ...prev, q1: result }));
      setEvaluatingQuestions((prev) => ({ ...prev, q1: false }));
      gameAudio.playPrizeClimb();
    } catch {
      setEvaluatingQuestions((prev) => ({ ...prev, q1: false }));
      setQuestionErrors((prev) => ({
        ...prev,
        q1: 'تعذر تصحيح الصورة. يرجى المحاولة مجدداً.',
      }));
    }
  };

  const handleEvaluateQ2Image = async () => {
    if (!exam || !questionImages.q2) return;
    const branch = exam.question2.branches[0];
    if (!branch) return;

    setEvaluatingQuestions((prev) => ({ ...prev, q2: true }));
    gameAudio.playClick();

    try {
      const result = await submitSolutionImageForEvaluation({
        imageFile: questionImages.q2.file,
        branchId: branch.id,
        questionPrompt: branch.prompt,
        modelAnswer: branch.modelAnswer,
        branchPoints: branch.points,
        subject: exam.subject,
        lessonTitle: exam.lessonTitle,
      });

      setEvaluatedQuestions((prev) => ({ ...prev, q2: result }));
      setEvaluatingQuestions((prev) => ({ ...prev, q2: false }));
      gameAudio.playPrizeClimb();
    } catch {
      setEvaluatingQuestions((prev) => ({ ...prev, q2: false }));
      setQuestionErrors((prev) => ({
        ...prev,
        q2: 'تعذر تصحيح الصورة. يرجى المحاولة مجدداً.',
      }));
    }
  };

  const handleSubmitExam = () => {
    awardDailyExamReward();
    gameAudio.playVictoryFanfare();
    setIsSubmitted(true);
    setIsTimerRunning(false);
  };

  const handleRestartExam = () => {
    gameAudio.playClick();
    rewardIssuedRef.current = false;
    assessmentReportedRef.current = false;
    setTimeLeft(900);
    setIsTimerRunning(true);
    setIsSubmitted(false);
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

  const awardDailyExamReward = () => {
    if (rewardIssuedRef.current || !exam || totalEvaluatedCount < 2) return;
    rewardIssuedRef.current = true;
    const totalExamPoints = Number(exam.totalPoints) || 1;
    const percentage = (totalEarnedPoints / totalExamPoints) * 100;
    onScoreUpdate?.(getDailyExamReward(percentage));
    if (!assessmentReportedRef.current) {
      assessmentReportedRef.current = true;
      onAssessmentResult?.(totalEarnedPoints, totalExamPoints);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 font-cairo select-none">
      <div
        className="w-full max-w-3xl rounded-3xl p-3.5 sm:p-6 shadow-2xl text-right relative max-h-[95vh] flex flex-col transition-all duration-300 border-2"
        style={{
          backgroundColor: theme.colors.bgCard,
          borderColor: `${theme.colors.primary}60`,
          boxShadow: `0 0 35px ${theme.colors.glow}`,
          color: theme.classes.textMain,
        }}
      >
        {/* ======================================================== */}
        {/* MODAL TOP BAR */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <DailyExamAuthenticIcon className="w-11 h-11" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-black ${theme.classes.textMain}`}>
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
              <p className={`text-[11px] ${theme.classes.textMuted} mt-0.5`}>
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
              className={`p-1.5 rounded-full ${theme.classes.cardSubtleBg} text-gray-300 hover:text-white border ${theme.classes.cardBorder} transition-colors cursor-pointer`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL MAIN CONTENT BODY */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto py-3.5 space-y-5 pr-1 no-scrollbar">
          {isLoading || !exam ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-purple-300 font-semibold">
                جاري إعداد وتجهيز سبورة الامتحان اليومي...
              </p>
            </div>
          ) : (
            <>
              {/* Exam Info Strip */}
              <div className="bg-gradient-to-r from-[#1b1531] via-[#151028] to-[#1b1531] border border-purple-500/30 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-gray-300 font-semibold shadow-inner">
                <div className="flex items-center gap-3">
                  <span>
                    المادة: <b className="text-purple-300">{exam.subject}</b>
                  </span>
                  <span>•</span>
                  <span>
                    الدرجة الكلية: <b className="text-amber-400">{exam.totalPoints} درجة</b>
                  </span>
                </div>
                <div className="text-[11px] text-sky-300 bg-sky-950/40 border border-sky-500/30 px-2.5 py-0.5 rounded-lg">
                  الزمن المقرر: {exam.durationMinutes} دقيقة
                </div>
              </div>

              {/* Status Alert when Finished */}
              {isSubmitted && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-black text-sm text-emerald-200">تم تسليم الامتحان بنجاح!</p>
                      <p className="text-[11px] text-emerald-300/80 mt-0.5">
                        تم كشف دليل الأجوبة النموذجية للمراجعة والتصحيح الذاتي بالأسفل.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRestartExam}
                    className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-emerald-500/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة الاختبار</span>
                  </button>
                </div>
              )}

              {/* Evaluated Images Score Bar */}
              {totalEvaluatedCount > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-amber-500/15 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-300 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      تم تصحيح {totalEvaluatedCount} سؤال ورقي • درجاتك المحصلة:{' '}
                      <b className="text-white font-black underline">{totalEarnedPoints}</b> من {exam.totalPoints} درجة
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-black font-black px-2 py-0.5 rounded-lg">
                    {Math.round((totalEarnedPoints / (Number(exam.totalPoints) || 1)) * 100)}%
                  </span>
                </div>
              )}

              {/* ======================================================== */}
              {/* 1. FIRST WHITEBOARD / السبورة الأولى (السؤال الأول) */}
              {/* ONE SHARED CAMERA / PHOTO UPLOAD FOR BOTH DEFINITIONS */}
              {/* ======================================================== */}
              <div className="rounded-3xl border-2 border-[#E5DEC9] bg-[#FAF6E8] shadow-2xl overflow-hidden text-slate-900 transition-all">
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
                      className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#2E284A] to-[#1E1938] hover:from-[#3A335C] hover:to-[#272146] text-white text-xs font-black shadow-md border border-purple-900/60 hover:border-amber-400/70 transition-all cursor-pointer active:scale-95 shrink-0"
                      title="تصوير ورقة إجابة السؤال الأول بالكامل بكاميرا الهاتف"
                    >
                      <div className="w-5 h-5 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-3 h-3 text-amber-300" />
                      </div>
                      <span>
                        {questionImages.q1 ? 'تغيير صورة الحل' : '📸 تصوير ورقة الحل'}
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
                            placeholder="✍️ دوّن إجابتك هنا على أسطر السبورة أو التقط صورة واحدة للحل من الزر بالأعلى..."
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

                      <div className="pt-1">
                        {!evaluatedQuestions.q1 ? (
                          <button
                            type="button"
                            disabled={evaluatingQuestions.q1}
                            onClick={handleEvaluateQ1Image}
                            className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow cursor-pointer transition-all disabled:opacity-50"
                          >
                            {evaluatingQuestions.q1 ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري التدقيق والتصحيح الذكي...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>
                                  تصحيح إجابة السؤال الأول بالذكاء الاصطناعي (
                                  {exam.question1.branches.reduce((acc, b) => acc + b.points, 0)} درجات)
                                </span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-xs text-emerald-900 space-y-1">
                            <div className="flex items-center justify-between font-black">
                              <span className="flex items-center gap-1 text-emerald-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>تم تصحيح السؤال الأول بنجاح</span>
                              </span>
                              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                                {evaluatedQuestions.q1.score} /{' '}
                                {exam.question1.branches.reduce((acc, b) => acc + b.points, 0)} درجات
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-700 font-medium">
                              {evaluatedQuestions.q1.feedback}
                            </p>
                          </div>
                        )}
                      </div>
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
                    className="rounded-3xl border-2 border-[#E5DEC9] bg-[#FAF6E8] shadow-2xl overflow-hidden text-slate-900 transition-all"
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
                          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#2E284A] to-[#1E1938] hover:from-[#3A335C] hover:to-[#272146] text-white text-xs font-black shadow-md border border-purple-900/60 hover:border-amber-400/70 transition-all cursor-pointer active:scale-95 shrink-0"
                          title="تصوير ورقة إجابة السؤال الثاني بكاميرا الهاتف"
                        >
                          <div className="w-5 h-5 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="w-3 h-3 text-amber-300" />
                          </div>
                          <span>
                            {questionImages.q2 ? 'تغيير صورة الحل' : '📸 تصوير ورقة الحل'}
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
                          placeholder="✍️ اكتب إجابتك النموذجية وشرحك المفصل هنا على أسطر دفتر الإجابة..."
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

                          <div className="pt-1">
                            {!evaluatedQuestions.q2 ? (
                              <button
                                type="button"
                                disabled={evaluatingQuestions.q2}
                                onClick={handleEvaluateQ2Image}
                                className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow cursor-pointer transition-all disabled:opacity-50"
                              >
                                {evaluatingQuestions.q2 ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري التدقيق والتصحيح الذكي...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                    <span>
                                      تصحيح إجابة الصورة بالذكاء الاصطناعي ({branch.points} درجات)
                                    </span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-xs text-emerald-900 space-y-1">
                                <div className="flex items-center justify-between font-black">
                                  <span className="flex items-center gap-1 text-emerald-800">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>تم تصحيح الحل الورقي بنجاح</span>
                                  </span>
                                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                                    {evaluatedQuestions.q2.score} / {branch.points} درجات
                                  </span>
                                </div>
                                <p className="text-[11px] text-emerald-700 font-medium">
                                  {evaluatedQuestions.q2.feedback}
                                </p>
                              </div>
                            )}
                          </div>
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
        {exam && (
          <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all cursor-pointer"
            >
              إغلاق
            </button>

            <button
              onClick={handleSubmitExam}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 hover:from-purple-500 hover:to-indigo-400 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 text-xs transition-all active:scale-98 cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>
                {isSubmitted
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
