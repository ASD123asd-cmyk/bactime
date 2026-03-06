import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Particles from "@/components/Particles";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 px-4">
      <Particles />
      <div className="glow-effect fixed inset-0 pointer-events-none z-0" />

      <motion.div
        className="relative z-10 text-center max-w-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-8xl sm:text-9xl font-black text-gradient mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        >
          404
        </motion.h1>

        <motion.div
          className="countdown-card p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            الصفحة غير موجودة
          </p>
          <p className="text-muted-foreground text-sm sm:text-base">
            يبدو أنك ضللت الطريق... لكن لا تقلق، امتحان البكالوريا لا يزال في انتظارك! 📚
          </p>
        </motion.div>

        <motion.a
          href="/"
          className="inline-flex items-center gap-2 glass-effect rounded-xl px-6 py-3 font-semibold text-foreground hover:scale-105 transition-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏠 العودة إلى العد التنازلي
        </motion.a>
      </motion.div>
    </div>
  );
};

export default NotFound;
