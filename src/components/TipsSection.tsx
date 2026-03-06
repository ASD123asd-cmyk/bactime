import { motion } from "framer-motion";
import { Lightbulb, BookOpen } from "lucide-react";

interface TipsSectionProps {
  tipsTitle: string;
  tips: string[];
  subjectsTitle: string;
  subjects: string[];
  isRtl: boolean;
}

const TipsSection = ({ tipsTitle, tips, subjectsTitle, subjects, isRtl }: TipsSectionProps) => {
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto mt-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      {/* Tips */}
      <div className="countdown-card p-6 space-y-4">
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
          <Lightbulb className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{tipsTitle}</h2>
        </div>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <motion.li
              key={i}
              className={`text-sm text-muted-foreground leading-relaxed ${isRtl ? "text-right" : "text-left"}`}
              initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              {tip}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Subjects */}
      <div className="countdown-card p-6 space-y-4">
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{subjectsTitle}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject, i) => (
            <motion.span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.08 }}
              whileHover={{ scale: 1.05 }}
            >
              {subject}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TipsSection;
