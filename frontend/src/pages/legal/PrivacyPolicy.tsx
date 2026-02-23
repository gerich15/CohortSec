export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">Политика конфиденциальности</h1>
      <div className="space-y-6 text-white/90 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Общие положения</h2>
          <p>Настоящая Политика разработана в соответствии с ФЗ-152 «О персональных данных» и определяет порядок обработки данных пользователей CohortSec.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Категории данных</h2>
          <p>Мы обрабатываем: имя, email, данные аутентификации, технические данные (IP, cookies), сведения об использовании Сервиса.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Защита данных</h2>
          <p>Применяются технические меры: Argon2id, AES-256, MFA, логирование доступа.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Права пользователя</h2>
          <p>Вы вправе запросить доступ, исправление, удаление данных. Обращения: support@cohortsec.example</p>
        </section>
      </div>
    </div>
  );
}
