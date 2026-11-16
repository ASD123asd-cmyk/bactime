import { type ReactNode, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, Calculator, Home, Instagram, TimerReset } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";
import { cn } from "@/lib/utils";

const languages: { code: Language; label: string; name: string }[] = [
  { code: "ar", label: "ع", name: "العربية" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "en", label: "EN", name: "English" },
];
const navItems = [
  { to: "/", key: "navHome", icon: Home },
  { to: "/focus", key: "focusNav", icon: TimerReset },
  { to: "/study-tracker", key: "trackerNav", icon: BookOpen },
  { to: "/bac-calculator", key: "calculatorNav", icon: Calculator },
];

const AppShell = ({ children }: { children: ReactNode }) => {
  const { lang, setLang, t, isRtl } = useLanguage();
  const location = useLocation();
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

  return (
    <div className="app-shell" dir={isRtl ? "rtl" : "ltr"}>
      <a className="skip-link" href="#main-content">{t("skipContent")}</a>
      <header className="site-header">
        <div className="page-container flex min-h-20 items-center justify-between gap-4">
          <Link to="/" aria-label="BacTime" className="shrink-0"><BrandLogo className="h-10 sm:h-12" /></Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label={t("navMain")}>
            {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => cn("desktop-nav-link", isActive && "is-active")}>{t(item.key)}</NavLink>)}
          </nav>
          <div className="flex shrink-0 items-center gap-4">
            <ToggleGroup type="single" value={lang} onValueChange={value => value && setLang(value as Language)} aria-label={t("language")} dir="ltr" className="language-switch" size="sm">
              {languages.map(item => <ToggleGroupItem value={item.code} key={item.code} aria-label={item.name}>{item.label}</ToggleGroupItem>)}
            </ToggleGroup>
            <div className="hidden xl:block"><Button asChild><Link to="/focus">{t("startNow")}</Link></Button></div>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">{children}</main>
      <footer className="site-footer">
        <div className="page-container flex flex-col justify-between gap-8 py-10 md:flex-row">
          <div className="max-w-sm"><BrandLogo /><p className="mt-4 text-sm leading-7 text-muted-foreground">{t("footerDescription")}</p></div>
          <nav aria-label={t("quickLinks")} className="flex flex-wrap content-start items-start gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {navItems.map(item => <Link key={item.to} to={item.to} className="py-2 hover:text-primary">{t(item.key)}</Link>)}
          </nav>
        </div>
        <div className="page-container flex flex-wrap items-center justify-between gap-4 border-t border-border/70 py-5 text-xs text-muted-foreground">
          <span dir="ltr">© {new Date().getFullYear()} BacTime</span>
          <a href="https://www.instagram.com/_hamza__ai/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary"><Instagram className="size-4" />{t("developer")} · <bdi>@_hamza__ai</bdi></a>
        </div>
      </footer>
      <nav className="mobile-nav" aria-label={t("navMain")}>
        {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => cn("mobile-nav-link", isActive && "is-active")}><item.icon className="size-5" /><span>{t(item.key)}</span></NavLink>)}
      </nav>
    </div>
  );
};

export default AppShell;
