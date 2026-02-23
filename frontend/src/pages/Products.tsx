import { ProductCard } from "../components/products/ProductCard";
import AuroraBorealisShader from "../components/ui/aurora-borealis-shader";

const products = [
  {
    id: "family-protection",
    title: "Семейная защита",
    description: "Защитите до 5 членов семьи под одной подпиской. Мониторинг входов, предсказание угроз, автоматические бэкапы.",
    icon: "family",
    features: ["Предиктивная аналитика", "Мониторинг 24/7", "До 5 пользователей"],
    price: "499 ₽/мес",
    popular: true,
  },
  {
    id: "password-monitor",
    title: "Монитор утечек",
    description: "Проверяйте, не утекли ли ваши пароли. Мгновенные уведомления о новых утечках.",
    icon: "lock",
    features: ["Проверка по базе утечек", "Уведомления в реальном времени", "10 000+ баз"],
    price: "199 ₽/мес",
    popular: false,
  },
  {
    id: "quantum-backup",
    title: "Квантовый бэкап",
    description: "Пост-квантовое шифрование для ваших фото, контактов и документов. Неприступно навсегда.",
    icon: "backup",
    features: ["PQC шифрование", "Автоматический бэкап", "100 ГБ хранилища"],
    price: "299 ₽/мес",
    popular: false,
  },
  {
    id: "biometric-auth",
    title: "Биометрический вход",
    description: "Вход по лицу для всей семьи. Забудьте о паролях.",
    icon: "biometric",
    features: ["Распознавание лиц", "Шифрование шаблонов", "До 10 пользователей"],
    price: "149 ₽/мес",
    popular: false,
  },
];

export default function Products() {
  return (
    <div className="relative min-h-screen">
      <AuroraBorealisShader />
      <div className="page-container relative z-10">
        <h1 className="gradient-text">Наши продукты</h1>
        <p className="page-subtitle">
          Выберите защиту, которая подходит именно вашей семье
        </p>
        <div className="products-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
