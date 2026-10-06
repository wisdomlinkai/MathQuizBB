import { getAccessToken } from './auth';
import { awsConfig } from './aws-config';

const API_URL = awsConfig.api.baseUrl;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic API call helper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getAccessToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'API request failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Leaderboard API
export async function getLeaderboard(
  stageId: string,
  limit: number = 10
): Promise<ApiResponse<LeaderboardEntry[]>> {
  return apiCall<LeaderboardEntry[]>(
    `/leaderboard?stageId=${stageId}&limit=${limit}`
  );
}

export async function submitScore(
  stageId: string,
  score: number,
  timeInSeconds: number
): Promise<ApiResponse<LeaderboardEntry>> {
  return apiCall<LeaderboardEntry>('/leaderboard', {
    method: 'POST',
    body: JSON.stringify({ stageId, score, timeInSeconds }),
  });
}

export async function getUserRank(
  stageId: string
): Promise<ApiResponse<{ rank: number; score: number }>> {
  return apiCall<{ rank: number; score: number }>(`/leaderboard/rank?stageId=${stageId}`);
}

// User Progress API
export async function getUserProgress(): Promise<ApiResponse<UserProgress>> {
  return apiCall<UserProgress>('/progress');
}

export async function updateUserProgress(
  stageId: string,
  completed: boolean,
  score: number
): Promise<ApiResponse<UserProgress>> {
  return apiCall<UserProgress>('/progress', {
    method: 'PUT',
    body: JSON.stringify({ stageId, completed, score }),
  });
}

// Achievements API
export async function getAchievements(): Promise<ApiResponse<Achievement[]>> {
  return apiCall<Achievement[]>('/achievements');
}

export async function unlockAchievement(
  achievementId: string
): Promise<ApiResponse<Achievement>> {
  return apiCall<Achievement>('/achievements/unlock', {
    method: 'POST',
    body: JSON.stringify({ achievementId }),
  });
}

// Types
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  stageId: string;
  score: number;
  timeInSeconds: number;
  timestamp: string;
  rank?: number;
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
