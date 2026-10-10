import { useState } from 'react';
import { Play, Trophy, Award, Cat } from 'lucide-react';
import { AvatarPicker, AvatarDisplay } from '@/components/Avatar';
import { LevelBadge } from '@/components/LevelBadge';
import { DailyChallengeCard } from '@/components/DailyChallengeCard';
import { PoweredByFooter } from '@/components/PoweredByFooter';
import { AuthButton } from '@/components/AuthButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/i18n';
import { isDailyAvailable } from '@/game';
import type { PlayerProfile, PlayerStats, User } from '@/types';

interface HomeScreenProps {
  player: PlayerProfile;
  stats: PlayerStats;
  isAuthenticated?: boolean;
  authUser?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onViewProfile?: () => void;
  onSavePlayer: (player: PlayerProfile) => void;
  onPlay: () => void;
  onDaily: () => void;
  onLeaderboard: () => void;
  onBadges: () => void;
}

export function HomeScreen({
  player,
  stats,
  isAuthenticated = false,
  authUser = null,
  onLogin,
  onLogout,
  onViewProfile,
  onSavePlayer,
  onPlay,
  onDaily,
  onLeaderboard,
  onBadges,
}: HomeScreenProps) {
  const { t, showBoth } = useTranslation();
  const [name, setName] = useState(player.name);
  const [avatar, setAvatar] = useState(player.avatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handlePlay = () => {
    const trimmed = name.trim() || 'Player';
    const updated = { name: trimmed, avatar };
    onSavePlayer(updated);
    onPlay();
  };

  const dailyAvailable = isDailyAvailable(stats);
  const earnedBadges = stats.badges.length;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-6 safe-top safe-bottom">
      <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in">
        {/* Header with Logo and Auth Button */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a 
              href="https://www.eduq-ai.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg animate-float overflow-hidden p-1.5 hover:shadow-xl transition-shadow cursor-pointer"
              title="Visit EduQ AI"
            >
              <img src="/app-logo.png" alt="EduQ AI" className="w-[80%] h-[80%] object-contain" />
            </a>
            <div className="text-left">
              <h1 className="font-display font-extrabold text-3xl text-sky-700 leading-tight">
                {t('game.title')}
              </h1>
              {showBoth && (
                <p className="font-display font-semibold text-sun-500 text-lg">{t('game.titleZh')}</p>
              )}
            </div>
          </div>
          {/* Language Switcher + Auth Button */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {onLogin && onLogout && (
              <AuthButton
                isAuthenticated={isAuthenticated}
                user={authUser}
                onLogin={onLogin}
                onLogout={onLogout}
                onViewProfile={onViewProfile}
              />
            )}
          </div>
        </div>

        {/* Level badge + Avatar */}
        <div className="flex items-center gap-4 bg-white/70 rounded-3xl px-4 py-3 shadow-md w-full justify-between">
          <LevelBadge xp={stats.xp} size="lg" />
          <button
            onClick={() => setShowAvatarPicker((s) => !s)}
            className="flex flex-col items-center gap-1 group"
          >
            <AvatarDisplay avatar={avatar} size="md" />
            <span className="font-body font-semibold text-sky-600 text-[10px] group-hover:text-sky-700">
              {showAvatarPicker ? 'Close' : 'Change'}
            </span>
          </button>
        </div>

        {showAvatarPicker && (
          <div className="w-full bg-white/80 rounded-3xl p-4 animate-slide-up shadow-md">
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </div>
        )}

        {/* Name input */}
        <div className="w-full">
          <label className="font-body font-semibold text-sky-700 text-sm mb-1.5 block">
            {t('game.yourName')} {showBoth && t('game.yourNameZh')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            placeholder={t('game.typeName')}
            className="w-full h-14 rounded-2xl bg-white border-2 border-sky-200 px-5 font-display font-semibold text-lg text-sky-800 placeholder:text-sky-300 focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>

        {/* Daily Challenge */}
        <DailyChallengeCard
          available={dailyAvailable}
          dailyStreak={stats.dailyStreak}
          onPlay={onDaily}
        />

        {/* Play button */}
        <button
          onClick={handlePlay}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-mint-400 to-mint-500 text-white font-display font-bold text-2xl shadow-lg active:scale-95 transition-all duration-150 flex items-center justify-center gap-3 hover:shadow-xl"
        >
          <Play className="w-7 h-7 fill-white" />
          {t('common.play')} {showBoth && t('common.playZh')}
        </button>

        {/* Leaderboard + Badges buttons */}
        <div className="w-full flex gap-3">
          <button
            onClick={onLeaderboard}
            className="flex-1 h-14 rounded-2xl bg-white text-sun-600 font-display font-bold text-lg shadow-md active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 border-2 border-sun-200 hover:bg-sun-50"
          >
            <Trophy className="w-5 h-5" />
            {t('common.rankings')}
          </button>
          <button
            onClick={onBadges}
            className="flex-1 h-14 rounded-2xl bg-white text-grape-600 font-display font-bold text-lg shadow-md active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 border-2 border-grape-200 hover:bg-grape-50"
          >
            <Award className="w-5 h-5" />
            {t('common.badges')}
            {earnedBadges > 0 && (
              <span className="bg-grape-400 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {earnedBadges}
              </span>
            )}
          </button>
        </div>

        <div className="text-center text-sky-500/60 text-sm font-body">
          <Cat className="w-4 h-4 inline mr-1" />
          {t('game.subtitle')}
        </div>

        <PoweredByFooter />
      </div>
    </div>
  );
}
