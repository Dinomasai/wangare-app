import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { adminLogin } from "../api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAdmin();
  const navigate = useNavigate();

  if (isAdmin) {
    navigate("/admin/dashboard");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminLogin(username, password);
      login(token);
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-white tracking-wider">
            Wangaré <span className="text-gold">Luxe</span>
          </h1>
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/30 mt-2">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">Welcome back</h2>
          <p className="text-xs text-[#1C1C1E]/40 mb-6">Sign in to manage your store</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">{error}</div>
            )}

            <div>
              <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#1C1C1E] text-white text-sm py-3 rounded-xl hover:bg-gold transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Sign In
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/20">
          Wangaré Luxe Admin
        </p>
      </div>
    </div>
  );
}
