# Math Champions Migration Plan

## Overview

This document outlines the plan to deploy Math Champions as the first game on the EduQ AI Game Platform at `game.eduq-ai.com/math-champion`.

**Key Decision: Separate Repository, Shared Infrastructure**

- Math Champions stays in this repo (`MathQuizBB`)
- Deploys to `game.eduq-ai.com` subdomain
- Shares Cognito User Pool and DynamoDB with main EduQ AI app
- First game of a planned multi-game platform

---

## 1. Current State

### Math Champions (This Project)
- **Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Hosting**: Netlify (free tier)
- **Data Storage**: localStorage (client-side only)
- **Authentication**: None (guest users only)
- **Domain**: None (Netlify subdomain)

### EduQ AI (Target Platform)
- **Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Hosting**: AWS Amplify Gen 2
- **Data Storage**: DynamoDB + AppSync (GraphQL)
- **Authentication**: Amazon Cognito (User Pool: `ap-southeast-1_ISUlRZfpp`)
- **Domain**: eduq-ai.com, game.eduq-ai.com (planned)

---

## 2. Migration Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **Unified Auth** | Use EduQ AI's Cognito for user authentication | High |
| **Data Integration** | Store game progress in student profiles | High |
| **Cost Optimization** | Eliminate Netlify costs, use existing AWS infrastructure | High |
| **User Acquisition** | Convert guest players to registered users | High |
| **Leaderboard** | Global leaderboard with authenticated users | Medium |
| **Mastery Tracking** | Feed game data into learning analytics | Medium |

---

## 3. Architecture After Migration

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS Infrastructure                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                    CloudFront Distribution                    │  │
│   │                                                               │  │
│   │   eduq-ai.com/*              → Main App S3                   │  │
│   │   game.eduq-ai.com/*         → Math Champions S3             │  │
│   │   api.eduq-ai.com/*          → API Gateway                   │  │
│   │                                                               │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│   │   S3 Buckets    │  │   API Gateway   │  │    Cognito      │    │
│   │                 │  │                 │  │   User Pool     │    │
│   │  - main-app     │  │  - REST API     │  │                 │    │
│   │  - math-champ   │  │  - /leaderboard │  │  ap-southeast-  │    │
│   │                 │  │  - /progress    │  │  1_ISUlRZfpp    │    │
│   └─────────────────┘  └────────┬────────┘  └────────┬────────┘    │
│                                 │                    │              │
│                                 ▼                    │              │
│   ┌─────────────────────────────────────────────────┴───────────┐  │
│   │                      Lambda Functions                        │  │
│   │                                                              │  │
│   │  - math-champions-api (leaderboard + progress)              │  │
│   │  - score-validation                                         │  │
│   │  - guest-to-user-migration                                  │  │
│   │                                                              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│                                 ▼                                   │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                      DynamoDB Tables                         │  │
│   │                                                              │  │
│   │  StudentProfile (existing)                                  │  │
│   │  ├── userId, email, name...                                 │  │
│   │  └── mathChampions: { xp, level, badges, stages, mastery } │  │
│   │                                                              │  │
│   │  MathChampionsLeaderboard (new)                             │  │
│   │  ├── pk: LEADERBOARD#GLOBAL                                 │  │
│   │  ├── sk: SCORE#2026-09#450#userId                          │  │
│   │  └── score, playerName, stageId, difficulty, stars         │  │
│   │                                                              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. File Migration Map

### Source: `C:\MathQuizBB\project\`
### Target: `C:\aws-ai-tutor-app-1\`

| Source File | Target Location | Notes |
|-------------|-----------------|-------|
| `src/components/*.tsx` | `src/games/math-champions/components/` | All game components |
| `src/screens/*.tsx` | `src/games/math-champions/screens/` | All screen components |
| `src/game.ts` | `src/games/math-champions/game.ts` | Core game logic |
| `src/storage.ts` | `src/games/math-champions/storage.ts` | Will be replaced with API calls |
| `src/types.ts` | `src/games/math-champions/types.ts` | Game-specific types |
| `public/*.png` | `public/games/math-champions/` | Logo assets |
| `index.html` | Merge into main app's index.html | |
| `tailwind.config.js` | Merge into main app's config | Custom colors needed |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/games/math-champions/index.tsx` | Game entry point / route |
| `src/games/math-champions/auth-context.tsx` | Cognito auth integration |
| `src/games/math-champions/api.ts` | API client for leaderboard |
| `amplify/functions/math-champions-api/` | Lambda function for backend |
| `amplify/data/math-champions-schema.ts` | DynamoDB schema extension |

---

## 5. DynamoDB Schema Design

### 5.1 StudentProfile Extension

Add `mathChampions` field to existing `StudentProfile` table:

```typescript
// Existing StudentProfile table
interface StudentProfile {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  
  // NEW: Math Champions data
  mathChampions?: {
    // Progression
    xp: number;
    level: number;
    
    // Achievements
    badges: string[];
    
    // Daily challenge
    dailyStreak: number;
    lastDailyDate: string | null;
    
    // Stage progress
    stages: {
      [stageId: string]: {
        unlocked: boolean;
        highScore: number;
        bestStars: number;
        gamesPlayed: number;
      };
    };
    
    // Mastery tracking (links to EduQ AI learning analytics)
    mastery: {
      [stageId: string]: number; // 0.0 - 1.0 accuracy
    };
    
    // Statistics
    totalGamesPlayed: number;
    totalCorrect: number;
    totalAnswered: number;
    totalXpEarned: number;
    
    // Guest migration
    guestId?: string; // Original guest ID if migrated
    migratedAt?: string;
  };
}
```

### 5.2 Leaderboard Table (New)

```typescript
// New table: MathChampionsLeaderboard
interface LeaderboardEntry {
  // Composite keys for efficient queries
  pk: string; // LEADERBOARD#GLOBAL or LEADERBOARD#STAGE#addition
  sk: string; // SCORE#2026-09#450#userId (sorted by score desc)
  
  // Denormalized data for fast reads
  score: number;
  userId: string;
  playerName: string;
  playerAvatar: string;
  stageId: StageId;
  difficulty: Difficulty;
  stars: number;
  
  // Timestamps
  timestamp: string;
  month: string; // 2026-09 for monthly leaderboards
  
  // For user-specific queries
  gsi1pk?: string; // USER#userId
  gsi1sk?: string; // SCORE#2026-09#450
}
```

### 5.3 GSIs (Global Secondary Indexes)

| Index | Key | Purpose |
|-------|-----|---------|
| `GSI1` | `pk: USER#userId`, `sk: SCORE#...` | Get user's scores |
| `GSI2` | `pk: LEADERBOARD#MONTHLY#2026-09`, `sk: SCORE#...` | Monthly leaderboard |

---

## 6. Authentication Flow

### 6.1 Login Button Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                    Login Button States                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GUEST USER:                                                     │
│  ┌──────────────┐                                                │
│  │   [User]     │  → Click → Redirect to EduQ AI login          │
│  │   Icon       │           /login?redirect=game.eduq-ai.com    │
│  └──────────────┘                                                │
│                                                                  │
│  AUTHENTICATED USER:                                             │
│  ┌──────────────┐                                                │
│  │ [Avatar]     │  → Shows dropdown:                             │
│  │ John         │     - View Profile                             │
│  └──────────────┘     - Logout                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Icon Options

| Icon | Usage | Description |
|------|-------|-------------|
| `User` | Guest state | Simple silhouette, most common |
| `LogIn` | Alternative guest | Arrow entering door, clear action |
| `UserCircle` | Logged in | Avatar circle, modern look |
| `AvatarDisplay` | Logged in | Custom avatar from game selection |

### 6.3 Auth Context

```typescript
// src/games/math-champions/auth-context.tsx
interface GameAuthContext {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  guestId: string;
  
  // Actions
  login: () => void;
  logout: () => void;
  
  // Migration
  claimGuestScores: () => Promise<void>;
}
```

### 6.4 Guest to User Migration Flow

```
1. Guest plays game
   └─→ Scores saved with guestId (UUID in localStorage)

2. Guest clicks login
   └─→ Redirect to Cognito login
   └─→ Return with auth token

3. Post-login hook
   └─→ Check for guestId in localStorage
   └─→ Call /api/math-champions/claim
   └─→ Merge guest scores to user profile
   └─→ Clear guestId

4. User continues
   └─→ All progress now linked to account
```

---

## 7. API Endpoints

### 7.1 REST API Design

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/math-champions/score` | Submit game score | Optional (guest or user) |
| `GET` | `/api/math-champions/leaderboard` | Get leaderboard | Public |
| `GET` | `/api/math-champions/progress` | Get user progress | Required |
| `POST` | `/api/math-champions/claim` | Claim guest scores | Required |
| `GET` | `/api/math-champions/daily` | Get daily challenge | Public |

### 7.2 Score Submission

```typescript
// POST /api/math-champions/score
interface ScoreSubmission {
  // Required
  score: number;
  stageId: StageId;
  difficulty: Difficulty;
  correct: number;
  total: number;
  maxStreak: number;
  timeInSeconds: number;
  
  // Auth context (from token or guest)
  guestId?: string;  // If not authenticated
  
  // Validation
  answers: Answer[]; // For server-side validation
  timestamp: string;
  checksum: string;  // Anti-tampering
}

interface Answer {
  questionIndex: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
}
```

---

## 8. Deployment Strategy

### 8.1 Phase 1: Preparation (Week 1)

- [ ] Migrate game files to EduQ AI project
- [ ] Add routing for `/game/math-champions`
- [ ] Create DynamoDB schema extension
- [ ] Set up local development environment

### 8.2 Phase 2: Backend (Week 2)

- [ ] Create Lambda function `math-champions-api`
- [ ] Set up API Gateway endpoints
- [ ] Implement score validation logic
- [ ] Create Cognito post-confirmation trigger

### 8.3 Phase 3: Frontend Integration (Week 3)

- [ ] Implement auth context in game
- [ ] Add login button UI
- [ ] Replace localStorage with API calls
- [ ] Test guest → user migration

### 8.4 Phase 4: Deployment (Week 4)

- [ ] Configure Route53: `game.eduq-ai.com`
- [ ] Set up CloudFront distribution
- [ ] Request ACM certificate
- [ ] Deploy to production
- [ ] Remove Netlify deployment

### 8.5 Rollback Plan

If issues arise:
1. Revert DNS to Netlify
2. Feature flag to disable API calls
3. Fallback to localStorage mode

---

## 9. Cost Analysis

### Current (Netlify)
- Free tier: $0/month
- Limited to 100GB bandwidth, 300 build minutes

### After Migration (AWS)

| Service | Monthly Cost (Est.) | Notes |
|---------|---------------------|-------|
| Amplify Hosting | $0-5 | Included in existing |
| CloudFront | $5-15 | Shared with main app |
| Lambda | $2-5 | Low traffic expected |
| API Gateway | $1-3 | $3.50/million requests |
| DynamoDB | $2-5 | On-demand, low usage |
| Route53 | $0.50 | Per hosted zone |
| **Total** | **$10-35/month** | |

**Savings**: Eliminates need for separate Netlify Pro ($19/month) if scaling needed.

---

## 10. Security Considerations

### 10.1 Score Validation

| Risk | Mitigation |
|------|------------|
| Score manipulation | Server-side recalculation from answers |
| Speed hacks | Timestamp validation, minimum time per question |
| Replay attacks | Nonce + timestamp in submissions |
| Bot abuse | Rate limiting per IP/user, CAPTCHA for anomalies |

### 10.2 Auth Security

| Risk | Mitigation |
|------|------------|
| Token theft | Short-lived tokens, secure storage |
| Guest abuse | Rate limit guest submissions, daily limits |
| Account takeover | Cognito MFA option |

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Guest → User conversion | 15%+ | Analytics tracking |
| Daily active players | 100+ | DynamoDB metrics |
| Score submission success | 99%+ | CloudWatch metrics |
| Page load time | <2s | Lighthouse |
| API response time | <200ms | CloudWatch |

---

## 12. Next Steps

1. **Immediate**: Add login icon to game UI (this session)
2. **This Week**: Create migration PR with file moves
3. **Next Week**: Backend implementation
4. **Week 4**: Production deployment

---

## Appendix A: Steering Rules Compliance

This migration follows all EduQ AI steering rules:
- `CRITICAL-RULES.md`: No breaking changes to existing auth
- `amplify-outputs-management.md`: Use pinned user pool
- `deployment-restrictions.md`: Deploy via Amplify console
- `direct-lambda-deployment-sop.md`: Standard Lambda packaging
- `mastery-tracking-system.md`: Integrate with existing mastery

---

## Appendix B: Related Documentation

- [Auth Implementation](./AUTH-INTEGRATION.md)
- [API Specification](./API-SPECIFICATION.md)
- [DynamoDB Schema](./DYNAMODB-SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)
