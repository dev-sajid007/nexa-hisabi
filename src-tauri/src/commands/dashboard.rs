use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;

#[derive(Serialize)]
pub struct DashboardStats {
    pub today_sales: f64,
    pub today_purchases: f64,
    pub today_profit: f64,
    pub total_receivable: f64,
    pub total_payable: f64,
    pub total_products: i64,
    pub low_stock_count: i64,
}

#[tauri::command]
pub async fn get_dashboard_stats(pool: State<'_, SqlitePool>) -> Result<DashboardStats, String> {
    // আজকের বিক্রয়
    let today_sales: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(total),0) FROM sales WHERE date(created_at)=date('now','localtime')",
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    let today_purchases: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(subtotal),0) FROM purchases WHERE date(created_at)=date('now','localtime')",
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    // পাওনা = customers opening_due + sales due - payments receive
    // simplified: sum of all sales due + opening_due - payments
    let sales_due: f64 = sqlx::query_scalar("SELECT COALESCE(SUM(due),0) FROM sales")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    let cust_opening: f64 = sqlx::query_scalar("SELECT COALESCE(SUM(opening_due),0) FROM customers")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    let received: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(amount),0) FROM payments WHERE party_type='customer' AND direction='receive'",
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    let total_receivable = cust_opening + sales_due - received;

    let purchase_due: f64 = sqlx::query_scalar("SELECT COALESCE(SUM(due),0) FROM purchases")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    let sup_opening: f64 = sqlx::query_scalar("SELECT COALESCE(SUM(opening_due),0) FROM suppliers")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    let paid_to_sup: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(amount),0) FROM payments WHERE party_type='supplier' AND direction='pay'",
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    let total_payable = sup_opening + purchase_due - paid_to_sup;

    let total_products: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM products")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    let low_stock_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM products WHERE stock <= min_stock")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;

    // আজকের লাভ = today_sales - (আজকের বিক্রিত পণ্যের ক্রয় মূল্য) — simplified as today_sales - today_purchases
    let today_profit = today_sales - today_purchases;

    Ok(DashboardStats {
        today_sales,
        today_purchases,
        today_profit,
        total_receivable: total_receivable.max(0.0),
        total_payable: total_payable.max(0.0),
        total_products,
        low_stock_count,
    })
}
