import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpLeft } from "lucide-react";
import { motion } from "framer-motion";
import ExamCountdown from "@/components/ExamCountdown";
import ExamSettings from "@/components/ExamSettings";
import MarkerText, { Mark } from "@/components/MarkerText";
import ProgressBar from "@/components/ProgressBar";
import ShareButtons from "@/components/ShareButtons";
import StudyTools from "@/components/StudyTools";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/useCountdown";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";
import { playBell, playTick } from "@/lib/sounds";
import { toast } from "sonner";
import heroImage from "@/assets/hero-marrakech.jpg";

const DEFAULT_TARGET = "2027-06-08T08:00:00+01:00";
const DEFAULT_REMINDERS = [60, 10];

const loadTarget = (): Date => {
  try {
    const stored = localStorage.getItem("examTarget");
    if (stored) {
      const date = new Date(stored);
      if (!Number.isNaN(date.getTime())) return date;
    }
  } catch { /* Browser storage is optional. */ }
  return new Date(DEFAULT_TARGET);
};

const loadReminders = (): number[] => {
  try {
    const stored = localStorage.getItem("examReminders");
    if (stored) {
      const reminders: unknown = JSON.parse(stored);
      if (Array.isArray(reminders) && reminders.every((value) => Number.isSafeInteger(value) && value > 0)) return reminders;
    }
  } catch { /* Browser storage is optional. */ }
  return DEFAULT_REMINDERS;
};

const Index = () => {
  const { lang, isRtl, t, arr } = useLanguage();
  usePageMeta(
    lang === "ar" ? "العد التنازلي للباك 2027 في المغرب | BacTime" : lang === "fr" ? "Compte à rebours du bac 2027 au Maroc | BacTime" : "Morocco Bac 2027 Countdown | BacTime",
    lang === "ar" ? "تابع موعد امتحان البكالوريا في المغرب ونظّم مراجعتك باستخدام أدوات التركيز وتتبع الدراسة وحساب المعدل." : lang === "fr" ? "Suivez la date du baccalauréat au Maroc et organisez vos révisions avec des outils de concentration et de suivi." : "Track the Moroccan Baccalaureate exam and organize your revision with focus, study tracking, and grade tools.",
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

  const fireReminder = useCallback((minutes: number) => {
    const key = `${targetDate.getTime()}-${minutes}`;
    if (firedRef.current.has(key)) return;
    firedRef.current.add(key);
    const message = minutes >= 60 && minutes % 60 === 0
      ? `${minutes / 60} ${t("hoursShort")} ${t("reminderSuffix")}`
      : `${minutes} ${t("minutesShort")} ${t("reminderSuffix")}`;
    try { playBell(true); } catch { /* Browser storage is optional. */ }
    toast(t("reminderTitle"), { description: message });
    if (notifEnabled && "Notification" in window && Notification.permission === "granted") {
      try { new Notification(t("reminderTitle"), { body: message }); } catch { /* Browser storage is optional. */ }
    }
  }, [targetDate, notifEnabled, t]);

  const handleTick = useCallback((msLeft: number) => {
    if (tickSound) playTick();
    if (msLeft <= 0) return;
    reminders.forEach((minutes) => {
      const threshold = minutes * 60_000;
      if (msLeft <= threshold && msLeft > threshold - 2_000) fireReminder(minutes);
    });
  }, [tickSound, reminders, fireReminder]);
  const timeLeft = useCountdown(targetDate, handleTick);

  useEffect(() => {
    const interval = window.setInterval(() => setMotIdx((previous) => (previous + 1) % Math.max(1, motivations.length)), 10_000);
    return () => window.clearInterval(interval);
  }, [motivations.length]);

  const saveTarget = (date: Date) => {
    setTargetDate(date);
    try { localStorage.setItem("examTarget", date.toISOString()); } catch { /* Browser storage is optional. */ }
    toast(t("examDateUpdated"));
  };
  const saveReminders = (next: number[]) => {
    setReminders(next);
    try { localStorage.setItem("examReminders", JSON.stringify(next)); } catch { /* Browser storage is optional. */ }
  };

  const progressStart = targetDate.getTime() - 365 * 24 * 60 * 60 * 1000;
  const progress = targetDate.getTime() > progressStart
    ? Math.min(100, Math.max(0, ((Date.now() - progressStart) / (targetDate.getTime() - progressStart)) * 100))
    : 100;
  const motivation = motivations[motIdx] ?? "";

  return (
    <div className="home-page">
      <section className="home-hero">
        <img src={heroImage} alt="" width={1920} height={1088} className="home-hero-image" />
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="page-container home-hero-grid">
          <motion.div className="home-intro" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow mb-5">{t("heroEyebrow")}</p>
            <MarkerText className="home-title-wrap">
              <h1 className="home-title">{t("heroLead")} <Mark color="hsl(var(--primary))">{t("heroMark")}</Mark> {t("heroEnd")}</h1>
            </MarkerText>
            <p className="home-subtitle">{t("heroSubtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/focus">{t("heroCta")}<Arrow className="ms-2 size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="bg-background/60"><a href="#tools">{t("exploreTools")}<ArrowUpLeft className="ms-2 size-4" /></a></Button>
            </div>
          </motion.div>
          <ExamCountdown timeLeft={timeLeft} targetDate={targetDate} sound={tickSound} onSoundToggle={() => setTickSound((enabled) => !enabled)} motivation={motivation} />
        </div>
      </section>

      <section className="page-container progress-section" aria-label={t("preparation")}>
        <div className="progress-heading"><div><p className="eyebrow">{t("preparation")}</p><h2 className="mt-2 text-lg font-medium">{t("yearWindow")}</h2></div><span className="progress-date" dir="ltr">{Math.round(progress)}%</span></div>
        <ProgressBar label={t("progressLabel")} percentage={progress} isRtl={isRtl} />
        <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{t("startLabel")}</span><span>{t("examDay")}</span></div>
      </section>

      <StudyTools />
      <ExamSettings targetDate={targetDate} onSave={saveTarget} reminders={reminders} onRemindersChange={saveReminders} notifEnabled={notifEnabled} onToggleNotif={setNotifEnabled} isRtl={isRtl} t={t} />
      <div className="page-container share-section"><p className="eyebrow mb-2">{t("shareHint")}</p><ShareButtons title={t("shareTitle")} shareText={t("shareText")} url={typeof window !== "undefined" ? window.location.origin : ""} isRtl={isRtl} /></div>
    </div>
  );
};

export default Index;
