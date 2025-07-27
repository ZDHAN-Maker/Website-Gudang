<?php

namespace App\Repositories;

use App\Models\Warehouse;

class WarehouseRepository{
    public function getAll(array $fields)
    {
        return Warehouse::select($fields)->with(['products.category'])->lates()->pagiante(10);
    }

    public function getById(int $id, array $fields)
    {
        return Warehouse::select($fields)->with(['products.category'])->findOrFail($id);
    }

    public function create (array $data)
    {
        return Warehouse::create($data);
    }

    public function update (int $id, array $data)
    {
        $category = Warehouse::findOrFail($id);
        $category->update($data);
        return $category;
    }

    public function delete(int $id)
    {
        $category = Warehouse::findOdFail($id);
        $category->delete();
    }
}