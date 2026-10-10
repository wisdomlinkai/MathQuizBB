import { levelFromXp, getLevelTitle } from '@/game';
import { useTranslation } from '@/i18n';

interface LevelBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ xp, size = 'md' }: LevelBadgeProps) {
  const { t } = useTranslation();
  const { level, currentLevelXp, nextLevelXp, progress } = levelFromXp(xp);
  
  // Map level to translation key
  const getLevelKey = (lvl: number): string => {
    if (lvl >= 20) return 'levels.legend';
    if (lvl >= 15) return 'levels.master';
    if (lvl >= 10) return 'levels.expert';
    if (lvl >= 7) return 'levels.star';
    if (lvl >= 4) return 'levels.whiz';
    if (lvl >= 2) return 'levels.learner';
    return 'levels.beginner';
  };
  const levelKey = getLevelKey(level);

  const sizeMap = {
    sm: { badge: 'w-8 h-8 text-sm', text: 'text-xs', bar: 'h-1.5' },
    md: { badge: 'w-10 h-10 text-base', text: 'text-sm', bar: 'h-2' },
    lg: { badge: 'w-12 h-12 text-lg', text: 'text-base', bar: 'h-2.5' },
  };
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.badge} rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center font-display font-extrabold text-white shadow-md shrink-0`}>
        {level}
      </div>
      {size !== 'sm' && (
        <div className="flex flex-col gap-1 min-w-[80px]">
          <div className="flex items-baseline justify-between gap-2">
            <span className={`font-display font-bold text-sky-700 ${s.text}`}>Lv {level}</span>
            <span className="font-body font-semibold text-sky-400 text-[10px]">
              {t(levelKey)}
            </span>
          </div>
          <div className={`w-full ${s.bar} rounded-full bg-sky-100 overflow-hidden`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          {size === 'lg' && (
            <span className="font-body font-semibold text-sky-400 text-[10px]">
              {currentLevelXp} / {nextLevelXp} XP
            </span>
          )}
        </div>
      )}
    </div>
  );
}
