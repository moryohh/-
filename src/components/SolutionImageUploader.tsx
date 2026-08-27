import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Trash2,
  Maximize2,
  RefreshCw,
  Award,
  FileCheck,
  Lock,
} from 'lucide-react';
import {
  submitSolutionImageForEvaluation,
  ImageEvaluationResult,
  ImageEvaluationSource,
} from '../services/imageEvaluationService';
import { gameAudio } from '../utils/gameAudio';

interface SolutionImageUploaderProps {
  branchId: string;
  source: ImageEvaluationSource;
  questionPrompt: string;
  modelAnswer: string;
  branchPoints?: number;
  subject?: string;
  lessonTitle?: string;
  onEvaluationComplete?: (result: ImageEvaluationResult) => void;
}

export const SolutionImageUploader: React.FC<SolutionImageUploaderProps> = ({
  branchId,
  source,
  questionPrompt,
  modelAnswer,
  branchPoints = 5,
  subject = 'المنهاج',
  lessonTitle = 'الدرس',
  onEvaluationComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStage, setEvaluationStage] = useState<'idle' | 'validating' | 'uploading' | 'analyzing' | 'done'>('idle');
  const [evaluationResult, setEvaluationResult] = useState<ImageEvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    setEvaluationResult(null);

    // Initial basic check
    if (!file.type.startsWith('image/')) {
      setErrorMessage('تنبيه أمني: يُسمح فقط برفع ملفات الصور (PNG, JPEG, WEBP).');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    gameAudio.playClick();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartEvaluation = async () => {
    if (!selectedFile) return;

    setIsEvaluating(true);
    setErrorMessage(null);
    setEvaluationStage('validating');
    gameAudio.playClick();

    try {
      // Stage 1: Security Validation
      await new Promise((r) => setTimeout(r, 400));
      setEvaluationStage('uploading');

      // Stage 2: Encrypted transmission to external service
      await new Promise((r) => setTimeout(r, 600));
      setEvaluationStage('analyzing');

      // Stage 3: Vision Analysis & Evaluation
      const result = await submitSolutionImageForEvaluation({
        imageFile: selectedFile,
        branchId,
        source,
        questionPrompt,
        modelAnswer,
        branchPoints,
        subject,
        lessonTitle,
      });

      setEvaluationResult(result);
      setEvaluationStage('done');
      setIsEvaluating(false);

      if (result.success) {
        gameAudio.playMillionaireCorrect();
        onEvaluationComplete?.(result);
      } else {
        gameAudio.playMillionaireWrong();
        setErrorMessage(result.error || result.feedback);
      }
    } catch (err: any) {
      setIsEvaluating(false);
      setEvaluationStage('idle');
      setErrorMessage(err?.message || 'حدث خطأ أثناء الاتصال بمنصة التحليل الخارجية.');
      gameAudio.playMillionaireWrong();
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setEvaluationResult(null);
    setErrorMessage(null);
    setEvaluationStage('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-2.5 text-right font-cairo">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Zone / Drop area if no file is selected yet */}
      {!selectedFile && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-purple-400 bg-purple-500/15 scale-[1.01]'
              : 'border-purple-500/30 bg-[#0d101c]/80 hover:border-purple-400/60 hover:bg-purple-950/20'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-md">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-200">
                اضغط لرفع صورة الحل اليدوي أو اسحبها هنا
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                الحد الأقصى المسموح: <span className="text-amber-300 font-bold">1 ميجابايت</span> (الصور الأكبر يتم ضغطها وتطهيرها أمنياً تلقائياً)
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>اختر ملف صورة</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>التقاط بالكاميرا</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Image Preview & Security Badge */}
      {selectedFile && previewUrl && (
        <div className="bg-[#0b0e18] border border-purple-500/30 rounded-2xl p-3 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                تم التحقق الأمني من صيغة الصورة (MIME: {selectedFile.type})
              </span>
            </div>

            <button
              type="button"
              onClick={handleClear}
              disabled={isEvaluating}
              className="p-1 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="حذف الصورة واختيار غيرها"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnail & Meta info */}
          <div className="flex items-center gap-3 bg-[#121627] p-2.5 rounded-xl border border-white/5">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black">
              <img
                src={previewUrl}
                alt="حل الطالب"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200 truncate">
                <FileCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                <span>الحجم المبدئي: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                {selectedFile.size > 1024 * 1024 ? (
                  <span className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                    ⚡ سيتم الضغط والتطهير لأقل من 1MB
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">
                    ✓ أقل من 1MB
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1 text-purple-300 font-mono">
                  <Lock className="w-2.5 h-2.5" /> تشفير وتطهير الملف
                </span>
              </div>
            </div>
          </div>

          {/* Analyze / Send Button */}
          {!evaluationResult && (
            <button
              type="button"
              onClick={handleStartEvaluation}
              disabled={isEvaluating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:cursor-wait"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {evaluationStage === 'validating' && 'جاري الفحص الأمني وتطهير وضغط الصورة (أقل من 1MB)...'}
                    {evaluationStage === 'uploading' && 'جاري الإرسال الآمن عبر HTTPS...'}
                    {evaluationStage === 'analyzing' && 'المنصة الخارجية تقوم بتحليل خطوات الحل...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>إرسال الصورة للتحليل والتصحيح الذكي</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-2.5 flex items-center gap-2 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Evaluation Results Card */}
      {evaluationResult && (
        <div className="bg-gradient-to-b from-[#18132e] via-[#100d22] to-[#0d0a1b] border-2 border-amber-400/40 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xl animate-in zoom-in-95 duration-200">
          {/* Header Score Badge */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 flex items-center justify-center font-black">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-300">
                  نتيجة تصحيح الصورة عبر المنصة الخارجية
                </div>
                <div className="text-[10px] text-gray-400">
                  اسم الملف المشفر: <span className="font-mono text-purple-300">{evaluationResult.secureFileName}</span>
                </div>
              </div>
            </div>

            {/* Score Pill */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-3 py-1 rounded-xl font-black text-xs shadow-md">
              {evaluationResult.score} / {evaluationResult.maxScore} درجات
            </div>
          </div>

          {/* Teacher / Vision Feedback */}
          <div className="bg-[#1a1435]/60 border border-purple-500/20 rounded-xl p-3 space-y-1">
            <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ملاحظات التصحيح الوزاري والتحليل:</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed font-medium pr-1">
              {evaluationResult.feedback}
            </p>
          </div>

          {/* Identified Steps from image */}
          {evaluationResult.identifiedTextOrSteps && evaluationResult.identifiedTextOrSteps.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <div className="text-[10.5px] font-bold text-gray-300">
                الخطوات التي تم التعرف عليها ومطابقتها:
              </div>
              <div className="grid grid-cols-1 gap-1">
                {evaluationResult.identifiedTextOrSteps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center gap-1.5 text-[11px] text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-[10px] text-gray-400">
              تم التقييم في: {evaluationResult.evaluatedAt}
            </span>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>رفع صورة أخرى</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
