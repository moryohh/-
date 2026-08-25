import { getSupabaseClient } from '../lib/supabase';

export type RatingTier = 'diamond' | 'gold' | 'silver' | 'bronze';

export interface CompetitionSnapshot {
  userId: string;
  level: number;
  points: number;
  activityMinutesToday: number;
  activityPointsToday: number;
  periodCorrect: number;
  periodAnswered: number;
  accuracyPercent: number;
  ratingTier: RatingTier;
  ratingLabel: string;
  ratingVisible: boolean;
  periodStart: string;
  periodEnd: string;
  rank: number | null;
  participants: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string;
  level: number;
  points: number;
  ratingTier: RatingTier;
  ratingLabel: string;
  accuracyPercent: number;
  isCurrentUser: boolean;
}

export const RATING_META: Record<RatingTier, { label: string; icon: string; color: string; description: string }> = {
  diamond: {
    label: 'ماسي',
    icon: '◆',
    color: '#67e8f9',
    description: 'دقة ممتازة فوق 70% في التقييم الدوري',
  },
  gold: {
    label: 'ذهبي',
    icon: '★',
    color: '#fbbf24',
    description: 'دقة جيدة من 50% إلى أقل من 70%',
  },
  silver: {
    label: 'فضي',
    icon: '●',
    color: '#cbd5e1',
    description: 'دقة متوسطة من 25% إلى أقل من 50%',
  },
  bronze: {
    label: 'برونزي',
    icon: '◆',
    color: '#c08457',
    description: 'يبدأ به الطالب عند انخفاض الدقة أو عدم وجود إجابات',
  },
};

const normalizeTier = (value: unknown): RatingTier => {
  if (value === 'diamond' || value === 'gold' || value === 'silver') return value;
  return 'bronze';
};

const toSafeInt = (value: unknown, fallback = 0): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, Math.floor(numberValue)) : fallback;
};

const toAccuracy = (value: unknown, correct: number, answered: number): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
  return answered > 0 ? Math.round((correct / answered) * 100) : 0;
};

const mapSnapshot = (row: any): CompetitionSnapshot | null => {
  if (!row) return null;
  const correct = toSafeInt(row.period_correct);
  const answered = toSafeInt(row.period_answered);
  return {
    userId: String(row.user_id || ''),
    level: toSafeInt(row.level, 1),
    points: toSafeInt(row.points),
    activityMinutesToday: toSafeInt(row.activity_minutes_today),
    activityPointsToday: toSafeInt(row.activity_points_today),
    periodCorrect: correct,
    periodAnswered: answered,
    accuracyPercent: toAccuracy(row.accuracy_percent, correct, answered),
    ratingTier: normalizeTier(row.rating_tier),
    ratingLabel: RATING_META[normalizeTier(row.rating_tier)].label,
    ratingVisible: Boolean(row.rating_visible),
    periodStart: String(row.period_start || ''),
    periodEnd: String(row.period_end || ''),
    rank: row.rank === null || row.rank === undefined ? null : toSafeInt(row.rank),
    participants: toSafeInt(row.participants),
  };
};

const getClient = () => getSupabaseClient();

export async function recordActivityBlock(): Promise<CompetitionSnapshot | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const { data, error } = await client.rpc('record_activity_block');
    if (error) {
      console.debug('Competition activity is not ready yet:', error.message);
      return null;
    }
    return mapSnapshot(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    console.debug('Failed to record competition activity:', error);
    return null;
  }
}

export async function recordAssessmentResult(
  correctPoints: number,
  totalPoints: number
): Promise<CompetitionSnapshot | null> {
  const client = getClient();
  if (!client) return null;
  const safeTotal = Math.max(0, Math.min(100000, Math.floor(Number(totalPoints) || 0)));
  const safeCorrect = Math.max(0, Math.min(safeTotal, Math.floor(Number(correctPoints) || 0)));
  if (safeTotal <= 0) return null;

  try {
    const { data, error } = await client.rpc('record_assessment_result', {
      p_correct_points: safeCorrect,
      p_total_points: safeTotal,
    });
    if (error) {
      console.debug('Competition assessment is not ready yet:', error.message);
      return null;
    }
    return mapSnapshot(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    console.debug('Failed to record competition assessment:', error);
    return null;
  }
}

export async function fetchCompetitionSnapshot(): Promise<CompetitionSnapshot | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const { data, error } = await client.rpc('get_my_competition_snapshot');
    if (error) {
      console.debug('Competition snapshot is not ready yet:', error.message);
      return null;
    }
    return mapSnapshot(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    console.debug('Failed to load competition snapshot:', error);
    return null;
  }
}

export async function fetchCompetitionLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const client = getClient();
  if (!client) return [];
  try {
    const { data, error } = await client.rpc('get_competition_leaderboard', {
      p_limit: Math.max(1, Math.min(50, Math.floor(limit))),
    });
    if (error || !Array.isArray(data)) {
      if (error) console.debug('Competition leaderboard is not ready yet:', error.message);
      return [];
    }
    return data.map((row: any) => {
      const tier = normalizeTier(row.rating_tier);
      return {
        rank: toSafeInt(row.rank),
        userId: String(row.user_id || ''),
        name: String(row.display_name || 'طالب المنصة'),
        avatarUrl: row.avatar_url || undefined,
        level: toSafeInt(row.level, 1),
        points: toSafeInt(row.points),
        ratingTier: tier,
        ratingLabel: RATING_META[tier].label,
        accuracyPercent: toAccuracy(row.accuracy_percent, toSafeInt(row.period_correct), toSafeInt(row.period_answered)),
        isCurrentUser: Boolean(row.is_current_user),
      };
    });
  } catch (error) {
    console.debug('Failed to load competition leaderboard:', error);
    return [];
  }
}
