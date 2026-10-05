import { useEffect, useState, useRef } from 'react';

interface CircularTimerProps {
  timeLimit: number;
  onTimeUp: () => void;
  resetKey: number;
  paused: boolean;
  onTimeLeftChange?: (timeLeft: number) => void;
}

export function CircularTimer({ timeLimit, onTimeUp, resetKey, paused, onTimeLeftChange }: CircularTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timeLeftRef = useRef(timeLeft);
  const onTimeUpRef = useRef(onTimeUp);
  const onTimeLeftChangeRef = useRef(onTimeLeftChange);

  onTimeUpRef.current = onTimeUp;
  onTimeLeftChangeRef.current = onTimeLeftChange;

  useEffect(() => {
    setTimeLeft(timeLimit);
    timeLeftRef.current = timeLimit;
  }, [resetKey, timeLimit]);

  useEffect(() => {
    if (paused) return;
    if (timeLeft <= 0) {
      onTimeUpRef.current();
      return;
    }
    const id = setTimeout(() => {
      const next = timeLeft - 1;
      timeLeftRef.current = next;
      setTimeLeft(next);
      onTimeLeftChangeRef.current?.(next);
    }, 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / timeLimit;
  const dashOffset = circumference * (1 - progress);

  const isUrgent = timeLeft <= 5;
  const isWarn = timeLeft <= 8 && timeLeft > 5;

  const colorClass = isUrgent
    ? 'text-coral-500'
    : isWarn
      ? 'text-sun-500'
      : 'text-mint-500';

  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/30"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={`${colorClass} transition-all duration-1000 ease-linear`}
        />
      </svg>
      <div className={`font-display font-bold text-3xl ${isUrgent ? 'text-coral-500 animate-pulse' : isWarn ? 'text-sun-500' : 'text-sky-700'}`}>
        {timeLeft}
      </div>
    </div>
  );
}
