mod commands;
mod database;
mod models;

use sqlx::SqlitePool;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                match database::init_db(&handle).await {
                    Ok(pool) => {
                        handle.manage::<SqlitePool>(pool);
                        println!("✓ Database initialized");
                    }
                    Err(e) => {
                        eprintln!("DB init failed: {e}");
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::dashboard::get_dashboard_stats,
            commands::customers::get_customers,
            commands::customers::create_customer,
            commands::customers::delete_customer,
            commands::customers::search_customers,
            commands::suppliers::get_suppliers,
            commands::suppliers::create_supplier,
            commands::suppliers::delete_supplier,
            commands::products::get_categories,
            commands::products::get_products,
            commands::products::create_product,
            commands::products::get_low_stock,
            commands::products::delete_product,
            commands::sales::get_sales,
            commands::sales::get_sale_items,
            commands::sales::create_sale,
            commands::purchases::get_purchases,
            commands::purchases::create_purchase,
            commands::payments::create_payment,
            commands::payments::get_payments,
            commands::payments::get_due_book,
            commands::reports::get_reports,
            commands::search::global_search,
            commands::settings::get_business,
            commands::settings::update_business,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
