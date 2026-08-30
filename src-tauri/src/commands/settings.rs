use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use tauri::State;

#[derive(Serialize, sqlx::FromRow)]
pub struct Business {
    pub id: i64,
    pub shop_name: String,
    pub owner_name: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub logo_path: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateBusiness {
    pub shop_name: String,
    pub owner_name: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
}

#[tauri::command]
pub async fn get_business(pool: State<'_, SqlitePool>) -> Result<Business, String> {
    sqlx::query_as::<_, Business>("SELECT * FROM businesses WHERE id=1")
        .fetch_one(pool.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_business(pool: State<'_, SqlitePool>, data: UpdateBusiness) -> Result<Business, String> {
    if data.shop_name.trim().is_empty() { return Err("দোকানের নাম আবশ্যক".into()); }
    sqlx::query("UPDATE businesses SET shop_name=?, owner_name=?, phone=?, address=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=1")
        .bind(data.shop_name.trim()).bind(&data.owner_name).bind(&data.phone).bind(&data.address)
        .execute(pool.inner()).await.map_err(|e| e.to_string())?;
    get_business(pool).await
}
