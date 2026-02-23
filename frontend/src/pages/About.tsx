import { TeamMember } from "../components/about/TeamMember";
import { BackgroundPaths } from "../components/ui/BackgroundPaths";

const team = [
  { name: "Александр Волков", role: "CEO и основатель", bio: "Бывший руководитель отдела безопасности в Яндексе. Эксперт по кибербезопасности с 15-летним стажем." },
  { name: "Екатерина Смирнова", role: "CTO, Lead Cryptographer", bio: "Кандидат наук, специалист по пост-квантовой криптографии. Участвовала в разработке стандартов NIST." },
  { name: "Дмитрий Козлов", role: "Lead ML Engineer", bio: "Эксперт по машинному обучению. Разрабатывал системы предсказания аномалий для крупных банков." },
  { name: "Мария Иванова", role: "Head of Product", bio: "Продакт с опытом в B2C-продуктах. Сделала сложные технологии понятными для миллионов пользователей." },
];

export default function About() {
  return (
    <div className="relative min-h-screen bg-vg-bg">
      <div className="absolute inset-0 z-0">
        <BackgroundPaths />
      </div>
      <div className="page-container relative z-10">
        <h1 className="gradient-text">О нас</h1>
        <p className="page-subtitle">Команда профессионалов, которые заботятся о вашей безопасности</p>
        <div className="mission-section">
          <h2>Наша миссия</h2>
          <p className="mission-text">
            Сделать сложную кибербезопасность простой и доступной для каждой семьи. Мы верим, что защита данных — это базовое право человека в цифровую эпоху.
          </p>
        </div>
        <div className="team-grid">
          {team.map((m, i) => <TeamMember key={i} member={m} index={i} />)}
        </div>
        <div className="stats-section">
          <div className="stat"><span className="stat-number">10 000+</span><span className="stat-label">Семей защищены</span></div>
          <div className="stat"><span className="stat-number">50+</span><span className="stat-label">Лет опыта команды</span></div>
          <div className="stat"><span className="stat-number">100%</span><span className="stat-label">Российская разработка</span></div>
        </div>
      </div>
    </div>
  );
}
