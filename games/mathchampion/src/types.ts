export type Operation = '+' | '-' | '×' | '÷';

export type StageId = 'addition' | 'subtraction' | 'mixed' | 'multiplication' | 'division' | 'mixed_mul';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface StageMeta {
  id: StageId;
  label: string;
  labelZh: string;
  emoji: string;
  operations: Operation[];
  color: string;
  gradient: string;
}

export interface DifficultyMeta {
  id: Difficulty;
  label: string;
  labelZh: string;
  timeLimit: number;
  maxDigits: number;
  stars: { threshold: number; label: string; labelZh: string }[];
}

export interface Question {
  a: number;
  b: number;
  op: Operation;
  answer: number;
}

export interface AnswerRecord {
  correct: boolean;
  timeLeft: number;
  timeLimit: number;
  streak: number;
}

export interface RoundResult {
  stageId: StageId;
  difficulty: Difficulty;
  score: number;
  correct: number;
  total: number;
  stars: number;
  maxStreak: number;
  date: number;
  xpEarned: number;
  answers: AnswerRecord[];
  isDaily: boolean;
}

export interface LeaderboardEntry {
  name: string;
  avatar: string;
  score: number;
  stageId: StageId;
  difficulty: Difficulty;
  stars: number;
  date: number;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
}

export interface StageProgress {
  unlocked: boolean;
  bestStars: number;
  highScore: number;
}

export interface GameProgress {
  stages: Record<StageId, StageProgress>;
}

export interface PlayerStats {
  xp: number;
  totalCorrect: number;
  totalAnswered: number;
  bestStreakEver: number;
  roundsPlayed: number;
  perfectRounds: number;
  badges: string[];
  dailyLastDate: string | null;
  dailyStreak: number;
}

export interface BadgeDef {
  id: string;
  label: string;
  labelZh: string;
  emoji: string;
  description: string;
  descriptionZh: string;
}

// Auth types (for Cognito integration)
export interface User {
  userId: string;
  email: string;
  name: string;
}
