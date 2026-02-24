import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { MapRussia } from "../MapRussia";

export default function Slide1_Hero() {
  const [hoveredCity, setHoveredCity] = useState<{ name: string; stats: string } | null>(null);

  return (
    <div className="slide-content slide-glass slide-glass--wide flex flex-col items-center justify-center text-center min-h-0 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4 flex-shrink-0"
      >
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 flex items-center justify-center gap-3 flex-nowrap">
          <Zap className="w-8 h-8 md:w-10 md:h-10 text-[#00FFAA]" strokeWidth={2.5} />
          <span className="danger-text whitespace-nowrap">КИБЕРПРЕСТУПНОСТЬ В РОССИИ</span>
          <Zap className="w-8 h-8 md:w-10 md:h-10 text-[#00FFAA]" strokeWidth={2.5} />
        </h1>
        <p className="text-xl md:text-2xl text-white/80">
          Масштабы угрозы, о которых вы не знали
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative mb-4 flex-shrink-0 w-full max-w-2xl aspect-[1280/744] min-h-[280px] md:min-h-[320px]"
      >
        <MapRussia onCityHover={setHoveredCity} />
        {hoveredCity && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-vg-surface/95 border border-white/10 text-sm"
          >
            <strong>{hoveredCity.name}</strong>: {hoveredCity.stats}
          </motion.div>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-white/60 text-sm"
      >
        Наведите на город — статистика по региону
      </motion.p>
    </div>
  );
}
