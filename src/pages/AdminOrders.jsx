import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { fetchOrders, updateOrderStatus, deleteOrder } from "../api";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

const STATUS_OPTIONS = ["pending", "confirmed", "delivered", "cancelled"];

export default function AdminOrders() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/admin");
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const handleStatus = async (id, status) => {
    const updated = await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1C1C1E]">Orders</h1>
        <p className="text-sm text-[#1C1C1E]/40 mt-1">{orders.length} total orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-xs rounded-lg capitalize transition-all ${
              filter === s
                ? "bg-[#1C1C1E] text-white"
                : "bg-white border border-black/5 text-[#1C1C1E]/50 hover:text-[#1C1C1E]"
            }`}
          >
            {s} {counts[s] > 0 && <span className="ml-1 opacity-60">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map((order) => {
          const isOpen = expanded === order.id;
          const date = new Date(order.createdAt);
          const timeAgo = getTimeAgo(date);

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden">
              {/* Order header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-[#F5F5F7]/50 transition-colors"
              >
                {/* Order ID + time */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-[#1C1C1E]">
                      #{String(order.id).padStart(4, "0")}
                    </p>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wide ${STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#1C1C1E]/40 mt-0.5">
                    {order.customer?.name} &bull; {timeAgo}
                  </p>
                </div>

                {/* Total */}
                <p className="text-sm font-medium text-[#1C1C1E] flex-shrink-0">
                  KES {order.total?.toLocaleString()}
                </p>

                {/* Expand icon */}
                <svg className={`w-4 h-4 text-[#1C1C1E]/20 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div className="px-6 pb-5 border-t border-black/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {/* Customer info */}
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#1C1C1E]/30 mb-2">Customer</p>
                      <p className="text-sm text-[#1C1C1E]">{order.customer?.name}</p>
                      <p className="text-xs text-[#1C1C1E]/50 mt-1">{order.customer?.phone}</p>
                      <p className="text-xs text-[#1C1C1E]/50">{order.customer?.location}</p>
                      {/* WhatsApp link */}
                      <a
                        href={`https://wa.me/${order.customer?.phone?.replace(/\s+/g, "").replace(/^0/, "254")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs text-green-600 hover:text-green-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        Message on WhatsApp
                      </a>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#1C1C1E]/30 mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-[#1C1C1E]">{item.name}</span>
                              {(item.color || item.size) && (
                                <span className="text-[#1C1C1E]/30 text-xs ml-1">
                                  ({[item.color, item.size].filter(Boolean).join(", ")})
                                </span>
                              )}
                              <span className="text-[#1C1C1E]/30 text-xs ml-1">x{item.qty}</span>
                            </div>
                            <span className="text-[#1C1C1E]/60 text-xs">KES {(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#1C1C1E]/30 mb-2">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatus(order.id, s)}
                            disabled={order.status === s}
                            className={`px-3 py-1.5 text-[11px] rounded-lg capitalize transition-all ${
                              order.status === s
                                ? "bg-[#1C1C1E] text-white"
                                : "bg-[#F5F5F7] text-[#1C1C1E]/50 hover:text-[#1C1C1E] hover:bg-[#E8E8EA]"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete order
                      </button>
                      <p className="mt-3 text-[10px] text-[#1C1C1E]/20">
                        {date.toLocaleDateString("en-KE", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-black/5 p-16 text-center">
          <p className="text-sm text-[#1C1C1E]/30">No orders yet</p>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}
