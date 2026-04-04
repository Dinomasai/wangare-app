import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Reels from "./pages/Reels";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminReels from "./pages/AdminReels";
import AdminProductForm from "./pages/AdminProductForm";
import AdminOrders from "./pages/AdminOrders";
import PaymentStatus from "./pages/PaymentStatus";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AdminWrapper({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
        <Route path="/shop" element={<CustomerLayout><Shop /></CustomerLayout>} />
        <Route path="/shop/:category" element={<CustomerLayout><Shop /></CustomerLayout>} />
        <Route path="/product/:id" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
        <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
        <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
        <Route path="/payment/status" element={<CustomerLayout><PaymentStatus /></CustomerLayout>} />
        <Route path="/reels" element={<CustomerLayout><Reels /></CustomerLayout>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminWrapper><AdminDashboard /></AdminWrapper>} />
        <Route path="/admin/products" element={<AdminWrapper><AdminProducts /></AdminWrapper>} />
        <Route path="/admin/products/new" element={<AdminWrapper><AdminProductForm /></AdminWrapper>} />
        <Route path="/admin/products/:id/edit" element={<AdminWrapper><AdminProductForm /></AdminWrapper>} />
        <Route path="/admin/reels" element={<AdminWrapper><AdminReels /></AdminWrapper>} />
        <Route path="/admin/orders" element={<AdminWrapper><AdminOrders /></AdminWrapper>} />
      </Routes>
    </BrowserRouter>
  );
}
