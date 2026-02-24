import { useState } from "react";
import { motion } from "framer-motion";
import russiaMapSvg from "../../assets/russia-map.svg?raw";

/** Координаты городов в viewBox 1280×744 (lon 19–180°E, lat 41–82°N) */
const cities = [
  { name: "Москва", x: 148, y: 465, stats: "~40% атак" },
  { name: "СПб", x: 90, y: 401, stats: "~15% атак" },
  { name: "Екб", x: 330, y: 456, stats: "~8% атак" },
  { name: "Казань", x: 240, y: 465, stats: "~5% атак" },
  { name: "Новосибирск", x: 508, y: 490, stats: "~4% атак" },
];

const PROJECT_COLORS = {
  fill: "#0A0A0F",
  mapFill: "#1a1a2e",
  stroke: "#00FFAA",
  strokeHover: "#3B82F6",
  marker: "#FF3B3B",
  markerHover: "#00FFAA",
};

interface MapRussiaProps {
  onCityHover?: (city: { name: string; stats: string } | null) => void;
}

export function MapRussia({ onCityHover }: MapRussiaProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const handleCityHover = (city: (typeof cities)[0] | null) => {
    setHoveredCity(city?.name ?? null);
    onCityHover?.(city ?? null);
  };

  const svgContent = russiaMapSvg.match(/<svg[\s\S]*<\/svg>/)?.[0] ?? russiaMapSvg;
  const svgWithColors = svgContent
    .replace('fill="#000000"', `fill="${PROJECT_COLORS.mapFill}"`)
    .replace('stroke="none"', `stroke="${PROJECT_COLORS.stroke}" stroke-width="1" stroke-opacity="0.9"`);

  return (
    <div
      className="w-full h-full min-h-[200px] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center"
      style={{
        backgroundColor: PROJECT_COLORS.fill,
        filter: "drop-shadow(0 0 20px rgba(0,255,170,0.15))",
      }}
    >
      <div className="relative w-full h-full min-w-0">
        <div
          className="absolute inset-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:object-contain"
          dangerouslySetInnerHTML={{ __html: svgWithColors }}
        />
        <svg
          viewBox="0 0 1280 744"
          className="absolute inset-0 w-full h-full pointer-events-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {cities.map((city, i) => {
            const isHovered = hoveredCity === city.name;
            return (
              <g
                key={city.name}
                onMouseEnter={() => handleCityHover(city)}
                onMouseLeave={() => handleCityHover(null)}
                style={{ cursor: "pointer" }}
              >
                <motion.circle
                  cx={city.x}
                  cy={city.y}
                  r={isHovered ? 14 : 10}
                  fill={isHovered ? PROJECT_COLORS.markerHover : PROJECT_COLORS.marker}
                  stroke={PROJECT_COLORS.stroke}
                  strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + i * 0.1,
                  }}
                />
                <text
                  x={city.x}
                  y={city.y - 18}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.95)"
                  fontSize="18"
                  fontWeight={isHovered ? "bold" : "normal"}
                  pointerEvents="none"
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
