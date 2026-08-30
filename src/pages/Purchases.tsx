import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/bn";
import { invoke } from "../lib/tauri";
import { useToast } from "../components/ui/toast";
import { validateCart, validateQty, validatePrice } from "../lib/validation";
import { Trash2, Plus } from "lucide-react";

type Supplier = { id: string; name: string };
type Product = { id: string; name: string; buy_price: number };
type CartItem = { product_id: string; name: string; qty: number; price: number };
type Purchase = { id: string; subtotal: number; paid: number; due: number; created_at: string };

export function Purchases() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [paid, setPaid] = useState("");
  const [selectedProd, setSelectedProd] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");

  const load = async () => {
    try {
      const [s, p, pur] = await Promise.all([
        invoke<Supplier[]>("get_suppliers"),
        invoke<Product[]>("get_products"),
        invoke<Purchase[]>("get_purchases"),
      ]);
      setSuppliers(s.map(x => ({ id: x.id, name: x.name })));
      setProducts(p.map(x => ({ id: x.id, name: x.name, buy_price: x.buy_price })));
      setPurchases(pur);
    } catch {
      setSuppliers([{ id: "1", name: "ABC Supplier" }]);
      setProducts([{ id: "p1", name: "চাল ৫ কেজি", buy_price: 380 }]);
    }
  };
  useEffect(() => { load(); }, []);

  const onSelectProd = (id: string) => {
    setSelectedProd(id);
    const prod = products.find(p => p.id === id);
    if (prod) setPrice(String(prod.buy_price));
  };

  const addToCart = () => {
    const prod = products.find(p => p.id === selectedProd);
    if (!prod) return toast("পণ্য নির্বাচন করুন", "error");
    const q = parseFloat(qty) || 0;
    const pr = parseFloat(price) || 0;
    const qtyErr = validateQty(q);
    if (qtyErr) return toast(qtyErr, "error");
    const priceErr = validatePrice(pr);
    if (priceErr) return toast(priceErr, "error");
    setCart([...cart, { product_id: prod.id, name: prod.name, qty: q, price: pr }]);
    toast(`${prod.name} কার্টে যোগ ✓`, "success");
    setQty("1");
  };

  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const paidAmt = parseFloat(paid) || 0;
  const due = Math.max(0, subtotal - paidAmt);

  const submit = async () => {
    const cartErr = validateCart(cart);
    if (cartErr) return toast(cartErr, "error");
    if (paidAmt < 0) return toast("পরিশোধ ০ এর কম হতে পারে না", "error");
    if (paidAmt > subtotal) return toast("পরিশোধ মোটের চেয়ে বেশি হতে পারে না", "error");
    try {
      await invoke("create_purchase", {
        data: {
          supplier_id: supplierId || null,
          items: cart.map(c => ({ product_id: c.product_id, qty: c.qty, price: c.price })),
          paid: paidAmt,
        }
      });
      toast(`ক্রয় সম্পন্ন! মোট ${formatCurrency(subtotal)}, বাকি ${formatCurrency(due)} — স্টক বৃদ্ধি ✓`, "success");
      setCart([]); setPaid(""); load();
    } catch (e) {
      const msg = String(e);
      if (msg.includes("Tauri-not-available")) {
        toast(`ক্রয় সম্পন্ন! মোট ${formatCurrency(subtotal)}, বাকি ${formatCurrency(due)} — স্টক বৃদ্ধি ✓ (browser mock)`, "success");
        setCart([]); setPaid("");
        return;
      }
      toast(msg, "error");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📥 ক্রয়</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>নতুন ক্রয় — Supplier → পণ্য → পরিমাণ → ক্রয় মূল্য → মোট → পরিশোধ → বাকি</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select className="w-full h-9 rounded-lg border px-3 text-sm dark:bg-gray-800 dark:border-gray-700" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              <option value="">সরবরাহকারী (ঐচ্ছিক)</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <div className="flex gap-2 flex-wrap">
              <select className="flex-1 h-9 rounded-lg border px-3 text-sm dark:bg-gray-800 dark:border-gray-700 min-w-[160px]" value={selectedProd} onChange={e => onSelectProd(e.target.value)}>
                <option value="">পণ্য নির্বাচন</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ক্রয় {formatCurrency(p.buy_price)}</option>)}
              </select>
              <Input className="w-20" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty" />
              <Input className="w-28" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="ক্রয় দাম" />
              <Button onClick={addToCart}><Plus size={16} /></Button>
            </div>

            {cart.length > 0 && (
              <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800"><th className="p-2 text-left">পণ্য</th><th className="p-2">Qty</th><th className="p-2">দাম</th><th className="p-2">মোট</th><th></th></tr></thead>
                  <tbody>
                    {cart.map((c, idx) => (
                      <tr key={idx} className="border-t dark:border-gray-700">
                        <td className="p-2">{c.name}</td><td className="p-2 text-center">{c.qty}</td>
                        <td className="p-2 text-right">{formatCurrency(c.price)}</td>
                        <td className="p-2 text-right">{formatCurrency(c.qty * c.price)}</td>
                        <td className="p-2 text-center"><button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder="পরিশোধ ৳" type="number" value={paid} onChange={e => setPaid(e.target.value)} />
              <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1">
                <div>Subtotal: {formatCurrency(subtotal)}</div>
                <div>Due: <span className="text-red-600 font-bold">{formatCurrency(due)}</span></div>
                <div className="text-xs text-gray-500">Stock auto বৃদ্ধি পাবে</div>
              </div>
            </div>
            <Button onClick={submit} className="w-full">ক্রয় সম্পন্ন</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>সাম্প্রতিক ক্রয়</CardTitle></CardHeader>
          <CardContent>
            {purchases.length === 0 ? <p className="text-sm text-gray-400">কোনো ক্রয় নেই</p> :
              <div className="space-y-2 text-sm">
                {purchases.slice(0, 10).map(p => (
                  <div key={p.id} className="flex justify-between border-b pb-2 dark:border-gray-700">
                    <div><p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p><p>{formatCurrency(p.subtotal)}</p></div>
                    <div className="text-right"><p className="text-xs text-red-600">বাকি {formatCurrency(p.due)}</p></div>
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
