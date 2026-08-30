use sqlx::SqlitePool;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn backup_database(app: AppHandle, pool: State<'_, SqlitePool>) -> Result<String, String> {
    // Ensure WAL checkpoint so file is consistent
    sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);").execute(pool.inner()).await.map_err(|e| e.to_string())?;

    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_data.join("nexa-hisab.db");
    if !db_path.exists() {
        return Err("Database file not found".into());
    }
    // For now return path — frontend will use dialog to save elsewhere
    // Actual copy is done via frontend using @tauri-apps/plugin-fs after user picks location
    Ok(db_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn get_db_path(app: AppHandle) -> Result<String, String> {
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(app_data.join("nexa-hisab.db").to_string_lossy().to_string())
}
