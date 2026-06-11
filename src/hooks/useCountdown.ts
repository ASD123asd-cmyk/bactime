import { useState, useEffect, useRef } from "react";

const TARGET_DATE = new Date("2027-06-08T08:00:00+01:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const useCountdown = (onTick?: () => void): TimeLeft => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculate());
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  function calculate(): TimeLeft {
    const diff = TARGET_DATE.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculate());
      onTickRef.current?.();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
};
