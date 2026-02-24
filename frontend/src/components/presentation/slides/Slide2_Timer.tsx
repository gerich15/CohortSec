import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, AlertTriangle } from "lucide-react";

const INTERVAL = 39;

export default function Slide2_Timer() {
  const [seconds, setSeconds] = useState(INTERVAL);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setFlash(true);
          setTimeout(() => setFlash(false), 300);
          return INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const attacksWhileReading = Math.ceil(15 / (INTERVAL / 60)); // ~3 за 15 сек чтения

  return (
    <div className="slide-content slide-glass flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Timer className="w-10 h-10 md:w-12 md:h-12 text-[#00FFAA] mx-auto" strokeWidth={2} />
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold danger-text mt-2">КАЖДЫЕ 39 СЕКУНД</h2>
        <p className="text-xl md:text-2xl text-white/80 mt-2">в мире происходит хакерская атака</p>
      </motion.div>

      <motion.div
        className={`relative inline-flex items-center justify-center w-44 h-44 md:w-56 md:h-56 rounded-full border-4 ${
          flash ? "border-[#FF3B3B] bg-[#FF3B3B]/20" : "border-[#FF3B3B]/50"
        }`}
        animate={flash ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: flash ? "0 0 60px rgba(255,59,59,0.6)" : "0 0 30px rgba(255,59,59,0.3)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={seconds}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-7xl md:text-9xl font-black danger-text"
          >
            {seconds}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-xl md:text-2xl warning-text"
      >
        <span className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          Пока вы читаете этот текст, произошло уже ~{attacksWhileReading} атак
        </span>
      </motion.p>
    </div>
  );
}
