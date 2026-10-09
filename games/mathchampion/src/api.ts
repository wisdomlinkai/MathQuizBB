// MathChampion API - Uses EduQ AI shared AppSync GraphQL API
import { getAccessToken, getAuthUser } from './auth';
import { awsConfig } from './aws-config';

const APPSYNC_ENDPOINT = awsConfig.appSync.endpoint;
const APPSYNC_API_KEY = awsConfig.appSync.apiKey;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get current user ID from auth session
async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await getAuthUser();
    return user?.userId || null;
  } catch {
    return null;
  }
}

// GraphQL request helper
async function graphql<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getAccessToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      // Use API key for public access, or JWT token if authenticated
      ...(token 
        ? { Authorization: token } 
        : { 'x-api-key': APPSYNC_API_KEY }
      ),
    };

    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.errors) {
      return {
        success: false,
        error: result.errors[0]?.message || 'GraphQL error',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================
// USER GAMIFICATION (XP, Level, Achievements)
// =====================

export async function getUserGamification(userId?: string): Promise<ApiResponse<{
  getUserGamification: {
    userId: string;
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    achievements: string; // JSON string
    recentActivities: string; // JSON string
    lastActivityDate: string;
  } | null;
}>> {
  const uid = userId || await getCurrentUserId();
  if (!uid) {
    return { success: false, error: 'Not authenticated' };
  }
  
  const query = `
    query GetUserGamification($userId: ID!) {
      getUserGamification(userId: $userId) {
        userId
        totalXP
        currentLevel
        currentStreak
        longestStreak
        achievements
        recentActivities
        lastActivityDate
      }
    }
  `;
  return graphql(query, { userId: uid });
}

export async function awardXP(
  amount: number,
  reason: string,
  metadata?: Record<string, unknown>,
  userId?: string
): Promise<ApiResponse<{
  awardXP: {
    newTotalXP: number;
    newLevel: number;
    xpToNextLevel: number;
    achievementsUnlocked: Array<{
      id: string;
      title: string;
      badge: string;
    }>;
  };
}>> {
  const uid = userId || await getCurrentUserId();
  if (!uid) {
    return { success: false, error: 'Not authenticated' };
  }

  const mutation = `
    mutation AwardXP($userId: ID!, $amount: Int!, $reason: String!, $metadata: AWSJSON) {
      awardXP(userId: $userId, amount: $amount, reason: $reason, metadata: $metadata) {
        newTotalXP
        newLevel
        xpToNextLevel
        achievementsUnlocked {
          id
          title
          badge
        }
      }
    }
  `;
  return graphql(mutation, { 
    userId: uid, 
    amount, 
    reason, 
    metadata: metadata ? JSON.stringify(metadata) : null 
  });
}

// =====================
// USER MASTERY (Subject Progress)
// =====================

export async function getUserMastery(
  userId?: string, 
  subject: string = 'math'
): Promise<ApiResponse<{
  listUserMasteries: {
    items: Array<{
      userId: string;
      subject: string;
      contentId: string;
      masteryLevel: number;
      accuracy: number;
      practiceCount: number;
      lastPracticed: string;
      needsReinforcement: boolean;
    }>;
  };
}>> {
  const uid = userId || await getCurrentUserId();
  if (!uid) {
    return { success: false, error: 'Not authenticated' };
  }

  const query = `
    query ListUserMasteries($userId: ID!, $subject: String) {
      listUserMasteries(filter: { userId: { eq: $userId }, subject: { eq: $subject } }) {
        items {
          userId
          subject
          contentId
          masteryLevel
          accuracy
          practiceCount
          lastPracticed
          needsReinforcement
        }
      }
    }
  `;
  return graphql(query, { userId: uid, subject });
}

export async function createUserMastery(
  contentId: string,
  subject: string,
  masteryLevel: number,
  accuracy: number,
  userId?: string
): Promise<ApiResponse<{
  createUserMastery: {
    userId: string;
    contentId: string;
    subject: string;
    masteryLevel: number;
    accuracy: number;
    practiceCount: number;
  };
}>> {
  const uid = userId || await getCurrentUserId();
  if (!uid) {
    return { success: false, error: 'Not authenticated' };
  }

  const mutation = `
    mutation CreateUserMastery($input: CreateUserMasteryInput!) {
      createUserMastery(input: $input) {
        userId
        contentId
        subject
        masteryLevel
        accuracy
        practiceCount
      }
    }
  `;
  return graphql(mutation, {
    input: {
      userId: uid,
      contentId,
      subject,
      masteryLevel,
      accuracy,
      practiceCount: 1,
      needsReinforcement: false,
    }
  });
}

// =====================
// LEARNING ACTIVITY (Session Logging)
// =====================

export async function createLearningActivity(
  studentId: string,
  activityType: string,
  subject: string,
  details: {
    accuracy?: number;
    timeSpentMinutes?: number;
    topicId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<ApiResponse<{
  createLearningActivity: {
    id: string;
    studentId: string;
    activityType: string;
    subject: string;
    accuracy: number;
    timeSpentMinutes: number;
    timestamp: string;
  };
}>> {
  const mutation = `
    mutation CreateLearningActivity($input: CreateLearningActivityInput!) {
      createLearningActivity(input: $input) {
        id
        studentId
        activityType
        subject
        accuracy
        timeSpentMinutes
        timestamp
      }
    }
  `;
  return graphql(mutation, {
    input: {
      studentId,
      activityType,
      subject,
      ...details,
    }
  });
}

// =====================
// LEADERBOARD (Using GameLeaderboard model)
// =====================

export async function getLeaderboard(
  stageId: string,
  limit: number = 20
): Promise<ApiResponse<LeaderboardEntry[]>> {
  const query = `
    query ListLeaderboardByGameStage($gameId: String!, $stageId: String!, $limit: Int) {
      listLeaderboardByGameStage(gameId: $gameId, stageId: { eq: $stageId }, limit: $limit, sortDirection: DESC) {
        items {
          id
          userId
          userName
          gameId
          stageId
          difficulty
          score
          timeInSeconds
          stars
          correctAnswers
          totalQuestions
          rank
          playedAt
        }
      }
    }
  `;
  
  const result = await graphql<{ listLeaderboardByGameStage: { items: LeaderboardEntry[] } }>(
    query, 
    { gameId: 'mathchampion', stageId, limit }
  );
  
  if (result.success && result.data) {
    return {
      success: true,
      data: result.data.listLeaderboardByGameStage.items,
    };
  }
  
  return { success: false, error: result.error };
}

export async function submitScore(
  stageId: string,
  score: number,
  timeInSeconds: number,
  difficulty: string = 'medium',
  stars: number = 0,
  correctAnswers?: number,
  totalQuestions?: number
): Promise<ApiResponse<LeaderboardEntry>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get user name from auth
  const user = await getAuthUser();
  const userName = user?.name || 'Player';

  const mutation = `
    mutation CreateGameLeaderboard($input: CreateGameLeaderboardInput!) {
      createGameLeaderboard(input: $input) {
        id
        userId
        userName
        gameId
        stageId
        difficulty
        score
        timeInSeconds
        stars
        correctAnswers
        totalQuestions
        rank
        playedAt
      }
    }
  `;
  
  const now = new Date().toISOString();
  
  const result = await graphql<{ createGameLeaderboard: LeaderboardEntry }>(mutation, {
    input: {
      userId,
      userName,
      gameId: 'mathchampion',
      stageId,
      difficulty,
      score,
      timeInSeconds,
      stars,
      correctAnswers,
      totalQuestions,
      playedAt: now,
      createdAt: now,
      updatedAt: now,
    }
  });
  
  if (result.success && result.data) {
    return {
      success: true,
      data: result.data.createGameLeaderboard,
    };
  }
  
  return { success: false, error: result.error };
}

export async function getUserRank(
  stageId: string
): Promise<ApiResponse<{ rank: number; score: number }>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: true, data: { rank: 0, score: 0 } };
  }

  // Query user's best score for this stage
  const query = `
    query ListUserGameScores($userId: String!, $gameId: String!) {
      listUserGameScores(userId: $userId, gameId: { eq: $gameId }, limit: 1, sortDirection: DESC) {
        items {
          score
          rank
        }
      }
    }
  `;
  
  const result = await graphql<{ listUserGameScores: { items: Array<{ score: number; rank?: number }> } }>(
    query,
    { userId, gameId: 'mathchampion' }
  );
  
  if (result.success && result.data?.listUserGameScores?.items?.[0]) {
    const entry = result.data.listUserGameScores.items[0];
    return {
      success: true,
      data: { rank: entry.rank || 0, score: entry.score },
    };
  }
  
  return { success: true, data: { rank: 0, score: 0 } };
}

// =====================
// USER PROGRESS (Using UserMastery + LearningActivity)
// =====================

export async function getUserProgress(userId?: string): Promise<ApiResponse<UserProgress>> {
  const uid = userId || await getCurrentUserId();
  if (!uid) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get user's mastery data for math subject
  const masteryResult = await getUserMastery(uid, 'math');
  
  if (!masteryResult.success) {
    return {
      success: false,
      error: masteryResult.error,
    };
  }

  // Transform mastery data to progress format
  const stages: UserProgress['stages'] = {};
  
  if (masteryResult.data?.listUserMasteries?.items) {
    for (const item of masteryResult.data.listUserMasteries.items) {
      stages[item.contentId] = {
        completed: item.masteryLevel >= 3,
        bestScore: Math.round(item.accuracy * 100),
        attempts: item.practiceCount,
        lastPlayed: item.lastPracticed,
      };
    }
  }

  return {
    success: true,
    data: {
      userId: uid,
      stages,
      totalScore: 0, // TODO: Calculate from achievements
      achievements: [],
    },
  };
}

export async function updateUserProgress(
  stageId: string,
  completed: boolean,
  score: number,
  userId?: string
): Promise<ApiResponse<UserProgress>> {
  const uid = userId || await getCurrentUserId();
  if (!uid) {
    return { success: false, error: 'Not authenticated' };
  }

  // Update or create mastery record
  const masteryLevel = completed ? 3 : Math.floor(score / 33);
  const accuracy = score / 100;
  
  const result = await createUserMastery(stageId, 'math', masteryLevel, accuracy, uid);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  // Award XP for completing a stage
  if (completed) {
    await awardXP(100, 'Stage completed', { stageId, score }, uid);
  }

  // Return updated progress
  return getUserProgress(uid);
}

// =====================
// ACHIEVEMENTS (Using UserGamification)
// =====================

export async function getAchievements(userId?: string): Promise<ApiResponse<Achievement[]>> {
  const uid = userId || await getCurrentUserId();
  if (!uid) {
    return { success: true, data: [] };
  }

  const gamificationResult = await getUserGamification(uid);
  
  if (!gamificationResult.success || !gamificationResult.data?.getUserGamification) {
    return {
      success: true,
      data: [],
    };
  }

  // Parse achievements from JSON
  try {
    const achievementsJson = gamificationResult.data.getUserGamification.achievements;
    const achievements = achievementsJson ? JSON.parse(achievementsJson) : [];
    return {
      success: true,
      data: achievements,
    };
  } catch {
    return {
      success: true,
      data: [],
    };
  }
}

export async function unlockAchievement(
  achievementId: string
): Promise<ApiResponse<Achievement>> {
  // Achievements are unlocked via awardXP mutation
  // This is a placeholder for now
  console.warn('Achievement unlock handled by awardXP mutation');
  return {
    success: true,
    data: {
      id: achievementId,
      name: 'Achievement',
      description: 'Unlocked',
      iconUrl: '',
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    },
  };
}

// =====================
// TYPES
// =====================

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  gameId: string;
  stageId: string;
  difficulty: string;
  score: number;
  timeInSeconds: number;
  stars: number;
  correctAnswers?: number;
  totalQuestions?: number;
  rank?: number;
  playedAt: string;
  timestamp?: string; // Legacy compatibility
}

export interface UserProgress {
  userId: string;
  stages: {
    [stageId: string]: {
      completed: boolean;
      bestScore: number;
      attempts: number;
      lastPlayed: string;
    };
  };
  totalScore: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlocked: boolean;
  unlockedAt?: string;
}
