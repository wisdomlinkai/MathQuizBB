import { ArrowLeft, Lock } from 'lucide-react';
import { BADGES } from '@/game';
import { PoweredByFooter } from '@/components/PoweredByFooter';
import { AuthButton } from '@/components/AuthButton';
import type { PlayerStats, User } from '@/types';

interface BadgeScreenProps {
  stats: PlayerStats;
  isAuthenticated?: boolean;
  authUser?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onViewProfile?: () => void;
  onBack: () => void;
}

export function BadgeScreen({ 
  stats, 
  isAuthenticated = false,
  authUser = null,
  onLogin,
  onLogout,
  onViewProfile,
  onBack 
}: BadgeScreenProps) {
  const earnedSet = new Set(stats.badges);
  const earnedCount = stats.badges.length;

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
            <h2 className="font-display font-extrabold text-2xl text-sky-700">Badges</h2>
            <p className="font-body font-semibold text-sky-400 text-sm">
              徽章 · {earnedCount}/{BADGES.length} earned
            </p>
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

        {/* Badge grid */}
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge, idx) => {
            const earned = earnedSet.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-3 flex flex-col items-center gap-2 text-center shadow-md animate-slide-up ${
                  earned
                    ? 'bg-white border-2 border-sun-300'
                    : 'bg-white/50 border-2 border-gray-100'
                }`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                  earned ? 'bg-sun-100' : 'bg-gray-100 grayscale opacity-40'
                }`}>
                  {earned ? badge.emoji : <Lock className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  <p className={`font-display font-bold text-xs ${earned ? 'text-sky-700' : 'text-gray-400'}`}>
                    {badge.label}
                  </p>
                  <p className={`font-body font-semibold text-[10px] ${earned ? 'text-sky-400' : 'text-gray-300'}`}>
                    {badge.labelZh}
                  </p>
                </div>
                <p className={`font-body font-semibold text-[10px] leading-tight ${earned ? 'text-gray-500' : 'text-gray-300'}`}>
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <PoweredByFooter />
    </div>
  );
}
