use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;

#[derive(Serialize)]
pub struct ReportSummary {
    pub total_sales: f64,
    pub total_purchases: f64,
    pub total_profit: f64,
    pub count_sales: i64,
    pub count_purchases: i64,
}

#[tauri::command]
pub async fn get_reports(pool: State<'_, SqlitePool>, from: Option<String>, to: Option<String>) -> Result<ReportSummary, String> {
    // from/to as YYYY-MM-DD, if None use all time
    let (from_clause, to_clause) = match (&from, &to) {
        (Some(f), Some(t)) => (format!(" AND date(created_at) >= date('{}') ", f), format!(" AND date(created_at) <= date('{}') ", t)),
        (Some(f), None) => (format!(" AND date(created_at) >= date('{}') ", f), "".into()),
        (None, Some(t)) => ("".into(), format!(" AND date(created_at) <= date('{}') ", t)),
        _ => ("".into(), "".into()),
    };

    // Build queries safely — using string interpolation with validated date strings (YYYY-MM-DD)
    // Validate simple: len 10 and contains '-'
    let validate = |s: &Option<String>| -> Result<(), String> {
        if let Some(v) = s {
            if v.len() != 10 || !v.contains('-') { return Err("Invalid date format, use YYYY-MM-DD".into()); }
        }
        Ok(())
    };
    validate(&from)?; validate(&to)?;

    let sales_q = format!("SELECT COALESCE(SUM(total),0), COUNT(*) FROM sales WHERE 1=1 {} {}", from_clause, to_clause);
    let (total_sales, count_sales): (f64, i64) = sqlx::query_as(&sales_q).fetch_one(pool.inner()).await.map_err(|e| e.to_string())?;

    let pur_q = format!("SELECT COALESCE(SUM(subtotal),0), COUNT(*) FROM purchases WHERE 1=1 {} {}", from_clause, to_clause);
    let (total_purchases, count_purchases): (f64, i64) = sqlx::query_as(&pur_q).fetch_one(pool.inner()).await.map_err(|e| e.to_string())?;

    Ok(ReportSummary {
        total_sales,
        total_purchases,
        total_profit: total_sales - total_purchases,
        count_sales,
        count_purchases,
    })
}
