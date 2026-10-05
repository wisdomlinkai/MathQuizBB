import { RotateCcw, ChevronRight, Home, Trophy, Zap, Award, TrendingUp } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import { AvatarDisplay } from '@/components/Avatar';
import { LevelBadge } from '@/components/LevelBadge';
import { PoweredByFooter } from '@/components/PoweredByFooter';
import { STAGES, DIFFICULTIES, BADGES, levelFromXp, getLevelTitle } from '@/game';
import type { RoundResult } from '@/types';

interface ResultsScreenProps {
  result: RoundResult;
  playerName: string;
  playerAvatar: string;
  isNewHighScore: boolean;
  hasNextStage: boolean;
  newBadges: string[];
  leveledUp: boolean;
  prevXp: number;
  newXp: number;
  onRetry: () => void;
  onNext: () => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

export function ResultsScreen({
  result,
  playerName,
  playerAvatar,
  isNewHighScore,
  hasNextStage,
  newBadges,
  leveledUp,
  prevXp,
  newXp,
  onRetry,
  onNext,
  onHome,
  onLeaderboard,
}: ResultsScreenProps) {
  const stage = STAGES.find((s) => s.id === result.stageId)!;
  const diff = DIFFICULTIES.find((d) => d.id === result.difficulty)!;
  const accuracy = Math.round((result.correct / result.total) * 100);

  const titleMap: Record<number, { en: string; zh: string }> = {
    3: { en: 'Perfect!', zh: '太厲害了！' },
    2: { en: 'Great Work!', zh: '做得好好！' },
    1: { en: 'Good Try!', zh: '不錯呀！' },
    0: { en: 'Keep Practicing!', zh: '繼續努力！' },
  };
  const title = titleMap[result.stars] ?? titleMap[0];

  const { level: newLevel } = levelFromXp(newXp);
  const levelTitle = getLevelTitle(newLevel);

  const earnedBadgeDefs = newBadges
    .map((id) => BADGES.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-6 safe-top safe-bottom">
      <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in">
        {/* Level Up banner */}
        {leveledUp && (
          <div className="w-full bg-gradient-to-r from-grape-400 to-grape-600 rounded-2xl py-3 px-4 text-center shadow-lg animate-bounce-in">
            <p className="font-display font-extrabold text-white text-xl">
              LEVEL UP! 升級了！
            </p>
            <p className="font-display font-bold text-white/90 text-base">
              Level {newLevel} · {levelTitle.en} {levelTitle.zh}
            </p>
          </div>
        )}

        {/* Title */}
        <div className="text-center">
          <h2 className="font-display font-extrabold text-3xl text-sky-700">{title.en}</h2>
          <p className="font-display font-semibold text-2xl text-sun-500">{title.zh}</p>
        </div>

        {/* Stars */}
        <div className="flex gap-4 py-1">
          <StarRating stars={result.stars} size={56} animate />
        </div>

        {/* Score card */}
        <div className="w-full bg-white rounded-3xl shadow-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-center gap-3 pb-3 border-b border-sky-50">
            <AvatarDisplay avatar={playerAvatar} size="md" />
            <div className="text-left">
              <p className="font-display font-bold text-lg text-sky-700">{playerName}</p>
              <p className="font-body font-semibold text-xs text-sky-400">
                {stage.label} · {diff.label}
                {result.isDaily && ' · Daily'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Score" labelZh="分數" value={result.score} color="sky" />
            <StatBox label="Correct" labelZh="答對" value={`${result.correct}/${result.total}`} color="mint" />
            <StatBox label="Accuracy" labelZh="正確率" value={`${accuracy}%`} color="sun" />
            <StatBox label="Best Streak" labelZh="最高連擊" value={result.maxStreak} color="coral" />
          </div>

          {/* XP earned */}
          <div className="flex items-center justify-center gap-2 bg-grape-50 rounded-2xl py-2.5">
            <Zap className="w-5 h-5 text-grape-500" />
            <span className="font-display font-bold text-grape-600 text-lg">
              +{result.xpEarned} XP
            </span>
            <TrendingUp className="w-4 h-4 text-grape-400" />
          </div>

          {/* Level progress */}
          <div className="flex items-center justify-between px-1">
            <LevelBadge xp={prevXp} size="sm" />
            <div className="flex-1 mx-3">
              <div className="w-full h-2.5 rounded-full bg-sky-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-grape-400 to-grape-500 transition-all duration-1000"
                  style={{ width: `${Math.min(100, (levelFromXp(newXp).currentLevelXp / levelFromXp(newXp).nextLevelXp) * 100)}%` }}
                />
              </div>
            </div>
            <LevelBadge xp={newXp} size="sm" />
          </div>

          {isNewHighScore && (
            <div className="bg-sun-100 rounded-2xl py-2.5 text-center animate-wiggle">
              <span className="font-display font-bold text-sun-600">
                New High Score! 新紀錄！
              </span>
            </div>
          )}
        </div>

        {/* New Badges */}
        {earnedBadgeDefs.length > 0 && (
          <div className="w-full bg-white rounded-3xl shadow-xl p-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-grape-500" />
              <span className="font-display font-bold text-grape-600 text-base">
                New Badges! 新徽章！
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {earnedBadgeDefs.map((badge) => (
                <div
                  key={badge!.id}
                  className="flex flex-col items-center gap-1 w-20 animate-star-pop"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sun-100 flex items-center justify-center text-2xl">
                    {badge!.emoji}
                  </div>
                  <p className="font-display font-bold text-sky-700 text-xs text-center">{badge!.label}</p>
                  <p className="font-body font-semibold text-sky-400 text-[10px] text-center">{badge!.labelZh}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="w-full flex flex-col gap-3">
          {hasNextStage && result.stars >= 1 && (
            <button
              onClick={onNext}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-mint-400 to-mint-500 text-white font-display font-bold text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Next Stage 下一關
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="flex-1 h-14 rounded-2xl bg-white text-sky-600 font-display font-bold text-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-sky-200"
            >
              <RotateCcw className="w-5 h-5" />
              Retry
            </button>
            <button
              onClick={onLeaderboard}
              className="flex-1 h-14 rounded-2xl bg-white text-sun-600 font-display font-bold text-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-sun-200"
            >
              <Trophy className="w-5 h-5" />
              Rankings
            </button>
          </div>

          <button
            onClick={onHome}
            className="w-full h-12 rounded-2xl bg-sky-50 text-sky-500 font-display font-semibold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Home 首頁
          </button>
        </div>

        <PoweredByFooter />
      </div>
    </div>
  );
}

function StatBox({ label, labelZh, value, color }: { label: string; labelZh: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    sky: 'bg-sky-50 text-sky-700',
    mint: 'bg-mint-50 text-mint-600',
    sun: 'bg-sun-50 text-sun-600',
    coral: 'bg-coral-50 text-coral-600',
  };
  return (
    <div className={`rounded-2xl py-3 px-4 text-center ${colorMap[color]}`}>
      <p className="font-display font-extrabold text-2xl">{value}</p>
      <p className="font-body font-semibold text-xs mt-0.5">{label}</p>
      <p className="font-body font-semibold text-[10px] opacity-70">{labelZh}</p>
    </div>
  );
}
