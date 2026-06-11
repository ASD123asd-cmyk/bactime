import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Bell, X, Plus, Check } from "lucide-react";

interface Props {
  targetDate: Date;
  onSave: (date: Date) => void;
  reminders: number[]; // offsets in minutes before exam
  onRemindersChange: (r: number[]) => void;
  notifEnabled: boolean;
  onToggleNotif: (v: boolean) => void;
  isRtl: boolean;
  t: (k: string) => string;
}

const PRESETS = [60, 30, 10, 5, 1];

const pad = (n: number) => n.toString().padStart(2, "0");
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const ExamSettings = ({
  targetDate,
  onSave,
  reminders,
  onRemindersChange,
  notifEnabled,
  onToggleNotif,
  isRtl,
  t,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [dateStr, setDateStr] = useState(toLocalInput(targetDate));
  const [customMin, setCustomMin] = useState("");

  const save = () => {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) onSave(d);
  };

  const toggleReminder = (m: number) => {
    if (reminders.includes(m)) onRemindersChange(reminders.filter((r) => r !== m));
    else onRemindersChange([...reminders, m].sort((a, b) => b - a));
  };

  const addCustom = () => {
    const v = parseInt(customMin);
    if (!isNaN(v) && v > 0 && !reminders.includes(v)) {
      onRemindersChange([...reminders, v].sort((a, b) => b - a));
      setCustomMin("");
    }
  };

  const requestNotif = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      onToggleNotif(!notifEnabled);
      return;
    }
    const perm = await Notification.requestPermission();
    onToggleNotif(perm === "granted");
  };

  const formatOffset = (m: number) => {
    if (m >= 60 && m % 60 === 0) return `${m / 60} ${t("hoursShort")}`;
    if (m >= 60) return `${Math.floor(m / 60)}${t("hoursShort")} ${m % 60}${t("minutesShort")}`;
    return `${m} ${t("minutesShort")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="countdown-card w-full p-4 flex items-center justify-between gap-3 hover:scale-[1.01] transition-transform"
      >
        <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">{t("examSettingsTitle")}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {targetDate.toLocaleString(isRtl ? "ar-MA" : "en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="countdown-card mt-3 p-5 space-y-5">
              {/* Date picker */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground block">
                  {t("pickExamDate")}
                </label>
                <div className={`flex gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <input
                    type="datetime-local"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={save}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    {t("save")}
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{t("remindersTitle")}</span>
                  </div>
                  <button
                    onClick={requestNotif}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      notifEnabled
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {notifEnabled ? t("notifEnabled") : t("notifEnable")}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">{t("remindersDesc")}</p>

                <div className={`flex flex-wrap gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  {PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleReminder(m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        reminders.includes(m)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {formatOffset(m)}
                    </button>
                  ))}
                </div>

                {reminders.filter((r) => !PRESETS.includes(r)).length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                    {reminders
                      .filter((r) => !PRESETS.includes(r))
                      .map((m) => (
                        <span
                          key={m}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground flex items-center gap-1"
                        >
                          {formatOffset(m)}
                          <button onClick={() => toggleReminder(m)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}

                <div className={`flex gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <input
                    type="number"
                    min={1}
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    placeholder={t("customReminderPlaceholder")}
                    className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={addCustom}
                    className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t("add")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamSettings;
