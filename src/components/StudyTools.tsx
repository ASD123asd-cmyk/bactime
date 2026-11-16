import { ArrowLeft, ArrowRight, BookOpen, Calculator, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StudyTools() {
  const { t, isRtl } = useLanguage();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const tools = [
    { path: "/focus", icon: Timer, title: "pomodoroTitle", desc: "pomodoroDesc", action: "focusAction", kind: "focus" },
    { path: "/study-tracker", icon: BookOpen, title: "st_title", desc: "st_subtitle", action: "trackerAction", kind: "tracker" },
    { path: "/bac-calculator", icon: Calculator, title: "bc_title", desc: "bc_subtitle", action: "calculatorAction", kind: "calculator" },
  ];
  return <section id="tools" className="page-container tools-section">
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><p className="eyebrow mb-3">{t("toolsEyebrow")}</p><h2 className="section-heading">{t("toolsHeading")}</h2></div>
      <p className="max-w-sm text-sm leading-7 text-muted-foreground">{t("toolsIntro")}</p>
    </div>
    <div className="tools-grid">
      {tools.map((tool, i) => <Link to={tool.path} key={tool.path} className={`tool-panel tool-${tool.kind} group`}>
        <div className="flex items-center justify-between"><tool.icon className="size-6 text-primary" /><span className="font-display text-xs text-muted-foreground">0{i + 1}</span></div>
        <div className={`tool-motif motif-${tool.kind}`} aria-hidden="true">{tool.kind === "focus" ? <span className="focus-dial"><Timer /></span> : tool.kind === "tracker" ? <span className="study-lines"><i /><i /><i /><i /></span> : <span className="grade-motif"><span>−−</span><span>/20</span></span>}</div>
        <h3 className="text-lg font-medium">{t(tool.title)}</h3>
        <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">{t(tool.desc)}</p>
        <span className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-sm font-medium text-primary">{t(tool.action)}<Arrow className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
      </Link>)}
    </div>
  </section>;
}
