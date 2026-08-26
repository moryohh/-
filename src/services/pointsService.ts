export type PointSource =
  | 'millionaire'
  | 'true_false'
  | 'image_choice'
  | 'daily_exam'
  | 'semester_exam'
  | 'annual_exam'
  | 'experiment';

export interface LevelSnapshot {
  level: number;
  totalPoints: number;
  pointsIntoLevel: number;
  pointsForNextLevel: number;
  progressPercent: number;
}

/**
 * Level 1 requires 20 points, then every next level requires 9% more
 * than the previous level. The game and assessment reward rules remain
 * separate from this progression formula.
 */
export const LEVEL_ONE_TARGET = 20;
export const LEVEL_GROWTH_RATE = 0.09;

const roundRequirement = (value: number): number => Math.round(value * 100) / 100;

const clampPercent = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

export const getLevelRequirement = (level: number): number => {
  const safeLevel = Math.max(1, Math.floor(level));
  let requirement = LEVEL_ONE_TARGET;
  for (let current = 1; current < safeLevel; current += 1) {
    requirement = roundRequirement(requirement * (1 + LEVEL_GROWTH_RATE));
  }
  return requirement;
};

export const getLevelSnapshot = (totalPoints: number): LevelSnapshot => {
  const safeTotal = Math.max(0, Math.floor(Number.isFinite(totalPoints) ? totalPoints : 0));
  let level = 1;
  let remaining = safeTotal;
  let requirement = getLevelRequirement(level);

  // The guard keeps the calculation safe even for an unusually large score.
  while (remaining >= requirement && level < 10000) {
    remaining = roundRequirement(remaining - requirement);
    level += 1;
    requirement = roundRequirement(requirement * (1 + LEVEL_GROWTH_RATE));
  }

  return {
    level,
    totalPoints: safeTotal,
    pointsIntoLevel: remaining,
    pointsForNextLevel: requirement,
    progressPercent: Math.round((remaining / requirement) * 100),
  };
};

export const getMillionaireReward = (
  reachedQuestionCount: number,
  totalQuestions: number,
  completed: boolean
): number => {
  const reached = Math.max(0, Math.floor(reachedQuestionCount));
  const total = Math.max(1, Math.floor(totalQuestions));
  if (completed || reached >= total) return 5;
  if (reached >= 10) return 3;
  if (reached >= 5) return 1;
  return 0;
};

export const getTrueFalseReward = (correctAnswers: number, totalQuestions: number): number => {
  const total = Math.max(1, totalQuestions);
  const accuracy = (Math.max(0, correctAnswers) / total) * 100;
  if (accuracy >= 100) return 3;
  if (accuracy >= 50) return 1;
  return 0;
};

export const getImageChoiceReward = (correctAnswers: number, totalQuestions: number): number => {
  const total = Math.max(1, totalQuestions);
  const accuracy = (Math.max(0, correctAnswers) / total) * 100;
  if (accuracy >= 100) return 5;
  if (accuracy > 50) return 3;
  return 0;
};

export const getDailyExamReward = (percentage: number): number => {
  const score = clampPercent(percentage);
  if (score >= 100) return 10;
  if (score >= 50) return 5;
  if (score > 0) return 1;
  return 0;
};

export const getSemesterExamReward = (percentage: number): number => {
  const score = clampPercent(percentage);
  if (score >= 90) return 40;
  if (score >= 50) return 20;
  if (score > 0) return 2;
  return 0;
};

export const getAnnualExamReward = (percentage: number): number => Math.round(clampPercent(percentage));

export const getExperimentReward = (completed: boolean): number => (completed ? 10 : 0);
