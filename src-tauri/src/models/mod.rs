use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Customer {
    pub id: String,
    pub name: String,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub note: Option<String>,
    pub opening_due: f64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCustomer {
    pub name: String,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub note: Option<String>,
    pub opening_due: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Supplier {
    pub id: String,
    pub name: String,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub note: Option<String>,
    pub opening_due: f64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSupplier {
    pub name: String,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub note: Option<String>,
    pub opening_due: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Product {
    pub id: String,
    pub name: String,
    pub sku: Option<String>,
    pub category_id: Option<String>,
    pub buy_price: f64,
    pub sell_price: f64,
    pub stock: f64,
    pub min_stock: f64,
    pub unit: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateProduct {
    pub name: String,
    pub sku: Option<String>,
    pub category_id: Option<String>,
    pub buy_price: f64,
    pub sell_price: f64,
    pub stock: Option<f64>,
    pub min_stock: Option<f64>,
    pub unit: Option<String>,
}

#[derive(Debug, Serialize, Clone, sqlx::FromRow)]
pub struct Sale {
    pub id: String,
    pub invoice_no: String,
    pub customer_id: Option<String>,
    pub subtotal: f64,
    pub discount: f64,
    pub total: f64,
    pub paid: f64,
    pub due: f64,
    pub payment_method: String,
    pub note: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Clone, sqlx::FromRow)]
pub struct DashboardStats {
    pub today_sales: f64,
    pub today_purchases: f64,
    pub total_receivable: f64,
    pub total_payable: f64,
    pub total_products: i64,
    pub low_stock_count: i64,
}

#[derive(Debug, Serialize, Clone)]
pub struct LowStockProduct {
    pub id: String,
    pub name: String,
    pub stock: f64,
    pub min_stock: f64,
}
