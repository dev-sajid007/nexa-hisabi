use crate::models::{CreatePurchase, Purchase};
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_purchases(pool: State<'_, SqlitePool>) -> Result<Vec<Purchase>, String> {
    sqlx::query_as::<_, Purchase>("SELECT * FROM purchases ORDER BY created_at DESC LIMIT 100")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_purchase(pool: State<'_, SqlitePool>, data: CreatePurchase) -> Result<Purchase, String> {
    if data.items.is_empty() {
        return Err("কমপক্ষে একটি পণ্য নির্বাচন করুন".into());
    }
    let mut subtotal = 0.0;
    for it in &data.items {
        if it.qty <= 0.0 { return Err("পরিমাণ ০ এর বেশি হতে হবে".into()); }
        subtotal += it.qty * it.price;
    }
    let paid = data.paid.unwrap_or(0.0).max(0.0).min(subtotal);
    let due = subtotal - paid;
    let purchase_id = uuid::Uuid::new_v4().to_string();

    let mut tx = pool.inner().begin().await.map_err(|e| e.to_string())?;

    sqlx::query("INSERT INTO purchases (id, supplier_id, subtotal, paid, due, note) VALUES (?,?,?,?,?,?)")
        .bind(&purchase_id)
        .bind(&data.supplier_id)
        .bind(subtotal)
        .bind(paid)
        .bind(due)
        .bind(&data.note)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    for it in &data.items {
        let product_name: Option<String> = sqlx::query_scalar("SELECT name FROM products WHERE id=?")
            .bind(&it.product_id)
            .fetch_optional(&mut *tx).await.map_err(|e| e.to_string())?;
        let name = product_name.ok_or_else(|| format!("পণ্য পাওয়া যায়নি: {}", it.product_id))?;
        let item_id = uuid::Uuid::new_v4().to_string();
        let total = it.qty * it.price;
        sqlx::query("INSERT INTO purchase_items (id, purchase_id, product_id, product_name, qty, price, total) VALUES (?,?,?,?,?,?,?)")
            .bind(&item_id)
            .bind(&purchase_id)
            .bind(&it.product_id)
            .bind(&name)
            .bind(it.qty)
            .bind(it.price)
            .bind(total)
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;

        // increment stock: Current = stock + qty
        sqlx::query("UPDATE products SET stock = stock + ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?")
            .bind(it.qty)
            .bind(&it.product_id)
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Purchase>("SELECT * FROM purchases WHERE id=?")
        .bind(&purchase_id)
        .fetch_one(pool.inner()).await.map_err(|e| e.to_string())
}
