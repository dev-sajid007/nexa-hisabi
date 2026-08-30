import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { formatCurrency } from "../lib/bn";

export function Suppliers() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🤝 সরবরাহকারী ব্যবস্থাপনা</h1>
        <Button>নতুন সরবরাহকারী</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>সরবরাহকারী তালিকা</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500"><th className="text-left p-2">নাম</th><th className="text-left p-2">মোবাইল</th><th className="text-right p-2">মোট ক্রয়</th><th className="text-right p-2">বাকি</th></tr></thead>
            <tbody>
              <tr className="border-b"><td className="p-2">ABC Supplier</td><td className="p-2">017xx</td><td className="p-2 text-right">{formatCurrency(45000)}</td><td className="p-2 text-right text-red-600">{formatCurrency(8000)}</td></tr>
              <tr><td className="p-2">XYZ Supplier</td><td className="p-2">018xx</td><td className="p-2 text-right">{formatCurrency(22000)}</td><td className="p-2 text-right text-red-600">{formatCurrency(3500)}</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
