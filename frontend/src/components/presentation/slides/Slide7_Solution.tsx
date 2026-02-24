import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { ShieldParticles } from "../ShieldParticles";
import Button from "../../ui/Button";

const features = [
  "Предиктивная защита — предсказываем взломы",
  "Защита всей семьи — до 5 человек",
  "Квантово-устойчивое шифрование — навсегда",
  "Проверка утечек — узнай, не украли ли твой пароль",
];

export default function Slide7_Solution() {
  return (
    <div className="slide-content slide-glass slide-glass--wide flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Shield className="w-10 h-10 md:w-12 md:h-12 text-[#00FFAA] mx-auto" strokeWidth={2} />
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold safe-text mt-2">COHORTSEC — ВАШ ЩИТ</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <ShieldParticles />
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 space-y-3 max-w-xl text-lg md:text-xl"
      >
        {features.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="flex items-center gap-2 text-white/90"
          >
            <span className="safe-text">•</span> {f}
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-8"
      >
        <Link to="/register">
          <Button size="lg" className="!px-10 !py-4 text-xl">
            Защитить свою семью
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
