import { Link } from "react-router-dom";
import { Link2, Lock, Shield, FileCheck, ExternalLink } from "lucide-react";

const SITES = [
  {
    icon: Link2,
    title: "Проверка ссылок и сайтов",
    description: "Проверить, не фишинг ли ссылка или подозрительный сайт.",
    links: [
      { name: "VirusTotal", url: "https://www.virustotal.com", desc: "Проверка URL и файлов на вирусы и фишинг" },
      { name: "Google Safe Browsing", url: "https://transparencyreport.google.com/safe-browsing/search", desc: "Проверка адреса на вредоносность" },
      { name: "URLVoid", url: "https://www.urlvoid.com", desc: "Анализ домена по чёрным спискам" },
      { name: "2IP", url: "https://2ip.ru", desc: "Информация об IP, домене, WHOIS" },
    ],
  },
  {
    icon: Lock,
    title: "Безопасность паролей и аккаунтов",
    description: "Утечки паролей, надёжность пароля.",
    links: [
      { name: "Have I Been Pwned", url: "https://haveibeenpwned.com", desc: "Проверка email и паролей на утечки" },
      { name: "CohortSec — Проверки", url: "/app/checks", desc: "Проверка паролей (k-anonymity), поиск по соцсетям (в личном кабинете)" },
    ],
  },
  {
    icon: Shield,
    title: "Официальные ресурсы (РФ)",
    description: "Госуслуги, МВД, ЦБ, жалобы на мошенников.",
    links: [
      { name: "Госуслуги", url: "https://www.gosuslugi.ru", desc: "Заявления, услуги, обратная связь" },
      { name: "МВД России", url: "https://мвд.рф", desc: "Приём обращений, киберполиция" },
      { name: "Центральный банк РФ", url: "https://www.cbr.ru", desc: "Информация о финансовых организациях и мошенничествах" },
      { name: "Реестр мошеннических сайтов (ЦБ)", url: "https://www.cbr.ru/banking_and_security/financial_markets/microfinance/", desc: "Проверка МФО и сомнительных организаций" },
      { name: "Роскомнадзор — блокировки", url: "https://eais.rkn.gov.ru", desc: "Реестр запрещённых сайтов" },
    ],
  },
  {
    icon: FileCheck,
    title: "Проверка организаций и контрагентов",
    description: "Убедиться, что компания или ИП существуют и не в чёрном списке.",
    links: [
      { name: "ФНС — проверка ИП и юрлиц", url: "https://egrul.nalog.ru", desc: "Официальный реестр ФНС" },
      { name: "Банк России — финансовые организации", url: "https://www.cbr.ru/finmarkets/supervision/", desc: "Лицензии банков, МФО, страховых" },
    ],
  },
];

export default function FraudHelpUsefulSites() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">Полезные сайты</h1>
      <p className="text-lg text-white/90">
        Ссылки на сервисы для проверки ссылок, доменов, утечек паролей и официальные ресурсы. Открывайте в новой вкладке и проверяйте подозрительные сайты и контакты.
      </p>

      {SITES.map((section) => (
        <section
          key={section.title}
          className="rounded-xl border border-white/10 bg-vg-surface/30 p-6"
        >
          <h2 className="flex items-center gap-2 font-bold text-xl mb-1">
            <section.icon className="w-6 h-6 text-vg-accent" />
            {section.title}
          </h2>
          <p className="text-vg-muted text-sm mb-4">{section.description}</p>
          <ul className="space-y-3">
            {section.links.map((link) => {
              const isExternal = link.url.startsWith("http");
              const className =
                "flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group";
              const content = (
                <>
                  <ExternalLink className="w-4 h-4 text-vg-muted shrink-0 mt-0.5 group-hover:text-vg-accent" />
                  <div className="min-w-0">
                    <span className="font-medium text-vg-accent group-hover:underline">
                      {link.name}
                    </span>
                    <p className="text-sm text-vg-muted mt-0.5">{link.desc}</p>
                  </div>
                </>
              );
              return (
                <li key={link.url}>
                  {isExternal ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
                      {content}
                    </a>
                  ) : (
                    <Link to={link.url} className={className}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
