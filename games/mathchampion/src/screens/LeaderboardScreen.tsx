import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { AvatarDisplay } from '@/components/Avatar';
import { PoweredByFooter } from '@/components/PoweredByFooter';
import { AuthButton } from '@/components/AuthButton';
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
            <h2 className="font-display font-extrabold text-2xl text-sky-700">Leaderboard</h2>
            <p className="font-body font-semibold text-sky-400 text-sm">排行榜</p>
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

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-24 h-24 rounded-full bg-white/60 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-sun-300" />
            </div>
            <p className="font-display font-semibold text-sky-500 text-lg text-center">
              No scores yet!
            </p>
            <p className="font-body font-semibold text-sky-400 text-sm text-center">
              Play a round to get on the board
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {entries.map((entry, idx) => {
              const isCurrent = entry.name === currentPlayerName;
              const stage = STAGES.find((s) => s.id === entry.stageId);
              const diff = DIFFICULTIES.find((d) => d.id === entry.difficulty);

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md animate-slide-up ${
                    idx === 0
                      ? 'bg-gradient-to-r from-sun-100 to-sun-50 border-2 border-sun-300'
                      : idx === 1
                        ? 'bg-gradient-to-r from-gray-100 to-white border-2 border-gray-200'
                        : idx === 2
                          ? 'bg-gradient-to-r from-coral-50 to-coral-100 border-2 border-coral-200'
                          : 'bg-white'
                  } ${isCurrent ? 'ring-2 ring-sky-400' : ''}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display font-extrabold text-lg">
                    {idx < 3 ? (
                      <Medal
                        className={`w-7 h-7 ${
                          idx === 0 ? 'text-sun-500' : idx === 1 ? 'text-gray-400' : 'text-coral-400'
                        }`}
                      />
                    ) : (
                      <span className="text-sky-500">{idx + 1}</span>
                    )}
                  </div>

                  {/* Avatar + name */}
                  <AvatarDisplay avatar={entry.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sky-800 text-sm truncate">
                      {entry.name}
                      {isCurrent && <span className="text-sky-500 text-xs"> (You)</span>}
                    </p>
                    <p className="font-body font-semibold text-sky-400 text-[10px]">
                      {stage?.emoji} {stage?.label} · {diff?.label} · {entry.stars}★
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
