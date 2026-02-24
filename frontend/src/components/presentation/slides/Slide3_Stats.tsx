import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const causes = [
  { label: "Слабые пароли", percent: 60, color: "#FF3B3B" },
  { label: "Фишинг", percent: 25, color: "#FFAA00" },
  { label: "Устаревшее ПО", percent: 15, color: "#3B82F6" },
];

export default function Slide3_Stats() {
  return (
    <div className="slide-content slide-glass flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-[#00FFAA] mx-auto" strokeWidth={2} />
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-2">
          <span className="safe-text">80%</span>{" "}
          <span className="text-white">УТЕЧЕК МОЖНО БЫЛО ПРЕДОТВРАТИТЬ</span>
        </h2>
      </motion.div>

      <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl">
        <motion.div
          className="relative w-48 h-48"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,59,59,0.3)"
              strokeWidth="12"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00FFAA"
              strokeWidth="12"
              strokeDasharray="201 251"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 251" }}
              animate={{ strokeDasharray: "201 251" }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold safe-text">80%</span>
            <span className="text-sm md:text-base text-white/60">можно было</span>
          </div>
        </motion.div>

        <div className="space-y-4 flex-1">
          <p className="text-xl md:text-2xl text-white/80 font-medium">Основные причины:</p>
          {causes.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center gap-3"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-lg md:text-xl text-white flex-1">{c.label}</span>
              <span className="text-lg md:text-xl font-bold" style={{ color: c.color }}>
                {c.percent}%
              </span>
              <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: c.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.percent}%` }}
                  transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
