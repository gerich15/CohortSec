import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ScrollReveal from "../animations/ScrollReveal";
import HygieneVisualization from "../effects/HygieneVisualization";

function AnimatedStat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="border-l-4 border-primary pl-6 py-3 my-4"
    >
      <span className="block text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {value}
      </span>
      <span className="text-vg-muted text-sm">{label}</span>
    </motion.div>
  );
}

export default function DigitalHygiene() {
  return (
    <section
      className="py-24 px-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0F 0%, rgba(0,255,170,0.02) 30%, rgba(59,130,246,0.03) 70%, #0A0A0F 100%)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="w-full relative px-3">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Сетевая гигиена — это просто
              </h2>
              <p className="text-lg text-vg-muted mb-6">
                Точно так же, как ты моешь руки и чистишь зубы, твои цифровые аккаунты нуждаются в ежедневной гигиене.
              </p>
            </ScrollReveal>
            <AnimatedStat value="90%" label="взломов происходит из-за слабых паролей" delay={0.1} />
            <AnimatedStat value="2x" label="чаще взламывают тех, кто не обновляет ПО" delay={0.2} />
            <ScrollReveal delay={0.3}>
              <p className="text-vg-muted mt-6">
                CohortSec автоматизирует цифровую гигиену: мы следим, чтобы твои пароли были надёжными, входы — безопасными, а данные — в сохранности.
              </p>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <HygieneVisualization />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
