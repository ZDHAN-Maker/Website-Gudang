<?php

namespace App\Http\Controllers;

use App\Http\Requests\MerchantProductRequest;
use App\Http\Requests\MerchantProductUpdateRequest;
use App\Services\MerchantProductService;

class MerchantProductController extends Controller
{
    private MerchantProductService $merchantProductService;

    public function __construct(MerchantProductService $merchantProductService)
    {
        $this->merchantProductService = $merchantProductService;
    }

    public function store(MerchantProductRequest $request, int $merchant) 
    {
        
        $validated = $request->validated();
        $validated['merchant_id'] = $merchant;

        $merchantProduct = $this->merchantProductService->assignProductToMerchant($validated);
        return response()->json([
            'message' => 'Product Assigned to merchant Successfully',
            'data'    => $merchantProduct,
        ], 201);
    }

    public function update(MerchantProductUpdateRequest $request, int $merchantId, int $productId)
    {
        $validated = $request->validated();
        
        $merchantProduct = $this->merchantProductService->updateStock(
            $merchantId,
            $productId,
            $validated['stock'], 
            $validated['warehouse_id'] 
        );

        return response()->json([
            'message' => 'Stock Updated Successfully.',
            'data'    => $merchantProduct, 
        ]);
    }

    public function destroy(int $merchant, int $product)
    {
        // PERBAIKAN: Penulisan nama method disesuaikan
        $this->merchantProductService->removeProductFromMerchant($merchant, $product);

        return response()->json([
            'message' => 'Product detached from merchant successfully', 
        ]);
    }
}