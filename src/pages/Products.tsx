import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency, formatNumber } from "../lib/bn";
import { invoke } from "../lib/tauri";
import { useToast } from "../components/ui/toast";
import { Trash2 } from "lucide-react";

type Category = { id: string; name: string };
type Product = {
  id: string; name: string; sku: string | null; category_id: string | null;
  buy_price: number; sell_price: number; stock: number; min_stock: number; unit: string;
};

export function Products() {
  const { toast } = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", sku: "", category_id: "", buy_price: "", sell_price: "", stock: "", min_stock: "5", unit: "পিস" });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [c, p] = await Promise.all([
        invoke<Category[]>("get_categories"),
        invoke<Product[]>("get_products"),
      ]);
      setCats(c); setProducts(p);
    } catch {
      setCats([{ id: "cat-mudi", name: "মুদি" }, { id: "cat-other", name: "অন্যান্য" }]);
      setProducts([
        { id: "1", name: "চাল ৫ কেজি", sku: "CHAL-001", category_id: "cat-mudi", buy_price: 380, sell_price: 420, stock: 25, min_stock: 5, unit: "প্যাকেট" },
        { id: "2", name: "তেল ১ লিটার", sku: "OIL-001", category_id: "cat-mudi", buy_price: 150, sell_price: 170, stock: 2, min_stock: 5, unit: "বোতল" },
      ]);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return toast("পণ্যের নাম আবশ্যক", "error");
    try {
      await invoke("create_product", {
        data: {
          name: form.name, sku: form.sku || null, category_id: form.category_id || null,
          buy_price: parseFloat(form.buy_price) || 0,
          sell_price: parseFloat(form.sell_price) || 0,
          stock: form.stock ? parseFloat(form.stock) : 0,
          min_stock: form.min_stock ? parseFloat(form.min_stock) : 5,
          unit: form.unit || "পিস",
        }
      });
      setForm({ name: "", sku: "", category_id: "", buy_price: "", sell_price: "", stock: "", min_stock: "5", unit: "পিস" });
      setShowForm(false);
      toast("পণ্য সংরক্ষিত ✓", "success");
      load();
    } catch (e) { toast(String(e), "error"); }
  };

  const del = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    try { await invoke("delete_product", { id }); toast("মুছে ফেলা হয়েছে", "success"); load(); } catch (e) { toast(String(e), "error"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📦 পণ্য ব্যবস্থাপনা</h1>
        <Button onClick={() => setShowForm(!showForm)}>নতুন পণ্য</Button>
      </div>

      <div className="flex gap-2 text-sm flex-wrap">
        {cats.map(c => <span key={c.id} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border dark:bg-gray-800 dark:text-gray-300">{c.name}</span>)}
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>নতুন পণ্য</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3">
            <Input placeholder="পণ্যের নাম *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="SKU / কোড" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
            <select className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-700" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Category</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input placeholder="ক্রয় মূল্য" type="number" value={form.buy_price} onChange={e => setForm({ ...form, buy_price: e.target.value })} />
            <Input placeholder="বিক্রয় মূল্য" type="number" value={form.sell_price} onChange={e => setForm({ ...form, sell_price: e.target.value })} />
            <Input placeholder="স্টক" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            <Input placeholder="Min stock" type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} />
            <Input placeholder="একক (পিস/প্যাকেট)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            <div className="md:col-span-3 flex gap-2">
              <Button onClick={create}>সংরক্ষণ</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>বাতিল</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>পণ্য তালিকা — {formatNumber(products.length)}টি</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="border rounded-xl p-4 dark:border-gray-700 relative">
                <button onClick={() => del(p.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                <p className="font-semibold pr-6">{p.name}</p>
                <p className="text-xs text-gray-500">{p.sku ?? "—"} • {p.unit}</p>
                <div className="mt-2 text-sm space-y-1">
                  <p>ক্রয়: {formatCurrency(p.buy_price)} | বিক্রয়: {formatCurrency(p.sell_price)}</p>
                  <p>স্টক: <span className={p.stock <= p.min_stock ? "text-red-600 font-bold" : ""}>{formatNumber(p.stock)} {p.stock <= p.min_stock && "⚠️"}</span> / min {formatNumber(p.min_stock)}</p>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-gray-400 text-sm">কোনো পণ্য নেই</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
