import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { AvatarDisplay } from '@/components/Avatar';
import { PoweredByFooter } from '@/components/PoweredByFooter';
import { AuthButton } from '@/components/AuthButton';
import { useTranslation } from '@/i18n';
import { STAGES, DIFFICULTIES } from '@/game';
import type { LeaderboardEntry, User } from '@/types';

interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  currentPlayerName: string;
  isAuthenticated?: boolean;
  authUser?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onViewProfile?: () => void;
  onBack: () => void;
}

export function LeaderboardScreen({ 
  entries, 
  currentPlayerName, 
  isAuthenticated = false,
  authUser = null,
  onLogin,
  onLogout,
  onViewProfile,
  onBack 
}: LeaderboardScreenProps) {
  const { t } = useTranslation();
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
            <h2 className="font-display font-extrabold text-2xl text-sky-700">{t('leaderboard.title')}</h2>
          </div>
          {/* Auth Button */}
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

        {/* Guest blur overlay */}
        {!isAuthenticated && entries.length > 0 && (
          <div className="relative mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="font-display font-bold text-lg text-sky-700 mb-2">
                {t('leaderboard.signUpPrompt')}
              </h3>
              <p className="font-body font-semibold text-sky-500 text-sm mb-4">
                {t('leaderboard.competeText')}
              </p>
              <button
                onClick={onLogin}
                className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-display font-bold py-3 px-6 rounded-xl shadow-md active:scale-95 transition-transform"
              >
                {t('auth.signIn')}
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-24 h-24 rounded-full bg-white/60 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-sun-300" />
            </div>
            <p className="font-display font-semibold text-sky-500 text-lg text-center">
              {t('leaderboard.noScores')}
            </p>
            <p className="font-body font-semibold text-sky-400 text-sm text-center">
              {t('leaderboard.playToGetOnBoard')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {/* Blur top 3 for guests */}
            {!isAuthenticated && (
              <div className="relative">
                <div className="absolute inset-0 backdrop-blur-md bg-white/30 rounded-2xl z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-sky-400 mx-auto mb-2 opacity-50" />
                    <p className="font-display font-semibold text-sky-600 text-sm">
                      🔒 {t('leaderboard.signUpToView')}
                    </p>
                  </div>
                </div>
                {/* Show blurred placeholder entries */}
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md mb-2.5 bg-white/50"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display font-extrabold text-lg">
                      <Medal
                        className={`w-7 h-7 ${
                          idx === 0 ? 'text-sun-500' : idx === 1 ? 'text-gray-400' : 'text-coral-400'
                        }`}
                      />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-sky-200" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-sky-200 rounded w-24 mb-1" />
                      <div className="h-3 bg-sky-100 rounded w-32" />
                    </div>
                    <div className="h-6 bg-sky-200 rounded w-12" />
                  </div>
                ))}
              </div>
            )}

            {/* Show all entries for authenticated users, or entries 4+ for guests */}
            {(isAuthenticated ? entries : entries.slice(3)).map((entry, idx) => {
              const actualIdx = isAuthenticated ? idx : idx + 3;
              const isCurrent = entry.name === currentPlayerName;
              const stage = STAGES.find((s) => s.id === entry.stageId);
              const diff = DIFFICULTIES.find((d) => d.id === entry.difficulty);

              return (
                <div
                  key={actualIdx}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md animate-slide-up ${
                    actualIdx === 0
                      ? 'bg-gradient-to-r from-sun-100 to-sun-50 border-2 border-sun-300'
                      : actualIdx === 1
                        ? 'bg-gradient-to-r from-gray-100 to-white border-2 border-gray-200'
                        : actualIdx === 2
                          ? 'bg-gradient-to-r from-coral-50 to-coral-100 border-2 border-coral-200'
                          : 'bg-white'
                  } ${isCurrent ? 'ring-2 ring-sky-400' : ''}`}
                  style={{ animationDelay: `${actualIdx * 60}ms` }}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display font-extrabold text-lg">
                    {actualIdx < 3 ? (
                      <Medal
                        className={`w-7 h-7 ${
                          actualIdx === 0 ? 'text-sun-500' : actualIdx === 1 ? 'text-gray-400' : 'text-coral-400'
                        }`}
                      />
                    ) : (
                      <span className="text-sky-500">{actualIdx + 1}</span>
                    )}
                  </div>

                  {/* Avatar + name */}
                  <AvatarDisplay avatar={entry.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sky-800 text-sm truncate">
                      {entry.name}
                      {isCurrent && <span className="text-sky-500 text-xs"> ({t('leaderboard.you')})</span>}
                    </p>
                    <p className="font-body font-semibold text-sky-400 text-[10px]">
                      {stage?.emoji} {t(`stages.${stage?.id}`)} · {t(`difficulty.${diff?.id}`)} · {entry.stars}★
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="font-display font-extrabold text-lg text-sky-700">
                      {entry.score}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PoweredByFooter />
    </div>
  );
}
