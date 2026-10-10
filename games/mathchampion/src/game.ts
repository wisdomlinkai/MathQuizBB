import type {
  StageId,
  Difficulty,
  Operation,
  Question,
  StageMeta,
  DifficultyMeta,
  PlayerStats,
  RoundResult,
  BadgeDef,
} from '@/types';

export const STAGES: StageMeta[] = [
  {
    id: 'addition',
    label: 'Addition',
    labelZh: '加法',
    emoji: '➕',
    operations: ['+'],
    color: 'mint',
    gradient: 'from-mint-300 to-mint-500',
  },
  {
    id: 'subtraction',
    label: 'Subtraction',
    labelZh: '減法',
    emoji: '➖',
    operations: ['-'],
    color: 'coral',
    gradient: 'from-coral-300 to-coral-500',
  },
  {
    id: 'mixed',
    label: 'Mixed +/−',
    labelZh: '混合加減',
    emoji: '🎯',
    operations: ['+', '-'],
    color: 'teal',
    gradient: 'from-teal-300 to-teal-500',
  },
  {
    id: 'multiplication',
    label: 'Multiplication',
    labelZh: '乘法',
    emoji: '✖️',
    operations: ['×'],
    color: 'sun',
    gradient: 'from-sun-300 to-sun-500',
  },
  {
    id: 'division',
    label: 'Division',
    labelZh: '除法',
    emoji: '➗',
    operations: ['÷'],
    color: 'orange',
    gradient: 'from-orange-300 to-orange-500',
  },
  {
    id: 'mixed_mul',
    label: 'Mixed ×/÷',
    labelZh: '混合乘除',
    emoji: '🏆',
    operations: ['×', '÷'],
    color: 'cyan',
    gradient: 'from-cyan-300 to-cyan-500',
  },
  {
    id: 'ultimate',
    label: 'Ultimate Challenge',
    labelZh: '終極挑戰',
    emoji: '🎓',
    operations: ['+', '-', '×', '÷'],
    color: 'purple',
    gradient: 'from-purple-400 to-violet-600',
    steps: -1, // -1 means random steps from 2-4
    hasParens: true,
  },
];

export const DIFFICULTIES: DifficultyMeta[] = [
  {
    id: 'easy',
    label: 'Easy',
    labelZh: '簡單',
    timeLimit: 18,
    maxDigits: 1,
    stars: [
      { threshold: 7, label: '3 Stars', labelZh: '三星' },
      { threshold: 5, label: '2 Stars', labelZh: '兩星' },
      { threshold: 1, label: '1 Star', labelZh: '一星' },
    ],
  },
  {
    id: 'medium',
    label: 'Medium',
    labelZh: '中等',
    timeLimit: 14,
    maxDigits: 2,
    stars: [
      { threshold: 7, label: '3 Stars', labelZh: '三星' },
      { threshold: 5, label: '2 Stars', labelZh: '兩星' },
      { threshold: 1, label: '1 Star', labelZh: '一星' },
    ],
  },
  {
    id: 'hard',
    label: 'Hard',
    labelZh: '困難',
    timeLimit: 10,
    maxDigits: 3,
    stars: [
      { threshold: 8, label: '3 Stars', labelZh: '三星' },
      { threshold: 6, label: '2 Stars', labelZh: '兩星' },
      { threshold: 1, label: '1 Star', labelZh: '一星' },
    ],
  },
];

export const QUESTIONS_PER_ROUND = 10;

// --- XP & Levels ---

export const XP_PER_CORRECT = 50;
export const XP_PER_STAR_BONUS = 30;
export const XP_PER_DAILY_BONUS = 100;

export function levelFromXp(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progress: number } {
  let level = 1;
  let remaining = xp;
  let needed = 200;

  while (remaining >= needed) {
    remaining -= needed;
    level++;
    needed = 200 + (level - 1) * 100;
  }

  const progress = remaining / needed;
  return { level, currentLevelXp: remaining, nextLevelXp: needed, progress };
}

export function getLevelTitle(level: number): { en: string; zh: string } {
  if (level >= 20) return { en: 'Math Legend', zh: '數學傳奇' };
  if (level >= 15) return { en: 'Math Master', zh: '數學大師' };
  if (level >= 10) return { en: 'Math Expert', zh: '數學專家' };
  if (level >= 7) return { en: 'Math Star', zh: '數學之星' };
  if (level >= 4) return { en: 'Math Whiz', zh: '數學小能手' };
  if (level >= 2) return { en: 'Math Learner', zh: '數學學徒' };
  return { en: 'Beginner', zh: '初學者' };
}

// --- Combo Multipliers ---

export function getComboMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function getComboLabel(streak: number): { en: string; zh: string } | null {
  if (streak >= 10) return { en: '3x Combo!', zh: '三倍連擊！' };
  if (streak >= 5) return { en: '2x Combo!', zh: '雙倍連擊！' };
  if (streak >= 3) return { en: '1.5x Combo!', zh: '1.5倍連擊！' };
  return null;
}

// --- Time Bonus ---

export function getTimeBonus(timeLeft: number, timeLimit: number): number {
  const ratio = timeLeft / timeLimit;
  if (ratio >= 0.75) return 50;
  if (ratio >= 0.5) return 30;
  if (ratio >= 0.25) return 15;
  return 0;
}

export function getTimeBonusLabel(timeLeft: number, timeLimit: number): { en: string; zh: string } | null {
  const ratio = timeLeft / timeLimit;
  if (ratio >= 0.75) return { en: 'Lightning Fast! ⚡', zh: '閃電速度！⚡' };
  if (ratio >= 0.5) return { en: 'Quick!', zh: '好快！' };
  return null;
}

// --- Scoring (with combo + time bonus) ---

export function calculateAnswerScore(streak: number, timeLeft: number, timeLimit: number): number {
  const base = 100;
  const streakBonus = streak * 20;
  const comboMult = getComboMultiplier(streak);
  const timeBonus = getTimeBonus(timeLeft, timeLimit);
  return Math.round((base + streakBonus + timeBonus) * comboMult);
}

export function calculateStars(correct: number, difficulty: Difficulty): number {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty)!;
  for (let i = 0; i < diff.stars.length; i++) {
    if (correct >= diff.stars[i].threshold) return 3 - i;
  }
  return 0;
}

// --- XP Calculation ---

export function calculateRoundXp(correct: number, stars: number, isDaily: boolean): number {
  let xp = correct * XP_PER_CORRECT;
  xp += stars * XP_PER_STAR_BONUS;
  if (isDaily) xp += XP_PER_DAILY_BONUS;
  return xp;
}

// --- Random helpers ---

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(operations: Operation[], maxDigits: number): Question {
  const op = operations[randInt(0, operations.length - 1)];

  if (op === '×') {
    if (maxDigits <= 1) {
      const a = randInt(2, 9);
      const b = randInt(2, 9);
      return { a, b, op, answer: a * b };
    }
    if (maxDigits === 2) {
      const a = randInt(11, 30);
      const b = randInt(2, 9);
      return { a, b, op, answer: a * b };
    }
    const a = randInt(12, 99);
    const b = randInt(2, 12);
    return { a, b, op, answer: a * b };
  }

  if (op === '÷') {
    if (maxDigits <= 1) {
      const divisor = randInt(2, 9);
      const quotient = randInt(2, 9);
      return { a: divisor * quotient, b: divisor, op, answer: quotient };
    }
    if (maxDigits === 2) {
      const divisor = randInt(2, 9);
      const quotient = randInt(5, 20);
      return { a: divisor * quotient, b: divisor, op, answer: quotient };
    }
    const divisor = randInt(2, 12);
    const quotient = randInt(10, 50);
    return { a: divisor * quotient, b: divisor, op, answer: quotient };
  }

  const max = maxDigits === 1 ? 9 : maxDigits === 2 ? 99 : 999;
  const min = maxDigits === 1 ? 1 : maxDigits === 2 ? 10 : 100;
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (op === '-' && b > a) {
    [a, b] = [b, a];
  }
  return { a, b, op, answer: op === '+' ? a + b : a - b };
}

// Generate multi-step questions with no negative results
export function generateMultiStepQuestion(
  steps: number,
  hasParens: boolean,
  maxDigits: number
): Question {
  // Generate a valid expression by building it from the answer
  // This ensures no negative intermediate or final results
  
  const getMax = () => {
    if (maxDigits <= 1) return 9;
    if (maxDigits === 2) return 50;
    return 100;
  };
  
  const max = getMax();
  
  // For simplicity, generate specific patterns that are guaranteed to be valid
  // Pattern types:
  // 1. a + b × c (order of operations)
  // 2. a × b + c
  // 3. (a + b) × c (with parentheses)
  // 4. a × (b + c)
  // 5. a + b - c (ensuring a + b >= c)
  // etc.
  
  if (steps === 2) {
    return generateTwoStepQuestion(hasParens, max);
  } else if (steps === 3) {
    return generateThreeStepQuestion(hasParens, max);
  } else {
    return generateFourStepQuestion(max);
  }
}

function generateTwoStepQuestion(hasParens: boolean, max: number): Question {
  const patterns = hasParens ? [
    () => {
      // (a + b) × c
      const a = randInt(1, Math.floor(max / 3));
      const b = randInt(1, Math.floor(max / 3));
      const c = randInt(2, 9);
      return {
        expression: `(${a} + ${b}) × ${c}`,
        answer: (a + b) * c,
      };
    },
    () => {
      // (a - b) × c, ensuring a > b
      const b = randInt(1, Math.floor(max / 4));
      const a = randInt(b + 1, b + Math.floor(max / 4));
      const c = randInt(2, 9);
      return {
        expression: `(${a} - ${b}) × ${c}`,
        answer: (a - b) * c,
      };
    },
    () => {
      // a × (b + c)
      const a = randInt(2, 9);
      const b = randInt(1, Math.floor(max / (a * 2)));
      const c = randInt(1, Math.floor(max / (a * 2)));
      return {
        expression: `${a} × (${b} + ${c})`,
        answer: a * (b + c),
      };
    },
    () => {
      // (a + b) ÷ c, ensuring (a + b) is divisible by c
      const c = randInt(2, 9);
      const sum = c * randInt(2, Math.floor(max / c));
      const a = randInt(1, sum - 1);
      const b = sum - a;
      return {
        expression: `(${a} + ${b}) ÷ ${c}`,
        answer: sum / c,
      };
    },
  ] : [
    () => {
      // a + b × c (order of operations: multiply first)
      const b = randInt(2, 9);
      const c = randInt(2, 9);
      const a = randInt(1, max - b * c);
      return {
        expression: `${a} + ${b} × ${c}`,
        answer: a + b * c,
      };
    },
    () => {
      // a × b + c
      const a = randInt(2, 9);
      const b = randInt(2, Math.floor(max / a));
      const c = randInt(1, max - a * b);
      return {
        expression: `${a} × ${b} + ${c}`,
        answer: a * b + c,
      };
    },
    () => {
      // a × b - c, ensuring a × b > c
      const a = randInt(2, 9);
      const b = randInt(2, Math.floor(max / a));
      const c = randInt(1, a * b - 1);
      return {
        expression: `${a} × ${b} - ${c}`,
        answer: a * b - c,
      };
    },
    () => {
      // a + b - c, ensuring a + b > c
      const a = randInt(1, Math.floor(max / 2));
      const b = randInt(1, Math.floor(max / 2));
      const c = randInt(1, a + b - 1);
      return {
        expression: `${a} + ${b} - ${c}`,
        answer: a + b - c,
      };
    },
    () => {
      // a ÷ b + c, ensuring a is divisible by b
      const b = randInt(2, 9);
      const quotient = randInt(1, Math.floor(max / b));
      const a = b * quotient;
      const c = randInt(1, max - quotient);
      return {
        expression: `${a} ÷ ${b} + ${c}`,
        answer: quotient + c,
      };
    },
  ];
  
  const pattern = patterns[randInt(0, patterns.length - 1)]();
  
  return {
    a: 0,
    b: 0,
    op: '+',
    answer: pattern.answer,
    expression: pattern.expression,
    steps: 2,
    hasParens,
  };
}

function generateThreeStepQuestion(hasParens: boolean, max: number): Question {
  const patterns = hasParens ? [
    () => {
      // (a + b) × c + d
      const a = randInt(1, Math.floor(max / 4));
      const b = randInt(1, Math.floor(max / 4));
      const c = randInt(2, 6);
      const d = randInt(1, max - (a + b) * c);
      return {
        expression: `(${a} + ${b}) × ${c} + ${d}`,
        answer: (a + b) * c + d,
      };
    },
    () => {
      // a × (b + c) - d, ensuring result > 0
      const a = randInt(2, 6);
      const b = randInt(1, Math.floor(max / (a * 2)));
      const c = randInt(1, Math.floor(max / (a * 2)));
      const product = a * (b + c);
      const d = randInt(1, Math.min(product - 1, max));
      return {
        expression: `${a} × (${b} + ${c}) - ${d}`,
        answer: product - d,
      };
    },
    () => {
      // (a - b) × c + d, ensuring a > b
      const b = randInt(1, Math.floor(max / 6));
      const a = randInt(b + 1, b + Math.floor(max / 6));
      const c = randInt(2, 6);
      const d = randInt(1, max);
      return {
        expression: `(${a} - ${b}) × ${c} + ${d}`,
        answer: (a - b) * c + d,
      };
    },
  ] : [
    () => {
      // a + b × c + d (multiply first)
      const b = randInt(2, 6);
      const c = randInt(2, Math.floor(max / b));
      const product = b * c;
      const a = randInt(1, Math.floor((max - product) / 2));
      const d = randInt(1, max - product - a);
      return {
        expression: `${a} + ${b} × ${c} + ${d}`,
        answer: a + product + d,
      };
    },
    () => {
      // a × b + c - d, ensuring a × b + c > d
      const a = randInt(2, 6);
      const b = randInt(2, Math.floor(max / a));
      const product = a * b;
      const c = randInt(1, Math.floor((max - product) / 2));
      const sum = product + c;
      const d = randInt(1, sum - 1);
      return {
        expression: `${a} × ${b} + ${c} - ${d}`,
        answer: sum - d,
      };
    },
    () => {
      // a + b - c + d, ensuring no negative intermediate
      const a = randInt(2, Math.floor(max / 2));
      const b = randInt(1, Math.floor(max / 3));
      const c = randInt(1, a + b - 1);
      const d = randInt(1, max);
      return {
        expression: `${a} + ${b} - ${c} + ${d}`,
        answer: a + b - c + d,
      };
    },
  ];
  
  const pattern = patterns[randInt(0, patterns.length - 1)]();
  
  return {
    a: 0,
    b: 0,
    op: '+',
    answer: pattern.answer,
    expression: pattern.expression,
    steps: 3,
    hasParens,
  };
}

function generateFourStepQuestion(max: number): Question {
  const patterns = [
    () => {
      // (a + b) × c + d - e
      const a = randInt(1, Math.floor(max / 5));
      const b = randInt(1, Math.floor(max / 5));
      const c = randInt(2, 5);
      const product = (a + b) * c;
      const d = randInt(1, Math.floor((max - product) / 2));
      const sum = product + d;
      const e = randInt(1, sum - 1);
      return {
        expression: `(${a} + ${b}) × ${c} + ${d} - ${e}`,
        answer: sum - e,
      };
    },
    () => {
      // a × (b + c) + d - e
      const a = randInt(2, 5);
      const b = randInt(1, Math.floor(max / (a * 3)));
      const c = randInt(1, Math.floor(max / (a * 3)));
      const product = a * (b + c);
      const d = randInt(1, Math.floor((max - product) / 2));
      const sum = product + d;
      const e = randInt(1, sum - 1);
      return {
        expression: `${a} × (${b} + ${c}) + ${d} - ${e}`,
        answer: sum - e,
      };
    },
    () => {
      // a + b × c + d - e (order of operations)
      const b = randInt(2, 5);
      const c = randInt(2, Math.floor(max / b));
      const product = b * c;
      const a = randInt(1, Math.floor((max - product) / 3));
      const d = randInt(1, Math.floor((max - product - a) / 2));
      const sum = a + product + d;
      const e = randInt(1, sum - 1);
      return {
        expression: `${a} + ${b} × ${c} + ${d} - ${e}`,
        answer: sum - e,
      };
    },
    () => {
      // (a - b) × c + d + e, ensuring a > b
      const b = randInt(1, Math.floor(max / 8));
      const a = randInt(b + 1, b + Math.floor(max / 8));
      const c = randInt(2, 5);
      const product = (a - b) * c;
      const d = randInt(1, Math.floor((max - product) / 2));
      const e = randInt(1, max - product - d);
      return {
        expression: `(${a} - ${b}) × ${c} + ${d} + ${e}`,
        answer: product + d + e,
      };
    },
  ];
  
  const pattern = patterns[randInt(0, patterns.length - 1)]();
  
  return {
    a: 0,
    b: 0,
    op: '+',
    answer: pattern.answer,
    expression: pattern.expression,
    steps: 4,
    hasParens: true,
  };
}

export function generateRound(stageId: StageId, difficulty: Difficulty): Question[] {
  const stage = STAGES.find((s) => s.id === stageId)!;
  const diff = DIFFICULTIES.find((d) => d.id === difficulty)!;
  const questions: Question[] = [];
  const seen = new Set<string>();

  // Check if this is a multi-step stage
  const isMultiStep = stage.steps !== undefined && stage.steps >= 2;
  // Ultimate challenge has steps = -1 (random)
  const isUltimate = stage.steps === -1;

  let attempts = 0;
  while (questions.length < QUESTIONS_PER_ROUND && attempts < 200) {
    let q: Question;
    
    if (isUltimate) {
      // Random steps between 2-4, randomly include parentheses
      const randomSteps = randInt(2, 4);
      const randomParens = Math.random() > 0.3; // 70% chance of parentheses
      q = generateMultiStepQuestion(randomSteps, randomParens, diff.maxDigits);
    } else if (isMultiStep) {
      q = generateMultiStepQuestion(
        stage.steps!,
        stage.hasParens ?? false,
        diff.maxDigits
      );
    } else {
      q = generateQuestion(stage.operations, diff.maxDigits);
    }
    
    const key = q.expression ?? `${q.a}${q.op}${q.b}`;
    if (!seen.has(key)) {
      seen.add(key);
      questions.push(q);
    }
    attempts++;
  }

  while (questions.length < QUESTIONS_PER_ROUND) {
    if (isUltimate) {
      const randomSteps = randInt(2, 4);
      const randomParens = Math.random() > 0.3;
      questions.push(generateMultiStepQuestion(randomSteps, randomParens, diff.maxDigits));
    } else if (isMultiStep) {
      questions.push(generateMultiStepQuestion(
        stage.steps!,
        stage.hasParens ?? false,
        diff.maxDigits
      ));
    } else {
      questions.push(generateQuestion(stage.operations, diff.maxDigits));
    }
  }

  return questions;
}

// --- Daily Challenge ---

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isDailyAvailable(stats: PlayerStats): boolean {
  return stats.dailyLastDate !== getTodayString();
}

export function generateDailyRound(): { stageId: StageId; difficulty: Difficulty; questions: Question[] } {
  const dayNum = new Date().getDate();
  const stageIdx = dayNum % STAGES.length;
  const stage = STAGES[stageIdx];
  const diffIdx = dayNum % 2 === 0 ? 1 : 0;
  const diff = DIFFICULTIES[diffIdx];
  return {
    stageId: stage.id,
    difficulty: diff.id,
    questions: generateRound(stage.id, diff.id),
  };
}

// --- Badges ---

export const BADGES: BadgeDef[] = [
  {
    id: 'first_game',
    label: 'First Steps',
    labelZh: '第一步',
    emoji: '👶',
    description: 'Complete your first round',
    descriptionZh: '完成第一回合',
  },
  {
    id: 'first_3star',
    label: 'Triple Star',
    labelZh: '三星初現',
    emoji: '⭐',
    description: 'Earn 3 stars in any round',
    descriptionZh: '在任何回合獲得三星',
  },
  {
    id: 'perfect_round',
    label: 'Flawless',
    labelZh: '完美無瑕',
    emoji: '💯',
    description: 'Answer all 10 questions correctly',
    descriptionZh: '全部十題答對',
  },
  {
    id: 'streak_5',
    label: 'On Fire',
    labelZh: '連擊高手',
    emoji: '🔥',
    description: 'Reach a 5-answer streak',
    descriptionZh: '連續答對五題',
  },
  {
    id: 'streak_10',
    label: 'Unstoppable',
    labelZh: '勢不可擋',
    emoji: '🚀',
    description: 'Reach a 10-answer streak',
    descriptionZh: '連續答對十題',
  },
  {
    id: 'speed_demon',
    label: 'Speed Demon',
    labelZh: '閃電俠',
    emoji: '⚡',
    description: 'Answer with 75%+ time remaining',
    descriptionZh: '在剩餘75%時間內答對',
  },
  {
    id: 'level_5',
    label: 'Rising Star',
    labelZh: '新星崛起',
    emoji: '🌟',
    description: 'Reach Level 5',
    descriptionZh: '達到五級',
  },
  {
    id: 'level_10',
    label: 'Math Expert',
    labelZh: '數學專家',
    emoji: '🎓',
    description: 'Reach Level 10',
    descriptionZh: '達到十級',
  },
  {
    id: 'daily_3',
    label: 'Daily Habit',
    labelZh: '每日挑戰',
    emoji: '📅',
    description: 'Complete 3 daily challenges',
    descriptionZh: '完成三次每日挑戰',
  },
  {
    id: 'all_stages',
    label: 'Champion',
    labelZh: '全方位冠軍',
    emoji: '👑',
    description: 'Unlock all stages',
    descriptionZh: '解鎖所有關卡',
  },
  {
    id: 'combo_3x',
    label: 'Combo Master',
    labelZh: '連擊大師',
    emoji: '🎯',
    description: 'Hit a 3x combo multiplier',
    descriptionZh: '達到三倍連擊',
  },
  {
    id: 'hard_warrior',
    label: 'Hard Warrior',
    labelZh: '困難戰士',
    emoji: '⚔️',
    description: 'Complete a Hard difficulty round',
    descriptionZh: '完成困難難度回合',
  },
];

export function checkBadges(
  prevStats: PlayerStats,
  result: RoundResult,
  progress: { stages: Record<StageId, { unlocked: boolean }> }
): string[] {
  const earned = new Set(prevStats.badges);
  const newBadges: string[] = [];

  function grant(id: string) {
    if (!earned.has(id)) {
      earned.add(id);
      newBadges.push(id);
    }
  }

  const totalXp = prevStats.xp + result.xpEarned;
  const level = levelFromXp(totalXp).level;
  const newBestStreak = Math.max(prevStats.bestStreakEver, result.maxStreak);
  const newRoundsPlayed = prevStats.roundsPlayed + 1;

  if (newRoundsPlayed >= 1) grant('first_game');
  if (result.stars >= 3) grant('first_3star');
  if (result.correct === result.total) grant('perfect_round');
  if (newBestStreak >= 5) grant('streak_5');
  if (newBestStreak >= 10) grant('streak_10');
  if (result.answers.some((a) => a.correct && a.timeLeft / a.timeLimit >= 0.75)) grant('speed_demon');
  if (level >= 5) grant('level_5');
  if (level >= 10) grant('level_10');
  if (prevStats.dailyStreak + (result.isDaily ? 1 : 0) >= 3) grant('daily_3');
  if (Object.values(progress.stages).every((s) => s.unlocked)) grant('all_stages');
  if (result.maxStreak >= 10) grant('combo_3x');
  if (result.difficulty === 'hard' && result.correct >= 1) grant('hard_warrior');

  return newBadges;
}

// --- Encouragement ---

export function getEncouragement(correct: boolean, streak: number): { en: string; zh: string } {
  if (correct) {
    const messages = [
      { en: 'Correct!', zh: '答對了！' },
      { en: 'Great job!', zh: '好叻呀！' },
      { en: 'Awesome!', zh: '太棒了！' },
      { en: 'You got it!', zh: '答中了！' },
      { en: 'Well done!', zh: '做得好！' },
    ];
    if (streak >= 5) return { en: 'On fire!', zh: '連擊高手！' };
    if (streak >= 3) return { en: 'Streak master!', zh: '連續答中！' };
    return messages[randInt(0, messages.length - 1)];
  }
  const wrong = [
    { en: 'Try again next!', zh: '下次加油！' },
    { en: 'Almost!', zh: '差少少！' },
    { en: 'Keep going!', zh: '繼續努力！' },
  ];
  return wrong[randInt(0, wrong.length - 1)];
}

export const AVATARS = [
  // Animals
  { id: 'cat', emoji: '🐱', category: 'animal' as const },
  { id: 'bear', emoji: '🐻', category: 'animal' as const },
  { id: 'panda', emoji: '🐼', category: 'animal' as const },
  { id: 'fox', emoji: '🦊', category: 'animal' as const },
  { id: 'frog', emoji: '🐸', category: 'animal' as const },
  { id: 'lion', emoji: '🦁', category: 'animal' as const },
  { id: 'rabbit', emoji: '🐰', category: 'animal' as const },
  { id: 'owl', emoji: '🦉', category: 'animal' as const },
  { id: 'penguin', emoji: '🐧', category: 'animal' as const },
  { id: 'koala', emoji: '🐨', category: 'animal' as const },
  { id: 'monkey', emoji: '🐵', category: 'animal' as const },
  { id: 'pig', emoji: '🐷', category: 'animal' as const },
  
  // Robots
  { id: 'robot', emoji: '🤖', category: 'robot' as const },
  { id: 'alien', emoji: '👾', category: 'robot' as const },
  
  // Space
  { id: 'rocket', emoji: '🚀', category: 'space' as const },
  { id: 'ufo', emoji: '🛸', category: 'space' as const },
  { id: 'star', emoji: '🌟', category: 'space' as const },
  
  // Characters
  { id: 'wizard', emoji: '🧙', category: 'character' as const },
  { id: 'fairy', emoji: '🧚', category: 'character' as const },
  { id: 'princess', emoji: '👸', category: 'character' as const },
  { id: 'mermaid', emoji: '🧜‍♀️', category: 'character' as const },
  
  // Funny Faces
  { id: 'clown', emoji: '🤡', category: 'funny' as const },
  { id: 'ghost', emoji: '👻', category: 'funny' as const },
  { id: 'masks', emoji: '🎭', category: 'funny' as const },
  { id: 'funny_face', emoji: '😛', category: 'funny' as const },
  
  // Fantasy
  { id: 'unicorn', emoji: '🦄', category: 'fantasy' as const },
  { id: 'dragon', emoji: '🐲', category: 'fantasy' as const },
  
  // Nature
  { id: 'flower', emoji: '🌸', category: 'nature' as const },
  { id: 'rainbow', emoji: '🌈', category: 'nature' as const },
  { id: 'lightning', emoji: '⚡', category: 'nature' as const },
  
  // More fun characters
  { id: 'cowboy', emoji: '🤠', category: 'character' as const },
  { id: 'ninja', emoji: '🥷', category: 'character' as const },
  { id: 'superhero', emoji: '🦸', category: 'character' as const },
  { id: 'vampire', emoji: '🧛', category: 'fantasy' as const },
];
