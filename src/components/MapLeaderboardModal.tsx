import React, { useEffect, useState } from 'react';
import { Trophy, X, Crown, Flame, Star, RefreshCw, Users, Gem } from 'lucide-react';
import { UserProfile } from '../types';
import {
  fetchCompetitionLeaderboard,
  fetchCompetitionSnapshot,
  LeaderboardEntry,
  CompetitionSnapshot,
  RATING_META,
} from '../services/competitionService';

interface MapLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
}

const rankBadge = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

const initials = (name: string) => name.trim().slice(0, 2) || 'ط';

export const MapLeaderboardModal: React.FC<MapLeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [snapshot, setSnapshot] = useState<CompetitionSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const [loadedEntries, loadedSnapshot] = await Promise.all([
      fetchCompetitionLeaderboard(20),
      fetchCompetitionSnapshot(),
    ]);
    setEntries(loadedEntries);
    setSnapshot(loadedSnapshot);
    setHasLoaded(true);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) void loadLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-[#020617]/90 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-hidden bg-gradient-to-b from-[#102d5b] via-[#091d43] to-[#040b20] border-2 border-cyan-300/35 rounded-[30px] p-4 sm:p-5 text-white shadow-[0_0_70px_rgba(14,165,233,0.25)]">
        <div className="absolute inset-x-6 top-0 h-1 bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300" />
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors active:scale-95"
            aria-label="إغلاق قائمة الصدارة"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-300/15 border border-amber-300/40 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-cyan-100">قائمة الصدارة</h3>
              <p className="text-[10px] text-sky-100/65">أعلى المستويات والنقاط في المنصة</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-400/10 via-blue-400/15 to-amber-300/10 border border-cyan-300/25 rounded-2xl p-3 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-300/15 border border-cyan-200/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="text-[10px] text-sky-100/70 font-bold">ترتيبك الحالي</div>
                <div className="text-sm font-black text-amber-200">
                  {snapshot?.rank ? `المركز ${snapshot.rank}` : 'بانتظار تسجيل النتيجة'}
                </div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-[10px] text-sky-100/70">مشاركون</div>
              <div className="text-sm font-black text-cyan-200 flex items-center gap-1 justify-end">
                <Users className="w-3.5 h-3.5" />
                {snapshot?.participants ?? entries.length}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-black/15 border border-white/10 p-2">
              <div className="text-[10px] text-sky-100/65">مستواك</div>
              <div className="text-lg font-black text-white">{snapshot?.level ?? currentUser?.level ?? 1}</div>
            </div>
            <div className="rounded-xl bg-black/15 border border-white/10 p-2">
              <div className="text-[10px] text-sky-100/65">نقاطك</div>
              <div className="text-lg font-black text-amber-200 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {snapshot?.points ?? currentUser?.points ?? 0}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-black text-cyan-100 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-300" />
            المتصدرون
          </h4>
          <button
            type="button"
            onClick={() => void loadLeaderboard()}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-cyan-200 hover:bg-white/10 transition-colors disabled:opacity-50"
            title="تحديث قائمة الصدارة"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1 custom-scrollbar overscroll-contain">
          {isLoading && !hasLoaded ? (
            <div className="py-12 text-center text-xs text-cyan-100/70">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-cyan-300" />
              جارٍ تحميل قائمة الصدارة...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-cyan-300/25 bg-cyan-300/5">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-cyan-300/70" />
              <p className="text-xs font-black text-cyan-100">لا توجد نتائج صدارة ظاهرة بعد</p>
              <p className="text-[10px] leading-relaxed text-sky-100/60 mt-1">
                ستظهر القائمة بعد تفعيل جدول التنافس في Supabase A وتسجيل المستخدمين لنقاطهم.
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const showRating = entry.level >= 6;
              const rating = RATING_META[entry.ratingTier];
              return (
                <div
                  key={entry.userId}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-colors ${
                    entry.isCurrentUser
                      ? 'bg-cyan-400/12 border-cyan-200/60 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                      : 'bg-black/20 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm font-black w-7 text-center shrink-0">{rankBadge(entry.rank)}</span>
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt=""
                        width={38}
                        height={38}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded-xl object-cover border border-cyan-200/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-300 to-blue-600 text-slate-950 flex items-center justify-center font-black text-xs border border-cyan-100/40">
                        {initials(entry.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                        <span>{entry.name}</span>
                        {entry.isCurrentUser && <span className="text-[9px] bg-amber-300 text-slate-950 px-1.5 py-0.5 rounded-md">أنت</span>}
                      </div>
                      <div className="text-[10px] text-sky-100/65 flex items-center gap-1.5 mt-0.5">
                        <span>المستوى {entry.level}</span>
                        {showRating && (
                          <span style={{ color: rating.color }} className="font-black flex items-center gap-0.5">
                            <Gem className="w-3 h-3" /> {rating.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-xs font-black text-amber-200">{entry.points.toLocaleString()} نقطة</div>
                    {showRating ? (
                      <div className="text-[10px] text-cyan-200/80">دقة {entry.accuracyPercent}%</div>
                    ) : (
                      <div className="text-[10px] text-sky-100/45">التقييم بعد المستوى 5</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black text-sm shadow-[0_8px_20px_rgba(14,165,233,0.25)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};
