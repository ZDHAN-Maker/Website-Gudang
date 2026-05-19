<?php

namespace App\Repositories;

use App\Models\Transaction;

class TransactionRepository
{
    public function getAll(array $filters = [], int $perPage = 10)
    {
        $query = Transaction::with(['merchant', 'transactionProducts']);

        // Filter transaksi berdasarkan merchant jika parameter dikirim
        if (isset($filters['merchant_id'])) {
            $query->where('merchant_id', $filters['merchant_id']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function getById(int $id)
    {
        return Transaction::with(['merchant', 'transactionProducts'])->findOrFail($id);
    }

    public function create(array $data)
    {
        return Transaction::create($data);
    }
}