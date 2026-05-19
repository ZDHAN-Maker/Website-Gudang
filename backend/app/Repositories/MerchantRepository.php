<?php

namespace App\Repositories;

use App\Models\Merchant;

class MerchantRepository 
{
    public function getAll(array $fields = ['*'])
    {
        // Memastikan jika melakukan select parsial, foreign key tetap terbawa agar eager load tidak null
        if (!in_array('*', $fields) && !in_array('keeper_id', $fields)) {
            $fields[] = 'keeper_id';
        }

        return Merchant::select($fields)
            ->with(['keeper', 'products.category']) // Perbaikan typo relasi
            ->latest() // Perbaikan typo lates()
            ->paginate(10); // Perbaikan typo paginage()
    }

    public function getById(int $id, array $fields = ['*'])
    {
        if (!in_array('*', $fields) && !in_array('keeper_id', $fields)) {
            $fields[] = 'keeper_id';
        }

        return Merchant::select($fields)
            ->with(['keeper', 'products.category'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return Merchant::create($data);
    }

    public function update(int $id, array $data)
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->update($data);
        return $merchant;
    }

    public function delete(int $id)
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->delete();
    }

    public function getByKeeperId(int $keeperId, array $fields = ['*'])
    {
        return Merchant::select($fields)
            ->where('keeper_id', $keeperId) // Perbaikan huruf besar 'keeper_Id'
            ->with(['products.category'])
            ->firstOrFail();
    }
}