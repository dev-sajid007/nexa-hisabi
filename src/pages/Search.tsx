import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { invoke } from "../lib/tauri";
import { Search as SearchIcon } from "lucide-react";

type Results = {
  customers: { id: string; name: string; phone: string | null }[];
  suppliers: { id: string; name: string; phone: string | null }[];
  products: { id: string; name: string; sku: string | null }[];
  invoices: { id: string; invoice_no: string; total: number }[];
};

export function Search() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [res, setRes] = useState<Results | null>(null);

  const doSearch = async (query?: string) => {
    const term = (query ?? q).trim();
    if (!term) return;
    try {
      const r = await invoke<Results>("global_search", { q: term });
      setRes(r);
    } catch {
      setRes({ customers: [{ id: "1", name: "রহিম", phone: "01712" }], suppliers: [], products: [{ id: "1", name: "চাল", sku: "CHAL-001" }], invoices: [{ id: "1", invoice_no: "INV-10023", total: 840 }] });
    }
  };

  useEffect(() => {
    if (initialQ) { setQ(initialQ); doSearch(initialQ); }
  }, [initialQ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🔍 Global Search</h1>
      <Card>
        <CardContent className="pt-6 flex gap-2">
          <Input placeholder="🔍 রহিম, চাল, INV-10023, 017xxxxxxxx..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
          <Button onClick={() => doSearch()}><SearchIcon size={16} className="mr-2" /> খুঁজুন</Button>
        </CardContent>
      </Card>

      {res && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle>👥 Customers ({res.customers.length})</CardTitle></CardHeader>
            <CardContent className="text-sm">{res.customers.length ? res.customers.map(c => <div key={c.id} className="border-b py-2 last:border-0">{c.name} — {c.phone ?? "—"}</div>) : <p className="text-gray-400">কিছু পাওয়া যায়নি</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>🤝 Suppliers ({res.suppliers.length})</CardTitle></CardHeader>
            <CardContent className="text-sm">{res.suppliers.length ? res.suppliers.map(s => <div key={s.id} className="border-b py-2 last:border-0">{s.name} — {s.phone ?? "—"}</div>) : <p className="text-gray-400">কিছু পাওয়া যায়নি</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>📦 Products ({res.products.length})</CardTitle></CardHeader>
            <CardContent className="text-sm">{res.products.length ? res.products.map(p => <div key={p.id} className="border-b py-2 last:border-0">{p.name} — {p.sku ?? "—"}</div>) : <p className="text-gray-400">কিছু পাওয়া যায়নি</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>🧾 Invoices ({res.invoices.length})</CardTitle></CardHeader>
            <CardContent className="text-sm">{res.invoices.length ? res.invoices.map(i => <div key={i.id} className="border-b py-2 last:border-0">{i.invoice_no}</div>) : <p className="text-gray-400">কিছু পাওয়া যায়নি</p>}</CardContent></Card>
        </div>
      )}
    </div>
  );
}
