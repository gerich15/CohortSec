# Политика безопасности CohortSec

CohortSec — платформа защиты данных, построенная с учётом лучших практик индустриальной и регуляторной безопасности (ISO 27001, PCI DSS, NIST, OWASP Top 10).

## Применяемые меры безопасности

### 1. Аутентификация и управление доступом (IAM)

- **Хэширование паролей**: Argon2id (с обратной совместимостью bcrypt)
- **Политика паролей**: минимум 12 символов, заглавные, строчные буквы, цифры, спецсимволы
- **HIBP при регистрации**: проверка пароля по базе Have I Been Pwned (k-anonymity)
- **MFA (2FA)**: TOTP (Google Authenticator, Authy); TOTP secret шифруется в БД (AES-256)
- **JWT + Refresh tokens**: короткий access token (15 мин), refresh с ротацией (7 дней)
- **HttpOnly cookies**: токены в Secure cookies (недоступны для JS/XSS)
- **Rate limiting**: 5 попыток/мин на login и register; 10/мин на MFA verify; 20/мин на refresh

### 2. Защита API и бэкенда

- **Валидация входных данных**: Pydantic-схемы для всех API
- **Защита от SQL-инъекций**: SQLAlchemy ORM, параметризованные запросы
- **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, HSTS, CSP
- **CORS**: строгая политика только для доверенных origins (ALLOWED_ORIGINS)
- **JWT**: HS256, короткое время жизни access token; MFA-токены ограничены по scope

### 3. Шифрование

- **Data at rest**: Fernet (AES-256) для биометрических шаблонов и TOTP secrets; ключ хранится отдельно (ENCRYPTION_KEY)
- **Data in transit**: TLS 1.2+ (рекомендуется TLS 1.3); HSTS включён
- **Пароли**: только Argon2id/bcrypt-хэши, никогда plain text

### 4. Безопасность файлов и загрузок

- **ClamAV**: опциональное сканирование загружаемых файлов (CLAMAV_ENABLED=true)
- **Проверка типов**: ограниченный список разрешённых расширений (fraud reports)
- **Ограничение размера**: 10 МБ на файл, до 10 файлов
- **Хранение**: uploads вне document root

### 5. Специфика CohortSec

- **Проверка утечек паролей**: k-anonymity, пароли не покидают устройство
- **Fraud reports**: reCAPTCHA, rate limit 3/день по IP, анонимизация при поиске
- **Логирование**: UserAction, Anomaly для обнаружения подозрительной активности

### 6. Инфраструктура и DevOps

- **Secrets**: через переменные окружения (.env), не в репозитории
- **Docker**: контейнер backend запускается от непривилегированного пользователя appuser
- **TLS 1.3**: nginx-ssl.conf для production; certbot + Let's Encrypt
- **Зависимости**: регулярный аудит (pip-audit, npm audit)

### TLS (Let's Encrypt)

```bash
certbot certonly --webroot -w /usr/share/nginx/html -d example.com
# Обновите nginx-ssl.conf: ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
# Установите TOKEN_COOKIE_SECURE=true в production
```

## Сообщение об уязвимостях

Мы серьёзно относимся к безопасности. Если вы обнаружили уязвимость:

1. **НЕ** создавайте публичный issue в GitHub
2. Отправьте описание на **security@cohortsec.example** (замените на реальный адрес)
3. Укажите шаги воспроизведения, версию, окружение
4. Мы ответим в течение 72 часов и обновим статус расследования

### Политика раскрытия (Coordinated Disclosure)

- Мы подтверждаем получение отчёта
- Исправляем уязвимость в разумные сроки
- Уведомляем вас после выпуска патча
- При желании — упоминание в списке благодарностей (с вашего согласия)

### Bug bounty

Программа bug bounty на данный момент не активна. Мы рассматриваем её запуск в будущем.

## Соответствие стандартам

| Стандарт      | Статус                               |
|---------------|--------------------------------------|
| OWASP Top 10  | Реализованы основные меры            |
| ISO 27001     | Частичное соответствие               |
| PCI DSS       | Не храним платёжные данные           |
| GDPR/152-ФЗ   | Право на удаление, согласие          |

## Контакты

- **Security**: security@cohortsec.example
- **Поддержка**: support@cohortsec.example

---

*Последнее обновление: 2025*
