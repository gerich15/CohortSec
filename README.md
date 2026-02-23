# CohortSec — Ваш цифровой телохранитель

B2C-сервис для защиты себя и семьи в интернете: мониторинг входов, уровень защиты, бэкапы, проверка паролей и помощь при мошенничестве. Простой интерфейс и понятные подсказки.

## Возможности

| Раздел | Описание |
|--------|----------|
| **Уровень защиты** | Геймификация 0–100%: 2FA, бэкап, надёжный пароль повышают балл |
| **Семья** | До 5 родственников, приглашения по email |
| **Проверить безопасность** | Тревожная кнопка: входы за 24 ч, бэкап, утечка паролей (HIBP) |
| **Резервные копии** | Простой бэкап (фото, контакты, документы) и S3-совместимые облака |
| **События** | Лента аномалий и подозрительных входов с объяснениями |
| **Проверка паролей** | K-anonymity через Have I Been Pwned (пароль не уходит с устройства) |
| **Помощь при мошенничестве** | Отправка отчёта, полезные ссылки, контакты |
| **Статистика киберпреступлений** | Графики по данным МВД/Генпрокуратуры (мошенничество, взломы, кража данных) |

Дополнительно: MFA (TOTP), вход по лицу (биометрия), чат поддержки, юридические разделы (политика конфиденциальности, cookie, EULA).

## Стек

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery
- **Инфраструктура:** Docker Compose (PostgreSQL, Redis, MinIO, Keycloak, backend, frontend, Celery worker/beat)

## Быстрый старт

```bash
cp .env.example .env
# При необходимости отредактируйте .env (пароли, SECRET_KEY)
docker compose up --build
```

- **Сайт:** http://localhost:3000  
- **API (Swagger):** http://localhost:8000/docs  
- **API (ReDoc):** http://localhost:8000/redoc  

**Тестовый вход:** логин и пароль из учётной записи, созданной при первом запуске (если включён `CREATE_DEFAULT_ADMIN`), или после регистрации на сайте.

## Структура проекта

```
Vanguard/
├── frontend/          # React SPA (Vite)
├── backend/           # FastAPI, Celery
├── docker-compose.yml
├── .env.example
└── README.md
```

## Переменные окружения

Основные переменные задаются в `.env` (см. `.env.example`):

- **Безопасность:** `SECRET_KEY`, `POSTGRES_PASSWORD`, `ENCRYPTION_KEY` — обязательно сменить в production
- **Production:** `DEBUG=false`, `CREATE_DEFAULT_ADMIN=false`, `TOKEN_COOKIE_SECURE=true`, `ALLOWED_ORIGINS=https://your-domain.com`
- **SMTP:** для отправки приглашений в семью и писем восстановления
- **Бэкапы:** MinIO/S3 (endpoint, ключи, bucket) для резервного копирования

## Деплой

- **Docker:** `docker compose up -d`. Health-check API: `GET /health` (проверка БД и Redis).
- **Kubernetes:** пример манифеста и бэкапы PostgreSQL описаны в комментариях в `docker-compose.yml` и в коде backend; секреты — через Secrets/ConfigMap.
- Перед production: отключить создание дефолтного admin, задать надёжные пароли и `SECRET_KEY`, включить HTTPS и Secure cookies.

## Документация и безопасность

- **API:** интерактивная документация по адресам выше (`/docs`, `/redoc`).
- **Политика безопасности:** см. [SECURITY.md](SECURITY.md) — меры защиты, шифрование, rate limiting, порядок сообщения об уязвимостях.

## Лицензия

MIT
