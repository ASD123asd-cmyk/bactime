import Pomodoro from "@/components/Pomodoro";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const META = {
  ar: { title: "مؤقت بومودورو للمراجعة | BacTime", desc: "مؤقت بومودورو مجاني لتلاميذ البكالوريا: حدد مدة الجلسات وعددها مع استراحات تلقائية وتنبيه صوتي." },
  fr: { title: "Minuteur Pomodoro pour réviser | BacTime", desc: "Minuteur Pomodoro gratuit pour le bac : choisissez la durée et le nombre de sessions, pauses automatiques et alerte sonore." },
  en: { title: "Pomodoro Study Timer | BacTime", desc: "Free Pomodoro timer for Bac students: set session length and count, with automatic breaks and sound alerts." },
};

const Focus = () => {
  const { lang, isRtl, t } = useLanguage();
  usePageMeta(META[lang].title, META[lang].desc, "/focus");

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-20 lg:pt-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t("pomodoroTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("pomodoroDesc")}</p>
      <Pomodoro isRtl={isRtl} t={t} />
    </div>
  );
};

export default Focus;
