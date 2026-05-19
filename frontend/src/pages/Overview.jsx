import { useAuth } from "../context/AuthContext";

export default function Overview() {
  const { user, isAdmin } = useAuth();
  const userName = user?.name || "User";

  const stats = [
    { label: "Total Produk", value: "0", icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
    ), color: "blue", change: "+0%" },
    { label: "Total Gudang", value: "0", icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ), color: "emerald", change: "+0%" },
    { label: "Total Merchant", value: "0", icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
    ), color: "violet", change: "+0%" },
    { label: "Transaksi", value: "0", icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
    ), color: "amber", change: "+0%" },
  ];

  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Selamat Datang, <span className="text-blue-400">{userName}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin() ? "Anda login sebagai Admin — akses penuh tersedia." : "Anda login sebagai User — beberapa fitur terbatas."}
        </p>
      </div>

      {/* Stats */}
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
              <span className="text-xs text-emerald-400 font-medium">{s.change}</span>
              <span className="text-xs text-slate-600">dari bulan lalu</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upgrade card */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/></svg>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">Kelola Stok Lebih Mudah</h3>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">Lacak, distribusikan, dan kelola inventaris gudang Anda tanpa batas.</p>
            <button className="mt-5 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-xl transition-colors">
              Mulai Sekarang →
            </button>
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-white">Aktivitas Terbaru</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">Lihat Semua →</button>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <p className="text-slate-400 text-sm">Belum ada aktivitas terbaru</p>
            <p className="text-slate-600 text-xs mt-1">Aktivitas transaksi akan muncul di sini</p>
          </div>
        </div>
      </div>
    </div>
  );
}