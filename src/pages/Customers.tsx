import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/bn";
import { Plus } from "lucide-react";

export function Customers() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">👥 ক্রেতা ব্যবস্থাপনা</h1>
        <Button><Plus size={16} className="mr-2" /> নতুন ক্রেতা</Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ক্রেতা তালিকা</CardTitle>
          <Input placeholder="নাম / মোবাইল খুঁজুন..." className="max-w-xs" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left p-2">নাম</th>
                  <th className="text-left p-2">মোবাইল</th>
                  <th className="text-left p-2">ঠিকানা</th>
                  <th className="text-right p-2">বাকি</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "রহিম", phone: "01712xxxxxx", addr: "ঢাকা", due: 5200 },
                  { name: "করিম", phone: "01833xxxxxx", addr: "চট্টগ্রাম", due: 2800 },
                ].map((c) => (
                  <tr key={c.name} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2 font-medium">{c.name}</td>
                    <td className="p-2">{c.phone}</td>
                    <td className="p-2">{c.addr}</td>
                    <td className="p-2 text-right font-semibold">{formatCurrency(c.due)}</td>
                    <td className="p-2 text-center space-x-1">
                      <Button variant="outline" size="sm">হিসাব</Button>
                      <Button variant="ghost" size="sm">টাকা গ্রহণ</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
