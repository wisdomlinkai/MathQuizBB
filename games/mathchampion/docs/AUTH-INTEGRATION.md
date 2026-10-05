# Auth Integration Specification

## Overview

This document details the authentication integration between Math Champions and EduQ AI's Cognito User Pool.

---

## 1. Cognito Configuration

### User Pool Details

| Property | Value |
|----------|-------|
| User Pool ID | `ap-southeast-1_ISUlRZfpp` |
| Region | `ap-southeast-1` |
| App Client ID | (from `amplify_outputs.pinned.json`) |

### Auth Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Guest User                                                   │
│     └─→ Play game with localStorage                             │
│     └─→ guestId generated (UUID)                                │
│                                                                  │
│  2. Click Login Button                                           │
│     └─→ Redirect to Cognito Hosted UI                           │
│     └─→ URL: https://eduq-ai.auth.ap-southeast-1.amazoncognito.com/
│     └─→ redirect_uri: https://game.eduq-ai.com/callback        │
│                                                                  │
│  3. User Authenticates                                           │
│     └─→ Email/password or OAuth (Google)                        │
│     └─→ Cognito returns tokens                                   │
│                                                                  │
│  4. Callback Handling                                            │
│     └─→ Parse tokens from URL                                   │
│     └─→ Store tokens securely                                   │
│     └─→ Check for guestId to claim                              │
│                                                                  │
│  5. Guest Migration                                              │
│     └─→ Call API to merge scores                                │
│     └─→ Clear guestId                                           │
│     └─→ Continue as authenticated user                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Login Button Implementation

### 2.1 Component Structure

```tsx
// src/games/math-champions/components/AuthButton.tsx

import { User, LogIn, UserCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface AuthButtonProps {
  isAuthenticated: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function AuthButton({ isAuthenticated, user, onLogin, onLogout }: AuthButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated) {
    // Guest state - show login button
    return (
      <button
        onClick={onLogin}
        className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center active:scale-90 transition-transform"
        title="Sign in to save your progress"
      >
        <LogIn className="w-5 h-5 text-sky-600" />
      </button>
    );
  }

  // Authenticated state - show avatar with dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-white rounded-xl px-2 py-1.5 shadow-md active:scale-95 transition-transform"
      >
        <UserCircle className="w-7 h-7 text-sky-600" />
        <span className="font-display font-bold text-sky-700 text-sm max-w-[60px] truncate">
          {user?.name || 'User'}
        </span>
        <ChevronDown className="w-4 h-4 text-sky-400" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg py-2 min-w-[140px] z-50">
          <button
            onClick={() => {/* Navigate to profile */}}
            className="w-full px-4 py-2 text-left font-body font-semibold text-sky-700 hover:bg-sky-50 text-sm"
          >
            View Profile
          </button>
          <hr className="my-1 border-sky-100" />
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-left font-body font-semibold text-coral-600 hover:bg-coral-50 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
```

### 2.2 Placement in Game UI

The auth button should appear in the **top-right corner** of all game screens:

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back]    Choose Stage                    [Login/Avatar]     │
│              選擇關卡                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      Game Content                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Screens to Update

| Screen | Header Location | Notes |
|--------|-----------------|-------|
| `HomeScreen` | Top of page, alongside title | Show in header area |
| `StageSelectScreen` | Right side of header row | Already has back button |
| `GameScreen` | Hidden during gameplay | Show after game ends |
| `ResultsScreen` | Top of results card | Prompt login if guest |
| `LeaderboardScreen` | Right side of header row | |
| `BadgeScreen` | Right side of header row | |

---

## 3. Auth Context Implementation

```tsx
// src/games/math-champions/auth-context.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchAuthSession, signInWithRedirect, signOut, getCurrentUser } from 'aws-amplify/auth';

interface User {
  userId: string;
  email: string;
  name: string;
}

interface GameAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  guestId: string;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

const GameAuthContext = createContext<GameAuthContextType | undefined>(undefined);

export function GameAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string>('');

  // Initialize guest ID from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mathChampions_guestId');
    if (stored) {
      setGuestId(stored);
    } else {
      const newGuestId = crypto.randomUUID();
      localStorage.setItem('mathChampions_guestId', newGuestId);
      setGuestId(newGuestId);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        const cognitoUser = await getCurrentUser();
        setUser({
          userId: cognitoUser.userId,
          email: cognitoUser.signInDetails?.loginId || '',
          name: cognitoUser.signInDetails?.loginId?.split('@')[0] || 'Player',
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Not authenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  function login() {
    // Redirect to Cognito Hosted UI
    signInWithRedirect({
      provider: 'Google', // Or use Cognito's hosted UI for email/password
      customState: JSON.stringify({ guestId, redirect: '/game/math-champions' }),
    });
  }

  async function logout() {
    await signOut();
    setUser(null);
    setIsAuthenticated(false);
    // Generate new guest ID
    const newGuestId = crypto.randomUUID();
    localStorage.setItem('mathChampions_guestId', newGuestId);
    setGuestId(newGuestId);
  }

  async function getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch {
      return null;
    }
  }

  return (
    <GameAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        guestId,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </GameAuthContext.Provider>
  );
}

export function useGameAuth() {
  const context = useContext(GameAuthContext);
  if (context === undefined) {
    throw new Error('useGameAuth must be used within a GameAuthProvider');
  }
  return context;
}
```

---

## 4. Guest Score Migration

### 4.1 Migration Trigger

```tsx
// After successful login, check for guest scores to claim
async function handleAuthCallback() {
  const { guestId } = useGameAuth();
  
  // Check if this was a guest user migrating
  const hasGuestScores = await checkGuestScores(guestId);
  
  if (hasGuestScores) {
    // Show migration prompt
    const migrate = await showMigrationPrompt();
    if (migrate) {
      await claimGuestScores(guestId);
      localStorage.removeItem('mathChampions_guestId');
    }
  }
}
```

### 4.2 API Call

```typescript
// Claim guest scores after login
async function claimGuestScores(guestId: string): Promise<void> {
  const token = await getAccessToken();
  
  const response = await fetch('/api/math-champions/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ guestId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to claim guest scores');
  }
}
```

---

## 5. Token Storage

### 5.1 Secure Storage Strategy

```typescript
// Tokens are managed by Amplify Auth library
// Stored in localStorage with encryption (configurable)

// Amplify configuration
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_ISUlRZfpp',
      userPoolClientId: process.env.VITE_COGNITO_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: 'eduq-ai.auth.ap-southeast-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['https://game.eduq-ai.com/callback'],
          redirectSignOut: ['https://game.eduq-ai.com/'],
          responseType: 'code',
        },
      },
    },
  },
};
```

---

## 6. Cognito Callback Handler

```tsx
// src/games/math-champions/CallbackPage.tsx

import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

export function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Amplify automatically handles the OAuth callback
        const session = await fetchAuthSession();
        
        if (session.tokens) {
          const user = await getCurrentUser();
          
          // Check for guest migration
          const customState = getCustomStateFromUrl();
          if (customState?.guestId) {
            await claimGuestScores(customState.guestId);
          }
          
          // Redirect to game
          navigate('/game/math-champions');
        }
      } catch (err) {
        setError('Authentication failed. Please try again.');
        console.error('Auth callback error:', err);
      }
    }

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-coral-600 font-display font-bold">{error}</p>
        <button
          onClick={() => navigate('/game/math-champions')}
          className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-xl"
        >
          Back to Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      <p className="ml-3 font-body text-sky-700">Signing you in...</p>
    </div>
  );
}
```

---

## 7. Testing Checklist

- [ ] Guest can play without login
- [ ] Login button redirects to Cognito
- [ ] OAuth callback handled correctly
- [ ] User info displayed after login
- [ ] Guest scores claimed after first login
- [ ] Logout clears session
- [ ] New guest ID generated after logout
- [ ] Token refresh works automatically

---

## 8. Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| Token expired | "Session expired, please login again" | Trigger re-login |
| Network error | "Connection error, please try again" | Retry button |
| Claim failed | "Could not link your guest progress" | Show support contact |

---

## Appendix: Amplify Auth Setup

```typescript
// main.tsx or index.tsx
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    },
  },
});
```
