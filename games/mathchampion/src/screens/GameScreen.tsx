import { useState, useCallback, useRef } from 'react';
import { X, Flame, Zap } from 'lucide-react';
import { CircularTimer } from '@/components/CircularTimer';
import { NumberPad } from '@/components/NumberPad';
import { AvatarDisplay } from '@/components/Avatar';
import { useTranslation } from '@/i18n';
import {
  STAGES,
  DIFFICULTIES,
  generateRound,
  calculateStars,
  calculateAnswerScore,
  calculateRoundXp,
  getEncouragement,
  getComboMultiplier,
  getComboLabel,
  getTimeBonus,
  getTimeBonusLabel,
  QUESTIONS_PER_ROUND,
} from '@/game';
import type { Question, StageId, Difficulty, RoundResult, AnswerRecord } from '@/types';

interface GameScreenProps {
  stageId: StageId;
  difficulty: Difficulty;
  playerName?: string;
  playerAvatar: string;
  isDaily: boolean;
  onQuit: () => void;
  onComplete: (result: RoundResult) => void;
}

type FeedbackState = 'none' | 'correct' | 'wrong';

export function GameScreen({
  stageId,
  difficulty,
  playerName,
  playerAvatar,
  isDaily,
  onQuit,
  onComplete,
}: GameScreenProps) {
  const { t } = useTranslation();
  const stage = STAGES.find((s) => s.id === stageId)!;
  const diff = DIFFICULTIES.find((d) => d.id === difficulty)!;

  const [questions] = useState<Question[]>(() => generateRound(stageId, difficulty));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [, setMaxStreak] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [feedbackMsg, setFeedbackMsg] = useState<{ en: string; zh: string } | null>(null);
  const [bonusMsg, setBonusMsg] = useState<{ en: string; zh: string } | null>(null);
  const [, setComboLabel] = useState<{ en: string; zh: string } | null>(null);
  const [paused, setPaused] = useState(false);

  const timeLeftRef = useRef(diff.timeLimit);
  const answersRef = useRef<AnswerRecord[]>([]);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const streakRef = useRef(0);
  const maxStreakRef = useRef(0);

  const currentQuestion = questions[currentIndex];

  const handleTimeout = useCallback(() => {
    if (feedback !== 'none') return;
    submitAnswer(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, answer, currentIndex]);

  function submitAnswer(timedOut: boolean) {
    if (feedback !== 'none') return;
    setPaused(true);

    const timeLeftNow = timedOut ? 0 : timeLeftRef.current;
    const userAns = timedOut ? null : parseInt(answer, 10);
    const isCorrect = userAns === currentQuestion.answer;

    let newStreak = streakRef.current;
    let newCorrect = correctRef.current;
    let newScore = scoreRef.current;
    let newMaxStreak = maxStreakRef.current;

    if (isCorrect) {
      newStreak = streakRef.current + 1;
      newCorrect = correctRef.current + 1;
      const points = calculateAnswerScore(newStreak, timeLeftNow, diff.timeLimit);
      newScore = scoreRef.current + points;
      newMaxStreak = Math.max(maxStreakRef.current, newStreak);

      streakRef.current = newStreak;
      correctRef.current = newCorrect;
      scoreRef.current = newScore;
      maxStreakRef.current = newMaxStreak;

      setStreak(newStreak);
      setCorrectCount(newCorrect);
      setScore(newScore);
      setMaxStreak(newMaxStreak);
      setFeedback('correct');

      const tBonus = getTimeBonus(timeLeftNow, diff.timeLimit);
      const tBonusLabel = getTimeBonusLabel(timeLeftNow, diff.timeLimit);
      const cLabel = getComboLabel(newStreak);

      if (tBonus > 0 && tBonusLabel) {
        setBonusMsg(tBonusLabel);
      } else if (cLabel) {
        setBonusMsg(cLabel);
      } else {
        setBonusMsg(null);
      }
      setComboLabel(cLabel);
    } else {
      streakRef.current = 0;
      setStreak(0);
      setFeedback('wrong');
      setBonusMsg(null);
      setComboLabel(null);
    }

    answersRef.current.push({
      correct: isCorrect,
      timeLeft: timeLeftNow,
      timeLimit: diff.timeLimit,
      streak: newStreak,
    });

    setFeedbackMsg(getEncouragement(isCorrect, isCorrect ? newStreak : 0));

    setTimeout(() => {
      if (currentIndex + 1 >= QUESTIONS_PER_ROUND) {
        const finalCorrect = correctRef.current;
        const finalStars = calculateStars(finalCorrect, difficulty);
        const xpEarned = calculateRoundXp(finalCorrect, finalStars, isDaily);
        const result: RoundResult = {
          stageId,
          difficulty,
          score: scoreRef.current,
          correct: finalCorrect,
          total: QUESTIONS_PER_ROUND,
          stars: finalStars,
          maxStreak: maxStreakRef.current,
          date: Date.now(),
          xpEarned,
          answers: answersRef.current,
          isDaily,
        };
        onComplete(result);
      } else {
        setCurrentIndex((i) => i + 1);
        setAnswer('');
        setFeedback('none');
        setFeedbackMsg(null);
        setBonusMsg(null);
        setComboLabel(null);
        setPaused(false);
      }
    }, 1300);
  }

  const handleDigit = (d: string) => {
    if (feedback !== 'none') return;
    setAnswer((prev) => {
      if (prev.length >= 4) return prev;
      return prev + d;
    });
  };

  const handleClear = () => {
    if (feedback !== 'none') return;
    setAnswer('');
  };

  const handleEnter = () => {
    if (feedback !== 'none' || answer === '') return;
    submitAnswer(false);
  };

  const progressPercent = (currentIndex / QUESTIONS_PER_ROUND) * 100;
  const comboMult = getComboMultiplier(streak);

  return (
    <div className="min-h-[100dvh] flex flex-col safe-top safe-bottom">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onQuit}
            className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center active:scale-90 transition-transform shrink-0"
          >
            <X className="w-5 h-5 text-sky-600" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-3 rounded-full bg-white/50 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${stage.gradient} transition-all duration-300 rounded-full`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white/60 rounded-xl px-2.5 py-1.5 shrink-0">
            <span className="font-display font-bold text-sky-700 text-sm">
              {currentIndex + 1}/{QUESTIONS_PER_ROUND}
            </span>
          </div>
        </div>
      </div>

      {/* Score & Streak */}
      <div className="px-4 pb-2">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white/60 rounded-2xl px-3 py-2">
            <AvatarDisplay avatar={playerAvatar} size="sm" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-sky-700 text-xs leading-tight truncate max-w-[60px]">
                {playerName}
              </span>
              <span className="font-display font-bold text-sky-700 text-sm leading-tight">
                {score}
              </span>
              <span className="font-body font-semibold text-sky-400 text-[10px] leading-tight">
                {t('game.score')}
              </span>
            </div>
          </div>

          {streak >= 2 && (
            <div className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 animate-pop-in ${
              comboMult >= 3 ? 'bg-coral-200' : comboMult >= 2 ? 'bg-sun-200' : 'bg-sun-100'
            }`}>
              {comboMult >= 2 ? (
                <Zap className={`w-5 h-5 ${comboMult >= 3 ? 'text-coral-600' : 'text-sun-600'}`} />
              ) : (
                <Flame className="w-5 h-5 text-sun-500" />
              )}
              <span className={`font-display font-bold text-base ${
                comboMult >= 3 ? 'text-coral-700' : comboMult >= 2 ? 'text-sun-700' : 'text-sun-600'
              }`}>
                {streak}{comboMult > 1 ? ` (${comboMult}×)` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timer + Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        <CircularTimer
          timeLimit={diff.timeLimit}
          onTimeUp={handleTimeout}
          resetKey={currentIndex}
          paused={paused}
          onTimeLeftChange={(t) => { timeLeftRef.current = t; }}
        />

        {/* Question card */}
        <div
          key={currentIndex}
          className={`w-full max-w-sm rounded-3xl py-8 px-6 flex flex-col items-center gap-2 shadow-xl animate-pop-in ${
            feedback === 'correct'
              ? 'bg-mint-400'
              : feedback === 'wrong'
                ? 'bg-coral-400 animate-shake'
                : 'bg-white'
          } transition-colors duration-200`}
        >
          <div className={`font-display font-extrabold text-5xl sm:text-6xl flex items-center gap-3 flex-wrap justify-center ${
            feedback === 'correct' ? 'text-white' : feedback === 'wrong' ? 'text-white' : 'text-sky-800'
          }`}>
            {/* Multi-step expression or simple question */}
            {currentQuestion.expression ? (
              <>
                <span className="text-3xl sm:text-4xl">{currentQuestion.expression}</span>
                <span className={feedback === 'none' ? 'text-sky-300' : 'text-white/70'}>=</span>
                <span className={`min-w-[2ch] text-center ${
                  feedback === 'none' ? 'text-sky-400' : 'text-white'
                }`}>
                  {answer || '?'}
                </span>
              </>
            ) : (
              <>
                <span>{currentQuestion.a}</span>
                <span>{currentQuestion.op}</span>
                <span>{currentQuestion.b}</span>
                <span className={feedback === 'none' ? 'text-sky-300' : 'text-white/70'}>=</span>
                <span className={`min-w-[2ch] text-center ${
                  feedback === 'none' ? 'text-sky-400' : 'text-white'
                }`}>
                  {answer || '?'}
                </span>
              </>
            )}
          </div>

          {/* Feedback message */}
          {feedbackMsg && (
            <div className="mt-2 text-center animate-bounce-in">
              <p className="font-display font-bold text-white text-xl">
                {feedbackMsg.en}
              </p>
              <p className="font-display font-semibold text-white/90 text-lg">
                {feedbackMsg.zh}
              </p>
              {bonusMsg && feedback === 'correct' && (
                <p className="font-display font-bold text-white/95 text-base mt-1 animate-star-pop">
                  {bonusMsg.en} {bonusMsg.zh}
                </p>
              )}
              {feedback === 'wrong' && (
                <p className="font-body font-semibold text-white/80 text-sm mt-1">
                  Answer: {currentQuestion.answer}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Answer display / prompt */}
        {feedback === 'none' && (
          <div className="text-center">
            <p className="font-body font-semibold text-sky-600 text-base">
              {t('game.typeAnswer')}
            </p>
          </div>
        )}
      </div>

      {/* Number pad */}
      <div className="px-4 pb-5 pt-2">
        <NumberPad
          onDigit={handleDigit}
          onClear={handleClear}
          onEnter={handleEnter}
          disabled={feedback !== 'none'}
        />
      </div>
    </div>
  );
}
