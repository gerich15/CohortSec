import { motion } from "framer-motion";
import { NewsCard } from "../components/news/NewsCard";
const news = [
  {
    slug: "pqc-standards-2026",
    title: "CohortSec первым в России внедрил новые стандарты PQC NIST",
    date: "15 февраля 2026",
    excerpt: "Мы первыми среди российских B2C-сервисов внедрили пост-квантовую криптографию по стандартам NIST 2024 года.",
    category: "Технологии",
    image: "/news/pqc.jpg",
  },
  {
    slug: "family-subscription",
    title: 'Новый тариф "Семейный" — защитите до 5 близких',
    date: "1 февраля 2026",
    excerpt: 'Запустили семейную подписку со скидкой 30%. Добавьте родителей и детей под одну крышу.',
    category: "Продукты",
    image: "/news/family.jpg",
  },
  {
    slug: "breach-check-feature",
    title: "Запустили проверку утечек паролей",
    date: "20 января 2026",
    excerpt: "Теперь вы можете проверить, не утекли ли ваши пароли, не раскрывая их. Полная приватность.",
    category: "Новые функции",
    image: "/news/breach.jpg",
  },
  {
    slug: "investment-round",
    title: "CohortSec привлёк 2 млн долларов инвестиций",
    date: "10 января 2026",
    excerpt: "Инвестиции пойдут на развитие технологий и расширение команды.",
    category: "Компания",
    image: "/news/investment.jpg",
  },
];

export default function News() {
  return (
    <div className="relative min-h-screen bg-vg-bg">
      <div className="page-container relative z-10">
        <h1 className="gradient-text">Новости и события</h1>
        <p className="page-subtitle">
          Следите за последними обновлениями и новостями компании
        </p>
        <div className="news-grid">
          {news.map((item, index) => (
            <NewsCard key={item.slug} item={item} index={index} />
          ))}
        </div>
        <div className="newsletter-section">
          <h2>Будьте в курсе</h2>
          <p>Подпишитесь на новости и получайте обновления первыми</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Ваш email" className="newsletter-input" />
            <button type="submit" className="newsletter-button">Подписаться</button>
          </form>
        </div>
      </div>
    </div>
  );
}
