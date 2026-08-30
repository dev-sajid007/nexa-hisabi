use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;

#[derive(Serialize)]
pub struct SearchResults {
    pub customers: Vec<SearchCustomer>,
    pub suppliers: Vec<SearchSupplier>,
    pub products: Vec<SearchProduct>,
    pub invoices: Vec<SearchInvoice>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct SearchCustomer { pub id: String, pub name: String, pub phone: Option<String> }
#[derive(Serialize, sqlx::FromRow)]
pub struct SearchSupplier { pub id: String, pub name: String, pub phone: Option<String> }
#[derive(Serialize, sqlx::FromRow)]
pub struct SearchProduct { pub id: String, pub name: String, pub sku: Option<String>, pub stock: f64 }
#[derive(Serialize, sqlx::FromRow)]
pub struct SearchInvoice { pub id: String, pub invoice_no: String, pub total: f64, pub created_at: String }

#[tauri::command]
pub async fn global_search(pool: State<'_, SqlitePool>, q: String) -> Result<SearchResults, String> {
    let pattern = format!("%{}%", q);
    let customers = sqlx::query_as::<_, SearchCustomer>("SELECT id, name, phone FROM customers WHERE name LIKE ? OR phone LIKE ? LIMIT 10")
        .bind(&pattern).bind(&pattern).fetch_all(pool.inner()).await.map_err(|e| e.to_string())?;
    let suppliers = sqlx::query_as::<_, SearchSupplier>("SELECT id, name, phone FROM suppliers WHERE name LIKE ? OR phone LIKE ? LIMIT 10")
        .bind(&pattern).bind(&pattern).fetch_all(pool.inner()).await.map_err(|e| e.to_string())?;
    let products = sqlx::query_as::<_, SearchProduct>("SELECT id, name, sku, stock FROM products WHERE name LIKE ? OR sku LIKE ? LIMIT 10")
        .bind(&pattern).bind(&pattern).fetch_all(pool.inner()).await.map_err(|e| e.to_string())?;
    let invoices = sqlx::query_as::<_, SearchInvoice>("SELECT id, invoice_no, total, created_at FROM sales WHERE invoice_no LIKE ? LIMIT 10")
        .bind(&pattern).fetch_all(pool.inner()).await.map_err(|e| e.to_string())?;
    Ok(SearchResults { customers, suppliers, products, invoices })
}
