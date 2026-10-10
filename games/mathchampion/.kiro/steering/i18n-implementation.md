---
inclusion: always
---

# Math Champions i18n Implementation Guide

**Last Updated:** October 7, 2026
**Status:** ACTIVE
**Priority:** HIGH - Required for all user-facing text

---

## Overview

Math Champions is a separate standalone app in its own repository (`C:\MathQuizBB`). This document covers i18n (internationalization) implementation to support bilingual English/Chinese text throughout the game.

---

## Architecture

```
MathQuizBB/
├── games/
│   └── mathchampion/
│       ├── src/
│       │   ├── i18n/
│       │   │   ├── index.ts          # i18n setup
│       │   │   ├── en.ts             # English translations
│       │   │   ├── zh-HK.ts          # Traditional Chinese (Hong Kong)
│       │   │   └── types.ts          # Translation types
│       │   ├── components/           # UI components
│       │   └── screens/              # Screen components
│       └── .kiro/steering/           # This file
```

---

## i18n System

### Translation Hook

```typescript
import { useTranslation } from '@/i18n';

const { t } = useTranslation();

// Usage
<h1>{t('game.title')}</h1>
<button>{t('common.play')}</button>
```

### Translation Keys Structure

```typescript
const en = {
  game: {
    title: 'Math Champions',
    titleZh: '數學小達人',
    subtitle: 'For Hong Kong Math Whizzes',
  },
  common: {
    play: 'Play',
    playZh: '開始',
    retry: 'Retry',
    home: 'Home',
    homeZh: '首頁',
  },
  // ... more namespaces
};
```

### Bilingual Pattern

The game uses a **bilingual pattern** where English and Chinese text are displayed together:

```jsx
<h1>{t('game.title')}</h1>
<p className="text-zh">{t('game.titleZh')}</p>
```

Or inline:

```jsx
<button>
  {t('common.play')} {t('common.playZh')}
</button>
```

---

## Avatar System

### Expanded Avatar Choices

The avatar system has been expanded to include 32+ diverse options:

**Categories:**
- **Animals:** 🐱 Cat, 🐻 Bear, 🐼 Panda, 🦊 Fox, 🐸 Frog, 🦁 Lion, 🐰 Rabbit, 🦉 Owl
- **Robots:** 🤖 Robot, 🦾 Cyborg, 👾 Alien
- **Space:** 🚀 Rocket, 🛸 UFO, 🌟 Star
- **Characters:** 🧙 Wizard, 🧚 Fairy, 👸 Princess, 🧜‍♀️ Mermaid
- **Funny Faces:** 🤡 Clown, 👻 Ghost, 🎭 Masks, 😛 Funny Face
- **Fantasy:** 🦄 Unicorn, 🐲 Dragon, 🧛 Vampire
- **Nature:** 🌸 Flower, 🌈 Rainbow, ⚡ Lightning

### Avatar Definition

```typescript
export interface Avatar {
  id: string;
  emoji: string;
  category?: 'animal' | 'robot' | 'space' | 'character' | 'funny' | 'fantasy' | 'nature';
}

export const AVATARS: Avatar[] = [
  // Animals
  { id: 'cat', emoji: '🐱', category: 'animal' },
  { id: 'bear', emoji: '🐻', category: 'animal' },
  { id: 'panda', emoji: '🐼', category: 'animal' },
  { id: 'fox', emoji: '🦊', category: 'animal' },
  { id: 'frog', emoji: '🐸', category: 'animal' },
  { id: 'lion', emoji: '🦁', category: 'animal' },
  { id: 'rabbit', emoji: '🐰', category: 'animal' },
  { id: 'owl', emoji: '🦉', category: 'animal' },
  
  // Robots
  { id: 'robot', emoji: '🤖', category: 'robot' },
  { id: 'cyborg', emoji: '🦾', category: 'robot' },
  { id: 'alien', emoji: '👾', category: 'robot' },
  
  // Space
  { id: 'rocket', emoji: '🚀', category: 'space' },
  { id: 'ufo', emoji: '🛸', category: 'space' },
  { id: 'star', emoji: '🌟', category: 'space' },
  
  // Characters
  { id: 'wizard', emoji: '🧙', category: 'character' },
  { id: 'fairy', emoji: '🧚', category: 'character' },
  { id: 'princess', emoji: '👸', category: 'character' },
  { id: 'mermaid', emoji: '🧜‍♀️', category: 'character' },
  
  // Funny Faces
  { id: 'clown', emoji: '🤡', category: 'funny' },
  { id: 'ghost', emoji: '👻', category: 'funny' },
  { id: 'masks', emoji: '🎭', category: 'funny' },
  { id: 'funny_face', emoji: '😛', category: 'funny' },
  
  // Fantasy
  { id: 'unicorn', emoji: '🦄', category: 'fantasy' },
  { id: 'dragon', emoji: '🐲', category: 'fantasy' },
  { id: 'vampire', emoji: '🧛', category: 'fantasy' },
  
  // Nature
  { id: 'flower', emoji: '🌸', category: 'nature' },
  { id: 'rainbow', emoji: '🌈', category: 'nature' },
  { id: 'lightning', emoji: '⚡', category: 'nature' },
  
  // More animals
  { id: 'penguin', emoji: '🐧', category: 'animal' },
  { id: 'koala', emoji: '🐨', category: 'animal' },
  { id: 'monkey', emoji: '🐵', category: 'animal' },
  { id: 'pig', emoji: '🐷', category: 'animal' },
  { id: 'cow', emoji: '🐮', category: 'animal' },
];
```

---

## Translation Keys Reference

### Game Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `game.title` | Math Champions | 數學小達人 |
| `game.subtitle` | For Hong Kong Math Whizzes | 香港數學小天才 |
| `game.loading` | Loading... | 載入中... |
| `game.score` | Score | 分數 |
| `game.correct` | Correct | 答對 |
| `game.accuracy` | Accuracy | 正確率 |
| `game.bestStreak` | Best Streak | 最高連擊 |

### Common Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `common.play` | Play | 開始 |
| `common.retry` | Retry | 重試 |
| `common.home` | Home | 首頁 |
| `common.rankings` | Rankings | 排行榜 |
| `common.badges` | Badges | 徽章 |
| `common.change` | Change | 更改 |
| `common.close` | Close | 關閉 |
| `common.next` | Next | 下一關 |

### Stages Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `stages.addition` | Addition | 加法 |
| `stages.subtraction` | Subtraction | 減法 |
| `stages.mixed` | Mixed +/− | 混合加減 |
| `stages.multiplication` | Multiplication | 乘法 |
| `stages.division` | Division | 除法 |
| `stages.mixed_mul` | Mixed ×/÷ | 混合乘除 |
| `stages.ultimate` | Ultimate Challenge | 終極挑戰 |

### Difficulty Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `difficulty.easy` | Easy | 簡單 |
| `difficulty.medium` | Medium | 中等 |
| `difficulty.hard` | Hard | 困難 |

### Results Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `results.perfect` | Perfect! | 太厲害了！ |
| `results.great` | Great Work! | 做得好好！ |
| `results.good` | Good Try! | 不錯呀！ |
| `results.practice` | Keep Practicing! | 繼續努力！ |
| `results.levelUp` | LEVEL UP! | 升級了！ |
| `results.newHighScore` | New High Score! | 新紀錄！ |
| `results.newBadges` | New Badges! | 新徽章！ |

### Feedback Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `feedback.correct` | Correct! | 答對了！ |
| `feedback.great` | Great job! | 好叻呀！ |
| `feedback.awesome` | Awesome! | 太棒了！ |
| `feedback.gotIt` | You got it! | 答中了！ |
| `feedback.wellDone` | Well done! | 做得好！ |
| `feedback.onFire` | On fire! | 連擊高手！ |
| `feedback.streak` | Streak master! | 連續答中！ |
| `feedback.tryAgain` | Try again next! | 下次加油！ |
| `feedback.almost` | Almost! | 差少少！ |
| `feedback.keepGoing` | Keep going! | 繼續努力！ |

### Combo Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `combo.3x` | 3x Combo! | 三倍連擊！ |
| `combo.2x` | 2x Combo! | 雙倍連擊！ |
| `combo.1_5x` | 1.5x Combo! | 1.5倍連擊！ |

### Time Bonus Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `timeBonus.lightning` | Lightning Fast! ⚡ | 閃電速度！⚡ |
| `timeBonus.quick` | Quick! | 好快！ |

### Levels Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `levels.legend` | Math Legend | 數學傳奇 |
| `levels.master` | Math Master | 數學大師 |
| `levels.expert` | Math Expert | 數學專家 |
| `levels.star` | Math Star | 數學之星 |
| `levels.whiz` | Math Whiz | 數學小能手 |
| `levels.learner` | Math Learner | 數學學徒 |
| `levels.beginner` | Beginner | 初學者 |

### Badges Namespace

| Key | English | Traditional Chinese |
|-----|---------|---------------------|
| `badges.firstSteps` | First Steps | 第一步 |
| `badges.tripleStar` | Triple Star | 三星初現 |
| `badges.flawless` | Flawless | 完美無瑕 |
| `badges.onFire` | On Fire | 連擊高手 |
| `badges.unstoppable` | Unstoppable | 勢不可擋 |
| `badges.speedDemon` | Speed Demon | 閃電俠 |
| `badges.risingStar` | Rising Star | 新星崛起 |
| `badges.mathExpert` | Math Expert | 數學專家 |
| `badges.dailyHabit` | Daily Habit | 每日挑戰 |
| `badges.champion` | Champion | 全方位冠軍 |
| `badges.comboMaster` | Combo Master | 連擊大師 |
| `badges.hardWarrior` | Hard Warrior | 困難戰士 |

---

## Implementation Checklist

When adding new text to the game:

- [ ] Create translation keys in both `en.ts` and `zh-HK.ts`
- [ ] Use the `useTranslation` hook in components
- [ ] Display both English and Chinese where appropriate
- [ ] Test language switching (if implemented)
- [ ] Verify text displays correctly in UI

---

## Best Practices

1. **Always use translation keys** - Never hardcode text in components
2. **Bilingual display** - Show English + Chinese for key UI elements
3. **Consistent key naming** - Use `namespace.item` pattern
4. **Keep translations in sync** - Every key in `en.ts` must exist in `zh-HK.ts`
5. **Use TypeScript types** - Leverage type safety for translation keys

---

## Related Files

- `src/i18n/index.ts` - i18n setup and hook
- `src/i18n/en.ts` - English translations
- `src/i18n/zh-HK.ts` - Traditional Chinese translations
- `src/i18n/types.ts` - TypeScript types for translations

---

## Change Log

| Date | Change |
|------|--------|
| 2026-10-07 | Initial i18n implementation guide created |
| 2026-10-07 | Expanded avatar system with 32+ choices |
| 2026-10-07 | Added comprehensive translation keys reference |
