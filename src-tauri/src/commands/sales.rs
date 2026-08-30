use crate::models::{CreateSale, Sale, SaleItem};
use chrono::Local;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_sales(pool: State<'_, SqlitePool>) -> Result<Vec<Sale>, String> {
    sqlx::query_as::<_, Sale>("SELECT * FROM sales ORDER BY created_at DESC LIMIT 100")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_sale_items(pool: State<'_, SqlitePool>, sale_id: String) -> Result<Vec<SaleItem>, String> {
    sqlx::query_as::<_, SaleItem>("SELECT * FROM sale_items WHERE sale_id=?")
        .bind(&sale_id)
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_sale(pool: State<'_, SqlitePool>, data: CreateSale) -> Result<Sale, String> {
    if data.items.is_empty() {
        return Err("কমপক্ষে একটি পণ্য নির্বাচন করুন".into());
    }
    let mut subtotal = 0.0;
    for it in &data.items {
        if it.qty <= 0.0 { return Err("পরিমাণ ০ এর বেশি হতে হবে".into()); }
        subtotal += it.qty * it.price;
    }
    let discount = data.discount.unwrap_or(0.0).max(0.0);
    let total = (subtotal - discount).max(0.0);
    let paid = data.paid.unwrap_or(0.0).max(0.0).min(total);
    let due = total - paid;
    let payment_method = data.payment_method.unwrap_or_else(|| "নগদ".into());

    // Generate invoice no: INV-YYYYMMDD-XXX
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sales")
        .fetch_one(pool.inner()).await.map_err(|e| e.to_string())?;
    let date = Local::now().format("%Y%m%d").to_string();
    let invoice_no = format!("INV-{}-{:04}", date, count + 1);
    let sale_id = uuid::Uuid::new_v4().to_string();

    let mut tx = pool.inner().begin().await.map_err(|e| e.to_string())?;

    sqlx::query("INSERT INTO sales (id, invoice_no, customer_id, subtotal, discount, total, paid, due, payment_method, note) VALUES (?,?,?,?,?,?,?,?,?,?)")
        .bind(&sale_id)
        .bind(&invoice_no)
        .bind(&data.customer_id)
        .bind(subtotal)
        .bind(discount)
        .bind(total)
        .bind(paid)
        .bind(due)
        .bind(&payment_method)
        .bind(&data.note)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    for it in &data.items {
        // fetch product name & check stock
        let product: Option<(String, f64)> = sqlx::query_as::<_, (String, f64)>("SELECT name, stock FROM products WHERE id=?")
            .bind(&it.product_id)
            .fetch_optional(&mut *tx).await.map_err(|e| e.to_string())?
            .map(|(n,s)| (n,s));
        let (product_name, stock) = product.ok_or_else(|| format!("পণ্য পাওয়া যায়নি: {}", it.product_id))?;
        if stock < it.qty {
            return Err(format!("স্টক অপর্যাপ্ত: {} (স্টক: {}, চাহিদা: {})", product_name, stock, it.qty));
        }
        let item_id = uuid::Uuid::new_v4().to_string();
        let total_item = it.qty * it.price;
        sqlx::query("INSERT INTO sale_items (id, sale_id, product_id, product_name, qty, price, total) VALUES (?,?,?,?,?,?,?)")
            .bind(&item_id)
            .bind(&sale_id)
            .bind(&it.product_id)
            .bind(&product_name)
            .bind(it.qty)
            .bind(it.price)
            .bind(total_item)
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;

        // decrement stock: Current = stock - qty
        sqlx::query("UPDATE products SET stock = stock - ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?")
            .bind(it.qty)
            .bind(&it.product_id)
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Sale>("SELECT * FROM sales WHERE id=?")
        .bind(&sale_id)
        .fetch_one(pool.inner()).await.map_err(|e| e.to_string())
}
