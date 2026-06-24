import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Volume2, VolumeX, BookOpen, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import CountdownUnit from "@/components/CountdownUnit";
import Particles from "@/components/Particles";
import ShareButtons from "@/components/ShareButtons";
import ProgressBar from "@/components/ProgressBar";
import Pomodoro from "@/components/Pomodoro";
import ExamSettings from "@/components/ExamSettings";
import { useCountdown } from "@/hooks/useCountdown";
import { translations, type Language } from "@/lib/translations";
import { playTick, playBell } from "@/lib/sounds";
import { toast } from "sonner";

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
  const [lang, setLang] = useState<Language>("ar");
  const [tickSound, setTickSound] = useState(false);
  const [motIdx, setMotIdx] = useState(0);
  const [targetDate, setTargetDate] = useState<Date>(loadTarget);
  const [reminders, setReminders] = useState<number[]>(loadReminders);
  const [notifEnabled, setNotifEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
  const firedRef = useRef<Set<string>>(new Set());

  const tr = translations[lang];
  const t = (key: string) => {
    const val = tr[key];
    return typeof val === "string" ? val : "";
  };
  const arr = (key: string) => {
    const val = tr[key];
    return Array.isArray(val) ? val : [];
  };
  const motivations = arr("motivations");
  const isRtl = lang === "ar";

  // Reset fired reminders when target changes
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

      try {
        playBell(true);
      } catch {}
      toast(t("reminderTitle"), { description: msg });
      if (notifEnabled && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(t("reminderTitle"), { body: msg });
        } catch {}
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
        // Fire when remaining drops at/below the offset, but still positive
        if (msLeft <= offsetMs && msLeft > offsetMs - 2000) {
          fireReminder(m);
        }
      });
    },
    [tickSound, reminders, fireReminder]
  );

  const timeLeft = useCountdown(targetDate, handleTick);

  useEffect(() => {
    const interval = setInterval(() => {
      setMotIdx((prev) => (prev + 1) % motivations.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [motivations.length]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-sunset", "theme-forest");
    root.classList.add("dark");
    root.setAttribute("dir", isRtl ? "rtl" : "ltr");
  }, [isRtl]);

  const saveTarget = (d: Date) => {
    setTargetDate(d);
    try {
      localStorage.setItem("examTarget", d.toISOString());
    } catch {}
    toast(t("examDateUpdated"));
  };

  const saveReminders = (r: number[]) => {
    setReminders(r);
    try {
      localStorage.setItem("examReminders", JSON.stringify(r));
    } catch {}
  };

  const languages: { code: Language; label: string }[] = [
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
  ];

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const examDateLabel = useMemo(
    () =>
      targetDate.toLocaleDateString(isRtl ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [targetDate, lang, isRtl]
  );

  const progressStart = useMemo(() => {
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return targetDate.getTime() - oneYear;
  }, [targetDate]);

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden pb-24 pt-20">
      <Particles />
      <div className="glow-effect fixed inset-0 pointer-events-none z-0" />

      <motion.div
        className="fixed top-4 right-4 z-50 flex gap-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => {
            const idx = languages.findIndex((l) => l.code === lang);
            setLang(languages[(idx + 1) % languages.length].code);
          }}
          className="glass-effect rounded-xl p-3 hover:scale-105 transition-transform"
        >
          <Globe className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => setTickSound(!tickSound)}
          className={`glass-effect rounded-xl p-3 hover:scale-105 transition-transform ${tickSound ? "ring-2 ring-primary" : ""}`}
          title={t("sound")}
        >
          {tickSound ? <Volume2 className="w-5 h-5 text-foreground" /> : <VolumeX className="w-5 h-5 text-foreground" />}
        </button>
        <Link
          to="/study-tracker"
          className="glass-effect rounded-xl p-3 hover:scale-105 transition-transform"
          title={t("st_open")}
        >
          <BookOpen className="w-5 h-5 text-foreground" />
        </Link>
        <Link
          to="/bac-calculator"
          className="glass-effect rounded-xl p-3 hover:scale-105 transition-transform"
          title={t("bc_open")}
        >
          <Calculator className="w-5 h-5 text-foreground" />
        </Link>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center px-4 max-w-4xl w-full mt-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gradient leading-tight mb-3"
            style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)" }}
          >
            {t("title")}
          </h1>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>

        <motion.div
          className={`flex gap-3 sm:gap-4 md:gap-6 mb-10 ${isRtl ? "flex-row-reverse" : ""}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CountdownUnit value={timeLeft.days} label={t("days")} />
          <CountdownUnit value={timeLeft.hours} label={t("hours")} />
          <CountdownUnit value={timeLeft.minutes} label={t("minutes")} />
          <CountdownUnit value={timeLeft.seconds} label={t("seconds")} />
        </motion.div>

        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            📅 {t("examDateLabel")}: {examDateLabel}
          </p>
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={motIdx}
                className="text-base sm:text-lg font-semibold text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                {motivations[motIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="text-sm text-muted-foreground">{t("goodLuck")}</p>
        </motion.div>
      </div>

      <div className="relative z-10 w-full">
        <ExamSettings
          targetDate={targetDate}
          onSave={saveTarget}
          reminders={reminders}
          onRemindersChange={saveReminders}
          notifEnabled={notifEnabled}
          onToggleNotif={setNotifEnabled}
          isRtl={isRtl}
          t={t}
        />

        <ProgressBar
          label={t("progressLabel")}
          percentage={(() => {
            const end = targetDate.getTime();
            const now = Date.now();
            return Math.min(100, Math.max(0, ((now - progressStart) / (end - progressStart)) * 100));
          })()}
          isRtl={isRtl}
        />

        <Pomodoro isRtl={isRtl} t={t} />

        <ShareButtons
          title={t("shareTitle")}
          shareText={t("shareText")}
          url={siteUrl}
          isRtl={isRtl}
        />
      </div>

      <motion.div
        className="w-full max-w-4xl mx-auto mt-8 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <a
          href="https://www.instagram.com/_hamza__ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="countdown-card p-4 flex items-center justify-center gap-3 group cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {t("developerCredit")}
          </span>
          <span className="text-xs text-muted-foreground">@_hamza__ai</span>
        </a>
      </motion.div>

      <motion.div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass-effect rounded-full px-4 py-2 flex gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              lang === l.code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default Index;
