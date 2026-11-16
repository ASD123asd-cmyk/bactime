import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, SkipForward, Timer } from "lucide-react";
import { toast } from "sonner";
import WheelPicker, { type WheelColumn } from "@/components/WheelPicker";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { playBell } from "@/lib/sounds";

type Phase = "work" | "short" | "long";

interface Props {
  isRtl: boolean;
  t: (key: string) => string;
}

const range = (start: number, end: number, step = 1) =>
  Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, index) => {
    const value = start + index * step;
    return { value: String(value), label: String(value).padStart(2, "0") };
  });

const Pomodoro = ({ isRtl, t }: Props) => {
  const { lang } = useLanguage();
  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [totalSessions, setTotalSessions] = useState(4);
  const [longEvery, setLongEvery] = useState(4);
  const [autoBreaks, setAutoBreaks] = useState(true);
  const [phase, setPhase] = useState<Phase>("work");
  const [currentSession, setCurrentSession] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const effectiveShort = autoBreaks ? Math.max(3, Math.round(workMin / 5)) : shortBreakMin;
  const effectiveLong = autoBreaks ? Math.max(10, Math.round(workMin / 5) * 3) : longBreakMin;
  const durationFor = (nextPhase: Phase) =>
    (nextPhase === "work" ? workMin : nextPhase === "short" ? effectiveShort : effectiveLong) * 60;

  useEffect(() => {
    if (!running) setSecondsLeft(durationFor(phase));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMin, shortBreakMin, longBreakMin, autoBreaks, phase]);

  const isCounting = running && secondsLeft > 0;
  useEffect(() => {
    if (!isCounting) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isCounting]);

  useEffect(() => {
    if (!running || secondsLeft !== 0) return;
    if (phase === "work") {
      setCompletedSessions((count) => count + 1);
      const nextPhase: Phase = currentSession >= totalSessions || currentSession % longEvery === 0 ? "long" : "short";
      playBell(false);
      setPhase(nextPhase);
      setSecondsLeft(durationFor(nextPhase));
      return;
    }

    if (currentSession >= totalSessions) {
      playBell(true);
      setRunning(false);
      setPhase("work");
      setCurrentSession(1);
      setSecondsLeft(workMin * 60);
      toast(t("finishedCycle"));
      return;
    }

    playBell(true);
    setCurrentSession((session) => session + 1);
    setPhase("work");
    setSecondsLeft(workMin * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, secondsLeft, phase, currentSession, totalSessions, longEvery, effectiveLong, effectiveShort, workMin]);

  const reset = () => {
    setRunning(false);
    setPhase("work");
    setCurrentSession(1);
    setSecondsLeft(workMin * 60);
  };
  const skip = () => {
    if (running) setSecondsLeft(0);
    else {
      setRunning(true);
      setSecondsLeft(0);
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const total = durationFor(phase);
  const progress = total > 0 ? Math.min(100, ((total - secondsLeft) / total) * 100) : 0;
  const phaseLabel = phase === "work" ? t("focusPhase") : phase === "short" ? t("shortPhase") : t("longPhase");
  const phaseColor = phase === "work" ? "hsl(var(--primary))" : phase === "short" ? "hsl(var(--accent))" : "hsl(var(--success))";
  const radius = 106;
  const circumference = 2 * Math.PI * radius;
  const columns: WheelColumn[] = useMemo(() => [
    { id: "work", label: t("focusMinutes"), options: range(5, 60, 5), className: "w-12 sm:w-14" },
    { id: "short", label: t("shortMinutes"), options: range(1, 20), className: "w-12 sm:w-14" },
    { id: "long", label: t("longMinutes"), options: range(5, 45, 5), className: "w-12 sm:w-14" },
    { id: "sessions", label: t("totalSessions"), options: range(1, 10), className: "w-12 sm:w-14" },
  ], [t]);
  const values = {
    work: String(workMin),
    short: String(shortBreakMin),
    long: String(longBreakMin),
    sessions: String(totalSessions),
  };
  const updateSettings = (next: Record<string, string>) => {
    setWorkMin(Number(next.work));
    setShortBreakMin(Number(next.short));
    setLongBreakMin(Number(next.long));
    setTotalSessions(Number(next.sessions));
  };

  return (
    <motion.section className="w-full max-w-4xl mx-auto px-4 mt-10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} dir={isRtl ? "rtl" : "ltr"}>
      <div className="countdown-card p-5 sm:p-8">
        <div className="mb-5 flex items-center justify-center gap-2"><Timer className="size-5 text-primary" /><h2 className="text-xl font-medium sm:text-2xl">{t("focusSettings")}</h2></div>
        <div className="flex flex-col items-center">
          <div className="relative size-[250px] sm:size-[270px]" role="timer" aria-label={`${phaseLabel}: ${mins} ${t("minutesUnit")} ${secs}`}>
            <svg className="size-full -rotate-90" viewBox="0 0 240 240" aria-hidden="true">
              <circle cx="120" cy="120" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle cx="120" cy="120" r={radius} fill="none" stroke={phaseColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} animate={{ strokeDashoffset: circumference * (1 - progress / 100) }} transition={{ duration: 0.45, ease: "linear" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="mb-1 text-sm font-medium text-muted-foreground">{phaseLabel}</p>
              <p className="font-display text-5xl font-semibold tabular-nums sm:text-6xl">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t("sessionOf")} {currentSession} {t("of")} {totalSessions}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("completedSessions")}: {completedSessions}</p>
        </div>

        <div className="my-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => setRunning((value) => !value)} disabled={running && secondsLeft === 0}>
            {running ? <><Pause data-icon="inline-start" />{t("pause")}</> : <><Play data-icon="inline-start" />{secondsLeft < durationFor(phase) ? t("resume") : t("start")}</>}
          </Button>
          <Button variant="outline" onClick={skip}><SkipForward data-icon="inline-start" />{t("skip")}</Button>
          <Button variant="ghost" onClick={reset}><RotateCcw data-icon="inline-start" />{t("reset")}</Button>
        </div>

        <fieldset disabled={running} className="min-w-0 border-0 p-0">
          <legend className="text-base font-medium">{t("focusSettings")}</legend>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">{t("durationHelp")}</p>
          <WheelPicker columns={columns} disabled={running} value={values} onValueChange={updateSettings} label={t("focusSettings")} className="mx-auto max-w-sm bg-background/60" />
          <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[11px] text-muted-foreground sm:text-xs">
            {["focusMinutes", "shortMinutes", "longMinutes", "totalSessions"].map((key) => <span key={key}>{t(key)}</span>)}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border border-border/70 p-3 text-sm">
              <input type="checkbox" checked={autoBreaks} onChange={(event) => setAutoBreaks(event.target.checked)} className="size-4 accent-primary" />
              <span>{t("autoBreaks")}</span>
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3 text-sm">
              <span>{t("longEvery")}</span>
              <select aria-label={t("longEvery")} value={longEvery} onChange={(event) => setLongEvery(Number(event.target.value))} className="rounded-md border border-input bg-background px-2 py-1 text-foreground">
                {[2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} {t("sessionUnit")}</option>)}
              </select>
            </label>
          </div>
        </fieldset>
        <p className="mt-5 rounded-lg bg-secondary/60 px-4 py-3 text-sm leading-6 text-muted-foreground">{t("focusNote")} {t("localData")}</p>
      </div>
    </motion.section>
  );
};

export default Pomodoro;
