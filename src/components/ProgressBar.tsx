import { motion } from "framer-motion";

interface ProgressBarProps {
  label: string;
  percentage: number;
  isRtl: boolean;
}

const ProgressBar = ({ label, percentage, isRtl }: ProgressBarProps) => {
  const displayPercent = Math.min(100, Math.max(0, percentage)).toFixed(1);

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto mt-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <div className="countdown-card p-5 space-y-3">
        <div className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-sm font-bold text-primary">{displayPercent}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full hero-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <div className={`flex justify-between text-xs text-muted-foreground ${isRtl ? "flex-row-reverse" : ""}`}>
          <span>{isRtl ? "البداية" : "Start"}</span>
          <span>{isRtl ? "يوم الامتحان" : "Exam Day"}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressBar;
