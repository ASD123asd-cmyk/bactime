import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, Calendar, Target, Trash2, Plus } from "lucide-react";
import Particles from "@/components/Particles";
import ProgressBar from "@/components/ProgressBar";
import { translations, type Language } from "@/lib/translations";
import { toast } from "sonner";

interface StudySession {
  id: string;
  subject: string;
  minutes: number;
  date: string; // ISO
}

const SESSIONS_KEY = "studySessions";
const GOAL_KEY = "studyDailyGoalHours";

const loadSessions = (): StudySession[] => {
  try {
    const s = localStorage.getItem(SESSIONS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};

const loadGoal = (): number => {
  try {
    const s = localStorage.getItem(GOAL_KEY);
    if (s) return Number(s) || 2;
  } catch {}
  return 2;
};

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const startOfWeek = (d = new Date()) => {
  const x = startOfDay(d);
  const day = x.getDay(); // 0..6
  x.setDate(x.getDate() - day);
  return x;
};
const startOfMonth = (d = new Date()) => {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
};

const StudyTracker = () => {
  const [lang, setLang] = useState<Language>("ar");
  const [sessions, setSessions] = useState<StudySession[]>(loadSessions);
  const [goal, setGoal] = useState<number>(loadGoal);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState<number>(30);

  const tr = translations[lang];
  const t = (key: string) => {
    const v = tr[key];
    return typeof v === "string" ? v : "";
  };
  const isRtl = lang === "ar";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-sunset", "theme-forest");
    root.classList.add("dark");
    root.setAttribute("dir", isRtl ? "rtl" : "ltr");
  }, [isRtl]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(GOAL_KEY, String(goal));
    } catch {}
  }, [goal]);

  const { todayMin, weekMin, monthMin } = useMemo(() => {
    const today = startOfDay().getTime();
    const week = startOfWeek().getTime();
    const month = startOfMonth().getTime();
    let dM = 0, wM = 0, mM = 0;
    for (const s of sessions) {
      const ts = new Date(s.date).getTime();
      if (ts >= today) dM += s.minutes;
      if (ts >= week) wM += s.minutes;
      if (ts >= month) mM += s.minutes;
    }
    return { todayMin: dM, weekMin: wM, monthMin: mM };
  }, [sessions]);

  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} ${t("minutesShort")}`;
    if (m === 0) return `${h} ${t("hoursShort")}`;
    return `${h}${t("hoursShort")} ${m}${t("minutesShort")}`;
  };

  const dailyPct = goal > 0 ? (todayMin / (goal * 60)) * 100 : 0;

  const addSession = () => {
    if (!subject.trim() || duration <= 0) {
      toast(t("st_invalidInput"));
      return;
    }
    const s: StudySession = {
      id: crypto.randomUUID(),
      subject: subject.trim(),
      minutes: Math.round(duration),
      date: new Date().toISOString(),
    };
    setSessions((prev) => [s, ...prev]);
    setSubject("");
    setDuration(30);
    toast(t("st_added"));
  };

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const languages: { code: Language; label: string }[] = [
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
  ];

  const stats = [
    { icon: Clock, label: t("st_today"), value: fmt(todayMin), color: "from-primary to-accent" },
    { icon: Calendar, label: t("st_week"), value: fmt(weekMin), color: "from-accent to-primary" },
    { icon: BookOpen, label: t("st_month"), value: fmt(monthMin), color: "from-primary to-accent" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden pb-24 pt-20">
      <Particles />
      <div className="glow-effect fixed inset-0 pointer-events-none z-0" />

      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Link
          to="/"
          className="glass-effect rounded-xl p-3 hover:scale-105 transition-transform inline-flex items-center gap-2"
        >
          <ArrowLeft className={`w-5 h-5 text-foreground ${isRtl ? "rotate-180" : ""}`} />
        </Link>
      </motion.div>

      <div className="relative z-10 w-full max-w-4xl px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient leading-tight mb-2"
            style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)" }}
          >
            {t("st_title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            {t("st_subtitle")}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="countdown-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${s.color}`}>
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className={isRtl ? "text-right" : "text-left"}>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-xl font-black text-foreground">{s.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Daily Goal */}
        <motion.div
          className="countdown-card p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={`flex items-center justify-between mb-4 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <Target className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">{t("st_dailyGoal")}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <input
                type="number"
                min={1}
                max={24}
                value={goal}
                onChange={(e) => setGoal(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                className="w-16 h-9 rounded-lg bg-secondary border border-border text-center text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">{t("hoursShort")}</span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full hero-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, dailyPct)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className={`flex justify-between text-xs text-muted-foreground mt-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <span>{fmt(todayMin)}</span>
            <span className="font-bold text-primary">{dailyPct.toFixed(0)}%</span>
            <span>{goal} {t("hoursShort")}</span>
          </div>
        </motion.div>

        {/* Add session */}
        <motion.div
          className="countdown-card p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={`flex items-center gap-2 mb-4 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Plus className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">{t("st_logSession")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
            <input
              type="text"
              placeholder={t("st_subjectPh")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-11 rounded-lg bg-secondary border border-border px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              min={1}
              placeholder={t("st_durationPh")}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
              className="h-11 w-full sm:w-32 rounded-lg bg-secondary border border-border px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={addSession}
              className="h-11 px-5 rounded-lg hero-gradient text-primary-foreground font-bold hover:scale-[1.02] transition-transform"
            >
              {t("st_add")}
            </button>
          </div>
        </motion.div>

        {/* Sessions list */}
        <motion.div
          className="countdown-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={`flex items-center gap-2 mb-4 ${isRtl ? "flex-row-reverse" : ""}`}>
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">{t("st_recent")}</span>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("st_empty")}</p>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-auto">
              <AnimatePresence>
                {sessions.slice(0, 20).map((s) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? -10 : 10 }}
                    className={`flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/60 border border-border/50 ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex-1 min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
                      <p className="font-semibold text-foreground truncate">{s.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.date).toLocaleString(
                          isRtl ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-GB",
                          { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary whitespace-nowrap">
                      {fmt(s.minutes)}
                    </span>
                    <button
                      onClick={() => removeSession(s.id)}
                      className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.div>
      </div>

      <motion.div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass-effect rounded-full px-4 py-2 flex gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
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

export default StudyTracker;
