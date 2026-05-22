import React, { useState, useEffect } from "react";
import api from "../api/api";

const TAX_RATE = 0.1;

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionProducts, setTransactionProducts] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    merchant_id: "",
    items: [], // [{ product_id, product_name, price, qty }]
  });

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  // ─── Fetch Transactions ──────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/transactions");
      let arr = [];
      if (Array.isArray(response.data)) arr = response.data;
      else if (Array.isArray(response.data?.data)) arr = response.data.data;
      else if (Array.isArray(response.data?.data?.data)) arr = response.data.data.data;
      setTransactions(arr);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ─── Detail Modal ────────────────────────────────────────────────────────
  const handleViewDetail = async (id) => {
    setIsModalOpen(true);
    setLoadingDetail(true);
    setSelectedTransaction(null);
    setTransactionProducts([]);
    try {
      const [detailRes, productsRes] = await Promise.all([
        api.get(`/transactions/${id}`),
        api.get(`/transactions/${id}/products`),
      ]);
      setSelectedTransaction(detailRes.data?.data || detailRes.data);
      let arr = [];
      if (Array.isArray(productsRes.data)) arr = productsRes.data;
      else if (Array.isArray(productsRes.data?.data)) arr = productsRes.data.data;
      setTransactionProducts(arr);
    } catch {
      // silently fail — modal shows "data tidak ditemukan"
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setTransactionProducts([]);
  };

  // ─── Create Modal ────────────────────────────────────────────────────────
  const openCreate = async () => {
    setIsCreateOpen(true);
    setCreateError("");
    setForm({ name: "", phone: "", merchant_id: "", items: [] });
    setLoadingMeta(true);
    try {
      const [mRes, pRes] = await Promise.all([
        api.get("/merchants").catch(() => ({ data: [] })),
        api.get("/products").catch(() => ({ data: [] })),
      ]);
      setMerchants(mRes.data?.data || mRes.data || []);
      setProducts(pRes.data?.data || pRes.data || []);
    } catch {
      setMerchants([]);
      setProducts([]);
    } finally {
      setLoadingMeta(false);
    }
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    setCreateError("");
  };

  // Tambah produk ke items
  const addProduct = (productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;
    const already = form.items.find((i) => String(i.product_id) === String(productId));
    if (already) return; // sudah ada, tidak dobel
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        { product_id: product.id, product_name: product.name, price: Number(product.price), qty: 1 },
      ],
    }));
  };

  const updateQty = (productId, qty) => {
    const q = Math.max(1, Number(qty));
    setForm((f) => ({
      ...f,
      items: f.items.map((i) => (String(i.product_id) === String(productId) ? { ...i, qty: q } : i)),
    }));
  };

  const removeItem = (productId) => {
    setForm((f) => ({
      ...f,
      items: f.items.filter((i) => String(i.product_id) !== String(productId)),
    }));
  };

  // Kalkulasi otomatis
  const subTotal = form.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const taxTotal = Math.round(subTotal * TAX_RATE);
  const grandTotal = subTotal + taxTotal;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      setCreateError("Tambahkan minimal 1 produk ke transaksi.");
      return;
    }
    setSaving(true);
    setCreateError("");
    try {
      await api.post("/transactions", {
        name: form.name,
        phone: form.phone,
        merchant_id: form.merchant_id,
        sub_total: subTotal,
        tax_total: taxTotal,
        grand_total: grandTotal,
      });
      closeCreate();
      fetchTransactions();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setCreateError(
        msgs
          ? Object.values(msgs).flat().join(" | ")
          : err.response?.data?.message || "Gagal membuat transaksi."
      );
    } finally {
      setSaving(false);
    }
  };

  // Produk yang belum dipilih (untuk dropdown tambah)
  const availableProducts = products.filter(
    (p) => !form.items.find((i) => String(i.product_id) === String(p.id))
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden p-6 space-y-6">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Daftar Transaksi</h1>
            <p className="text-sm text-slate-400 mt-1">
              Kelola dan pantau semua transaksi dari merchant Anda.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Buat Transaksi
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700/50 text-slate-300 text-sm">
                    <th className="py-4 px-6 font-semibold">ID</th>
                    <th className="py-4 px-6 font-semibold">Pelanggan</th>
                    <th className="py-4 px-6 font-semibold">No. Telepon</th>
                    <th className="py-4 px-6 font-semibold text-right">Total Transaksi</th>
                    <th className="py-4 px-6 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 text-sm text-white font-medium">#{trx.id}</td>
                      <td className="py-4 px-6 text-sm text-slate-300">{trx.name}</td>
                      <td className="py-4 px-6 text-sm text-slate-400">{trx.phone}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-white text-right">
                        {formatRupiah(trx.grand_total)}
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        <button
                          onClick={() => handleViewDetail(trx.id)}
                          className="text-blue-400 hover:text-white font-medium text-sm bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        Belum ada data transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-slate-700/50">
              {transactions.map((trx) => (
                <div key={trx.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">
                        #{trx.id}
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-2">{trx.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{trx.phone}</p>
                    </div>
                    <p className="text-sm font-bold text-white">{formatRupiah(trx.grand_total)}</p>
                  </div>
                  <button
                    onClick={() => handleViewDetail(trx.id)}
                    className="mt-3 w-full border border-slate-600 text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Buat Transaksi ───────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30 shrink-0">
              <h2 className="text-lg font-bold text-white">Buat Transaksi Baru</h2>
              <button onClick={closeCreate} className="text-slate-400 hover:text-white p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {createError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{createError}</p>
                </div>
              )}

              {loadingMeta ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : (
                <form id="createTrxForm" onSubmit={handleCreate} className="space-y-5">

                  {/* Info Pelanggan */}
                  <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Info Pelanggan</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          Nama Pelanggan <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Contoh: Budi Santoso"
                          className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          No. Telepon <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="Contoh: 08123456789"
                          className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Merchant */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Merchant <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={form.merchant_id}
                        onChange={(e) => setForm((f) => ({ ...f, merchant_id: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                      >
                        <option value="">-- Pilih Merchant --</option>
                        {merchants.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pilih Produk */}
                  <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pilih Produk</p>

                    {/* Dropdown tambah produk */}
                    <select
                      value=""
                      onChange={(e) => { if (e.target.value) addProduct(e.target.value); }}
                      className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="">+ Tambahkan produk...</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatRupiah(p.price)}
                        </option>
                      ))}
                    </select>

                    {/* Daftar item yang dipilih */}
                    {form.items.length > 0 ? (
                      <div className="space-y-2">
                        {form.items.map((item) => (
                          <div
                            key={item.product_id}
                            className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700/50 rounded-xl"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">{item.product_name}</p>
                              <p className="text-xs text-slate-500">{formatRupiah(item.price)} / item</p>
                            </div>
                            {/* Qty control */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateQty(item.product_id, item.qty - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-lg leading-none"
                              >−</button>
                              <span className="w-8 text-center text-sm font-semibold text-white">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateQty(item.product_id, item.qty + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-lg leading-none"
                              >+</button>
                            </div>
                            {/* Subtotal item */}
                            <p className="text-sm font-semibold text-white w-24 text-right shrink-0">
                              {formatRupiah(item.price * item.qty)}
                            </p>
                            {/* Hapus */}
                            <button
                              type="button"
                              onClick={() => removeItem(item.product_id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl">
                        Belum ada produk dipilih
                      </div>
                    )}
                  </div>

                  {/* Ringkasan Biaya */}
                  {form.items.length > 0 && (
                    <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2.5">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Biaya</p>
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Sub Total</span>
                        <span className="text-slate-200">{formatRupiah(subTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Pajak (10%)</span>
                        <span className="text-slate-200">{formatRupiah(taxTotal)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-700/50">
                        <span>Grand Total</span>
                        <span className="text-blue-400">{formatRupiah(grandTotal)}</span>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={closeCreate}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                form="createTrxForm"
                type="submit"
                disabled={saving || loadingMeta}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {saving && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {saving ? "Menyimpan..." : "Buat Transaksi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detail Transaksi ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-lg font-bold text-white">Detail Transaksi</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : selectedTransaction ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pelanggan</p>
                      <p className="text-sm font-medium text-white mt-1">{selectedTransaction.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">No. Telepon</p>
                      <p className="text-sm font-medium text-white mt-1">{selectedTransaction.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 border-b border-slate-700/50 pb-2">Item Pembelian</h3>
                    <div className="space-y-3">
                      {transactionProducts.length > 0 ? (
                        transactionProducts.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <p className="font-medium text-slate-200">{item.product_name || `Produk #${item.product_id}`}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{item.qty} × {formatRupiah(item.price)}</p>
                            </div>
                            <span className="font-medium text-white">{formatRupiah(item.qty * item.price)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Tidak ada detail produk.</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Sub Total</span>
                      <span>{formatRupiah(selectedTransaction.sub_total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Pajak</span>
                      <span>{formatRupiah(selectedTransaction.tax_total)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-white pt-3 mt-1 border-t border-slate-700/50">
                      <span>Grand Total</span>
                      <span className="text-blue-400">{formatRupiah(selectedTransaction.grand_total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500">Data tidak ditemukan.</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-slate-800 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white font-medium text-sm transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}