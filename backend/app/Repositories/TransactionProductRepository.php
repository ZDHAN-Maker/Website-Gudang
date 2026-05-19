<?php

namespace App\Repositories;

use App\Models\TransactionProduct;

class TransactionProductRepository
{
    // Mengambil semua item yang terjual (bisa difilter berdasarkan transaksi)
    public function getByTransactionId(int $transactionId)
    {
        return TransactionProduct::with('product')
            ->where('transaction_id', $transactionId)
            ->get();
    }

    // Bulk insert yang nantinya dipanggil oleh TransactionService utama
    public function createMany(array $items)
    {
        return TransactionProduct::insert($items);
    }
}