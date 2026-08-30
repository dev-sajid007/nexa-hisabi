import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { Suppliers } from "./pages/Suppliers";
import { Products } from "./pages/Products";
import { Sales } from "./pages/Sales";
import { Purchases } from "./pages/Purchases";
import { Placeholder } from "./pages/Placeholder";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/due-book" element={<Placeholder title="📒 বাকি খাতা" desc="পাওনা / দেনা — customer & supplier wise due" />} />
          <Route path="/invoices" element={<Placeholder title="🧾 চালান / Invoice" desc="বাংলা invoice • PDF • Print" />} />
          <Route path="/reports" element={<Placeholder title="📈 রিপোর্ট" desc="বিক্রয় / ক্রয় / লাভ / বাকি রিপোর্ট — custom date" />} />
          <Route path="/search" element={<Placeholder title="🔍 Global Search" desc="Customer / Supplier / Product / Invoice / Transaction" />} />
          <Route path="/settings" element={<Placeholder title="⚙️ Settings" desc="দোকানের তথ্য • Backup & Restore • Theme • বাংলা/English" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
