import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Calculator, Timer, Volume2, VolumeX, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import ShareButtons from "@/components/ShareButtons";
import BrandLogo from "@/components/BrandLogo";
import ProgressBar from "@/components/ProgressBar";
import ExamSettings from "@/components/ExamSettings";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/useCountdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { playTick, playBell } from "@/lib/sounds";
import { toast } from "sonner";
import heroImage from "@/assets/hero-marrakech.jpg";

const DEFAULT_TARGET = "2027-06-08T08:00:00+01:00";
const DEFAULT_REMINDERS = [60, 10];

const loadTarget = (): Date => {
  try {
    const s = localStorage.getItem("examTarget");
    if (s) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
    }
  } catch {}
  return new Date(DEFAULT_TARGET);
};

const loadReminders = (): number[] => {
  try {
    const s = localStorage.getItem("examReminders");
    if (s) return JSON.parse(s);
  } catch {}
  return DEFAULT_REMINDERS;
};

const Index = () => {
  const { lang, isRtl, t, arr } = useLanguage();
  usePageMeta(
    "BacTime | العد التنازلي للبكالوريا 2027 وأدوات الاستعداد - المغرب",
    "BacTime منصة مغربية للاستعداد للبكالوريا 2027: عد تنازلي للامتحان الوطني، مؤقت بومودورو، متعقب الدراسة وحاسبة المعدل.",
    "/"
  );
  const [tickSound, setTickSound] = useState(false);
  const [motIdx, setMotIdx] = useState(0);
  const [targetDate, setTargetDate] = useState<Date>(loadTarget);
  const [reminders, setReminders] = useState<number[]>(loadReminders);
  const [notifEnabled, setNotifEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
  const firedRef = useRef<Set<string>>(new Set());
  const motivations = arr("motivations");
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    firedRef.current = new Set();
  }, [targetDate]);

  const fireReminder = useCallback(
    (m: number) => {
      const key = `${targetDate.getTime()}-${m}`;
      if (firedRef.current.has(key)) return;
      firedRef.current.add(key);
      const msg =
        m >= 60 && m % 60 === 0
          ? `${m / 60} ${t("hoursShort")} ${t("reminderSuffix")}`
          : `${m} ${t("minutesShort")} ${t("reminderSuffix")}`;
      try { playBell(true); } catch {}
      toast(t("reminderTitle"), { description: msg });
      if (notifEnabled && "Notification" in window && Notification.permission === "granted") {
        try { new Notification(t("reminderTitle"), { body: msg }); } catch {}
      }
    },
    [targetDate, notifEnabled, t]
  );

  const handleTick = useCallback(
    (msLeft: number) => {
      if (tickSound) playTick();
      if (msLeft <= 0) return;
      reminders.forEach((m) => {
        const offsetMs = m * 60 * 1000;
        if (msLeft <= offsetMs && msLeft > offsetMs - 2000) fireReminder(m);
      });
    },
    [tickSound, reminders, fireReminder]
  );

  const timeLeft = useCountdown(targetDate, handleTick);

  useEffect(() => {
    const interval = setInterval(() => setMotIdx((p) => (p + 1) % Math.max(1, motivations.length)), 10000);
    return () => clearInterval(interval);
  }, [motivations.length]);

  const saveTarget = (d: Date) => {
    setTargetDate(d);
    try { localStorage.setItem("examTarget", d.toISOString()); } catch {}
    toast(t("examDateUpdated"));
  };

  const saveReminders = (r: number[]) => {
    setReminders(r);
    try { localStorage.setItem("examReminders", JSON.stringify(r)); } catch {}
  };

  const locale = isRtl ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-GB";
  const examDateLabel = useMemo(
    () => targetDate.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }),
    [targetDate, locale]
  );
  const progressStart = targetDate.getTime() - 365 * 24 * 60 * 60 * 1000;
  const progress = Math.min(100, Math.max(0, ((Date.now() - progressStart) / (targetDate.getTime() - progressStart)) * 100));

  const units = [
    { v: timeLeft.days, l: t("days") },
    { v: timeLeft.hours, l: t("hours") },
    { v: timeLeft.minutes, l: t("minutes") },
    { v: timeLeft.seconds, l: t("seconds") },
  ];

  const tools = [
    { to: "/focus", icon: Timer, title: t("pomodoroTitle"), desc: t("pomodoroDesc"), tone: "bg-primary/15 text-primary" },
    { to: "/study-tracker", icon: BookOpen, title: t("st_title"), desc: t("st_subtitle"), tone: "bg-accent/15 text-accent" },
    { to: "/bac-calculator", icon: Calculator, title: t("bc_title"), desc: t("bc_subtitle"), tone: "bg-warning/15 text-warning" },
  ];

  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img src={heroImage} alt="" width={1920} height={1088} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className={`absolute inset-0 -z-10 from-background via-background/85 to-background/20 ${isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r"}`} />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 pt-20 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-14">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <BrandLogo className="h-10" />
              <Button variant="outline" size="icon" onClick={() => setTickSound(!tickSound)} aria-label={t("sound")} className="bg-background/60">
                {tickSound ? <Volume2 /> : <VolumeX />}
              </Button>
            </div>
            <p className="mb-4 inline-flex rounded-md border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">{t("subtitle")}</p>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.2] sm:text-5xl lg:text-6xl">{t("heroTitle")}</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-secondary-foreground sm:text-lg">{t("heroSubtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand hover:opacity-90"><Link to="/focus">{t("start")} <Arrow /></Link></Button>
              <Button asChild size="lg" variant="outline" className="bg-background/50"><a href="#tools">{t("navTools")}</a></Button>
            </div>
          </motion.div>

          <motion.div id="countdown" className="scroll-mt-24 rounded-xl border border-border bg-card/90 p-5 shadow-2xl backdrop-blur-md sm:p-7" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold sm:text-xl">{t("nationalExam")}</h2>
              <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setTickSound(!tickSound)} aria-label={t("sound")}>
                {tickSound ? <Volume2 /> : <VolumeX />}
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3" dir="ltr">
              {(isRtl ? units : units).map((u) => (
                <div key={u.l} className="rounded-lg border border-border bg-secondary/80 px-1 py-4 text-center">
                  <AnimatePresence mode="popLayout">
                    <motion.p key={u.v} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} className="font-display text-3xl font-extrabold tabular-nums sm:text-5xl">
                      {String(u.v).padStart(2, "0")}
                    </motion.p>
                  </AnimatePresence>
                  <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground sm:text-sm">{u.l}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 text-accent" />{t("examDateLabel")}: {examDateLabel}</p>
            <div className="mt-3 flex min-h-8 items-center">
              <AnimatePresence mode="wait">
                <motion.p key={motIdx} className="font-semibold" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {motivations[motIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-10 md:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t("toolsTitle")}</h2>
          <p className="mt-1 text-muted-foreground">{t("toolsDesc")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.to} to={tool.to} className="countdown-card group flex h-full gap-4 p-5 transition-transform hover:-translate-y-1">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tool.tone}`}><tool.icon className="h-6 w-6" /></span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="block font-bold">{tool.title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{tool.desc}</span>
                <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">{t("openTool")} <Arrow className="h-4 w-4" /></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ExamSettings targetDate={targetDate} onSave={saveTarget} reminders={reminders} onRemindersChange={saveReminders} notifEnabled={notifEnabled} onToggleNotif={setNotifEnabled} isRtl={isRtl} t={t} />
      <ProgressBar label={t("progressLabel")} percentage={progress} isRtl={isRtl} />

      <ShareButtons title={t("shareTitle")} shareText={t("shareText")} url={typeof window !== "undefined" ? window.location.origin : ""} isRtl={isRtl} />
    </div>
  );
};

export default Index;
