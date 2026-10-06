import { Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import { STAGES, DIFFICULTIES } from '@/game';
import { StarRating } from '@/components/StarRating';
import { AvatarDisplay } from '@/components/Avatar';
import { LevelBadge } from '@/components/LevelBadge';
import { PoweredByFooter } from '@/components/PoweredByFooter';
import { AuthButton } from '@/components/AuthButton';
import type { GameProgress, PlayerProfile, StageId, Difficulty, PlayerStats, User, StageProgress } from '@/types';

interface StageSelectScreenProps {
  player: PlayerProfile;
  stats: PlayerStats;
  progress: GameProgress;
  isAuthenticated?: boolean;
  authUser?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onViewProfile?: () => void;
  onBack: () => void;
  onSelect: (stageId: StageId, difficulty: Difficulty) => void;
}

// Helper to check if a difficulty is unlocked
function isDifficultyUnlocked(stageProgress: StageProgress, difficulty: Difficulty): boolean {
  if (difficulty === 'easy') return stageProgress.easyUnlocked;
  if (difficulty === 'medium') return stageProgress.mediumUnlocked;
  if (difficulty === 'hard') return stageProgress.hardUnlocked;
  return false;
}

// Helper to get best stars for a difficulty
function getBestStarsForDifficulty(stageProgress: StageProgress, difficulty: Difficulty): number {
  if (difficulty === 'easy') return stageProgress.easyBestStars;
  if (difficulty === 'medium') return stageProgress.mediumBestStars;
  if (difficulty === 'hard') return stageProgress.hardBestStars;
  return 0;
}

export function StageSelectScreen({ 
  player, 
  stats, 
  progress, 
  isAuthenticated = false,
  authUser = null,
  onLogin,
  onLogout,
  onViewProfile,
  onBack, 
  onSelect 
}: StageSelectScreenProps) {
  return (
    <div className="min-h-[100dvh] px-4 py-5 safe-top safe-bottom">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center active:scale-90 transition-transform shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-sky-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-display font-extrabold text-2xl text-sky-700">Choose Stage</h2>
            <p className="font-body font-semibold text-sky-400 text-sm">選擇關卡</p>
          </div>
          {/* Auth Button or Avatar */}
          {onLogin && onLogout ? (
            <AuthButton
              isAuthenticated={isAuthenticated}
              user={authUser}
              onLogin={onLogin}
              onLogout={onLogout}
              onViewProfile={onViewProfile}
            />
          ) : (
            <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-md">
              <AvatarDisplay avatar={player.avatar} size="sm" />
              <span className="font-display font-bold text-sky-700 text-sm max-w-[60px] truncate">
                {player.name}
              </span>
            </div>
          )}
        </div>

        {/* Level bar */}
        <div className="bg-white/70 rounded-2xl px-4 py-2.5 mb-4 flex items-center justify-between">
          <LevelBadge xp={stats.xp} size="md" />
          <span className="font-body font-semibold text-sun-500 text-sm">
            {stats.badges.length} badges
          </span>
        </div>

        {/* Instructions */}
        <div className="bg-mint-50 border-2 border-mint-200 rounded-2xl px-4 py-3 mb-4">
          <p className="text-center font-body font-semibold text-mint-700 text-sm">
            🎮 Complete Easy to unlock Medium, then Hard!
          </p>
          <p className="text-center font-body text-mint-600 text-xs mt-1">
            完成簡單解鎖中等，再解鎖困難！
          </p>
        </div>

        {/* Stages */}
        <div className="flex flex-col gap-4">
          {STAGES.map((stage) => {
            const stageProg = progress.stages[stage.id];

            return (
              <div
                key={stage.id}
                className="rounded-3xl overflow-hidden shadow-lg transition-all"
              >
                {/* Stage header */}
                <div className={`bg-gradient-to-r ${stage.gradient} px-5 py-3.5 flex items-center gap-3`}>
                  <div className="w-11 h-11 rounded-2xl bg-white/30 flex items-center justify-center text-xl shrink-0">
                    {stage.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-extrabold text-lg text-white leading-tight">
                      {stage.label}
                    </h3>
                    <p className="font-body font-semibold text-white/80 text-xs">
                      {stage.labelZh}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <StarRating stars={stageProg.bestStars} size={14} />
                    <span className="text-white/80 text-[10px] font-body font-semibold">
                      Best: {stageProg.highScore}
                    </span>
                  </div>
                </div>

                {/* Difficulty buttons */}
                <div className="bg-white p-2.5 flex gap-2">
                  {DIFFICULTIES.map((diff) => {
                    const isUnlocked = isDifficultyUnlocked(stageProg, diff.id);
                    const bestStars = getBestStarsForDifficulty(stageProg, diff.id);
                    const isLocked = !isUnlocked;

                    return (
                      <button
                        key={diff.id}
                        disabled={isLocked}
                        onClick={() => onSelect(stage.id, diff.id)}
                        className={`flex-1 rounded-xl py-2.5 px-2 flex flex-col items-center gap-0.5 transition-all duration-150 relative ${
                          isLocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : diff.id === 'hard'
                              ? 'bg-coral-50 hover:bg-coral-100 active:scale-95 border-2 border-coral-200'
                              : diff.id === 'medium'
                                ? 'bg-sun-50 hover:bg-sun-100 active:scale-95 border-2 border-sun-200'
                                : 'bg-mint-50 hover:bg-mint-100 active:scale-95 border-2 border-mint-200'
                        }`}
                      >
                        {isLocked && (
                          <div className="absolute top-1 right-1">
                            <Lock className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <span className={`font-display font-bold text-sm ${
                          isLocked 
                            ? 'text-gray-400' 
                            : diff.id === 'hard' 
                              ? 'text-coral-600' 
                              : diff.id === 'medium'
                                ? 'text-sun-600'
                                : 'text-mint-600'
                        }`}>
                          {diff.label}
                        </span>
                        <span className={`font-body font-semibold text-[10px] ${
                          isLocked 
                            ? 'text-gray-300' 
                            : diff.id === 'hard' 
                              ? 'text-coral-400' 
                              : diff.id === 'medium'
                                ? 'text-sun-400'
                                : 'text-mint-400'
                        }`}>
                          {diff.labelZh}
                        </span>
                        {!isLocked && (
                          <>
                            <span className={`font-body font-semibold text-[10px] ${
                              diff.id === 'hard' 
                                ? 'text-coral-500' 
                                : diff.id === 'medium'
                                  ? 'text-sun-500'
                                  : 'text-mint-500'
                            }`}>
                              {diff.timeLimit}s · {diff.maxDigits}d
                            </span>
                            {bestStars > 0 && (
                              <div className="mt-0.5">
                                <StarRating stars={bestStars} size={10} />
                              </div>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 mt-0.5 ${
                              diff.id === 'hard' 
                                ? 'text-coral-400' 
                                : diff.id === 'medium'
                                  ? 'text-sun-400'
                                  : 'text-mint-400'
                            }`} />
                          </>
                        )}
                        {isLocked && (
                          <span className="font-body text-[9px] text-gray-400 mt-0.5">
                            🔒 Locked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Unlock hint */}
                {!stageProg.mediumUnlocked && (
                  <div className="bg-gray-50 px-5 py-2 text-center">
                    <span className="text-xs font-body font-semibold text-gray-400">
                      Get 1+ star on Easy to unlock Medium
                    </span>
                  </div>
                )}
                {stageProg.mediumUnlocked && !stageProg.hardUnlocked && (
                  <div className="bg-gray-50 px-5 py-2 text-center">
                    <span className="text-xs font-body font-semibold text-gray-400">
                      Get 1+ star on Medium to unlock Hard
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <PoweredByFooter />
    </div>
  );
}
