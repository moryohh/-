import React from 'react';
import { Award, Star, Zap, Gift, Check, X, Sparkles, Trophy } from 'lucide-react';

interface MapRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  starsCount: number;
  coinsCount: number;
  expCount: number;
}

export const MapRewardsModal: React.FC<MapRewardsModalProps> = ({
  isOpen,
  onClose,
  starsCount,
  coinsCount,
  expCount,
}) => {
  if (!isOpen) return null;

  const badges = [
    { id: '1', title: 'مستكشف الغابة', desc: 'أكمل جميع دروس غابة الأساسيات', icon: '🌲', unlocked: true, reward: '+50 كوينز' },
    { id: '2', title: 'متسلق الجبال', desc: 'حل 10 مسائل وزارية بدون خطأ', icon: '⛰️', unlocked: true, reward: '+100 EXP' },
    { id: '3', title: 'قبطان البحار', desc: 'أنهِ اختبار بحر الاستكشاف', icon: '⛵', unlocked: false, reward: '+150 EXP' },
    { id: '4', title: 'حكيم القلعة', desc: 'وصل إلى قمة التميز بمعدل 100%', icon: '👑', unlocked: false, reward: '+300 كوينز' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c294a] to-[#0d162a] border-2 border-amber-400 rounded-3xl p-5 text-white shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-amber-300">خزينة الجوائز والمكافآت</h3>
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Player Stats Overview */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
          <div className="bg-black/40 border border-sky-500/30 p-2.5 rounded-2xl">
            <div className="text-xs text-sky-300 font-bold mb-0.5">نقاط الخبرة</div>
            <div className="text-base font-black text-white flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
              <span>{expCount}</span>
            </div>
          </div>

          <div className="bg-black/40 border border-amber-500/30 p-2.5 rounded-2xl">
            <div className="text-xs text-amber-300 font-bold mb-0.5">العملات</div>
            <div className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
              <span>🪙</span>
              <span>{coinsCount}</span>
            </div>
          </div>

          <div className="bg-black/40 border border-yellow-500/30 p-2.5 rounded-2xl">
            <div className="text-xs text-yellow-300 font-bold mb-0.5">النجوم</div>
            <div className="text-base font-black text-yellow-300 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{starsCount}</span>
            </div>
          </div>
        </div>

        {/* Badges & Achievements List */}
        <h4 className="text-sm font-black text-gray-200 mb-2.5 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>أوسمة المغامرة المكتسبة:</span>
        </h4>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                b.unlocked
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-black/30 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl">
                  {b.icon}
                </div>
                <div>
                  <div className="text-xs font-black text-white">{b.title}</div>
                  <div className="text-[10px] text-gray-300">{b.desc}</div>
                </div>
              </div>
              <div className="text-left shrink-0">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {b.reward}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all"
        >
          متابعة المغامرة
        </button>
      </div>
    </div>
  );
};
