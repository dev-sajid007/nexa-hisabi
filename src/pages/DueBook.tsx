import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/bn";
import { invoke } from "../lib/tauri";

type DueEntry = { id: string; name: string; phone: string | null; due: number };
type DueBook = { receivable: DueEntry[]; payable: DueEntry[]; total_receivable: number; total_payable: number };

export function DueBook() {
  const [data, setData] = useState<DueBook | null>(null);
  const [pay, setPay] = useState({ id: "", type: "customer" as "customer"|"supplier", amount: "" });

  const load = async () => {
    try {
      const d = await invoke<DueBook>("get_due_book");
      setData(d);
    } catch {
      setData({
        receivable: [{ id: "1", name: "রহিম", phone: "01712", due: 5200 }, { id: "2", name: "করিম", phone: "01833", due: 2800 }],
        payable: [{ id: "1", name: "ABC Supplier", phone: "017xx", due: 8000 }],
        total_receivable: 9400, total_payable: 11500
      });
    }
  };
  useEffect(() => { load(); }, []);

  const doPay = async () => {
    if (!pay.id || !pay.amount) return alert("ID ও টাকা দিন");
    try {
      await invoke("create_payment", {
        data: {
          party_type: pay.type, party_id: pay.id,
          amount: parseFloat(pay.amount),
          direction: pay.type === "customer" ? "receive" : "pay",
          method: "নগদ"
        }
      });
      alert("লেনদেন সফল ✓");
      setPay({ id: "", type: "customer", amount: "" });
      load();
    } catch (e) { alert(String(e)); }
  };

  if (!data) return <p>লোড হচ্ছে...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📒 বাকি খাতা</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
            <CardTitle>পাওনা — কে টাকা দেবে? <span className="float-right">{formatCurrency(data.total_receivable)}</span></CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {data.receivable.length === 0 ? <p className="text-sm text-gray-400">কোনো পাওনা নেই ✓</p> :
              <table className="w-full text-sm">
                <thead><tr className="border-b text-gray-500"><th className="text-left p-2">নাম</th><th className="text-left p-2">ফোন</th><th className="text-right p-2">বাকি</th></tr></thead>
                <tbody>
                  {data.receivable.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2 font-medium">{r.name}</td><td className="p-2 text-xs">{r.phone ?? "—"}</td><td className="p-2 text-right font-bold">{formatCurrency(r.due)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-orange-50 dark:bg-orange-900/10"><td colSpan={2} className="p-2 text-right">মোট</td><td className="p-2 text-right">{formatCurrency(data.total_receivable)}</td></tr>
                </tbody>
              </table>
            }
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle>দেনা — কাকে টাকা দেবেন? <span className="float-right">{formatCurrency(data.total_payable)}</span></CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {data.payable.length === 0 ? <p className="text-sm text-gray-400">কোনো দেনা নেই ✓</p> :
              <table className="w-full text-sm">
                <thead><tr className="border-b text-gray-500"><th className="text-left p-2">নাম</th><th className="text-left p-2">ফোন</th><th className="text-right p-2">বাকি</th></tr></thead>
                <tbody>
                  {data.payable.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2 font-medium">{r.name}</td><td className="p-2 text-xs">{r.phone ?? "—"}</td><td className="p-2 text-right font-bold text-red-600">{formatCurrency(r.due)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-red-50 dark:bg-red-900/10"><td colSpan={2} className="p-2 text-right">মোট</td><td className="p-2 text-right">{formatCurrency(data.total_payable)}</td></tr>
                </tbody>
              </table>
            }
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>💰 টাকা গ্রহণ / প্রদান</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <select className="h-9 rounded-lg border px-3 text-sm dark:bg-gray-800" value={pay.type} onChange={e => setPay({ ...pay, type: e.target.value as any })}>
            <option value="customer">Customer → ব্যবসায়ী (গ্রহণ)</option>
            <option value="supplier">ব্যবসায়ী → Supplier (প্রদান)</option>
          </select>
          <Input className="max-w-[220px]" placeholder="ID (ক্রেতা/সাপ্লায়ার)" value={pay.id} onChange={e => setPay({ ...pay, id: e.target.value })} />
          <Input className="max-w-[140px]" placeholder="টাকা ৳" type="number" value={pay.amount} onChange={e => setPay({ ...pay, amount: e.target.value })} />
          <Button onClick={doPay}>লেনদেন করুন</Button>
        </CardContent>
      </Card>
    </div>
  );
}
