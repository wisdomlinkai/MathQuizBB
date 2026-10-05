# EduQ AI Game Platform Specification

## Meta
- **Status**: Planning
- **Created**: 2026-09-30
- **Updated**: 2026-09-30
- **Target Completion**: 4 weeks
- **Priority**: High

---

## Overview

Build a scalable game platform under `game.eduq-ai.com` to host multiple educational mini-games. Math Champions is the first game, with more planned for user acquisition and engagement.

---

## Architecture

### Repository Structure

```
Separate Repositories (Cleaner Separation):

├── aws-ai-tutor-app-1 (GitHub)
│   └── Main EduQ AI application
│       └── eduq-ai.com
│
├── MathQuizBB (GitHub) ← This repo
│   └── Math Champions game
│       └── game.eduq-ai.com/math-champion
│
└── Future game repos...
    └── game.eduq-ai.com/[game-name]
```

### Infrastructure (Shared AWS Account)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS Infrastructure                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    Route53 (DNS)                             │   │
│   │                                                              │   │
│   │   eduq-ai.com        → CloudFront #1 (main app)             │   │
│   │   game.eduq-ai.com   → CloudFront #2 (game platform)        │   │
│   │   api.eduq-ai.com    → API Gateway                          │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              CloudFront #2: game.eduq-ai.com                 │   │
│   │                                                              │   │
│   │   Behaviors:                                                 │   │
│   │   /math-champion/*  → S3: math-champion-game                │   │
│   │   /word-wizard/*    → S3: word-wizard-game (future)         │   │
│   │   /science-quest/*  → S3: science-quest-game (future)       │   │
│   │   /*                → S3: game-portal (landing page)        │   │
│   │                                                              │   │
│   │   Features:                                                  │   │
│   │   - Single distribution (cost efficient)                     │   │
│   │   - ACM certificate for HTTPS                               │   │
│   │   - Cache optimization per game                             │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    S3 Buckets                                │   │
│   │                                                              │   │
│   │   eduq-ai-main-app       → Main application                 │   │
│   │   math-champion-game     → Math Champions static files      │   │
│   │   game-portal            → Game portal landing page         │   │
│   │   [future-game-buckets]  → Future games                     │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  API Gateway: api.eduq-ai.com                │   │
│   │                                                              │   │
│   │   /games/*                                                   │   │
│   │   ├── /math-champions/                                       │   │
│   │   │   ├── POST /score       → submit-score Lambda            │   │
│   │   │   ├── GET  /leaderboard → leaderboard Lambda             │   │
│   │   │   ├── GET  /progress    → progress Lambda                │   │
│   │   │   ├── POST /claim       → claim-guest Lambda             │   │
│   │   │   └── GET  /daily       → daily-challenge Lambda         │   │
│   │   │                                                          │   │
│   │   └── /[future-game]/*                                       │   │
│   │       └── [similar endpoints]                                │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   Lambda Functions                           │   │
│   │                                                              │   │
│   │   Shared:                                                    │   │
│   │   ├── games-submit-score    (validates & stores scores)     │   │
│   │   ├── games-leaderboard     (retrieves rankings)            │   │
│   │   ├── games-progress        (user progress)                 │   │
│   │   ├── games-claim-guest     (migrates guest to user)        │   │
│   │   └── games-daily           (daily challenges)              │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    DynamoDB Tables                           │   │
│   │                                                              │   │
│   │   StudentProfile (existing, extended)                        │   │
│   │   ├── userId, email, name...                                │   │
│   │   └── games: {                                              │   │
│   │         mathChampions: { xp, level, badges, stages... },    │   │
│   │         wordWizard: { ... },        // Future               │   │
│   │         scienceQuest: { ... },      // Future               │   │
│   │       }                                                     │   │
│   │                                                              │   │
│   │   GamesLeaderboard (new, unified)                           │   │
│   │   ├── pk: GAME#math-champions                              │   │
│   │   ├── sk: SCORE#2026-09#0450#userId                        │   │
│   │   └── score, playerName, game, difficulty, stars...        │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              Cognito User Pool (Shared)                      │   │
│   │                                                              │   │
│   │   User Pool: ap-southeast-1_ISUlRZfpp                       │   │
│   │                                                              │   │
│   │   Used by:                                                   │   │
│   │   ├── eduq-ai.com (main app)                                │   │
│   │   ├── game.eduq-ai.com (all games)                          │   │
│   │   └── Same users, same accounts everywhere                  │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## URL Structure

### Production URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Main App | `https://eduq-ai.com` | EduQ AI learning platform |
| Game Portal | `https://game.eduq-ai.com` | Game landing page (future) |
| Math Champions | `https://game.eduq-ai.com/math-champion` | Math game |
| Word Wizard | `https://game.eduq-ai.com/word-wizard` | Word game (future) |
| API | `https://api.eduq-ai.com/games/math-champions/*` | Game backend |

### Auth Flow

```
Guest plays game
      │
      ▼
Clicks "Sign in to save progress"
      │
      ▼
Redirect to: eduq-ai.com/login?redirect=game.eduq-ai.com/math-champion
      │
      ▼
Cognito authentication
      │
      ▼
Return to game with tokens
      │
      ▼
Guest scores claimed to user account
```

---

## DynamoDB Schema

### StudentProfile Extension

```typescript
// Add to existing StudentProfile
interface GamesData {
  mathChampions: {
    xp: number;
    level: number;
    badges: string[];
    dailyStreak: number;
    lastDailyDate: string | null;
    stages: {
      [stageId: string]: {
        unlocked: boolean;
        highScore: number;
        bestStars: number;
        gamesPlayed: number;
      };
    };
    mastery: {
      [stageId: string]: number; // 0.0 - 1.0
    };
    totalGamesPlayed: number;
    totalCorrect: number;
    totalAnswered: number;
    guestId?: string;
    migratedAt?: string;
  };
  
  // Future games
  wordWizard?: { /* ... */ };
  scienceQuest?: { /* ... */ };
}
```

### GamesLeaderboard Table

```typescript
// Unified leaderboard for all games
interface LeaderboardEntry {
  // Composite keys
  pk: string; // GAME#math-champions
  sk: string; // SCORE#2026-09#0450#userId
  
  // Score data
  game: string;        // 'math-champions'
  score: number;
  userId: string;
  playerName: string;
  playerAvatar: string;
  
  // Game-specific
  stageId?: string;    // For math-champions
  difficulty: string;
  stars: number;
  
  // Timestamps
  timestamp: string;
  month: string;       // For monthly leaderboards
  
  // GSI for user scores
  gsi1pk?: string;     // USER#userId
  gsi1sk?: string;     // GAME#math-champions#SCORE#2026-09#0450
}
```

---

## API Endpoints

### Base Path: `/games/math-champions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/score` | Optional | Submit game score |
| `GET` | `/leaderboard` | None | Get leaderboard |
| `GET` | `/progress` | Required | Get user progress |
| `POST` | `/claim` | Required | Claim guest scores |
| `GET` | `/daily` | None | Get daily challenge |

### Future Games

Same pattern for each new game:
- `/games/word-wizard/*`
- `/games/science-quest/*`
- etc.

---

## Deployment Pipeline

### Math Champions (This Repo)

```
GitHub: wisdomlinkai/MathQuizBB
    │
    ▼ (push to main)
GitHub Actions / Amplify Console
    │
    ├── Build: npm run build
    │
    └── Deploy:
        ├── S3: sync to math-champion-game bucket
        └── CloudFront: invalidation for /math-champion/*
```

### Backend (EduQ AI AWS Account)

```
Deployed once, shared by all games:
    ├── Lambda functions
    ├── API Gateway
    └── DynamoDB tables
```

---

## Cost Estimate

### Monthly Costs (Projected)

| Service | Usage | Cost |
|---------|-------|------|
| CloudFront #2 (games) | 50GB transfer | $8-12 |
| S3 (game buckets) | 2GB storage | $0.05 |
| Lambda | 200K invocations | $0.40 |
| API Gateway | 200K requests | $3.50 |
| DynamoDB | On-demand | $5-10 |
| Route53 | 1 zone | $0.50 |
| **Total** | | **~$18-27/mo** |

### Adding More Games

| Item | Extra Cost |
|------|------------|
| S3 bucket | ~$0.01/game |
| CloudFront behavior | $0 |
| Lambda (same functions) | $0 |
| **Marginal cost per game** | **~$0.01-1/mo** |

---

## Security

### Cross-Origin Setup

```javascript
// API Gateway CORS
AllowedOrigins: [
  'https://eduq-ai.com',
  'https://game.eduq-ai.com',
  'https://game.eduq-ai.com:443'
]
```

### Cognito Callback URLs

```javascript
CallbackURLs: [
  'https://eduq-ai.com/callback',
  'https://game.eduq-ai.com/math-champion/callback',
  'https://game.eduq-ai.com/word-wizard/callback',  // Future
  // Add more as games are added
]
```

### Score Validation

- Server-side recalculation from answer array
- Rate limiting: 10 submissions/min (guest), 30/min (auth)
- Anomaly detection for suspicious scores

---

## Future Games Roadmap

### Phase 1 (Now): Math Champions
- URL: `game.eduq-ai.com/math-champion`
- Focus: Math fluency, user acquisition

### Phase 2: Word Wizard
- URL: `game.eduq-ai.com/word-wizard`
- Focus: Vocabulary, spelling

### Phase 3: Science Quest
- URL: `game.eduq-ai.com/science-quest`
- Focus: Science knowledge

### Phase 4: Game Portal
- URL: `game.eduq-ai.com/`
- Landing page showcasing all games
- Cross-game achievements
- Unified leaderboard

---

## Tasks

### Phase 1: Infrastructure Setup (Week 1)

- [ ] Request ACM certificate for `game.eduq-ai.com`
- [ ] Create S3 bucket: `math-champion-game`
- [ ] Create CloudFront distribution for `game.eduq-ai.com`
- [ ] Configure Route53 alias record
- [ ] Set up GitHub Actions for deployment

### Phase 2: Backend Implementation (Week 2)

- [ ] Create DynamoDB table: `GamesLeaderboard`
- [ ] Extend StudentProfile schema
- [ ] Create Lambda functions (5 functions)
- [ ] Configure API Gateway endpoints
- [ ] Set up Cognito callback URLs

### Phase 3: Frontend Integration (Week 3)

- [ ] Update API endpoints in game code
- [ ] Implement Cognito auth flow
- [ ] Add guest-to-user migration
- [ ] Test cross-domain auth

### Phase 4: Launch (Week 4)

- [ ] Deploy to production
- [ ] Configure monitoring/alerting
- [ ] Remove Netlify deployment
- [ ] End-to-end testing

---

## Monitoring

### CloudWatch Alarms

| Metric | Threshold | Action |
|--------|-----------|--------|
| Lambda errors | > 1% | Alert |
| API Gateway 5xx | > 0.1% | Alert |
| DynamoDB throttling | > 0 | Alert |
| CloudFront 4xx rate | > 5% | Dashboard |

### Logging

- CloudFront: Standard logs to S3
- Lambda: CloudWatch Logs (7-day retention)
- API Gateway: Access logs + execution logs

---

## Related Documentation

- [Migration Plan](./MIGRATION-PLAN.md)
- [Auth Integration](./AUTH-INTEGRATION.md)
- [EduQ AI Steering: CRITICAL-RULES.md](C:/aws-ai-tutor-app-1/.kiro/steering/CRITICAL-RULES.md)
