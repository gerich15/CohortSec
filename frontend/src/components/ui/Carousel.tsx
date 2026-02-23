import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode[];
  autoPlayInterval?: number;
  className?: string;
  cardWidth?: number;
  gap?: number;
}

export default function Carousel({
  children,
  autoPlayInterval = 5000,
  className = "",
  cardWidth = 360,
  gap = 24,
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = children.length;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, total, autoPlayInterval]);

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button
        onClick={goPrev}
        aria-label="Предыдущий"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        aria-label="Следующий"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 py-4 px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="flex-shrink-0 snap-center"
            style={{ width: cardWidth }}
          >
            {child}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {children.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Перейти к слайду ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === index ? "bg-primary w-6" : "bg-vg-muted/50 hover:bg-vg-muted"
            }`}
          />
        ))}
      </div>

      <style>{`
        .flex.overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
