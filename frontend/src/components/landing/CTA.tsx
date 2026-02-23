import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocale } from "../../hooks/useLocale";
import Button from "../ui/Button";

export default function CTA() {
  const { t } = useLocale();

  return (
    <section
      className="py-24 px-0 relative"
      style={{
        background: "linear-gradient(180deg, #0A0A0F 0%, rgba(0,255,170,0.03) 30%, rgba(139,92,246,0.03) 70%, #0A0A0F 100%)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-vg-accent/10 to-transparent pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full text-center px-3"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {t("landing.cta_title")}
        </h2>
        <Link to="/register">
          <Button size="lg" className="text-lg px-8 py-4">
            {t("landing.cta_btn")}
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
