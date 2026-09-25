import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Language } from "@/lib/translations";

const STORAGE_KEY = "bactime-lang";

interface LanguageContextValue {
  lang: Language;
  setLang: (language: Language) => void;
  isRtl: boolean;
  t: (key: string) => string;
  arr: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const getInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "fr" || saved === "en") return saved;
  } catch {}
  return "ar";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const isRtl = lang === "ar";

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, [lang, isRtl]);

  const value = useMemo<LanguageContextValue>(() => ({
    lang,
    setLang,
    isRtl,
    t: (key) => {
      const value = translations[lang][key];
      return typeof value === "string" ? value : "";
    },
    arr: (key) => {
      const value = translations[lang][key];
      return Array.isArray(value) ? value : [];
    },
  }), [lang, isRtl]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
