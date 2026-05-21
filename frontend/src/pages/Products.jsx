import { useState, useEffect, useRef } from "react";
import api from "../api/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [stockModal, setStockModal] = useState({ show: false, loading: false, data: null, productName: "" });
  
  // Form state
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", about: "", price: "", category_id: "", is_popular: false, thumbnail: null });
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/products").catch(() => ({ data: [] })),
        api.get("/categories").catch(() => ({ data: [] })),
      ]);
      setProducts(pRes.data.data || pRes.data || []);
      setCategories(cRes.data.data || cRes.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", about: "", price: "", category_id: "", is_popular: false, thumbnail: null });
    setPreview(null);
    setError("");
    setShowModal(true);
  };

  // Karena endpoint index tidak membawa field 'about', kita fetch detail produk saat mau edit
  const openEdit = async (p) => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${p.id}`);
      const detail = res.data.data || res.data;
      
      setEditId(detail.id);
      setForm({
        name: detail.name,
        about: detail.about || "",
        price: detail.price || "",
        category_id: detail.category_id || "",
        is_popular: Boolean(detail.is_popular),
        thumbnail: null
      });
      setPreview(detail.thumbnail || null);
      setError("");
      setShowModal(true);
    } catch (err) {
      alert("Gagal mengambil detail produk.");
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowModal(false);
    setEditId(null);
    setError("");
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setError("Maks 2MB"); return; }
    setError("");
    setForm((fm) => ({ ...fm, thumbnail: f }));
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "thumbnail") {
        if (v) fd.append("thumbnail", v);
      } else if (k === "is_popular") {
        fd.append("is_popular", v ? 1 : 0);
      } else if (v !== "") {
        fd.append(k, v);
      }
    });

    if (editId) fd.append("_method", "PUT");

    try {
      if (editId) {
        await api.post(`/products/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      closeForm();
      fetchAll();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(" | ") : err.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setDeleteId(null);
      fetchAll();
    } catch {
      alert("Gagal menghapus produk.");
    }
  };

  const checkStock = async (p) => {
    setStockModal({ show: true, loading: true, data: null, productName: p.name });
    try {
      const res = await api.get(`/products/${p.id}/stock`);
      setStockModal(prev => ({ ...prev, loading: false, data: res.data.data }));
    } catch (err) {
      setStockModal(prev => ({ ...prev, loading: false, data: { error: "Gagal memuat rincian stok" } }));
    }
  };

  const formatPrice = (p) => (p ? `Rp ${Number(p).toLocaleString("id-ID")}` : "-");

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden p-6 space-y-6 ">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Katalog Produk</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola data produk, kategori, dan rincian stok.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Produk
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-slate-300 font-medium text-lg">Belum ada produk</p>
            <p className="text-slate-500 text-sm mt-1">Tambahkan produk pertama Anda ke dalam sistem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/20">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Produk</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Kategori</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Harga</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-200">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 hidden sm:table-cell">{p.category?.name || "-"}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium hidden md:table-cell">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4 text-center">
                      {p.is_popular ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Populer
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          Biasa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => checkStock(p)} title="Cek Stok" className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </button>
                        <button onClick={() => openEdit(p)} title="Edit Produk" className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button onClick={() => setDeleteId(p.id)} title="Hapus" className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-white">{editId ? "Edit Produk" : "Tambah Produk"}</h2>
              <button onClick={closeForm} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p>{error}</p>
                </div>
              )}

              <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail Produk <span className="text-red-400">*</span></label>
                  <div 
                    className="relative border-2 border-dashed border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group" 
                    onClick={() => fileRef.current.click()}
                  >
                    {preview ? (
                      <div className="relative h-48 w-full bg-slate-950">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                            Ganti Thumbnail
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center gap-3 text-slate-500 p-6 text-center">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-400 group-hover:text-blue-400">Klik untuk upload gambar</p>
                          <p className="text-xs mt-1">JPEG, PNG, JPG (Maks. 2MB)</p>
                        </div>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/jpeg, image/png, image/jpg" className="hidden" onChange={handleFile} />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Produk <span className="text-red-400">*</span></label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600" placeholder="Contoh: Kopi Susu Aren" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategori <span className="text-red-400">*</span></label>
                    <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} required className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Harga (Rp) <span className="text-red-400">*</span></label>
                    <input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600" placeholder="0" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Tentang Produk (About) <span className="text-red-400">*</span></label>
                    <textarea value={form.about} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} required rows={3} className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder:text-slate-600" placeholder="Deskripsikan produk ini..." />
                  </div>

                  {/* Toggle Is Popular */}
                  <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-white">Tandai sebagai Populer</p>
                      <p className="text-xs text-slate-500 mt-0.5">Produk ini akan tampil di bagian rekomendasi.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm(f => ({ ...f, is_popular: e.target.checked }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3 shrink-0">
              <button type="button" onClick={closeForm} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors">
                Batal
              </button>
              <button form="productForm" type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                {saving && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                )}
                {saving ? "Menyimpan..." : "Simpan Produk"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Stock Summary */}
      {stockModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setStockModal({ show: false, loading: false, data: null, productName: "" })} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Rincian Stok</h3>
                <button onClick={() => setStockModal({ show: false, loading: false, data: null, productName: "" })} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
              </div>
              <p className="text-sm text-slate-400 mb-6 border-b border-slate-800 pb-4">Produk: <span className="font-semibold text-white">{stockModal.productName}</span></p>
              
              {stockModal.loading ? (
                <div className="py-8 flex justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : stockModal.data?.error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{stockModal.data.error}</div>
              ) : (
                <div className="space-y-3">
                  {/* Asumsi response object: { gudang: 10, merchant: 5, total: 15 } dsb */}
                  {Object.entries(stockModal.data || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-sm font-medium text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-base font-bold text-emerald-400">{value}</span>
                    </div>
                  ))}
                  {(!stockModal.data || Object.keys(stockModal.data).length === 0) && (
                     <p className="text-center text-slate-500 text-sm">Data stok tidak tersedia.</p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-slate-800">
              <button onClick={() => setStockModal({ show: false, loading: false, data: null, productName: "" })} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Hapus Produk?</h3>
            <p className="text-slate-400 text-sm mb-6">Data yang dihapus tidak dapat dikembalikan. Lanjutkan?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors">Batal</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-xl transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}