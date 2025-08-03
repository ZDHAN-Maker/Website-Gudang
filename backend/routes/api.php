<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MerchantController;
use App\Http\Controllers\MerchantProductController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\WarehouseProductController;


Route::post('/token-login', [AuthController::class, 'tokenLogin']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);       // List semua kategori
    Route::get('/categories/{id}', [CategoryController::class, 'show']);   // Tampilkan satu kategori
    Route::post('/categories', [CategoryController::class, 'store']);      // Buat kategori baru
    Route::put('/categories/{id}', [CategoryController::class, 'update']); // Update kategori
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']); // Hapus kategori
});


Route::middleware('auth:sanctum')->group(function () {
    // Standar REST API untuk merchant
    Route::get('/merchants', [MerchantController::class, 'index']);         // List semua merchant
    Route::get('/merchants/{id}', [MerchantController::class, 'show']);     // Detail merchant
    Route::post('/merchants', [MerchantController::class, 'store']);        // Buat merchant baru
    Route::put('/merchants/{id}', [MerchantController::class, 'update']);   // Perbarui merchant
    Route::delete('/merchants/{id}', [MerchantController::class, 'destroy']);// Hapus merchant

    // Endpoint profil merchant milik user saat ini
    Route::get('/my-merchant', [MerchantController::class, 'getMyMerchantProfile']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/merchants/{merchant}/products', [MerchantProductController::class, 'store']);
    Route::put('/merchants/{merchantId}/products/{productId}', [MerchantProductController::class, 'update']);
    Route::delete('/merchants/{merchant}/products/{product}', [MerchantProductController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->apiResource('warehouses', WarehouseController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/warehouses/{warehouseId}/products', [WarehouseProductController::class, 'attach']);
    Route::put('/warehouses/{warehouseId}/products/{productId}', [WarehouseProductController::class, 'update']);
    Route::delete('/warehouses/{warehouseId}/products/{productId}', [WarehouseProductController::class, 'detach']);
});