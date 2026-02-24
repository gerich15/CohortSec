import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Banknote, TrendingUp } from "lucide-react";

const TARGET = 15_000_000_000;
const DURATION = 2000;

function useCountUp(end: number, duration: number, start = 0) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * (end - start) + start));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return value;
}

export default function Slide4_Money() {
  const value = useCountUp(TARGET, DURATION);

  return (
    <div className="slide-content slide-glass flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Banknote className="w-10 h-10 md:w-12 md:h-12 text-[#00FFAA] mx-auto" strokeWidth={2} />
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mt-2">УЩЕРБ ДЛЯ РОССИЯН</h2>
      </motion.div>

      <motion.div
        className="stat-number mb-4"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {value.toLocaleString("ru-RU")} ₽
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-white/80 mb-4"
      >
        потеряли россияне от рук кибермошенников только за прошлый год
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xl md:text-2xl warning-text flex items-center gap-2"
      >
        <span className="flex items-center justify-center gap-2">
          <TrendingUp className="w-5 h-5 flex-shrink-0" />
          Рост на 40% по сравнению с предыдущим годом
        </span>
      </motion.p>
    </div>
  );
}
