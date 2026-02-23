import { motion } from "framer-motion";
import {
  Users,
  Brain,
  Image,
  ScanFace,
  Gauge,
  AlertTriangle,
} from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import Card from "../ui/Card";
import ScrollReveal from "../animations/ScrollReveal";

const icons = [
  Users,
  Brain,
  Image,
  ScanFace,
  Gauge,
  AlertTriangle,
];

const featureKeys = [
  ["feature_family", "feature_family_desc"],
  ["feature_predict", "feature_predict_desc"],
  ["feature_backup", "feature_backup_desc"],
  ["feature_biometric", "feature_biometric_desc"],
  ["feature_score", "feature_score_desc"],
  ["feature_emergency", "feature_emergency_desc"],
];

export default function Features() {
  const { t } = useLocale();

  return (
    <section
      id="features"
      className="py-24 px-0 relative"
      style={{
        background: "linear-gradient(180deg, #0A0A0F 0%, rgba(0,255,170,0.03) 30%, #0A0A0F 100%)",
      }}
    >
      <div className="w-full px-3">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.features_title")}
          </h2>
          <p className="text-vg-muted text-lg max-w-2xl mx-auto">
            {t("landing.features_subtitle")}
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map(([titleKey, descKey], i) => {
            const Icon = icons[i];
            return (
              <ScrollReveal key={titleKey} delay={i * 0.1}>
                <Card className="group">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-lg bg-vg-accent/20 flex items-center justify-center mb-4 group-hover:shadow-glow"
                  >
                    <Icon className="w-6 h-6 text-vg-accent" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t(`landing.${titleKey}`)}
                  </h3>
                  <p className="text-vg-muted">
                    {t(`landing.${descKey}`)}
                  </p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
