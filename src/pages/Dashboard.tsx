import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { formatCurrency, formatNumber, toBnDigits } from "../lib/bn";
import { invoke } from "../lib/tauri";
import { AlertTriangle, TrendingUp, ShoppingCart, Package, Wallet, HandCoins } from "lucide-react";

type Stats = {
  today_sales: number;
  today_purchases: number;
  today_profit: number;
  total_receivable: number;
  total_payable: number;
  total_products: number;
  low_stock_count: number;
};
type LowProduct = { id: string; name: string; stock: number; min_stock: number };

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [low, setLow] = useState<LowProduct[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await invoke<Stats>("get_dashboard_stats");
        setStats(s);
        const l = await invoke<LowProduct[]>("get_low_stock");
        setLow(l.map((p: any) => ({ id: p.id, name: p.name, stock: p.stock, min_stock: p.min_stock })));
      } catch {
        // browser fallback keeps mock
        setStats({ today_sales: 25450, today_purchases: 12300, today_profit: 13150, total_receivable: 45800, total_payable: 12500, total_products: 325, low_stock_count: 3 });
        setLow([{ id: "1", name: "চাল ৫ কেজি", stock: 3, min_stock: 5 }, { id: "2", name: "তেল ১ লিটার", stock: 2, min_stock: 5 }]);
      }
    })();
  }, []);

  const cards = stats ? [
    { label: "আজকের বিক্রয়", value: stats.today_sales, icon: ShoppingCart, color: "text-emerald-600 bg-emerald-50" },
    { label: "আজকের ক্রয়", value: stats.today_purchases, icon: Wallet, color: "text-blue-600 bg-blue-50" },
    { label: "আজকের লাভ", value: stats.today_profit, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "মোট পাওনা", value: stats.total_receivable, icon: HandCoins, color: "text-orange-600 bg-orange-50" },
    { label: "মোট দেনা", value: stats.total_payable, icon: HandCoins, color: "text-red-600 bg-red-50" },
    { label: "মোট পণ্য", value: stats.total_products, isCount: true, icon: Package, color: "text-purple-600 bg-purple-50" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
        <p className="text-sm text-gray-500">আজকের ব্যবসার সারসংক্ষেপ {!stats && "— লোড হচ্ছে..."}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{s.label}</CardTitle>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {(s as any).isCount ? formatNumber(s.value) : formatCurrency(s.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>সাম্প্রতিক লেনদেন</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {[
                { name: "রহিম", type: "বিক্রয়", amount: 2000, id: "INV-10023" },
                { name: "করিম", type: "টাকা গ্রহণ", amount: 1500, id: "PAY-002" },
                { name: "ABC Supplier", type: "ক্রয়", amount: 5000, id: "PUR-001" },
              ].map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b last:border-0 pb-2 dark:border-gray-700">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.type} • {t.id}</p>
                  </div>
                  <span className="font-semibold">{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> কম স্টক {stats && `(${toBnDigits(stats.low_stock_count)}টি)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {low.length === 0 ? <p className="text-sm text-gray-400">সব পণ্য পর্যাপ্ত স্টকে আছে ✓</p> :
              <div className="space-y-2 text-sm">
                {low.slice(0, 5).map(p => (
                  <div key={p.id} className="flex justify-between"><span>{p.name}</span><span className="text-red-600 font-medium">{toBnDigits(p.stock)} / {toBnDigits(p.min_stock)}</span></div>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>

      {stats && (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left p-2">বিক্রয়</th><th className="text-left p-2">ক্রয়</th><th className="text-left p-2">লাভ</th><th className="text-left p-2">পাওনা</th><th className="text-left p-2">দেনা</th><th className="text-left p-2">পণ্য</th></tr></thead>
                <tbody><tr>
                  <td className="p-2">{formatCurrency(stats.today_sales)}</td>
                  <td className="p-2">{formatCurrency(stats.today_purchases)}</td>
                  <td className="p-2 text-emerald-600 font-semibold">{formatCurrency(stats.today_profit)}</td>
                  <td className="p-2">{formatCurrency(stats.total_receivable)}</td>
                  <td className="p-2">{formatCurrency(stats.total_payable)}</td>
                  <td className="p-2">{toBnDigits(stats.total_products)}</td>
                </tr></tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
