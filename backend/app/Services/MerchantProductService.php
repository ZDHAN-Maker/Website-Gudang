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
    private WarehouseProductService $warehouseProductService;

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
            $existingProduct = $this->merchantProductRepository->getByMerchantAndProduct($data['merchant_id'], $data['product_id']);
            if ($existingProduct) {
                throw ValidationException::withMessages(['product_id' => ['Product already exists in this merchant.']]);
            }

            $this->warehouseProductService->deductStock($data['warehouse_id'], $data['product_id'], $data['stock']);

            return $this->merchantProductRepository->create([
                'merchant_id'  => $data['merchant_id'],
                'product_id'   => $data['product_id'],
                'warehouse_id' => $data['warehouse_id'], 
                'stock'        => $data['stock'],
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
                $this->warehouseProductService->deductStock($warehouseId, $productId, $diff);
            } elseif ($newStock < $currentStock) {
                $diff = $currentStock - $newStock;
                $this->warehouseProductService->addStock($warehouseId, $productId, $diff);
            }

            $existing->update(['stock' => $newStock]);
            return $existing;
        });
    }

    // TAMBAHAN: Method ini sebelumnya dipanggil di Controller tapi tidak ada di Service
    public function removeProductFromMerchant(int $merchantId, int $productId)
    {
        return DB::transaction(function () use ($merchantId, $productId) {
            $existing = $this->merchantProductRepository->getByMerchantAndProduct($merchantId, $productId);
            if (!$existing) {
                throw ValidationException::withMessages(['product_id' => ['Product not assigned to this merchant.']]);
            }

            // Kembalikan sisa stok merchant ke Gudang agar tidak hilang
            $this->warehouseProductService->addStock($existing->warehouse_id, $existing->product_id, $existing->stock);

            // Hapus data pivot
            return $this->merchantProductRepository->delete($existing);
        });
    }
}