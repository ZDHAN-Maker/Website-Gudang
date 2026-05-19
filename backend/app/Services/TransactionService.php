<?php

namespace App\Services;

use App\Repositories\TransactionRepository;
use Illuminate\Support\Facades\DB;
use Exception;

class TransactionService
{
    private TransactionRepository $transactionRepository;

    public function __construct(TransactionRepository $transactionRepository)
    {
        $this->transactionRepository = $transactionRepository;
    }

    public function getAll(array $filters = [])
    {
        return $this->transactionRepository->getAll($filters);
    }

    public function getById(int $id)
    {
        return $this->transactionRepository->getById($id);
    }

    public function createTransaction(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Generate Invoice Number Otomatis (Format: INV-TahunBulanTanggal-Random)
            $data['invoice_number'] = 'INV-' . date('Ymd') . '-' . strtoupper(uniqid());

            // 2. Simpan Data Transaksi Utama
            $transaction = $this->transactionRepository->create($data);

            /**
             * CATATAN UNTUKMU:
             * Jika nanti kamu sudah membuat logic untuk TransactionProduct,
             * kamu bisa melakukan looping array items dari $data untuk menginput detail produk,
             * sekaligus mengurangi stok dari merchant_products di dalam blok ini.
             * 
             * Contoh:
             * foreach($data['items'] as $item) {
             *     $transaction->transactionProducts()->create([...]);
             *     // Kurangi stok merchant_products...
             * }
             */

            return $transaction;
        });
    }
}