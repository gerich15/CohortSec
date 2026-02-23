"use client";

import { motion } from "framer-motion";

// Цвета проекта: vg-accent #3B82F6 (59,130,246), mint #00FFAA (0,255,170)
export function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => {
    const useMint = i % 3 === 0;
    const r = useMint ? 0 : 59;
    const g = useMint ? 255 : 130;
    const b = useMint ? 170 : 246;
    const opacity = 0.06 + i * 0.025;
    return {
      id: i,
      d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
        380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
        152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
        684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
      stroke: `rgba(${r},${g},${b},${opacity})`,
      width: 0.5 + i * 0.03,
      opacity: 0.1 + i * 0.03,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.stroke}
            strokeWidth={path.width}
            fill="none"
            initial={{ pathLength: 0.3, opacity: 0.5 }}
            animate={{
              pathLength: 1,
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{
              duration: 20 + path.id * 0.3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths() {
  return (
    <>
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </>
  );
}
