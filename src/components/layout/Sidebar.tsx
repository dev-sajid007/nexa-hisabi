import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  ShoppingCart,
  ShoppingBag,
  BookOpen,
  FileText,
  BarChart3,
  Search,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useEffect } from "react";

const nav = [
  { to: "/", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { to: "/customers", label: "ক্রেতা", icon: Users },
  { to: "/suppliers", label: "সরবরাহকারী", icon: Truck },
  { to: "/products", label: "পণ্য", icon: Package },
  { to: "/sales", label: "বিক্রয়", icon: ShoppingCart },
  { to: "/purchases", label: "ক্রয়", icon: ShoppingBag },
  { to: "/due-book", label: "বাকি খাতা", icon: BookOpen },
  { to: "/invoices", label: "চালান", icon: FileText },
  { to: "/reports", label: "রিপোর্ট", icon: BarChart3 },
  { to: "/search", label: "সার্চ", icon: Search },
  { to: "/settings", label: "সেটিংস", icon: Settings },
];

export function Sidebar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <aside className="w-64 shrink-0 border-r bg-white dark:bg-gray-900 dark:border-gray-800 flex flex-col">
      <div className="h-16 flex items-center gap-2 px-5 border-b dark:border-gray-800">
        <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">নে</div>
        <div>
          <p className="font-bold text-sm leading-none">নেক্সা হিসাব</p>
          <p className="text-xs text-gray-500">V1 • ব্যবসা হিসাব</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500">{dark ? "🌙 Dark" : "☀️ Light"}</span>
        <button
          onClick={() => setDark(!dark)}
          className="h-8 w-8 rounded-lg border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </aside>
  );
}
