import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Shield, BookOpen, Zap, HardDrive, Lock, Key, ChevronRight } from "lucide-react";
const SECTIONS = [
  { id: "intro", label: "Введение" },
  { id: "overview", label: "Обзор возможностей" },
  { id: "training", label: "Обучение" },
  { id: "step-register", label: "→ Регистрация и вход" },
  { id: "step-dashboard", label: "→ Панель управления" },
  { id: "step-backup", label: "→ Резервное копирование" },
  { id: "step-security", label: "→ Безопасность и МФА" },
  { id: "step-passwords", label: "→ Проверка паролей" },
  { id: "tech", label: "Техническая документация" },
];

function DocIllustration({ title, imgSrc, children }: { title: string; imgSrc?: string; children?: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-white/10 bg-vg-surface/30 overflow-hidden">
      <div className="p-4 border-b border-white/10 text-sm text-vg-muted font-medium">
        {title}
      </div>
      <div className="aspect-video flex items-center justify-center p-8 bg-gradient-to-br from-vg-surface/50 to-transparent min-h-[200px]">
        {imgSrc ? (
          <img src={imgSrc} alt={title} className="max-w-full max-h-full object-contain rounded-lg" />
        ) : children || (
          <div className="text-center text-vg-muted">
            <Shield className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Иллюстрация</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Documentation() {
  const [activeId, setActiveId] = useState("intro");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.filter((s) => !s.label.startsWith("→")).forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    ["step-register", "step-dashboard", "step-backup", "step-security", "step-passwords"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-vg-bg w-full">
      <div className="relative z-10 doc-layout">
        <nav className="doc-sidebar hidden lg:block">
          <div className="space-y-1">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeId === id ? "text-vg-accent bg-vg-accent/10 font-medium" : "text-vg-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Link
            to="/security-whitepaper"
            className="mt-6 flex items-center gap-2 px-4 py-2 text-sm text-vg-muted hover:text-vg-accent transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Криптография (техдок)
          </Link>
        </nav>

        <main className="doc-main max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Документация CohortSec
          </h1>
          <p className="text-vg-muted mb-12">
            Всё, что нужно знать для работы с платформой защиты семьи
          </p>

          <section id="intro" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">Введение</h2>
            <p className="text-vg-muted leading-relaxed mb-4">
              CohortSec — это платформа цифровой безопасности для семьи. Она помогает защитить
              ваши данные, пароли, фото и контакты от утечек, взломов и цифровых угроз.
            </p>
            <p className="text-vg-muted leading-relaxed mb-4">
              В этой документации вы найдёте подробное описание всех возможностей и пошаговое
              обучение: от регистрации до настройки бэкапов и проверки паролей.
            </p>
            <DocIllustration title="Главный экран CohortSec">
              <div className="flex flex-col items-center gap-3">
                <Shield className="w-20 h-20 text-vg-accent" />
                <p className="text-vg-muted text-center max-w-xs">
                  Ваш цифровой телохранитель — панель управления, бэкапы, проверка паролей
                </p>
              </div>
            </DocIllustration>
          </section>

          <section id="overview" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">Обзор возможностей</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Zap className="w-5 h-5 text-vg-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Панель управления</strong> — обзор уровня защиты,
                  последних событий и быстрые действия.
                </div>
              </li>
              <li className="flex gap-3">
                <HardDrive className="w-5 h-5 text-vg-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Резервное копирование</strong> — сохранение фото,
                  контактов и документов в защищённое облако с пост-квантовым шифрованием.
                </div>
              </li>
              <li className="flex gap-3">
                <Lock className="w-5 h-5 text-vg-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Безопасность</strong> — двухфакторная аутентификация
                  (МФА), биометрический вход и управление сессиями.
                </div>
              </li>
              <li className="flex gap-3">
                <Key className="w-5 h-5 text-vg-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Проверка паролей</strong> — анонимная проверка,
                  не утекли ли ваши пароли в базы утечек (k-anonymity).
                </div>
              </li>
            </ul>
          </section>

          <section id="training" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">Обучение</h2>
            <p className="text-vg-muted leading-relaxed mb-6">
              Пошаговое руководство для начала работы с CohortSec. Следуйте инструкциям — и вы
              настроите защиту семьи за несколько минут.
            </p>
          </section>

          <section id="step-register" className="mb-16 scroll-mt-28">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-vg-accent/20 flex items-center justify-center text-vg-accent text-sm font-bold">1</span>
              Регистрация и вход
            </h3>
            <p className="text-vg-muted leading-relaxed mb-4">
              Перейдите на главную страницу и нажмите <strong className="text-white">«Регистрация»</strong>.
              Введите email, имя пользователя и пароль. Пароль должен быть не менее 8 символов.
            </p>
            <p className="text-vg-muted leading-relaxed mb-4">
              После регистрации вы автоматически войдёте в личный кабинет. Для повторного входа
              используйте кнопку <strong className="text-white">«Войти»</strong> и введите логин и пароль.
            </p>
            <DocIllustration title="Шаг 1: Форма регистрации">
              <div className="w-full max-w-xs mx-auto p-6 rounded-xl border border-white/10 bg-vg-surface/50 text-left">
                <p className="text-sm text-vg-muted mb-2">Email / Имя пользователя</p>
                <div className="h-10 rounded-lg bg-white/5 mb-3" />
                <p className="text-sm text-vg-muted mb-2">Пароль</p>
                <div className="h-10 rounded-lg bg-white/5 mb-4" />
                <div className="h-10 rounded-lg bg-vg-accent/30 w-32" />
              </div>
            </DocIllustration>
          </section>

          <section id="step-dashboard" className="mb-16 scroll-mt-28">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-vg-accent/20 flex items-center justify-center text-vg-accent text-sm font-bold">2</span>
              Панель управления
            </h3>
            <p className="text-vg-muted leading-relaxed mb-4">
              После входа вы попадаете на <strong className="text-white">панель управления</strong>.
              Здесь отображается уровень защиты, последние события безопасности и быстрые действия.
            </p>
            <p className="text-vg-muted leading-relaxed mb-4">
              В боковом меню слева доступны разделы: Обзор, Семья, Бэкапы, Безопасность, События.
              Нажмите на нужный пункт, чтобы перейти.
            </p>
            <DocIllustration title="Шаг 2: Панель управления">
              <div className="flex gap-4 w-full">
                <div className="w-24 h-40 rounded-lg bg-vg-surface/50 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-8 rounded bg-vg-surface/50" />
                  <div className="h-16 rounded bg-vg-surface/30" />
                  <div className="h-16 rounded bg-vg-surface/30" />
                  <div className="h-16 rounded bg-vg-surface/30" />
                </div>
              </div>
            </DocIllustration>
          </section>

          <section id="step-backup" className="mb-16 scroll-mt-28">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-vg-accent/20 flex items-center justify-center text-vg-accent text-sm font-bold">3</span>
              Резервное копирование
            </h3>
            <p className="text-vg-muted leading-relaxed mb-4">
              В разделе <strong className="text-white">«Бэкапы»</strong> вы можете сохранять фото,
              контакты и документы. Выберите вкладку «Простой бэкап» и отметьте галочками, что
              хотите сохранить.
            </p>
            <p className="text-vg-muted leading-relaxed mb-4">
              Нажмите <strong className="text-white">«Запустить бэкап»</strong>. Для облачного
              хранения подключите S3-совместимое хранилище (MinIO, AWS и т.д.) в разделе
              «Облачный бэкап».
            </p>
            <DocIllustration title="Шаг 3: Настройка бэкапа">
              <div className="space-y-3 w-full max-w-sm mx-auto">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-vg-accent" />
                  <span className="text-sm text-vg-muted">Фото</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-vg-accent" />
                  <span className="text-sm text-vg-muted">Контакты</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-white/20" />
                  <span className="text-sm text-vg-muted">Документы</span>
                </div>
                <div className="h-10 rounded-lg bg-vg-accent/30 mt-4" />
              </div>
            </DocIllustration>
          </section>

          <section id="step-security" className="mb-16 scroll-mt-28">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-vg-accent/20 flex items-center justify-center text-vg-accent text-sm font-bold">4</span>
              Безопасность и МФА
            </h3>
            <p className="text-vg-muted leading-relaxed mb-4">
              В разделе <strong className="text-white">«Безопасность»</strong> включите
              двухфакторную аутентификацию (МФА). Сканируйте QR-код приложением Google
              Authenticator или аналогом — при каждом входе потребуется код из приложения.
            </p>
            <p className="text-vg-muted leading-relaxed mb-4">
              Биометрический вход позволяет входить по лицу (на поддерживаемых устройствах).
              Шаблон лица хранится в зашифрованном виде и не передаётся на сервер.
            </p>
            <DocIllustration title="Шаг 4: Двухфакторная аутентификация">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-0.5 w-12 h-12">
                    {Array(9).fill(0).map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${i % 2 ? "bg-vg-accent/50" : "bg-white/20"}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-vg-muted">Отсканируйте QR-код в приложении</p>
                  <p className="text-xs text-vg-muted mt-1">Google Authenticator, Authy и др.</p>
                </div>
              </div>
            </DocIllustration>
          </section>

          <section id="step-passwords" className="mb-16 scroll-mt-28">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-vg-accent/20 flex items-center justify-center text-vg-accent text-sm font-bold">5</span>
              Проверка паролей
            </h3>
            <p className="text-vg-muted leading-relaxed mb-4">
              На главной странице сайта в блоке «Проверка утечек» введите пароль, который хотите
              проверить. <strong className="text-white">Пароль не отправляется на сервер</strong> —
              используется технология k-anonymity: передаётся только хэш (часть), по которому
              невозможно восстановить пароль.
            </p>
            <p className="text-vg-muted leading-relaxed mb-4">
              Если пароль найден в базах утечек, вы получите предупреждение и рекомендацию
              сменить его. Бесплатный тариф позволяет проверять до 10 паролей в месяц.
            </p>
            <DocIllustration title="Шаг 5: Проверка паролей (k-anonymity)">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <Key className="w-6 h-6 text-vg-accent" />
                  <span className="text-sm">Пароль → SHA-1 (первые 5 символов)</span>
                </div>
                <ChevronRight className="w-5 h-5 text-vg-muted" />
                <div className="text-sm text-vg-muted text-center">
                  Проверка по базе Have I Been Pwned
                  <br />
                  без раскрытия пароля
                </div>
              </div>
            </DocIllustration>
          </section>

          <section id="tech" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold mb-4">Техническая документация</h2>
            <p className="text-vg-muted leading-relaxed mb-6">
              Для разработчиков и технологов: подробное описание пост-квантовой криптографии,
              алгоритмов ML-KEM, ML-DSA и архитектуры CohortSec.
            </p>
            <Link
              to="/security-whitepaper"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vg-accent/20 text-vg-accent hover:bg-vg-accent/30 transition-colors font-medium"
            >
              <BookOpen className="w-5 h-5" />
              Открыть технический документ
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
