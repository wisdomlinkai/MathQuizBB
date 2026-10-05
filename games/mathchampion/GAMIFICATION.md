# Math Champions — Gamification Guide

A complete reference for all gamification features in Math Champions (數學小達人).

---

## Feature Overview

| # | Feature | Status |
|---|---------|--------|
| 1 | XP & Levels | Implemented |
| 2 | Badges / Achievements | Implemented |
| 3 | Daily Challenge | Implemented |
| 4 | Combo Multipliers | Implemented |
| 5 | Time Bonus | Implemented |
| 6 | Hard Difficulty | Implemented |

---

## 1. XP & Levels

Players earn XP (experience points) for every correct answer and every star earned. XP accumulates across all rounds and determines the player's level.

### XP Rewards

| Action | XP Earned |
|--------|-----------|
| Each correct answer | +50 XP |
| Each star earned | +30 XP |
| Daily challenge completion | +100 XP (bonus) |

### Level Progression

- **Level 1**: 0 XP (Beginner / 初學者)
- **Level 2**: 200 XP (Math Learner / 數學學徒)
- **Level 3**: 500 XP
- **Level 4**: 900 XP (Math Whiz / 數學小能手)
- **Level 5**: 1,400 XP
- **Level 7**: 2,700 XP (Math Star / 數學之星)
- **Level 10**: 6,300 XP (Math Expert / 數學專家)
- **Level 15**: 14,800 XP (Math Master / 數學大師)
- **Level 20**: 27,300 XP (Math Legend / 數學傳奇)

**Formula:** Each level requires `200 + (level - 1) * 100` XP to advance.

### Display

- The **LevelBadge** component appears on the Home screen and Stage Select screen, showing the level number, title, and an XP progress bar.
- When a player levels up, a celebratory **"LEVEL UP!"** banner appears on the Results screen with the new level and title.

---

## 2. Badges / Achievements

There are **12 badges** players can unlock. Each badge has an English and Traditional Chinese name and description.

### Badge List

| Badge | Emoji | Condition |
|-------|-------|-----------|
| First Steps | 👶 | Complete your first round |
| Triple Star | ⭐ | Earn 3 stars in any round |
| Flawless | 💯 | Answer all 10 questions correctly |
| On Fire | 🔥 | Reach a 5-answer streak |
| Unstoppable | 🚀 | Reach a 10-answer streak |
| Speed Demon | ⚡ | Answer with 75%+ time remaining |
| Rising Star | 🌟 | Reach Level 5 |
| Math Expert | 🎓 | Reach Level 10 |
| Daily Habit | 📅 | Complete 3 daily challenges |
| Champion | 👑 | Unlock all stages |
| Combo Master | 🎯 | Hit a 3x combo multiplier (10-streak) |
| Hard Warrior | ⚔️ | Complete a Hard difficulty round |

### Display

- The **Badge Screen** (accessible from Home via the "Badges" button) shows a grid of all 12 badges. Earned badges appear in full color; unearned ones are grayed out with a lock icon.
- When new badges are earned, they appear on the **Results screen** with a "New Badges!" celebration card.
- A badge count appears on the Home screen's Badges button.

---

## 3. Daily Challenge

One special challenge is available per calendar day. It offers bonus XP (+100) and tracks a daily streak.

### How It Works

- The **Daily Challenge card** appears on the Home screen.
- When available, it pulses with a grape/purple gradient and shows the day's stage and difficulty.
- The stage and difficulty are determined by the day of the month (deterministic — same for everyone on the same day).
- Once completed, the card shows "Daily Done!" and a checkmark until the next day.
- A **flame streak counter** shows consecutive daily completions.
- Daily streak resets if a day is missed (tracking is based on `dailyLastDate`).

### Display

- The **DailyChallengeCard** component on the Home screen handles both available and completed states.
- The daily streak count appears as a flame icon with a number.

---

## 4. Combo Multipliers

Streaks of consecutive correct answers unlock score multipliers, making streaks more valuable.

### Multiplier Tiers

| Streak | Multiplier | Label |
|--------|------------|-------|
| 1-2 | 1.0x | (none) |
| 3-4 | 1.5x | 1.5x Combo! / 1.5倍連擊！ |
| 5-9 | 2.0x | 2x Combo! / 雙倍連擊！ |
| 10+ | 3.0x | 3x Combo! / 三倍連擊！ |

### Scoring Formula

```
points = (100 base + streak × 20 + time bonus) × combo multiplier
```

### Display

- The streak counter in the game screen shows the current streak and multiplier (e.g., "5 (2×)").
- At 2x+ multiplier, a **lightning bolt icon** replaces the flame, and the background color intensifies.
- Combo milestone messages appear in the feedback area ("2x Combo! 雙倍連擊！").

---

## 5. Time Bonus

Answering quickly earns extra points. The faster you answer, the bigger the bonus.

### Time Bonus Tiers

| Time Remaining | Bonus | Label |
|----------------|-------|-------|
| 75%+ of timer | +50 | Lightning Fast! ⚡ / 閃電速度！⚡ |
| 50-74% | +30 | Quick! / 好快！ |
| 25-49% | +15 | (no label) |
| < 25% | +0 | (no label) |

### How It Works

- The time bonus is added to the base score *before* the combo multiplier is applied.
- So a fast answer during a high streak earns the most points possible.
- Example: Answer with 80% time left during a 5-streak: `(100 + 100 + 50) × 2.0 = 500 points`

### Display

- Time bonus messages appear alongside the correct-answer feedback.
- The "Lightning Fast!" message shows when answering with 75%+ time remaining.

---

## 6. Hard Difficulty

A third difficulty option for kids who want a real challenge.

### Difficulty Comparison

| Setting | Easy | Medium | Hard |
|---------|------|--------|------|
| Time Limit | 18s | 14s | 10s |
| Max Digits | 1 | 2 | 3 |
| 3-Star Threshold | 7/10 | 7/10 | 8/10 |
| 2-Star Threshold | 5/10 | 5/10 | 6/10 |

### Hard Mode Question Types

- **Addition/Subtraction**: 3-digit numbers (100-999)
- **Multiplication**: Up to 99 × 12
- **Division**: Quotients up to 50, divisors up to 12

### Display

- Hard difficulty buttons appear in **coral/red** coloring (vs. blue for Easy/Medium) on the Stage Select screen.
- The Hard Warrior badge is awarded for completing any Hard round with at least 1 correct answer.

---

## Data Persistence

All gamification data is stored in `localStorage`:

| Key | Contents |
|-----|----------|
| `mc_player` | Player name and avatar |
| `mc_progress` | Stage unlock status, best stars, high scores |
| `mc_stats` | XP, total correct/answered, best streak, rounds played, perfect rounds, badges, daily streak |
| `mc_leaderboard` | Top 10 scores |

### PlayerStats Structure

```typescript
interface PlayerStats {
  xp: number;              // Total experience points
  totalCorrect: number;    // Lifetime correct answers
  totalAnswered: number;   // Lifetime questions answered
  bestStreakEver: number;  // Highest single-game streak
  roundsPlayed: number;    // Total rounds completed
  perfectRounds: number;   // Rounds with 10/10 correct
  badges: string[];        // Earned badge IDs
  dailyLastDate: string;   // Last daily challenge date (YYYY-MM-DD)
  dailyStreak: number;     // Consecutive daily completions
}
```

---

## File Structure

| File | Purpose |
|------|---------|
| `src/types.ts` | All TypeScript interfaces and types |
| `src/game.ts` | Game logic: stages, difficulties, XP, levels, badges, combos, time bonus, daily challenge |
| `src/storage.ts` | localStorage persistence for player, progress, stats, leaderboard |
| `src/components/LevelBadge.tsx` | Level number + XP progress bar |
| `src/components/DailyChallengeCard.tsx` | Daily challenge button/card on Home |
| `src/components/CircularTimer.tsx` | Countdown timer with timeLeft callback |
| `src/components/NumberPad.tsx` | Touch-friendly number input pad |
| `src/components/Avatar.tsx` | Avatar picker and display |
| `src/components/StarRating.tsx` | 1-3 star display |
| `src/screens/HomeScreen.tsx` | Home with level, daily challenge, badges |
| `src/screens/StageSelectScreen.tsx` | Stage cards with 3 difficulty options |
| `src/screens/GameScreen.tsx` | Gameplay with combos, time bonus, XP tracking |
| `src/screens/ResultsScreen.tsx` | Results with XP, level up, new badges |
| `src/screens/LeaderboardScreen.tsx` | Top 10 ranked list |
| `src/screens/BadgeScreen.tsx` | Badge collection grid |
