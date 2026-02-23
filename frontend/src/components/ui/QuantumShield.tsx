import { motion } from "framer-motion";
import { Shield, ShieldOff } from "lucide-react";

export default function QuantumShield() {
  return (
    <motion.div
      className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 my-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <h4 className="text-vg-muted text-sm font-medium mb-3 uppercase tracking-wider">
          Старые алгоритмы
        </h4>
        <motion.div
          className="w-36 h-40 md:w-44 md:h-48 mx-auto flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-red-500/40 bg-red-500/5 px-2"
          animate={{ opacity: [1, 0.75, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShieldOff className="w-12 h-12 md:w-14 md:h-14 text-red-500/70 shrink-0" />
          <span className="text-2xl font-bold text-red-400">5 лет</span>
          <p className="text-xs text-red-400/80 text-center">
            RSA и ECC падут через 5–10 лет
          </p>
        </motion.div>
      </div>

      <motion.div
        className="text-2xl md:text-3xl font-bold text-accentPurple"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        VS
      </motion.div>

      <div className="text-center">
        <h4 className="text-accentPurple/90 text-sm font-medium mb-3 uppercase tracking-wider">
          CohortSec PQC
        </h4>
        <motion.div
          className="w-36 h-40 md:w-44 md:h-48 mx-auto flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-accentPurple/60 bg-accentPurple/10 px-2"
          animate={{
            boxShadow: [
              "0 0 20px rgba(139, 92, 246, 0.3)",
              "0 0 40px rgba(139, 92, 246, 0.5)",
              "0 0 20px rgba(139, 92, 246, 0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div whileHover={{ scale: 1.1 }}>
            <Shield className="w-12 h-12 md:w-14 md:h-14 text-accentPurple drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] shrink-0" />
          </motion.div>
          <span className="text-2xl font-bold text-accentPurple">∞</span>
          <p className="text-xs text-accentPurple/90 text-center">
            Квантово-устойчивая защита
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
