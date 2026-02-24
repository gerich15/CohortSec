import { motion } from "framer-motion";

interface FamilySilhouettesProps {
  activeIndex?: number; // 0-4, какой силуэт подсветить красным
}

export function FamilySilhouettes({ activeIndex = 4 }: FamilySilhouettesProps) {
  const silhouettes = [
    { label: "Папа", x: 10 },
    { label: "Мама", x: 25 },
    { label: "Ребёнок", x: 45 },
    { label: "Подросток", x: 65 },
    { label: "Бабушка", x: 85 },
  ];

  return (
    <div className="flex justify-center items-end gap-4 md:gap-8 py-8">
      {silhouettes.map((s, i) => (
        <motion.div
          key={s.label}
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
        >
          <svg
            viewBox="0 0 40 60"
            className={`w-16 h-24 md:w-20 md:h-28 transition-all duration-300 ${
              activeIndex === i ? "drop-shadow-[0_0_15px_rgba(255,59,59,0.8)]" : "opacity-60"
            }`}
          >
            <ellipse
              cx="20"
              cy="12"
              rx="8"
              ry="10"
              fill={activeIndex === i ? "#FF3B3B" : "rgba(255,255,255,0.3)"}
            />
            <path
              d="M 8 22 L 8 50 Q 8 55 20 55 Q 32 55 32 50 L 32 22"
              fill={activeIndex === i ? "#FF3B3B" : "rgba(255,255,255,0.3)"}
            />
            <path
              d="M 5 30 L 15 25 M 35 30 L 25 25"
              stroke={activeIndex === i ? "#FF3B3B" : "rgba(255,255,255,0.3)"}
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <span className="text-xs text-white/80 mt-2">{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
