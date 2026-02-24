# CohortSec Desktop

Десктопное приложение **CohortSec — Цифровой телохранитель** для Windows и Linux на базе [Tauri 2](https://v2.tauri.app/).

## Возможности

- Весь функционал веб-версии CohortSec
- Системный трей с индикатором и быстрым доступом
- Нативные уведомления
- Автозапуск при старте системы
- Скрытие в трей при закрытии окна
- Горячие клавиши (Ctrl+Q — выход, Ctrl+, — настройки)
- Сборки: Windows (EXE, MSI, NSIS), Linux (AppImage, DEB, RPM)

## Требования

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install)
- [Системные зависимости Tauri](https://v2.tauri.app/start/prerequisites/):
  - **Linux**: webkit2gtk, libgtk-3, libappindicator, libnotify
  - **Windows**: Microsoft C++ Build Tools, WebView2

## Установка зависимостей

```bash
# В корне проекта Vanguard
cd cohortsec-desktop
npm install

# Зависимости фронтенда (если ещё не установлены)
cd ../frontend && npm install && cd ../cohortsec-desktop
```

## Разработка

```bash
# Запуск в режиме разработки (с hot-reload)
npm run dev
```

Приложение откроется с подключением к `http://localhost:3000`. Для работы с API нужен запущенный бэкенд на `http://localhost:8000` или настройка `VITE_API_URL`.

## Сборка

```bash
# Сборка для текущей платформы
npm run build

# Сборка для Windows (на Linux через cross-compile или на Windows)
npm run build:windows

# Сборка для Linux
npm run build:linux
```

### Результаты сборки

- **Windows**: `src-tauri/target/release/bundle/` — `.exe`, `.msi`, NSIS-установщик
- **Linux**: `src-tauri/target/release/bundle/` — `.deb`, `.AppImage`, `.rpm`

### API URL при сборке

По умолчанию используется `https://api.cohortsec.ru/api/v1`. Для локального бэкенда:

```bash
VITE_API_URL=http://localhost:8000/api/v1 npm run build
```

## Структура

```
cohortsec-desktop/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs      # Трей, команды, плагины
│   ├── icons/
│   ├── capabilities/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── README.md
```

Фронтенд находится в `../frontend/` и используется при сборке.

## Горячие клавиши

| Клавиши | Действие |
|---------|----------|
| Ctrl+Q / Cmd+Q | Выход |
| Ctrl+, | Настройки |
| Ctrl+Shift+S | Проверка безопасности |

## Лицензия

© 2026 CohortSec
