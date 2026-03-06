import { motion, AnimatePresence } from "framer-motion";

interface CountdownUnitProps {
  value: number;
  label: string;
}

const CountdownUnit = ({ value, label }: CountdownUnitProps) => {
  return (
    <motion.div
      className="countdown-card flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-w-[80px] sm:min-w-[110px] md:min-w-[140px] transition-shadow duration-300"
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gradient tabular-nums"
          initial={{ y: -20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
      <span className="text-xs sm:text-sm md:text-base font-semibold text-muted-foreground mt-2 uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );
};

export default CountdownUnit;
