<?php

namespace App\Services;

use App\Repositories\Contracts\DashboardRepositoryInterface;
use Carbon\Carbon;

class DashboardService
{
    protected $repo;

    public function __construct(DashboardRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function getOverviewData(): array
    {
        // Definisikan waktu komparasi
        $now = Carbon::now();
        $startThisMonth = $now->copy()->startOfMonth();
        $endThisMonth = $now->copy()->endOfMonth();
        
        $startLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endLastMonth = $now->copy()->subMonth()->endOfMonth();

        // 1. Ambil Data Metrics Utama
        $totalProduk = $this->repo->getTotalProducts();
        $totalGudang = $this->repo->getTotalWarehouses();
        $totalMerchant = $this->repo->getTotalMerchants();
        $totalTransaksiBulanIni = $this->repo->getTransactionsCountByRange($startThisMonth, $endThisMonth);

        // 2. Hitung Perubahan (Changes) untuk Frontend
        $produkBulanLalu = $this->repo->getProductsCountByRange($startLastMonth, $endLastMonth);
        $gudangBulanLalu = $this->repo->getWarehousesCountByRange($startLastMonth, $endLastMonth);
        $merchantBulanLalu = $this->repo->getMerchantsCountByRange($startLastMonth, $endLastMonth);
        $transaksiBulanLalu = $this->repo->getTransactionsCountByRange($startLastMonth, $endLastMonth);

        // 3. Format Array Grafik Stok (7 Hari Terakhir)
        $sevenDaysAgo = Carbon::now()->subDays(6)->startOfDay();
        $today = Carbon::now()->endOfDay();
        
        $stockInDaily = $this->repo->getDailyStockIn($sevenDaysAgo, $today);
        $stockOutDaily = $this->repo->getDailyStockOut($sevenDaysAgo, $today);
        
        $grafikStok = [];
        for ($i = 6; $i >= 0; $i--) {
            $dateStr = Carbon::now()->subDays($i)->format('Y-m-d');
            $labelTanggal = Carbon::parse($dateStr)->translatedFormat('d M'); // Contoh: "21 Mei"
            
            $grafikStok[] = [
                'label Tanggal' => $labelTanggal, // Sesuai properti xAxis React Anda
                'masuk' => $stockInDaily->get($dateStr, 0),
                'keluar' => $stockOutDaily->get($dateStr, 0)
            ];
        }

        // 4. Ambil Recent Logs & Map sesuai properti objek Frontend
        $barangMasukRaw = $this->repo->getLatestWarehouseProducts(5);
        $barangMasuk = $barangMasukRaw->map(function ($item) {
            return [
                'produk' => $item->product->name ?? 'Produk Terhapus',
                'qty' => $item->stock,
                'gudang' => $item->warehouse->name ?? 'Gudang Utama'
            ];
        })->toArray();

        $barangKeluarRaw = $this->repo->getLatestMerchantProducts(5);
        $barangKeluar = $barangKeluarRaw->map(function ($item) {
            return [
                'produk' => $item->product->name ?? 'Produk Terhapus',
                'qty' => $item->stock,
                'merchant' => $item->merchant->name ?? 'Merchant Umum'
            ];
        })->toArray();

        return [
            'totalProduk' => $totalProduk,
            'totalGudang' => $totalGudang,
            'totalMerchant' => $totalMerchant,
            'totalTransaksi' => $totalTransaksiBulanIni,
            'changeProduk' => $this->calculatePercentageChange($totalProduk, $produkBulanLalu),
            'changeGudang' => $totalGudang === $gudangBulanLalu ? 'Stabil' : $this->calculatePercentageChange($totalGudang, $gudangBulanLalu),
            'changeMerchant' => $this->calculatePercentageChange($totalMerchant, $merchantBulanLalu),
            'changeTransaksi' => $this->calculatePercentageChange($totalTransaksiBulanIni, $transaksiBulanLalu),
            'grafikStok' => $grafikStok,
            'barangMasuk' => $barangMasuk,
            'barangKeluar' => $barangKeluar
        ];
    }

    private function calculatePercentageChange(int $current, int $past): string
    {
        if ($past === 0) {
            return $current > 0 ? '+100%' : '0%';
        }
        
        $change = (($current - $past) / $past) * 100;
        return ($change >= 0 ? '+' : '') . round($change, 1) . '%';
    }
}