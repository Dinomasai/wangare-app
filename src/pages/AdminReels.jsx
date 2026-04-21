import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { fetchReels, fetchProducts, createReel, updateReel, deleteReel } from "../api";
import SafeImg from "../components/SafeImg";

export default function AdminReels() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tag, setTag] = useState("New Drop");
  const [caption, setCaption] = useState("");
  const [productId, setProductId] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/admin");
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    Promise.all([fetchReels(), fetchProducts()]).then(([r, p]) => {
      setReels(r);
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setTag("New Drop");
    setCaption("");
    setProductId("");
    setMediaFile(null);
    setError("");
  };

  const openEdit = (reel) => {
    setEditId(reel.id);
    setTag(reel.tag || "New Drop");
    setCaption(reel.caption || "");
    setProductId(reel.productId ? String(reel.productId) : "");
    setMediaFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData();
    formData.append("tag", tag);
    formData.append("caption", caption);
    formData.append("productId", productId || "");
    if (mediaFile) formData.append("media", mediaFile);

    try {
      if (editId) {
        const updated = await updateReel(editId, formData);
        setReels((prev) => prev.map((r) => (r.id === editId ? updated : r)));
      } else {
        if (!mediaFile) { setError("Please select a media file"); setSaving(false); return; }
        const created = await createReel(formData);
        setReels((prev) => [...prev, created]);
      }
      resetForm();
    } catch {
      setError("Failed to save reel");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reel?")) return;
    setDeleting(id);
    await deleteReel(id);
    setReels((prev) => prev.filter((r) => r.id !== id));
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C1C1E]">Reels</h1>
          <p className="text-sm text-[#1C1C1E]/40 mt-1">{reels.length} total reels</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-[#1C1C1E] text-white text-sm px-5 py-2.5 rounded-xl hover:bg-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Reel
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={resetForm}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">
              {editId ? "Edit Reel" : "New Reel"}
            </h2>
            <p className="text-xs text-[#1C1C1E]/40 mb-6">Upload a video or image for your reel</p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Media upload */}
              <div>
                <label className="block text-xs text-[#1C1C1E]/40 mb-2">
                  {editId ? "Replace Media (optional)" : "Media"}
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#1C1C1E]/10 rounded-xl py-6 cursor-pointer hover:border-gold/40 hover:bg-gold/5 transition-all group">
                  {mediaFile ? (
                    <span className="text-sm text-[#1C1C1E]/60">{mediaFile.name}</span>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-[#1C1C1E]/20 group-hover:text-gold transition-colors mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-xs text-[#1C1C1E]/30">Click to upload video or image</span>
                    </>
                  )}
                  <input type="file" accept="video/*,image/*" className="hidden" onChange={(e) => setMediaFile(e.target.files[0] || null)} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Tag</label>
                  <input
                    type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="New Drop"
                    className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Linked Product</label>
                  <select
                    value={productId} onChange={(e) => setProductId(e.target.value)}
                    className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 cursor-pointer"
                  >
                    <option value="">None</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#1C1C1E]/40 mb-1.5">Caption</label>
                <textarea
                  value={caption} onChange={(e) => setCaption(e.target.value)} rows={2}
                  placeholder="Write a caption..."
                  className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-gold/30 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1C1C1E] text-white text-sm py-3 rounded-xl hover:bg-gold transition-colors disabled:opacity-50"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editId ? "Save Changes" : "Create Reel"}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3 text-sm text-[#1C1C1E]/40 hover:text-[#1C1C1E] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reels Grid */}
      {reels.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-16 text-center">
          <svg className="w-12 h-12 text-[#1C1C1E]/10 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          <p className="text-sm text-[#1C1C1E]/30 mb-1">No reels yet</p>
          <p className="text-xs text-[#1C1C1E]/20">Upload your first reel to showcase your products</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reels.map((reel) => {
            const linked = products.find((p) => p.id === reel.productId);
            return (
              <div key={reel.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden group">
                {/* Media */}
                <div className="aspect-[9/16] bg-[#F5F5F7] relative overflow-hidden">
                  {reel.mediaType === "video" ? (
                    <video src={reel.media} className="w-full h-full object-cover" muted />
                  ) : (
                    <SafeImg src={reel.media} alt="" className="w-full h-full object-cover" />
                  )}
                  {reel.tag && (
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full">
                      {reel.tag}
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(reel)}
                        className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#1C1C1E] hover:bg-gold hover:text-white transition-all shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(reel.id)}
                        disabled={deleting === reel.id}
                        className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg disabled:opacity-50"
                      >
                        {deleting === reel.id ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  {reel.caption && <p className="text-xs text-[#1C1C1E]/60 truncate">{reel.caption}</p>}
                  {linked && <p className="text-[10px] text-gold mt-0.5 truncate">{linked.name}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
