import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "../animations/ScrollReveal";
import HackCard from "../ui/HackCard";

const hacks = [
  { number: 1, title: "Длиннее = лучше", desc: "Пароль «ялюблюкотиков123» взломать сложнее, чем «p@ssw0rd». Длина важнее сложности." },
  { number: 2, title: "Включи второй фактор везде", desc: "Даже если пароль украдут, код из SMS или приложения остановит хакера." },
  { number: 3, title: "Один пароль — один сервис", desc: "Используй менеджер паролей. Запоминать 100 паролей невозможно, а менеджеру — легко." },
  { number: 4, title: "Обновляй всё сразу", desc: "Та надоедливая кнопка «обновить» часто закрывает критические уязвимости." },
  { number: 5, title: "Не кликай вслепую", desc: "Проверяй ссылки перед переходом. Наведи мышь и посмотри адрес внизу браузера." },
  { number: 6, title: "Чужой Wi‑Fi = опасность", desc: "В кафе не заходи в банк через открытый Wi‑Fi. Используй VPN или мобильный интернет." },
  { number: 7, title: "Закрой старые аккаунты", desc: "Те страницы, где ты был 10 лет назад, могут взломать и рассылать спам от твоего имени." },
  { number: 8, title: "Правило 3-2-1", desc: "3 копии данных, на 2 носителях, 1 за пределами дома. CohortSec сделает это за тебя." },
  { number: 9, title: "Лицо вместо пароля", desc: "Биометрия удобнее и безопаснее. В CohortSec можно входить по селфи." },
  { number: 10, title: "Проверь, не утекли ли данные", desc: "Наш сервис проверит, не гуляет ли твой пароль по даркнету." },
];

export default function SecurityHacks() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardWidth = 440;
  const gap = 32;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % hacks.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const viewportWidth = window.innerWidth;
    const offset = Math.max(0, index * (cardWidth + gap) - viewportWidth / 2 + cardWidth / 2 + gap / 2);
    el.scrollTo({ left: offset, behavior: "smooth" });
  }, [index]);

  const prev = () => setIndex((i) => (i - 1 + hacks.length) % hacks.length);
  const next = () => setIndex((i) => (i + 1) % hacks.length);

  return (
    <section
      className="py-24 relative w-full overflow-hidden px-3"
      style={{
        background: "linear-gradient(180deg, #0A0A0F 0%, rgba(139,92,246,0.05) 50%, #0A0A0F 100%)",
      }}
    >
      <ScrollReveal className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Лайфхаки: защити себя за 5 минут</h2>
        <p className="text-vg-muted max-w-2xl mx-auto">Простые действия, которые повысят твою безопасность в разы</p>
      </ScrollReveal>
      <div
        className="relative w-screen left-1/2 -translate-x-1/2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          onClick={prev}
          aria-label="Предыдущий"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          aria-label="Следующий"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <div
          ref={trackRef}
          className="flex overflow-x-auto gap-8 py-6 px-4 md:px-16 snap-x snap-mandatory scroll-smooth scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {hacks.map((h, i) => (
            <div key={i} className="flex-shrink-0 snap-center" style={{ width: cardWidth }}>
              <HackCard number={h.number} title={h.title} description={h.desc} />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {hacks.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Слайд ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2 bg-vg-muted/50 hover:bg-vg-muted"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
