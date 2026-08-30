import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { formatCurrency, formatNumber, toBnDigits } from "../lib/bn";
import { AlertTriangle, TrendingUp, ShoppingCart, Package, Wallet, HandCoins } from "lucide-react";

const stats = [
  { label: "আজকের বিক্রয়", value: 25450, icon: ShoppingCart, color: "text-emerald-600 bg-emerald-50" },
  { label: "আজকের ক্রয়", value: 12300, icon: Wallet, color: "text-blue-600 bg-blue-50" },
  { label: "আজকের লাভ", value: 13150, icon: TrendingUp, color: "text-green-600 bg-green-50" },
  { label: "মোট পাওনা", value: 45800, icon: HandCoins, color: "text-orange-600 bg-orange-50" },
  { label: "মোট দেনা", value: 12500, icon: HandCoins, color: "text-red-600 bg-red-50" },
  { label: "মোট পণ্য", value: 325, isCount: true, icon: Package, color: "text-purple-600 bg-purple-50" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
        <p className="text-sm text-gray-500">আজকের ব্যবসার সারসংক্ষেপ</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{s.label}</CardTitle>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {s.isCount ? formatNumber(s.value) : formatCurrency(s.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>সাম্প্রতিক লেনদেন</CardTitle>
          </CardHeader>
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

        {/* Low stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> কম স্টক
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>চাল ৫ কেজি</span><span className="text-red-600 font-medium">{toBnDigits("3টি")}</span></div>
              <div className="flex justify-between"><span>তেল ১ লিটার</span><span className="text-red-600 font-medium">{toBnDigits("2টি")}</span></div>
              <div className="flex justify-between"><span>চিনি ১ কেজি</span><span className="text-amber-600 font-medium">{toBnDigits("4টি")}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mock হিসাব table like doc */}
      <Card>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">বিক্রয়</th>
                  <th className="text-left p-2">ক্রয়</th>
                  <th className="text-left p-2">লাভ</th>
                  <th className="text-left p-2">পাওনা</th>
                  <th className="text-left p-2">দেনা</th>
                  <th className="text-left p-2">পণ্য</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">{formatCurrency(25450)}</td>
                  <td className="p-2">{formatCurrency(12300)}</td>
                  <td className="p-2 text-emerald-600 font-semibold">{formatCurrency(13150)}</td>
                  <td className="p-2">{formatCurrency(45800)}</td>
                  <td className="p-2">{formatCurrency(12500)}</td>
                  <td className="p-2">{toBnDigits(325)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
