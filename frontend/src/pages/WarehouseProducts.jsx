import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function WarehouseProducts() {
    const { warehouseId } = useParams();
    const navigate = useNavigate();

    const [warehouse, setWarehouse] = useState(null);
    const [pivotProducts, setPivotProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Modal States
    const [showAttachModal, setShowAttachModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [currentProduct, setCurrentProduct] = useState(null);

    // Ambil data gudang beserta produk di dalamnya
    const fetchData = async () => {
        setLoading(true);
        try {
            // Mengasumsikan API detail gudang mengembalikan data produknya juga
            const res = await api.get(`/warehouses/${warehouseId}`);
            setWarehouse(res.data.data || res.data);
            setPivotProducts(res.data.data?.products || res.data?.products || []);
        } catch (err) {
            setError("Gagal memuat data produk gudang.");
        } finally {
            setLoading(false);
        }
    };

    // Ambil daftar semua master produk (untuk dropdown tambah produk)
    const fetchMasterProducts = async () => {
        try {
            const res = await api.get("/products");
            setAllProducts(res.data.data || res.data);
        } catch {
            setAllProducts([]);
        }
    };

    useEffect(() => {
        fetchData();
        fetchMasterProducts();
    }, [warehouseId]);

    // ATTACH PRODUCT (POST /warehouses/{id}/products)
    const handleAttach = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await api.post(`/warehouses/${warehouseId}/products`, {
                product_id: selectedProductId,
                stock: quantity, 
            });
            setShowAttachModal(false);
            setSelectedProductId("");
            setQuantity(0);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menambahkan produk ke gudang.");
        } finally {
            setSaving(false);
        }
    };

    // 2. UPDATE QUANTITY (PUT /warehouses/{id}/products/{productId})
    const handleUpdateStock = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await api.put(`/warehouses/${warehouseId}/products/${currentProduct.id}`, {
                stock: quantity,
            });
            setShowUpdateModal(false);
            setQuantity(0);
            setCurrentProduct(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengubah stok produk.");
        } finally {
            setSaving(false);
        }
    };

    // 3. DETACH PRODUCT (DELETE /warehouses/{id}/products/{productId})
    const handleDetach = async (productId) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini dari gudang?")) return;
        try {
            await api.delete(`/warehouses/${warehouseId}/products/${productId}`);
            fetchData();
        } catch {
            alert("Gagal menghapus produk dari gudang.");
        }
    };

    const openUpdateModal = (product) => {
        setCurrentProduct(product);
        setQuantity(product.pivot?.stock || 0); // Ambil data dari table pivot laravel
        setShowUpdateModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 relative">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
                <div>
                    <button
                        onClick={() => navigate("/dashboard/warehouses")}
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 mb-2"
                    >
                        ← Kembali ke Daftar Gudang
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        {warehouse ? `Stok: ${warehouse.name}` : "Kelola Stok Produk"}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {warehouse?.address || "Memuat detail lokasi..."}
                    </p>
                </div>
                <button
                    onClick={() => setShowAttachModal(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                    + Hubungkan Produk Baru
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative z-10">
                {loading ? (
                    <div className="p-16 text-center">
                        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Memuat data produk...</p>
                    </div>
                ) : pivotProducts.length === 0 ? (
                    <div className="p-16 text-center">
                        <p className="text-slate-400 font-medium">Belum ada produk terdaftar di gudang ini.</p>
                        <p className="text-slate-500 text-xs mt-1">Klik tombol di atas untuk memasukkan produk.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 text-left text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4">Nama Produk</th>
                                    <th className="px-6 py-4">SKU</th>
                                    <th className="px-6 py-4 text-center">Jumlah Stok</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {pivotProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">{p.name}</td>
                                        <td className="px-6 py-4 text-slate-400">{p.sku || "-"}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-slate-800 text-emerald-400 border border-slate-700 rounded-md font-mono font-semibold">
                                                {p.pivot?.stock || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => openUpdateModal(p)}
                                                className="text-xs bg-slate-800 hover:bg-blue-600/20 text-blue-400 border border-slate-700 hover:border-blue-500/30 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                Edit Stok
                                            </button>
                                            <button
                                                onClick={() => handleDetach(p.id)}
                                                className="text-xs bg-slate-800 hover:bg-red-600/20 text-red-400 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                Putus Hubungan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal 1: Attach Product */}
            {showAttachModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <h2 className="text-xl font-bold text-white mb-4">Hubungkan Produk ke Gudang</h2>
                        <form onSubmit={handleAttach} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Produk</label>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="">-- Pilih Produk --</option>
                                    {allProducts.map((prod) => (
                                        <option key={prod.id} value={prod.id}>{prod.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Kuantitas / Stok Awal</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAttachModal(false)}
                                    className="flex-1 py-2 bg-transparent border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Update Stock */}
            {showUpdateModal && currentProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <h2 className="text-xl font-bold text-white mb-1">Update Stok</h2>
                        <p className="text-xs text-slate-400 mb-4">Produk: {currentProduct.name}</p>
                        <form onSubmit={handleUpdateStock} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Jumlah Stok Sekarang</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowUpdateModal(false); setCurrentProduct(null); }}
                                    className="flex-1 py-2 bg-transparent border border-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {saving ? "Mengubah..." : "Update Stok"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}