<?php

namespace App\Services;

use App\Repositories\WarehouseRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class WarehouseService
{
    private WarehouseRepository $warehouseRepository;

    public function __construct(WarehouseRepository $warehouseRepository)
    {
        $this->warehouseRepository = $warehouseRepository;
    }

    public function getAll(array $fields)
    {
        return $this->warehouseRepository->getAll($fields);
    }

    public function getById(int $id, array $fields)
    {
        return $this->warehouseRepository->getById($id, $fields ?? ['*']);
    }

    public function create(array $data)
    {
        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $data['photo'] = $this->uploadPhoto($data['photo']);
        }

        return $this->warehouseRepository->create($data);
    }
    
    public function update(int $id, array $data)
    {
        $fields = ['id', 'photo'];
        $warehouse = $this->warehouseRepository->getById($id, $fields);

        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            // Menggunakan getRawOriginal agar mendapatkan path asli dari DB, bukan URL dari Aksesor
            if (!empty($warehouse->getRawOriginal('photo'))) {
                $this->deletePhoto($warehouse->getRawOriginal('photo'));
            }
            $data['photo'] = $this->uploadPhoto($data['photo']);
        }

        // PERBAIKAN: Lupa memanggil repository update dan return data
        return $this->warehouseRepository->update($id, $data);
    }

    public function delete(int $id)
    {
        $fields = ['id', 'photo'];
        $warehouse = $this->warehouseRepository->getById($id, $fields);

        if ($warehouse->getRawOriginal('photo')) {
            $this->deletePhoto($warehouse->getRawOriginal('photo'));
        }
        $this->warehouseRepository->delete($id);
    }

    public function attachProduct(int $warehouseId, int $productId, int $stock)
    {
        $warehouse = $this->warehouseRepository->getById($warehouseId, ['id']);
        $warehouse->products()->syncWithoutDetaching([
            $productId => ['stock' => $stock],
        ]);
    }

    public function detachProduct(int $warehouseId, int $productId)
    {
        $warehouse = $this->warehouseRepository->getById($warehouseId, ['id']);
        $warehouse->products()->detach($productId);
    }

    public function updateProductStock(int $warehouseId, int $productId, int $stock)
    {   
        $warehouse = $this->warehouseRepository->getById($warehouseId, ['id']);
        $warehouse->products()->updateExistingPivot($productId, [
            'stock' => $stock,
        ]);

        return $warehouse->products()->where('product_id', $productId)->first();
    }

    private function uploadPhoto(UploadedFile $photo)
    {
        return $photo->store('warehouses', 'public');
    }

    private function deletePhoto(string $photoPath)
    {
        if (Storage::disk('public')->exists($photoPath)) {
            Storage::disk('public')->delete($photoPath);
        }
    }
}