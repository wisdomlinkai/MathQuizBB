import { Calendar, Check, Flame } from 'lucide-react';
import { generateDailyRound, STAGES, DIFFICULTIES } from '@/game';
import { useTranslation } from '@/i18n';

interface DailyChallengeCardProps {
  available: boolean;
  dailyStreak: number;
  onPlay: () => void;
}

export function DailyChallengeCard({ available, dailyStreak, onPlay }: DailyChallengeCardProps) {
  const { t, showBoth } = useTranslation();
  const daily = generateDailyRound();
  const stage = STAGES.find((s) => s.id === daily.stageId)!;
  const diff = DIFFICULTIES.find((d) => d.id === daily.difficulty)!;

  if (!available) {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-r from-gray-200 to-gray-300 p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center shrink-0">
            <Check className="w-6 h-6 text-mint-600" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-gray-600 text-base">
              {t('daily.done')} {showBoth && t('daily.doneZh')}
            </p>
            <p className="font-body font-semibold text-gray-500 text-sm">
              {t('daily.comeBack')} {showBoth && t('daily.comeBackZh')}
            </p>
          </div>
          {dailyStreak > 0 && (
            <div className="flex items-center gap-1 bg-white/50 rounded-xl px-2 py-1">
              <Flame className="w-4 h-4 text-sun-500" />
              <span className="font-display font-bold text-sun-600 text-sm">{dailyStreak}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onPlay}
      className="w-full rounded-3xl bg-gradient-to-r from-grape-300 to-grape-500 p-4 shadow-lg active:scale-95 transition-all duration-150 text-left animate-pulse-ring"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-white text-base">
            {t('daily.challenge')} {showBoth && t('daily.challengeZh')}
          </p>
          <p className="font-body font-semibold text-white/80 text-sm">
            {stage.emoji} {t(`stages.${stage.id}`)} {showBoth && t(`stages.${stage.id}Zh`)} · {t(`difficulty.${diff.id}`)} {showBoth && t(`difficulty.${diff.id}Zh`)}
          </p>
        </div>
        {dailyStreak > 0 && (
          <div className="flex items-center gap-1 bg-white/25 rounded-xl px-2 py-1">
            <Flame className="w-4 h-4 text-white" />
            <span className="font-display font-bold text-white text-sm">{dailyStreak}</span>
          </div>
        )}
      </div>
    </button>
  );
}
