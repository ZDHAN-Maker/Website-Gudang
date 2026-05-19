<?php

namespace App\Services;

use App\Repositories\MerchantProductRepository;
use App\Repositories\MerchantRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MerchantProductService
{
    private MerchantRepository $merchantRepository;
    private MerchantProductRepository $merchantProductRepository;
    private WarehouseProductService $warehouseProductService; // DIUBAH: Memanggil Service, bukan Repository Gudang

    public function __construct(
        MerchantRepository $merchantRepository,
        MerchantProductRepository $merchantProductRepository,
        WarehouseProductService $warehouseProductService 
    ) {
        $this->merchantRepository = $merchantRepository;
        $this->merchantProductRepository = $merchantProductRepository;
        $this->warehouseProductService = $warehouseProductService;
    }

    public function assignProductToMerchant(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Validasi merchant produk bawaan
            $existingProduct = $this->merchantProductRepository->getByMerchantAndProduct($data['merchant_id'], $data['product_id']);
            if ($existingProduct) {
                throw ValidationException::withMessages(['product' => ['Product already exists in this merchant.']]);
            }

            // 2. Serahkan urusan potong stok gudang ke Service Gudang (Lebih Bersih!)
            $this->warehouseProductService->deductStock($data['warehouse_id'], $data['product_id'], $data['stock']);

            // 3. Buat produk di merchant
            return $this->merchantProductRepository->create([
                'merchant_id' => $data['merchant_id'],
                'product_id'  => $data['product_id'],
                'stock'       => $data['stock'],
            ]);
        });
    }

    public function updateStock(int $merchantId, int $productId, int $newStock, int $warehouseId)
    {
        return DB::transaction(function () use ($merchantId, $productId, $newStock, $warehouseId) {
            $existing = $this->merchantProductRepository->getByMerchantAndProduct($merchantId, $productId);
            if (!$existing) {
                throw ValidationException::withMessages(['product_id' => ['Product not assigned to this merchant.']]);
            }

            $currentStock = $existing->stock;

            if ($newStock > $currentStock) {
                $diff = $newStock - $currentStock;
                // Ambil dari gudang
                $this->warehouseProductService->deductStock($warehouseId, $productId, $diff);
            } elseif ($newStock < $currentStock) {
                $diff = $currentStock - $newStock;
                // Kembalikan ke gudang
                $this->warehouseProductService->addStock($warehouseId, $productId, $diff);
            }

            $existing->update(['stock' => $newStock]);
            return $existing;
        });
    }
}