import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Sparkles, Brain, Heart, Lock, FileText, Shield } from "lucide-react";
import { GlowingEffect } from "../components/ui/glowing-effect";

const reasons = [
  {
    title: "Квантово-устойчивое шифрование",
    description:
      "Мы используем пост-квантовую криптографию (PQC) — новые стандарты NIST 2024 года. Ваши данные защищены на десятилетия вперёд.",
    icon: Sparkles,
  },
  {
    title: "Предиктивная аналитика",
    description:
      "Наш ИИ предсказывает угрозы до того, как они случатся. Не просто реагируем, а предотвращаем.",
    icon: Brain,
  },
  {
    title: "Семейный подход",
    description:
      "Мы созданы для семей. Простой интерфейс, понятные объяснения, забота о каждом члене семьи.",
    icon: Heart,
  },
  {
    title: "Приватность прежде всего",
    description:
      "Ваши данные не покидают устройство без необходимости. Проверка утечек происходит анонимно.",
    icon: Lock,
  },
  {
    title: "Открытость и прозрачность",
    description:
      "Мы публикуем технические документы и объясняем, как работает защита. Никаких секретов.",
    icon: FileText,
  },
  {
    title: "Российская разработка",
    description:
      "Мы работаем в России, соблюдаем локальные требования и не зависим от западных санкций.",
    icon: Shield,
  },
];

interface GridItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function GridItem({ icon, title, description, index }: GridItemProps) {
  return (
    <motion.li
      className="min-h-[14rem] list-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/10 p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/10 bg-vg-bg/80 p-6 shadow-sm backdrop-blur-sm md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-white/10 bg-vg-accent/10 p-2">
              <span className="text-vg-accent">{icon}</span>
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl font-semibold leading-[1.375rem] tracking-tight text-white md:text-2xl md:leading-[1.875rem]">
                {title}
              </h3>
              <p className="text-sm leading-[1.125rem] text-vg-muted md:text-base md:leading-[1.375rem]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

export default function WhyUs() {
  return (
    <div className="relative min-h-screen bg-vg-bg">
      <div className="page-container relative z-10">
        <h1 className="gradient-text">Почему CohortSec</h1>
        <p className="page-subtitle">
          Шесть причин доверить нам безопасность вашей семьи
        </p>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-3 xl:grid-cols-3 xl:grid-rows-2">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <GridItem
                key={index}
                index={index}
                icon={<Icon className="h-4 w-4" />}
                title={reason.title}
                description={reason.description}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}
