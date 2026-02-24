import { motion } from "framer-motion";
import { Phone, Link, Key, Heart, TrendingUp, Fish } from "lucide-react";

const schemes = [
  { name: "Звонок «из банка»", percent: 65, icon: Phone },
  { name: "Фишинговые сайты", percent: 48, icon: Link },
  { name: "Взлом аккаунта друга", percent: 35, icon: Key },
  { name: "Ложные инвестиции", percent: 22, icon: TrendingUp },
  { name: "Романтические схемы", percent: 12, icon: Heart },
];

export default function Slide6_Schemes() {
  return (
    <div className="slide-content slide-glass flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Fish className="w-10 h-10 md:w-12 md:h-12 text-[#00FFAA] mx-auto" strokeWidth={2} />
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mt-2">ТОП-5 СХЕМ МОШЕННИКОВ</h2>
      </motion.div>

      <div className="w-full max-w-xl space-y-4">
        {schemes.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#FF3B3B]/50 transition-colors"
            >
              <span className="text-lg md:text-xl text-white/60 w-8">{i + 1}.</span>
              <Icon className="w-6 h-6 text-[#FFAA00] flex-shrink-0" />
              <span className="text-lg md:text-xl text-white flex-1 min-w-0">{s.name}</span>
              <div className="w-24 md:w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF3B3B] to-[#FFAA00]"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.percent}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                />
              </div>
              <span className="text-lg md:text-xl danger-text font-bold w-14 text-right">{s.percent}%</span>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-base md:text-lg text-white/50"
      >
        Наведите на схему — подробнее
      </motion.p>
    </div>
  );
}
