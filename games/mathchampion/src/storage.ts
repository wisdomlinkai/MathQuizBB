import type {
  PlayerProfile,
  GameProgress,
  LeaderboardEntry,
  StageId,
  Difficulty,
  PlayerStats,
  RoundResult,
} from '@/types';
import { STAGES, getTodayString, levelFromXp, checkBadges } from '@/game';

const KEYS = {
  player: 'mc_player',
  progress: 'mc_progress',
  leaderboard: 'mc_leaderboard',
  stats: 'mc_stats',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getPlayer(): PlayerProfile {
  return safeGet<PlayerProfile>(KEYS.player, {
    name: '',
    avatar: 'cat',
  });
}

export function savePlayer(player: PlayerProfile): void {
  safeSet(KEYS.player, player);
}

export function getProgress(): GameProgress {
  const defaultProgress: GameProgress = {
    stages: {
      addition: { 
        unlocked: true, 
        bestStars: 0, 
        highScore: 0,
        easyUnlocked: true,
        mediumUnlocked: false,
        hardUnlocked: false,
        easyBestStars: 0,
        mediumBestStars: 0,
        hardBestStars: 0,
      },
      subtraction: { 
        unlocked: true, 
        bestStars: 0, 
        highScore: 0,
        easyUnlocked: true,
        mediumUnlocked: false,
        hardUnlocked: false,
        easyBestStars: 0,
        mediumBestStars: 0,
        hardBestStars: 0,
      },
      mixed: { 
        unlocked: true, 
        bestStars: 0, 
        highScore: 0,
        easyUnlocked: true,
        mediumUnlocked: false,
        hardUnlocked: false,
        easyBestStars: 0,
        mediumBestStars: 0,
        hardBestStars: 0,
      },
      multiplication: { 
        unlocked: true, 
        bestStars: 0, 
        highScore: 0,
        easyUnlocked: true,
        mediumUnlocked: false,
        hardUnlocked: false,
        easyBestStars: 0,
        mediumBestStars: 0,
        hardBestStars: 0,
      },
      division: { 
        unlocked: true, 
        bestStars: 0, 
        highScore: 0,
        easyUnlocked: true,
        mediumUnlocked: false,
        hardUnlocked: false,
        easyBestStars: 0,
        mediumBestStars: 0,
        hardBestStars: 0,
      },
      mixed_mul: { 
        unlocked: true, 
        bestStars: 0, 
        highScore: 0,
        easyUnlocked: true,
        mediumUnlocked: false,
        hardUnlocked: false,
        easyBestStars: 0,
        mediumBestStars: 0,
        hardBestStars: 0,
      },
      ultimate: { 
        unlocked: true, 
        bestStars: 0, 
        highScore: 0,
        easyUnlocked: true,
        mediumUnlocked: false,
        hardUnlocked: false,
        easyBestStars: 0,
        mediumBestStars: 0,
        hardBestStars: 0,
      },
    },
  };
  
  const progress = safeGet<GameProgress>(KEYS.progress, defaultProgress);
  
  // Ensure all stages have the new fields (migration)
  for (const stage of STAGES) {
    if (!progress.stages[stage.id]) {
      progress.stages[stage.id] = { 
        unlocked: true, 
        bestStars: 0, 
        highScore: 0,
        easyUnlocked: true,
        mediumUnlocked: false,
        hardUnlocked: false,
        easyBestStars: 0,
        mediumBestStars: 0,
        hardBestStars: 0,
      };
    }
    
    // Migrate old data to new format if needed
    const s = progress.stages[stage.id];
    if (s.easyUnlocked === undefined) {
      s.easyUnlocked = true;
    }
    if (s.mediumUnlocked === undefined) {
      s.mediumUnlocked = false;
    }
    if (s.hardUnlocked === undefined) {
      s.hardUnlocked = false;
    }
    if (s.easyBestStars === undefined) {
      s.easyBestStars = 0;
    }
    if (s.mediumBestStars === undefined) {
      s.mediumBestStars = 0;
    }
    if (s.hardBestStars === undefined) {
      s.hardBestStars = 0;
    }
  }
  
  return progress;
}

export function saveProgress(progress: GameProgress): void {
  safeSet(KEYS.progress, progress);
}

export function updateStageProgress(
  stageId: StageId,
  stars: number,
  score: number,
  difficulty: Difficulty
): GameProgress {
  const progress = getProgress();
  const stage = progress.stages[stageId];

  // Update overall best stars and score
  stage.bestStars = Math.max(stage.bestStars, stars);
  stage.highScore = Math.max(stage.highScore, score);
  
  // Update difficulty-specific best stars
  if (difficulty === 'easy') {
    stage.easyBestStars = Math.max(stage.easyBestStars, stars);
    // Unlock medium after getting 1+ star on easy
    if (stars >= 1) {
      stage.mediumUnlocked = true;
    }
  } else if (difficulty === 'medium') {
    stage.mediumBestStars = Math.max(stage.mediumBestStars, stars);
    // Unlock hard after getting 1+ star on medium
    if (stars >= 1) {
      stage.hardUnlocked = true;
    }
  } else if (difficulty === 'hard') {
    stage.hardBestStars = Math.max(stage.hardBestStars, stars);
  }

  saveProgress(progress);
  return progress;
}

// --- Player Stats ---

export function getDefaultStats(): PlayerStats {
  return {
    xp: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    bestStreakEver: 0,
    roundsPlayed: 0,
    perfectRounds: 0,
    badges: [],
    dailyLastDate: null,
    dailyStreak: 0,
  };
}

export function getStats(): PlayerStats {
  return safeGet<PlayerStats>(KEYS.stats, getDefaultStats());
}

export function saveStats(stats: PlayerStats): void {
  safeSet(KEYS.stats, stats);
}

export interface RoundOutcome {
  stats: PlayerStats;
  newBadges: string[];
  leveledUp: boolean;
  newLevel: number;
}

export function recordRoundResult(
  result: RoundResult,
  progress: GameProgress
): RoundOutcome {
  const prevStats = getStats();
  const prevLevel = levelFromXp(prevStats.xp).level;

  const newBadges = checkBadges(prevStats, result, progress);

  const isDailyToday = result.isDaily && prevStats.dailyLastDate !== getTodayString();
  const newDailyStreak = isDailyToday
    ? prevStats.dailyStreak + 1
    : result.isDaily
      ? prevStats.dailyStreak
      : prevStats.dailyStreak;

  const newStats: PlayerStats = {
    xp: prevStats.xp + result.xpEarned,
    totalCorrect: prevStats.totalCorrect + result.correct,
    totalAnswered: prevStats.totalAnswered + result.total,
    bestStreakEver: Math.max(prevStats.bestStreakEver, result.maxStreak),
    roundsPlayed: prevStats.roundsPlayed + 1,
    perfectRounds: prevStats.perfectRounds + (result.correct === result.total ? 1 : 0),
    badges: [...new Set([...prevStats.badges, ...newBadges])],
    dailyLastDate: result.isDaily ? getTodayString() : prevStats.dailyLastDate,
    dailyStreak: newDailyStreak,
  };

  saveStats(newStats);

  const newLevel = levelFromXp(newStats.xp).level;
  return {
    stats: newStats,
    newBadges,
    leveledUp: newLevel > prevLevel,
    newLevel,
  };
}

// --- Leaderboard ---

export function getLeaderboard(): LeaderboardEntry[] {
  return safeGet<LeaderboardEntry[]>(KEYS.leaderboard, []);
}

export function addToLeaderboard(entry: LeaderboardEntry): LeaderboardEntry[] {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const top10 = board.slice(0, 10);
  safeSet(KEYS.leaderboard, top10);
  return top10;
}
