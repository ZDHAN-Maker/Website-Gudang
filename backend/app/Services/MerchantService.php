<?php

namespace App\Services;

use App\Repositories\MerchantRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MerchantService
{
    private MerchantRepository $merchantRepository;

    public function __construct(MerchantRepository $merchantRepository)
    {
        $this->merchantRepository = $merchantRepository;
    }

    public function getAll(array $fields = ['*'])
    {
        return $this->merchantRepository->getAll($fields);
    }

    public function getById(int $id, array $fields = ['*'])
    {
        return $this->merchantRepository->getById($id, $fields);
    }

    public function create(array $data)
    {
        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $data['photo'] = $this->uploadPhoto($data['photo']);
        }

        return $this->merchantRepository->create($data);
    }

    public function delete(int $id)
    {
        $merchant = $this->merchantRepository->getById($id, ['id', 'photo']);

        // Menggunakan getRawOriginal() agar mendapatkan nama file asli dari DB, bukan URL dari Accessor
        $rawPhoto = $merchant->getRawOriginal('photo');
        if ($rawPhoto) {
            $this->deletePhoto($rawPhoto);
        }
        
        $this->merchantRepository->delete($id);
    }
    
    public function update(int $id, array $data)
    {
        $merchant = $this->merchantRepository->getById($id, ['id', 'photo']);

        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $rawPhoto = $merchant->getRawOriginal('photo');
            if (!empty($rawPhoto)) {
                $this->deletePhoto($rawPhoto);
            }
            $data['photo'] = $this->uploadPhoto($data['photo']);
        }

        // PERBAIKAN: Wajib memanggil repository agar data tersimpan di DB
        return $this->merchantRepository->update($id, $data);
    }

    public function getByKeeperId(int $keeperId)
    {
        return $this->merchantRepository->getByKeeperId($keeperId);
    }

    private function uploadPhoto(UploadedFile $photo)
    {
        return $photo->store('merchants', 'public');
    }

    private function deletePhoto(string $photoPath)
    {
        if (Storage::disk('public')->exists($photoPath)) {
            Storage::disk('public')->delete($photoPath);
        }
    }
}