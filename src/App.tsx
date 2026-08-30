import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { Suppliers } from "./pages/Suppliers";
import { Products } from "./pages/Products";
import { Sales } from "./pages/Sales";
import { Purchases } from "./pages/Purchases";
import { DueBook } from "./pages/DueBook";
import { Invoices } from "./pages/Invoices";
import { Reports } from "./pages/Reports";
import { Search } from "./pages/Search";
import { Settings } from "./pages/Settings";
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
          <Route path="/due-book" element={<DueBook />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
