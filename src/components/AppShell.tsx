import { type ReactNode, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, Calculator, Clock3, Home, Instagram, Languages, TimerReset, Volume2, VolumeX } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  soundOn?: boolean;
  onSoundToggle?: () => void;
}

const languages: { code: Language; label: string }[] = [
  { code: "ar", label: "ع" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

const navItems = [
  { to: "/", key: "navHome", icon: Home },
  { to: "/focus", key: "pomodoroTitle", icon: TimerReset },
  { to: "/study-tracker", key: "st_open", icon: BookOpen },
  { to: "/bac-calculator", key: "bc_open", icon: Calculator },
];

const AppShell = ({ children, soundOn, onSoundToggle }: AppShellProps) => {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = location.hash.slice(1);
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (tries++ < 20) setTimeout(tick, 100);
    };
    tick();
  }, [location.pathname, location.hash, location.key]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 hidden h-16 border-b border-border/80 bg-background/90 backdrop-blur-xl lg:block">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <Link to="/" aria-label="BacTime"><BrandLogo /></Link>
          <nav className="flex items-center gap-1" aria-label={t("navMain")}>
            {navItems.map((item) => {
              const active = item.to === "/" ? location.pathname === "/" : location.pathname === item.to;
              return (
                <NavLink key={item.key} to={item.to} className={cn("rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", active && "bg-secondary text-primary")}>
                  {t(item.key)}
                </NavLink>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border border-border bg-secondary p-1" aria-label={t("language")}>
              <Languages className="mx-2 h-4 w-4 text-muted-foreground" />
              {languages.map((item) => (
                <Button key={item.code} variant={lang === item.code ? "default" : "ghost"} size="sm" onClick={() => setLang(item.code)} className="h-7 px-2 text-xs">
                  {item.label}
                </Button>
              ))}
            </div>
            {onSoundToggle && (
              <Button variant="outline" size="icon" onClick={onSoundToggle} aria-label={t("sound")}>
                {soundOn ? <Volume2 /> : <VolumeX />}
              </Button>
            )}
            <Button asChild className="bg-gradient-brand hover:opacity-90">
              <Link to="/#countdown">{t("startNow")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-0 lg:pt-16">{children}</main>

      <footer className="border-t border-border bg-card/70 pb-24 pt-10 lg:pb-0 lg:pt-0">
        {/* Mobile footer */}
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 lg:hidden">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">{t("footerDescription")}</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold text-foreground">{t("quickLinks")}</p>
            <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
              <Link to="/study-tracker" className="hover:text-primary">{t("st_open")}</Link>
              <Link to="/bac-calculator" className="hover:text-primary">{t("bc_open")}</Link>
              <Link to="/focus" className="hover:text-primary">{t("pomodoroTitle")}</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold text-foreground">{t("developer")}</p>
            <a href="https://www.instagram.com/_hamza__ai/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Instagram className="h-4 w-4" /> @_hamza__ai
            </a>
          </div>
        </div>

        {/* Desktop footer */}
        <div className="hidden lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-8">
            <div className="flex items-center gap-5">
              <BrandLogo />
              <span className="h-10 w-px bg-border" />
              <p className="max-w-xs text-sm leading-6 text-muted-foreground">{t("footerDescription")}</p>
            </div>
            <nav className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1" aria-label={t("quickLinks")}>
              {[
                { to: "/", label: t("navHome") },
                { to: "/#tools", label: t("navTools") },
                { to: "/focus", label: t("pomodoroTitle") },
                { to: "/study-tracker", label: t("st_open") },
                { to: "/bac-calculator", label: t("bc_open") },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-primary">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-border/60">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} BacTime</span>
              <a href="https://www.instagram.com/_hamza__ai/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                <Instagram className="h-4 w-4" /> {t("developer")} · @_hamza__ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden" aria-label={t("navMain")}>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.to === "/" ? location.pathname === "/" : location.pathname === item.to;
            return (
              <Link key={item.key} to={item.to} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-semibold text-muted-foreground", active && "bg-primary/10 text-primary")}>
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
