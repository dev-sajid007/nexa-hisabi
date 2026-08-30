#[cfg(test)]
mod calc_tests {
    fn calc_sale(subtotal: f64, discount: f64, paid: f64) -> (f64, f64) {
        let total = (subtotal - discount).max(0.0);
        let paid = paid.max(0.0).min(total);
        let due = total - paid;
        (total, due)
    }

    #[test]
    fn sale_basic() {
        let (total, due) = calc_sale(1000.0, 100.0, 500.0);
        assert_eq!(total, 900.0);
        assert_eq!(due, 400.0);
    }

    #[test]
    fn sale_discount_exceeds() {
        let (total, due) = calc_sale(500.0, 600.0, 0.0);
        assert_eq!(total, 0.0);
        assert_eq!(due, 0.0);
    }

    #[test]
    fn sale_paid_exceeds_total() {
        let (total, due) = calc_sale(1000.0, 0.0, 1500.0);
        assert_eq!(total, 1000.0);
        assert_eq!(due, 0.0);
    }

    #[test]
    fn purchase_due() {
        let subtotal = 2000.0;
        let paid: f64 = 500.0;
        let due: f64 = subtotal - paid;
        assert_eq!(due, 1500.0);
    }

    #[test]
    fn stock_formula() {
        let opening = 10.0;
        let purchase = 25.0;
        let sale = 8.0;
        let current = opening + purchase - sale;
        assert_eq!(current, 27.0);
    }
}
