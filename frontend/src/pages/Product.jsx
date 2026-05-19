import { useState, useEffect, useRef } from "react";
import api from "../api/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category_id: "", photo: null });
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/products").catch(() => ({ data: [] })),
        api.get("/categories"),
      ]);
      setProducts(pRes.data.data || pRes.data || []);
      setCategories(cRes.data.data || cRes.data || []);
    } catch { setProducts([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditId(null); setForm({ name: "", description: "", price: "", stock: "", category_id: "", photo: null }); setPreview(null); setError(""); setShowModal(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ name: p.name, description: p.description || "", price: p.price || "", stock: p.stock || "", category_id: p.category_id || "", photo: null }); setPreview(p.photo || null); setError(""); setShowModal(true); };
  const close = () => { setShowModal(false); setEditId(null); setError(""); };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setError("Maks 2MB"); return; }
    setError(""); setForm(fm => ({ ...fm, photo: f })); setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k !== "photo" && v !== "") fd.append(k, v); });
    if (form.photo) fd.append("photo", form.photo);
    if (editId) fd.append("_method", "PUT");
    try {
      if (editId) await api.post(`/products/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      else await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      close(); fetchAll();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(" | ") : err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/products/${id}`); setDeleteId(null); fetchAll(); }
    catch { alert("Gagal menghapus."); }
  };

  const formatPrice = (p) => p ? `Rp ${Number(p).toLocaleString("id-ID")}` : "-";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Produk</h1><p className="text-slate-400 text-sm mt-1">Kelola data produk dan stok</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Produk
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-300 font-medium">Belum ada produk</p>
            <p className="text-slate-500 text-sm mt-1">Tambah produk pertama Anda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produk</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Kategori</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Harga</th>
                <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.photo ? (
                          <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          {p.description && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">{p.category?.name || "-"}</td>
                    <td className="px-5 py-4 text-slate-300 font-medium hidden md:table-cell">{formatPrice(p.price)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editId ? "Edit Produk" : "Tambah Produk"}</h2>
                <button onClick={close} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Foto Produk</label>
                  <div className="relative border-2 border-dashed border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group" onClick={() => fileRef.current.click()}>
                    {preview ? (
                      <div className="relative"><img src={preview} alt="" className="w-full h-36 object-cover" /><div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-sm font-medium">Ganti Foto</span></div></div>
                    ) : (
                      <div className="h-36 flex flex-col items-center justify-center gap-2 text-slate-500">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <p className="text-xs">Klik untuk upload foto produk</p>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                </div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Nama <span className="text-red-400">*</span></label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" /></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Deskripsi</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Harga (Rp)</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" /></div>
                  <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Stok</label><input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategori</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={close} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl">Batal</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6">
            <p className="font-semibold text-white mb-1">Hapus Produk?</p>
            <p className="text-slate-400 text-sm mb-5">Ini tidak bisa dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl">Batal</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-xl">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}