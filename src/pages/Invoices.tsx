import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { formatCurrency } from "../lib/bn";
import { invoke } from "../lib/tauri";
import { Printer } from "lucide-react";

type Sale = { id: string; invoice_no: string; customer_id: string | null; subtotal: number; discount: number; total: number; paid: number; due: number; payment_method: string; created_at: string };
type SaleItem = { id: string; sale_id: string; product_name: string; qty: number; price: number; total: number };

export function Invoices() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);

  const load = async () => {
    try {
      const s = await invoke<Sale[]>("get_sales");
      setSales(s);
    } catch {
      setSales([{ id: "1", invoice_no: "INV-20250829-0001", customer_id: null, subtotal: 840, discount: 0, total: 840, paid: 500, due: 340, payment_method: "নগদ", created_at: new Date().toISOString() }]);
    }
  };
  useEffect(() => { load(); }, []);

  const open = async (s: Sale) => {
    setSelected(s);
    try {
      const it = await invoke<SaleItem[]>("get_sale_items", { saleId: s.id });
      setItems(it);
    } catch {
      setItems([{ id: "1", sale_id: s.id, product_name: "চাল ৫ কেজি", qty: 2, price: 420, total: 840 }]);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🧾 চালান / Invoice</h1>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>চালান তালিকা</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[70vh] overflow-auto">
            {sales.map(s => (
              <div key={s.id} onClick={() => open(s)} className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selected?.id === s.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "dark:border-gray-700"}`}>
                <p className="font-mono text-sm font-bold">{s.invoice_no}</p>
                <p className="text-xs text-gray-500">{new Date(s.created_at).toLocaleString()}</p>
                <p className="text-sm">{formatCurrency(s.total)} <span className="text-xs">• {s.payment_method}</span></p>
                {s.due > 0 && <p className="text-xs text-red-600">বাকি {formatCurrency(s.due)}</p>}
              </div>
            ))}
            {sales.length === 0 && <p className="text-sm text-gray-400">কোনো চালান নেই</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>চালান প্রিভিউ {selected && `— ${selected.invoice_no}`}</CardTitle>
            {selected && <Button variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} className="mr-2" /> Print / PDF</Button>}
          </CardHeader>
          <CardContent>
            {!selected ? <p className="text-sm text-gray-400 text-center py-12">বাম থেকে একটি চালান নির্বাচন করুন</p> :
              <div id="invoice" className="border rounded-lg p-6 bg-white dark:bg-gray-900 dark:border-gray-700 print:shadow-none">
                <div className="text-center border-b pb-4 mb-4">
                  <h2 className="text-xl font-bold">নেক্সা হিসাব</h2>
                  <p className="text-xs text-gray-500">বাংলা চালান • {selected.invoice_no} • {new Date(selected.created_at).toLocaleDateString()}</p>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-2">পণ্য</th><th className="text-center p-2">পরিমাণ</th><th className="text-right p-2">দাম</th><th className="text-right p-2">মোট</th></tr></thead>
                  <tbody>
                    {items.map(it => (
                      <tr key={it.id} className="border-b last:border-0"><td className="p-2">{it.product_name}</td><td className="p-2 text-center">{it.qty}</td><td className="p-2 text-right">{formatCurrency(it.price)}</td><td className="p-2 text-right">{formatCurrency(it.total)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-sm space-y-1 text-right">
                  <p>Subtotal: {formatCurrency(selected.subtotal)}</p>
                  <p>Discount: {formatCurrency(selected.discount)}</p>
                  <p className="font-bold text-base">মোট: {formatCurrency(selected.total)}</p>
                  <p>পরিশোধ ({selected.payment_method}): {formatCurrency(selected.paid)}</p>
                  <p className="text-red-600 font-bold">বাকি: {formatCurrency(selected.due)}</p>
                </div>
                <p className="text-xs text-center text-gray-400 mt-6">ধন্যবাদ — আবার আসবেন</p>
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
