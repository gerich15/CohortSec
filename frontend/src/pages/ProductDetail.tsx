import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
const products: Record<string, { title: string; description: string; features: string[]; price: string }> = {
  "family-protection": {
    title: "Семейная защита",
    description: "Защитите до 5 членов семьи под одной подпиской. Мониторинг входов, предсказание угроз, автоматические бэкапы.",
    features: ["Предиктивная аналитика", "Мониторинг 24/7", "До 5 пользователей", "Автоматические бэкапы", "Биометрический вход"],
    price: "499 ₽/мес",
  },
  "password-monitor": {
    title: "Монитор утечек",
    description: "Проверяйте, не утекли ли ваши пароли. Мгновенные уведомления о новых утечках. Проверка происходит анонимно — пароль не покидает устройство.",
    features: ["Проверка по базе утечек", "Уведомления в реальном времени", "10 000+ баз", "k-anonymity технология"],
    price: "199 ₽/мес",
  },
  "quantum-backup": {
    title: "Квантовый бэкап",
    description: "Пост-квантовое шифрование для ваших фото, контактов и документов. Неприступно навсегда.",
    features: ["PQC шифрование", "Автоматический бэкап", "100 ГБ хранилища", "Многократное шифрование"],
    price: "299 ₽/мес",
  },
  "biometric-auth": {
    title: "Биометрический вход",
    description: "Вход по лицу для всей семьи. Забудьте о паролях. Шифрованные шаблоны, полная приватность.",
    features: ["Распознавание лиц", "Шифрование шаблонов", "До 10 пользователей", "Работает офлайн"],
    price: "149 ₽/мес",
  },
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? products[slug] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-vg-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Продукт не найден</h1>
          <Link to="/products" className="text-vg-accent hover:underline">← К продуктам</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-vg-bg">
      <div className="page-container relative z-10">
        <Link to="/products" className="inline-flex items-center gap-2 text-vg-muted hover:text-vg-accent mb-8">
          <ArrowLeft size={20} /> К продуктам
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <h1 className="gradient-text text-4xl mb-4">{product.title}</h1>
          <p className="text-vg-muted text-lg mb-8">{product.description}</p>
          <ul className="space-y-2 mb-8">
            {product.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-vg-muted">
                <span className="w-2 h-2 rounded-full bg-vg-accent" />
                {f}
              </li>
            ))}
          </ul>
          <p className="text-2xl font-bold text-vg-accent">{product.price}</p>
          <Link
            to="/register"
            className="mt-6 inline-block px-6 py-3 rounded-full bg-gradient-to-r from-neon-green to-vg-accent text-vg-bg font-semibold hover:opacity-90 transition-opacity"
          >
            Начать
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
