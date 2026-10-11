import { useEffect } from "react";
import Pomodoro from "@/components/Pomodoro";
import { useLanguage } from "@/contexts/LanguageContext";

const Focus = () => {
  const { isRtl, t } = useLanguage();

  useEffect(() => {
    const prev = document.title;
    document.title = `${t("pomodoroTitle")} | BacTime`;
    return () => { document.title = prev; };
  }, [t]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-20 lg:pt-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t("pomodoroTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("pomodoroDesc")}</p>
      <Pomodoro isRtl={isRtl} t={t} />
    </div>
  );
};

export default Focus;
