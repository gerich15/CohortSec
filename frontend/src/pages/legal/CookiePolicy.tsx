export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8">Политика использования cookie</h1>
      <div className="space-y-8 text-white/90 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">1. Общие положения</h2>
          <p>
            Настоящая Политика использования cookie (далее — «Политика») применяется к веб-сайту CohortSec и описывает
            виды cookie, которые мы используем, цели их использования и ваши права в отношении cookie.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">2. Что такое cookie</h2>
          <p>
            Cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении веб-сайтов.
            Cookie позволяют сайту распознать устройство и запомнить определённые данные о ваших предпочтениях или действиях.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">3. Виды cookie</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Строго необходимые</strong> — для работы сайта, аутентификации и безопасности.</li>
            <li><strong>Функциональные</strong> — запоминают настройки (язык, согласие на cookie).</li>
            <li><strong>Аналитические</strong> — помогают улучшать работу сайта.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">4. Управление cookie</h2>
          <p>
            Вы можете отключить cookie в настройках браузера. Отключение строго необходимых cookie может повлиять на
            работоспособность сайта.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">5. Согласие</h2>
          <p>
            Продолжая использовать сайт после нажатия «Принять», вы даёте согласие на использование cookie в соответствии
            с настоящей Политикой.
          </p>
        </section>
      </div>
    </div>
  );
}
