<?php

namespace App\Http\Controllers;

use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    private TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['merchant_id']);
        $transactions = $this->transactionService->getAll($filters);

        return response()->json([
            'message' => 'Transactions retrieved successfully',
            'data' => $transactions
        ]);
    }

    public function show(int $id)
    {
        try {
            $transaction = $this->transactionService->getById($id);
            return response()->json([
                'message' => 'Transaction retrieved successfully',
                'data' => $transaction
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }
    }

    public function store(Request $request)
    {
        // Validasi dasar (Bisa kamu pindahkan ke FormRequest nanti)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'sub_total' => 'required|integer|min:0',
            'tax_total' => 'required|integer|min:0',
            'grand_total' => 'required|integer|min:0',
            'merchant_id' => 'required|exists:merchants,id',
            // 'items' => 'required|array', // Nanti tambahkan ini jika logic items sudah ada
        ]);

        try {
            $transaction = $this->transactionService->createTransaction($validated);

            return response()->json([
                'message' => 'Transaction created successfully',
                'data' => $transaction
            ], 201);
            
        } catch (\Exception $e) {
            // Log error untuk mempermudah debugging jika DB Transaction gagal
            Log::error('Transaction Error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to process transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}