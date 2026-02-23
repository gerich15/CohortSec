import { Link } from "react-router-dom";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const HELPS = [
  "Взлом аккаунтов в соцсетях",
  "Фишинговые сайты",
  "Кража личных данных",
  "Подозрительные ссылки",
  "Шантаж в интернете",
];

const CANT_HELP = [
  "Вернуть деньги (нужно в банк/полицию)",
  "Уголовное преследование",
  "Техническая сложная экспертиза",
  "Если мошенник за границей",
  "Если нет никаких доказательств",
];

export default function FraudHelpAbout() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">
        Помощь пострадавшим от кибермошенников
      </h1>
      <p className="text-lg text-white/90">
        Если вы столкнулись с мошенничеством в интернете — не паникуйте. Мы поможем разобраться и подскажем, что делать.
      </p>

      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 flex gap-4">
        <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Вы не виноваты</p>
          <p className="text-sm">
            Мошенники — профессионалы, они обманывают тысячи людей. Не отправляйте им больше денег, даже если обещают вернуть.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-vg-surface/30 p-6">
          <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-green-400">
            <CheckCircle className="w-5 h-5" />
            С чем мы поможем
          </h3>
          <ul className="space-y-2">
            {HELPS.map((item, i) => (
              <li key={i} className="flex gap-2 text-vg-muted">
                <span className="text-green-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-vg-surface/30 p-6">
          <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-amber-400">
            <XCircle className="w-5 h-5" />
            С чем вряд ли сможем
          </h3>
          <ul className="space-y-2">
            {CANT_HELP.map((item, i) => (
              <li key={i} className="flex gap-2 text-vg-muted">
                <span className="text-amber-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-sm text-vg-muted p-4 rounded-lg bg-white/5 border border-white/5">
        <p className="font-semibold text-white mb-1">Важно:</p>
        <p>
          CohortSec не является правоохранительным органом. Мы не гарантируем возврат денег и не берёмся за уголовные дела. Информация может быть передана в соответствующие органы, если потребуется.
        </p>
      </div>

      <Link
        to="/fraud-help/report"
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-semibold rounded-xl transition-colors"
      >
        <Shield className="w-5 h-5" />
        Сообщить о мошеннике
      </Link>
    </div>
  );
}
