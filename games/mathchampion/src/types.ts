export type Operation = '+' | '-' | '×' | '÷';

export type StageId = 
  | 'addition' 
  | 'subtraction' 
  | 'mixed' 
  | 'multiplication' 
  | 'division' 
  | 'mixed_mul'
  | 'ultimate';

export type QuestionType = 'simple' | 'multi_step';

export interface MultiStepQuestion {
  expression: string;
  answer: number;
  steps: number;
  hasParens: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface StageMeta {
  id: StageId;
  label: string;
  labelZh: string;
  emoji: string;
  operations: Operation[];
  color: string;
  gradient: string;
  // For multi-step stages
  steps?: number;
  hasParens?: boolean;
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
  // For multi-step questions
  expression?: string;
  steps?: number;
  hasParens?: boolean;
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
  timeInSeconds?: number; // Total time taken in seconds
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
  unlocked: boolean; // Keep for backward compatibility
  bestStars: number;
  highScore: number;
  // Per-difficulty unlock status
  easyUnlocked: boolean;
  mediumUnlocked: boolean;
  hardUnlocked: boolean;
  // Per-difficulty best scores
  easyBestStars: number;
  mediumBestStars: number;
  hardBestStars: number;
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

export interface AvatarDef {
  id: string;
  emoji: string;
  category?: 'animal' | 'robot' | 'space' | 'character' | 'funny' | 'fantasy' | 'nature';
}

// Auth types (for Cognito integration)
export interface User {
  id: string;
  email: string;
  name: string;
}
