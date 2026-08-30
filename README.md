# 🚀 নেক্সা হিসাব (Nexa Hisabi) — V1

> **আধুনিক, দ্রুত ও সহজ দোকান/ব্যবসা হিসাব ব্যবস্থাপনা ডেস্কটপ অ্যাপ** — ছোট ও মাঝারি ব্যবসার জন্য তৈরি।

[![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8DB?logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-1.98-orange?logo=rust)](https://www.rust-lang.org)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[English](#english) | [বাংলা](#বাংলা)

---

## ✨ V1 Features (19টি)

| # | Feature | বর্ণনা |
|---|---------|--------|
| 1 | 📊 ড্যাশবোর্ড | আজকের বিক্রয়/ক্রয়/লাভ, পাওনা/দেনা, মোট পণ্য, low stock, সাম্প্রতিক লেনদেন |
| 2 | 👥 ক্রেতা ব্যবস্থাপনা | নাম, মোবাইল, ঠিকানা, বাকি + টাকা গ্রহণ + history |
| 3 | 🤝 সরবরাহকারী | মোট ক্রয়, পরিশোধ, বাকি |
| 4 | 📦 পণ্য ব্যবস্থাপনা | SKU, category, ক্রয়/বিক্রয় মূল্য, stock, min stock, unit |
| 5 | 🗂️ Category | মুদি, পানীয়, ইলেকট্রনিক্স, স্টেশনারি, কসমেটিকস, অন্যান্য |
| 6 | 🛒 বিক্রয় | পণ্য→পরিমাণ→Discount→মোট→পরিশোধ→বাকি (নগদ/বিকাশ/নগদ/ব্যাংক) |
| 7 | 📥 ক্রয় | Supplier→পণ্য→পরিমাণ→মূল্য→মোট (stock auto ↑) |
| 8 | 💰 লেনদেন | Customer→ব্যবসায়ী (গ্রহণ), ব্যবসায়ী→Supplier (প্রদান) |
| 9 | 📒 বাকি খাতা | পাওনা/দেনা — customer & supplier wise (core feature) |
| 10 | 🧾 চালান | বাংলা invoice, PDF & Print |
| 11 | 📈 রিপোর্ট | বিক্রয়/ক্রয়/লাভ/বাকি — আজ/সপ্তাহ/মাস/custom |
| 12 | 📦 Stock | `Current = Opening + Purchase - Sale`, low stock alert |
| 13 | 🔍 Search | Global search: customer/supplier/product/invoice/phone |
| 14 | 🔐 দোকানের তথ্য | নাম, মালিক, মোবাইল, ঠিকানা, logo → invoice এ |
| 15 | ⚙️ Settings | Currency, invoice, ভাষা, theme, backup/restore |
| 16 | 💾 Backup | `nexa-hisab-backup-YYYY-MM-DD.db` — SQLite file |
| 17 | 🖨️ Print | Invoice, statement, sales/purchase report |
| 18 | 🌓 Theme | Light / Dark |
| 19 | 🇧🇩 বাংলা সংখ্যা | DB তে English, UI/PDF তে `৳ ২৫,৪৫০` |

> 📄 বিস্তারিত: [`documentation.md`](./documentation.md)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS 3.4, Lucide Icons, React Router v7 |
| Desktop | Tauri 2 |
| Backend | Rust 1.98 |
| Database | SQLite (WAL + FK) |
| ORM | SQLx 0.8 (`runtime-tokio`, `sqlite`) |
| PDF | Rust PDF library (planned) |

### Architecture
```
nexa-hisabi/
├── src/                          # React frontend
│   ├── components/
│   │   ├── layout/ (Sidebar, Topbar, Layout)
│   │   └── ui/ (Button, Card, Input)
│   ├── pages/ (Dashboard, Customers, Suppliers, Products...)
│   ├── features/ (dashboard, customers, products...)
│   └── lib/ (utils, bn.ts)
├── src-tauri/
│   ├── src/
│   │   ├── commands/ (dashboard, customers, suppliers, products)
│   │   ├── models/
│   │   ├── database/ (init, migrations)
│   │   └── lib.rs
│   └── migrations/001_initial.sql
└── documentation.md
```

---

## 🗃️ Database Schema (V1)

`businesses`, `settings`, `customers`, `suppliers`, `categories`, `products`, `sales`, `sale_items`, `purchases`, `purchase_items`, `payments`

Relations:
```
Customer ── Sales ── Sale Items
        └─ Payments
Supplier ── Purchases ── Purchase Items
        └─ Payments
Product ── Sale Items / Purchase Items
```

`stock` formula: `Opening + Purchase - Sale = Current`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+, Rust 1.70+, Bun 1.4+ (or npm/yarn)

### Install
```bash
bun install
# or
npm install
```

### Development
```bash
bun run dev          # Vite only (http://localhost:1420)
bun run tauri dev    # Full desktop app
```

### Build
```bash
bun run build        # Frontend
bun run tauri build  # Desktop installer (.msi / .exe)
```

---

## 📸 Screenshots

> ড্যাশবোর্ড, বিক্রয়, বাকি খাতা, চালান — স্ক্রিনশট শীঘ্রই যোগ হবে।

```
┌─────────────────────────────────────┐
│             নেক্সা হিসাব             │
├──────────┬──────────┬───────────────┤
│ বিক্রয়   │ ক্রয়     │ লাভ            │
│ ৳25,450  │ ৳12,300  │ ৳13,150       │
├──────────┼──────────┼───────────────┤
│ পাওনা    │ দেনা     │ পণ্য           │
│ ৳45,800  │ ৳12,500  │ 325            │
└──────────┴──────────┴───────────────┘
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m "feat: amazing feature"`
4. Push & open PR

---

## 📝 License

MIT © Sajid Hasan

---

## 👨‍💻 Author

**Sajid Hasan** — [GitHub @dev-sajid007](https://github.com/dev-sajid007)

> Windows-first, offline-first, বাংলা-first — বাংলাদেশের দোকানদারদের জন্য।
