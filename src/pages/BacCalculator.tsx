import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Target, History, Lightbulb, Trash2 } from "lucide-react";
import Particles from "@/components/Particles";
import { translations } from "@/lib/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface Subject {
  key: string;
  coef: number;
}

interface Stream {
  id: string;
  subjects: Subject[];
}

// Moroccan Bac approximate national exam coefficients per main stream.
const STREAMS: Stream[] = [
  {
    id: "sm",
    subjects: [
      { key: "math", coef: 9 },
      { key: "pc", coef: 7 },
      { key: "svt", coef: 3 },
      { key: "arabic", coef: 2 },
      { key: "french", coef: 4 },
      { key: "english", coef: 2 },
      { key: "philosophy", coef: 2 },
      { key: "islamic", coef: 2 },
      { key: "histgeo", coef: 2 },
      { key: "sport", coef: 1 },
    ],
  },
  {
    id: "pc",
    subjects: [
      { key: "math", coef: 7 },
      { key: "pc", coef: 7 },
      { key: "svt", coef: 3 },
      { key: "arabic", coef: 2 },
      { key: "french", coef: 4 },
      { key: "english", coef: 2 },
      { key: "philosophy", coef: 2 },
      { key: "islamic", coef: 2 },
      { key: "histgeo", coef: 2 },
      { key: "sport", coef: 1 },
    ],
  },
  {
    id: "svt",
    subjects: [
      { key: "math", coef: 5 },
      { key: "pc", coef: 5 },
      { key: "svt", coef: 7 },
      { key: "arabic", coef: 2 },
      { key: "french", coef: 4 },
      { key: "english", coef: 2 },
      { key: "philosophy", coef: 2 },
      { key: "islamic", coef: 2 },
      { key: "histgeo", coef: 2 },
      { key: "sport", coef: 1 },
    ],
  },
  {
    id: "se",
    subjects: [
      { key: "math", coef: 6 },
      { key: "econ", coef: 6 },
      { key: "accounting", coef: 4 },
      { key: "arabic", coef: 3 },
      { key: "french", coef: 4 },
      { key: "english", coef: 2 },
      { key: "philosophy", coef: 2 },
      { key: "islamic", coef: 2 },
      { key: "histgeo", coef: 3 },
      { key: "sport", coef: 1 },
    ],
  },
  {
    id: "lettres",
    subjects: [
      { key: "arabic", coef: 4 },
      { key: "french", coef: 4 },
      { key: "english", coef: 3 },
      { key: "philosophy", coef: 4 },
      { key: "histgeo", coef: 4 },
      { key: "islamic", coef: 2 },
      { key: "translation", coef: 2 },
      { key: "sport", coef: 1 },
    ],
  },
  {
    id: "humanities",
    subjects: [
      { key: "arabic", coef: 4 },
      { key: "french", coef: 3 },
      { key: "english", coef: 3 },
      { key: "philosophy", coef: 4 },
      { key: "histgeo", coef: 4 },
      { key: "islamic", coef: 2 },
      { key: "sociology", coef: 3 },
      { key: "sport", coef: 1 },
    ],
  },
];

interface Calc {
  id: string;
  date: string;
  streamId: string;
  average: number;
  mention: string;
}

const HISTORY_KEY = "bacCalcHistory";
const GRADES_KEY = "bacCalcGrades";
const STREAM_KEY = "bacCalcStream";

const loadHistory = (): Calc[] => {
  try {
    const s = localStorage.getItem(HISTORY_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};

const BacCalculator = () => {
  const { lang, isRtl } = useLanguage();
  const [streamId, setStreamId] = useState<string>(() => localStorage.getItem(STREAM_KEY) || "pc");
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    try {
      const s = localStorage.getItem(GRADES_KEY);
      if (s) return JSON.parse(s);
    } catch {}
    return {};
  });
  const [target, setTarget] = useState<number>(14);
  const [history, setHistory] = useState<Calc[]>(loadHistory);

  const tr = translations[lang];
  const t = (key: string) => {
    const v = tr[key];
    return typeof v === "string" ? v : "";
  };

  // SEO meta
  useEffect(() => {
    const title = t("bc_metaTitle") || "Bac Grade Calculator";
    const desc = t("bc_metaDesc") || "";
    document.title = title;
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", desc);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:url", "https://bactime.lovable.app/bac-calculator", "property");
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://bactime.lovable.app/bac-calculator";
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
    } catch {}
  }, [grades]);

  useEffect(() => {
    try {
      localStorage.setItem(STREAM_KEY, streamId);
    } catch {}
  }, [streamId]);

  const stream = useMemo(() => STREAMS.find((s) => s.id === streamId) || STREAMS[1], [streamId]);

  const { avg, totalCoef, filledCoef, remainingCoef, filledSum, mention } = useMemo(() => {
    let totalCoef = 0;
    let filledCoef = 0;
    let filledSum = 0;
    for (const sub of stream.subjects) {
      totalCoef += sub.coef;
      const v = parseFloat(grades[sub.key] ?? "");
      if (!isNaN(v) && v >= 0 && v <= 20) {
        filledCoef += sub.coef;
        filledSum += v * sub.coef;
      }
    }
    const avg = filledCoef > 0 ? filledSum / filledCoef : 0;
    const remainingCoef = totalCoef - filledCoef;
    let mention = "";
    if (filledCoef > 0) {
      if (avg >= 16) mention = t("bc_mentionExcellent");
      else if (avg >= 14) mention = t("bc_mentionVeryGood");
      else if (avg >= 12) mention = t("bc_mentionGood");
      else if (avg >= 10) mention = t("bc_mentionPass");
      else mention = t("bc_mentionFail");
    }
    return { avg, totalCoef, filledCoef, remainingCoef, filledSum, mention };
  }, [grades, stream, lang]);

  const requiredAvg = useMemo(() => {
    if (remainingCoef <= 0) return null;
    const need = (target * totalCoef - filledSum) / remainingCoef;
    return need;
  }, [target, totalCoef, filledSum, remainingCoef]);

  const saveCalc = () => {
    if (filledCoef === 0) {
      toast(t("bc_addAtLeastOne"));
      return;
    }
    const calc: Calc = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      streamId,
      average: avg,
      mention,
    };
    const next = [calc, ...history].slice(0, 10);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
    toast(t("bc_saved"));
  };

  const reset = () => {
    setGrades({});
    toast(t("bc_reset"));
  };

  const removeHistory = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  const tips: string[] = Array.isArray(tr["bc_tips"]) ? (tr["bc_tips"] as string[]) : [];

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden pb-12 pt-10">
      <Particles />
      <div className="glow-effect fixed inset-0 pointer-events-none z-0" />

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
            {t("bc_title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            {t("bc_subtitle")}
          </p>
        </motion.div>

        {/* Stream selector */}
        <motion.section
          className="countdown-card p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className={`text-sm font-bold text-foreground mb-3 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Calculator className="w-4 h-4 text-primary" />
            {t("bc_pickStream")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STREAMS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStreamId(s.id)}
                className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  streamId === s.id
                    ? "hero-gradient text-primary-foreground border-transparent shadow-lg"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`bc_stream_${s.id}`)}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Grades input */}
        <motion.section
          className="countdown-card p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`flex items-center justify-between mb-4 ${isRtl ? "flex-row-reverse" : ""}`}>
            <h2 className="text-sm font-bold text-foreground">{t("bc_enterGrades")}</h2>
            <button
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              {t("bc_clear")}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stream.subjects.map((sub) => (
              <div
                key={sub.key}
                className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/60 border border-border/50 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex-1 min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
                  <p className="font-semibold text-sm text-foreground truncate">{t(`bc_sub_${sub.key}`)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("bc_coef")}: <span className="text-primary font-bold">{sub.coef}</span>
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.25}
                  inputMode="decimal"
                  aria-label={t(`bc_sub_${sub.key}`)}
                  placeholder="/20"
                  value={grades[sub.key] ?? ""}
                  onChange={(e) =>
                    setGrades((prev) => ({ ...prev, [sub.key]: e.target.value }))
                  }
                  className="w-20 h-10 rounded-lg bg-background border border-border px-2 text-center text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Result */}
        <motion.section
          className="countdown-card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              {t("bc_weightedAvg")}
            </p>
            <p className="text-5xl sm:text-6xl font-black text-gradient">
              {avg.toFixed(2)}
              <span className="text-2xl text-muted-foreground font-bold">/20</span>
            </p>
            {mention && (
              <p className="text-sm font-bold text-primary">{mention}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("bc_filledOf")}: {filledCoef}/{totalCoef}
            </p>
          </div>

          <div className="flex gap-3 mt-5 justify-center">
            <button
              onClick={saveCalc}
              className="px-5 h-10 rounded-lg hero-gradient text-primary-foreground font-bold hover:scale-[1.02] transition-transform"
            >
              {t("bc_save")}
            </button>
          </div>
        </motion.section>

        {/* Target */}
        <motion.section
          className="countdown-card p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className={`text-sm font-bold text-foreground mb-3 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Target className="w-4 h-4 text-primary" />
            {t("bc_targetAvg")}
          </h2>
          <div className={`flex items-center gap-3 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <input
              type="range"
              aria-label={t("bc_targetAvg")}
              min={10}
              max={20}
              step={0.5}
              value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-16 text-center font-black text-lg text-primary">
              {target.toFixed(1)}
            </span>
          </div>
          {remainingCoef <= 0 ? (
            <p className="text-sm text-muted-foreground text-center">{t("bc_allFilled")}</p>
          ) : requiredAvg !== null && (
            <div className="p-4 rounded-xl bg-secondary/60 border border-border/50 text-center">
              {requiredAvg > 20 ? (
                <p className="text-sm font-bold text-destructive">{t("bc_unreachable")}</p>
              ) : requiredAvg < 0 ? (
                <p className="text-sm font-bold text-primary">{t("bc_alreadyReached")}</p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-1">{t("bc_needAvg")}</p>
                  <p className="text-3xl font-black text-gradient">
                    {requiredAvg.toFixed(2)}<span className="text-lg text-muted-foreground">/20</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("bc_onRemaining")} ({remainingCoef} {t("bc_coef")})
                  </p>
                </>
              )}
            </div>
          )}
        </motion.section>

        {/* Tips */}
        {tips.length > 0 && (
          <motion.section
            className="countdown-card p-5 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className={`text-sm font-bold text-foreground mb-3 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <Lightbulb className="w-4 h-4 text-primary" />
              {t("bc_tipsTitle")}
            </h2>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className={`text-sm text-muted-foreground p-2.5 rounded-lg bg-secondary/40 ${isRtl ? "text-right" : "text-left"}`}
                >
                  {tip}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* History */}
        <motion.section
          className="countdown-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className={`text-sm font-bold text-foreground mb-3 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <History className="w-4 h-4 text-primary" />
            {t("bc_history")}
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t("bc_noHistory")}</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li
                  key={h.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/60 border border-border/50 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex-1 min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
                    <p className="text-sm font-semibold text-foreground">
                      {t(`bc_stream_${h.streamId}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.date).toLocaleString(
                        isRtl ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-GB",
                        { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
                      )}
                      {h.mention && ` · ${h.mention}`}
                    </p>
                  </div>
                  <span className="text-lg font-black text-primary whitespace-nowrap">
                    {h.average.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeHistory(h.id)}
                    aria-label={t("bc_deleteHistory") || "Delete"}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>

    </div>
  );
};

export default BacCalculator;
