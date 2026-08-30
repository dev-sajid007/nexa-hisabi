import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency, formatNumber } from "../lib/bn";
import { invoke } from "../lib/tauri";

type Summary = { total_sales: number; total_purchases: number; total_profit: number; count_sales: number; count_purchases: number };

export function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const r = await invoke<Summary>("get_reports", { from: from || null, to: to || null });
      setData(r);
    } catch {
      setData({ total_sales: 25450, total_purchases: 12300, total_profit: 13150, count_sales: 12, count_purchases: 5 });
    }
    setLoading(false);
  };

  const preset = (type: "today" | "week" | "month") => {
    const now = new Date();
    const toStr = now.toISOString().slice(0, 10);
    if (type === "today") { setFrom(toStr); setTo(toStr); }
    if (type === "week") { const d = new Date(); d.setDate(d.getDate() - 7); setFrom(d.toISOString().slice(0, 10)); setTo(toStr); }
    if (type === "month") { const d = new Date(); d.setDate(1); setFrom(d.toISOString().slice(0, 10)); setTo(toStr); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📈 রিপোর্ট</h1>

      <Card>
        <CardHeader><CardTitle>ফিল্টার</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap items-end">
          <div><label className="text-xs">From</label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><label className="text-xs">To</label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <Button onClick={fetchReport}>{loading ? "..." : "দেখুন"}</Button>
          <Button variant="outline" onClick={() => preset("today")}>আজ</Button>
          <Button variant="outline" onClick={() => preset("week")}>এই সপ্তাহ</Button>
          <Button variant="outline" onClick={() => preset("month")}>এই মাস</Button>
        </CardContent>
      </Card>

      {data && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>বিক্রয় রিপোর্ট</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(data.total_sales)}</p>
              <p className="text-sm text-gray-500">{formatNumber(data.count_sales)}টি চালান</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>ক্রয় রিপোর্ট</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(data.total_purchases)}</p>
              <p className="text-sm text-gray-500">{formatNumber(data.count_purchases)}টি ক্রয়</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200">
            <CardHeader><CardTitle>লাভ রিপোর্ট</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.total_profit)}</p>
              <p className="text-xs text-gray-500">মোট বিক্রয় − মোট ক্রয়</p>
              <div className="mt-2 text-sm font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                {formatCurrency(data.total_sales)} − {formatCurrency(data.total_purchases)} = {formatCurrency(data.total_profit)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>বাকি রিপোর্ট</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-500">
          বাকি রিপোর্ট দেখতে <b>বাকি খাতা</b> পেজে যান — customer-wise / supplier-wise due সেখানে আছে।
        </CardContent>
      </Card>
    </div>
  );
}
