import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "intro", label: "Введение" },
  { id: "pqc-overview", label: "Пост-квантовая криптография" },
  { id: "ml-kem", label: "ML-KEM (Kyber)" },
  { id: "ml-dsa", label: "ML-DSA (Dilithium)" },
  { id: "hybrid", label: "Гибридная схема" },
  { id: "architecture", label: "Архитектура CohortSec" },
  { id: "standards", label: "Стандарты NIST" },
];

export default function TechnicalDocumentation() {
  const [activeId, setActiveId] = useState("intro");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-vg-bg text-white w-full">
      <div className="doc-layout">
        <nav className="doc-sidebar hidden lg:block">
          <Link
            to="/"
            className="flex items-center gap-2 text-vg-muted hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
          <div className="space-y-1">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeId === id
                    ? "text-accentPurple bg-accentPurple/10 font-medium"
                    : "text-vg-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        <main className="doc-main max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accentPurple bg-clip-text text-transparent">
            Криптография CohortSec
          </h1>
          <p className="text-vg-muted mb-16">
            Техническое описание используемых алгоритмов и архитектуры
          </p>

          <section id="intro" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">Введение</h2>
            <p className="text-vg-muted leading-relaxed mb-4">
              CohortSec использует пост-квантовую криптографию (PQC) для защиты
              пользовательских данных. В 2024 году NIST утвердил первые стандарты
              PQC: ML-KEM (модуль инкапсуляции ключей) и ML-DSA (модуль
              цифровых подписей). Эти алгоритмы устойчивы к атакам как
              классических, так и квантовых компьютеров.
            </p>
            <p className="text-vg-muted leading-relaxed">
              Мы применяем гибридный подход: комбинируем проверенные классические
              алгоритмы (X25519, ECDSA, AES-256-GCM) с новыми пост-квантовыми,
              обеспечивая защиту сегодня и в будущем.
            </p>
          </section>

          <section id="pqc-overview" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">
              Пост-квантовая криптография
            </h2>
            <p className="text-vg-muted leading-relaxed mb-4">
              Квантовые компьютеры теоретически способны за полиномиальное время
              решить задачи факторизации (RSA) и дискретного логарифма (ECDSA,
              DH). Алгоритмы PQC основаны на математических задачах, для которых
              не известно эффективных алгоритмов — ни классических, ни
              квантовых.
            </p>
            <ul className="list-disc list-inside text-vg-muted space-y-2">
              <li>Криптография на решётках (lattice-based)</li>
              <li>Кодовая криптография</li>
              <li>Хэш-подписи (SPHINCS+)</li>
            </ul>
          </section>

          <section id="ml-kem" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">ML-KEM (модуль Kyber)</h2>
            <p className="text-vg-muted leading-relaxed mb-4">
              ML-KEM — алгоритм инкапсуляции ключей на основе модулярных решёток.
              Стандартизирован как FIPS 203. Используется для безопасного обмена
              симметричными ключами между сторонами.
            </p>
            <div className="bg-vg-surface/50 rounded-xl p-4 border border-accentPurple/20 mb-4">
              <p className="text-sm font-mono text-accentPurple">
                Оценка безопасности: квантовому компьютеру потребуется ~2^256
                операций для взлома ML-KEM-768 (уровень 3).
              </p>
            </div>
            <p className="text-vg-muted leading-relaxed">
              В CohortSec ML-KEM используется при шифровании бэкапов, обмене
              ключами сессий и защите персональных данных. Мы применяем уровень 3
              (768 бит) для долговременного хранения.
            </p>
          </section>

          <section id="ml-dsa" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">ML-DSA (модуль Dilithium)</h2>
            <p className="text-vg-muted leading-relaxed mb-4">
              ML-DSA — алгоритм цифровых подписей на основе решёток. Стандартизирован
              как FIPS 204. Обеспечивает аутентичность и целостность данных без
              возможности подделки.
            </p>
            <p className="text-vg-muted leading-relaxed">
              Подписи ML-DSA используются для верификации конфигураций бэкапов,
              подписывания метаданных и аутентификации внутренних компонентов
              системы.
            </p>
          </section>

          <section id="hybrid" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">Гибридная схема</h2>
            <p className="text-vg-muted leading-relaxed mb-4">
              Гибридный подход: X25519 + ML-KEM для KEM и ECDSA + ML-DSA для
              подписей. Оба ключа генерируются и проверяются; злоумышленнику
              потребуется взломать оба алгоритма.
            </p>
            <p className="text-vg-muted leading-relaxed">
              Преимущества: совместимость с существующей инфраструктурой, защита
              при миграции на PQC и отказоустойчивость — если один алгоритм будет
              скомпрометирован, второй останется безопасным.
            </p>
          </section>

          <section id="architecture" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">Архитектура CohortSec</h2>
            <p className="text-vg-muted leading-relaxed mb-4">
              Слой криптографии абстрагирован через интерфейсы (KEM, подписи,
              симметричное шифрование). KeyManager управляет версиями ключей и
              ротацией. CryptoContext выбирает алгоритмы по цели: долговременное
              хранение — PQC, сессии — гибрид.
            </p>
            <p className="text-vg-muted leading-relaxed">
              Симметричное шифрование данных — AES-256-GCM. Ключи шифрования
              защищены ML-KEM или гибридным KEM. Метаданные (алгоритм, версия
              ключа) хранятся вместе с зашифрованными данными для обратной
              совместимости при ротации.
            </p>
          </section>

          <section id="standards" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">Стандарты NIST 2024</h2>
            <ul className="text-vg-muted space-y-2">
              <li>FIPS 203 — ML-KEM (Key Encapsulation Mechanism)</li>
              <li>FIPS 204 — ML-DSA (Module-Lattice Digital Signature Algorithm)</li>
              <li>FIPS 205 — SLH-DSA (Stateless Hash-Based Signatures, SPHINCS+)</li>
            </ul>
            <p className="text-vg-muted leading-relaxed mt-4">
              CohortSec реализует FIPS 203 и 204. SPHINCS+ (205) доступен
              опционально для длительных подписей.
            </p>
          </section>

          <div className="pt-8 border-t border-white/10">
            <Link
              to="/#quantum"
              className="inline-flex items-center gap-2 text-accentPurple hover:text-accentPurple/80 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться к секции о шифровании
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
