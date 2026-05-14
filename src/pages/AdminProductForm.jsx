import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { fetchProduct, createProduct, updateProduct, deleteProductImage } from "../api";

const categoryOptions = [
  { value: "ankara", label: "Ankara Outfits" },
  { value: "bags", label: "Bags" },
  { value: "jewelry", label: "Jewelry" },
  { value: "watches", label: "Watches" },
  { value: "sunglasses", label: "Sunglasses" },
];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { isAdmin, loading: authLoading } = useAdmin();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", price: "", category: "bags", description: "",
    colors: "", sizes: "", featured: false, newArrival: false,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/admin");
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isEdit) {
      fetchProduct(Number(id)).then((p) => {
        if (!p) { navigate("/admin/products"); return; }
        setForm({
          name: p.name, price: String(p.price), category: p.category,
          description: p.description || "", colors: (p.colors || []).join(", "),
          sizes: (p.sizes || []).join(", "), featured: p.featured || false, newArrival: p.newArrival || false,
        });
        setExistingImages(p.images || []);
        setLoading(false);
      });
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRemoveExisting = async (imgPath) => {
    if (!window.confirm("Remove this image?")) return;
    await deleteProductImage(Number(id), imgPath);
    setExistingImages((prev) => prev.filter((img) => img !== imgPath));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("colors", JSON.stringify(form.colors.split(",").map((c) => c.trim()).filter(Boolean)));
    formData.append("sizes", JSON.stringify(form.sizes.split(",").map((s) => s.trim()).filter(Boolean)));
    formData.append("featured", String(form.featured));
    formData.append("newArrival", String(form.newArrival));
    if (isEdit) formData.append("existingImages", JSON.stringify(existingImages));
    newFiles.forEach((file) => formData.append("images", file));

    try {
      if (isEdit) await updateProduct(Number(id), formData);
      else await createProduct(formData);
      navigate("/admin/products");
    } catch {
      setError("Failed to save product. Please try again.");
      setSaving(false);
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-[#1C1C1E]/40 hover:text-[#1C1C1E] transition-colors mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Back to Products
        </Link>
        <h1 className="text-2xl font-semibold text-[#1C1C1E]">{isEdit ? "Edit Product" : "New Product"}</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[#1C1C1E] mb-1">Basic Information</h2>

          <div>
            <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Product Name</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Croc-Embossed Crossbody"
              className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Price (KES)</label>
              <input
                type="number" name="price" value={form.price} onChange={handleChange} required min="0"
                placeholder="4500"
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Category</label>
              <select
                name="category" value={form.category} onChange={handleChange}
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 cursor-pointer"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Describe the product..."
              className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition resize-none"
            />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[#1C1C1E] mb-1">Variants</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Colors</label>
              <input
                type="text" name="colors" value={form.colors} onChange={handleChange}
                placeholder="Black, Brown, Tan"
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
              />
              <p className="text-[10px] text-[#1C1C1E]/30 mt-1">Comma-separated</p>
            </div>
            <div>
              <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Sizes</label>
              <input
                type="text" name="sizes" value={form.sizes} onChange={handleChange}
                placeholder="S, M, L, XL"
                className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
              />
              <p className="text-[10px] text-[#1C1C1E]/30 mt-1">Comma-separated</p>
            </div>
          </div>

          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange}
                className="w-4 h-4 rounded border-[#1C1C1E]/20 text-gold focus:ring-gold/30" />
              <span className="text-sm text-[#1C1C1E]/60 group-hover:text-[#1C1C1E] transition-colors">Featured</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleChange}
                className="w-4 h-4 rounded border-[#1C1C1E]/20 text-gold focus:ring-gold/30" />
              <span className="text-sm text-[#1C1C1E]/60 group-hover:text-[#1C1C1E] transition-colors">New Arrival</span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[#1C1C1E] mb-1">Images</h2>

          {/* Existing */}
          {isEdit && existingImages.length > 0 && (
            <div>
              <p className="text-xs text-[#1C1C1E]/40 mb-3">Current Images</p>
              <div className="flex gap-3 flex-wrap">
                {existingImages.map((img) => (
                  <div key={img} className="relative group">
                    <img src={img} alt="" className="w-20 h-20 rounded-xl object-cover" />
                    <button
                      type="button" onClick={() => handleRemoveExisting(img)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload */}
          <div>
            <label className="block text-xs text-[#1C1C1E]/40 mb-3">{isEdit ? "Add More Images" : "Upload Images"}</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#1C1C1E]/10 rounded-xl py-8 cursor-pointer hover:border-gold/40 hover:bg-gold/5 transition-all group">
              <svg className="w-8 h-8 text-[#1C1C1E]/20 group-hover:text-gold transition-colors mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <span className="text-xs text-[#1C1C1E]/30 group-hover:text-[#1C1C1E]/50 transition-colors">Click to upload images</span>
              <span className="text-[10px] text-[#1C1C1E]/20 mt-1">JPG, PNG, WebP up to 10MB</span>
              <input
                type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                onChange={(e) => setNewFiles((prev) => [...prev, ...Array.from(e.target.files)])}
              />
            </label>
            {newFiles.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-4">
                {newFiles.map((file, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 rounded-xl object-cover" />
                    <button
                      type="button" onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit" disabled={saving}
            className="inline-flex items-center gap-2 bg-[#1C1C1E] text-white text-sm px-6 py-3 rounded-xl hover:bg-gold transition-colors disabled:opacity-50"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? "Save Changes" : "Create Product"}
          </button>
          <Link to="/admin/products" className="text-sm text-[#1C1C1E]/40 hover:text-[#1C1C1E] transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
