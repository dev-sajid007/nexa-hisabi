use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;

#[derive(serde::Deserialize)]
pub struct CreatePayment {
    pub party_type: String, // customer | supplier
    pub party_id: String,
    pub amount: f64,
    pub direction: String, // receive | pay
    pub method: Option<String>,
    pub note: Option<String>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct Payment {
    pub id: String,
    pub party_type: String,
    pub party_id: String,
    pub amount: f64,
    pub direction: String,
    pub method: String,
    pub note: Option<String>,
    pub created_at: String,
}

#[tauri::command]
pub async fn create_payment(pool: State<'_, SqlitePool>, data: CreatePayment) -> Result<Payment, String> {
    if data.amount <= 0.0 { return Err("টাকার পরিমাণ ০ এর বেশি হতে হবে".into()); }
    if data.party_type != "customer" && data.party_type != "supplier" { return Err("party_type invalid".into()); }
    if data.direction != "receive" && data.direction != "pay" { return Err("direction invalid".into()); }
    let id = uuid::Uuid::new_v4().to_string();
    let method = data.method.unwrap_or_else(|| "নগদ".into());
    sqlx::query("INSERT INTO payments (id, party_type, party_id, amount, direction, method, note) VALUES (?,?,?,?,?,?,?)")
        .bind(&id).bind(&data.party_type).bind(&data.party_id).bind(data.amount).bind(&data.direction).bind(&method).bind(&data.note)
        .execute(pool.inner()).await.map_err(|e| e.to_string())?;
    sqlx::query_as::<_, Payment>("SELECT * FROM payments WHERE id=?").bind(&id).fetch_one(pool.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_payments(pool: State<'_, SqlitePool>, party_type: Option<String>, party_id: Option<String>) -> Result<Vec<Payment>, String> {
    if let (Some(pt), Some(pid)) = (party_type, party_id) {
        sqlx::query_as::<_, Payment>("SELECT * FROM payments WHERE party_type=? AND party_id=? ORDER BY created_at DESC LIMIT 100")
            .bind(pt).bind(pid).fetch_all(pool.inner()).await.map_err(|e| e.to_string())
    } else {
        sqlx::query_as::<_, Payment>("SELECT * FROM payments ORDER BY created_at DESC LIMIT 100")
            .fetch_all(pool.inner()).await.map_err(|e| e.to_string())
    }
}

// Due book aggregated
#[derive(Serialize)]
pub struct DueEntry { pub id: String, pub name: String, pub phone: Option<String>, pub due: f64 }
#[derive(Serialize)]
pub struct DueBook { pub receivable: Vec<DueEntry>, pub payable: Vec<DueEntry>, pub total_receivable: f64, pub total_payable: f64 }

#[tauri::command]
pub async fn get_due_book(pool: State<'_, SqlitePool>) -> Result<DueBook, String> {
    // Receivable per customer: opening_due + sales due - payments receive
    let customers = sqlx::query_as::<_, (String, String, Option<String>, f64)>(
        "SELECT id, name, phone, opening_due FROM customers ORDER BY name"
    ).fetch_all(pool.inner()).await.map_err(|e| e.to_string())?;

    let mut receivable = Vec::new();
    let mut total_receivable = 0.0;
    for (id, name, phone, opening) in customers {
        let sales_due: f64 = sqlx::query_scalar("SELECT COALESCE(SUM(due),0) FROM sales WHERE customer_id=?")
            .bind(&id).fetch_one(pool.inner()).await.map_err(|e| e.to_string())?;
        let received: f64 = sqlx::query_scalar("SELECT COALESCE(SUM(amount),0) FROM payments WHERE party_type='customer' AND party_id=? AND direction='receive'")
            .bind(&id).fetch_one(pool.inner()).await.map_err(|e| e.to_string())?;
        let due = opening + sales_due - received;
        if due > 0.01 {
            total_receivable += due;
            receivable.push(DueEntry { id, name, phone, due });
        } else if due > -0.01 && due < 0.01 {
            // zero due still maybe show? skip for now
        } else {
            // negative = advance, show as 0? but track
            // include if you want to show overpaid
        }
    }
    // Include customers with zero opening but sales due (already included)
    // Sort by due desc
    receivable.sort_by(|a,b| b.due.partial_cmp(&a.due).unwrap());

    let suppliers = sqlx::query_as::<_, (String, String, Option<String>, f64)>(
        "SELECT id, name, phone, opening_due FROM suppliers ORDER BY name"
    ).fetch_all(pool.inner()).await.map_err(|e| e.to_string())?;
    let mut payable = Vec::new();
    let mut total_payable = 0.0;
    for (id, name, phone, opening) in suppliers {
        let purchase_due: f64 = sqlx::query_scalar("SELECT COALESCE(SUM(due),0) FROM purchases WHERE supplier_id=?")
            .bind(&id).fetch_one(pool.inner()).await.map_err(|e| e.to_string())?;
        let paid: f64 = sqlx::query_scalar("SELECT COALESCE(SUM(amount),0) FROM payments WHERE party_type='supplier' AND party_id=? AND direction='pay'")
            .bind(&id).fetch_one(pool.inner()).await.map_err(|e| e.to_string())?;
        let due = opening + purchase_due - paid;
        if due > 0.01 {
            total_payable += due;
            payable.push(DueEntry { id, name, phone, due });
        }
    }
    payable.sort_by(|a,b| b.due.partial_cmp(&a.due).unwrap());

    Ok(DueBook { receivable, payable, total_receivable, total_payable })
}
