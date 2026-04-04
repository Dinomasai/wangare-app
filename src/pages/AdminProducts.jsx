import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { fetchProducts, deleteProduct } from "../api";

export default function AdminProducts() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/admin");
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const categories = ["all", ...new Set(products.map((p) => p.category))];
  let filtered = filter === "all" ? products : products.filter((p) => p.category === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C1C1E]">Products</h1>
          <p className="text-sm text-[#1C1C1E]/40 mt-1">{products.length} total products</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#1C1C1E] text-white text-sm px-5 py-2.5 rounded-xl hover:bg-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-black/5 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C1C1E]/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#F5F5F7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
            />
          </div>
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-xs rounded-lg capitalize transition-all ${
                  filter === cat
                    ? "bg-[#1C1C1E] text-white"
                    : "bg-[#F5F5F7] text-[#1C1C1E]/50 hover:text-[#1C1C1E] hover:bg-[#E8E8EA]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_100px_100px_120px] gap-4 px-6 py-3 border-b border-black/5 text-[11px] text-[#1C1C1E]/30 uppercase tracking-wider">
          <div className="w-12" />
          <div>Product</div>
          <div>Price</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Rows */}
        {filtered.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_100px_100px_120px] gap-4 items-center px-6 py-4 border-b border-black/5 last:border-b-0 hover:bg-[#F5F5F7]/50 transition-colors"
          >
            {/* Thumb */}
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] overflow-hidden flex-shrink-0">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[#1C1C1E]/20">No img</div>
              )}
            </div>

            {/* Name & category */}
            <div className="min-w-0">
              <p className="text-sm text-[#1C1C1E] truncate font-medium">{product.name}</p>
              <p className="text-xs text-[#1C1C1E]/30 capitalize">{product.category}</p>
            </div>

            {/* Price */}
            <p className="hidden sm:block text-sm text-[#1C1C1E]/70">KES {product.price.toLocaleString()}</p>

            {/* Status badges */}
            <div className="hidden sm:flex gap-1.5 flex-wrap">
              {product.featured && <span className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-600 rounded-full">Featured</span>}
              {product.newArrival && <span className="px-2 py-0.5 text-[10px] bg-green-50 text-green-600 rounded-full">New</span>}
              {!product.featured && !product.newArrival && <span className="text-[10px] text-[#1C1C1E]/20">—</span>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 justify-end">
              <Link
                to={`/admin/products/${product.id}/edit`}
                className="p-2 rounded-lg hover:bg-[#F5F5F7] text-[#1C1C1E]/30 hover:text-gold transition-all"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </Link>
              <button
                onClick={() => handleDelete(product.id)}
                disabled={deleting === product.id}
                className="p-2 rounded-lg hover:bg-red-50 text-[#1C1C1E]/30 hover:text-red-500 transition-all disabled:opacity-30"
                title="Delete"
              >
                {deleting === product.id ? (
                  <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[#1C1C1E]/30">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
