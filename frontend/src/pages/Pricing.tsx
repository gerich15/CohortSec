import {
  ModernPricingPage,
  type PricingCardProps,
} from "../components/ui/AnimatedGlassyPricing";

const plans: PricingCardProps[] = [
  {
    planName: "Бесплатно",
    description: "Базовые возможности для знакомства",
    price: "0",
    period: "навсегда",
    features: ["Проверка 10 паролей в месяц", "Базовый мониторинг", "Email поддержка"],
    buttonText: "Начать",
    buttonVariant: "secondary",
  },
  {
    planName: "Семейный",
    description: "Защита для всей семьи",
    price: "499",
    period: "/мес",
    features: [
      "До 5 пользователей",
      "Предиктивная аналитика",
      "Мониторинг 24/7",
      "Проверка 100 паролей/мес",
      "Приоритетная поддержка",
    ],
    buttonText: "Выбрать план",
    isPopular: true,
    buttonVariant: "primary",
  },
  {
    planName: "Премиум",
    description: "Максимальная защита",
    price: "999",
    period: "/мес",
    features: [
      "До 10 пользователей",
      "Всё из Семейного",
      "Квантовый бэкап 100 ГБ",
      "Проверка 1000 паролей/мес",
      "Персональный менеджер",
    ],
    buttonText: "Связаться с нами",
    buttonVariant: "primary",
  },
];

export default function Pricing() {
  return (
    <ModernPricingPage
      title={
        <>
          Выберите <span className="text-vg-accent">подходящий план</span> для семьи
        </>
      }
      subtitle="Начните бесплатно, затем расширяйте возможности. Гибкие тарифы под любые задачи."
      plans={plans}
      showAnimatedBackground={true}
    />
  );
}
