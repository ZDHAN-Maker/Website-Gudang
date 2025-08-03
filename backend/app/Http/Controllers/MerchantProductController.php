<?php

namespace App\Http\Controllers;

use App\Http\Requests\MerchantProductRequest;
use App\Http\Requests\MerchantProductUpdateRequest;
use App\Services\MerchantProductService;
use Illuminate\Http\Request;

class MerchantProductController extends Controller
{
    //
    private MerchantProductService $merchantProductService;

    public function __construct(MerchantProductService $merchantProductService)
    {
        $this->merchantProductService = $merchantProductService;
    }

    public function store(MerchantProductRequest $request, int $merchant) {
        $validated = $request->validate();
        $validated['merchant_id'] =  $merchant;

        $merchantProduct = $this->merchantProductService->assignProductToMerchant($validated);
        return response()->json([
            'message' => 'Product Assign to merchant Succesfully',
            'data' => $merchantProduct,
        ],201);
    }

    public function update(MerchantProductUpdateRequest $request, int $merchantId, int $productId)
    {
        $validated = $request->validated();
        
        $merchantProduct = $this->merchantProductService->updateStock(
            $merchantId,
            $productId,
            $validated['stock_id'],
            $validated['warehouse_id'] 
        );

        return response()->json([
            'message' => 'Stock Update Succesfully. ',
            'date' => $merchantProduct,
        ]);
    }

    public function destroy(int $merchant, int $product)
    {
        $this->merchantProductService->removeProuctFromMerchant($merchant,$product);

        return response()->json([
            'message' => 'Merhcnat detach from merchant Successfully',
            
        ]);
    }
}
