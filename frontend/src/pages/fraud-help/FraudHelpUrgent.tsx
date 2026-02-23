import { useState } from "react";
import { Shield, Smartphone, Banknote, AlertTriangle, Check } from "lucide-react";

type ChecklistItem = { id: string; text: string; done: boolean };

const ACCOUNT_STEPS: string[] = [
  "Смените пароль (если ещё есть доступ)",
  "Проверьте привязанные устройства и отзовите доступ",
  "Включите двухфакторную аутентификацию (2FA)",
  "Предупредите друзей (чтобы не просили денег от вашего имени)",
];

const MONEY_STEPS: string[] = [
  "Срочно звоните в банк на горячую линию",
  "Заблокируйте карту через приложение или по телефону",
  "Напишите заявление в полицию (киберполиция)",
];

const THREAT_STEPS: string[] = [
  "Не платите — часто не перестанут даже после оплаты",
  "Сохраните все скриншоты переписок и угроз",
  "Обратитесь в киберполицию (ГИБДД/МВД)",
];

export default function FraudHelpUrgent() {
  const [account, setAccount] = useState<ChecklistItem[]>(
    ACCOUNT_STEPS.map((t, i) => ({ id: `a-${i}`, text: t, done: false }))
  );
  const [money, setMoney] = useState<ChecklistItem[]>(
    MONEY_STEPS.map((t, i) => ({ id: `m-${i}`, text: t, done: false }))
  );
  const [threat, setThreat] = useState<ChecklistItem[]>(
    THREAT_STEPS.map((t, i) => ({ id: `t-${i}`, text: t, done: false }))
  );

  const toggle = (
    set: React.Dispatch<React.SetStateAction<ChecklistItem[]>>,
    id: string
  ) => {
    set((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">
        Срочные действия
      </h1>
      <p className="text-lg text-white/90">
        Пошаговый чек-лист. Отмечайте пункты по мере выполнения (сохраняется локально на устройстве).
      </p>

      <section className="rounded-xl border border-white/10 bg-vg-surface/30 p-6">
        <h2 className="flex items-center gap-2 font-bold text-xl mb-4">
          <Smartphone className="w-6 h-6 text-vg-accent" />
          Если взломали аккаунт
        </h2>
        <ul className="space-y-3">
          {account.map((item) => (
            <li
              key={item.id}
              onClick={() => toggle(setAccount, item.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                item.done ? "bg-green-500/10 text-green-300" : "hover:bg-white/5"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  item.done ? "border-green-400 bg-green-500/20" : "border-white/30"
                }`}
              >
                {item.done && <Check className="w-4 h-4" />}
              </span>
              <span className={item.done ? "line-through opacity-80" : ""}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-white/10 bg-vg-surface/30 p-6">
        <h2 className="flex items-center gap-2 font-bold text-xl mb-4 text-red-400">
          <Banknote className="w-6 h-6" />
          Если перевели деньги
        </h2>
        <ul className="space-y-3">
          {money.map((item) => (
            <li
              key={item.id}
              onClick={() => toggle(setMoney, item.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                item.done ? "bg-green-500/10 text-green-300" : "hover:bg-white/5"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  item.done ? "border-green-400 bg-green-500/20" : "border-white/30"
                }`}
              >
                {item.done && <Check className="w-4 h-4" />}
              </span>
              <span className={item.done ? "line-through opacity-80" : ""}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-white/10 bg-vg-surface/30 p-6">
        <h2 className="flex items-center gap-2 font-bold text-xl mb-4 text-amber-400">
          <AlertTriangle className="w-6 h-6" />
          Если угрожают или шантажируют
        </h2>
        <ul className="space-y-3">
          {threat.map((item) => (
            <li
              key={item.id}
              onClick={() => toggle(setThreat, item.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                item.done ? "bg-green-500/10 text-green-300" : "hover:bg-white/5"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  item.done ? "border-green-400 bg-green-500/20" : "border-white/30"
                }`}
              >
                {item.done && <Check className="w-4 h-4" />}
              </span>
              <span className={item.done ? "line-through opacity-80" : ""}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
