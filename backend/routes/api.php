<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MerchantController;
use App\Http\Controllers\MerchantProductController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransactionProductController;
use App\Http\Controllers\WarehouseProductController;


Route::post('/token-login', [AuthController::class, 'tokenLogin']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);       // List semua kategori
    Route::get('/categories/{id}', [CategoryController::class, 'show']);   // Tampilkan satu kategori
    Route::post('/categories', [CategoryController::class, 'store']);      // Buat kategori baru
    Route::put('/categories/{id}', [CategoryController::class, 'update']); // Update kategori
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']); // Hapus kategori
});

Route::middleware('auth:sanctum')->group(function () {

    // --- ROUTE GROUP: MERCHANT ---
    Route::get('/merchants', [MerchantController::class, 'index']);
    Route::post('/merchants', [MerchantController::class, 'store']);

    // Tempatkan route statis '/my-merchant' di atas rute dengan wildcard '{id}'
    Route::get('/my-merchant', [MerchantController::class, 'getMyMerchantProfile']);

    Route::get('/merchants/{id}', [MerchantController::class, 'show']);
    Route::put('/merchants/{id}', [MerchantController::class, 'update']);
    Route::delete('/merchants/{id}', [MerchantController::class, 'destroy']);

    // --- ROUTE GROUP: MERCHANT PRODUCTS ---
    // Parameter disamakan menjadi '{merchant}' dan '{product}' agar konsisten
    Route::post('/merchants/{merchant}/products', [MerchantProductController::class, 'store']);
    Route::put('/merchants/{merchant}/products/{product}', [MerchantProductController::class, 'update']);
    Route::delete('/merchants/{merchant}/products/{product}', [MerchantProductController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->apiResource('warehouses', WarehouseController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/warehouses/{warehouseId}/products', [WarehouseProductController::class, 'attach']);
    Route::put('/warehouses/{warehouseId}/products/{productId}', [WarehouseProductController::class, 'update']);
    Route::delete('/warehouses/{warehouseId}/products/{productId}', [WarehouseProductController::class, 'detach']);
});

Route::middleware('auth:sanctum')->group(function () {
    // Route untuk Products
    Route::get('/products/{id}/stock', [ProductController::class, 'stockSummary']);
    Route::apiResource('products', ProductController::class);
});

Route::middleware('auth:sanctum')->prefix('transactions')->group(function () {

    // URL: GET /api/transactions (Mengambil semua transaksi)
    Route::get('/', [TransactionController::class, 'index']);

    // URL: POST /api/transactions (Membuat transaksi baru)
    Route::post('/', [TransactionController::class, 'store']);

    // URL: GET /api/transactions/{id} (Melihat detail transaksi)
    Route::get('/{id}', [TransactionController::class, 'show']);

    // NESTED ROUTE: Detail produk di dalam transaksi terkait
    // URL: GET /api/transactions/{transactionId}/products
    Route::get('/{transactionId}/products', [TransactionProductController::class, 'index']);
});
