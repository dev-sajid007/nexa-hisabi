use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub async fn init_db(app: &AppHandle) -> Result<SqlitePool, String> {
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&app_data).map_err(|e| e.to_string())?;
    let db_path: PathBuf = app_data.join("nexa-hisab.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .map_err(|e| format!("DB connect failed: {e}"))?;

    // Enable WAL & foreign keys
    sqlx::query("PRAGMA journal_mode=WAL;").execute(&pool).await.map_err(|e| e.to_string())?;
    sqlx::query("PRAGMA foreign_keys=ON;").execute(&pool).await.map_err(|e| e.to_string())?;

    // Run migrations from embedded SQL file
    let migration_sql = include_str!("../../migrations/001_initial.sql");
    // split by ; but handle simple case — execute whole file at once via sqlite batch
    // sqlx doesn't support multiple statements in one query, so split
    for stmt in migration_sql.split(';') {
        let trimmed = stmt.trim();
        if trimmed.is_empty() || trimmed.starts_with("--") {
            // skip empty or pure comment chunks, but keep actual statements that contain comments
            // If statement has content beyond comment, execute
            let without_comments: String = trimmed.lines()
                .filter(|l| !l.trim().starts_with("--"))
                .collect::<Vec<_>>()
                .join("\n");
            if without_comments.trim().is_empty() {
                continue;
            }
        }
        if trimmed.is_empty() {
            continue;
        }
        sqlx::query(trimmed).execute(&pool).await.map_err(|e| format!("Migration failed: {e}\nSQL: {trimmed}"))?;
    }

    Ok(pool)
}
