<?php

namespace App\Repositories;

use Carbon\Carbon;

interface DashboardRepositoryInterface
{
    public function getTotalProducts(): int;
    public function getProductsCountByRange(Carbon $start, Carbon $end): int;
    
    public function getTotalWarehouses(): int;
    public function getWarehousesCountByRange(Carbon $start, Carbon $end): int;
    
    public function getTotalMerchants(): int;
    public function getMerchantsCountByRange(Carbon $start, Carbon $end): int;
    
    public function getTransactionsCountByRange(Carbon $start, Carbon $end): int;
    
    public function getLatestWarehouseProducts(int $limit = 5);
    public function getLatestMerchantProducts(int $limit = 5);
    
    public function getDailyStockIn(Carbon $start, Carbon $end);
    public function getDailyStockOut(Carbon $start, Carbon $end);
}