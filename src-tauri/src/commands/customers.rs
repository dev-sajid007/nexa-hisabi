use crate::models::{CreateCustomer, Customer};
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_customers(pool: State<'_, SqlitePool>) -> Result<Vec<Customer>, String> {
    sqlx::query_as::<_, Customer>("SELECT * FROM customers ORDER BY created_at DESC")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_customer(pool: State<'_, SqlitePool>, data: CreateCustomer) -> Result<Customer, String> {
    if data.name.trim().is_empty() {
        return Err("নাম আবশ্যক".into());
    }
    let id = uuid::Uuid::new_v4().to_string();
    let due = data.opening_due.unwrap_or(0.0);
    sqlx::query("INSERT INTO customers (id, name, phone, address, note, opening_due) VALUES (?,?,?,?,?,?)")
        .bind(&id)
        .bind(data.name.trim())
        .bind(&data.phone)
        .bind(&data.address)
        .bind(&data.note)
        .bind(due)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE id=?")
        .bind(&id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_customer(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM customers WHERE id=?").bind(&id).execute(pool.inner()).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn search_customers(pool: State<'_, SqlitePool>, q: String) -> Result<Vec<Customer>, String> {
    let pattern = format!("%{}%", q);
    sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? LIMIT 50")
        .bind(&pattern)
        .bind(&pattern)
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}
