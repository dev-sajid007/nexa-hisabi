import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/bn";
import { invoke } from "../lib/tauri";
import { useToast } from "../components/ui/toast";
import { validateName, validatePhone } from "../lib/validation";
import { Plus, Trash2 } from "lucide-react";

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  opening_due: number;
};

export function Suppliers() {
  const { toast } = useToast();
  const [list, setList] = useState<Supplier[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "", opening_due: "" });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const data = await invoke<Supplier[]>("get_suppliers");
      setList(data);
    } catch {
      setList([
        { id: "1", name: "ABC Supplier", phone: "017xx", address: "ঢাকা", opening_due: 8000 },
        { id: "2", name: "XYZ Supplier", phone: "018xx", address: "চট্টগ্রাম", opening_due: 3500 },
      ]);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const nameErr = validateName(form.name);
    if (nameErr) return toast(nameErr, "error");
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) return toast(phoneErr, "error");
    try {
      await invoke("create_supplier", {
        data: {
          name: form.name, phone: form.phone || null, address: form.address || null,
          opening_due: form.opening_due ? parseFloat(form.opening_due) : 0
        }
      });
      setForm({ name: "", phone: "", address: "", opening_due: "" });
      setShowForm(false);
      toast("সরবরাহকারী সংরক্ষিত ✓", "success");
      load();
    } catch (e) {
      const msg = String(e);
      if (msg.includes("Tauri-not-available")) {
        setList(prev => [{ id: Date.now().toString(), name: form.name, phone: form.phone || null, address: form.address || null, opening_due: parseFloat(form.opening_due) || 0 }, ...prev]);
        setForm({ name: "", phone: "", address: "", opening_due: "" });
        setShowForm(false);
        toast("সরবরাহকারী সংরক্ষিত ✓ (browser mock)", "success");
        return;
      }
      toast(msg, "error");
    }
  };

  const del = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    try { await invoke("delete_supplier", { id }); toast("মুছে ফেলা হয়েছে", "success"); load(); } catch (e) { toast(String(e), "error"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🤝 সরবরাহকারী ব্যবস্থাপনা</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" /> নতুন</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>নতুন সরবরাহকারী</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <Input placeholder="নাম *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="মোবাইল" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="ঠিকানা" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Input placeholder="বাকি (৳)" type="number" value={form.opening_due} onChange={e => setForm({ ...form, opening_due: e.target.value })} />
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={create}>সংরক্ষণ</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>বাতিল</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>সরবরাহকারী তালিকা</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500"><th className="text-left p-2">নাম</th><th className="text-left p-2">মোবাইল</th><th className="text-left p-2">ঠিকানা</th><th className="text-right p-2">বাকি</th><th className="text-center p-2">Action</th></tr></thead>
            <tbody>
              {list.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-2 font-medium">{s.name}</td>
                  <td className="p-2">{s.phone ?? "—"}</td>
                  <td className="p-2">{s.address ?? "—"}</td>
                  <td className="p-2 text-right text-red-600 font-semibold">{formatCurrency(s.opening_due)}</td>
                  <td className="p-2 text-center"><Button variant="ghost" size="sm" onClick={() => del(s.id)}><Trash2 size={14} /></Button></td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">কোনো সরবরাহকারী নেই</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
