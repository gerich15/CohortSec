import { Link } from "react-router-dom";
import { Phone, Shield, Users, Globe, TrendingUp, Heart, Key } from "lucide-react";

const SCHEMES = [
  { icon: Phone, title: "Звонок из банка", desc: "Просят код из SMS. Никогда не называйте коды.", action: "Перезвоните в банк по номеру с карты." },
  { icon: Shield, title: "Безопасный счёт", desc: "Убеждают перевести на защищённый счёт.", action: "Банки не просят переводить. Звоните в банк." },
  { icon: Users, title: "Взлом аккаунта друга", desc: "Пишут от имени знакомого: срочно нужны деньги.", action: "Позвоните другу голосом." },
  { icon: Globe, title: "Фейковый сайт", desc: "Копия магазина. Вводите карту - списывают.", action: "Проверяйте адрес. Не по ссылкам из писем." },
  { icon: TrendingUp, title: "Инвестиции", desc: "Обещают высокий доход. Просят вложить больше.", action: "Сверхдоходность = мошенничество. Проверяйте лицензии ЦБ." },
  { icon: Heart, title: "Романтические знакомства", desc: "Просят деньги: на билет, на лечение.", action: "Не переводите людям, с которыми не встречались." },
  { icon: Key, title: "Код подтверждения", desc: "Просят код для входа - это код перевода.", action: "Никогда не отправляйте коды из SMS." },
];

export default function FraudHelpSchemes() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">База знаний: схемы</h1>
      <p className="text-lg text-white/90">Популярные схемы мошенничества.</p>
      <div className="space-y-6">
        {SCHEMES.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border border-white/10 bg-vg-surface/30 p-6">
              <h2 className="flex items-center gap-2 font-bold text-xl mb-3"><Icon className="w-6 h-6 text-vg-accent" />{s.title}</h2>
              <p className="text-vg-muted mb-4">{s.desc}</p>
              <p className="text-green-400/90 font-medium mb-4">Что делать: {s.action}</p>
              <Link to="/fraud-help/report" className="text-vg-accent hover:underline text-sm">Сообщить о таком случае</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
