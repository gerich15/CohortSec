import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { FamilySilhouettes } from "../FamilySilhouettes";

export default function Slide5_Family() {
  return (
    <div className="slide-content slide-glass flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Users className="w-10 h-10 md:w-12 md:h-12 text-[#00FFAA] mx-auto" strokeWidth={2} />
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold danger-text mt-2">КАЖДАЯ 5-Я СЕМЬЯ</h2>
        <p className="text-xl md:text-2xl text-white/80 mt-2">
          сталкивалась с попыткой взлома аккаунтов
        </p>
      </motion.div>

      <FamilySilhouettes activeIndex={4} />

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 space-y-3 text-left max-w-md text-lg md:text-xl"
      >
        <li className="flex items-center gap-2 text-white/90">
          <span className="danger-text">•</span> Дети (взлом игровых аккаунтов)
        </li>
        <li className="flex items-center gap-2 text-white/90">
          <span className="danger-text">•</span> Пожилые родители (социальная инженерия)
        </li>
        <li className="flex items-center gap-2 text-white/90">
          <span className="danger-text">•</span> Подростки (шантаж в соцсетях)
        </li>
      </motion.ul>
    </div>
  );
}
