use crate::models::{Category, CreateProduct, Product};
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_categories(pool: State<'_, SqlitePool>) -> Result<Vec<Category>, String> {
    sqlx::query_as::<_, Category>("SELECT * FROM categories ORDER BY name")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_products(pool: State<'_, SqlitePool>) -> Result<Vec<Product>, String> {
    sqlx::query_as::<_, Product>("SELECT * FROM products ORDER BY created_at DESC")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_product(pool: State<'_, SqlitePool>, data: CreateProduct) -> Result<Product, String> {
    if data.name.trim().is_empty() {
        return Err("পণ্যের নাম আবশ্যক".into());
    }
    let id = uuid::Uuid::new_v4().to_string();
    let stock = data.stock.unwrap_or(0.0);
    let min_stock = data.min_stock.unwrap_or(5.0);
    let unit = data.unit.unwrap_or_else(|| "পিস".into());
    sqlx::query(
        "INSERT INTO products (id, name, sku, category_id, buy_price, sell_price, stock, min_stock, unit) VALUES (?,?,?,?,?,?,?,?,?)",
    )
    .bind(&id)
    .bind(data.name.trim())
    .bind(&data.sku)
    .bind(&data.category_id)
    .bind(data.buy_price)
    .bind(data.sell_price)
    .bind(stock)
    .bind(min_stock)
    .bind(&unit)
    .execute(pool.inner())
    .await
    .map_err(|e| {
        if e.to_string().contains("UNIQUE") {
            "SKU already exists".to_string()
        } else {
            e.to_string()
        }
    })?;

    sqlx::query_as::<_, Product>("SELECT * FROM products WHERE id=?")
        .bind(&id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_low_stock(pool: State<'_, SqlitePool>) -> Result<Vec<Product>, String> {
    sqlx::query_as::<_, Product>("SELECT * FROM products WHERE stock <= min_stock ORDER BY stock ASC")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_product(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM products WHERE id=?").bind(&id).execute(pool.inner()).await.map_err(|e| e.to_string())?;
    Ok(())
}
