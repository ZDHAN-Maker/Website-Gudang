import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Detail
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionProducts, setTransactionProducts] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

  // 1. Fetch Semua Transaksi
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/transactions");
      const incomingData = response.data?.data || response.data;
      if (Array.isArray(incomingData)) {
        setTransactions(incomingData);
      } else {
        console.error("Format API salah, ekspektasi Array tapi menerima:", incomingData);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
      setTransactions([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. Fetch Detail & Produk Transaksi (Membuka Modal)
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
      
      const incomingProducts = productsRes.data?.data || productsRes.data;
      setTransactionProducts(Array.isArray(incomingProducts) ? incomingProducts : []);
    } catch (error) {
      console.error("Gagal mengambil detail transaksi:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setTransactionProducts([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden p-6 space-y-6">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Konten Utama */}
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Daftar Transaksi</h1>
            <p className="text-sm text-slate-400 mt-1">
              Kelola dan pantau semua transaksi dari merchant Anda.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 inline-flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Buat Transaksi
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            
            {/* Tampilan Desktop: Tabel */}
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
                  {transactions?.map((trx) => (
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
                  {(!transactions || transactions.length === 0) && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">
                        Belum ada data transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tampilan Mobile/Android: Card List */}
            <div className="md:hidden divide-y divide-slate-700/50">
              {transactions?.map((trx) => (
                <div key={trx.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">
                        #{trx.id}
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-2">{trx.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{trx.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatRupiah(trx.grand_total)}</p>
                    </div>
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

      {/* Modal Detail Transaksi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-lg font-bold text-white">Detail Transaksi</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : selectedTransaction ? (
                <div className="space-y-6">
                  
                  {/* Info Pelanggan */}
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

                  {/* Daftar Produk */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 border-b border-slate-700/50 pb-2">Item Pembelian</h3>
                    <div className="space-y-3">
                      {transactionProducts && transactionProducts.length > 0 ? (
                        transactionProducts.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-200">{item.product_name || `Produk #${item.product_id}`}</span>
                              <span className="text-xs text-slate-400 mt-0.5">{item.qty} x {formatRupiah(item.price)}</span>
                            </div>
                            <span className="font-medium text-white">
                              {formatRupiah(item.qty * item.price)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Tidak ada detail produk.</p>
                      )}
                    </div>
                  </div>

                  {/* Ringkasan Biaya */}
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

            {/* Modal Footer */}
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