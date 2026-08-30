// বাংলা validation helpers — সব form এ ব্যবহার হবে
export const MSG = {
  nameRequired: "নাম আবশ্যক",
  productNameRequired: "পণ্যের নাম আবশ্যক",
  shopNameRequired: "দোকানের নাম আবশ্যক",
  invalidPhone: "মোবাইল সঠিক নয় — 01XXXXXXXXX ফরম্যাটে দিন",
  qtyPositive: "পরিমাণ ০ এর বেশি হতে হবে",
  priceNonNegative: "মূল্য ০ বা তার বেশি হতে হবে",
  stockInsufficient: (stock: number) => `স্টক অপর্যাপ্ত (স্টক: ${stock})`,
  cartEmpty: "কার্ট খালি — পণ্য যোগ করুন",
  selectProduct: "পণ্য নির্বাচন করুন",
  invalidAmount: "টাকার পরিমাণ ০ এর বেশি হতে হবে",
  idAndAmount: "ID ও টাকা দিন",
} as const;

export function validateName(name: string): string | null {
  if (!name.trim()) return MSG.nameRequired;
  if (name.trim().length < 2) return "নাম কমপক্ষে ২ অক্ষরের হতে হবে";
  return null;
}

export function validateProductName(name: string): string | null {
  if (!name.trim()) return MSG.productNameRequired;
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null; // optional
  const digits = phone.replace(/[^0-9]/g, "");
  if (!/^01[0-9]{9}$/.test(digits)) return MSG.invalidPhone;
  return null;
}

export function validateQty(qty: number): string | null {
  if (!Number.isFinite(qty) || qty <= 0) return MSG.qtyPositive;
  return null;
}

export function validatePrice(price: number): string | null {
  if (!Number.isFinite(price) || price < 0) return MSG.priceNonNegative;
  return null;
}

export function validateCart(items: unknown[]): string | null {
  if (items.length === 0) return MSG.cartEmpty;
  return null;
}
