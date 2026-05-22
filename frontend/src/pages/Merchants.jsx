import { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Merchants() {
  const { user } = useAuth(); 
  // State Utama Merchant
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", photo: null });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef();

  // State Tambahan untuk Manajemen Produk Toko (Merchant Products)
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ product_id: "", stock: "", warehouse_id: "" });
  const [isEditingStock, setIsEditingStock] = useState(false);

  // Fetch semua data merchant
  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const response = await api.get("/merchants");
      setMerchants(response.data.data || response.data || []);
    } catch (err) {
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  // Handler Modal Merchant
  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", address: "", phone: "", photo: null });
    setPreview(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditId(m.id);
    setForm({ name: m.name, address: m.address || "", phone: m.phone || "", photo: null });
    setPreview(m.photo || null);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setError("");
  };

  // Handler File Upload
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5MB");
      return;
    }
    setError("");
    setForm((prev) => ({ ...prev, photo: f }));
    setPreview(URL.createObjectURL(f));
  };

  // Submit CRUD Merchant
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // 3. VALIDASI APAKAH USER LOGIN TERSEDIA
    if (!user || !user.id) {
      setError("Sesi login Anda tidak valid atau kedaluwarsa. Silakan login kembali.");
      setSaving(false);
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k !== "photo" && v !== "") fd.append(k, v);
    });
    if (form.photo) fd.append("photo", form.photo);

    // 4. SELALU SERTAKAN KEEPER_ID DARI USER LOGIN
    fd.append("keeper_id", user.id);

    // Trik Laravel Multipart FormData spoofing untuk method PUT
    if (editId) fd.append("_method", "PUT");

    try {
      if (editId) {
        await api.post(`/merchants/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/merchants", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      closeModal();
      fetchMerchants();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(" | ") : err.response?.data?.message || "Gagal menyimpan data merchant.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/merchants/${id}`);
      setDeleteId(null);
      fetchMerchants();
    } catch {
      alert("Gagal menghapus merchant.");
    }
  };

  // Handler Tambah/Update Produk ke Merchant (MerchantProductController)
  const handleAssignProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEditingStock) {
        await api.put(`/merchants/${selectedMerchant.id}/products/${productForm.product_id}`, {
          stock: productForm.stock,
          warehouse_id: productForm.warehouse_id
        });
      } else {
        await api.post(`/merchants/${selectedMerchant.id}/products`, productForm);
      }
      setShowProductModal(false);
      setProductForm({ product_id: "", stock: "", warehouse_id: "" });
      fetchMerchants(); 
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memproses produk merchant.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden p-6 space-y-6">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Merchant / Toko</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola kemitraan merchant dan alokasi stok produk</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Tambah Merchant
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : merchants.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-300 font-medium">Belum ada merchant</p>
            <p className="text-slate-500 text-sm mt-1">Daftarkan merchant atau mitra toko pertama Anda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-5 py-4">Nama Toko</th>
                  <th className="px-5 py-4 hidden sm:table-cell">Nomor Telepon</th>
                  <th className="px-5 py-4 hidden md:table-cell">Alamat</th>
                  <th className="px-5 py-4 text-center">Produk</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {merchants.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" /></svg>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{m.name}</p>
                          <span className="inline-flex sm:hidden text-xs text-slate-500 mt-0.5">{m.phone || "-"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-slate-400">{m.phone || "-"}</td>
                    <td className="px-5 py-4 hidden md:table-cell text-slate-400 truncate max-w-[250px]">{m.address || "-"}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => { setSelectedMerchant(m); setProductForm({ product_id: "", stock: "", warehouse_id: "" }); setIsEditingStock(false); setShowProductModal(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg transition-all border border-slate-700"
                      >
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Atur Stok
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(m)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteId(m.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2" /></svg>
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

      {/* --- MODAL: CRUD MERCHANT --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editId ? "Edit Profil Merchant" : "Tambah Merchant Baru"}</h2>
                <button onClick={closeModal} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
              </div>

              {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Merchant */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Foto Toko / Logo</label>
                  <div className="relative border-2 border-dashed border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group" onClick={() => fileRef.current.click()}>
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="" className="w-full h-36 object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium">Ganti Foto</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 flex flex-col items-center justify-center gap-2 text-slate-500">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-xs">Klik untuk upload foto merchant</p>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                </div>

                {/* Input Fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Merchant <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Nomor Telepon</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Alamat Lengkap</label>
                  <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={3} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl">Batal</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ATUR STOK PRODUK MERCHANT --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Kelola Produk & Stok</h3>
                <p className="text-xs text-slate-400 mt-0.5">Merchant: {selectedMerchant?.name}</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
            </div>

            <div className="flex gap-2 mb-4 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button type="button" onClick={() => setIsEditingStock(false)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!isEditingStock ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>Alokasi Produk Baru</button>
              <button type="button" onClick={() => setIsEditingStock(true)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${isEditingStock ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>Update Stok</button>
            </div>

            <form onSubmit={handleAssignProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ID Produk <span className="text-red-400">*</span></label>
                <input type="number" required value={productForm.product_id} onChange={e => setProductForm(pf => ({ ...pf, product_id: e.target.value }))} placeholder="Masukkan ID Produk" className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Jumlah Stok <span className="text-red-400">*</span></label>
                  <input type="number" required value={productForm.stock} onChange={e => setProductForm(pf => ({ ...pf, stock: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">ID Gudang <span className="text-red-400">*</span></label>
                  <input type="number" required value={productForm.warehouse_id} onChange={e => setProductForm(pf => ({ ...pf, warehouse_id: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl">
                  {isEditingStock ? "Update Stok" : "Assign Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: HAPUS MERCHANT --- */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6">
            <p className="font-semibold text-white mb-1">Hapus Merchant?</p>
            <p className="text-slate-400 text-sm mb-5">Seluruh data relasi produk terkait toko ini juga akan terputus secara permanen.</p>
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