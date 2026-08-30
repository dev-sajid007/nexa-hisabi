import { Search, Bell } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = () => {
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };
  return (
    <header className="h-16 border-b bg-white dark:bg-gray-900 dark:border-gray-800 flex items-center gap-4 px-6">
      <div className="flex-1 max-w-lg relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="🔍 রহিম, চাল, INV-10023, 017xxxxxxxx..."
          className="pl-9"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800">
          <Bell size={18} />
        </button>
        <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">RH</div>
      </div>
    </header>
  );
}
