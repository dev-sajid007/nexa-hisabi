import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { formatCurrency, formatNumber } from "../lib/bn";

export function Products() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📦 পণ্য ব্যবস্থাপনা</h1>
        <Button>নতুন পণ্য</Button>
      </div>
      <div className="flex gap-2 text-sm">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">মুদি</span>
        <span className="px-3 py-1 rounded-full bg-gray-100">পানীয়</span>
        <span className="px-3 py-1 rounded-full bg-gray-100">ইলেকট্রনিক্স</span>
      </div>
      <Card>
        <CardHeader><CardTitle>পণ্য তালিকা</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "চাল ৫ কেজি", sku: "CHAL-001", buy: 380, sell: 420, stock: 25, unit: "প্যাকেট" },
              { name: "তেল ১ লিটার", sku: "OIL-001", buy: 150, sell: 170, stock: 2, unit: "বোতল" },
            ].map((p) => (
              <div key={p.sku} className="border rounded-xl p-4 dark:border-gray-700">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500">{p.sku} • {p.unit}</p>
                <div className="mt-2 text-sm space-y-1">
                  <p>ক্রয়: {formatCurrency(p.buy)} | বিক্রয়: {formatCurrency(p.sell)}</p>
                  <p>স্টক: <span className={p.stock < 5 ? "text-red-600 font-bold" : ""}>{formatNumber(p.stock)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
