import { motion } from "framer-motion";

const floatingWords = [
  "БЕЗОПАСНОСТЬ",
  "ПАРОЛЬ",
  "2FA",
  "VPN",
  "ЗАЩИТА",
  "ДАННЫЕ",
  "ШИФР",
  "БИОМЕТРИЯ",
];

export default function HacksBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SVG grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden>
        <defs>
          <pattern id="hacks-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00FFAA" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFAA" stopOpacity="0" />
            <stop offset="50%" stopColor="#00FFAA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00FFAA" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hacks-grid)" />
      </svg>

      {/* Animated flowing lines - pure SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="hacks-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFAA" stopOpacity="0" />
            <stop offset="50%" stopColor="#00FFAA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00FFAA" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M ${-50} ${80 + i * 120} Q 300 ${60 + i * 40} 600 ${80 + i * 120} T 1250 ${80 + i * 120}`}
            fill="none"
            stroke="url(#hacks-line-grad)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 0.5,
            }}
            transition={{
              pathLength: { duration: 3, repeat: Infinity, repeatDelay: 1 },
              opacity: { duration: 1 },
            }}
          />
        ))}
      </svg>

      {/* Shield visualization */}
      <svg className="absolute right-[5%] top-[15%] w-32 h-32 md:w-48 md:h-48 opacity-[0.06]" viewBox="0 0 24 24" fill="none" stroke="#00FFAA" strokeWidth="1" aria-hidden>
        <motion.path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        />
      </svg>
      <svg className="absolute left-[5%] bottom-[20%] w-24 h-24 md:w-36 md:h-36 opacity-[0.05]" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1" aria-hidden>
        <motion.path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
        />
      </svg>

      {/* Floating animated text */}
      <div className="absolute inset-0">
        {floatingWords.map((word, i) => (
          <motion.div
            key={word}
            className="absolute text-[#00FFAA]/10 font-bold text-lg md:text-xl select-none"
            style={{
              left: `${10 + (i * 13) % 80}%`,
              top: `${15 + (i * 11) % 70}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {word}
          </motion.div>
        ))}
      </div>

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-[#00FFAA]/5 blur-3xl"
        style={{ left: "10%", top: "20%" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-[#8B5CF6]/10 blur-3xl"
        style={{ right: "15%", bottom: "30%" }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      />
    </div>
  );
}
