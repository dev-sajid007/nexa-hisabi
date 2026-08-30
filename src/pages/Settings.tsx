import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { invoke } from "../lib/tauri";

type Business = { shop_name: string; owner_name: string | null; phone: string | null; address: string | null };

export function Settings() {
  const [biz, setBiz] = useState<Business>({ shop_name: "নেক্সা হিসাব", owner_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const b = await invoke<Business>("get_business");
      setBiz(b as any);
    } catch { /* keep default */ }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await invoke("update_business", { data: { shop_name: biz.shop_name, owner_name: biz.owner_name || null, phone: biz.phone || null, address: biz.address || null } });
      alert("দোকানের তথ্য সংরক্ষিত ✓ (চালানে ব্যবহার হবে)");
    } catch (e) { alert(String(e)); }
    setSaving(false);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">⚙️ Settings</h1>

      <Card>
        <CardHeader><CardTitle>🔐 দোকানের তথ্য</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <Input placeholder="দোকানের নাম *" value={biz.shop_name} onChange={e => setBiz({ ...biz, shop_name: e.target.value })} />
          <Input placeholder="মালিকের নাম" value={biz.owner_name ?? ""} onChange={e => setBiz({ ...biz, owner_name: e.target.value })} />
          <Input placeholder="মোবাইল" value={biz.phone ?? ""} onChange={e => setBiz({ ...biz, phone: e.target.value })} />
          <Input placeholder="ঠিকানা" value={biz.address ?? ""} onChange={e => setBiz({ ...biz, address: e.target.value })} />
          <div className="md:col-span-2">
            <Button onClick={save} disabled={saving}>{saving ? "..." : "সংরক্ষণ"}</Button>
            <p className="text-xs text-gray-500 mt-2">এই তথ্য চালান (Invoice) এ দেখাবে। প্রথমবার অ্যাপ চালুর সময় এটি পূরণ করুন।</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>💾 Backup & Restore</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>App local SQLite ব্যবহার করে: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">nexa-hisab.db</code></p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => alert("Backup: Tauri build-এ ফাইল পাথ থেকে nexa-hisab-backup-YYYY-MM-DD.db কপি করুন। (fs/dialog plugin ready)")}>Backup Database</Button>
            <Button variant="outline" onClick={() => alert("Restore: .db ফাইল নির্বাচন করে app_data তে কপি করুন, তারপর restart।")}>Restore Backup</Button>
          </div>
          <p className="text-xs text-gray-500">Windows reinstall / computer change হলেও data হারাবে না।</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>🌓 Theme & 🇧🇩 ভাষা</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-500">
          Sidebar থেকে Dark/Light পরিবর্তন করুন। বাংলা সংখ্যা UI তে auto render হয় (৳ ২৫,৪৫০) — DB তে English সংখ্যাই থাকে।
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>🖨️ Print Support</CardTitle></CardHeader>
        <CardContent className="text-sm">
          Invoice / Customer statement / Sales & Purchase report — চালান পেজ থেকে <b>Print</b> বাটনে PDF/Print করুন।
        </CardContent>
      </Card>
    </div>
  );
}
