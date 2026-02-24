import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Key,
  Smartphone,
  KeyRound,
  RefreshCw,
  MousePointer,
  Wifi,
  XCircle,
  HardDrive,
  ScanFace,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import HacksBackground from "./HacksBackground";

const hacks: {
  number: number;
  title: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  {
    number: 1,
    title: "Длиннее = лучше",
    desc: "Пароль «ялюблюкотиков123» взломать сложнее, чем «p@ssw0rd». Длина важнее сложности.",
    icon: Key,
  },
  {
    number: 2,
    title: "Включи второй фактор везде",
    desc: "Даже если пароль украдут, код из SMS или приложения остановит хакера.",
    icon: Smartphone,
  },
  {
    number: 3,
    title: "Один пароль — один сервис",
    desc: "Используй менеджер паролей. Запоминать 100 паролей невозможно, а менеджеру — легко.",
    icon: KeyRound,
  },
  {
    number: 4,
    title: "Обновляй всё сразу",
    desc: "Та надоедливая кнопка «обновить» часто закрывает критические уязвимости.",
    icon: RefreshCw,
  },
  {
    number: 5,
    title: "Не кликай вслепую",
    desc: "Проверяй ссылки перед переходом. Наведи мышь и посмотри адрес внизу браузера.",
    icon: MousePointer,
  },
  {
    number: 6,
    title: "Чужой Wi‑Fi = опасность",
    desc: "В кафе не заходи в банк через открытый Wi‑Fi. Используй VPN или мобильный интернет.",
    icon: Wifi,
  },
  {
    number: 7,
    title: "Закрой старые аккаунты",
    desc: "Те страницы, где ты был 10 лет назад, могут взломать и рассылать спам от твоего имени.",
    icon: XCircle,
  },
  {
    number: 8,
    title: "Правило 3-2-1",
    desc: "3 копии данных, на 2 носителях, 1 за пределами дома. CohortSec сделает это за тебя.",
    icon: HardDrive,
  },
  {
    number: 9,
    title: "Лицо вместо пароля",
    desc: "Биометрия удобнее и безопаснее. В CohortSec можно входить по селфи.",
    icon: ScanFace,
  },
  {
    number: 10,
    title: "Проверь, не утекли ли данные",
    desc: "Наш сервис проверит, не гуляет ли твой пароль по даркнету.",
    icon: ShieldCheck,
  },
];

export default function SecurityHacks() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % hacks.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + hacks.length) % hacks.length);
  }, []);

  const goTo = useCallback((i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  }, [index]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const current = hacks[index];
  const Icon = current.icon;

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d < 0 ? 120 : -120,
      opacity: 0,
    }),
  };

  return (
    <section
      id="lifehacks"
      className="relative min-h-screen py-16 md:py-24 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0A0A0F 0%, rgba(0,255,170,0.03) 50%, #0A0A0F 100%)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      { /* Interactive background */}
      <HacksBackground />

      { /* Header */}
      <div className="relative z-10 text-center mb-16 px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Лайфхаки: защити себя за 5 минут</h2>
        <p className="text-vg-muted max-w-2xl mx-auto">
          Простые действия, которые повысят твою безопасность в разы
        </p>
      </div>

      { /* Slideshow */}
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="slide-glass rounded-2xl p-8 md:p-10 border border-white/10"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Icon className="w-8 h-8 md:w-10 md:h-10 text-[#00FFAA]" strokeWidth={2} />
              </motion.div>
              <span className="text-sm font-semibold text-[#00FFAA] tracking-wider mb-3">
                ЛАЙФХАК #{current.number}
              </span>
              <h3 className="text-xl md:text-2xl font-bold mb-4">{current.title}</h3>
              <p className="text-base text-vg-muted leading-relaxed">{current.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        { /* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            aria-label="Предыдущий"
            className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            {hacks.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Слайд ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-[#00FFAA] shadow-[0_0_12px_rgba(0,255,170,0.5)]" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label="Следующий"
            className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors border border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
