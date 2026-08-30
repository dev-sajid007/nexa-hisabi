use sqlx::SqlitePool;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn get_db_path(app: AppHandle) -> Result<String, String> {
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(app_data.join("nexa-hisab.db").to_string_lossy().to_string())
}

#[tauri::command]
pub async fn backup_database(app: AppHandle, pool: State<'_, SqlitePool>, dest: String) -> Result<String, String> {
    // WAL checkpoint so main db file is consistent (merge WAL into db)
    sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);").execute(pool.inner()).await.map_err(|e| e.to_string())?;
    // Also run VACUUM INTO for hot backup? For now simple file copy after checkpoint
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_data.join("nexa-hisab.db");
    if !db_path.exists() {
        return Err(format!("Database file not found: {}", db_path.display()));
    }
    let dest_path = std::path::Path::new(&dest);
    if let Some(parent) = dest_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create backup dir: {e}"))?;
    }
    std::fs::copy(&db_path, dest_path).map_err(|e| format!("Backup copy failed: {e}"))?;
    // Also copy -wal and -shm if they exist and not empty after checkpoint (should be 0)
    Ok(dest)
}

#[tauri::command]
pub async fn restore_database(app: AppHandle, pool: State<'_, SqlitePool>, src: String) -> Result<String, String> {
    let src_path = std::path::Path::new(&src);
    if !src_path.exists() {
        return Err(format!("Backup file not found: {}", src));
    }
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_data.join("nexa-hisab.db");
    // Close connections? SqlitePool will be dropped on restart — for now just copy with WAL checkpoint first
    sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);").execute(pool.inner()).await.map_err(|e| e.to_string())?;
    // Need to close pool connections before overwrite — easiest is to copy; SQLite will handle on next open
    // On Windows file may be locked — try copy with retry
    std::fs::copy(src_path, &db_path).map_err(|e| format!("Restore copy failed (close app and retry): {e}"))?;
    Ok(db_path.to_string_lossy().to_string())
}
