import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import Button from "../ui/Button";
import AnimatedShaderBackground from "../ui/AnimatedShaderBackground";
import { MatrixText } from "../ui/matrix-text";
import { HeroShield, HeroBug } from "./HeroGraphics";

export default function Hero() {
  const { t } = useLocale();
  return (
    <section className="hero-section group relative min-h-screen flex flex-col items-center justify-center px-0 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground />
      </div>
      <HeroShield />
      <HeroBug />
      <div className="relative z-10 text-center w-full px-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Shield className="w-4 h-4 text-vg-accent" />
          <span className="text-sm text-vg-muted">Цифровая защита 24/7</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-vg-accent to-white bg-clip-text text-transparent flex flex-wrap justify-center"
        >
          <MatrixText
            text={t("landing.hero_title")}
            initialDelay={400}
            letterAnimationDuration={500}
            letterInterval={80}
            repeatInterval={5000}
          />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-vg-muted mb-10 max-w-2xl mx-auto"
        >
          {t("landing.hero_subtitle")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register">
            <Button size="lg">{t("landing.cta_start")}</Button>
          </Link>
          <a href="#how">
            <Button variant="secondary" size="lg">{t("landing.cta_how")}</Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
