import { useState, useCallback } from 'react';
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
import type { PlayerProfile, StageId, Difficulty, RoundResult, LeaderboardEntry, PlayerStats } from '@/types';

// Auth types (will be replaced with Cognito integration later)
interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  guestId: string;
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

  // Auth state (placeholder - will be connected to Cognito)
  const [auth, setAuth] = useState<AuthState>(() => {
    // Check for stored guest ID
    let guestId = localStorage.getItem('mathChampions_guestId');
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('mathChampions_guestId', guestId);
    }
    return {
      isAuthenticated: false,
      user: null,
      guestId,
    };
  });

  // Login handler - redirects to EduQ AI login (placeholder)
  const handleLogin = useCallback(() => {
    // TODO: Replace with actual Cognito redirect
    // For now, redirect to EduQ AI login page
    const redirectUrl = encodeURIComponent(window.location.origin);
    window.location.href = `https://eduq-ai.com/login?redirect=${redirectUrl}`;
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    setAuth({
      isAuthenticated: false,
      user: null,
      guestId: crypto.randomUUID(),
    });
    // Generate new guest ID
    localStorage.setItem('mathChampions_guestId', crypto.randomUUID());
  }, []);

  // View profile handler
  const handleViewProfile = useCallback(() => {
    // TODO: Navigate to EduQ AI profile page
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
    (result: RoundResult) => {
      const prevProgress = getProgress();
      const prevHigh = prevProgress.stages[result.stageId].highScore;
      const isNew = result.score > prevHigh;

      const newProgress = updateStageProgress(result.stageId, result.stars, result.score);
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

      setLastResult(result);
      setIsNewHighScore(isNew);
      setScreen('results');
    },
    [player.name, player.avatar],
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
