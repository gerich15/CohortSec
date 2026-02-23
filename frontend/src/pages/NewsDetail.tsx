import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
const newsData: Record<string, { title: string; date: string; category: string; content: string }> = {
  "pqc-standards-2026": {
    title: "CohortSec первым в России внедрил новые стандарты PQC NIST",
    date: "15 февраля 2026",
    category: "Технологии",
    content: "Мы первыми среди российских B2C-сервисов внедрили пост-квантовую криптографию по стандартам NIST 2024 года. Теперь ваши данные защищены не только от современных угроз, но и от будущих квантовых компьютеров.",
  },
  "family-subscription": {
    title: 'Новый тариф "Семейный" — защитите до 5 близких',
    date: "1 февраля 2026",
    category: "Продукты",
    content: 'Запустили семейную подписку со скидкой 30%. Добавьте родителей и детей под одну крышу. Все преимущества CohortSec — для всей семьи по выгодной цене.',
  },
  "breach-check-feature": {
    title: "Запустили проверку утечек паролей",
    date: "20 января 2026",
    category: "Новые функции",
    content: "Теперь вы можете проверить, не утекли ли ваши пароли, не раскрывая их. Полная приватность благодаря k-anonymity. Ваш пароль никогда не покидает устройство.",
  },
  "investment-round": {
    title: "CohortSec привлёк 2 млн долларов инвестиций",
    date: "10 января 2026",
    category: "Компания",
    content: "Инвестиции пойдут на развитие технологий и расширение команды. Мы планируем запустить новые продукты и улучшить существующие сервисы.",
  },
};

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? newsData[slug] : null;

  if (!item) {
    return (
      <div className="min-h-screen bg-vg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Новость не найдена</h1>
          <Link to="/news" className="text-vg-accent hover:underline">← К новостям</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-vg-bg">
      <div className="page-container relative z-10">
        <Link to="/news" className="inline-flex items-center gap-2 text-vg-muted hover:text-vg-accent mb-8">
          <ArrowLeft size={20} /> К новостям
        </Link>
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <span className="text-vg-accent text-sm font-medium">{item.category}</span>
          <h1 className="gradient-text text-4xl mb-4 mt-2">{item.title}</h1>
          <time className="text-vg-muted text-sm block mb-6">{item.date}</time>
          <p className="text-vg-muted leading-relaxed">{item.content}</p>
        </motion.article>
      </div>
    </div>
  );
}
