import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { invoke } from "../lib/tauri";
import { useToast } from "../components/ui/toast";

type Business = { shop_name: string; owner_name: string | null; phone: string | null; address: string | null };

export function Settings() {
  const { toast } = useToast();
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
    if (!biz.shop_name.trim()) return toast("দোকানের নাম আবশ্যক", "error");
    setSaving(true);
    try {
      await invoke("update_business", { data: { shop_name: biz.shop_name, owner_name: biz.owner_name || null, phone: biz.phone || null, address: biz.address || null } });
      toast("দোকানের তথ্য সংরক্ষিত ✓", "success");
    } catch (e) { toast(String(e), "error"); }
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
          <p className="text-xs text-gray-500" id="db-path">DB path: লোড হচ্ছে...</p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={async () => {
              try {
                const path = await invoke<string>("get_db_path");
                (document.getElementById("db-path") as HTMLElement).textContent = `DB path: ${path}`;
                // In Tauri, use dialog + fs to copy: for browser fallback show path
                if ((window as any).__TAURI__) {
                  const { save } = await import("@tauri-apps/plugin-dialog");
                  const { copyFile } = await import("@tauri-apps/plugin-fs");
                  const dest = await save({ defaultPath: `nexa-hisab-backup-${new Date().toISOString().slice(0,10)}.db`, filters: [{ name: "SQLite", extensions: ["db"] }] });
                  if (dest) { await copyFile(path, dest); toast(`Backup সম্পন্ন ✓ ${dest}`, "success"); }
                } else {
                  toast(`Backup path: ${path}`, "info");
                }
              } catch (e) { toast(String(e), "error"); }
            }}>Backup Database</Button>
            <Button variant="outline" onClick={async () => {
              try {
                if ((window as any).__TAURI__) {
                  const { open } = await import("@tauri-apps/plugin-dialog");
                  const { copyFile } = await import("@tauri-apps/plugin-fs");
                  const src = await open({ filters: [{ name: "SQLite", extensions: ["db"] }] });
                  if (src) {
                    const dest = await invoke<string>("get_db_path");
                    await copyFile(src as string, dest);
                    toast("Restore সম্পন্ন ✓ — অ্যাপ restart করুন", "success");
                  }
                } else toast("Restore: Tauri build-এ .db ফাইল নির্বাচন করুন", "info");
              } catch (e) { toast(String(e), "error"); }
            }}>Restore Backup</Button>
          </div>
          <p className="text-xs text-gray-500">Windows reinstall / computer change হলেও data হারাবে না। Backup এ WAL checkpoint করা হয়।</p>
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
