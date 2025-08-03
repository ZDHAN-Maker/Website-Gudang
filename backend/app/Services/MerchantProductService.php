<?php

namespace App\Services;

use App\Models\Merchant;
use App\Repositories\MerchantProductRepository;
use App\Repositories\MerchantRepository;
use App\Repositories\WarehouseProductRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MerchantProductService
{

    private MerchantRepository $merchantRepository;
    private MerchantProductRepository $merchantProductRepository;
    private WarehouseProductRepository $warehouseProductRepository;

    public function __construct(
        MerchantRepository $merchantRepository,
        MerchantProductRepository $merchantProductRepository,
        WarehouseProductRepository $warehouseProductRepository
    ) {
        $this->merchantRepository = $merchantRepository;
        $this->merchantProductRepository = $merchantProductRepository;
        $this->warehouseProductRepository = $warehouseProductRepository;
    }

    public function assignProductToMerchant(array $data)
    {
        return DB::transaction(function () use ($data) {});

        if (!$warehouseProduct || $warehouseProduct->stock < $data['stock']) {
            throw ValidationException::withMessages([
                'stock' => ['Insufficient stock in Warehouse. ']
            ]);
        }

        $existingProduct = $this->$merchantProductRepository->getByMerchantAndProduct(
            $data['merchant_id'],
            $data['product_id']
        );

        if ($existingProduct) {
            throw ValidationException::withMessages([
                'product' => ['Product Allready exist in this merchant']
            ]);
        }

        //kurangi stoct product  tersebut pada warehouse terkait
        $this->warehouseProductRepository->updateStock(
            $data['warehouse_id'],
            $data['product_id'],
            $warehouseProduct->stock - $data['stock']
        );
    }

    //update berdasarkanjumlah stock yang ada di merchant
    public function updateStock(int $merchantId, int $productId, int $newStock, int $warehouseId)
    {
        return DB::transaction(function () use ($merchantId, $productId, $newStock, $warehouseId) {
            $existing = $this->merchantProductRepository->getByMerchantAndProduct($merchantId, $productId);
            if (!$existing) {
                throw ValidationException::withMessages([
                    'product_id' => 'Product not assigned to this merchant.'
                ]);
            }

            //cek idwarehouse apakah ada 
            if (!$warehouseId) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Warehouse id is required when increasing stock.'
                ]);
            }

            // stock produk yang ada di merchant dan lebih dari jumlah stok yang ada  
            $currentStock = $existing->stock;

            if ($newStock > $currentStock) {
                $diff = $newStock - $currentStock;

                $warehouseProduct = $this->warehouseProductRepository->getByWarehouseAndProduct($warehouseId, $productId);
                if (!$warehouseProduct || $warehouseProduct->stock < $diff) {
                    throw ValidationException::withMessages([
                        'stock' => ['Inssuficient Stock in Warehouse.']
                    ]);
                }

                $this->warehouseProductRepository->updateStock(
                    $warehouseId,
                    $productId,
                    $warehouseProduct->stock - $diff
                );
            }

            // stock produk yang ada di merchant dan kurang dari jumlah stok yang ada 
            if ($newStock < $currentStock) {
                $diff = $currentStock - $newStock;

                $warehouseProduct = $this->warehouseProductRepository->getByWarehouseAndProduct($warehouseId, $productId);
                if (!$warehouseProduct) {
                    throw ValidationException::withMessages([
                        'warehouse' => ['Product Not found in warehouse.']
                    ]);
                }
                $this->warehouseProductRepository->updateStock(
                    $warehouseId,
                    $productId,
                    $warehouseProduct->stock + $diff
                );
            }
        });
    }
    //menghapus product 
    public function removeProuctFromMerchant(int $merchantId, int $productId)
    {
        //$merchant = Merchant::fingOrFail($merchantId);
        $merchant = $this->merchantRepository->getById($merchantId, $fields ?? ['*']);
        if (!$merchant) {
            throw ValidationException::withMessages([
                'product_id' => 'Merchant Not Found.'
            ]);
        }

        $exists = $this->merchantProductRepository->getByMerchantAndProduct($merchantId, $productId);
        if (!$exists) {
            throw ValidationException::withMessages([
                'product_id' => 'Product not assigned to this merchant.'
            ]);
        }

        $merchant->products()->detach($productId);
    }
}
