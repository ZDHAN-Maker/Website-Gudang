import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
import api from "../api/api"; 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Overview() {
  const { user, isAdmin } = useAuth();
  const userName = user?.name || "User";

  const [dashboardData, setDashboardData] = useState({
    totalProduk: 0,
    totalGudang: 0,
    totalMerchant: 0,
    totalTransaksi: 0,
    changeProduk: "0%",
    changeGudang: "Stabil",
    changeMerchant: "0%",
    changeTransaksi: "0%",
    grafikStok: [], 
    barangMasuk: [],
    barangKeluar: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/dashboard/overview");
      
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      const errorMessage = err.response?.data?.message || err.message || "Gagal memuat data dashboard";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, []);

  const stats = [
    { 
      label: "Total Produk", 
      value: dashboardData.totalProduk.toLocaleString("id-ID"), 
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>, 
      color: "blue", 
      change: dashboardData.changeProduk 
    },
    { 
      label: "Total Gudang (Warehouse)", 
      value: dashboardData.totalGudang.toLocaleString("id-ID"), 
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, 
      color: "emerald", 
      change: dashboardData.changeGudang 
    },
    { 
      label: "Total Merchant", 
      value: dashboardData.totalMerchant.toLocaleString("id-ID"), 
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>, 
      color: "violet", 
      change: dashboardData.changeMerchant 
    },
    { 
      label: "Total Transaksi (Bulan Ini)", 
      value: dashboardData.totalTransaksi.toLocaleString("id-ID"), 
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>, 
      color: "amber", 
      change: dashboardData.changeTransaksi 
    },
  ];

  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-950 min-h-screen flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        Menghubungkan & memuat data terbaru...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-950 min-h-screen flex items-center justify-center text-rose-400">
        <div className="text-center">
           <svg className="w-12 h-12 mx-auto mb-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
           <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Selamat Datang, <span className="text-blue-400">{userName}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin() ? "Anda login sebagai Admin — akses penuh tersedia." : "Anda login sebagai User — beberapa fitur terbatas."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-white">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${colorMap[s.color]}`}>
                {s.icon}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${s.change.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}`}>
                {s.change}
              </span>
              <span className="text-xs text-slate-600">dari bulan lalu</span>
            </div>
          </div>
        ))}
      </div>

      {/* GRAFIK TREN FLUKTUASI STOK */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="font-bold text-white text-base">Tren Fluktuasi Stok</h3>
          <p className="text-xs text-slate-500 mt-0.5">Perbandingan barang masuk (supply) dan barang keluar (distribusi)</p>
        </div>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardData.grafikStok} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="label Tanggal" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="masuk" name="Barang Masuk" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMasuk)" />
              <Area type="monotone" dataKey="keluar" name="Barang Keluar" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorKeluar)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Data Barang Masuk & Keluar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabel Barang Masuk */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7"/></svg>
              </div>
              <h3 className="font-bold text-white">Barang Masuk Terakhir</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 font-medium">Produk</th>
                  <th className="py-3 font-medium text-center">Qty</th>
                  <th className="py-3 font-medium">Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {dashboardData.barangMasuk.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-medium text-white">{item.produk}</td>
                    <td className="py-3 text-center text-emerald-400 font-semibold">+{item.qty}</td>
                    <td className="py-3 text-xs">{item.gudang}</td>
                  </tr>
                ))}
                {dashboardData.barangMasuk.length === 0 && (
                  <tr><td colSpan="3" className="py-4 text-center text-slate-500">Belum ada data barang masuk</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Barang Keluar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7"/></svg>
              </div>
              <h3 className="font-bold text-white">Barang Keluar Terakhir</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 font-medium">Produk</th>
                  <th className="py-3 font-medium text-center">Qty</th>
                  <th className="py-3 font-medium">Merchant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {dashboardData.barangKeluar.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-medium text-white">{item.produk}</td>
                    <td className="py-3 text-center text-rose-400 font-semibold">-{item.qty}</td>
                    <td className="py-3 text-xs">{item.merchant}</td>
                  </tr>
                ))}
                {dashboardData.barangKeluar.length === 0 && (
                  <tr><td colSpan="3" className="py-4 text-center text-slate-500">Belum ada data barang keluar</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}