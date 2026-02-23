import { ExternalLink, Scale, Building2, FileText, CreditCard, Gavel } from "lucide-react";

const LINKS = [
  {
    title: "МВД — приём заявлений (киберполиция)",
    url: "https://мвд.рф",
    desc: "Приём обращений о киберпреступлениях. Можно подать онлайн.",
    icon: Scale,
  },
  {
    title: "Госуслуги — подача заявления",
    url: "https://gosuslugi.ru",
    desc: "Удобная подача заявления в полицию онлайн.",
    icon: FileText,
  },
  {
    title: "Роскомнадзор",
    url: "https://rkn.gov.ru",
    desc: "Если утекли персональные данные, нарушена конфиденциальность.",
    icon: Building2,
  },
  {
    title: "Банк России",
    url: "https://cbr.ru",
    desc: "Финансовое мошенничество, незаконные микрофинансовые организации.",
    icon: CreditCard,
  },
  {
    title: "Прокуратура РФ",
    url: "https://epp.genproc.gov.ru",
    desc: "В особых случаях, когда нужно надзорное обращение.",
    icon: Gavel,
  },
];

export default function FraudHelpComplain() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">
        Куда жаловаться (официально)
      </h1>
      <p className="text-lg text-white/90">
        Государственные органы, куда можно подать заявление. Ссылки открываются в новом окне.
      </p>

      <div className="space-y-4">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 p-6 rounded-xl border border-white/10 bg-vg-surface/30 hover:bg-vg-surface/50 hover:border-vg-accent/30 transition-all group"
            >
              <Icon className="w-8 h-8 shrink-0 text-vg-accent" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold group-hover:text-vg-accent transition-colors flex items-center gap-2">
                  {item.title}
                  <ExternalLink className="w-4 h-4 shrink-0 opacity-60" />
                </h3>
                <p className="text-vg-muted text-sm mt-1">{item.desc}</p>
              </div>
            </a>
          );
        })}
      </div>

      <div className="text-sm text-vg-muted p-4 rounded-lg bg-white/5 border border-white/5">
        <p>
          При подаче заявления в полицию приложите скриншоты переписок, чеки переводов и любые другие доказательства.
        </p>
      </div>
    </div>
  );
}
