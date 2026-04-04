import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { fetchProducts, fetchReels, fetchOrders, changePassword } from "../api";

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [reels, setReels] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState({ text: "", ok: false });

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/admin");
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchReels(), fetchOrders()]).then(([p, r, o]) => {
      setProducts(p);
      setReels(r);
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const handlePw = async (e) => {
    e.preventDefault();
    try {
      await changePassword(currentPw, newPw);
      setPwMsg({ text: "Password updated", ok: true });
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => setShowPw(false), 1500);
    } catch {
      setPwMsg({ text: "Incorrect current password", ok: false });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const featured = products.filter((p) => p.featured).length;
  const newArrivals = products.filter((p) => p.newArrival).length;
  const categories = [...new Set(products.map((p) => p.category))];
  const recentProducts = [...products].reverse().slice(0, 5);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1C1C1E]">Dashboard</h1>
        <p className="text-sm text-[#1C1C1E]/40 mt-1">Welcome back. Here's your store overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: products.length, icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z", color: "bg-blue-50 text-blue-600" },
          { label: "Featured", value: featured, icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", color: "bg-amber-50 text-amber-600" },
          { label: "New Arrivals", value: newArrivals, icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z", color: "bg-green-50 text-green-600" },
          { label: "Orders", value: orders.length, icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z", color: "bg-orange-50 text-orange-600" },
          { label: "Pending", value: pendingOrders, icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-red-50 text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#1C1C1E]">{stat.value}</p>
            <p className="text-xs text-[#1C1C1E]/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-[#1C1C1E]">Recent Products</h2>
            <Link to="/admin/products" className="text-xs text-gold hover:text-gold-dark transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F5F7] transition-colors">
                <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] overflow-hidden flex-shrink-0">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1C1C1E] truncate">{p.name}</p>
                  <p className="text-xs text-[#1C1C1E]/40">KES {p.price.toLocaleString()}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {p.featured && <span className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-600 rounded-full">Featured</span>}
                  {p.newArrival && <span className="px-2 py-0.5 text-[10px] bg-green-50 text-green-600 rounded-full">New</span>}
                </div>
                <Link to={`/admin/products/${p.id}/edit`} className="text-xs text-[#1C1C1E]/30 hover:text-gold transition-colors flex-shrink-0">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Categories & Quick Actions */}
        <div className="space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-black/5 p-6">
            <h2 className="text-sm font-semibold text-[#1C1C1E] mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                const pct = Math.round((count / products.length) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#1C1C1E]/60 capitalize">{cat}</span>
                      <span className="text-xs text-[#1C1C1E]/40">{count}</span>
                    </div>
                    <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                      <div className="h-full bg-gold/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-black/5 p-6">
            <h2 className="text-sm font-semibold text-[#1C1C1E] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/admin/products/new" className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F7] hover:bg-gold/10 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <span className="text-sm text-[#1C1C1E]/70">Add New Product</span>
              </Link>
              <Link to="/admin/orders" className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F7] hover:bg-gold/10 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                </div>
                <span className="text-sm text-[#1C1C1E]/70">View Orders</span>
              </Link>
              <Link to="/admin/reels" className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F7] hover:bg-gold/10 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                </div>
                <span className="text-sm text-[#1C1C1E]/70">Manage Reels</span>
              </Link>
              <button
                onClick={() => { setShowPw(!showPw); setPwMsg({ text: "", ok: false }); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F7] hover:bg-gold/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#E8E8EA] flex items-center justify-center text-[#1C1C1E]/40 group-hover:bg-charcoal group-hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
                <span className="text-sm text-[#1C1C1E]/70">Change Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowPw(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">Change Password</h3>
            <p className="text-xs text-[#1C1C1E]/40 mb-6">Enter your current and new password</p>
            <form onSubmit={handlePw} className="space-y-4">
              <input
                type="password" placeholder="Current password" value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)} required
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
              />
              <input
                type="password" placeholder="New password" value={newPw}
                onChange={(e) => setNewPw(e.target.value)} required
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
              />
              {pwMsg.text && (
                <p className={`text-xs ${pwMsg.ok ? "text-green-600" : "text-red-500"}`}>{pwMsg.text}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#1C1C1E] text-white text-sm py-3 rounded-xl hover:bg-gold transition-colors">
                  Update
                </button>
                <button type="button" onClick={() => setShowPw(false)} className="px-6 py-3 text-sm text-[#1C1C1E]/40 hover:text-[#1C1C1E] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
