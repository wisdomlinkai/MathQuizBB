import { useState, useCallback, useEffect } from 'react';
import { HomeScreen } from '@/screens/HomeScreen';
import { StageSelectScreen } from '@/screens/StageSelectScreen';
import { GameScreen } from '@/screens/GameScreen';
import { ResultsScreen } from '@/screens/ResultsScreen';
import { LeaderboardScreen } from '@/screens/LeaderboardScreen';
import { BadgeScreen } from '@/screens/BadgeScreen';
import {
  getPlayer,
  savePlayer,
  getProgress,
  updateStageProgress,
  getLeaderboard,
  addToLeaderboard,
  getStats,
  recordRoundResult,
  type RoundOutcome,
} from '@/storage';
import { STAGES, generateDailyRound } from '@/game';
import { getAuthUser, signIn, signOut as amplifySignOut } from '@/auth';
import * as api from '@/api';
import type { PlayerProfile, StageId, Difficulty, RoundResult, LeaderboardEntry, PlayerStats, User } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  guestId: string;
  isLoading: boolean;
}

type Screen = 'home' | 'stages' | 'game' | 'results' | 'leaderboard' | 'badges';

interface GameConfig {
  stageId: StageId;
  difficulty: Difficulty;
  isDaily: boolean;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [player, setPlayer] = useState<PlayerProfile>(getPlayer);
  const [progress, setProgress] = useState(getProgress);
  const [stats, setStats] = useState<PlayerStats>(getStats);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(getLeaderboard);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [roundOutcome, setRoundOutcome] = useState<RoundOutcome | null>(null);
  const [prevXp, setPrevXp] = useState(0);

  // Auth state with AWS Cognito
  const [auth, setAuth] = useState<AuthState>(() => {
    let guestId = localStorage.getItem('mathChampions_guestId');
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('mathChampions_guestId', guestId);
    }
    return {
      isAuthenticated: false,
      user: null,
      guestId,
      isLoading: true,
    };
  });

  // Check auth state on mount and handle OAuth callback
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getAuthUser();
        if (user) {
          setAuth((prev) => ({
            ...prev,
            isAuthenticated: true,
            user: {
              id: user.userId,
              email: user.email,
              name: user.name,
            },
            isLoading: false,
          }));
        } else {
          setAuth((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuth((prev) => ({ ...prev, isLoading: false }));
      }
    }

    checkAuth();
  }, []);

  // Sync local stats with backend when authenticated
  useEffect(() => {
    async function syncWithBackend() {
      if (!auth.isAuthenticated) return;

      try {
        // Fetch user progress from backend
        const progressResult = await api.getUserProgress();
        if (progressResult.success && progressResult.data) {
          // Merge backend progress with local progress
          // Local progress takes precedence for offline play
          // TODO: Implement sync logic
          void getProgress(); // Placeholder for sync logic
        }

        // Fetch leaderboard from backend
        const leaderboardResult = await api.getLeaderboard('all', 20);
        if (leaderboardResult.success && leaderboardResult.data) {
          // Merge with local leaderboard
          // TODO: Implement merge and dedupe logic
          void getLeaderboard(); // Placeholder for merge logic
        }
      } catch (error) {
        console.error('Backend sync failed:', error);
      }
    }

    syncWithBackend();
  }, [auth.isAuthenticated]);

  // Sync player name with auth user name when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.name && player.name !== auth.user.name) {
      setPlayer((prev) => ({ ...prev, name: auth.user.name }));
    }
  }, [auth.isAuthenticated, auth.user?.name, player.name]);

  // Login handler - uses Cognito hosted UI
  const handleLogin = useCallback(async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, []);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await amplifySignOut();
      setAuth({
        isAuthenticated: false,
        user: null,
        guestId: crypto.randomUUID(),
        isLoading: false,
      });
      localStorage.setItem('mathChampions_guestId', crypto.randomUUID());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  // View profile handler
  const handleViewProfile = useCallback(() => {
    // Navigate to EduQ AI profile page
    window.location.href = 'https://eduq-ai.com/profile';
  }, []);

  const handleSavePlayer = useCallback((p: PlayerProfile) => {
    setPlayer(p);
    savePlayer(p);
  }, []);

  const handleSelectStage = useCallback((stageId: StageId, difficulty: Difficulty) => {
    setGameConfig({ stageId, difficulty, isDaily: false });
    setScreen('game');
  }, []);

  const handleDaily = useCallback(() => {
    const daily = generateDailyRound();
    setGameConfig({ stageId: daily.stageId, difficulty: daily.difficulty, isDaily: true });
    setScreen('game');
  }, []);

  const handleGameComplete = useCallback(
    async (result: RoundResult) => {
      const prevProgress = getProgress();
      const prevHigh = prevProgress.stages[result.stageId].highScore;
      const isNew = result.score > prevHigh;

      const newProgress = updateStageProgress(result.stageId, result.stars, result.score, result.difficulty);
      setProgress(newProgress);

      const prevStats = getStats();
      setPrevXp(prevStats.xp);

      const outcome = recordRoundResult(result, newProgress);
      setStats(outcome.stats);
      setRoundOutcome(outcome);

      const entry: LeaderboardEntry = {
        name: player.name,
        avatar: player.avatar,
        score: result.score,
        stageId: result.stageId,
        difficulty: result.difficulty,
        stars: result.stars,
        date: result.date,
      };
      const newBoard = addToLeaderboard(entry);
      setLeaderboard(newBoard);

      // Sync with AWS backend if authenticated
      if (auth.isAuthenticated) {
        try {
          // Submit score to leaderboard
          await api.submitScore(
            result.stageId,
            result.score,
            result.timeInSeconds || 0,
            result.difficulty,
            result.stars,
            result.correct,
            result.total
          );

          // Update progress on backend
          await api.updateUserProgress(
            result.stageId,
            result.stars >= 1,
            result.score
          );

          // Check for achievements
          outcome.newBadges.forEach(async (badge) => {
            await api.unlockAchievement(badge);
          });
        } catch (error) {
          console.error('Failed to sync with backend:', error);
        }
      }

      setLastResult(result);
      setIsNewHighScore(isNew);
      setScreen('results');
    },
    [player.name, player.avatar, auth.isAuthenticated],
  );

  const handleRetry = useCallback(() => {
    if (gameConfig) {
      setGameConfig({ ...gameConfig });
      setScreen('game');
    }
  }, [gameConfig]);

  const handleNext = useCallback(() => {
    if (!gameConfig) return;
    const stageIdx = STAGES.findIndex((s) => s.id === gameConfig.stageId);
    if (stageIdx < STAGES.length - 1) {
      const nextStage = STAGES[stageIdx + 1];
      setGameConfig({ stageId: nextStage.id, difficulty: gameConfig.difficulty, isDaily: false });
      setScreen('game');
    } else {
      setScreen('stages');
    }
  }, [gameConfig]);

  const hasNextStage = useCallback((): boolean => {
    if (!gameConfig) return false;
    const idx = STAGES.findIndex((s) => s.id === gameConfig.stageId);
    return idx < STAGES.length - 1;
  }, [gameConfig]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-sky-200 via-sky-100 to-sun-50">
      {screen === 'home' && (
        <HomeScreen
          player={player}
          stats={stats}
          isAuthenticated={auth.isAuthenticated}
          authUser={auth.user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onViewProfile={handleViewProfile}
          onSavePlayer={handleSavePlayer}
          onPlay={() => setScreen('stages')}
          onDaily={handleDaily}
          onLeaderboard={() => setScreen('leaderboard')}
          onBadges={() => setScreen('badges')}
        />
      )}

      {screen === 'stages' && (
        <StageSelectScreen
          player={player}
          stats={stats}
          progress={progress}
          isAuthenticated={auth.isAuthenticated}
          authUser={auth.user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onViewProfile={handleViewProfile}
          onBack={() => setScreen('home')}
          onSelect={handleSelectStage}
        />
      )}

      {screen === 'game' && gameConfig && (
        <GameScreen
          stageId={gameConfig.stageId}
          difficulty={gameConfig.difficulty}
          playerName={player.name}
          playerAvatar={player.avatar}
          isDaily={gameConfig.isDaily}
          onQuit={() => setScreen('stages')}
          onComplete={handleGameComplete}
        />
      )}

      {screen === 'results' && lastResult && roundOutcome && (
        <ResultsScreen
          result={lastResult}
          playerName={player.name}
          playerAvatar={player.avatar}
          isNewHighScore={isNewHighScore}
          hasNextStage={hasNextStage()}
          newBadges={roundOutcome.newBadges}
          leveledUp={roundOutcome.leveledUp}
          prevXp={prevXp}
          newXp={roundOutcome.stats.xp}
          onRetry={handleRetry}
          onNext={handleNext}
          onHome={() => setScreen('home')}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          entries={leaderboard}
          currentPlayerName={player.name}
          isAuthenticated={auth.isAuthenticated}
          authUser={auth.user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onViewProfile={handleViewProfile}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'badges' && (
        <BadgeScreen
          stats={stats}
          isAuthenticated={auth.isAuthenticated}
          authUser={auth.user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onViewProfile={handleViewProfile}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  );
}
