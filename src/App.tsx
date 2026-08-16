import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/Dashboard";

export default function App() {
  return (
    <Routes>
      {/* Main Website */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Panel */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Dashboard />} />
    </Routes>
  );
}
