# 🚀 নেক্সা হিসাব — V1 Features

> একটি সহজ, দ্রুত এবং আধুনিক দোকান/ব্যবসা হিসাব ব্যবস্থাপনা অ্যাপ — Rust + Tauri + React

---

## 1. 📊 ড্যাশবোর্ড

অ্যাপ চালু করলে ব্যবসার বর্তমান অবস্থা এক নজরে দেখা যাবে।

- আজকের বিক্রয়
- আজকের ক্রয়
- আজকের লাভ
- মোট পাওনা
- মোট দেনা
- মোট পণ্য
- কম stock-এর পণ্য
- সাম্প্রতিক লেনদেন

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

## 2. 👥 ক্রেতা ব্যবস্থাপনা

প্রতিটি customer-এর আলাদা হিসাব থাকবে।

**তথ্য:**
- নাম
- মোবাইল নম্বর
- ঠিকানা
- নোট
- বর্তমান বাকি

**Actions:**
- নতুন ক্রেতা
- ক্রেতার হিসাব দেখা
- টাকা গ্রহণ
- লেনদেন history
- ক্রেতা edit / delete

---

## 3. 🤝 সরবরাহকারী ব্যবস্থাপনা

যাদের কাছ থেকে পণ্য কেনা হয়।

```
সরবরাহকারী
 ├── নাম
 ├── মোবাইল
 ├── ঠিকানা
 ├── মোট ক্রয়
 ├── পরিশোধ
 └── বাকি
```

---

## 4. 📦 পণ্য ব্যবস্থাপনা

Product inventory-এর basic system।

**Product fields:**
- পণ্যের নাম
- SKU / কোড
- category
- ক্রয় মূল্য
- বিক্রয় মূল্য
- বর্তমান stock
- minimum stock
- unit

**উদাহরণ:**

> **চাল ৫ কেজি**
> ──────────────
> ক্রয় মূল্য : ৳৩৮০
> বিক্রয় মূল্য : ৳৪২০
> স্টক : ২৫
> একক : প্যাকেট

---

## 5. 🗂️ পণ্যের Category

পণ্য category অনুযায়ী সাজানো যাবে।

যেমন:
- মুদি
- পানীয়
- ইলেকট্রনিক্স
- স্টেশনারি
- কসমেটিকস
- অন্যান্য

---

## 6. 🛒 বিক্রয়

V1-এর সবচেয়ে গুরুত্বপূর্ণ feature।

```
বিক্রয় করার সময়
পণ্য নির্বাচন
      ↓
পরিমাণ
      ↓
মূল্য
      ↓
Discount
      ↓
মোট
      ↓
পরিশোধ
      ↓
বাকি
```

**Payment method:**
- নগদ
- বিকাশ
- নগদ (Nagad)
- ব্যাংক
- অন্যান্য

---

## 7. 📥 ক্রয়

Supplier থেকে পণ্য কেনার হিসাব।

```
সরবরাহকারী নির্বাচন
        ↓
পণ্য
        ↓
পরিমাণ
        ↓
ক্রয় মূল্য
        ↓
মোট
        ↓
পরিশোধ
        ↓
বাকি
```

> Purchase করার সাথে সাথে stock automatically বৃদ্ধি পাবে।

---

## 8. 💰 টাকা গ্রহণ / প্রদান

আলাদা transaction system থাকবে।

- **টাকা গ্রহণ:** Customer → ব্যবসায়ী
- **টাকা প্রদান:** ব্যবসায়ী → Supplier

```
লেনদেন
────────────────
রহিম → ৳2,000
করিম → ৳1,500
ABC Supplier ← ৳5,000
```

---

## 9. 📒 বাকি খাতা

এটা V1-এর **core feature** হওয়া উচিত।

**পাওনা — কে ব্যবসার কাছে টাকা দেবে?**

| নাম  | পরিমাণ |
|------|---------|
| রহিম | ৳ ৫,২০০ |
| করিম | ৳ ২,৮০০ |
| সুমন | ৳ ১,৪০০ |
| **মোট** | **৳ ৯,৪০০** |

**দেনা — ব্যবসায়ী কাকে টাকা দেবেন?**

| নাম | পরিমাণ |
|------|---------|
| ABC Supplier | ৳ ৮,০০০ |
| XYZ Supplier | ৳ ৩,৫০০ |
| **মোট** | **৳ ১১,৫০০** |

---

## 10. 🧾 চালান / Invoice

প্রতিটি sale-এর জন্য invoice তৈরি হবে।

**Features:**
- বাংলা invoice
- Invoice number
- Date
- Customer
- Products
- Quantity
- Price
- Discount
- Total
- Paid
- Due

**Output:**
- PDF
- Print

---

## 11. 📈 রিপোর্ট

V1-এ basic কিন্তু useful reporting রাখব।

**বিক্রয় রিপোর্ট:**
- আজকের বিক্রয়
- এই সপ্তাহ
- এই মাস
- Custom date

**ক্রয় রিপোর্ট:**
- আজকের ক্রয়
- এই সপ্তাহ
- এই মাস
- Custom date

**লাভ রিপোর্ট:**
```
মোট বিক্রয়
- মোট পণ্য খরচ
----------------
মোট লাভ
```

**বাকি রিপোর্ট:**
- মোট পাওনা
- মোট দেনা
- Customer-wise due
- Supplier-wise due

---

## 12. 📦 Stock Management

Automatic stock calculation:

```
Opening Stock
      +
Purchase
      -
Sale
      =
Current Stock
```

**Low Stock Alert:**

> ⚠️ কম স্টক
> - চাল ৫ কেজি — ৩টি
> - তেল ১ লিটার — ২টি
> - চিনি ১ কেজি — ৪টি

---

## 13. 🔍 Search

Global search থাকবে।

এক জায়গা থেকে খুঁজতে পারবে:
- 🔍 রহিম
- 🔍 চাল
- 🔍 INV-10023
- 🔍 017xxxxxxxx

**Search করা যাবে:**
- Customer
- Supplier
- Product
- Invoice
- Transaction

---

## 14. 🔐 দোকানের তথ্য

প্রথমবার application চালু করার সময়:

- দোকানের নাম
- মালিকের নাম
- মোবাইল
- ঠিকানা
- Logo

> এই information invoice-এ ব্যবহার হবে।

---

## 15. ⚙️ Settings

V1 Settings:

- দোকানের তথ্য
- Currency
- Invoice settings
- বাংলা / English UI
- Theme
- Database backup
- Database restore

---

## 16. 💾 Backup & Restore

এটা অবশ্যই V1-এ রাখব। যেহেতু app local SQLite ব্যবহার করবে:

```
Settings
   ↓
Backup Database
   ↓
nexa-hisab-backup-2026-08-29.db
```

পরে:

```
Restore Backup
      ↓
Select .db
      ↓
Restore
```

> এতে Windows reinstall বা computer change হলেও data হারানোর ঝুঁকি কমবে।

---

## 17. 🖨️ Print Support

V1:

- Invoice print
- Customer statement print
- Sales report print
- Purchase report print

---

## 18. 🌓 Dark / Light Mode

Modern desktop UI:

- ☀️ Light
- 🌙 Dark

---

## 19. 🇧🇩 বাংলা সংখ্যা

একটা nice V1 feature হতে পারে বাংলা number formatting।

- ৳ ২৫,৪৫০
- পরিমাণ: ১২
- বাকি: ৳ ৫,২০০

> তবে backend/database-এ numeric values standard number হিসেবে থাকবে; শুধু UI/PDF-তে বাংলা সংখ্যায় render করা হবে।

---

## 🗃️ V1 Database

**প্রাথমিকভাবে tables:**

- `businesses`
- `users`
- `customers`
- `suppliers`
- `categories`
- `products`
- `sales`
- `sale_items`
- `purchases`
- `purchase_items`
- `transactions`
- `payments`
- `settings`

**Relation:**

```
Customer
   │
   ├── Sales
   │      └── Sale Items
   │
   └── Payments

Supplier
   │
   ├── Purchases
   │      └── Purchase Items
   │
   └── Payments

Product
   ├── Sale Items
   └── Purchase Items
```

---

## 🦀 Rust + Tauri Architecture

```
nexa-hisab/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── suppliers/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── purchases/
│   │   ├── transactions/
│   │   ├── invoices/
│   │   └── reports/
│   └── lib/
│
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   ├── models/
│   │   ├── services/
│   │   ├── database/
│   │   ├── invoice/
│   │   └── main.rs
│   │
│   └── migrations/
│
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Tailwind CSS, Lucide Icons |
| **Desktop** | Tauri 2 |
| **Backend** | Rust |
| **Database** | SQLite |
| **ORM / DB** | SQLx |
| **PDF** | Rust PDF library |

---

> 📝 **Note:** Duplicate section from original draft has been removed and content formatted for readability. All 19 features + DB + Architecture preserved.
