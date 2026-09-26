import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/BrandLogo";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <motion.div className="max-w-lg text-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <BrandIcon className="mx-auto mb-6 h-20 w-20" />
        <h1 className="mb-4 font-display text-8xl font-extrabold text-gradient">404</h1>
        <div className="countdown-card mb-8 p-8">
          <p className="mb-3 text-2xl font-bold">{t("nf_title")}</p>
          <p className="text-muted-foreground">{t("nf_desc")}</p>
        </div>
        <Button asChild size="lg" className="bg-gradient-brand"><Link to="/"><Home />{t("nf_back")}</Link></Button>
      </motion.div>
    </section>
  );
};

export default NotFound;
