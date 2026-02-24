# Установка CohortSec Desktop

## Windows

### Системные требования

- Windows 10/11 (64-bit)
- WebView2 (обычно уже установлен в Windows 11)

### Установка

1. Скачайте установщик:
   - **MSI** — для установки через «Установка и удаление программ»
   - **NSIS (.exe)** — пошаговый мастер установки
   - **Портативная версия** — один `.exe` без установки

2. Запустите установщик и следуйте инструкциям.

3. При первом запуске Windows может показать предупреждение SmartScreen — нажмите «Подробнее» → «Выполнить в любом случае» (если доверяете источнику).

### WebView2

Если приложение не запускается, установите [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

---

## Linux

### Debian / Ubuntu

```bash
# Установка из .deb
sudo dpkg -i cohortsec_1.0.0_amd64.deb
sudo apt-get install -f  # установка зависимостей при необходимости
```

Зависимости: `libwebkit2gtk-4.1-0`, `libgtk-3-0`, `libnotify4`, `libappindicator3-1`.

### Fedora / RHEL

```bash
sudo rpm -i cohortsec-1.0.0-1.x86_64.rpm
# или
sudo dnf install cohortsec-1.0.0-1.x86_64.rpm
```

### AppImage (универсальный)

1. Скачайте `CohortSec_1.0.0_amd64.AppImage`
2. Сделайте исполняемым: `chmod +x CohortSec_1.0.0_amd64.AppImage`
3. Запустите: `./CohortSec_1.0.0_amd64.AppImage`

---

## Удаление

### Windows

- **Установленная версия**: «Параметры» → «Приложения» → найдите CohortSec → Удалить
- **Портативная**: удалите папку с приложением

### Linux (deb)

```bash
sudo apt remove cohortsec
```

### Linux (AppImage)

Удалите файл `.AppImage`.

---

## Решение проблем

### Приложение не запускается

- **Windows**: установите WebView2 Runtime
- **Linux**: установите зависимости: `sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0 libnotify4 libappindicator3-1`

### Нет иконки в трее (Linux)

Некоторые окружения (GNOME) требуют расширение для отображения иконок в трее. Установите расширение «AppIndicator» или «TopIcons».

### Ошибки подключения к API

Проверьте, что `https://api.cohortsec.ru` доступен. При использовании локального бэкенда пересоберите приложение с `VITE_API_URL=http://localhost:8000/api/v1`.
