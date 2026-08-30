import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/bn";
import { invoke } from "../lib/tauri";
import { useToast } from "../components/ui/toast";
import { Trash2, Plus, Receipt } from "lucide-react";

type Customer = { id: string; name: string };
type Product = { id: string; name: string; sell_price: number; stock: number };
type CartItem = { product_id: string; name: string; qty: number; price: number };
type Sale = { id: string; invoice_no: string; subtotal: number; discount: number; total: number; paid: number; due: number; created_at: string };

export function Sales() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("");
  const [paid, setPaid] = useState("");
  const [method, setMethod] = useState("নগদ");
  const [selectedProd, setSelectedProd] = useState("");
  const [qty, setQty] = useState("1");

  const load = async () => {
    try {
      const [c, p, s] = await Promise.all([
        invoke<Customer[]>("get_customers"),
        invoke<Product[]>("get_products"),
        invoke<Sale[]>("get_sales"),
      ]);
      setCustomers(c.map(x => ({ id: x.id, name: x.name })));
      setProducts(p.map(x => ({ id: x.id, name: x.name, sell_price: x.sell_price, stock: x.stock })));
      setSales(s);
    } catch {
      setCustomers([{ id: "1", name: "রহিম" }]);
      setProducts([{ id: "p1", name: "চাল ৫ কেজি", sell_price: 420, stock: 25 }]);
      setSales([]);
    }
  };
  useEffect(() => { load(); }, []);

  const addToCart = () => {
    const prod = products.find(p => p.id === selectedProd);
    if (!prod) return toast("পণ্য নির্বাচন করুন", "error");
    const q = parseFloat(qty) || 0;
    if (q <= 0) return toast("পরিমাণ সঠিক দিন", "error");
    if (q > prod.stock) return toast(`স্টক অপর্যাপ্ত (স্টক: ${prod.stock})`, "error");
    setCart([...cart, { product_id: prod.id, name: prod.name, qty: q, price: prod.sell_price }]);
    toast(`${prod.name} কার্টে যোগ ✓`, "success");
    setQty("1");
  };

  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const disc = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - disc);
  const paidAmt = parseFloat(paid) || 0;
  const due = Math.max(0, total - paidAmt);

  const submit = async () => {
    if (cart.length === 0) return toast("কার্ট খালি", "error");
    try {
      const sale = await invoke<Sale>("create_sale", {
        data: {
          customer_id: customerId || null,
          items: cart.map(c => ({ product_id: c.product_id, qty: c.qty, price: c.price })),
          discount: disc,
          paid: paidAmt,
          payment_method: method,
        }
      });
      toast(`বিক্রয় সম্পন্ন! ${sale.invoice_no} — মোট ${formatCurrency(sale.total)}, বাকি ${formatCurrency(sale.due)}`, "success");
      setCart([]); setDiscount(""); setPaid(""); load();
    } catch (e) { toast(String(e), "error"); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🛒 বিক্রয়</h1>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>নতুন বিক্রয় — পণ্য নির্বাচন → পরিমাণ → মূল্য → Discount → মোট → পরিশোধ → বাকি</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <select className="h-9 rounded-lg border px-3 text-sm dark:bg-gray-800 dark:border-gray-700" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">ক্রেতা (ঐচ্ছিক)</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="h-9 rounded-lg border px-3 text-sm dark:bg-gray-800 dark:border-gray-700" value={method} onChange={e => setMethod(e.target.value)}>
                <option>নগদ</option><option>বিকাশ</option><option>নগদ (Nagad)</option><option>ব্যাংক</option><option>অন্যান্য</option>
              </select>
            </div>

            <div className="flex gap-2">
              <select className="flex-1 h-9 rounded-lg border px-3 text-sm dark:bg-gray-800 dark:border-gray-700" value={selectedProd} onChange={e => setSelectedProd(e.target.value)}>
                <option value="">পণ্য নির্বাচন</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.sell_price)} (স্টক {p.stock})</option>)}
              </select>
              <Input className="w-20" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty" />
              <Button onClick={addToCart}><Plus size={16} /></Button>
            </div>

            {cart.length > 0 && (
              <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800"><th className="p-2 text-left">পণ্য</th><th className="p-2">Qty</th><th className="p-2">দাম</th><th className="p-2">মোট</th><th></th></tr></thead>
                  <tbody>
                    {cart.map((c, idx) => (
                      <tr key={idx} className="border-t dark:border-gray-700">
                        <td className="p-2">{c.name}</td>
                        <td className="p-2 text-center">{c.qty}</td>
                        <td className="p-2 text-right">{formatCurrency(c.price)}</td>
                        <td className="p-2 text-right">{formatCurrency(c.qty * c.price)}</td>
                        <td className="p-2 text-center"><button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-3">
              <Input placeholder="Discount ৳" type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
              <Input placeholder="পরিশোধ ৳" type="number" value={paid} onChange={e => setPaid(e.target.value)} />
              <div className="text-sm space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div>Subtotal: {formatCurrency(subtotal)}</div>
                <div>Total: <b>{formatCurrency(total)}</b></div>
                <div>Due: <span className="text-red-600 font-bold">{formatCurrency(due)}</span></div>
              </div>
            </div>

            <Button onClick={submit} className="w-full"><Receipt size={16} className="mr-2" /> বিক্রয় সম্পন্ন — চালান তৈরি</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>সাম্প্রতিক চালান</CardTitle></CardHeader>
          <CardContent>
            {sales.length === 0 ? <p className="text-sm text-gray-400">কোনো বিক্রয় নেই</p> :
              <div className="space-y-2 text-sm">
                {sales.slice(0, 10).map(s => (
                  <div key={s.id} className="flex justify-between border-b pb-2 dark:border-gray-700">
                    <div><p className="font-mono text-xs">{s.invoice_no}</p><p className="text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</p></div>
                    <div className="text-right"><p>{formatCurrency(s.total)}</p><p className="text-xs text-red-600">বাকি {formatCurrency(s.due)}</p></div>
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
