<?php

namespace App\Http\Controllers;

use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    private ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index()
    {
        $fields = ['id', 'name', 'thumbnail', 'price', 'category_id', 'is_popular'];
        $products = $this->productService->getAll($fields);
        
        return response()->json($products);
    }

    public function show(int $id)
    {
        try {
            $product = $this->productService->getById($id);
            return response()->json([
                'data' => $product
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        }
    }

    public function store(Request $request)
    {
        // Validasi manual (bisa dipindah ke Form Request / ProductRequest jika mau)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:products,name|max:255',
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'about' => 'required|string',
            'price' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'is_popular' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = $this->productService->create($validator->validated());
        return response()->json(['message' => 'Product created successfully', 'data' => $product], 201);
    }

    public function update(Request $request, int $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:products,name,' . $id,
                'thumbnail' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
                'about' => 'sometimes|required|string',
                'price' => 'sometimes|required|integer|min:0',
                'category_id' => 'sometimes|required|exists:categories,id',
                'is_popular' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $product = $this->productService->update($id, $validator->validated());
            return response()->json(['message' => 'Product updated successfully', 'data' => $product]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->productService->delete($id);
            return response()->json(['message' => 'Product deleted successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        }
    }

    /**
     * Endpoint tambahan untuk melihat rincian stok produk di gudang & merchant
     * Route: GET /api/products/{id}/stock
     */
    public function stockSummary(int $id)
    {
        try {
            $stockInfo = $this->productService->getStockSummary($id);
            return response()->json(['data' => $stockInfo]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        }
    }
}