<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    /**
     * Mengambil semua produk beserta data kategorinya (Paginated).
     */
    public function getAll(array $fields = ['*'], int $perPage = 10)
    {
        return Product::select($fields)
            ->with('category:id,name') // Eager loading untuk optimasi query
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Mengambil satu produk berdasarkan ID beserta relasinya.
     */
    public function getById(int $id, array $fields = ['*'])
    {
        return Product::select($fields)
            ->with(['category', 'merchant', 'warehouse'])
            ->findOrFail($id);
    }

    /**
     * Membuat produk baru beserta handle upload thumbnail.
     */
    public function create(array $data)
    {
        if (isset($data['thumbnail']) && $data['thumbnail']->isValid()) {
            $data['thumbnail'] = $data['thumbnail']->store('products', 'public');
        }

        return Product::create($data);
    }

    /**
     * Memperbarui data produk dan mengganti thumbnail lama jika ada upload baru.
     */
    public function update(int $id, array $data)
    {
        $product = Product::findOrFail($id);

        if (isset($data['thumbnail']) && $data['thumbnail']->isValid()) {
            // Hapus berkas thumbnail lama dari storage jika eksis
            if ($product->getRawOriginal('thumbnail')) {
                Storage::disk('public')->delete($product->getRawOriginal('thumbnail'));
            }
            $data['thumbnail'] = $data['thumbnail']->store('products', 'public');
        }

        $product->update($data);
        return $product;
    }

    /**
     * Menghapus produk (Soft Delete).
     */
    public function delete(int $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
    }

    /**
     * Mengambil informasi total stok gabungan gudang dan merchant.
     */
    public function getStockSummary(int $id)
    {
        $product = Product::with(['warehouse', 'merchant'])->findOrFail($id);

        $warehouseStock = $product->warehouse->sum('pivot.stock');
        $merchantStock = $product->merchant->sum('pivot.stock');

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'warehouse_stock' => $warehouseStock,
            'merchant_stock' => $merchantStock,
            'total_stock' => $warehouseStock + $merchantStock
        ];
    }
}
