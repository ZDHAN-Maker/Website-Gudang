<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseProductUpdateRequest;
use App\Models\Warehouse;
use App\Services\WarehouseService;
use Illuminate\Http\Request;

class WarehouseProductController extends Controller
{
    private WarehouseService $warehouseService;

    public function __construct(WarehouseService $warehouseService)
    {
        $this->warehouseService = $warehouseService;
    }

    public function attach(Request $request, int $warehouseId)
    {
        $request->validate([
            'product_id' => 'required|exists:products, id',
            'stock ' => 'required|integer|min:1',
        ]);

        $this->warehouseService->attachProduct(
            $warehouseId,
            $request->input('product_id'),
            $request->input('stock')
        ); 

        return response()->json(['message' => 'products Attached Seccesfully']);
    }

    public function detach(int $warehouseId, int $productId)
    {
        $this->warehouseService->detachProduct($warehouseId,$productId);
        return response()->json(['message' => 'Product Detach Succesfully']);
    }

    public function update(WarehouseProductUpdateRequest $request, int $warehouseId, int $productId)
    {
        $warehouseProduct =$this->warehouseService->updateProductStock(
            $warehouseId,
            $productId,
            $request->validate()['stock']
        );

        return response()->json([
            'message' => 'Stock Update Succesfully',
            'data' => $warehouseProduct,
        ]);
    }
}
