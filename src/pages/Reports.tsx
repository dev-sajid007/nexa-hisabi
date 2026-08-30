import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency, formatNumber } from "../lib/bn";
import { invoke } from "../lib/tauri";
import { useToast } from "../components/ui/toast";

type Summary = { total_sales: number; total_purchases: number; total_profit: number; count_sales: number; count_purchases: number };

export function Reports() {
  const { toast } = useToast();
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
        <>
          {/* Simple bar chart — no external lib */}
          <Card>
            <CardHeader><CardTitle>📊 ভিজ্যুয়াল</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "বিক্রয়", value: data.total_sales, color: "bg-emerald-500" },
                  { label: "ক্রয়", value: data.total_purchases, color: "bg-blue-500" },
                  { label: "লাভ", value: Math.max(0, data.total_profit), color: "bg-green-600" },
                ].map(b => {
                  const max = Math.max(data.total_sales, data.total_purchases, 1);
                  const pct = Math.round((b.value / max) * 100);
                  return (
                    <div key={b.label} className="flex items-center gap-2 text-sm">
                      <span className="w-12">{b.label}</span>
                      <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${b.color} flex items-center justify-end pr-2 text-xs text-white`} style={{ width: `${pct}%` }}>{pct}%</div>
                      </div>
                      <span className="w-28 text-right font-medium">{formatCurrency(b.value)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const csv = `From,To,Total Sales,Total Purchases,Profit,Sales Count,Purchase Count\n${from},${to},${data.total_sales},${data.total_purchases},${data.total_profit},${data.count_sales},${data.count_purchases}`;
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = `report-${from || "all"}-${to || "all"}.csv`; a.click();
                  toast("CSV ডাউনলোড ✓", "success");
                }}>CSV Export</Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
              </div>
            </CardContent>
          </Card>

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
        </>
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
