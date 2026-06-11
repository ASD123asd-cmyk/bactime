import { useState, useEffect, useRef, useMemo } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export const useCountdown = (
  target: Date | string | number,
  onTick?: (msLeft: number) => void
): TimeLeft => {
  const targetMs = useMemo(() => {
    const d = target instanceof Date ? target : new Date(target);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
  }, [target]);

  const calculate = (): TimeLeft => {
    const diff = targetMs - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      totalMs: diff,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculate);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    setTimeLeft(calculate());
    const timer = setInterval(() => {
      const tl = calculate();
      setTimeLeft(tl);
      onTickRef.current?.(tl.totalMs);
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMs]);

  return timeLeft;
};
