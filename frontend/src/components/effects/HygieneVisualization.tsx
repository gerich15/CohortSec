import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Lock, RefreshCw, ClipboardCheck, Sparkles } from "lucide-react";

const hygieneRules = [
  { icon: Lock, label: "Уникальные пароли для каждого сервиса" },
  { icon: RefreshCw, label: "Регулярное обновление ПО" },
  { icon: ClipboardCheck, label: "Проверка утечек раз в месяц" },
  { icon: Sparkles, label: "Очистка неиспользуемых аккаунтов" },
];

export default function HygieneVisualization() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full max-w-md mx-auto p-8 rounded-2xl glass border border-primary/20"
    >
      <div className="grid grid-cols-2 gap-4">
        {hygieneRules.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-vg-surface/50 border border-primary/10 hover:border-primary/40 transition-colors"
          >
            <motion.div
              animate={hovered ? { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
              className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0"
            >
              <Icon className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-sm text-vg-muted">{label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
