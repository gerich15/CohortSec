import { Link } from "react-router-dom";

export default function LegalInfo() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">Юридическая информация</h1>
      <div className="space-y-6 text-white/90 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Юридический адрес</h2>
          <p>CohortSec, Россия</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Контактная информация</h2>
          <p>Email: support@cohortsec.example</p>
          <p>Поддержка: раздел «Поддержка»</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Применимое право</h2>
          <p>Законодательство РФ: ГК РФ, ФЗ-152, ФЗ-149.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Соглашения</h2>
          <ul className="space-y-2">
            <li><Link to="/legal/privacy" className="text-vg-accent hover:underline">Политика конфиденциальности</Link></li>
            <li><Link to="/legal/terms" className="text-vg-accent hover:underline">Условия использования</Link></li>
            <li><Link to="/legal/eula" className="text-vg-accent hover:underline">Лицензионное соглашение (EULA)</Link></li>
            <li><Link to="/legal/cookies" className="text-vg-accent hover:underline">Политика cookie</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
