import { CalendarDays, Volume2, VolumeX } from "lucide-react";
import Counter from "@/components/Counter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  timeLeft: { days: number; hours: number; minutes: number; seconds: number; totalMs: number };
  targetDate: Date;
  sound: boolean;
  onSoundToggle: () => void;
  motivation: string;
}

export default function ExamCountdown({ timeLeft, targetDate, sound, onSoundToggle, motivation }: Props) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-GB";
  const units = ["days", "hours", "minutes", "seconds"] as const;
  return <section id="countdown" className="exam-countdown" aria-labelledby="countdown-title">
    <div className="flex items-start justify-between gap-3">
      <div><p className="eyebrow mb-2">{t("countdownEyebrow")}</p><h2 id="countdown-title" className="text-xl font-medium">{t("nationalExam")}</h2></div>
      <Button variant="ghost" size="icon" onClick={onSoundToggle} aria-label={t(sound ? "soundOn" : "soundOff")} aria-pressed={sound}>{sound ? <Volume2 /> : <VolumeX />}</Button>
    </div>
    <p className="mb-6 mt-2 text-sm text-muted-foreground">{t("remaining")}</p>
    <div className="digit-groups" dir="ltr" role="timer" aria-live="off" data-nosnippet>
      {units.map((unit, index) => <div className="digit-unit" key={unit}>
        {index > 0 && <span className="digit-separator" aria-hidden="true">:</span>}
        <Counter value={timeLeft[unit]} minDigits={2} format={{ useGrouping: false }} direction="down" intro={false} motionBlur={false} duration={0.45} bounce={0} stagger={0.015} fade={0} fontSize="var(--digit-size)" fontWeight={500} gap={4} />
        <span className="digit-label" dir="auto">{t(unit)}</span>
      </div>)}
    </div>
    <div className="mt-7 flex items-start gap-2 border-t border-border/80 pt-5 text-sm">
      <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
      <div><time dateTime={targetDate.toISOString()}>{targetDate.toLocaleDateString(locale, { timeZone: "Africa/Casablanca", year: "numeric", month: "long", day: "numeric" })}</time><p className="mt-1 text-xs text-muted-foreground">{t("casablanca")}</p></div>
    </div>
    <p className="mt-5 min-h-12 text-sm leading-6 text-primary" data-nosnippet>{timeLeft.totalMs === 0 ? t("examReached") : motivation.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "").trim()}</p>
  </section>;
}
