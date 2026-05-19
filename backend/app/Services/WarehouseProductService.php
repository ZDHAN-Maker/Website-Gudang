<?php

namespace App\Services;

use App\Repositories\WarehouseProductRepository;
use Illuminate\Validation\ValidationException;

class WarehouseProductService
{
    private WarehouseProductRepository $warehouseProductRepository;

    public function __construct(WarehouseProductRepository $warehouseProductRepository)
    {
        $this->warehouseProductRepository = $warehouseProductRepository;
    }

    /**
     * Memastikan stok gudang cukup dan menguranginya.
     */
    public function deductStock(int $warehouseId, int $productId, int $quantity)
    {
        $warehouseProduct = $this->warehouseProductRepository->getByWarehouseAndProduct($warehouseId, $productId);

        if (!$warehouseProduct || $warehouseProduct->stock < $quantity) {
            throw ValidationException::withMessages([
                'stock' => ['Stok di Warehouse tidak mencukupi atau produk tidak ditemukan.']
            ]);
        }

        $newStock = $warehouseProduct->stock - $quantity;
        return $this->warehouseProductRepository->updateStock($warehouseId, $productId, $newStock);
    }

    /**
     * Mengembalikan atau menambahkan stok ke gudang.
     */
    public function addStock(int $warehouseId, int $productId, int $quantity)
    {
        $warehouseProduct = $this->warehouseProductRepository->getByWarehouseAndProduct($warehouseId, $productId);

        $currentStock = $warehouseProduct ? $warehouseProduct->stock : 0;
        $newStock = $currentStock + $quantity;

        return $this->warehouseProductRepository->updateStock($warehouseId, $productId, $newStock);
    }
}