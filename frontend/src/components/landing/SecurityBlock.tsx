import { motion } from "framer-motion";
import { Lock, Fingerprint, Database, Brain } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import ScrollReveal from "../animations/ScrollReveal";

const techItems = [
  { icon: Lock, key: "tech_encryption" },
  { icon: Fingerprint, key: "tech_biometric" },
  { icon: Database, key: "tech_backup" },
  { icon: Brain, key: "tech_ml" },
];

export default function SecurityBlock() {
  const { t } = useLocale();
  return (
    <section
      className="py-24 px-0 relative"
      style={{
        background: "linear-gradient(180deg, #0A0A0F 0%, rgba(139,92,246,0.04) 40%, #0A0A0F 100%)",
      }}
    >
      <div className="w-full px-3">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">{t("landing.tech_title")}</h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {techItems.map(({ icon: Icon, key }, i) => (
            <ScrollReveal key={key} delay={i * 0.1}>
              <motion.div whileHover={{ y: -5 }} className="glass rounded-xl p-6 text-center">
                <Icon className="w-10 h-10 text-vg-accent mx-auto mb-3" />
                <p className="text-sm text-vg-muted">{t("landing." + key)}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
