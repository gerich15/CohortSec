import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import ShaderBackground from "../ui/ShaderBackground";
import Slide1_Hero from "./slides/Slide1_Hero";
import Slide2_Timer from "./slides/Slide2_Timer";
import Slide3_Stats from "./slides/Slide3_Stats";
import Slide4_Money from "./slides/Slide4_Money";
import Slide5_Family from "./slides/Slide5_Family";
import Slide6_Schemes from "./slides/Slide6_Schemes";
import Slide7_Solution from "./slides/Slide7_Solution";

const slides = [
  { id: "hero", component: Slide1_Hero },
  { id: "timer", component: Slide2_Timer },
  { id: "stats", component: Slide3_Stats },
  { id: "money", component: Slide4_Money },
  { id: "family", component: Slide5_Family },
  { id: "schemes", component: Slide6_Schemes },
  { id: "solution", component: Slide7_Solution },
];

interface CyberCrimePresentationProps {
  /** Встроенный режим: ссылка скроллит к #stats */
  embedded?: boolean;
}

export function CyberCrimePresentation({ embedded }: CyberCrimePresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide((prev) => {
      setDirection(index > prev ? 1 : -1);
      return index;
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 7000);
  }, [nextSlide]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      else if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    if (embedded) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 30) {
        e.preventDefault();
        if (e.deltaY > 0) nextSlide();
        else prevSlide();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [embedded, nextSlide, prevSlide]);

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div
      className={`overflow-hidden relative bg-[#0A0A0F] ${embedded ? "min-h-screen w-full" : "h-screen w-screen"}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      {/* Shader фон */}
      <div className="absolute inset-0 z-0">
        <ShaderBackground />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="slide absolute inset-0 flex items-center justify-center p-8 md:p-16 z-[2]"
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>

      {/* Навигация */}
      <button
        type="button"
        className="nav-arrow left absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10"
        onClick={prevSlide}
        aria-label="Предыдущий слайд"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        type="button"
        className="nav-arrow right absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10"
        onClick={nextSlide}
        aria-label="Следующий слайд"
      >
        <ChevronRight size={24} />
      </button>

      {/* Ссылка на детальную статистику */}
      <a
        href={embedded ? "#stats" : "/cybercrime-stats"}
        className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors z-10 text-sm"
      >
        <BarChart3 className="w-4 h-4" />
        Детальная статистика
      </a>

      {/* Индикаторы */}
      <div className="slide-dots absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`slide-dot w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              index === currentSlide
                ? "bg-[#00FFAA] w-8 rounded-md shadow-[0_0_15px_#00FFAA]"
                : "bg-white/30 hover:bg-white/50"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Слайд ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
