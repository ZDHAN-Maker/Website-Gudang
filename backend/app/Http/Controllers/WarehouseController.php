<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseRequest;
use App\Http\Resources\WarehouseResource;
use App\Services\WarehouseService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    private WarehouseService $warehouseService;

    public function __construct(WarehouseService $warehouseService)
    {
        $this->warehouseService = $warehouseService;
    }

    public function index()
    {
        // PERBAIKAN: Menghapus 'tagline' karena tidak ada di skema database Anda
        $fields = ['id', 'name', 'photo', 'phone', 'address']; 
        $warehouses = $this->warehouseService->getAll($fields);
        return response()->json(WarehouseResource::collection($warehouses)); 
    }

    public function show(int $id)
    {
        try {
            $fields = ['id', 'name', 'photo', 'phone', 'address'];
            $warehouse = $this->warehouseService->getById($id, $fields);
            return response()->json(new WarehouseResource($warehouse));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Warehouse not found',
            ], 404);
        }
    }

    public function store(WarehouseRequest $request)
    {
        $warehouse = $this->warehouseService->create($request->validated());
        return response()->json(new WarehouseResource($warehouse), 201);
    }

    public function update(WarehouseRequest $request, int $id)
    {
        try {
            $warehouse = $this->warehouseService->update($id, $request->validated());
            return response()->json(new WarehouseResource($warehouse));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Warehouse not found',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->warehouseService->delete($id);
            return response()->json([
                'message' => 'Warehouse deleted successfully' // PERBAIKAN: Typo successfully
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Warehouse not found',
            ], 404);
        }
    }
}