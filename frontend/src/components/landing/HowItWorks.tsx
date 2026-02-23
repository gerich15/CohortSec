import { motion } from "framer-motion";
import { Mail, ShieldCheck, Zap } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import ScrollReveal from "../animations/ScrollReveal";

const steps = [
  { icon: Mail, titleKey: "how_step1", descKey: "how_step1_desc" },
  { icon: ShieldCheck, titleKey: "how_step2", descKey: "how_step2_desc" },
  { icon: Zap, titleKey: "how_step3", descKey: "how_step3_desc" },
];

export default function HowItWorks() {
  const { t } = useLocale();
  return (
    <section
      id="how"
      className="py-24 px-0 relative"
      style={{
        background: "linear-gradient(180deg, #0A0A0F 0%, rgba(59,130,246,0.04) 50%, #0A0A0F 100%)",
      }}
    >
      <div className="w-full px-3">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">{t("landing.how_title")}</h2>
        </ScrollReveal>
        <div className="space-y-12">
          {steps.map(({ icon: Icon, titleKey, descKey }, i) => (
            <ScrollReveal key={titleKey} delay={i * 0.15}>
              <div className="flex gap-6 items-start">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex-shrink-0 w-14 h-14 rounded-full glass flex items-center justify-center border border-vg-accent/30"
                >
                  <Icon className="w-7 h-7 text-vg-accent" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t("landing." + titleKey)}</h3>
                  <p className="text-vg-muted">{t("landing." + descKey)}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
