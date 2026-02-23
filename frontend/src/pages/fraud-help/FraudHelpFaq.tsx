import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const FAQ = [
  {
    q: "Меня взломали в Telegram, что делать?",
    a: "Сразу смените пароль в настройках Telegram. Проверьте привязанные сессии (Настройки → Устройства) и завершите подозрительные. Включите двухфакторную аутентификацию. Предупредите контактов, чтобы не переводили деньги по просьбам от вашего имени. Можете сообщить нам через форму — подскажем дальнейшие шаги.",
  },
  {
    q: "Перевёл деньги мошеннику на карту, можно ли вернуть?",
    a: "Срочно звоните в банк на горячую линию и блокируйте карту. Банк может отозвать перевод в течение короткого времени. Одновременно пишите заявление в полицию (киберполиция). Мы не можем вернуть деньги — это делает только банк или суд.",
  },
  {
    q: "Мошенник угрожает опубликовать мои фото",
    a: "Не платите. Часто после оплаты угрозы не прекращаются. Сохраните все скриншоты и переписки. Обратитесь в киберполицию. Угроза распространения интимных материалов — статья УК РФ.",
  },
  {
    q: "Куда писать заявление в полицию?",
    a: "Через Госуслуги (подача заявления онлайн) или лично в отдел полиции. Для киберпреступлений — отделение по борьбе с киберпреступностью (К) МВД. Можно также через сайт МВД.",
  },
  {
    q: "Сколько ждать ответа от вас?",
    a: "Обычно мы отвечаем в течение 24 часов. В критических ситуациях — быстрее. Ответ приходит на указанный email.",
  },
  {
    q: "Вы можете найти мошенника?",
    a: "Мы не правоохранительный орган и не проводим розыск. Мы помогаем сориентироваться, куда обращаться, и передаём информацию в соответствующие органы при необходимости.",
  },
];

export default function FraudHelpFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">
        Частые вопросы
      </h1>
      <p className="text-lg text-white/90">
        Ответы на типовые вопросы. Не нашли свой — напишите нам через форму.
      </p>

      <div className="space-y-2">
        {FAQ.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-vg-surface/30 overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
              <span className="font-medium">{item.q}</span>
              {open === i ? (
                <ChevronUp className="w-5 h-5 shrink-0 text-vg-muted" />
              ) : (
                <ChevronDown className="w-5 h-5 shrink-0 text-vg-muted" />
              )}
            </button>
            {open === i && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-vg-muted leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Link
        to="/fraud-help/report"
        className="inline-block text-vg-accent hover:underline"
      >
        Сообщить о мошеннике →
      </Link>
    </div>
  );
}
