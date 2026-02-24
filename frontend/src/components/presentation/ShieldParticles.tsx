import { motion } from "framer-motion";

export function ShieldParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    delay: i * 0.08,
    size: 6,
  }));

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
      {/* Щит */}
      <motion.svg
        viewBox="0 0 56 56"
        className="absolute w-full h-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <defs>
          <linearGradient id="shieldGradPres" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFAA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path
          fill="none"
          stroke="url(#shieldGradPres)"
          strokeWidth="2"
          d="M28 4L8 12v12c0 14 8 22 20 28 12-6 20-14 20-28V12L28 4z"
        />
      </motion.svg>
      {/* Частицы вокруг щита */}
      {particles.map((p) => {
        const r = 80;
        const startX = Math.cos((p.angle * Math.PI) / 180) * r;
        const startY = Math.sin((p.angle * Math.PI) / 180) * r;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#00FFAA]"
            style={{
              width: p.size,
              height: p.size,
              left: "50%",
              top: "50%",
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              boxShadow: "0 0 10px #00FFAA",
            }}
            initial={{
              x: startX,
              y: startY,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: 0.9,
              scale: 1,
            }}
            transition={{
              duration: 1.2,
              delay: p.delay,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}
