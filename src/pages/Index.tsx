import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Palette, Sun, Moon, TreePine, Sunset } from "lucide-react";
import CountdownUnit from "@/components/CountdownUnit";
import Particles from "@/components/Particles";
import { useCountdown } from "@/hooks/useCountdown";
import { translations, type Language } from "@/lib/translations";

type Theme = "light" | "dark" | "sunset" | "forest";

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  sunset: Sunset,
  forest: TreePine,
};

const Index = () => {
  const [lang, setLang] = useState<Language>("ar");
  const [theme, setTheme] = useState<Theme>("light");
  const [showControls, setShowControls] = useState(false);
  const t = translations[lang];
  const isRtl = lang === "ar";
  const timeLeft = useCountdown();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-sunset", "theme-forest");
    root.removeAttribute("dir");

    if (theme === "dark") root.classList.add("dark");
    else if (theme === "sunset") root.classList.add("theme-sunset");
    else if (theme === "forest") root.classList.add("theme-forest");

    if (isRtl) root.setAttribute("dir", "rtl");
    else root.setAttribute("dir", "ltr");
  }, [theme, isRtl]);

  const themes: Theme[] = ["light", "dark", "sunset", "forest"];
  const languages: { code: Language; label: string }[] = [
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-500">
      <Particles />

      {/* Glow effect */}
      <div className="glow-effect fixed inset-0 pointer-events-none z-0" />

      {/* Controls */}
      <motion.div
        className="fixed top-4 right-4 z-50 flex gap-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => setShowControls(!showControls)}
          className="glass-effect rounded-xl p-3 hover:scale-105 transition-transform"
        >
          <Palette className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => {
            const idx = languages.findIndex((l) => l.code === lang);
            setLang(languages[(idx + 1) % languages.length].code);
          }}
          className="glass-effect rounded-xl p-3 hover:scale-105 transition-transform"
        >
          <Globe className="w-5 h-5 text-foreground" />
        </button>
      </motion.div>

      {/* Theme selector dropdown */}
      {showControls && (
        <motion.div
          className="fixed top-16 right-4 z-50 glass-effect rounded-xl p-3 flex flex-col gap-2"
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          {themes.map((t) => {
            const Icon = themeIcons[t];
            return (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  setShowControls(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === t
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {translations[lang][t]}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 max-w-4xl w-full">
        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gradient leading-tight mb-3"
            style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)" }}
          >
            {t.title}
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t.subtitle}
          </motion.p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          className={`flex gap-3 sm:gap-4 md:gap-6 mb-10 ${isRtl ? "flex-row-reverse" : ""}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CountdownUnit value={timeLeft.days} label={t.days} />
          <CountdownUnit value={timeLeft.hours} label={t.hours} />
          <CountdownUnit value={timeLeft.minutes} label={t.minutes} />
          <CountdownUnit value={timeLeft.seconds} label={t.seconds} />
        </motion.div>

        {/* Info */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            📅 {t.examDate}
          </p>
          <motion.p
            className="text-base sm:text-lg font-semibold text-foreground"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            {t.motivation}
          </motion.p>
          <p className="text-sm text-muted-foreground">{t.goodLuck}</p>
        </motion.div>
      </div>

      {/* Language indicator */}
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
