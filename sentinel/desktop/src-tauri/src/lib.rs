use rusqlite::{Connection, OptionalExtension};
use std::{
    path::PathBuf,
    sync::atomic::{AtomicBool, Ordering},
};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::window::{Color, Effect, EffectsBuilder};
use tauri::{Emitter, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

struct Database(PathBuf);
struct CloseToTray(AtomicBool);

fn main_only(window: &WebviewWindow) -> Result<(), String> {
    if window.label() != "main" {
        return Err("Command is restricted to the main window".into());
    }
    Ok(())
}

fn connect(path: &PathBuf) -> Result<Connection, String> {
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.busy_timeout(std::time::Duration::from_secs(3))
        .map_err(|e| e.to_string())?;
    Ok(conn)
}

#[tauri::command]
async fn load_state(db: tauri::State<'_, Database>) -> Result<Option<String>, String> {
    let path = db.0.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let conn = connect(&path)?;
        conn.query_row("SELECT payload FROM workspace WHERE id=1", [], |r| r.get(0))
            .optional()
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn save_state(
    window: WebviewWindow,
    db: tauri::State<'_, Database>,
    payload: String,
) -> Result<(), String> {
    main_only(&window)?;
    if payload.len() > 2_000_000 {
        return Err("Workspace exceeds the 2 MB limit; export and trim history".into());
    }
    let value: serde_json::Value = serde_json::from_str(&payload).map_err(|e| e.to_string())?;
    if value
        .get("state")
        .and_then(|s| s.get("version"))
        .and_then(|v| v.as_u64())
        != Some(1)
    {
        return Err("Unsupported workspace schema".into());
    }
    let path = db.0.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let mut conn = connect(&path)?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;
        tx.execute("INSERT INTO workspace(id,payload) VALUES(1,?1) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=CURRENT_TIMESTAMP", [payload]).map_err(|e|e.to_string())?;
        tx.commit().map_err(|e| e.to_string())
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
fn set_close_to_tray(
    window: WebviewWindow,
    state: tauri::State<'_, CloseToTray>,
    enabled: bool,
) -> Result<(), String> {
    main_only(&window)?;
    state.0.store(enabled, Ordering::Relaxed);
    Ok(())
}

#[tauri::command]
fn close_main(window: WebviewWindow, state: tauri::State<'_, CloseToTray>) -> Result<(), String> {
    main_only(&window)?;
    if state.0.load(Ordering::Relaxed) {
        window.hide().map_err(|e| e.to_string())?;
    } else {
        window.app_handle().exit(0);
    }
    Ok(())
}

#[tauri::command]
fn set_backdrop(
    window: WebviewWindow,
    mode: String,
    tint: String,
    opacity: u8,
) -> Result<String, String> {
    main_only(&window)?;
    if !["Acrylic", "Mica", "Opaque"].contains(&mode.as_str()) {
        return Err("Unsupported backdrop".into());
    }
    #[cfg(windows)]
    {
        use winreg::{enums::HKEY_CURRENT_USER, RegKey};
        let enabled = RegKey::predef(HKEY_CURRENT_USER)
            .open_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize")
            .ok()
            .and_then(|k| k.get_value::<u32, _>("EnableTransparency").ok())
            .unwrap_or(1)
            != 0;
        if mode == "Opaque" || !enabled {
            window.set_effects(None).map_err(|e| e.to_string())?;
            return Ok(if enabled {
                "Opaque mode"
            } else {
                "Windows transparency disabled: opaque fallback"
            }
            .into());
        }
        if tint.len() != 7
            || !tint.starts_with('#')
            || !tint.as_bytes()[1..].iter().all(|c| c.is_ascii_hexdigit())
        {
            return Err("Invalid tint".into());
        }
        let r = u8::from_str_radix(&tint[1..3], 16).map_err(|e| e.to_string())?;
        let g = u8::from_str_radix(&tint[3..5], 16).map_err(|e| e.to_string())?;
        let b = u8::from_str_radix(&tint[5..7], 16).map_err(|e| e.to_string())?;
        let effect = if mode == "Mica" {
            Effect::Mica
        } else {
            Effect::Acrylic
        };
        if let Err(error) = window.set_effects(Some(
            EffectsBuilder::new()
                .effect(effect)
                .color(Color(r, g, b, opacity))
                .build(),
        )) {
            let _ = window.set_effects(None);
            return Ok(format!("Opaque fallback: native effect failed ({error})"));
        }
        return Ok(format!(
            "Native {mode} configured; Windows controls blur intensity"
        ));
    }
    #[cfg(not(windows))]
    {
        let _ = (tint, opacity);
        Ok("Opaque fallback: Windows backdrop requires Windows".into())
    }
}

#[tauri::command]
fn list_monitors(window: WebviewWindow) -> Result<Vec<String>, String> {
    main_only(&window)?;
    Ok(window
        .available_monitors()
        .map_err(|e| e.to_string())?
        .iter()
        .enumerate()
        .map(|(i, m)| {
            m.name()
                .cloned()
                .unwrap_or_else(|| format!("Monitor {}", i + 1))
        })
        .collect())
}

#[tauri::command]
async fn show_alert_window(
    app: tauri::AppHandle,
    window: WebviewWindow,
    monitor: String,
    position: String,
) -> Result<(), String> {
    main_only(&window)?;
    let monitors = window.available_monitors().map_err(|e| e.to_string())?;
    let selected = monitors
        .iter()
        .find(|m| m.name().map(|s| s == &monitor).unwrap_or(false))
        .cloned()
        .or(window.current_monitor().map_err(|e| e.to_string())?)
        .or(window.primary_monitor().map_err(|e| e.to_string())?);
    let alert = if let Some(existing) = app.get_webview_window("alert") {
        existing
    } else {
        WebviewWindowBuilder::new(
            &app,
            "alert",
            WebviewUrl::App("index.html?surface=alert".into()),
        )
        .title("SENTINEL · Simulated alert")
        .inner_size(390.0, 550.0)
        .resizable(false)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(false)
        .focusable(false)
        .visible(false)
        .build()
        .map_err(|e| e.to_string())?
    };
    if let Some(m) = selected {
        let scale = m.scale_factor();
        let size = alert.outer_size().map_err(|e| e.to_string())?;
        let area = m.work_area();
        let margin = (18.0 * scale) as i32;
        let x = if position.ends_with("left") {
            area.position.x + margin
        } else {
            area.position.x + area.size.width as i32 - size.width as i32 - margin
        };
        let y = if position.starts_with("Top") {
            area.position.y + margin
        } else {
            area.position.y + area.size.height as i32 - size.height as i32 - margin
        };
        alert
            .set_position(tauri::PhysicalPosition::new(
                x.max(area.position.x),
                y.max(area.position.y),
            ))
            .map_err(|e| e.to_string())?;
    }
    alert.show().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn alert_action(
    app: tauri::AppHandle,
    window: WebviewWindow,
    id: String,
    status: String,
) -> Result<(), String> {
    if window.label() != "alert" {
        return Err("Only the alert surface can request this action".into());
    }
    if !["Acknowledged", "Dismissed"].contains(&status.as_str()) || id.len() > 100 {
        return Err("Invalid alert action".into());
    }
    app.emit_to(
        "main",
        "sentinel-alert-action",
        serde_json::json!({"id":id,"status":status}),
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

fn show_main(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(
                    tauri_plugin_window_state::StateFlags::POSITION
                        | tauri_plugin_window_state::StateFlags::SIZE
                        | tauri_plugin_window_state::StateFlags::MAXIMIZED,
                )
                .build(),
        )
        .manage(CloseToTray(AtomicBool::new(false)))
        .setup(|app| {
            let directory = app.path().app_data_dir()?;
            std::fs::create_dir_all(&directory)?;
            let path = directory.join("sentinel.sqlite3");
            let conn = Connection::open(&path)?;
            conn.execute_batch(include_str!("../migrations/001_state.sql"))?;
            drop(conn);
            app.manage(Database(path));
            let show = MenuItem::with_id(app, "show", "Open SENTINEL", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit SENTINEL", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            let mut tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("SENTINEL · simulation")
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main(app),
                    "quit" => app.exit(0),
                    _ => {}
                });
            if let Some(icon) = app.default_window_icon() {
                tray = tray.icon(icon.clone());
            }
            tray.build(app)?;
            if let Some(window) = app.get_webview_window("main") {
                let pos = window.outer_position()?;
                let size = window.outer_size()?;
                let monitors = window.available_monitors()?;
                let visible = monitors.iter().any(|m| {
                    let p = m.position();
                    let s = m.size();
                    (pos.x as i64 + size.width as i64) > p.x as i64
                        && (pos.y as i64 + size.height as i64) > p.y as i64
                        && (pos.x as i64) < p.x as i64 + s.width as i64
                        && (pos.y as i64) < p.y as i64 + s.height as i64
                });
                if !visible {
                    let _ = window.center();
                }
                if let Some(m) = window.current_monitor()? {
                    let area = m.work_area();
                    let scale = m.scale_factor();
                    let width = (area.size.width as f64 / scale - 24.0).clamp(720.0, 1440.0);
                    let height = (area.size.height as f64 / scale - 24.0).clamp(620.0, 920.0);
                    if size.width as f64 / scale > width || size.height as f64 / scale > height {
                        let _ = window.set_size(tauri::LogicalSize::new(width, height));
                        let _ = window.center();
                    }
                    let position = window.outer_position()?;
                    let bounds = window.outer_size()?;
                    let max_x =
                        area.position.x + (area.size.width as i32 - bounds.width as i32).max(0);
                    let max_y =
                        area.position.y + (area.size.height as i32 - bounds.height as i32).max(0);
                    let x = position.x.clamp(area.position.x, max_x);
                    let y = position.y.clamp(area.position.y, max_y);
                    if x != position.x || y != position.y {
                        let _ = window.set_position(tauri::PhysicalPosition::new(x, y));
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_state,
            save_state,
            set_close_to_tray,
            close_main,
            set_backdrop,
            list_monitors,
            show_alert_window,
            alert_action
        ])
        .run(tauri::generate_context!())
        .expect("Unable to start SENTINEL");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn migration_is_repeatable_and_snapshot_write_is_atomic() {
        let mut conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(include_str!("../migrations/001_state.sql"))
            .unwrap();
        conn.execute_batch(include_str!("../migrations/001_state.sql"))
            .unwrap();
        assert_eq!(
            conn.query_row("SELECT count(*) FROM schema_version", [], |r| r
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
        conn.execute(
            "INSERT INTO workspace(id,payload) VALUES(1,?1)",
            ["{\"state\":{\"version\":1}}"],
        )
        .unwrap();
        {
            let tx = conn.transaction().unwrap();
            tx.execute("UPDATE workspace SET payload=?1 WHERE id=1", ["{}"])
                .unwrap();
        }
        let saved: String = conn
            .query_row("SELECT payload FROM workspace WHERE id=1", [], |r| r.get(0))
            .unwrap();
        assert!(saved.contains("version"));
        assert!(conn
            .execute("UPDATE workspace SET payload=?1 WHERE id=1", ["not json"])
            .is_err());
    }
}
