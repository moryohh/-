import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Volume2,
  VolumeX,
  Users,
  Crown,
  PartyPopper,
  Sparkle,
  Edit2,
  Check,
  User,
  Shuffle,
  FastForward
} from 'lucide-react';
import {
  GibhaSahGameConfig,
  GibhaSahQuestion,
  getGibhaSahGameForLesson,
} from '../data/mockGibhaSah';
import { GibhaSahAuthenticIcon } from './GameIcons';
import { gameAudio } from '../utils/gameAudio';

interface GibhaSahGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  category?: string;
  onScoreUpdate?: (points: number) => void;
  customConfig?: GibhaSahGameConfig;
}

// Utility to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const GibhaSahGameModal: React.FC<GibhaSahGameModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  category = 'المادة التعليمية',
  onScoreUpdate,
  customConfig,
}) => {
  const [config, setConfig] = useState<GibhaSahGameConfig>(() =>
    customConfig || getGibhaSahGameForLesson(lessonId, lessonTitle, category)
  );

  // Player Names (Default: المستخدم 1 و المستخدم 2)
  const [user1Name, setUser1Name] = useState<string>('المستخدم 1');
  const [user2Name, setUser2Name] = useState<string>('المستخدم 2');
  const [editingPlayer, setEditingPlayer] = useState<'user1' | 'user2' | null>(null);
  const [tempPlayerName, setTempPlayerName] = useState<string>('');

  // Game Settings & State
  const [gameMode, setGameMode] = useState<'teams' | 'solo'>('teams');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Shuffled Questions list to guarantee non-sequential, randomized question delivery
  const [shuffledQuestions, setShuffledQuestions] = useState<GibhaSahQuestion[]>([]);

  // Track eliminated/solved card numbers
  const [solvedCardNumbers, setSolvedCardNumbers] = useState<number[]>([]);

  // Turn status: 'idle' | 'correct' | 'wrong'
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [celebrationBurst, setCelebrationBurst] = useState<'correct' | 'combo' | 'wrong' | null>(null);

  // Scores
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [activeTurn, setActiveTurn] = useState<'user1' | 'user2'>('user1');
  const [soloScore, setSoloScore] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(25);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Solved History log
  const [history, setHistory] = useState<
    {
      question: GibhaSahQuestion;
      winningUser: string;
      cardNumber: number;
    }[]
  >([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or re-sync config & shuffle questions
  useEffect(() => {
    const loaded = customConfig || getGibhaSahGameForLesson(lessonId, lessonTitle, category);
    setConfig(loaded);
    setShuffledQuestions(shuffleArray(loaded.questions));
    handleRestartInternal(loaded.questions);
  }, [customConfig, lessonId, lessonTitle, category]);

  // Remaining questions filtered by unsolved card numbers
  const remainingQuestions = shuffledQuestions.filter(
    (q) => !solvedCardNumbers.includes(q.correctCardNumber)
  );

  const currentQ: GibhaSahQuestion | undefined = remainingQuestions[0];
  const totalCardsCount = config.cards.length; // 12
  const remainingCardsCount = totalCardsCount - solvedCardNumbers.length; // 12 -> 11 -> 10 ... -> 0

  // Filter only active, non-solved cards so their boxes completely disappear from the DOM
  const activeCards = config.cards.filter((card) => !solvedCardNumbers.includes(card.number));

  // Check victory / finish condition
  useEffect(() => {
    if (solvedCardNumbers.length === totalCardsCount && totalCardsCount > 0) {
      setIsFinished(true);
      if (soundEnabled) gameAudio.playVictoryFanfare();
    }
  }, [solvedCardNumbers.length, totalCardsCount, soundEnabled]);

  // Rotate current question to the end of the series so next question appears immediately
  const rotateCurrentQuestionToBack = () => {
    if (!currentQ) return;
    setShuffledQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === currentQ.id);
      if (idx === -1) return prev;
      const item = prev[idx];
      return [...prev.slice(0, idx), ...prev.slice(idx + 1), item];
    });
  };

  // Sound FX helper
  const playAudio = (type: 'correct' | 'wrong' | 'click' | 'win' | 'select' | 'pass' | 'turn' | 'combo') => {
    if (!soundEnabled) return;
    switch (type) {
      case 'correct':
        gameAudio.playCardSolved();
        break;
      case 'wrong':
        gameAudio.playMillionaireWrong();
        break;
      case 'select':
        gameAudio.playCardSelect();
        break;
      case 'pass':
        gameAudio.playQuestionPass();
        break;
      case 'turn':
        gameAudio.playTurnSwitch();
        break;
      case 'combo':
        gameAudio.playCardCombo();
        break;
      case 'win':
        gameAudio.playVictoryFanfare();
        break;
      case 'click':
      default:
        gameAudio.playClick();
        break;
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isOpen || isFinished || !isTimerRunning || feedbackStatus !== 'idle') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        if (prev <= 5 && soundEnabled) {
          gameAudio.playTimerTick(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isFinished, isTimerRunning, feedbackStatus, activeTurn, remainingQuestions.length, soundEnabled]);

  // Handle timeout -> moves question to end of queue so next question comes up!
  const handleTimeOut = () => {
    playAudio('wrong');
    setFeedbackStatus('wrong');
    const currentUser = activeTurn === 'user1' ? user1Name : user2Name;
    setFeedbackMessage(
      gameMode === 'teams'
        ? `انتهى الوقت المحدد لـ (${currentUser})! تم نقل السؤال لآخر السلسلة.`
        : 'انتهى الوقت! تم نقل السؤال لآخر السلسلة.'
    );

    // Switch turn, rotate question to back and reset timer
    setTimeout(() => {
      rotateCurrentQuestionToBack();
      setFeedbackStatus('idle');
      setFeedbackMessage('');
      setSelectedCardId(null);
      setTimeLeft(25);
      if (gameMode === 'teams') {
        playAudio('turn');
        setActiveTurn((prev) => (prev === 'user1' ? 'user2' : 'user1'));
      }
    }, 1500);
  };

  if (!isOpen) return null;

  // Handle clicking a card in the active grid
  const handleCardClick = (cardNum: number) => {
    if (solvedCardNumbers.includes(cardNum) || feedbackStatus !== 'idle') return;
    playAudio('select');
    setSelectedCardId(cardNum);
    if (soundEnabled) gameAudio.playRadarSonar();
  };

  // Manual Skip question to back of queue
  const handleSkipQuestion = () => {
    if (!currentQ || feedbackStatus !== 'idle') return;
    playAudio('pass');
    rotateCurrentQuestionToBack();
    setSelectedCardId(null);
    setTimeLeft(25);
    if (gameMode === 'teams') {
      playAudio('turn');
      setActiveTurn((prev) => (prev === 'user1' ? 'user2' : 'user1'));
    }
  };

  // Execute answer confirmation
  const handleConfirmAnswer = () => {
    if (selectedCardId === null || !currentQ || feedbackStatus !== 'idle') return;

    const isCorrect = selectedCardId === currentQ.correctCardNumber;
    const currentUser = activeTurn === 'user1' ? user1Name : user2Name;

    if (isCorrect) {
      // CORRECT ANSWER:
      const solvedCountAfterAnswer = solvedCardNumbers.length + 1;
      const isCombo = solvedCountAfterAnswer % 3 === 0;
      setCelebrationBurst(isCombo ? 'combo' : 'correct');
      window.setTimeout(() => setCelebrationBurst(null), isCombo ? 900 : 650);
      playAudio('correct');
      if (isCombo) playAudio('combo');
      setFeedbackStatus('correct');
      setFeedbackMessage(
        gameMode === 'teams'
          ? `إجابة صحيحة! أحسنت يا (${currentUser}) (+${currentQ.points} نقطة)`
          : `إجابة صحيحة وممتازة! (+${currentQ.points} نقطة)`
      );

      // Add score
      if (gameMode === 'teams') {
        if (activeTurn === 'user1') {
          setTeam1Score((prev) => prev + currentQ.points);
        } else {
          setTeam2Score((prev) => prev + currentQ.points);
        }
      } else {
        setSoloScore((prev) => prev + currentQ.points);
      }
      if (onScoreUpdate) onScoreUpdate(currentQ.points);

      // Record in history
      setHistory((prev) => [
        ...prev,
        {
          question: currentQ,
          winningUser: gameMode === 'teams' ? currentUser : 'المستخدم',
          cardNumber: selectedCardId,
        },
      ]);

      // Remove card from board completely to free up space (12 -> 11 -> 10 ...)
      setTimeout(() => {
        setSolvedCardNumbers((prev) => [...prev, selectedCardId]);
        setSelectedCardId(null);
        setFeedbackStatus('idle');
        setFeedbackMessage('');
        setTimeLeft(25);
        if (gameMode === 'teams') {
          setActiveTurn((prev) => (prev === 'user1' ? 'user2' : 'user1'));
        }
      }, 1200);
    } else {
      // WRONG ANSWER:
      // Informs user it's wrong, does NOT reveal solution, and pushes question to back of queue!
      setCelebrationBurst('wrong');
      window.setTimeout(() => setCelebrationBurst(null), 650);
      playAudio('wrong');
      setFeedbackStatus('wrong');
      setFeedbackMessage('إجابة خاطئة! تم نقل السؤال لآخر السلسلة والانتقال للسؤال التالي.');

      // Clear selection, rotate question to back of list, switch turn
      setTimeout(() => {
        rotateCurrentQuestionToBack();
        setSelectedCardId(null);
        setFeedbackStatus('idle');
        setFeedbackMessage('');
        setTimeLeft(25);
        if (gameMode === 'teams') {
          setActiveTurn((prev) => (prev === 'user1' ? 'user2' : 'user1'));
        }
      }, 1500);
    }
  };

  // Referee Scoring Actions (Manual Referee buttons for live games)
  const handleJudgeAnswer = (isCorrect: boolean) => {
    if (!currentQ || feedbackStatus !== 'idle') return;

    const currentUser = activeTurn === 'user1' ? user1Name : user2Name;

    if (isCorrect) {
      playAudio('correct');
      setFeedbackStatus('correct');
      setFeedbackMessage(
        gameMode === 'teams'
          ? `تم احتساب إجابة صحيحة لـ (${currentUser})!`
          : 'تم احتساب إجابة صحيحة!'
      );

      if (gameMode === 'teams') {
        if (activeTurn === 'user1') {
          setTeam1Score((prev) => prev + currentQ.points);
        } else {
          setTeam2Score((prev) => prev + currentQ.points);
        }
      } else {
        setSoloScore((prev) => prev + currentQ.points);
      }
      if (onScoreUpdate) onScoreUpdate(currentQ.points);

      setHistory((prev) => [
        ...prev,
        {
          question: currentQ,
          winningUser: gameMode === 'teams' ? currentUser : 'المستخدم',
          cardNumber: currentQ.correctCardNumber,
        },
      ]);

      setTimeout(() => {
        setSolvedCardNumbers((prev) => [...prev, currentQ.correctCardNumber]);
        setSelectedCardId(null);
        setFeedbackStatus('idle');
        setFeedbackMessage('');
        setTimeLeft(25);
        if (gameMode === 'teams') {
          setActiveTurn((prev) => (prev === 'user1' ? 'user2' : 'user1'));
        }
      }, 1200);
    } else {
      playAudio('wrong');
      setFeedbackStatus('wrong');
      setFeedbackMessage('تم احتساب إجابة خاطئة! تم نقل السؤال لآخر السلسلة.');

      setTimeout(() => {
        rotateCurrentQuestionToBack();
        setSelectedCardId(null);
        setFeedbackStatus('idle');
        setFeedbackMessage('');
        setTimeLeft(25);
        if (gameMode === 'teams') {
          setActiveTurn((prev) => (prev === 'user1' ? 'user2' : 'user1'));
        }
      }, 1400);
    }
  };

  // Internal restart helper with shuffled questions
  const handleRestartInternal = (qs: GibhaSahQuestion[]) => {
    setShuffledQuestions(shuffleArray(qs));
    setSolvedCardNumbers([]);
    setSelectedCardId(null);
    setFeedbackStatus('idle');
    setFeedbackMessage('');
    setTeam1Score(0);
    setTeam2Score(0);
    setSoloScore(0);
    setActiveTurn('user1');
    setTimeLeft(25);
    setIsFinished(false);
    setCelebrationBurst(null);
    setHistory([]);
  };

  // Restart full game with new random shuffle
  const handleRestart = () => {
    handleRestartInternal(config.questions);
  };

  // Start editing player name
  const handleStartEditName = (player: 'user1' | 'user2') => {
    setEditingPlayer(player);
    setTempPlayerName(player === 'user1' ? user1Name : user2Name);
  };

  // Save edited player name
  const handleSavePlayerName = () => {
    if (!tempPlayerName.trim()) {
      setEditingPlayer(null);
      return;
    }
    if (editingPlayer === 'user1') {
      setUser1Name(tempPlayerName.trim());
    } else if (editingPlayer === 'user2') {
      setUser2Name(tempPlayerName.trim());
    }
    setEditingPlayer(null);
  };

  return (
    <div
      id="gibha-sah-modal-root"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 font-cairo select-none"
    >
      <div
        id="gibha-sah-container"
        className="bg-gradient-to-b from-[#0e212f] via-[#091722] to-[#040c13] border border-cyan-500/30 w-full max-w-xl sm:max-w-2xl rounded-[32px] shadow-[0_0_80px_rgba(0,255,255,0.15)] text-right relative max-h-[96vh] flex flex-col text-white overflow-hidden"
      >
        {/* Futuristic Background Ambient Glows & Grid Pattern */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Playful success overlay: feedback only, with no effect on the question data. */}
        {celebrationBurst && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden" aria-hidden="true">
            <div
              className={`absolute left-1/2 top-24 -translate-x-1/2 rounded-full px-4 py-2 text-xs sm:text-sm font-black shadow-2xl animate-in zoom-in-95 fade-in duration-200 ${
                celebrationBurst === 'wrong'
                  ? 'bg-rose-500/90 text-white shadow-rose-500/30'
                  : celebrationBurst === 'combo'
                  ? 'bg-amber-300/95 text-amber-950 shadow-amber-300/40'
                  : 'bg-emerald-400/95 text-emerald-950 shadow-emerald-400/30'
              }`}
            >
              {celebrationBurst === 'wrong' ? 'جرّب البطاقة التالية' : celebrationBurst === 'combo' ? 'سلسلة ثلاثية!' : 'بطاقة صحيحة!'}
            </div>
            {celebrationBurst !== 'wrong' &&
              Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={`card-burst-${index}`}
                  className={`absolute top-28 h-3 w-1.5 rounded-full animate-bounce ${
                    index % 3 === 0 ? 'bg-amber-300' : index % 3 === 1 ? 'bg-cyan-300' : 'bg-emerald-300'
                  }`}
                  style={{
                    left: `${8 + index * 7.5}%`,
                    transform: `rotate(${index * 15 - 85}deg)`,
                    animationDelay: `${index * 30}ms`,
                  }}
                />
              ))}
          </div>
        )}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* 1. Brushed Metal Curved Header Plate (Matching Screenshot) */}
        <div
          id="brushed-metal-header"
          className="relative z-20 px-4 py-3 rounded-t-[30px] border-b-2 border-slate-700/60 shadow-lg flex items-center justify-between overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #d3dbe3 0%, #9caab8 45%, #768696 55%, #b2c0cc 100%)',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.5)'
          }}
        >
          {/* Subtle metallic sheen highlights */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60 pointer-events-none" />

          {/* Left: Action Control Buttons (Close, Restart, Audio) */}
          <div className="flex items-center gap-2 relative z-10">
            {/* Close Button */}
            <button
              id="btn-close-gibha-sah"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gradient-to-b from-[#324554] to-[#1a2630] border border-slate-400/50 text-slate-200 hover:text-rose-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              title="إغلاق اللعبة"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Restart Button */}
            <button
              id="btn-restart-game"
              onClick={handleRestart}
              className="w-8 h-8 rounded-full bg-gradient-to-b from-[#324554] to-[#1a2630] border border-slate-400/50 text-slate-200 hover:text-cyan-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              title="إعادة خلط وتجديد التحدي"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-audio"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 rounded-full bg-gradient-to-b from-[#324554] to-[#1a2630] border border-slate-400/50 text-slate-200 hover:text-cyan-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              title="كتم / تفعيل الصوت"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Right: Title & Dartboard Target Emblem */}
          <div className="flex items-center gap-2.5 relative z-10 text-right">
            <div className="leading-tight">
              <h3 className="text-sm sm:text-base font-black text-[#13222d] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] tracking-tight">
                لعبة تجيبها صح
              </h3>
              <p className="text-[9px] font-bold text-[#3d5161]">
                {config.subject || 'تحدي الأسئلة والبطاقات'}
              </p>
            </div>

            {/* 3D Realistic Dartboard Target Icon matching screenshot */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-b from-slate-200 to-slate-500 shadow-md flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                {/* Outer Ring */}
                <circle cx="50" cy="50" r="46" fill="#1c303f" stroke="#3b82f6" strokeWidth="4" />
                <circle cx="50" cy="50" r="38" fill="#e2e8f0" stroke="#0ea5e9" strokeWidth="3" />
                <circle cx="50" cy="50" r="28" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
                {/* Red Target Ring */}
                <circle cx="50" cy="50" r="18" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                {/* Bullseye Yellow */}
                <circle cx="50" cy="50" r="8" fill="#f59e0b" />
                {/* Dart Arrow hitting bullseye */}
                <path d="M78 22 L52 48" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
                <path d="M78 22 L86 14 M78 22 L70 14 M78 22 L86 30" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                <circle cx="50" cy="50" r="3" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 space-y-3 z-10 custom-scrollbar">
          {!isFinished ? (
            <>
              {/* 2. HUD / Players Pods & Timer (Matching Screenshot) */}
              <div id="hud-players-row" className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
                {/* Left Card: User 2 (or second player) */}
                <div
                  id="user2-hud-card"
                  onClick={() => {
                    if (gameMode === 'teams' && feedbackStatus === 'idle') setActiveTurn('user2');
                  }}
                  className={`col-span-5 sm:col-span-5 rounded-2xl p-2 sm:p-2.5 transition-all relative border ${
                    activeTurn === 'user2' && gameMode === 'teams'
                      ? 'bg-gradient-to-b from-[#0f2d2b] to-[#071917] border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                      : 'bg-gradient-to-b from-[#102431] to-[#08151f] border-slate-700/80 hover:border-slate-500'
                  }`}
                  style={{
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* Top: Edit Name & Status indicator dot */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                      {editingPlayer === 'user2' ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={tempPlayerName}
                            onChange={(e) => setTempPlayerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSavePlayerName()}
                            autoFocus
                            className="w-16 bg-black/80 border border-emerald-400 text-white text-[10px] px-1 py-0.5 rounded text-center font-bold"
                          />
                          <button
                            onClick={handleSavePlayerName}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-black text-emerald-300 line-clamp-1 max-w-[75px]">
                            {user2Name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEditName('user2');
                            }}
                            className="text-gray-400 hover:text-emerald-300 p-0.5"
                            title="تعديل اسم اللاعب"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Score Number */}
                  <div className="text-center py-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {team2Score}
                    </span>
                  </div>

                  {/* Bottom Hearts / Lives (Matching Screenshot) */}
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-rose-500 text-xs drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]">❤️</span>
                    <span className="text-rose-500 text-xs drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]">❤️</span>
                    <span className="text-rose-500 text-xs drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]">❤️</span>
                    <span className="text-slate-600 text-xs">🖤</span>
                  </div>
                </div>

                {/* Middle Pod: Digital Timer Capsule & Referee Actions */}
                <div className="col-span-2 sm:col-span-2 flex flex-col items-center justify-center gap-1.5">
                  {/* Digital Metallic Timer Pod */}
                  <div
                    id="digital-timer-pod"
                    className="px-2 sm:px-3 py-1 rounded-xl bg-gradient-to-b from-[#182d3d] to-[#0a151f] border border-cyan-500/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1 text-center"
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span className="font-mono font-black text-xs sm:text-sm text-cyan-300">
                      00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                  </div>

                  {/* Action / Referee Check Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Checkmark Button (Correct) */}
                    <button
                      id="referee-btn-correct"
                      disabled={feedbackStatus !== 'idle'}
                      onClick={() => handleJudgeAnswer(true)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-[#163c32] to-[#0d231d] border border-emerald-400/60 text-emerald-300 hover:text-emerald-200 flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform active:scale-90 disabled:opacity-40 cursor-pointer"
                      title="احتساب صح وحذف البطاقة"
                    >
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 stroke-[3]" />
                    </button>

                    {/* Cross Button (Wrong / Rotate to Back) */}
                    <button
                      id="referee-btn-wrong"
                      disabled={feedbackStatus !== 'idle'}
                      onClick={() => handleJudgeAnswer(false)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-[#3a1d25] to-[#221016] border border-rose-400/60 text-rose-300 hover:text-rose-200 flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform active:scale-90 disabled:opacity-40 cursor-pointer"
                      title="احتساب خطأ ونقل السؤال لآخر السلسلة"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* Right Card: Doctor / Teacher / User 1 Avatar Card (Matching Screenshot) */}
                <div
                  id="user1-hud-card"
                  onClick={() => {
                    if (gameMode === 'teams' && feedbackStatus === 'idle') setActiveTurn('user1');
                  }}
                  className={`col-span-5 sm:col-span-5 rounded-2xl p-1.5 sm:p-2 transition-all relative border overflow-hidden ${
                    activeTurn === 'user1' && gameMode === 'teams'
                      ? 'bg-gradient-to-b from-[#152e44] to-[#0b1c2b] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.02]'
                      : 'bg-gradient-to-b from-[#102431] to-[#08151f] border-slate-700/80 hover:border-slate-500'
                  }`}
                  style={{
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    {/* Doctor Avatar Photo */}
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-cyan-400/50 bg-[#162738] shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1594824813596-f94a4968c928?w=150&auto=format&fit=crop&q=80"
                        alt="Doctor Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {/* Active Blue dot */}
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                    </div>

                    {/* Name & Blue Hearts */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs font-black text-cyan-300 line-clamp-1">
                          {user1Name === 'المستخدم 1' ? 'د. سارة المنصوري' : user1Name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditName('user1');
                          }}
                          className="text-gray-400 hover:text-cyan-300 p-0.5"
                          title="تعديل الاسم"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-mono font-black text-white">
                          {team1Score} نقطة
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-cyan-400 text-xs drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">💙</span>
                        <span className="text-cyan-400 text-xs drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">💙</span>
                        <span className="text-cyan-400 text-xs drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">💙</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Question Banner with Sci-Fi Oscilloscope Waveform (Matching Screenshot) */}
              {currentQ && (
                <div
                  id="active-question-banner"
                  className="relative rounded-2xl p-3.5 sm:p-4 border border-cyan-500/30 overflow-hidden shadow-lg"
                  style={{
                    background: 'linear-gradient(180deg, #0f2738 0%, #081723 100%)',
                    boxShadow: 'inset 0 1px 2px rgba(0,255,255,0.15), 0 4px 14px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* Oscilloscope Glowing Sound Wave in Background */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                    viewBox="0 0 500 120"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,60 L 60,60 L 90,30 L 120,90 L 150,45 L 180,75 L 210,20 L 240,100 L 270,40 L 300,80 L 330,30 L 360,90 L 390,50 L 420,70 L 500,60"
                      fill="none"
                      stroke="#00ffff"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Top Badge Indicators Row (Matching Screenshot Tags) */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-300 mb-2 relative z-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>تحدي مباشر</span>
                      </span>
                      <span className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full">
                        {totalCardsCount - remainingCardsCount + 1} تم الإنجاز
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-mono font-black">
                        +{currentQ.points} نقطة
                      </span>
                      <button
                        id="btn-skip-question"
                        disabled={feedbackStatus !== 'idle'}
                        onClick={handleSkipQuestion}
                        className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 hover:text-cyan-300 border border-white/10 transition-colors cursor-pointer"
                        title="نقل السؤال لآخر السلسلة وعرض التالي"
                      >
                        <FastForward className="w-3 h-3 text-cyan-400" />
                        <span>تخطي ⏭</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-xs sm:text-base font-bold text-white leading-relaxed text-center relative z-10 px-1">
                    {currentQ.question}
                  </h4>

                  {/* Selection Confirmation Bar */}
                  {feedbackStatus === 'idle' && selectedCardId !== null && (
                    <div className="flex items-center justify-center gap-2 pt-2 relative z-10 animate-in fade-in">
                      <span className="text-xs text-gray-300">
                        تم اختيار: <strong className="text-cyan-300">البطاقة ({selectedCardId})</strong>
                      </span>
                      <button
                        id="btn-confirm-answer"
                        onClick={handleConfirmAnswer}
                        className="px-3.5 py-1 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-black rounded-xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                      >
                        تأكيد الإجابة ✓
                      </button>
                    </div>
                  )}

                  {/* Correct Feedback Banner */}
                  {feedbackStatus === 'correct' && (
                    <div className="mt-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center justify-center gap-1.5 animate-in zoom-in-95">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feedbackMessage}</span>
                    </div>
                  )}

                  {/* Wrong Feedback Banner */}
                  {feedbackStatus === 'wrong' && (
                    <div className="mt-2 p-2 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-black flex items-center justify-center gap-1.5 animate-in shake">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{feedbackMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Cards Section Header Row (Matching Screenshot) */}
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-300 px-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">البطاقات المتتالية في الساحة:</span>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md font-mono font-black text-[10px]">
                    {remainingCardsCount}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">
                  اضغط على البطاقة المطابقة للحل
                </span>
              </div>

              {/* 5. The 2-Column Sci-Fi Metallic Cards Grid (Matching Screenshot Layout) */}
              <div
                id="gibha-sah-cards-grid"
                className={`grid grid-cols-2 gap-2.5 sm:gap-3.5 transition-all duration-300 pb-2 ${
                  celebrationBurst === 'combo' ? 'scale-[1.01] drop-shadow-[0_0_18px_rgba(251,191,36,0.35)]' : ''
                }`}
              >
                {activeCards.map((card) => {
                  const isSelected = selectedCardId === card.number;

                  return (
                    <button
                      key={card.id}
                      id={`card-item-${card.number}`}
                      disabled={feedbackStatus !== 'idle'}
                      onClick={() => handleCardClick(card.number)}
                      className={`relative p-3 sm:p-3.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 group cursor-pointer active:scale-98 animate-in fade-in zoom-in-95 min-h-[90px] sm:min-h-[96px] ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#163a4d] to-[#0d2432] border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400 scale-[1.02] animate-pulse'
                          : 'bg-gradient-to-b from-[#132837] via-[#0d1e2b] to-[#07131d] border-slate-700/70 hover:border-cyan-400/60 hover:bg-[#152e40] hover:-translate-y-1 hover:scale-[1.02] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_10px_rgba(0,0,0,0.5)]'
                      }`}
                    >
                      {/* Top: Card Number with dot (.1, .2, .3, .4, etc.) */}
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-gray-400 group-hover:text-cyan-300">
                        .{card.number}
                      </span>

                      {/* Main Title (e.g. مملكة الطلائعيات, الخميرة, الجهاز العصبي العقدي...) */}
                      <h5 className="text-xs sm:text-sm font-black text-white tracking-tight leading-snug drop-shadow-sm">
                        {card.label}
                      </h5>

                      {/* Subtitle / Description (e.g. كائنات حقيقية النواة بسيطة, فطريات وحيدة الخلية...) */}
                      {card.sublabel && (
                        <p className="text-[9px] sm:text-[10px] text-gray-400 leading-tight line-clamp-1">
                          {card.sublabel}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Winner / Final Ceremony Screen */
            <div id="game-finished-screen" className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-amber-400 to-emerald-500 p-[2px] mx-auto shadow-[0_0_35px_rgba(245,158,11,0.4)]">
                <div className="w-full h-full rounded-full bg-[#08121f] flex items-center justify-center text-amber-400">
                  <Crown className="w-10 h-10 animate-bounce" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black px-3 py-1 rounded-full mb-1">
                  <PartyPopper className="w-4 h-4 text-emerald-400" />
                  <span>تم مسح وتفريغ جميع البطاقات الـ 12 بنجاح!</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {gameMode === 'teams' ? (
                    team1Score > team2Score ? (
                      <span className="text-cyan-400">🎉 مبروك لـ ({user1Name === 'المستخدم 1' ? 'د. سارة المنصوري' : user1Name}) الفوز بتحدي جيبها صح!</span>
                    ) : team2Score > team1Score ? (
                      <span className="text-emerald-400">🏆 مبروك لـ ({user2Name}) الفوز بتحدي جيبها صح!</span>
                    ) : (
                      <span className="text-amber-400">🤝 تعادل بطولي رائع بين اللاعبين!</span>
                    )
                  ) : (
                    <span className="text-cyan-300">أحسنت! أكملت تحدي جيبها صح الفردي بنجاح</span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">
                  انتهت جولة التحدي وحل جميع البطاقات لدرس: {lessonTitle}
                </p>
              </div>

              {/* Final Scoreboard */}
              {gameMode === 'teams' ? (
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs">
                  <div className="bg-[#0b1726] border border-cyan-500/40 p-3 rounded-2xl text-center">
                    <span className="text-[10px] text-cyan-300 block font-bold">نقاط {user1Name === 'المستخدم 1' ? 'د. سارة المنصوري' : user1Name}</span>
                    <span className="text-2xl font-black text-white mt-1 block font-mono">
                      {team1Score}
                    </span>
                  </div>
                  <div className="bg-[#0b1726] border border-emerald-500/40 p-3 rounded-2xl text-center">
                    <span className="text-[10px] text-emerald-300 block font-bold">نقاط {user2Name}</span>
                    <span className="text-2xl font-black text-white mt-1 block font-mono">
                      {team2Score}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0b1726] border border-cyan-500/40 p-3 rounded-2xl max-w-xs mx-auto text-center">
                  <span className="text-[10px] text-gray-400 block font-bold">مجموع النقاط المحققة</span>
                  <span className="text-2xl font-black text-cyan-300 mt-1 block font-mono">
                    {soloScore} نقطة
                  </span>
                </div>
              )}

              {/* Solved Cards History */}
              <div className="space-y-2 text-right max-h-44 overflow-y-auto pr-1">
                <h5 className="text-xs font-bold text-gray-300">سجل البطاقات المنجزة:</h5>
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-white/10 bg-[#08121f] text-[11px] flex items-center justify-between"
                  >
                    <div className="space-y-0.5 max-w-[80%]">
                      <span className="line-clamp-1 font-bold text-gray-200">{item.question.question}</span>
                      <span className="text-[9px] text-gray-400">
                        الفائز بها: {item.winningUser}
                      </span>
                    </div>
                    <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-1 rounded-lg border border-cyan-500/30">
                      بطاقة ({item.cardNumber})
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  id="btn-finished-restart"
                  onClick={handleRestart}
                  className="flex-1 py-3 bg-[#132338] hover:bg-[#1a304d] text-white font-bold rounded-2xl border border-white/10 text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>جولة جديدة عشوائية</span>
                </button>
                <button
                  id="btn-finished-close"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-black rounded-2xl shadow-lg text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <span>العودة للدرس</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
