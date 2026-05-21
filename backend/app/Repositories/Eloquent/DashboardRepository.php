<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\WarehouseProduct;
use App\Models\MerchantProduct;
use App\Repositories\Contracts\DashboardRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardRepository implements DashboardRepositoryInterface
{
    public function getTotalProducts(): int
    {
        return Product::count();
    }

    public function getProductsCountByRange(Carbon $start, Carbon $end): int
    {
        return Product::whereBetween('created_at', [$start, $end])->count();
    }

    public function getTotalWarehouses(): int
    {
        return Warehouse::count();
    }

    public function getWarehousesCountByRange(Carbon $start, Carbon $end): int
    {
        return Warehouse::whereBetween('created_at', [$start, $end])->count();
    }

    public function getTotalMerchants(): int
    {
        return Merchant::count();
    }

    public function getMerchantsCountByRange(Carbon $start, Carbon $end): int
    {
        return Merchant::whereBetween('created_at', [$start, $end])->count();
    }

    public function getTransactionsCountByRange(Carbon $start, Carbon $end): int
    {
        return Transaction::whereBetween('created_at', [$start, $end])->count();
    }

    public function getLatestWarehouseProducts(int $limit = 5)
    {
        return WarehouseProduct::with(['product', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getLatestMerchantProducts(int $limit = 5)
    {
        // Catatan: Sesuai relasi model Product Anda, tabelnya bernama 'merchant_product'
        return MerchantProduct::with(['product', 'merchant'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getDailyStockIn(Carbon $start, Carbon $end)
    {
        return WarehouseProduct::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(stock) as total')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->get()
            ->pluck('total', 'date');
    }

    public function getDailyStockOut(Carbon $start, Carbon $end)
    {
        return MerchantProduct::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(stock) as total')
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->get()
            ->pluck('total', 'date');
    }
}