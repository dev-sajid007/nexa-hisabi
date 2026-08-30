use crate::models::{CreateSupplier, Supplier};
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_suppliers(pool: State<'_, SqlitePool>) -> Result<Vec<Supplier>, String> {
    sqlx::query_as::<_, Supplier>("SELECT * FROM suppliers ORDER BY created_at DESC")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_supplier(pool: State<'_, SqlitePool>, data: CreateSupplier) -> Result<Supplier, String> {
    if data.name.trim().is_empty() {
        return Err("নাম আবশ্যক".into());
    }
    let id = uuid::Uuid::new_v4().to_string();
    let due = data.opening_due.unwrap_or(0.0);
    sqlx::query("INSERT INTO suppliers (id, name, phone, address, note, opening_due) VALUES (?,?,?,?,?,?)")
        .bind(&id)
        .bind(data.name.trim())
        .bind(&data.phone)
        .bind(&data.address)
        .bind(&data.note)
        .bind(due)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    sqlx::query_as::<_, Supplier>("SELECT * FROM suppliers WHERE id=?")
        .bind(&id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_supplier(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM suppliers WHERE id=?").bind(&id).execute(pool.inner()).await.map_err(|e| e.to_string())?;
    Ok(())
}
