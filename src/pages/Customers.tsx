import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/bn";
import { invoke } from "../lib/tauri";
import { Plus, Trash2, Search } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
  opening_due: number;
  created_at: string;
};

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "", opening_due: "" });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await invoke<Customer[]>("get_customers");
      setCustomers(data);
    } catch {
      // browser fallback mock
      setCustomers([
        { id: "1", name: "রহিম", phone: "01712xxxxxx", address: "ঢাকা", note: null, opening_due: 5200, created_at: "" },
        { id: "2", name: "করিম", phone: "01833xxxxxx", address: "চট্টগ্রাম", note: null, opening_due: 2800, created_at: "" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return alert("নাম আবশ্যক");
    try {
      await invoke("create_customer", {
        data: {
          name: form.name,
          phone: form.phone || null,
          address: form.address || null,
          note: form.note || null,
          opening_due: form.opening_due ? parseFloat(form.opening_due) : 0,
        },
      });
      setForm({ name: "", phone: "", address: "", note: "", opening_due: "" });
      setShowForm(false);
      load();
    } catch (e) {
      alert(String(e));
    }
  };

  const del = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    try {
      await invoke("delete_customer", { id });
      load();
    } catch (e) { alert(String(e)); }
  };

  const search = async () => {
    if (!q.trim()) return load();
    try {
      const data = await invoke<Customer[]>("search_customers", { q });
      setCustomers(data);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">👥 ক্রেতা ব্যবস্থাপনা</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" /> নতুন ক্রেতা</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>নতুন ক্রেতা</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <Input placeholder="নাম *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="মোবাইল" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="ঠিকানা" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Input placeholder="বাকি (৳)" type="number" value={form.opening_due} onChange={e => setForm({ ...form, opening_due: e.target.value })} />
            <Input placeholder="নোট" className="md:col-span-2" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={create}>সংরক্ষণ</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>বাতিল</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>ক্রেতা তালিকা {loading && <span className="text-xs text-gray-400">লোড হচ্ছে...</span>}</CardTitle>
          <div className="flex gap-2 max-w-xs w-full">
            <Input placeholder="নাম / মোবাইল খুঁজুন..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            <Button variant="outline" size="icon" onClick={search}><Search size={16} /></Button>
          </div>
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
                {customers.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2 font-medium">{c.name}</td>
                    <td className="p-2">{c.phone ?? "—"}</td>
                    <td className="p-2">{c.address ?? "—"}</td>
                    <td className="p-2 text-right font-semibold">{formatCurrency(c.opening_due)}</td>
                    <td className="p-2 text-center">
                      <Button variant="ghost" size="sm" onClick={() => del(c.id)}><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">কোনো ক্রেতা নেই</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
