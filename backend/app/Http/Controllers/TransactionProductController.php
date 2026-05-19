<?php

namespace App\Http\Controllers;

use App\Services\TransactionProductService;

class TransactionProductController extends Controller
{
    private TransactionProductService $transactionProductService;

    public function __construct(TransactionProductService $transactionProductService)
    {
        $this->transactionProductService = $transactionProductService;
    }

    // Menampilkan produk apa saja yang ada di dalam transaksi tertentu
    public function index(int $transactionId)
    {
        $items = $this->transactionProductService->getItemsByTransaction($transactionId);

        return response()->json([
            'message' => 'Transaction items retrieved successfully',
            'data' => $items
        ]);
    }
}