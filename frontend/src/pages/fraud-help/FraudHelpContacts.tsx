import { Phone, MessageCircle, Clock, AlertTriangle } from "lucide-react";

export default function FraudHelpContacts() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">Контакты для срочной связи</h1>
      <p className="text-lg text-white/90">Если ситуация критическая — звоните в экстренные службы.</p>
      <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-4">
        <AlertTriangle className="w-8 h-8 shrink-0 text-amber-400" />
        <div>
          <p className="font-semibold mb-1">Экстренные службы России</p>
          <p className="text-vg-muted text-sm">112 — единый номер. 102 — полиция.</p>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-vg-surface/30 p-6">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Phone className="w-5 h-5 text-vg-accent" />
          CohortSec — поддержка
        </h3>
        <p className="text-vg-muted text-sm mb-2">Используйте форму «Сообщить о мошеннике».</p>
        <p className="text-vg-accent">support@cohortsec.example</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-vg-surface/30 p-6 flex gap-4">
        <Clock className="w-8 h-8 shrink-0 text-vg-accent" />
        <div>
          <h3 className="font-bold mb-1">Время ответа</h3>
          <p className="text-vg-muted text-sm">Обычно 24 часа. В критических случаях — быстрее.</p>
        </div>
      </div>
    </div>
  );
}
