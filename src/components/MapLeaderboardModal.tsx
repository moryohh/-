import React from 'react';
import { Trophy, Medal, X, Crown, Flame, Star } from 'lucide-react';

interface MapLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapLeaderboardModal: React.FC<MapLeaderboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const topStudents = [
    { rank: 1, name: 'سارة العبيدي', level: 25, stars: 48, xp: '3,450', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', badge: '🥇' },
    { rank: 2, name: 'أحمد الحيدري (أنت)', level: 22, stars: 30, xp: '2,250', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', badge: '🥈', isMe: true },
    { rank: 3, name: 'مصطفى الكرخي', level: 21, stars: 28, xp: '2,100', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', badge: '🥉' },
    { rank: 4, name: 'فاطمة الزهراء', level: 19, stars: 24, xp: '1,850', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', badge: '4' },
    { rank: 5, name: 'علي مهدي', level: 18, stars: 20, xp: '1,620', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', badge: '5' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1b2a4e] to-[#0c1529] border-2 border-sky-400 rounded-3xl p-5 text-white shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-sky-300">قائمة أوائل المغامرين</h3>
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        {/* Podium Banner */}
        <div className="bg-gradient-to-r from-sky-900/40 via-blue-800/40 to-indigo-900/40 border border-sky-400/30 rounded-2xl p-3 mb-4 text-center">
          <div className="text-xs text-sky-200 font-bold">الموسم الدراسي الأول - دفعة السادس 2026</div>
          <div className="text-sm font-black text-amber-300 mt-1 flex items-center justify-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>ترتيبك الحالي: المركز الثاني 🥈</span>
          </div>
        </div>

        {/* Student Ranks List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {topStudents.map((s) => (
            <div
              key={s.rank}
              className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 ${
                s.isMe
                  ? 'bg-sky-950/60 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-black w-6 text-center">{s.badge}</span>
                <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>{s.name}</span>
                    {s.isMe && (
                      <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded-md font-bold">
                        أنت
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400">مستوى {s.level}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="text-right">
                  <div className="text-xs font-black text-sky-300">{s.xp} XP</div>
                  <div className="text-[10px] text-amber-400 flex items-center justify-end gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{s.stars}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-sm shadow-lg hover:brightness-110 active:scale-98 transition-all"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};
