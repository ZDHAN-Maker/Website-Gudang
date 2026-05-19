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
      setTransactions([]); // Fallback ke array kosong jika API error
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
      // Menjalankan 2 request secara paralel agar lebih cepat
      const [detailRes, productsRes] = await Promise.all([
        api.get(`/transactions/${id}`),
        api.get(`/transactions/${id}/products`),
      ]);

      setSelectedTransaction(detailRes.data?.data || detailRes.data);
      
      // PENGAMAN: Pastikan data produk juga berbentuk Array
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Transaksi</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola dan pantau semua transaksi dari merchant Anda.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Buat Transaksi
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Tampilan Desktop: Tabel */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                    <th className="py-4 px-6 font-semibold">ID</th>
                    <th className="py-4 px-6 font-semibold">Pelanggan</th>
                    <th className="py-4 px-6 font-semibold">No. Telepon</th>
                    <th className="py-4 px-6 font-semibold text-right">Total Transaksi</th>
                    <th className="py-4 px-6 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* PENGAMAN: Menggunakan optional chaining ?.map */}
                  {transactions?.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">#{trx.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{trx.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">{trx.phone}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
                        {formatRupiah(trx.grand_total)}
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        <button
                          onClick={() => handleViewDetail(trx.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        Belum ada data transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tampilan Mobile/Android: Card List */}
            <div className="md:hidden divide-y divide-gray-100">
              {/* PENGAMAN: Menggunakan optional chaining ?.map */}
              {transactions?.map((trx) => (
                <div key={trx.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        #{trx.id}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 mt-2">{trx.name}</h3>
                      <p className="text-xs text-gray-500">{trx.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatRupiah(trx.grand_total)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetail(trx.id)}
                    className="mt-3 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Detail Transaksi</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : selectedTransaction ? (
                <div className="space-y-6">
                  {/* Info Pelanggan */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pelanggan</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{selectedTransaction.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">No. Telepon</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{selectedTransaction.phone}</p>
                    </div>
                  </div>

                  {/* Daftar Produk */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Item Pembelian</h3>
                    <div className="space-y-3">
                      {transactionProducts && transactionProducts.length > 0 ? (
                        transactionProducts.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{item.product_name || `Produk #${item.product_id}`}</span>
                              <span className="text-xs text-gray-500">{item.qty} x {formatRupiah(item.price)}</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {formatRupiah(item.qty * item.price)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">Tidak ada detail produk.</p>
                      )}
                    </div>
                  </div>

                  {/* Ringkasan Biaya */}
                  <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sub Total</span>
                      <span>{formatRupiah(selectedTransaction.sub_total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Pajak</span>
                      <span>{formatRupiah(selectedTransaction.tax_total)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                      <span>Grand Total</span>
                      <span className="text-blue-600">{formatRupiah(selectedTransaction.grand_total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">Data tidak ditemukan.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
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