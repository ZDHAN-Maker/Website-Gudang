import { useState, useEffect, useRef } from "react";
import api from "../api/api";

export default function Merchants() {
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

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/merchants");
      setMerchants(res.data.data || res.data);
    } catch { setMerchants([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditId(null); setForm({ name: "", address: "", phone: "", photo: null }); setPreview(null); setError(""); setShowModal(true); };
  const openEdit = (m) => { setEditId(m.id); setForm({ name: m.name, address: m.address || "", phone: m.phone || "", photo: null }); setPreview(m.photo || null); setError(""); setShowModal(true); };
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
    fd.append("name", form.name); fd.append("address", form.address); fd.append("phone", form.phone);
    if (form.photo) fd.append("photo", form.photo);
    if (editId) fd.append("_method", "PUT");
    try {
      if (editId) await api.post(`/merchants/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      else await api.post("/merchants", fd, { headers: { "Content-Type": "multipart/form-data" } });
      close(); fetch();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(" | ") : err.response?.data?.message || "Gagal.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/merchants/${id}`); setDeleteId(null); fetch(); }
    catch { alert("Gagal menghapus."); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Merchant</h1><p className="text-slate-400 text-sm mt-1">Kelola data merchant/toko</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Merchant
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : merchants.length === 0 ? (
          <div className="p-12 text-center"><p className="text-slate-300 font-medium">Belum ada merchant</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchant</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Alamat</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Telepon</th>
                <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800">
                {merchants.map(m => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-sm">
                            {m.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-white">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">{m.address || "-"}</td>
                    <td className="px-5 py-4 text-slate-400 hidden md:table-cell">{m.phone || "-"}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                        <button onClick={() => setDeleteId(m.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/></svg></button>
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
                <h2 className="text-lg font-bold text-white">{editId ? "Edit Merchant" : "Tambah Merchant"}</h2>
                <button onClick={close} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Logo Merchant</label>
                  <div className="relative border-2 border-dashed border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group" onClick={() => fileRef.current.click()}>
                    {preview ? (
                      <div className="relative"><img src={preview} alt="" className="w-full h-32 object-cover" /><div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-sm font-medium">Ganti</span></div></div>
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center gap-1 text-slate-500">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <p className="text-xs text-slate-500">Upload foto</p>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                </div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Nama <span className="text-red-400">*</span></label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" /></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Alamat</label><textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none" /></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Telepon</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" /></div>
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
            <p className="font-semibold text-white mb-1">Hapus Merchant?</p>
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