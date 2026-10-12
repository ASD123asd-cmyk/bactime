import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Timer } from "lucide-react";
import { playBell } from "@/lib/sounds";

type Phase = "work" | "short" | "long";

interface Props {
  isRtl: boolean;
  t: (key: string) => string;
}

const Pomodoro = ({ isRtl, t }: Props) => {
  const [workMin, setWorkMin] = useState(25);
  const [totalSessions, setTotalSessions] = useState(4);
  const [shortBreakMin, setShortBreakMin] = useState(0); // auto
  const [longBreakMin, setLongBreakMin] = useState(0); // auto

  const [phase, setPhase] = useState<Phase>("work");
  const [currentSession, setCurrentSession] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Auto-suggested breaks based on work duration
  const autoShort = Math.max(3, Math.round(workMin / 5));
  const autoLong = Math.max(10, Math.round(workMin / 5) * 3);
  const effectiveShort = shortBreakMin || autoShort;
  const effectiveLong = longBreakMin || autoLong;

  const phaseDuration = (p: Phase) => {
    if (p === "work") return workMin * 60;
    if (p === "short") return effectiveShort * 60;
    return effectiveLong * 60;
  };

  // Reset timer when settings change and not running
  useEffect(() => {
    if (!running) {
      setSecondsLeft(phaseDuration(phase));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMin, shortBreakMin, longBreakMin, phase]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handlePhaseEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, currentSession]);

  const handlePhaseEnd = () => {
    if (phase === "work") {
      playBell(false); // break starts
      if (currentSession >= totalSessions) {
        // all done -> long break then stop
        setPhase("long");
        setSecondsLeft(effectiveLong * 60);
      } else {
        const isLong = currentSession % 4 === 0;
        const next: Phase = isLong ? "long" : "short";
        setPhase(next);
        setSecondsLeft(phaseDuration(next));
      }
    } else {
      playBell(true); // work starts
      if (currentSession >= totalSessions) {
        setRunning(false);
        setPhase("work");
        setCurrentSession(1);
        setSecondsLeft(workMin * 60);
        return;
      }
      setCurrentSession((c) => c + 1);
      setPhase("work");
      setSecondsLeft(workMin * 60);
    }
  };

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setPhase("work");
    setCurrentSession(1);
    setSecondsLeft(workMin * 60);
  };
  const handleSkip = () => {
    setRunning(false);
    handlePhaseEnd();
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const total = phaseDuration(phase);
  const progress = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  const phaseLabel =
    phase === "work" ? t("workPhase") : phase === "short" ? t("shortBreakPhase") : t("longBreakPhase");
  const phaseColor =
    phase === "work" ? "hsl(var(--primary))" : phase === "short" ? "hsl(var(--accent))" : "hsl(var(--success))";

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-4 mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="countdown-card p-6 sm:p-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="w-6 h-6 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient">{t("pomodoroTitle")}</h2>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">{t("pomodoroDesc")}</p>

        {/* Timer Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-[260px] h-[260px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
              <circle
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              <motion.circle
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke={phaseColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">{phaseLabel}</p>
              <p className="text-5xl sm:text-6xl font-black text-foreground tabular-nums">
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t("sessionOf")} {currentSession} {t("of")} {totalSessions}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {!running ? (
            <button
              onClick={handleStart}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4" />
              {secondsLeft === phaseDuration(phase) ? t("start") : t("resume")}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Pause className="w-4 h-4" />
              {t("pause")}
            </button>
          )}
          <button
            onClick={handleSkip}
            className="glass-effect text-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <SkipForward className="w-4 h-4" />
            {t("skip")}
          </button>
          <button
            onClick={handleReset}
            className="glass-effect text-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            {t("reset")}
          </button>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-effect rounded-xl p-4">
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {t("workDuration")}: <span className="text-foreground">{workMin}</span>
            </label>
            <input
              type="range"
              aria-label={t("workDuration")}
              min={5}
              max={60}
              step={5}
              value={workMin}
              onChange={(e) => setWorkMin(Number(e.target.value))}
              className="w-full accent-primary"
              disabled={running}
            />
          </div>
          <div className="glass-effect rounded-xl p-4">
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {t("sessions")}: <span className="text-foreground">{totalSessions}</span>
            </label>
            <input
              type="range"
              aria-label={t("sessions")}
              min={1}
              max={10}
              step={1}
              value={totalSessions}
              onChange={(e) => setTotalSessions(Number(e.target.value))}
              className="w-full accent-primary"
              disabled={running}
            />
          </div>
        </div>

        {/* Suggested breaks */}
        <div className="mt-4 glass-effect rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">{t("suggestedBreaks")}</p>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-xs text-muted-foreground">{t("shortBreak")}</p>
              <p className="text-lg font-bold text-accent">
                {effectiveShort} {t("minutes_short")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("longBreak")}</p>
              <p className="text-lg font-bold text-primary">
                {effectiveLong} {t("minutes_short")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Pomodoro;
