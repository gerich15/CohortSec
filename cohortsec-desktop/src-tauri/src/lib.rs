//! CohortSec Desktop — Tauri backend
//! Цифровой телохранитель — защита семьи от киберугроз

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
async fn get_security_status() -> Result<u8, String> {
    // Placeholder — реальные данные приходят с API
    Ok(85)
}

#[tauri::command]
async fn trigger_security_check(app: tauri::AppHandle) -> Result<(), String> {
    // Отправить событие во фронтенд для проверки безопасности
    let _ = app.emit("check-security", ());
    // Показать уведомление
    app.notification()
        .builder()
        .title("Проверка безопасности")
        .body("Запущена проверка безопасности...")
        .show()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn set_autostart(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    let autolaunch = app.autolaunch();
    if enabled {
        autolaunch.enable().map_err(|e| e.to_string())?;
    } else {
        autolaunch.disable().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn is_autostart_enabled(app: tauri::AppHandle) -> Result<bool, String> {
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .setup(|app| {
            // Создание системного трея
            let show_i = MenuItem::with_id(app, "show", "Показать", true, None::<&str>)?;
            let check_i =
                MenuItem::with_id(app, "check", "Проверить безопасность", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Выход", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_i, &check_i, &quit_i])?;

            let icon = app.default_window_icon().cloned().unwrap_or_default();
            let _tray = TrayIconBuilder::with_id("main-tray")
                .icon(icon)
                .menu(&menu)
                .tooltip("CohortSec — Цифровой телохранитель")
                .menu_on_left_click(false)
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        if let Some(window) = tray.app_handle().get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "check" => {
                        let _ = app.emit("check-security", ());
                        let _ = app.notification().builder()
                            .title("Проверка")
                            .body("Запущена проверка безопасности")
                            .show();
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Скрыть в трей вместо закрытия
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_security_status,
            trigger_security_check,
            set_autostart,
            is_autostart_enabled,
        ])
        .run(tauri::generate_context!())
        .expect("Ошибка при запуске CohortSec");
}
